import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { withPageSeo } from '../tools/page_seo.mjs';
import { buildSeoPolicy, businessContext, createRuntimePolicy, htmlPathForRoute, root, SEO_VERSION } from '../tools/seo_policy.mjs';

const policy = await buildSeoPolicy();
const seo = createRuntimePolicy(policy);
const script = await fs.readFile(path.join(root, 'assets/js/manufacturing-context.js'), 'utf8');
const scope = { URLSearchParams };
runInNewContext(script, scope);
const context = scope.SS_MANUFACTURING_CONTEXT;
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const block = html => html.match(/<!-- MANUFACTURING CONTEXT START -->\s*([\s\S]*?)\s*<!-- MANUFACTURING CONTEXT END -->/)?.[1];
const text = html => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const quoteUrl = html => new URL(decode(html.match(/<a\b[^>]*class="mc-quote"[^>]*href="([^"]+)"/)?.[1] || ''), 'https://supersmile-tech.com');
const galleries = html => html.match(/<!-- PRODUCT GALLERY START -->[\s\S]*?<!-- PRODUCT GALLERY END -->/)?.[0] || html.match(/<section\b[^>]*class="[^"]*product-gallery[^>]*>[\s\S]*?<\/section>/)?.[0];

test('all 190 static contexts agree with runtime data, preserve gallery and are idempotent', async () => {
  assert.equal(policy.pages.length, 190);
  for (const page of policy.pages) {
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
    assert.equal([...url.searchParams.keys()].length, 1 + Number(!!page.categoryKey) + Number(!!page.productId), page.route);
  }
});

test('all twenty languages contain localized business and starting requirements without an English fallback', () => {
  const en = context.render({ path: '/contact', lang: 'en', procurementContext: businessContext.en });
  const enStart = en.match(/<h3>([\s\S]*?)<\/h3>/)[1];
  const enIntro = en.match(/<h3>[\s\S]*?<\/h3><p>([\s\S]*?)<\/p>/)[1];
  const enInputs = en.match(/<details>[\s\S]*?<p>([\s\S]*?)<\/p>/)[1];
  assert.equal(Object.keys(businessContext).length, 20);
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
  for (const route of ['/404', '/products/unknown-category', '/wire-harness-prototype-sample-validation', '/custom-cable-assembly']) {
    assert.equal(withPageSeo(html, route), html, route);
  }
});
