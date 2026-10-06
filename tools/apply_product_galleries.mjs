// Preserve each approved page and insert the shared gallery after its existing hero.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withProductGallery } from './product_gallery_markup.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capabilities = JSON.parse(await fs.readFile(path.join(root, 'data/product-capabilities.json'), 'utf8'));
const details = JSON.parse(await fs.readFile(path.join(root, 'data/product-category-details.json'), 'utf8'));
const slugify = value => String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let count = 0;
for (const group of capabilities.groups) {
  for (let index = 0; index < group.items.en.length; index++) {
    const key = `${group.id}-${String(index + 1).padStart(2, '0')}`;
    if (!details[key]?.page) continue;
    const filename = path.join(root, 'products', slugify(group.items.en[index]) + '.html');
    const html = await fs.readFile(filename, 'utf8');
    const updated = withProductGallery(html, key);
    if (html !== updated) await fs.writeFile(filename, updated);
    count++;
  }
}
console.log(`Attached category-specific product galleries to ${count} approved pages.`);
