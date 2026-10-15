import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patchPage, renderReferences, renderInquiry, pdfLink, validateReferenceData } from '../tools/build_model_reference_section.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const data = JSON.parse(read('data/model-references/custom-harness-01.json'));
const page = patchPage(read('products/industrial-equipment-harness.html'), data);
const section = page.match(/<!-- MODEL REFERENCES START -->([\s\S]*?)<!-- MODEL REFERENCES END -->/)[1];
const visible = section.replace(/<[^>]+>/g, ' ');

test('industrial category delivers at least 200 finished models and 200 material parts in ordinary HTML', () => {
  assert.ok(data.products.length >= 200);
  assert.ok(data.materials.length >= 200);
  const count = data.products.length + data.materials.length;
  assert.equal((section.match(/data-mr-entry\b/g) || []).length, count);
  const identifiers = new Set();
  for (const item of [...data.products, ...data.materials]) {
    const key = item.brand.toLowerCase() + '|' + item.identifier.replace(/[\s-]+/g, '').toLowerCase();
    assert.ok(!identifiers.has(key), `duplicate manufacturer article: ${key}`);
    identifiers.add(key);
    assert.ok(visible.includes(item.identifier), item.identifier);
    for (const alias of item.aliases) assert.ok(visible.includes(alias), alias);
    assert.ok(item.description.en.length > 5 && item.description.en.length < 130);
    assert.equal(item.engineering_use, undefined);
  }
  assert.doesNotMatch(section, /<(?:details|template)\b|hidden[^>]*data-mr-entry/);
  assert.doesNotMatch(page, /"@type"\s*:\s*"(?:Product|Offer|AggregateRating)"/);
  assert.match(page, /rel="canonical" href="https:\/\/supersmile-tech\.com\/products\/industrial-equipment-harness"/);
});

test('compact entries have the approved service sentence and only PDF external links', () => {
  const count = data.products.length + data.materials.length;
  assert.equal(data.service_label.zh, '可制作兼容替代件、自有原厂采购渠道');
  assert.equal((section.match(/class="mr-service"/g) || []).length, count);
  const allowedPdfs = new Set([...data.products, ...data.materials].map(pdfLink).filter(Boolean));
  for (const link of section.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const url = link[1].replace(/&amp;/g, '&');
    if (/^https?:/.test(url)) assert.ok(allowedPdfs.has(url), url);
  }
  assert.doesNotMatch(section, /class="mr-use"|Manufacturer specifications|原厂规格依据/);
  assert.equal(pdfLink({source_url:'https://example.com/products/123?file=datasheet.pdf'}), null);
  assert.equal(pdfLink({pdf_url:'https://example.com/datasheet.html?type=pdf'}), null);
  assert.equal(pdfLink({pdf_url:'https://example.com/datasheet.html?type=pdf',pdf_verified:true}), 'https://example.com/datasheet.html?type=pdf');
  assert.equal(pdfLink({source_url:'javascript:alert(1).pdf'}), null);
  assert.equal(pdfLink({pdf_url:'https://example.com/datasheet.pdf#page=3'}), 'https://example.com/datasheet.pdf#page=3');
  assert.equal((section.match(/class="mr-pagination"[^>]*hidden/g) || []).length, 2);
  assert.equal((section.match(/data-mr-page="next"/g) || []).length, 2);
});

test('pilot enhancement survives the existing category renderer and rebuilds without duplication', () => {
  assert.ok(page.indexOf('<!-- MODEL REFERENCES START -->') > page.indexOf('pcc-rich-faq'));
  assert.ok(page.indexOf('<!-- MODEL REFERENCES END -->') < page.indexOf('</main>'));
  assert.ok(page.indexOf('</main>') < page.indexOf('data-unified-inquiry'));
  assert.doesNotMatch(page, /class="pcc-closing"|class="mr-cta"/);
  assert.equal(patchPage(page, data), page);
  assert.equal(renderReferences(data), page.match(/<!-- MODEL REFERENCES START -->[\s\S]*?<!-- MODEL REFERENCES END -->/)[0]);
  assert.equal((page.match(/id="model-references-script"/g) || []).length, 1);
  assert.equal((page.match(/class="pcc-gallery-item"/g) || []).length, 13);
  assert.equal(page.match(/<!-- MANUFACTURING CONTEXT START -->\n([\s\S]*?)\n<!-- MANUFACTURING CONTEXT END -->/)[1], renderInquiry(data));
});

test('pilot has one bottom inquiry with an optional part number and a real top anchor', () => {
  assert.equal((page.match(/id="category-inquiry-form"/g)||[]).length, 1);
  assert.equal((page.match(/class="mc-quote"/g)||[]).length, 1);
  assert.match(page, /<form[^>]*id="category-inquiry-form"[^>]*action="\/contact"[^>]*method="get"/);
  assert.match(page, /id="ci-use-part"[^>]*aria-controls="ci-part-field"/);
  assert.match(page, /id="ci-part-number"[^>]*maxlength="500"[^>]*disabled/);
  assert.match(page, /class="mr-to-top"[^>]*href="#page-top"/);
  assert.match(page, /<body id="page-top"/);
  assert.match(page, /data-unified-inquiry/);
});

test('only validated complete categories are enabled and every new text has both languages', () => {
  const tagged = [...section.matchAll(/<([a-z0-9]+)[^>]*data-mr-en="([^"]+)"[^>]*data-mr-zh="([^"]+)"/g)];
  assert.ok(tagged.length > 50);
  for (const [, , en, zh] of tagged) assert.ok(en.trim() && zh.trim());
  const categoryPages = fs.readdirSync(path.join(root, 'products')).filter(name => name.endsWith('.html'));
  const enabled = categoryPages.filter(name => read('products/' + name).includes('id="model-references-script"'));
  const approved = fs.readdirSync(path.join(root, 'data/model-references')).filter(name => name.endsWith('.json')).flatMap(name => {
    const data = JSON.parse(read('data/model-references/' + name));
    try { validateReferenceData(data); return [data.route.split('/').pop() + '.html']; } catch { return []; }
  });
  for (const name of enabled) assert.ok(approved.includes(name), `unvalidated category enabled: ${name}`);
  assert.ok(enabled.includes('industrial-equipment-harness.html'));
  assert.match(read('sitemap.xml'), /industrial-equipment-harness<\/loc><lastmod>2026-10-15<\/lastmod>/);
});
