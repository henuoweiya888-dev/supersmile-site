import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInContext, runInNewContext } from 'node:vm';
import { buildSeoPolicy, htmlPathForRoute } from '../tools/seo_policy.mjs';
import { createRenderContext } from '../tools/sync_priority_page_ssr.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const [policyData, policyScript, contextScript, mainScript] = await Promise.all([
  buildSeoPolicy(), read('assets/js/seo-policy.js'), read('assets/js/manufacturing-context.js'), read('assets/js/main.js'),
]);
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

class Element {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.attributes = {}; this.dataset = {}; this.children = [];
    this.value = ''; this.textContent = ''; this.innerHTML = ''; this.outerHTML = '';
    this.hidden = false; this.disabled = false; this.resetCount = 0;
    const classes = new Set();
    this.classList = {
      add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name),
      toggle(name, force) { const present = force ?? !classes.has(name); present ? classes.add(name) : classes.delete(name); return present; },
    };
    this.listeners = new Map();
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  focus() { this.focused = true; }
  scrollIntoView() { this.focused = true; }
}

function documentMock({ form = false, existingContext = true } = {}) {
  const ids = new Map();
  const metadata = new Map();
  for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]']) {
    const element = new Element('meta'); element.content = 'Old generic metadata'; metadata.set(selector, element);
  }
  if (existingContext) ids.set('manufacturing-context', new Element('section'));
  const events = [], lifecycle = [], inserted = [];
  const footer = { insertAdjacentHTML(position, html) { inserted.push({ position, html }); } };
  const document = {
    title: 'Old generic title', documentElement: { lang: 'en', dir: 'ltr' }, body: new Element('body'),
    querySelector(selector) { return selector === 'footer.footer' ? footer : selector.startsWith('#') ? ids.get(selector.slice(1)) || null : metadata.get(selector) || null; },
    querySelectorAll() { return []; }, getElementById(id) { return ids.get(id) || null; },
    createElement: tagName => new Element(tagName), createTextNode: text => ({ textContent: text }),
    addEventListener(name, callback) { if (name === 'DOMContentLoaded') lifecycle.push(callback); },
    dispatchEvent(event) { events.push(event); }, head: new Element('head'),
  };
  if (form) {
    for (const id of ['contact-form','cf-first-name','cf-last-name','cf-email','cf-msg','cf-files','cf-upload-field','cf-turnstile','cf-submit','cf-form-status','cf-files-error','cf-file-list','cf-file-summary','cf-files-label','cf-file-picker','cf-files-help','ps-trigger']) ids.set(id, new Element());
    ids.get('cf-upload-field').hidden = true; ids.get('cf-turnstile').hidden = true;
    ids.get('contact-form').reset = () => {
      ids.get('contact-form').resetCount += 1;
      for (const id of ['cf-first-name','cf-last-name','cf-email','cf-msg']) ids.get(id).value = '';
    };
  }
  return { document, ids, metadata, events, lifecycle, inserted };
}

async function runtime(route, language = 'en', mock = documentMock()) {
  const { context } = await createRenderContext(route, language);
  context.document = mock.document;
  context.window.document = mock.document;
  context.FormData = FormData; context.AbortController = AbortController;
  context.setTimeout = setTimeout; context.clearTimeout = clearTimeout;
  context.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  return { context, ...mock };
}

