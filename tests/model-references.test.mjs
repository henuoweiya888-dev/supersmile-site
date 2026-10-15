import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patchPage, renderReferences } from '../tools/build_model_reference_section.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const data = JSON.parse(read('data/model-references/custom-harness-01.json'));
const page = read('products/industrial-equipment-harness.html');
const section = page.match(/<!-- MODEL REFERENCES START -->([\s\S]*?)<!-- MODEL REFERENCES END -->/)[1];
const visible = section.replace(/<[^>]+>/g, ' ');

test('industrial pilot delivers contextual exact references in ordinary crawlable HTML', () => {
  assert.equal((section.match(/data-mr-entry\b/g) || []).length, 12);
  for (const item of [...data.products, ...data.materials]) {
    assert.ok(visible.includes(item.identifier), item.identifier);
    for (const alias of item.aliases) assert.ok(visible.includes(alias), alias);
    assert.ok(item.description.en.length > 30 && item.engineering_use.en.length > 30);
    assert.ok(section.includes(item.source_url.replace(/&/g, '&amp;')));
    assert.match(item.source_url, /^https:\/\/(?:www\.)?(?:phoenixcontact\.com|binder-connector\.com|turck\.(?:us|com\.mx)|hellermanntyton\.com)\//);
  }
  assert.doesNotMatch(section, /<(?:details|template)\b|hidden[^>]*data-mr-entry/);
  assert.match(section, /ID 12\.0 mm/);
  assert.doesNotMatch(page, /"@type"\s*:\s*"(?:Product|Offer|AggregateRating)"/);
  assert.match(page, /rel="canonical" href="https:\/\/supersmile-tech\.com\/products\/industrial-equipment-harness"/);
});

test('pilot enhancement survives the existing category renderer and rebuilds without duplication', () => {
  assert.ok(page.indexOf('<!-- MODEL REFERENCES START -->') > page.indexOf('pcc-rich-faq'));
  assert.ok(page.indexOf('<!-- MODEL REFERENCES END -->') < page.indexOf('<section class="pcc-closing">'));
  assert.equal(patchPage(page, data), page);
  assert.equal(renderReferences(data), page.match(/<!-- MODEL REFERENCES START -->[\s\S]*?<!-- MODEL REFERENCES END -->/)[0]);
  assert.equal((page.match(/id="model-references-script"/g) || []).length, 1);
  assert.equal((page.match(/class="pcc-gallery-item"/g) || []).length, 13);
});

test('only industrial pilot is enabled and every translatable new text has both languages', () => {
  const tagged = [...section.matchAll(/<([a-z0-9]+)[^>]*data-mr-en="([^"]+)"[^>]*data-mr-zh="([^"]+)"/g)];
  assert.ok(tagged.length > 50);
  for (const [, , en, zh] of tagged) assert.ok(en.trim() && zh.trim());
  const categoryPages = fs.readdirSync(path.join(root, 'products')).filter(name => name.endsWith('.html'));
  const enabled = categoryPages.filter(name => read('products/' + name).includes('id="model-references-script"'));
  assert.deepEqual(enabled, ['industrial-equipment-harness.html']);
  assert.match(read('sitemap.xml'), /industrial-equipment-harness<\/loc><lastmod>2026-10-15<\/lastmod>/);
});
