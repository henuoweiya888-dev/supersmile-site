import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeoPolicy, withSeoPolicy } from './seo_policy.mjs';
import { captureLegacyRoute, legacyRouteInventory } from './legacy_route_content.mjs';
export { captureLegacyRoute, legacyRouteInventory } from './legacy_route_content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://supersmile-tech.com';
const read = name => fs.readFile(path.join(root, name), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

export async function buildLegacyRoutePage(record, policy) {
  const { markup, copy } = await captureLegacyRoute(record);
  const canonical = origin + record.route;
  const title = copy.title + ' | Super Smile';
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
    ...(record.kind === 'series' ? [{ '@type': 'ListItem', position: 2, name: 'Products', item: origin + '/products' }] : []),
  ];
  breadcrumbs.push({ '@type': 'ListItem', position: breadcrumbs.length + 1, name: copy.title, item: canonical });
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': record.kind === 'series' ? 'CollectionPage' : 'WebPage', name: copy.title, description: copy.intro, url: canonical },
    { '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    { '@type': 'FAQPage', mainEntity: copy.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ] };
  // Reuse the established header/footer, styles and language/contact scripts.
  let html = await read('custom-wiring-harness.html');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(copy.intro)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escape(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escape(copy.intro)}">`)
    .replace(/<meta name="keywords" content="[^"]*">\n?/, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${json(schema)}</script>`)
    .replace(/<body\b[^>]*>/, `<body class="site-redesign ${record.kind === 'series' ? 'page-product-series' : 'page-landing page-landing-custom'}">`)
    .replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main${record.kind === 'series' ? ' class="series-main"' : ' class="container" style="padding:36px 16px 56px"'}>\n${markup}\n</main>`)
    .replace(/source_page=%2Fcustom-wiring-harness/g, `source_page=${encodeURIComponent(record.route)}`);
  return withSeoPolicy(html, record.route, policy || await buildSeoPolicy());
}

export async function buildLegacyRoutePages({ lastmod = '2026-10-08' } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) throw Error('lastmod must be an explicit YYYY-MM-DD content revision date');
  const records = await legacyRouteInventory();
  let sitemap = await read('sitemap.xml');
  const additions = records.filter(record => !sitemap.includes(`<loc>${origin}${record.route}</loc>`))
    .map(record => `  <url><loc>${origin}${record.route}</loc><lastmod>${lastmod}</lastmod></url>`);
  if (additions.length) {
    sitemap = sitemap.replace('</urlset>', additions.join('\n') + '\n</urlset>');
    await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap);
  }
  const policy = await buildSeoPolicy();
  const results = [];
  for (const record of records) {
    const filename = record.route.slice(1) + '.html';
    const html = await buildLegacyRoutePage(record, policy);
    const before = await read(filename).catch(error => error.code === 'ENOENT' ? '' : Promise.reject(error));
    if (before !== html) await fs.writeFile(path.join(root, filename), html);
    results.push({ route: record.route, file: filename, changed: before !== html });
  }
  const routes = new Set(records.map(record => record.route));
  const redirects = (await read('_redirects')).split(/\r?\n/).filter(line => {
    const [source, destination, status] = line.trim().split(/\s+/);
    return !(routes.has(source) && destination === '/' && status === '200');
  });
  // Only retire the now-backed homepage rewrites; preserve unrelated rules.
  const remaining = redirects.filter(line => line.trim() && !line.startsWith('# Existing virtual pages') && !line.startsWith('# so unknown paths'));
  await fs.writeFile(path.join(root, '_redirects'), '# Product series and landing routes are standalone HTML pages.\n# Unknown paths must retain the top-level 404 response.\n' + remaining.filter(line => !line.startsWith('# Product series') && !line.startsWith('# Unknown paths')).join('\n') + (remaining.some(line => !line.startsWith('#')) ? '\n' : ''));
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await buildLegacyRoutePages({ lastmod: process.argv[2] || '2026-10-08' }), null, 2));
}
