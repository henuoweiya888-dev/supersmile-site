import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { buildSeoPolicy, businessContext, createRuntimePolicy, htmlPathForRoute, root, SEO_VERSION, serializeRuntime, sitemapRoutes, withSeoPolicy } from '../tools/seo_policy.mjs';

const policy = await buildSeoPolicy();
const runtime = createRuntimePolicy(policy);
const generated = await fs.readFile(path.join(root, 'assets/js/seo-policy.js'), 'utf8');

function mockDocument() {
  const elements = new Map();
  const add = (attribute, key, content) => {
    const element = { content, attributes: { [attribute]: key }, setAttribute(name, value) { this.attributes[name] = value; } };
    elements.set(`meta[${attribute}="${key}"]`, element);
    return element;
  };
  add('name', 'description', 'Existing topic description');
  add('property', 'og:title', 'Existing title');
  add('property', 'og:description', 'Existing topic description');
  add('name', 'robots', 'index, follow');
  const canonical = { href: 'https://supersmile-tech.com/products/molex-compatible' };
  const document = {
    title: 'Existing title', documentElement: { lang: 'fr', dir: 'ltr' },
    querySelector(selector) { return selector === 'link[rel="canonical"]' ? canonical : (elements.get(selector) || null); },
    createElement() { return { content: '', attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } }; },
    head: { appendChild(element) { const [attribute, key] = Object.entries(element.attributes)[0]; elements.set(`meta[${attribute}="${key}"]`, element); } }
  };
  return { document, elements, canonical };
}

test('public sitemap has unique topic-first metadata covering the requested business meanings', async () => {
  const xml = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
  assert.deepEqual(policy.pages.map(page => page.route), sitemapRoutes(xml));
  assert.equal(policy.pages.length, 190);
  assert.deepEqual(policy.pages.reduce((counts, page) => ({ ...counts, [page.kind]: (counts[page.kind] || 0) + 1 }), {}), { core: 9, product: 82, category: 99 });
  for (const lang of ['en', 'zh']) {
    assert.equal(new Set(policy.pages.map(page => page.title[lang])).size, 190);
    assert.equal(new Set(policy.pages.map(page => page.description[lang])).size, 190);
  }
  for (const page of policy.pages) {
    assert.ok(page.title.en.length <= 80, page.route);
    assert.match(page.description.en, /custom wire harness manufacturing/i, page.route);
    assert.match(page.description.en, /China factory/, page.route);
    assert.match(page.description.en, /OEM\/ODM/, page.route);
    assert.match(page.description.zh, /中国工厂.*定制线束制造.*OEM\/ODM/, page.route);
    if (page.kind !== 'core') {
      assert.ok(page.description.en.startsWith(page.topic.en + ':'), page.route);
      assert.ok(page.description.zh.startsWith(page.topic.zh + '：'), page.route);
    }
    assert.doesNotMatch(page.description.en, /certified|authorized|guaranteed|MOQ|IATF|ISO\s*\d/i, page.route);
  }
  assert.match(runtime.resolve({ path: '/products/molex-compatible' }).title, /^Molex-Compatible.*Manufacturer/);
  assert.match(runtime.resolve({ path: '/products/equipment-wire' }).title, /^Equipment Wire.*Manufacturing/);
  assert.match(runtime.resolve({ path: '/custom-wiring-harness' }).title, /^Custom Wiring Harness Manufacturer/);
});

test('allowlist excludes 404 pages, historical redirects and foreign URLs', async () => {
  const redirects = await fs.readFile(path.join(root, '_redirects'), 'utf8');
  const aliases = redirects.split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.split(/\s+/)[0]);
  for (const route of [...aliases, '/404', '/404.html', '/products/unknown-category', '/product/unknown-product', 'https://example.com/products/molex-compatible']) {
    assert.equal(runtime.resolve({ path: route, lang: 'zh' }), null, route);
  }
  assert.equal(runtime.resolve({ path: '/products/molex-compatible.html?lang=zh#chapter', lang: 'zh' }).route, '/products/molex-compatible');
  assert.equal(runtime.resolve({ path: 'https://supersmile-tech.com/contact?products=p081', lang: 'en' }).route, '/contact');
  assert.equal(runtime.resolve({ path: '/index.html' }).route, '/');
});

