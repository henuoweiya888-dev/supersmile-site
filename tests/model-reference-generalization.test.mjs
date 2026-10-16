import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { patchPage, renderReferences, renderInquiry, validateReferenceData, referenceDataForCategory } from '../tools/build_model_reference_section.mjs';
import { withPageSeo } from '../tools/page_seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const pilot = JSON.parse(read('data/model-references/custom-harness-01.json'));
const capabilities = JSON.parse(read('data/product-capabilities.json'));
const slugify = value => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categories = capabilities.groups.flatMap(group => group.items.en.map((name, index) => ({
  category_id: `${group.id}-${String(index + 1).padStart(2, '0')}`,
  route: `/products/${slugify(name)}`,
  category_name: { en: name, zh: group.items.zh[index] }
})));
// In-memory fixtures test presentation mechanics; they are never written as researched category data.
const fixture = (category = categories[1]) => ({ ...structuredClone(pilot), ...structuredClone(category), validated: true });
const contextScope = { URLSearchParams };
runInNewContext(read('assets/js/manufacturing-context.js'), contextScope);
const context = contextScope.SS_MANUFACTURING_CONTEXT;

test('publication gate rejects incomplete, unreviewed, misrouted and duplicate references', () => {
  const valid = fixture();
  const original = read(valid.route.slice(1) + '.html');
  assert.equal(validateReferenceData(valid).category_id, valid.category_id);
  for (const mutate of [
    data => { delete data.validated; },
    data => { data.validated = false; },
    data => { data.category_name.zh = ''; },
    data => { delete data.category_name; },
    data => { data.route = '/products/not-an-existing-category'; },
    data => { data.category_id = 'made-up-01'; },
    data => { data.products = data.products.slice(0, 199); },
    data => { data.materials = data.materials.slice(0, 199); },
    data => { data.products[1] = structuredClone(data.products[0]); },
    data => { data.materials[0] = structuredClone(data.products[0]); },
    data => { data.groups.reverse(); },
    data => { data.intro.zh = ''; },
    data => { data.materials[0].description.en = ''; },
    data => { data.service_label.zh = 'Different service claim'; }
  ]) {
    const data = fixture();
    mutate(data);
    assert.throws(() => validateReferenceData(data));
    assert.throws(() => patchPage(original, data));
  }
  const aliases = fixture();
  aliases.products = aliases.products.slice(0, 199);
  aliases.products[0].aliases = Array.from({ length: 500 }, (_, index) => `alias-${index}`);
  assert.throws(() => validateReferenceData(aliases), /200/);
});

test('the published legacy pilot remains accepted but cannot bypass an explicit rejection', () => {
  assert.equal(validateReferenceData(pilot).validated, true);
  assert.equal(validateReferenceData(pilot).category_name.zh, '工业设备线束');
  assert.throws(() => validateReferenceData({ ...pilot, validated: false }), /validated/);
  assert.ok(referenceDataForCategory('custom-harness-01', pilot.route)?.products.length >= 200);
  assert.equal(referenceDataForCategory('custom-harness-01', '/products/control-panel-harness'), null);
  assert.equal(referenceDataForCategory('not-an-existing-category', '/products/not-an-existing-category'), null);
});