test('deferred policies are available for the actual final render chain after main registration', async () => {
  const noopRenderers = ['renderNav','renderLogoCompany','renderLangSelector','renderHero','renderHotProduct','renderCustom','renderProcess','renderApps','renderFactory','renderCerts','renderProductsTeaser','renderBlocks','renderCTA','renderFooter','renderProductsPage','renderContact','renderAbout','renderProductSelect','bindPsToggle','hydrateStaticIcons','syncDocumentLanguage','renderLandingPage','renderProductSeriesPage','renderProductCategoryPage','renderProductDetail','setupProductGallery','renderHomeStatic','renderProductsStatic','renderCustomStatic','renderAboutStatic','renderContactStatic','renderSharedChrome'];
  for (const language of ['en', 'zh']) {
    const mock = documentMock();
    const { context } = await runtime('/', language, mock);
    // main is a normal script; deferred scripts run after parser completion but
    // before the DOMContentLoaded callback that invokes renderAll.
    assert.equal(context.window.SS_SEO_POLICY, undefined);
    runInContext(policyScript, context);
    runInContext(contextScript, context);
    for (const name of noopRenderers) runInContext(`${name}=()=>{}`, context);
    runInContext('renderAll()', context);
    const expected = policyData.pages.find(page => page.route === '/');
    assert.equal(mock.document.title, expected.title[language]);
    assert.equal(mock.metadata.get('meta[name="description"]').content, expected.description[language]);
    assert.equal(mock.metadata.get('meta[property="og:title"]').content, expected.title[language]);
    assert.doesNotMatch(mock.document.title, /Precisely Engineered|Electronic Technology/);
    assert.ok(mock.ids.get('manufacturing-context').outerHTML.includes(expected.description[language].slice(-25)), language);
    runInContext('renderAll()', context);
    assert.equal(mock.document.title, expected.title[language], 'a second render cannot restore the slogan');
  }
});

