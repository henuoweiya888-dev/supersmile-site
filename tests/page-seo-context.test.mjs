import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { withPageSeo } from '../tools/page_seo.mjs';
import { buildSeoPolicy, businessContext, createRuntimePolicy, htmlPathForRoute, root, SEO_VERSION } from '../tools/seo_policy.mjs';
const exampleCount = JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8')).products.length;

const policy = await buildSeoPolicy();
const seo = createRuntimePolicy(policy);
const script = await fs.readFile(path.join(root, 'assets/js/manufacturing-context.js'), 'utf8');
const scope = { URLSearchParams };
runInNewContext(script, scope);
const context = scope.SS_MANUFACTURING_CONTEXT;
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const block = html => html.match(/<!-- MANUFACTURING CONTEXT START -->\s*([\s\S]*?)\s*<!-- MANUFACTURING CONTEXT END -->/)?.[1];
const text = html => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const quoteUrl = html => {
  if(html.includes('data-unified-inquiry')) {
    const url = new URL(decode(html.match(/<form\b[^>]*action="([^"]+)"/)[1]), 'https://supersmile-tech.com');
    for(const field of html.matchAll(/<input\b[^>]*type="hidden"[^>]*>/g)) {
      url.searchParams.set(decode(field[0].match(/name="([^"]+)"/)[1]),decode(field[0].match(/value="([^"]*)"/)[1]));
    }
    return url;
  }
  return new URL(decode(html.match(/<a\b[^>]*class="mc-quote"[^>]*href="([^"]+)"/)?.[1] || ''), 'https://supersmile-tech.com');
};
const galleries = html => html.match(/<!-- PRODUCT GALLERY START -->[\s\S]*?<!-- PRODUCT GALLERY END -->/)?.[0] || html.match(/<section\b[^>]*class="[^"]*product-gallery[^>]*>[\s\S]*?<\/section>/)?.[0];

test('all 203 static contexts agree with runtime data, preserve gallery and are idempotent', async () => {
  assert.equal(policy.pages.length, 203 + exampleCount);
  const existingPages = policy.pages.filter(page => page.kind !== 'example');
  assert.equal(existingPages.length, 203);
  for (const page of existingPages) {
    const html = await fs.readFile(path.join(root, htmlPathForRoute(page.route)), 'utf8');
    const output = withPageSeo(html, page.route);
    assert.equal(withPageSeo(output, page.route), output, `${page.route} idempotence`);
    assert.equal((output.match(/id="manufacturing-context"/g) || []).length, 1, page.route);
    const options = {
      path: page.route, lang: 'en', procurementContext: seo.resolve({ path: page.route, lang: 'en' }).procurementContext,
      categoryKey: page.categoryKey, productId: page.productId
    };
    assert.equal(block(output), context.render(options), `${page.route} static/runtime context`);
    const content = text(block(output));
    assert.match(content, /custom wire harness manufacturing/i, page.route);
    assert.match(content, /China factory/i, page.route);
    assert.match(content, /OEM\/ODM/i, page.route);
    assert.match(content, /sample.*connector photos.*quantity/i, page.route);
    assert.match(content, /drawings and BOM.*pinout.*wire length and gauge/i, page.route);
    assert.equal(galleries(output), galleries(html), `${page.route} gallery remains byte-identical`);
    if (page.kind === 'category') assert.ok(galleries(output), `${page.route} has its product gallery`);
    assert.ok(output.indexOf('<!-- MANUFACTURING CONTEXT START -->') < output.indexOf('<footer class="footer"'), page.route);
    assert.ok(output.includes(`/assets/css/manufacturing-context.css?v=${SEO_VERSION}`), page.route);
    assert.ok(output.indexOf('/assets/js/seo-policy.js') < output.indexOf('/assets/js/main.js'), page.route);
    assert.ok(output.indexOf('/assets/js/manufacturing-context.js') < output.indexOf('/assets/js/main.js'), page.route);
    const url = quoteUrl(block(output));
    assert.equal(url.pathname, '/contact', page.route);
    assert.equal(url.searchParams.get('source_page'), page.route, page.route);
    assert.equal(url.searchParams.get('category'), page.categoryKey || null, page.route);
    assert.equal(url.searchParams.get('products'), page.productId || null, page.route);
    assert.equal([...url.searchParams.keys()].length, block(output).includes('data-unified-inquiry') ? 4 : 1 + Number(!!page.categoryKey) + Number(!!page.productId), page.route);
  }
});

test('example presentations keep their product-specific customization chapter without a second generic inquiry block', async () => {
  const examples = policy.pages.filter(page => page.kind === 'example');
  assert.equal(examples.length, exampleCount);
  for (const page of examples) {
    const html = await fs.readFile(path.join(root, htmlPathForRoute(page.route)), 'utf8');
    const output = withPageSeo(html, page.route);
    assert.equal(output, html, page.route);
    assert.match(output, /id="pe-customization"/);
    assert.match(output, /class="pe-cta"/);
    assert.doesNotMatch(output, /id="manufacturing-context"/);
  }
});

test('English and Chinese retain their business and starting requirements', () => {
  const en = context.render({ path: '/contact', lang: 'en', procurementContext: businessContext.en });
  const enStart = en.match(/<h3>([\s\S]*?)<\/h3>/)[1];
  const enIntro = en.match(/<h3>[\s\S]*?<\/h3><p>([\s\S]*?)<\/p>/)[1];
  const enInputs = en.match(/<details>[\s\S]*?<p>([\s\S]*?)<\/p>/)[1];
  assert.deepEqual(Object.keys(businessContext), ['en', 'zh']);
  for (const [lang, procurementContext] of Object.entries(businessContext)) {
    const html = context.render({ path: '/contact', lang, procurementContext });
    assert.ok(text(html).includes(procurementContext), lang);
    assert.match(html, /OEM\/ODM/, lang);
    const heading = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1];
    const start = html.match(/<h3>([\s\S]*?)<\/h3>/)?.[1];
    const intro = html.match(/<h3>[\s\S]*?<\/h3><p>([\s\S]*?)<\/p>/)?.[1];
    const inputs = html.match(/<details>[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1];
    for (const value of [heading, start, intro, inputs]) assert.ok(value && value.length > 3, lang);
    assert.match(inputs, /BOM/, lang);
    if (lang !== 'en') {
      assert.notEqual(start, enStart, `${lang} starting heading`);
      assert.notEqual(intro, enIntro, `${lang} starting requirements`);
      assert.notEqual(inputs, enInputs, `${lang} quotation requirements`);
    }
    assert.equal(quoteUrl(html).searchParams.get('source_page'), '/contact');
  }
});

test('removed languages do not render or replace the manufacturing context', () => {
  const current = { outerHTML: 'Existing context' };
  let inserted = '';
  const document = {
    getElementById() { return current; },
    querySelector() { return { insertAdjacentHTML(position, markup) { inserted = markup; } }; }
  };
  const local = { window: { document }, URLSearchParams };
  runInNewContext(script, local);
  for (const lang of ['hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja', 'tr', 'vi', 'ko', 'it', 'nl', 'pl', 'th', 'xx']) {
    const options = { path: '/contact', lang, procurementContext: 'Removed translation' };
    assert.equal(context.render(options), '', lang);
    local.window.SS_MANUFACTURING_CONTEXT.apply(options);
    assert.equal(current.outerHTML, 'Existing context', lang);
    assert.equal(inserted, '', lang);
  }
});

test('runtime context replacement and footer insertion do not modify product content', () => {
  const productMain = { innerHTML: '<section>Product body and gallery remain here</section>' };
  const current = { outerHTML: '' };
  let inserted = '';
  const footer = { insertAdjacentHTML(position, html) { assert.equal(position, 'beforebegin'); inserted = html; } };
  const document = {
    getElementById(id) { assert.equal(id, 'manufacturing-context'); return current; },
    querySelector(selector) { return selector === 'footer.footer' ? footer : productMain; }
  };
  const local = { window: { document }, URLSearchParams };
  runInNewContext(script, local);
  const options = { path: '/products/molex-compatible', lang: 'zh', procurementContext: businessContext.zh, categoryKey: 'connector-systems-02' };
  local.window.SS_MANUFACTURING_CONTEXT.apply(options);
  assert.equal(current.outerHTML, local.window.SS_MANUFACTURING_CONTEXT.render(options));
  assert.equal(inserted, '');
  assert.equal(productMain.innerHTML, '<section>Product body and gallery remain here</section>');
  document.getElementById = () => null;
  local.window.SS_MANUFACTURING_CONTEXT.apply(options);
  assert.equal(inserted, local.window.SS_MANUFACTURING_CONTEXT.render(options));
  assert.equal(quoteUrl(inserted).searchParams.get('category'), 'connector-systems-02');
  assert.equal(productMain.innerHTML, '<section>Product body and gallery remain here</section>');
});

test('unified pilot inquiry survives later SEO renders and keeps entered part numbers', () => {
  const current = {outerHTML:'Unchanged inquiry and user input',hasAttribute:name=>name==='data-unified-inquiry'};
  const local={window:{document:{getElementById:()=>current}},URLSearchParams};
  runInNewContext(script,local);
  local.window.SS_MANUFACTURING_CONTEXT.apply({path:'/products/industrial-equipment-harness',lang:'zh'});
  assert.equal(current.outerHTML,'Unchanged inquiry and user input');
});

test('untrusted context and inquiry parameters are escaped and cannot add markup or query fields', () => {
  const dangerous = '<img src=x onerror="alert(1)"> & \' ";';
  const options = {
    path: `/product/example?x=1&category=wrong#${dangerous}`,
    lang: 'en', procurementContext: dangerous,
    categoryKey: `connector-systems-02&products=wrong${dangerous}`,
    productId: `p081&category=wrong${dangerous}`
  };
  const html = context.render(options);
  assert.doesNotMatch(html, /<img|<script|onerror="/, 'context must render the supplied string as text');
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  const url = quoteUrl(html);
  assert.equal(url.pathname, '/contact');
  assert.equal(url.searchParams.get('source_page'), options.path);
  assert.equal(url.searchParams.get('category'), options.categoryKey);
  assert.equal(url.searchParams.get('products'), options.productId);
  assert.deepEqual([...url.searchParams.keys()], ['source_page', 'category', 'products']);
});

test('404, unlisted routes and historical aliases are not converted into business pages', () => {
  const html = '<html><head><title>Not Found</title></head><body><main>404</main></body></html>';
  for (const route of ['/404', '/products/unknown-category', '/products/turbo-actuator-cables', '/products/heavy-duty-j1939-diagnostic-cables']) {
    assert.equal(withPageSeo(html, route), html, route);
  }
});