test('audited quantity exceptions allow precise narrow ranges and material-only sections', () => {
  const data = fixture();
  data.products = [];
  data.materials = data.materials.slice(0, 12);
  data.quantity_exception = {
    approved: true,
    kind: 'material_scope',
    reason: { en: 'The audited scope consists of cable materials, without a separate finished assembly model.', zh: '审核范围为电缆材料，没有独立的已端接成品型号。' },
    audit_id: 'test-fixture-material-scope-audit',
    verified_counts: { products: 0, materials: 12 }
  };
  assert.equal(validateReferenceData(data).validated, true);
  const rendered = renderReferences(data);
  assert.equal((rendered.match(/class="mr-group"/g) || []).length, 1);
  assert.equal((rendered.match(/class="mr-pagination"/g) || []).length, 1);
  assert.doesNotMatch(rendered, /id="mr-products-title"|id="mr-products-list"/);
  assert.match(rendered, /id="mr-materials-title"|id="mr-materials-list"/);
  assert.equal((rendered.match(/data-mr-entry\b/g) || []).length, 12);
  assert.match(renderInquiry(data), /data-unified-inquiry/);
  for (const kind of ['process_or_delivery', 'narrow_published_range']) {
    const narrow = structuredClone(data);
    narrow.quantity_exception.kind = kind;
    narrow.products = narrow.materials.splice(0, 3);
    narrow.quantity_exception.verified_counts = { products: 3, materials: 9 };
    validateReferenceData(narrow);
    assert.equal((renderReferences(narrow).match(/class="mr-group"/g) || []).length, 2);
    assert.match(renderReferences(narrow), /class="mr-groups mr-groups--stacked"/);
  }
  const finishedOnly = structuredClone(data);
  finishedOnly.products = finishedOnly.materials;
  finishedOnly.materials = [];
  finishedOnly.quantity_exception.kind = 'narrow_published_range';
  finishedOnly.quantity_exception.verified_counts = { products: 12, materials: 0 };
  assert.doesNotMatch(renderReferences(finishedOnly), /id="mr-materials-title"|id="mr-materials-list"/);
});

test('engineering-only process exceptions show real schemes without empty inventory UI', () => {
  const category = categories.find(item => item.category_id === 'specialty-11');
  const data = fixture(category);
  data.products = [];
  data.materials = [];
  data.checks = data.checks.slice(0, 3);
  data.title = { en: 'Interface Configuration & Material Selection', zh: '接口配置与材料选型' };
  data.checks_title = { en: 'Engineering Decisions', zh: '工程方案' };
  data.quantity_exception = {
    approved: true, kind: 'process_or_delivery', engineering_only: true,
    reason: { en: 'The audited category is a drawing-based welding process, without verified stock assembly numbers.', zh: '审核类别是依据图纸定义的焊接工艺，尚无可核实的库存成品编号。' },
    audit_id: 'test-fixture-engineering-process-audit',
    verified_counts: { products: 0, materials: 0 }
  };
  validateReferenceData(data);
  const rendered = renderReferences(data);
  assert.match(rendered, /Interface Configuration &amp; Material Selection/);
  assert.match(rendered, /data-mr-mode="engineering"/);
  assert.match(rendered, /class="mr-to-top"[^>]*href="#page-top"/);
  assert.equal((rendered.match(/class="mr-check"/g) || []).length, 3);
  assert.doesNotMatch(rendered, /mr-toolbar|mr-search|mr-no-results|mr-groups|mr-group-head|mr-pagination|0 references/);
  assert.match(rendered, /class="mr-boundary"/);
  assert.match(renderInquiry(data), /data-unified-inquiry/);
  const original = read(category.route.slice(1) + '.html');
  const patched = patchPage(original, data);
  assert.equal(patchPage(patched, data), patched);
  assert.equal((patched.match(/id="category-inquiry-form"/g) || []).length, 1);
  assert.match(patched, /model-references\.js\?v=20261015-references-all1/);
  assert.match(patched, /model-references\.css\?v=20261015-references-all1/);
  for (const mutate of [
    value => { delete value.quantity_exception.engineering_only; },
    value => { value.quantity_exception.engineering_only = false; },
    value => { value.quantity_exception.engineering_only = 'true'; },
    value => { value.quantity_exception.kind = 'material_scope'; },
    value => { value.quantity_exception.kind = 'narrow_published_range'; },
    value => { value.checks = value.checks.slice(0, 2); },
    value => { value.checks[0].copy.zh = ''; },
    value => { value.materials = structuredClone(pilot.materials.slice(0, 1)); value.quantity_exception.verified_counts.materials = 1; },
    value => { value.quantity_exception.verified_counts.products = 1; },
    value => { value.quantity_exception.approved = false; }
  ]) {
    const invalid = structuredClone(data);
    mutate(invalid);
    assert.throws(() => validateReferenceData(invalid));
    assert.throws(() => renderReferences(invalid));
  }
});

