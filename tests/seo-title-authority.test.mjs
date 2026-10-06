import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { buildSeoPolicy, createRuntimePolicy, root, SEO_POLICY_SCRIPT_VERSION, SEO_VERSION, withSeoPolicy } from '../tools/seo_policy.mjs';

const data = await buildSeoPolicy();
const route = '/products/molex-compatible';
const normalTitle = value => String(value).replace(/[\t\n\f\r ]+/g, ' ').trim();

function titleDom() {
  const observers = [];
  const pending = new Set();
  const metas = new Map();
  let titleNode = { text: 'Initial title' };
  let writes = 0;
  const notify = () => observers.filter(observer => observer.active).forEach(observer => pending.add(observer));
  class MutationObserver {
    constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
    observe(target, options) { this.target = target; this.options = options; this.active = true; }
    disconnect() { this.active = false; pending.delete(this); }
  }
  const head = {
    appendChild(element) {
      const [attribute, value] = Object.entries(element.attributes)[0];
      metas.set(`meta[${attribute}="${value}"]`, element);
      notify();
    },
    replaceTitle(text) { titleNode = { text }; notify(); },
    removeTitle() { titleNode = null; notify(); },
    unrelatedChatMutation() { notify(); }
  };
  const document = {
    head, defaultView: { MutationObserver }, documentElement: { lang: 'en', dir: 'ltr' },
    querySelector(selector) { return metas.get(selector) || null; },
    createElement() { return { attributes: {}, content: '', setAttribute(name, value) { this.attributes[name] = value; } }; }
  };
  Object.defineProperty(document, 'title', {
    get() { return normalTitle(titleNode?.text || ''); },
    set(value) { writes++; if (!titleNode) titleNode = {}; titleNode.text = value; notify(); }
  });
  const flush = () => {
    let deliveries = 0;
    while (pending.size) {
      if (++deliveries > 12) throw new Error('Title observer is looping');
      const batch = [...pending]; pending.clear();
      for (const observer of batch) if (observer.active) observer.callback([]);
    }
    return deliveries;
  };
  return { document, head, observers, metas, flush, get writes() { return writes; } };
}

test('known public page restores late chat title mutations once and leaves chat DOM activity alone', () => {
  const policy = createRuntimePolicy(data);
  const dom = titleDom();
  const result = policy.apply({ document: dom.document, path: route, LANG: 'en' });
  dom.flush();
  assert.equal(dom.observers.length, 1);
  assert.equal(dom.observers[0].target, dom.head);
  assert.deepEqual(dom.observers[0].options, { subtree: true, childList: true, characterData: true });
  dom.document.title = '1 条新消息';
  const before = dom.writes;
  dom.flush();
  assert.equal(dom.document.title, result.title);
  assert.equal(dom.writes, before + 1, 'one restoration followed by an equality check');
  const stable = dom.writes;
  dom.head.unrelatedChatMutation();
  dom.flush();
  assert.equal(dom.writes, stable, 'chat activity with the right title causes no title write');
  assert.equal(dom.metas.get('meta[property="og:title"]').content, result.title);
});

test('pending mutations and EN/ZH/other-language transitions use the latest authoritative title', () => {
  const policy = createRuntimePolicy(data);
  const dom = titleDom();
  const en = policy.apply({ document: dom.document, path: route, lang: 'en' });
  dom.flush();
  dom.document.title = '1 条新消息';
  const zh = policy.apply({ document: dom.document, path: route, lang: 'zh' });
  dom.flush();
  assert.notEqual(zh.title, en.title);
  assert.equal(dom.document.title, zh.title, 'pending notification must not restore the previous language');
  dom.document.title = '2 new messages';
  dom.flush();
  assert.equal(dom.document.title, zh.title);
  const de = policy.apply({ document: dom.document, path: route, lang: 'de', title: 'Molex-kompatible Kabelbäume | OEM/ODM', description: 'Projektbezogene Kabelbaumfertigung.' });
  dom.document.title = '1 neue Nachricht';
  dom.flush();
  assert.equal(dom.document.title, de.title);
  policy.apply({ document: dom.document, path: route, lang: 'en' });
  dom.flush();
  assert.equal(dom.document.title, en.title);
  assert.equal(dom.observers.length, 1, 'language renders reuse one observer');
});

test('replacing or removing the title element is repaired using the active title without a stale node', () => {
  const dom = titleDom();
  const generated = fs.readFile(path.join(root, 'assets/js/seo-policy.js'), 'utf8');
  return generated.then(source => {
    const sandbox = { window: {}, document: dom.document, location: { pathname: route }, URL };
    runInNewContext(source, sandbox);
    const result = sandbox.window.SS_SEO_POLICY.apply({ path: route, LANG: 'en' });
    dom.flush();
    dom.head.replaceTitle('1 条新消息');
    dom.flush();
    assert.equal(dom.document.title, result.title);
    dom.head.removeTitle();
    dom.flush();
    assert.equal(dom.document.title, result.title);
  });
});

test('unknown routes remain untouched and release any previous title authority', () => {
  const policy = createRuntimePolicy(data);
  const dom = titleDom();
  assert.equal(policy.apply({ document: dom.document, path: '/404', lang: 'en' }), null);
  assert.equal(dom.observers.length, 0);
  assert.equal(dom.document.title, 'Initial title');
  policy.apply({ document: dom.document, path: route, lang: 'en' });
  dom.flush();
  const previous = dom.observers[0];
  assert.equal(policy.apply({ document: dom.document, path: '/products/unknown', lang: 'en' }), null);
  assert.equal(previous.active, false);
  dom.document.title = 'Not Found';
  previous.callback([]);
  dom.flush();
  assert.equal(dom.document.title, 'Not Found');
});

test('normalized foreign titles cannot create observer loops and only the policy script version changes', () => {
  const policy = createRuntimePolicy(data);
  const dom = titleDom();
  policy.apply({ document: dom.document, path: route, lang: 'de', title: 'Molex  Kabelbäume\n| OEM/ODM', description: 'Details zum Projekt.' });
  dom.flush();
  assert.equal(dom.document.title, 'Molex Kabelbäume | OEM/ODM');
  dom.document.title = 'Nachricht';
  dom.flush();
  assert.equal(dom.document.title, 'Molex Kabelbäume | OEM/ODM');
  const source = '<html><head><title>Old</title></head><body><main>Product body</main><script src="/assets/js/main.js?v=old"></script></body></html>';
  const transformed = withSeoPolicy(source, route, data);
  assert.ok(transformed.includes(`/assets/js/seo-policy.js?v=${SEO_POLICY_SCRIPT_VERSION}`));
  assert.ok(transformed.includes(`/assets/js/main.js?v=${SEO_VERSION}`));
  assert.ok(transformed.includes('<main>Product body</main>'));
});
