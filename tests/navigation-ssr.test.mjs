import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInContext } from 'node:vm';
import { createRenderContext, replaceDivContents } from '../tools/sync_priority_page_ssr.mjs';
import { captureProductDirectory } from '../tools/sync_navigation_ssr.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const anchors = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(match => [match[1], match[2].replace(/<[^>]*>/g, '').trim()]);

test('initial HTML exposes all core navigation links with the same labels as runtime', async () => {
  const { context } = await createRenderContext('/');
  const navigation = { innerHTML: '' };
  context.document.querySelector = selector => selector === '#nav-links' ? navigation : null;
  runInContext('renderProductMegaMenu = () => {}; renderNav();', context);
  const expected = anchors(navigation.innerHTML);
  assert.deepEqual(expected.map(([href]) => href), ['/', '/custom', '/products', '/about', '/contact']);
  let checked = 0;
  for (const directory of ['', 'products', 'product']) {
    for (const entry of await fs.readdir(path.join(root, directory), { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      const file = path.join(directory, entry.name);
      const html = await read(file);
      const nav = html.match(/<nav\b[^>]*\bid="nav-links"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      if (!html.includes('id="nav-links"')) continue;
      assert.ok(nav, `empty navigation: ${file}`);
      assert.deepEqual(anchors(nav), expected, file);
      assert.equal((html.match(/id="nav-links"/g) || []).length, 1, file);
      // The existing client still owns the language selector and mobile toggle.
      assert.match(html, /id="lang-box"/, file);
      assert.match(html, /id="nav-toggle"/, file);
      checked += 1;
    }
  }
  assert.ok(checked >= 190, `only ${checked} pages checked`);
});

test('product directory and guides exist before JavaScript and match the enhanced page', async () => {
  const html = await read('products.html');
  const markup = await captureProductDirectory();
  for (const [id, content] of Object.entries(markup)) {
    assert.ok(content.length > 100, id);
    assert.equal(replaceDivContents(html, id, content), html, `SSR diverged from runtime: ${id}`);
  }
  const directory = markup['pc-directory'];
  const links = anchors(directory);
  assert.equal(links.length, 99);
  assert.equal(new Set(links.map(([href]) => href)).size, 99);
  assert.equal((directory.match(/class="pc-group"/g) || []).length, 6);
  for (const [href, label] of links) {
    const destination = await read(href.slice(1) + '.html');
    assert.ok(label.length > 0, href);
    assert.ok(destination.includes(`rel="canonical" href="https://supersmile-tech.com${href}"`), href);
  }
  const chinese = await captureProductDirectory('zh');
  assert.deepEqual(anchors(chinese['pc-directory']).map(([href]) => href), links.map(([href]) => href));
  assert.match(chinese['pc-directory'], /工业设备线束/);
  assert.notEqual(chinese['pc-directory'], directory);
});