test('reviewed subsets preserve incomplete quantity targets and exact searchable references', () => {
  const data = fixture();
  data.products = data.products.slice(0, 5);
  data.materials = data.materials.slice(0, 24);
  data.quantity_exception = {
    approved: true, kind: 'audited_subset', audit_id: 'independent-source-review',
    reason: { en: 'The verified subset is shown at its actual counts; further identifier research remains.', zh: '按实际数量展示已核验子集，型号料号仍有待继续补充。' },
    verified_counts: { products: 5, materials: 24 },
    target_status: 'incomplete', target_counts: { products: 200, materials: 200 }
  };
  validateReferenceData(data);
  assert.equal((renderReferences(data).match(/data-mr-entry\b/g) || []).length, 29);
  for (const mutate of [
    value => { delete value.quantity_exception.target_status; },
    value => { value.quantity_exception.target_status = 'complete'; },
    value => { value.quantity_exception.target_counts.products = 5; },
    value => { value.quantity_exception.verified_counts.materials = 200; },
    value => { value.products = []; value.materials = []; value.quantity_exception.verified_counts = { products: 0, materials: 0 }; }
  ]) {
    const invalid = structuredClone(data); mutate(invalid);
    assert.throws(() => validateReferenceData(invalid));
  }
});

test('the standard large-count layout stays parallel while small approved ranges stack', () => {
  assert.match(renderReferences(fixture()), /class="mr-groups"/);
  assert.doesNotMatch(renderReferences(fixture()), /mr-groups--stacked/);
  const narrow = fixture();
  narrow.products = narrow.products.slice(0, 1);
  narrow.materials = narrow.materials.slice(0, 13);
  narrow.quantity_exception = {
    approved: true, kind: 'narrow_published_range', audit_id: 'test-fixture-small-range',
    reason: { en: 'A verified narrow manufacturer range.', zh: '经审核的较小原厂型号范围。' },
    verified_counts: { products: 1, materials: 13 }
  };
  assert.match(renderReferences(narrow), /class="mr-groups mr-groups--stacked"/);
  narrow.products = structuredClone(pilot.products.slice(0, 20));
  narrow.materials = structuredClone(pilot.materials.slice(0, 20));
  narrow.quantity_exception.verified_counts = { products: 20, materials: 20 };
  assert.doesNotMatch(renderReferences(narrow), /mr-groups--stacked/);
});

test('quantity exceptions reject missing approval, forged counts, incomplete audit details and empty sections', () => {
  const example = fixture();
  example.products = [];
  example.materials = example.materials.slice(0, 12);
  example.quantity_exception = {
    approved: true, kind: 'material_scope', audit_id: 'test-fixture-audit',
    reason: { en: 'Explicitly audited material scope.', zh: '明确审核的材料范围。' },
    verified_counts: { products: 0, materials: 12 }
  };
  for (const mutate of [
    data => { delete data.quantity_exception; },
    data => { delete data.validated; },
    data => { data.validated = false; },
    data => { delete data.quantity_exception.approved; },
    data => { data.quantity_exception.approved = false; },
    data => { data.quantity_exception.approved = 'true'; },
    data => { data.quantity_exception.kind = 'automatic'; },
    data => { data.quantity_exception.audit_id = ' '; },
    data => { delete data.quantity_exception.audit_id; },
    data => { data.quantity_exception.reason.zh = ''; },
    data => { data.quantity_exception.verified_counts.materials = 200; },
    data => { data.quantity_exception.verified_counts.products = 1; },
    data => { data.quantity_exception.verified_counts.materials = '12'; },
    data => { delete data.quantity_exception.verified_counts; },
    data => { data.materials = []; data.quantity_exception.verified_counts.materials = 0; }
  ]) {
    const data = structuredClone(example);
    mutate(data);
    assert.throws(() => validateReferenceData(data));
    assert.throws(() => renderReferences(data));
  }
});

