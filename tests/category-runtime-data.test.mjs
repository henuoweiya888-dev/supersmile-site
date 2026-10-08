import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { splitCategoryData } from '../tools/build_category_runtime_data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const [main, fullText, indexText] = await Promise.all([
  read('assets/js/main.js'), read('data/product-category-details.json'), read('data/product-category-index.json'),
]);
const details = JSON.parse(fullText);
const capabilities = JSON.parse(await read('data/product-capabilities.json'));
const expectedLabel = (key, language = 'en') => {
  const match = /^(.*)-(\d+)$/.exec(key);
  return details[key].page.displayTitle?.[language] || capabilities.groups.find(group => group.id === match[1]).items[language][Number(match[2]) - 1];
};

async function browser({ route = '/', categoryKey, language = 'en', failIndex = false, failCategory = false } = {}) {
  const requests = [];
  const rich = { innerHTML: '<p>Existing complete editorial content</p>' };
  const context = createContext({
    console: { warn() {}, error() {} }, URL, URLSearchParams,
    location: { pathname: route, search: language === 'en' ? '' : `?lang=${language}` },
    window: categoryKey ? { SS_PRODUCT_CATEGORY: { key: categoryKey } } : {},
    document: {
      addEventListener() {}, querySelector: selector => selector === '#pcc-rich-content' ? rich : null,
      querySelectorAll: () => [], body: { dataset: {}, classList: { contains: () => Boolean(categoryKey) } },
    },
    localStorage: { getItem: () => language, setItem() {} },
    fetch: async url => {
      requests.push(url);
      const pathname = new URL(url, 'https://supersmile-tech.com').pathname;
      if ((failIndex && pathname === '/data/product-category-index.json') || (failCategory && pathname.includes('/product-category-pages/'))) {
        return { ok: false, status: 503 };
      }
      const value = JSON.parse(await read(pathname.slice(1)));
      return { ok: true, status: 200, json: async () => value };
    },
  });
  runInContext(main, context);
  await runInContext('loadData()', context);
  return { context, requests, rich };
}

test('runtime category records exactly preserve the authoritative editorial source', async () => {
  const { index, pages } = splitCategoryData(details);
  assert.deepEqual(JSON.parse(indexText), index, 'regenerate runtime data when the editorial source changes');
  assert.equal(Object.keys(pages).length, 99);
  assert.ok(Buffer.byteLength(indexText) < Buffer.byteLength(fullText) * 0.1, 'shared category payload must stay below ten percent of the original');
  for (const [key, detail] of Object.entries(pages)) {
    assert.deepEqual(JSON.parse(await read(`data/product-category-pages/${key}.json`)), detail, key);
    assert.deepEqual(index[key].page.displayTitle, detail.page.displayTitle, `${key} inquiry label`);
  }
});

test('home, catalogue, contact and SKU pages load only category summaries', async () => {
  for (const route of ['/', '/products', '/contact', '/custom', '/product/turbo-actuator']) {
    const { context, requests } = await browser({ route });
    assert.ok(requests.some(url => url.includes('/product-category-index.json')), route);
    assert.ok(!requests.some(url => /product-category-details|product-category-pages/.test(url)), route);
    assert.equal(runInContext('Object.values(CATEGORY_DETAILS).filter(detail=>detail.page).length', context), 99);
    assert.equal(runInContext('selectionLabel("connector-systems-02")', context), expectedLabel('connector-systems-02'));
  }
});

test('category pages load only their own complete editorial record and retain localized inquiry labels', async () => {
  for (const language of ['en', 'zh']) {
    const key = 'connector-systems-02';
    const { context, requests } = await browser({ route: '/products/molex-compatible', categoryKey: key, language });
    assert.equal(requests.filter(url => url.includes('/product-category-pages/')).length, 1);
    assert.ok(!requests.some(url => url.includes('/product-category-details.json')));
    for (const category of Object.keys(details)) {
      assert.equal(runInContext(`selectionLabel(${JSON.stringify(category)})`, context), expectedLabel(category, language));
    }
    assert.deepEqual(JSON.parse(runInContext('JSON.stringify(CATEGORY_DETAILS["connector-systems-02"])', context)), details[key]);
    runInContext('renderProductCategoryPage()', context);
    assert.ok(context.document.querySelector('#pcc-rich-content').innerHTML.length > 1000);
  }
});

test('unavailable category data retains initial HTML while shared navigation stays available', async () => {
  const { context, requests, rich } = await browser({ route: '/products/molex-compatible', categoryKey: 'connector-systems-02', failCategory: true });
  runInContext('renderProductCategoryPage()', context);
  assert.equal(rich.innerHTML, '<p>Existing complete editorial content</p>');
  assert.equal(runInContext('Object.values(CATEGORY_DETAILS).filter(detail=>detail.page).length', context), 99);
  assert.ok(!requests.some(url => url.includes('/product-category-details.json')));
});

test('a missing summary deployment falls back to the previous data source', async () => {
  const { context, requests } = await browser({ failIndex: true });
  assert.ok(requests.some(url => url.includes('/product-category-details.json')));
  assert.equal(runInContext('selectionLabel("connector-systems-02")', context), expectedLabel('connector-systems-02'));
});
