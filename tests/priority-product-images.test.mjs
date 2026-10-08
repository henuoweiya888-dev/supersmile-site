import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import optimizer from '../tools/optimize_priority_product_images.cjs';

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
    for (const [file, html] of pages) {
      const imageRequests = html.match(/<(?:img|source|link)\b[^>]*>/gi) || [];
      assert.ok(!imageRequests.some(tag => tag.includes(image.source)), `${file} still requests the full-resolution original before a click`);
    }
  }
});

test('full-size product links survive optimization and repeated runs are idempotent', () => {
  const targetPages = ['product/holset-turbo-actuator-harness.html', 'product/turbo-actuator.html'];
  for (const [index, name] of targetPages.entries()) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    const image = manifest[index];
    const link = html.match(/<a\b[^>]*\bdata-original-src="[^"]+"[^>]*>/)?.[0];
    assert.ok(link?.includes(`href="${image.source}"`), name);
    assert.ok(link.includes('target="_blank"') && link.includes('rel="noopener"'), name);
    assert.ok(link.includes('style="display:block"'), name);
    assert.equal(optimizer.updateImageReferences(html, manifest, { html: true }), html, name);
    const unoptimized = html.replace(`src="${image.output}" alt=`, `src="${image.source}" alt=`);
    assert.equal(optimizer.updateImageReferences(unoptimized, manifest, { html: true }), html, 'initial conversion must preserve the full-size link');
  }
  const scripts = htmlFiles(root).filter(file => fs.readFileSync(file, 'utf8').includes('/assets/js/product-image-zoom.js'));
  assert.deepEqual(scripts.map(file => path.relative(root, file)).sort(), targetPages.sort());
});
