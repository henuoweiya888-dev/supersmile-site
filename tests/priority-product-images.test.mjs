import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/images/products/web/manifest.json'), 'utf8'));
function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(full) : entry.name.endsWith('.html') ? [full] : [];
  });
}
function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 < bytes.length;) {
    const chunk = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (chunk === 'VP8 ') return [bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff];
    if (chunk === 'VP8X') return [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    offset += 8 + length + (length % 2);
  }
  throw Error('Unrecognized WebP image');
}

test('priority product photos retain originals and use smaller full-frame web derivatives', () => {
  assert.equal(manifest.length, 2);
  const data = fs.readFileSync(path.join(root, 'data/products.json'), 'utf8');
  const pages = htmlFiles(root).map(file => [file, fs.readFileSync(file, 'utf8')]);
  for (const image of manifest) {
    const original = fs.readFileSync(path.join(root, image.source));
    assert.equal(createHash('sha256').update(original).digest('hex'), image.sourceSha256, 'original photograph changed');
    const web = fs.readFileSync(path.join(root, image.output));
    assert.deepEqual(webpDimensions(web), [1600, 1600]);
    assert.equal(web.length, image.outputBytes);
    assert.ok(web.length < original.length * 0.1, image.output);
    assert.ok(data.includes(image.output), 'authoritative product data must use the derivative');
    assert.ok(!data.includes(image.source));
    for (const [file, html] of pages) assert.ok(!html.includes(image.source), `${file} still requests the full-resolution original`);
  }
});
