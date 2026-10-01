import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => readFileSync(path.join(root, relativePath), 'utf8');

function htmlFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(fullPath);
    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

test('HTML pages and category generators do not advertise query-language alternates', () => {
  const pages = htmlFiles();
  assert.ok(pages.length >= 104);
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /<link\b[^>]*\bhreflang=/i, file);
    assert.doesNotMatch(html, /<link\b[^>]*\brel="canonical"[^>]*[?&]lang=/i, file);
  }
  for (const generator of ['tools/build_product_category_pages.mjs', 'tools/build_wire_special_pages.rb']) {
    assert.doesNotMatch(read(generator), /hreflang|\?lang=/, generator);
  }
});

test('ordinary links stay clean while language switch retains inquiry parameters', () => {
  const script = read('assets/js/main.js');
  assert.doesNotMatch(script, /routeWithLang|localizeInternalLinks/);
  assert.match(script, /btn\.href='\/contact\?products='\+encodeURIComponent\(pid\)/);
  assert.match(script, /q\.get\('lang'\) \|\| localStorage\.getItem\('lang'\)/);
  assert.match(script, /localStorage\.setItem\('lang', LANG\)/);

  const functionSource = script.match(/function syncLanguageUrl\(\)\{[\s\S]*?\n\}/)?.[0];
  assert.ok(functionSource, 'explicit language switch must remain available');
  let replacedPath = '';
  const context = {
    URL,
    location: { href: 'https://supersmile-tech.com/contact?category=automotive-14&products=p-038#form' },
    history: { state: { test: true }, replaceState: (_state, _title, pathValue) => { replacedPath = pathValue; } },
  };
  runInNewContext(`const LANG='zh'; ${functionSource}; syncLanguageUrl();`, context);
  const result = new URL(replacedPath, 'https://supersmile-tech.com');
  assert.equal(result.pathname, '/contact');
  assert.equal(result.searchParams.get('lang'), 'zh');
  assert.equal(result.searchParams.get('category'), 'automotive-14');
  assert.equal(result.searchParams.get('products'), 'p-038');
  assert.equal(result.hash, '#form');
});
