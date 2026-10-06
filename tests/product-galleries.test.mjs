import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { withProductGallery } from '../tools/product_gallery_markup.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'data/product-capabilities.json'), 'utf8'));
const details = JSON.parse(fs.readFileSync(path.join(root, 'data/product-category-details.json'), 'utf8'));
const galleries = JSON.parse(fs.readFileSync(path.join(root, 'data/product-photo-galleries.json'), 'utf8'));
const slugify = value => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categories = capabilities.groups.flatMap(group => group.items.en.map((name, index) => ({key:`${group.id}-${String(index + 1).padStart(2, '0')}`,name}))).filter(category => details[category.key]?.page);

function dimensions(filename) {
  const bytes = fs.readFileSync(filename);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', filename);
  for (let offset = 12; offset + 8 < bytes.length;) {
    const chunk = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (chunk === 'VP8 ') return [bytes.readUInt16LE(start + 6) & 0x3fff, bytes.readUInt16LE(start + 8) & 0x3fff];
    if (chunk === 'VP8X') return [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    offset += 8 + length + (length % 2);
  }
  throw new Error(`Unrecognized product photograph: ${filename}`);
}

test('every approved subcategory has at least ten distinct, named product photographs', () => {
  assert.equal(categories.length, 99);
  assert.deepEqual(Object.keys(galleries).sort(), categories.map(category => category.key).sort());
  for (const {key} of categories) {
    const photos = galleries[key].photos;
    assert.ok(photos.length >= 10, `${key}: ${photos.length} photographs`);
    assert.equal(new Set(photos.map(photo => photo.src)).size, photos.length, key);
    for (const photo of photos) {
      assert.ok(photo.nameEn && photo.nameZh, `${key}: missing display name`);
      assert.ok(!/[\u3400-\u9fff]/u.test(photo.nameEn), `${key}: untranslated caption`);
    }
  }
});

test('full photographs and loading thumbnails are actual square image files', () => {
  const checked = new Set();
  for (const gallery of Object.values(galleries)) {
    for (const photo of gallery.photos) {
      for (const [source, size] of [[photo.src,1200],[photo.thumbnail,600]]) {
        assert.ok(source.startsWith('/assets/images/product-galleries/'), source);
        if (checked.has(source)) continue;
        assert.deepEqual(dimensions(path.join(root, source)), [size,size], source);
        checked.add(source);
      }
    }
  }
});

test('each category renders its own gallery once, directly after the existing hero', () => {
  for (const {key,name} of categories) {
    const html = fs.readFileSync(path.join(root,'products',slugify(name)+'.html'),'utf8');
    assert.equal((html.match(/class="pcc-gallery"/g)||[]).length,1,key);
    assert.ok(html.includes(`data-gallery-category="${key}"`),key);
    assert.equal((html.match(/class="pcc-gallery-item"/g)||[]).length,galleries[key].photos.length,key);
    assert.ok(html.includes('</section>\n<!-- PRODUCT GALLERY START -->'),key);
    const stylesheets = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/g) || [];
    assert.ok(stylesheets.at(-1)?.includes('id="product-gallery-style"'),key);
    for (const photo of galleries[key].photos) assert.ok(html.includes(`data-full-image="${photo.src}"`),key);
  }
});

test('rebuilding a gallery is idempotent and cannot copy another category’s photographs', () => {
  for (const {key,name} of categories) {
    const html = fs.readFileSync(path.join(root,'products',slugify(name)+'.html'),'utf8');
    assert.equal(withProductGallery(html,key),html,key);
    const without = withProductGallery(html,'unassigned-category');
    assert.ok(!without.includes('class="pcc-gallery"'),key);
    assert.ok(!without.includes('product-gallery-script'),key);
    assert.ok(without.includes('<h1'),key);
  }
});
