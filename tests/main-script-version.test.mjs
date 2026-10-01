import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = '20261001-seo1';

function sourceFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

test('all deployed pages and page generators request the same main.js revision', () => {
  let pageCount = 0;
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
    for (const found of versions) assert.equal(found, version, file);
    if (!file.endsWith('.html')) assert.equal(versions.length, 1, file);
  }
  assert.ok(pageCount >= 190, 'expected all existing pages that load main.js to be checked');
});
