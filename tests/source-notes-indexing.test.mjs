import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

test('source notes have a scoped noindex header without excluding product images or pages', () => {
  const headers = readFileSync(path.join(root, '_headers'), 'utf8');
  assert.match(headers, /^\/assets\/\*\.md\r?\n\s+X-Robots-Tag: noindex, follow$/m);
  const sourceRule = /^\/assets\/.*\.md$/;
  const assets = files(path.join(root, 'assets')).map(file => '/' + path.relative(root, file).split(path.sep).join('/'));
  const notes = assets.filter(file => file.endsWith('.md'));
  assert.ok(notes.length >= 95);
  for (const note of notes) assert.ok(sourceRule.test(note), note);
  for (const image of assets.filter(file => /\.(?:png|jpe?g|webp|svg)$/i.test(file))) assert.ok(!sourceRule.test(image), image);
  for (const route of ['/products/flame-retardant-cable', '/products/halogen-free-cable', '/contact', '/']) assert.ok(!sourceRule.test(route));
  for (const url of [
    'https://supersmile-tech.com/assets/images/product-categories/stock/flame-retardant-cable/SOURCES.md?lang=hi',
    'https://supersmile-tech.com/assets/images/product-categories/stock/halogen-free-cable/SOURCES.md?lang=en',
  ]) assert.ok(sourceRule.test(new URL(url).pathname));
});
