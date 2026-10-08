import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'assets/js/product-image-zoom.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/images/products/web/manifest.json'), 'utf8'));

function runZoom(photo) {
  let displayed = photo.output;
  const image = { getAttribute: name => name === 'src' ? displayed : null };
  const attributes = {};
  const listeners = {};
  const link = {
    href: photo.source,
    dataset: { previewSrc: photo.output, originalSrc: photo.source },
    querySelector: selector => selector === 'img' ? image : null,
    setAttribute: (name, value) => { attributes[name] = value; },
    addEventListener: (event, callback) => { listeners[event] = callback; },
  };
  const documentElement = { lang: 'en' };
  const observers = [];
  runInNewContext(script, {
    URL, location: { href: 'https://supersmile-tech.com/product/test', origin: 'https://supersmile-tech.com' },
    document: { documentElement, querySelectorAll: () => [link] },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target, options) { observers.push({ target, options, callback: this.callback }); }
    },
    fetch() { assert.fail('the original must not be fetched before a click'); },
    Image: class { constructor() { assert.fail('the original must not be preloaded'); } },
  });
  return { link, attributes, documentElement, observers, listeners, image, display: source => { displayed = source; } };
}

test('both optimized main photos link to their own untouched originals without requesting them', () => {
  for (const photo of manifest) {
    const { link, attributes } = runZoom(photo);
    assert.equal(link.href, photo.source);
    assert.match(attributes['aria-label'], /full-size.*new tab/);
    assert.equal(link.title, attributes['aria-label']);
  }
});

test('thumbnail changes link to the displayed photo and can return to the optimized main image', () => {
  for (const photo of manifest) {
    const state = runZoom(photo);
    const sourceObserver = state.observers.find(observer => observer.target === state.image);
    assert.deepEqual(Array.from(sourceObserver.options.attributeFilter), ['src']);
    const selected = '/assets/images/products/p081_glass_2.png';
    state.display(`https://supersmile-tech.com${selected}`);
    sourceObserver.callback();
    assert.equal(state.link.href, selected);
    state.display(photo.output);
    state.listeners.click();
    assert.equal(state.link.href, photo.source, 'click mapping should not wait for an observer delivery');
  }
});

test('language changes update only the accessible link text', () => {
  const state = runZoom(manifest[0]);
  const originalHref = state.link.href;
  state.documentElement.lang = 'zh-CN';
  state.observers.find(observer => observer.target === state.documentElement).callback();
  assert.equal(state.attributes['aria-label'], '查看原尺寸产品照片（在新标签页打开）');
  assert.equal(state.link.title, state.attributes['aria-label']);
  assert.equal(state.link.href, originalHref);
});
