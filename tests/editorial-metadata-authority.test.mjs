import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { root } from '../tools/seo_policy.mjs';

const jsRoot = path.join(root, 'assets/js');
const independentNames = (await fs.readdir(jsRoot)).filter(name => name.endsWith('.js') && !['main.js', 'seo-policy.js'].includes(name));
const changedNames = [
  'appliance-wire-editorial.js', 'automotive-primary-wire-editorial.js', 'can-bus-editorial.js',
  'coaxial-editorial.js', 'coil-motion-editorial.js', 'emi-field-editorial.js', 'fine-pitch-magazine.js',
  'fpc-ffc-magazine.js', 'ftdi-signal-editorial.js', 'fuse-harness-magazine.js',
  'high-temperature-overmolding-editorial.js', 'idc-ribbon-magazine.js', 'low-pressure-molding-editorial.js',
  'micro-d-magazine.js', 'panduit-magazine.js', 'panel-mount-magazine.js', 'phoenix-magazine.js',
  'ptfe-magazine.js', 'strain-relief-magazine.js', 'ultrasonic-splice-editorial.js',
  'waterproof-design-magazine.js', 'wire-special-editorial.js'
];
const read = name => fs.readFile(path.join(jsRoot, name), 'utf8');

test('independent page scripts cannot overwrite the shared metadata or global document language', async () => {
  for (const name of independentNames) {
    const source = await read(name);
    assert.doesNotMatch(source, /document\.title\s*=(?!=)/, name);
    assert.doesNotMatch(source, /document\.documentElement\.lang\s*=(?!=)/, name);
    assert.doesNotMatch(source, /querySelector\(\s*['"](?:title|meta\[(?:name=.*description|property=.*og:(?:title|description)))/, name);
    assert.doesNotMatch(source, /\.get\(['"]lang['"]\)\s*!==?\s*['"]en['"]/, name);
  }
});

test('every repaired editorial language selector honors query, storage and document with English default', async () => {
  const cases = [
    { query: '', stored: '', document: '', expected: 'en' },
    { query: '?lang=zh', stored: 'de', document: 'en', expected: 'zh' },
    { query: '?lang=de', stored: 'zh', document: 'zh', expected: 'de' },
    { query: '?lang=en', stored: 'zh', document: 'zh', expected: 'en' },
    { query: '', stored: 'zh', document: 'en', expected: 'zh' },
    { query: '', stored: 'fr', document: 'zh', expected: 'fr' },
    { query: '', stored: '', document: 'zh-CN', expected: 'zh' },
    { query: '', stored: '', document: 'ja', expected: 'ja' },
    { query: '', stored: '', document: '', deniedStorage: true, expected: 'en' }
  ];
  assert.equal(changedNames.length, 22);
  for (const name of changedNames) {
    const source = await read(name);
    const fn = source.match(/  function editorialLanguage\(\) \{[\s\S]*?\n  \}/)?.[0];
    assert.ok(fn, name);
    for (const entry of cases) {
      const value = runInNewContext(`${fn}; editorialLanguage();`, {
        URLSearchParams, location: { search: entry.query }, document: { documentElement: { lang: entry.document } },
        localStorage: { getItem() { if (entry.deniedStorage) throw new Error('Storage denied'); return entry.stored; } }
      });
      assert.equal(value, entry.expected, `${name}: ${JSON.stringify(entry)}`);
      assert.equal(value === 'zh', entry.expected === 'zh', `${name} Chinese requires zh`);
    }
  }
});

test('wire-special follows language changes for alt and inquiry without observing or writing metadata', async () => {
  const source = await read('wire-special-editorial.js');
  let language = 'en';
  const documentElement = {};
  Object.defineProperty(documentElement, 'lang', { get: () => language, set: () => { throw new Error('Independent script changed global language'); } });
  const image = { alt: '', dataset: { altEn: 'English cable photo', altZh: '中文电缆图片' } };
  const link = { href: '' };
  const observations = [];
  const callbacks = [];
  const document = {
    documentElement,
    body: { classList: { contains: value => value === 'wire-special' }, dataset: { key: 'wire-cable-09', titleEn: 'Shielded Twisted Pair', titleZh: '屏蔽双绞线' } },
    querySelector() { throw new Error('Independent script accessed metadata'); },
    querySelectorAll(selector) {
      if (selector === 'img[data-alt-en][data-alt-zh]') return [image];
      if (selector === '[data-contact-link]') return [link];
      return [];
    }
  };
  Object.defineProperty(document, 'title', { get: () => 'Title from unified policy', set: () => { throw new Error('Independent script overwrote title'); } });
  const location = { search: '' };
  const sandbox = {
    document, location, URLSearchParams, localStorage: { getItem: () => '' }, window: {},
    MutationObserver: class { constructor(callback) { callbacks.push(callback); } observe(target, options) { observations.push({ target, options }); } },
    queueMicrotask: callback => callback(), matchMedia: () => ({ matches: true })
  };
  runInNewContext(source, sandbox);
  assert.equal(image.alt, 'English cable photo');
  assert.equal(new URL(link.href, 'https://supersmile-tech.com').searchParams.get('category'), 'wire-cable-09');
  assert.equal(observations.length, 1);
  assert.equal(observations[0].target, documentElement);
  assert.deepEqual(Array.from(observations[0].options.attributeFilter), ['lang']);
  language = 'zh';
  callbacks[0]();
  assert.equal(image.alt, '中文电缆图片');
  assert.equal(new URL(link.href, 'https://supersmile-tech.com').searchParams.get('category_name'), '屏蔽双绞线');
  location.search = '?lang=de';
  callbacks[0]();
  assert.equal(image.alt, 'English cable photo');
  assert.equal(document.title, 'Title from unified policy');
  assert.equal(documentElement.lang, 'zh');
});

test('an asynchronous editorial fetch still renders body, images and inquiry while preserving policy metadata', async () => {
  const source = await read('low-pressure-molding-editorial.js');
  const data = JSON.parse(await fs.readFile(path.join(root, 'content/product-category-drafts/low-pressure-molding.json'), 'utf8'));
  for (const requested of ['', '?lang=zh', '?lang=de']) {
    const nodes = new Map();
    const node = id => {
      if (!nodes.has(id)) nodes.set(id, { textContent: '', innerHTML: '', attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } });
      return nodes.get(id);
    };
    const documentElement = {};
    Object.defineProperty(documentElement, 'lang', { get: () => 'en', set: () => { throw new Error('Global language overwrite'); } });
    const document = { documentElement, getElementById: node, querySelector() { throw new Error('Metadata access'); } };
    Object.defineProperty(document, 'title', { get: () => 'Unified policy title', set: () => { throw new Error('Title overwrite'); } });
    runInNewContext(source, {
      document, location: { search: requested }, URLSearchParams,
      localStorage: { getItem: () => '' }, fetch: async () => ({ ok: true, json: async () => data })
    });
    await new Promise(resolve => setImmediate(resolve));
    const zh = requested === '?lang=zh';
    assert.equal(node('lpm-title').textContent, data.page.displayTitle[zh ? 'zh' : 'en']);
    assert.match(node('lpm-content').innerHTML, /class="lpm-page"/);
    assert.match(node('lpm-content').innerHTML, /<img[^>]*alt=/);
    assert.match(node('lpm-content').innerHTML, /<details><summary>/);
    const inquiry = new URL(node('lpm-cta').attributes.href, 'https://supersmile-tech.com');
    assert.equal(inquiry.pathname, '/contact');
    assert.equal(inquiry.searchParams.get('category'), 'specialty-14');
    assert.equal(document.title, 'Unified policy title');
    assert.equal(documentElement.lang, 'en');
  }
});
