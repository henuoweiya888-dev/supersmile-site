import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { MAIN_SCRIPT_VERSION, LEGACY_CRAWL_MAIN_SCRIPT_VERSION, LEGACY_CRAWL_MAIN_SCRIPT_ROUTES, mainScriptVersionForRoute } from '../tools/seo_policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = '20261014-quality1';
const crawlVersion = '20261014-crawl1';
const crawlRoutes = new Set([
  "/automotive-diagnostic-cable-manufacturer",
  "/automotive-wiring-harness",
  "/custom-cable-assembly",
  "/custom-wiring-harness",
  "/ecu-programming-cable",
  "/ev-diagnostic-cable",
  "/j1939-cable",
  "/obd2-diagnostic-cable",
  "/turbo-actuator-harness"
]);

function sourceFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name.startsWith('.') ? [] : sourceFiles(fullPath);
    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

test('only the nine repaired landing routes use the crawl main.js revision', () => {
  assert.equal(MAIN_SCRIPT_VERSION, version);
  assert.equal(LEGACY_CRAWL_MAIN_SCRIPT_VERSION, crawlVersion);
  assert.deepEqual([...LEGACY_CRAWL_MAIN_SCRIPT_ROUTES].sort(), [...crawlRoutes].sort());
  let pageCount = 0;
  const revisedPages = new Set();
  const files = [
    ...sourceFiles(),
    path.join(root, 'tools/build_product_category_pages.mjs'),
    path.join(root, 'tools/build_wire_special_pages.rb'),
    path.join(root, 'tools/prepare_category_patch.mjs'),
  ];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const versions = [...content.matchAll(/main\.js\?v=([A-Za-z0-9-]+)/g)].map(match => match[1]);
    if (file.endsWith('.html') && versions.length) pageCount += 1;
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const route = relativePath === 'index.html' ? '/' : '/' + relativePath.replace(/\.html$/, '');
    const expected = file.endsWith('.html') && crawlRoutes.has(route) ? crawlVersion : version;
    for (const found of versions) {
      assert.equal(found, expected, file);
      if (found === crawlVersion) revisedPages.add(route);
    }
    if (file.endsWith('.html')) assert.equal(mainScriptVersionForRoute(route), expected, file);
    if (!file.endsWith('.html')) assert.equal(versions.length, 1, file);
  }
  assert.deepEqual([...revisedPages].sort(), [...crawlRoutes].sort(), 'exactly the nine repaired routes use the new token');
  assert.ok(pageCount >= 190, 'expected all existing pages that load main.js to be checked');
});
