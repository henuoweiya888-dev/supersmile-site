import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { onRequest } from '../functions/_middleware.js';

const retired = ['hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','tr','vi','ko','it','nl','pl','th'];
const origin = 'https://supersmile-tech.com';

test('retired language requests redirect to the same English page with inquiry context intact', async () => {
  for (const lang of [...retired, 'xx', '']) {
    let calls = 0;
    const result = await onRequest({
      request: new Request(`${origin}/contact?category=automotive-14&products=p-038&lang=${lang}&source_page=%2Fproducts%2Fmolex-compatible#form`),
      next: () => { calls++; return new Response('<main>Original page</main>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); },
    });
    assert.equal(calls, 1);
    assert.equal(result.status, 301);
    const target = new URL(result.headers.get('Location'));
    assert.equal(target.pathname, '/contact');
    assert.equal(target.searchParams.get('lang'), 'en');
    assert.equal(target.searchParams.get('category'), 'automotive-14');
    assert.equal(target.searchParams.get('products'), 'p-038');
    assert.equal(target.searchParams.get('source_page'), '/products/molex-compatible');
    assert.equal(target.hash, '#form');
  }
});

test('original bilingual requests, APIs, assets and genuine errors pass through unchanged', async () => {
  const cases = [
    ['/?lang=en', 'GET', 200, 'text/html'], ['/?lang=zh', 'GET', 200, 'text/html'],
    ['/?lang=zh&lang=fr', 'GET', 200, 'text/html'], ['/about', 'GET', 200, 'text/html'],
    ['/api/contact?lang=de', 'POST', 202, 'application/json'], ['/api/contact?lang=de', 'GET', 200, 'application/json'],
    ['/assets/photo.jpg?lang=de', 'GET', 200, 'image/jpeg'], ['/data/site.json?lang=de', 'GET', 200, 'application/json'],
    ['/admin/?lang=de', 'GET', 200, 'text/html'], ['/unknown?lang=de', 'GET', 404, 'text/html'],
    ['/about?lang=de', 'GET', 503, 'text/html'], ['/sitemap.xml?lang=de', 'GET', 200, 'application/xml'],
    ['/old-product?lang=de', 'GET', 301, 'text/html'],
  ];
  for (const [route, method, status, type] of cases) {
    const response = new Response('Original response', { status, headers: { 'Content-Type': type } });
    assert.equal(await onRequest({ request: new Request(origin + route, { method }), next: () => response }), response, route);
  }
  const head = await onRequest({ request: new Request(origin + '/about?lang=fr', { method: 'HEAD' }), next: () => new Response(null, { headers: { 'Content-Type': 'text/html' } }) });
  assert.equal(head.status, 301);
  assert.equal(await head.text(), '');
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
