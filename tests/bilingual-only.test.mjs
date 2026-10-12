import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { onRequest } from '../functions/_middleware.js';

const retired = ['hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','tr','vi','ko','it','nl','pl','th'];
const origin = 'https://supersmile-tech.com';

const htmlResponse = () => new Response('<main>Original page</main>', {
  headers: { 'Content-Type': 'text/html; charset=utf-8', ETag: '"original-page"', 'Last-Modified': 'Mon, 12 Oct 2026 00:00:00 GMT' },
});
const decodeHtml = value => value.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
})[entity]);

test('retired language requests are permanently removed with bilingual links preserving inquiry context', async () => {
  for (const lang of [...retired, 'xx', '']) {
    let calls = 0;
    const result = await onRequest({
      request: new Request(`${origin}/contact?category=automotive-14&products=p-038&lang=${lang}&source_page=%2Fproducts%2Fmolex-compatible#form`),
      next: () => { calls++; return htmlResponse(); },
    });
    assert.equal(calls, 1);
    assert.equal(result.status, 410, lang);
    assert.equal(result.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assert.equal(result.headers.get('Cache-Control'), 'public, max-age=3600');
    assert.equal(result.headers.get('X-Robots-Tag'), 'noindex');
    for (const header of ['Location', 'ETag', 'Last-Modified', 'Link']) assert.equal(result.headers.get(header), null, header);
    const body = await result.text();
    assert.match(body, /permanently removed/);
    assert.match(body, /此语言版本已永久删除/);
    assert.doesNotMatch(body, /rel=["']canonical|<script\b/i);
    const links = [...body.matchAll(/<a href="([^"]+)" lang="(en|zh)">/g)];
    assert.equal(links.length, 2);
    for (const [, href, language] of links) {
      const target = new URL(decodeHtml(href));
      assert.equal(target.origin, origin);
      assert.equal(target.pathname, '/contact');
      assert.equal(target.searchParams.get('lang'), language);
      assert.equal(target.searchParams.get('category'), 'automotive-14');
      assert.equal(target.searchParams.get('products'), 'p-038');
      assert.equal(target.searchParams.get('source_page'), '/products/molex-compatible');
      assert.equal(target.hash, '#form');
    }
  }
});

test('original bilingual requests, APIs, assets and genuine errors pass through unchanged', async () => {
  const cases = [
    ['/?lang=en', 'GET', 200, 'text/html'], ['/?lang=zh', 'GET', 200, 'text/html'],
    ['/?lang=zh&lang=fr', 'GET', 200, 'text/html'], ['/?lang=en&lang=de', 'GET', 200, 'text/html'],
    ['/?%6cang=zh&lang=fr', 'GET', 200, 'text/html'], ['/about', 'GET', 200, 'text/html'],
    ['/contact?products=p-038&category=automotive-14', 'GET', 200, 'text/html'],
    ['/contact?products=p-038&lang=zh&category=automotive-14', 'GET', 200, 'text/html'],
    ['/about?lang=en', 'HEAD', 200, 'text/html'], ['/about?lang=zh', 'HEAD', 200, 'text/html'],
    ['/contact?lang=de', 'POST', 200, 'text/html'], ['/contact?lang=de', 'OPTIONS', 200, 'text/html'],
    ['/api/contact?lang=de', 'POST', 202, 'application/json'], ['/api/contact?lang=de', 'GET', 200, 'application/json'],
    ['/assets/photo.jpg?lang=de', 'GET', 200, 'image/jpeg'], ['/data/site.json?lang=de', 'GET', 200, 'application/json'],
    ['/admin/?lang=de', 'GET', 200, 'text/html'], ['/unknown?lang=de', 'GET', 404, 'text/html'],
    ['/about?lang=de', 'GET', 503, 'text/html'], ['/sitemap.xml?lang=de', 'GET', 200, 'application/xml'],
    ['/file.pdf?lang=fr', 'GET', 200, 'application/pdf'], ['/download?lang=fr', 'GET', 200, null],
    ['/old-product?lang=de', 'GET', 301, 'text/html'],
    ['/about.html?lang=de', 'GET', 308, 'text/html'],
  ];
  for (const [route, method, status, type] of cases) {
    const headers = { 'X-Original': 'preserved' };
    if (type) headers['Content-Type'] = type;
    const response = new Response(method === 'HEAD' || !type ? null : 'Original response', { status, headers });
    assert.equal(await onRequest({ request: new Request(origin + route, { method }), next: () => response }), response, route);
  }
});

test('HEAD requests for removed language versions return 410 without a body', async () => {
  const head = await onRequest({ request: new Request(origin + '/about?lang=fr', { method: 'HEAD' }), next: () => new Response(null, { headers: { 'Content-Type': 'text/html' } }) });
  assert.equal(head.status, 410);
  assert.equal(head.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(head.headers.get('Location'), null);
  assert.equal(await head.text(), '');
});

test('the first language parameter controls retirement and links remove duplicate language parameters', async () => {
  for (const route of ['/about?lang=fr&lang=zh', '/about?%6cang=%66%72&lang=en']) {
    const response = await onRequest({ request: new Request(origin + route), next: htmlResponse });
    assert.equal(response.status, 410, route);
    const body = await response.text();
    const links = [...body.matchAll(/<a href="([^"]+)" lang="(en|zh)">/g)];
    for (const [, href, language] of links) {
      const target = new URL(decodeHtml(href));
      assert.deepEqual(target.searchParams.getAll('lang'), [language]);
    }
  }
});

test('removed language links safely escape URL attributes without losing path, parameters or fragment', async () => {
  const url = new URL(origin + "/contact'quote?lang=fr&products=p-038#form'quote");
  url.searchParams.set('source_page', '\"><img src=x onerror=alert(1)>');
  url.searchParams.append('source_page', 'second & value');
  const response = await onRequest({ request: new Request(url), next: htmlResponse });
  const body = await response.text();
  assert.equal(response.status, 410);
  assert.doesNotMatch(body, /<img\b|<script\b|href="[^"]*'|href="[^"]*&(?!amp;|#39;|quot;|lt;|gt;)/i);
  assert.match(body, /&#39;/);
  assert.match(body, /&amp;/);
  const links = [...body.matchAll(/<a href="([^"]+)" lang="(en|zh)">/g)];
  assert.equal(links.length, 2);
  for (const [, href, language] of links) {
    const target = new URL(decodeHtml(href));
    assert.equal(target.origin, url.origin);
    assert.equal(target.pathname, url.pathname);
    assert.equal(target.hash, url.hash);
    assert.deepEqual(target.searchParams.getAll('source_page'), url.searchParams.getAll('source_page'));
    assert.equal(target.searchParams.get('lang'), language);
  }
});

test('direct bilingual buttons switch language once, keep inquiry parameters and remain keyboard reachable', () => {
  const source = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /googleTranslateChunk|translateLocalizedNodes|ensureCurrentPageLanguage|translate\.googleapis\.com|lang-menu|aria-haspopup="listbox"/);
  const languageList = source.match(/const LANGS = \[[\s\S]*?\];/)[0];
  const selector = source.match(/function renderLangSelector\(\)\{[\s\S]*?\n\}/)[0];
  const sync = source.match(/function syncLanguageUrl\(\)\{[\s\S]*?\n\}/)[0];
  const buttons = [{ dataset: { lang: 'en' } }, { dataset: { lang: 'zh' } }];
  const box = { innerHTML: '', setAttribute() {} };
  let renders = 0, focused = false, replaced = '', stored = '';
  const ctx = {
    URL, location: { href: origin + '/contact?products=p-038&category=automotive-14#form' },
    history: { state: null, replaceState(_state,_title,route) { replaced = route; } },
    localStorage: { setItem(_key,value) { stored=value; } },
    $: query => query === '#lang-box' ? box : { focus(options) { focused = options.preventScroll; } },
    $$: () => buttons, renderAll() { renders++; },
  };
  runInNewContext(`let LANG='en'; ${languageList}; ${sync}; ${selector}; renderLangSelector();`, ctx);
  assert.equal((box.innerHTML.match(/<button /g) || []).length, 2);
  assert.match(box.innerHTML, />EN<\/button>/);
  assert.match(box.innerHTML, />中文<\/button>/);
  buttons[0].onclick(); assert.equal(renders, 0);
  buttons[1].onclick();
  assert.equal(renders, 1); assert.equal(stored, 'zh'); assert.equal(focused, true);
  const target = new URL(replaced, origin);
  assert.equal(target.searchParams.get('lang'), 'zh');
  assert.equal(target.searchParams.get('products'), 'p-038');
  assert.equal(target.searchParams.get('category'), 'automotive-14');
  assert.equal(target.hash, '#form');
});