test('generated synchronous browser module updates the final metadata without changing canonical or language', () => {
  assert.equal(generated, serializeRuntime(policy), 'rebuild with --build when the public topic data changes');
  const { document, elements, canonical } = mockDocument();
  const context = { window: {}, document, location: { pathname: '/products/molex-compatible' }, URL };
  runInNewContext(generated, context);
  assert.ok(context.window.SS_SEO_POLICY);
  const result = context.window.SS_SEO_POLICY.apply({ path: '/products/molex-compatible', LANG: 'zh', title: 'old', description: 'old' });
  assert.equal(result.lang, 'zh');
  assert.match(document.title, /^Molex 兼容线束制造/);
  assert.equal(elements.get('meta[property="og:title"]').content, document.title);
  assert.equal(elements.get('meta[property="og:description"]').content, elements.get('meta[name="description"]').content);
  assert.equal(canonical.href, 'https://supersmile-tech.com/products/molex-compatible');
  assert.equal(elements.get('meta[name="robots"]').content, 'index, follow');
  assert.deepEqual(document.documentElement, { lang: 'fr', dir: 'ltr' });
  elements.delete('meta[property="og:description"]');
  context.window.SS_SEO_POLICY.apply({ path: '/products/molex-compatible', LANG: 'en' });
  assert.ok(elements.has('meta[property="og:description"]'), 'missing OG metadata is created');
  assert.match(document.title, /^Molex-Compatible/);
});

test('all eighteen other languages preserve their existing topic and append only localized context', () => {
  for (const lang of Object.keys(businessContext).filter(code => !['en', 'zh'].includes(code))) {
    const title = `Topic in ${lang} | Brand`;
    const description = `Existing translated description (${lang}).`;
    const result = runtime.resolve({ path: '/products/equipment-wire', LANG: lang, title, description });
    assert.equal(result.title, title, lang);
    assert.equal(result.description, `${description} ${businessContext[lang]}`, lang);
    assert.doesNotMatch(result.description, /Custom wire harness manufacturing from our China factory/, lang);
    assert.equal(runtime.resolve({ path: '/products/equipment-wire', lang, title, description: result.description }).description, result.description, `${lang} repeated render`);
    assert.equal(runtime.resolve({ path: '/products/equipment-wire', lang }), null, `${lang} requires an existing translation`);
  }
  assert.equal(runtime.resolve({ path: '/contact', lang: 'xx', title: 'Old title', description: 'Old description' }), null);
  const de = runtime.resolve({ path: '/contact', lang: 'de', title: 'Kontakt', description: `Kontaktbeschreibung. ${businessContext.fr}` });
  assert.equal(de.description, `Kontaktbeschreibung. ${businessContext.de}`);
});

test('all 190 static transforms preserve content, canonicals, links and schema and load policy before main', async () => {
  const stripManaged = html => html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b(?=[^>]*(?:name=["']description["']|property=["']og:(?:title|description)["']))[^>]*>/gi, '')
    .replace(/<script\b[^>]*\bsrc=["']\/assets\/js\/seo-policy\.js[^"']*["'][^>]*>\s*<\/script>\s*/gi, '')
    .replace(/(\/assets\/js\/main\.js)(?:\?[^"']*)?/gi, '$1?VERSION')
    .replace(/>\s+</g, '><');
  for (const page of policy.pages) {
    const html = await fs.readFile(path.join(root, htmlPathForRoute(page.route)), 'utf8');
    const result = withSeoPolicy(html, page.route, policy);
    assert.equal(stripManaged(result), stripManaged(html), page.route);
    assert.equal(withSeoPolicy(result, page.route, policy), result, `${page.route} idempotence`);
    assert.equal((result.match(/src="\/assets\/js\/seo-policy\.js/g) || []).length, 1, page.route);
    assert.ok(result.indexOf('/assets/js/seo-policy.js') < result.indexOf('/assets/js/main.js'), page.route);
    assert.ok(result.includes(`/assets/js/main.js?v=${SEO_VERSION}`), page.route);
    const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0];
    if (main) assert.ok(result.includes(main), `${page.route} original main body`);
  }
  const untouched = '<html><head><title>Not Found</title><meta name="robots" content="noindex"></head><body>404</body></html>';
  assert.equal(withSeoPolicy(untouched, '/404', policy), untouched);
  assert.equal(withSeoPolicy(untouched, '/ev-diagnostic-cable', policy), untouched);
});
