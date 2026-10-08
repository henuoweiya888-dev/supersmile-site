import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { captureLanding, captureCategory, captureEquipment, createRenderContext } from '../tools/sync_priority_page_ssr.mjs';
import { runInContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const decode = text => text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = value => decode(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

function divContent(html, id) {
  const opening = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  assert.ok(opening, id);
  const start = opening.index + opening[0].length;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 1;
  for (let match; (match = tags.exec(html));) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, match.index);
  }
  throw Error(`Unclosed div: ${id}`);
}

test('manufacturer, OBD, turbo and J1939 landing pages deliver the runtime subject and FAQs in initial HTML', async () => {
  for (const route of ['/custom-wiring-harness', '/obd2-diagnostic-cable', '/turbo-actuator-harness', '/j1939-cable']) {
    const html = await read(route.slice(1) + '.html');
    const { markup, copy } = await captureLanding(route);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, route);
    assert.match(html, /<body[^>]*\bpage-landing-custom\b/);
    assert.equal(text(main.match(/<h1>([\s\S]*?)<\/h1>/)[1]), copy.title);
    assert.equal(text(main), text(markup), route);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const faq = schema['@graph'].find(item => item['@type'] === 'FAQPage');
    assert.deepEqual(faq.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), JSON.parse(JSON.stringify(copy.faqs)));
    assert.doesNotMatch(main + JSON.stringify(schema), /MOQ.{0,20}10|7.day samples|samples in 7 days|quote within 24 hours/i);
  }
});

test('technical category HTML contains the exact editorial body used at runtime', async () => {
  for (const [key, filename] of [
    ['connector-systems-02', 'products/molex-compatible.html'],
    ['automotive-01', 'products/automotive-diagnostic-and-obd-harness.html'],
  ]) {
    const html = await read(filename);
    const { markup, intro } = await captureCategory(key);
    assert.equal(divContent(html, 'pcc-rich-content'), markup, key);
    assert.equal(text(html.match(/<p id="pcc-intro">([\s\S]*?)<\/p>/)[1]), intro, key);
    assert.ok((markup.match(/<h2>/g) || []).length >= 8, key);
  }
});

test('equipment wire starts in English, has full SSR, and retains it if its source fails', async () => {
  const html = await read('products/equipment-wire.html');
  const initial = divContent(html, 'eqw-content');
  const english = await captureEquipment();
  assert.equal(initial, english.markup);
  assert.match(initial, /Machine Boundaries, MTW and AWM/);
  assert.equal(english.nodes.get('eqw-title').textContent, 'Equipment Wire');
  const failed = await captureEquipment('en', { fail: true, initialMarkup: initial });
  assert.equal(failed.markup, initial);
  assert.doesNotMatch(failed.markup, /eqw-error/);
  const chinese = await captureEquipment('zh');
  assert.equal(chinese.nodes.get('eqw-title').textContent, '设备用电线');
  assert.match(chinese.markup, /机器边界、MTW 与 AWM/);
  english.context.location.search = '?lang=zh';
  english.context.document.documentElement.lang = 'zh-CN';
  english.observers[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(english.nodes.get('eqw-title').textContent, '设备用电线');
  assert.equal(english.nodes.get('eqw-content').innerHTML, chinese.markup);
  assert.doesNotMatch(await read('assets/js/equipment-wire-editorial.js'), /document\.title\s*=|documentElement\.lang\s*=|meta\[name="description"\]/);
});

test('the engineering service keeps its own subject and shares the contact upload form', async () => {
  const [service, contact] = await Promise.all([read('custom.html'), read('contact.html')]);
  const { context } = await createRenderContext('/custom');
  const runtimeTitle = runInContext('t(CUSTOM_SERVICE.heroTitle)', context);
  assert.match(service, /<body[^>]*\bpage-custom\b/);
  assert.equal(text(service.match(/<h1 id="cu-title">([\s\S]*?)<\/h1>/)[1]), runtimeTitle);
  assert.match(runtimeTitle, /Engineering|Process/);
  const serviceForm = service.match(/<form id="contact-form"[\s\S]*?<\/form>/)[0];
  const contactForm = contact.match(/<form id="contact-form"[\s\S]*?<\/form>/)[0];
  assert.equal(serviceForm, contactForm);
  for (const id of ['cf-files', 'cf-turnstile', 'cf-form-status', 'cf-submit']) assert.ok(serviceForm.includes(`id="${id}"`), id);
  assert.match(serviceForm, /action="\/api\/contact"/);
});

test('all gallery photos and controls remain after priority category SSR updates', async () => {
  const galleries = JSON.parse(await read('data/product-photo-galleries.json'));
  for (const [key, filename] of [
    ['connector-systems-02', 'products/molex-compatible.html'],
    ['automotive-01', 'products/automotive-diagnostic-and-obd-harness.html'],
    ['wire-cable-03', 'products/equipment-wire.html'],
  ]) {
    const html = await read(filename);
    assert.equal((html.match(/class="pcc-gallery"/g) || []).length, 1, key);
    assert.equal((html.match(/class="pcc-gallery-item"/g) || []).length, galleries[key].photos.length, key);
    for (const photo of galleries[key].photos) assert.ok(html.includes(`data-full-image="${photo.src}"`), photo.src);
    assert.ok(html.includes('id="product-gallery-script"'), key);
    assert.ok(html.includes('data-gallery-direction="next"'), key);
  }
});
