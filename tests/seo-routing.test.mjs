import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => readFileSync(path.join(root, relativePath), 'utf8');
const routeExists = route => {
  const pathname = new URL(route, 'https://supersmile-tech.com').pathname;
  const relativePath = pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`;
  return existsSync(path.join(root, relativePath));
};

test('Cloudflare Pages has a top-level, non-indexable 404 page with working exits', () => {
  const html = read('404.html');
  assert.match(html, /<title>Page Not Found \| Super Smile<\/title>/);
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.doesNotMatch(html, /rel="canonical"|window\.location/);
  for (const route of ['/', '/products', '/contact']) {
    assert.ok(html.includes(`href="${route}"`), `${route} is missing from the 404 page`);
    assert.ok(routeExists(route), `${route} must resolve to a real HTML page`);
  }
});

test('product-category footer routes resolve to real extensionless HTML pages', () => {
  const generator = read('tools/build_product_category_pages.mjs');
  const oldRoutes = [
    '/products/turbo-actuator-cables',
    '/products/obd2-and-universal-diagnostic-cables',
    '/products/heavy-duty-j1939-diagnostic-cables',
  ];
  const replacements = [
    '/turbo-actuator-harness',
    '/obd2-diagnostic-cable',
    '/j1939-cable',
  ];
  for (const route of oldRoutes) assert.ok(!generator.includes(`href="${route}"`));
  for (const route of replacements) {
    assert.ok(generator.includes(`href="${route}"`));
    assert.ok(routeExists(route), `${route} must have a matching .html file`);
  }

  let checked = 0;
  for (const file of readdirSync(path.join(root, 'products')).filter(name => name.endsWith('.html'))) {
    const html = read(`products/${file}`);
    if (!html.includes('page-product-category')) continue;
    checked += 1;
    const footer = html.match(/<footer class="footer">([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer, `${file} has no footer`);
    for (const route of oldRoutes) assert.ok(!footer.includes(`href="${route}"`), `${file} retains ${route}`);
    for (const match of footer.matchAll(/<a href="(\/[^"#?]*)"/g)) {
      assert.ok(routeExists(match[1]), `${file} links to a missing page: ${match[1]}`);
    }
  }
  assert.ok(checked > 0, 'no product-category pages were inspected');
});

test('exact Pages rewrites preserve every virtual route without masking unknown URLs', () => {
  const series = JSON.parse(read('data/product-series.json')).series;
  const seriesRoutes = series.map(item => `/products/${item.slug}`);
  const script = read('assets/js/main.js');
  const landingList = script.match(/if\(\[([^\]]+)\]\.includes\(leaf\)\) return 'page-landing';/)?.[1];
  assert.ok(landingList, 'landing route inventory is missing');
  const landingRoutes = [...landingList.matchAll(/'([^']+)'/g)].map(match => `/${match[1]}`);
  const missingLandingRoutes = landingRoutes.filter(route => !routeExists(route));
  const expected = [...seriesRoutes, ...missingLandingRoutes].sort();
  assert.equal(seriesRoutes.length, 5);
  assert.equal(missingLandingRoutes.length, 8);

  const rules = read('_redirects').split(/\r?\n/).map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  const sources = [];
  for (const rule of rules) {
    const parts = rule.split(/\s+/);
    assert.equal(parts.length, 3, rule);
    const [source, destination, status] = parts;
    assert.equal(destination, '/index.html', rule);
    assert.equal(status, '200', rule);
    assert.ok(!source.includes('*') && !source.includes(':'), `rewrite must be exact: ${rule}`);
    assert.equal(routeExists(source), false, `remove rewrite when ${source} gets a real page`);
    sources.push(source);
  }
  assert.deepEqual(sources.sort(), expected);
  assert.equal(new Set(sources).size, 13);
  const unknown = '/seo-unknown-path-regression-check';
  assert.equal(routeExists(unknown), false);
  assert.equal(sources.includes(unknown), false);
});

test('all linked SKU and published product-category routes have HTML files', () => {
  const products = JSON.parse(read('data/products.json'));
  const capabilities = JSON.parse(read('data/product-capabilities.json'));
  const details = JSON.parse(read('data/product-category-details.json'));
  const slugify = value => String(value || '').toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let productCount = 0;
  for (const category of products.categories) {
    for (const product of category.products || []) {
      assert.ok(routeExists(`/product/${product.slug}`), `missing SKU: ${product.slug}`);
      productCount += 1;
    }
  }
  let categoryCount = 0;
  for (const group of capabilities.groups) {
    (group.items?.en || []).forEach((name, index) => {
      const key = `${group.id}-${String(index + 1).padStart(2, '0')}`;
      if (!details[key]?.page) return;
      assert.ok(routeExists(`/products/${slugify(name)}`), `missing category: ${key}`);
      categoryCount += 1;
    });
  }
  assert.equal(productCount, 82);
  assert.equal(categoryCount, 99);
});
