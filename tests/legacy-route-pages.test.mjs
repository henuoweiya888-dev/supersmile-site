import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { legacyRouteInventory, captureLegacyRoute, buildLegacyRoutePage } from '../tools/build_legacy_route_pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const origin = 'https://supersmile-tech.com';
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('the 13 formerly rewritten routes serve independent content and a stable self canonical', async () => {
  const records = await legacyRouteInventory();
  assert.equal(records.length, 13);
  const titles = new Set();
  const bodies = new Set();
  const sitemap = await read('sitemap.xml');
  for (const record of records) {
    const html = await read(record.route.slice(1) + '.html');
    const { markup, copy } = await captureLegacyRoute(record);
    const main = html.match(/<main\b[^>]*>\s*([\s\S]*?)\s*<\/main>/)?.[1];
    assert.equal(main, markup, `${record.route}: stale route-specific source`);
    assert.equal((main.match(/<h1>/g) || []).length, 1, record.route);
    assert.match(main, /href="\/contact"/, `${record.route}: enquiry route missing`);
    assert.ok(!main.includes('hero-home'), `${record.route}: homepage body leaked`);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, record.route);
    assert.ok(html.includes(`rel="canonical" href="${origin}${record.route}"`), record.route);
    assert.ok(html.includes(`property="og:url" content="${origin}${record.route}"`), record.route);
    assert.doesNotMatch(html, /name="robots" content="[^\"]*noindex/, record.route);
    assert.ok(sitemap.includes(`<loc>${origin}${record.route}</loc>`), record.route);
    assert.ok(html.includes(`source_page=${encodeURIComponent(record.route)}`), record.route);
    const title = decode(html.match(/<title>(.*?)<\/title>/)[1]);
    assert.equal(title, copy.title + ' | Super Smile');
    titles.add(title); bodies.add(main);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const page = schema['@graph'].find(item => ['WebPage', 'CollectionPage'].includes(item['@type']));
    assert.equal(page.url, origin + record.route);
    const faqs = schema['@graph'].find(item => item['@type'] === 'FAQPage').mainEntity;
    assert.deepEqual(faqs.map(item => [item.name, item.acceptedAnswer.text]), JSON.parse(JSON.stringify(copy.faqs)));
    assert.equal(await buildLegacyRoutePage(record), html, `${record.route}: generator output differs`);
  }
  assert.equal(titles.size, 13);
  assert.equal(bodies.size, 13);
});

test('the existing Chinese renderers still replace every restored route body', async () => {
  for (const record of await legacyRouteInventory()) {
    const en = await captureLegacyRoute(record);
    const zh = await captureLegacyRoute(record, 'zh');
    assert.notEqual(en.copy.title, zh.copy.title, record.route);
    assert.match(zh.copy.title, /[\u4e00-\u9fff]/, record.route);
    assert.match(zh.markup, /href="\/contact"/, record.route);
    assert.ok(zh.markup.includes(`<h1>${zh.copy.title}</h1>`), record.route);
  }
});

test('all restored route links and image paths resolve to actual site files', async () => {
  for (const record of await legacyRouteInventory()) {
    const html = await read(record.route.slice(1) + '.html');
    for (const match of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
      const pathname = new URL(decode(match[1]), origin).pathname;
      const filename = pathname === '/' ? 'index.html' : pathname.slice(1);
      const candidates = [filename, filename + '.html'];
      const exists = await Promise.all(candidates.map(candidate => fs.access(path.join(root, candidate)).then(() => true, () => false)));
      assert.ok(exists.some(Boolean), `${record.route}: missing ${pathname}`);
    }
  }
});