test('all 203 initial manufacturing sections equal runtime EN and preserve route/category/product inquiry context', async () => {
  const scope = { window: {}, URL, URLSearchParams };
  runInNewContext(policyScript, scope);
  runInNewContext(contextScript, scope);
  assert.equal(policyData.pages.length, 203);
  for (const page of policyData.pages) {
    const html = await read(htmlPathForRoute(page.route));
    const match = html.match(/<!-- MANUFACTURING CONTEXT START -->\s*([\s\S]*?)\s*<!-- MANUFACTURING CONTEXT END -->/);
    assert.ok(match, page.route);
    const metadata = scope.window.SS_SEO_POLICY.resolve({ path: page.route, lang: 'en' });
    const rendered = scope.window.SS_MANUFACTURING_CONTEXT.render({ path: page.route, lang: 'en', procurementContext: metadata.procurementContext, categoryKey: page.categoryKey, productId: page.productId });
    assert.equal(match[1].trim(), rendered, page.route);
    assert.equal((html.match(/id="manufacturing-context"/g) || []).length, 1, page.route);
    assert.ok(html.indexOf('MANUFACTURING CONTEXT END') < html.indexOf('<footer'), page.route);
    const quote = decode(rendered.match(/class="mc-quote" href="([^"]+)"/)[1]);
    const target = new URL(quote, 'https://supersmile-tech.com');
    assert.equal(target.pathname, '/contact', page.route);
    assert.equal(target.searchParams.get('source_page'), page.route, page.route);
    assert.equal(target.searchParams.get('category'), page.categoryKey || null, page.route);
    assert.equal(target.searchParams.get('products'), page.productId || null, page.route);
    assert.match(html, /<script\b[^>]*\bdefer\b[^>]*src="\/assets\/js\/seo-policy\.js/);
    assert.match(html, /<script\b[^>]*\bdefer\b[^>]*src="\/assets\/js\/manufacturing-context\.js/);
    assert.ok(html.indexOf('/assets/js/seo-policy.js') < html.indexOf('/assets/js/main.js'), page.route);
    assert.ok(html.indexOf('/assets/js/manufacturing-context.js') < html.indexOf('/assets/js/main.js'), page.route);
    const chinese = scope.window.SS_SEO_POLICY.resolve({ path: page.route, lang: 'zh' });
    const zh = scope.window.SS_MANUFACTURING_CONTEXT.render({ path: page.route, lang: 'zh', procurementContext: chinese.procurementContext, categoryKey: page.categoryKey, productId: page.productId });
    assert.match(zh, /中国工厂.*定制线束制造.*OEM\/ODM/, page.route);
    assert.equal((zh.match(/id="manufacturing-context"/g) || []).length, 1, page.route);
  }
});

test('404 and excluded/foreign routes never gain a manufacturing section from final SEO integration', async () => {
  const html = await read('404.html');
  assert.doesNotMatch(html, /manufacturing-context|seo-policy\.js|main\.js/);
  for (const route of ['/404', '/404.html', '/unknown-product', 'https://foreign.example/custom']) {
    const { context, inserted } = await runtime(route, 'en', documentMock({ existingContext: false }));
    runInContext(policyScript, context); runInContext(contextScript, context);
    assert.equal(context.window.SS_SEO_POLICY.resolve({ path: route, lang: 'en' }), null);
    runInContext('renderDynamicSeo()', context);
    assert.equal(inserted.length, 0, route);
  }
});

async function inquiryRuntime(route, language, result = { status: 202, body: { ok: true } }) {
  const runtimeState = await runtime(route, language, documentMock({ form: true }));
  const { context, ids } = runtimeState;
  const calls = [], widgets = [], resets = [];
  context.window.turnstile = {
    render: (_element, options) => { widgets.push(options); return 'test-widget'; },
    reset: id => resets.push(id),
  };
  context.fetch = async (endpoint, options = {}) => {
    assert.equal(endpoint, '/api/contact', 'mock forbids any external email or upload request');
    calls.push({ endpoint, options });
    if (!options.method) return { ok: true, json: async () => ({ ready: true, turnstileSiteKey: 'test-site', allowedExtensions: ['.pdf', '.png'], maxTotalBytes: 3 * 1024 * 1024 }) };
    if (result.networkError) throw Error('Mocked network failure');
    return { status: result.status, json: async () => result.body };
  };
  await runInContext('initContactDirectForm()', context);
  assert.equal(runInContext('contactDirectState.ready', context), true, route);
  assert.equal(ids.get('cf-upload-field').hidden, false, route);
  widgets[0].callback('verified-token');
  for (const [id, value] of [['cf-first-name','Jane'],['cf-last-name','Buyer'],['cf-email','buyer@example.org'],['cf-msg','Review this drawing.']]) ids.get(id).value = value;
  return { ...runtimeState, calls, widgets, resets };
}

const inquiry = { firstName: 'Jane', lastName: 'Buyer', email: 'buyer@example.org', message: 'Review this drawing.', products: 'Equipment harness' };

test('contact and custom submit attachments directly and report success only after confirmed 202', async () => {
  for (const route of ['/custom', '/contact']) for (const language of ['en', 'zh']) {
    const state = await inquiryRuntime(route, language);
    const { context, calls, ids, events, resets } = state;
    context.__file = new File(['%PDF-1.7\nmock drawing'], 'drawing.pdf', { type: 'application/pdf' });
    runInContext('addContactFiles([__file])', context);
    context.__inquiry = inquiry;
    await runInContext('submitContactDirect(__inquiry)', context);
    const post = calls.find(call => call.options.method === 'POST');
    assert.ok(post, route);
    assert.equal(post.options.body.get('source_page'), route);
    assert.equal(post.options.body.get('email'), inquiry.email);
    assert.equal(post.options.body.get('files').name, 'drawing.pdf');
    assert.equal(await post.options.body.get('files').text(), await context.__file.text());
    assert.equal(ids.get('contact-form').resetCount, 1);
    assert.equal(runInContext('contactDirectState.statusKey', context), 'success');
    assert.equal(runInContext('contactDirectState.files.length', context), 0);
    assert.equal(ids.get('cf-form-status').attributes.role, 'status');
    assert.equal(ids.get('cf-submit').disabled, false);
    assert.equal(events.length, 1); assert.equal(events[0].detail.state, 'submitted');
    assert.equal(events[0].detail.page, route);
    assert.deepEqual(resets, ['test-widget']);
  }
});

test('contact and custom retain fields and attachments on rejection or network failure', async () => {
  for (const route of ['/custom', '/contact']) for (const result of [
    { status: 502, body: { ok: false, code: 'send_failed' } },
    { status: 200, body: { ok: true } },
    { status: 202, body: { ok: false } },
    { networkError: true },
  ]) {
    const { context, ids, events } = await inquiryRuntime(route, 'en', result);
    context.__file = new File(['%PDF-1.7\nmock drawing'], 'drawing.pdf', { type: 'application/pdf' });
    context.__inquiry = inquiry;
    runInContext('addContactFiles([__file])', context);
    await runInContext('submitContactDirect(__inquiry)', context);
    assert.equal(runInContext('contactDirectState.statusKey', context), 'failure');
    assert.equal(runInContext('contactDirectState.files.length', context), 1);
    assert.equal(runInContext('contactDirectState.token', context), '');
    assert.equal(runInContext('contactDirectState.busy', context), false);
    assert.equal(ids.get('contact-form').resetCount, 0);
    assert.equal(ids.get('cf-msg').value, 'Review this drawing.');
    assert.equal(ids.get('cf-form-status').attributes.role, 'alert');
    assert.equal(ids.get('cf-form-status').classList.contains('is-error'), true);
    assert.equal(ids.get('cf-submit').disabled, false);
    assert.equal(events.length, 0, 'a failed submission cannot emit a submitted event');
  }
});

test('upload limits and missing security verification block both inquiry pages before POST', async () => {
  for (const route of ['/custom', '/contact']) {
    const { context, calls, ids } = await inquiryRuntime(route, 'en');
    context.__inquiry = inquiry;
    context.__files = Array.from({ length: 4 }, (_, index) => new File(['a'], `drawing-${index}.pdf`));
    runInContext('addContactFiles(__files)', context);
    assert.equal(runInContext('contactDirectState.fileErrorKey', context), 'tooMany');
    await runInContext('submitContactDirect(__inquiry)', context);
    assert.equal(calls.filter(call => call.options.method === 'POST').length, 0);
    runInContext("contactFileError(null);contactDirectState.token='';", context);
    await runInContext('submitContactDirect(__inquiry)', context);
    assert.equal(runInContext('contactDirectState.statusKey', context), 'verify');
    assert.equal(ids.get('cf-turnstile').focused, true);
    assert.equal(calls.filter(call => call.options.method === 'POST').length, 0);
    context.__files = [new File(['x'.repeat(3 * 1024 * 1024 + 1)], 'large.pdf')];
    runInContext('addContactFiles(__files)', context);
    assert.equal(runInContext('contactDirectState.fileErrorKey', context), 'tooLarge');
    context.__files = [new File(['script'], 'unsupported.exe')];
    runInContext('addContactFiles(__files)', context);
    assert.equal(runInContext('contactDirectState.fileErrorKey', context), 'unsupported');
  }
});

test('the real form binding routes both pages to direct submission or an email-opened fallback', async () => {
  for (const route of ['/custom', '/contact']) for (const ready of [true, false]) {
    const { context, ids, events, calls, lifecycle } = await inquiryRuntime(route, 'en');
    context.__emailCalls = [];
    // Leave the original DOMContentLoaded form-binding code intact while inert
    // display hooks prevent unrelated UI work. The fallback is recorded only.
    runInContext(`loadTawkWidget=()=>{}; loadData=async()=>{}; renderAll=()=>{}; decoratePage=()=>{}; initContactDirectForm=()=>{}; ensureCurrentPageLanguage=()=>Promise.resolve(); sendMail=(...args)=>__emailCalls.push(args); contactDirectState.ready=${ready};`, context);
    const start = mainScript.indexOf("document.addEventListener('DOMContentLoaded', async ()=>{");
    assert.ok(start >= 0);
    runInContext(mainScript.slice(start), context);
    await lifecycle[0]();
    let prevented = 0;
    ids.get('contact-form').onsubmit({ preventDefault() { prevented += 1; } });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(prevented, 1);
    assert.equal(calls.filter(call => call.options.method === 'POST').length, ready ? 1 : 0, route);
    assert.equal(events.length, 1);
    assert.equal(events[0].detail.state, ready ? 'submitted' : 'email_opened', route);
    assert.equal(context.__emailCalls.length, ready ? 0 : 1, route);
    assert.equal(ids.get('contact-form').resetCount, ready ? 1 : 0, route);
  }
});