test('unified inquiry requires explicit reviewed configuration instead of a URL alone', () => {
  for (const category of categories) {
    const options = { path: category.route, categoryKey: category.category_id, lang: 'en' };
    assert.doesNotMatch(context.render(options), /data-unified-inquiry|id="category-inquiry-form"/);
    for (const invalid of [
      { ...category, validated: false },
      { ...category, validated: true, category_name: { en: category.category_name.en } },
      { ...category, validated: true, route: '/products/a-different-category' }
    ]) assert.doesNotMatch(context.render({ ...options, referenceConfiguration: invalid }), /data-unified-inquiry/);
    const approved = validateReferenceData(fixture(category));
    const rendered = context.render({ ...options, referenceConfiguration: approved });
    assert.match(rendered, /data-unified-inquiry/);
    assert.ok(rendered.includes(`data-category="${category.category_id}"`));
    assert.ok(rendered.includes(`data-route="${category.route}"`));
    assert.ok(rendered.includes(category.category_name.zh));
  }
});

test('unreviewed categories stay unchanged and cannot retain a stale reference enhancement', t => {
  const category = categories.find(item => !referenceDataForCategory(item.category_id, item.route));
  if (!category) return t.skip('All existing categories have complete reviewed data.');
  const html = read(category.route.slice(1) + '.html');
  assert.doesNotMatch(withPageSeo(html, category.route), /data-unified-inquiry|id="model-references-script"/);
  assert.throws(() => withPageSeo(html.replace('</main>', '<!-- MODEL REFERENCES START --><!-- MODEL REFERENCES END --></main>'), category.route), /complete validated data/);
});

test('all 99 existing category compositions accept a complete section without losing their photographs or footer', () => {
  assert.equal(categories.length, 99);
  for (const category of categories) {
    const data = fixture(category);
    const original = read(category.route.slice(1) + '.html');
    assert.ok(original.includes(`rel="canonical" href="https://supersmile-tech.com${category.route}"`));
    const result = patchPage(original, data);
    assert.equal(patchPage(result, data), result, `${category.category_id} rebuild`);
    assert.equal((result.match(/id="category-inquiry-form"/g) || []).length, 1, category.category_id);
    assert.equal((result.match(/class="mc-quote"/g) || []).length, 1, category.category_id);
    assert.equal((result.match(/id="model-references-script"/g) || []).length, 1, category.category_id);
    assert.equal((result.match(/class="mr-pagination"/g) || []).length, 2, category.category_id);
    assert.equal((result.match(/data-mr-entry\b/g) || []).length, data.products.length + data.materials.length, category.category_id);
    assert.deepEqual(result.match(/<img\b[^>]*>/g), original.match(/<img\b[^>]*>/g), `${category.category_id} original images`);
    assert.equal(result.match(/<footer\b[\s\S]*?<\/footer>/)?.[0], original.match(/<footer\b[\s\S]*?<\/footer>/)?.[0], `${category.category_id} footer`);
    assert.doesNotMatch(result, /<section\b[^>]*class="[^"]*\bpcc-closing\b/);
    assert.match(result, /class="mr-to-top"[^>]*href="#page-top"/);
    assert.match(result, /<body id="page-top"/);
    assert.equal(result.match(/<!-- MODEL REFERENCES START -->[\s\S]*?<!-- MODEL REFERENCES END -->/)?.[0], renderReferences(data));
    assert.equal(result.match(/<!-- MANUFACTURING CONTEXT START -->\n([\s\S]*?)\n<!-- MANUFACTURING CONTEXT END -->/)?.[1], renderInquiry(data));
  }
});
