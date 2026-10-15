import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'assets/js/category-inquiry.js'), 'utf8');
const contactPage = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');

function element({ tag = 'SPAN', type = '', value = '', attributes = {}, dataset = {} } = {}) {
  const listeners = new Map();
  return {
    tagName: tag, type, value, attributes, dataset, children: [], checked: false, disabled: false,
    hidden: false, textContent: '', focused: false,
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    addEventListener(name, callback) { listeners.set(name, callback); },
    dispatch(name, event = {}) { listeners.get(name)?.(event); },
    focus() { this.focused = true; }
  };
}

function boot({ search = '', lang = 'en', draft, categoryForm = false, readyState = 'interactive', historyState = null, category = 'custom-harness-01', route = '/products/industrial-equipment-harness', categoryNames = { en: 'Industrial Equipment Harness', zh: '工业设备线束' } } = {}) {
  const listeners = new Map();
  const windowListeners = new Map();
  const animationFrames = [];
  const observers = [];
  const message = draft === undefined ? null : element({ tag: 'TEXTAREA', value: draft });
  const form = categoryForm ? element({ tag: 'FORM', dataset: { category, route } }) : null;
  const choice = element({ tag: 'INPUT', type: 'checkbox' });
  const field = element();
  const input = element({ tag: 'INPUT', type: 'text', attributes: { 'data-ci-placeholder-en': 'Enter a model or part number', 'data-ci-placeholder-zh': '输入型号或料号' } });
  const categoryName = element({ tag: 'INPUT', type: 'hidden', value: categoryNames.en, attributes: { 'data-ci-en': categoryNames.en, 'data-ci-zh': categoryNames.zh } });
  const languageField = element({ tag: 'INPUT', type: 'hidden', value: 'en' });
  const label = element({ attributes: { 'data-ci-en': 'Add a model or part number (optional)', 'data-ci-zh': '填写型号或料号（可选）' } });
  if (form) form.querySelector = selector => ({ '#ci-category-name': categoryName, 'input[name="lang"]': languageField })[selector] || null;
  const section = categoryForm ? {
    querySelector(selector) { return ({ '#category-inquiry-form': form, '#ci-use-part': choice, '#ci-part-field': field, '#ci-part-number': input })[selector] || null; },
    querySelectorAll(selector) {
      if (selector === '[data-ci-en][data-ci-zh]') return [label, categoryName];
      if (selector === '[data-ci-placeholder-en][data-ci-placeholder-zh]') return [input];
      return [];
    }
  } : null;
  const document = {
    readyState, documentElement: { lang },
    querySelector(selector) { return selector === '#manufacturing-context[data-unified-inquiry]' ? section : null; },
    getElementById(id) { return id === 'cf-msg' ? message : null; },
    addEventListener(name, callback) { listeners.set(name, callback); }
  };
  const destinations = [];
  const historyReplacements = [];
  const history = {
    state: historyState,
    replaceState(...args) {
      historyReplacements.push(args);
      this.state = args[0];
    }
  };
  const window = {
    document,
    history,
    location: { search, assign(url) { destinations.push(url); } },
    addEventListener(name, callback) { windowListeners.set(name, callback); },
    requestAnimationFrame(callback) { animationFrames.push(callback); },
    MutationObserver: class {
      constructor(callback) { observers.push(callback); }
      observe() {}
    }
  };
  runInNewContext(script, { window, URLSearchParams });
  return {
    api: window.SS_CATEGORY_INQUIRY, message, form, choice, field, input, label, categoryName, languageField, destinations, history, historyReplacements,
    domReady() { document.readyState = 'interactive'; listeners.get('DOMContentLoaded')?.(); },
    pageShow() { windowListeners.get('pageshow')?.(); },
    animationFrame() { animationFrames.splice(0).forEach(callback => callback()); },
    language(next) { document.documentElement.lang = next; observers.forEach(callback => callback()); }
  };
}

test('optional part numbers use an internal encoded contact URL and never send an inquiry', () => {
  const scope = { URLSearchParams };
  runInNewContext(script, scope);
  const url = new URL(scope.SS_CATEGORY_INQUIRY.buildInquiryUrl({
    category: 'custom-harness-01', categoryName: '工业设备线束', route: '/products/industrial-equipment-harness',
    lang: 'zh', usePart: true, partNumber: '  A660-4004-T751#L7R503 & ABC=123  '
  }), 'https://supersmile-tech.com');
  assert.equal(url.pathname, '/contact');
  assert.equal(url.searchParams.get('category_name'), '工业设备线束');
  assert.equal(url.searchParams.get('part_number'), 'A660-4004-T751#L7R503 & ABC=123');
  assert.equal(url.searchParams.get('ABC'), null);
  assert.equal(url.searchParams.get('source_page'), '/products/industrial-equipment-harness');
  assert.equal(url.searchParams.get('lang'), 'zh');
  for (const options of [{ usePart: false, partNumber: '123' }, { usePart: true, partNumber: '   ' }]) {
    const target = new URL(scope.SS_CATEGORY_INQUIRY.buildInquiryUrl(options), 'https://supersmile-tech.com');
    assert.equal(target.searchParams.has('part_number'), false);
  }
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|mailto:/);
});

test('the unified category inquiry preserves optional input and localizes without rebuilding', () => {
  const ui = boot({ categoryForm: true, search: '?lang=zh' });
  assert.equal(ui.field.hidden, true);
  assert.equal(ui.input.disabled, true);
  assert.equal(ui.languageField.value, 'zh');
  assert.equal(ui.label.textContent, '填写型号或料号（可选）');
  ui.choice.checked = true;
  ui.choice.dispatch('change');
  assert.equal(ui.field.hidden, false);
  assert.equal(ui.input.disabled, false);
  assert.equal(ui.input.focused, true);
  assert.equal(ui.choice.attributes['aria-expanded'], 'true');
  ui.input.value = '  09 3105 81 03  ';
  ui.language('en');
  assert.equal(ui.choice.checked, true);
  assert.equal(ui.input.value, '  09 3105 81 03  ');
  assert.equal(ui.input.attributes.placeholder, 'Enter a model or part number');
  assert.equal(ui.categoryName.value, 'Industrial Equipment Harness');
  assert.equal(ui.languageField.value, 'en');
  let prevented = false;
  ui.form.dispatch('submit', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  let target = new URL(ui.destinations.at(-1), 'https://supersmile-tech.com');
  assert.equal(target.searchParams.get('part_number'), '09 3105 81 03');
  assert.equal(target.searchParams.get('lang'), 'en');
  ui.choice.checked = false;
  ui.choice.dispatch('change');
  assert.equal(ui.input.value, '  09 3105 81 03  ');
  assert.equal(ui.input.disabled, true);
  ui.form.dispatch('submit', { preventDefault() {} });
  target = new URL(ui.destinations.at(-1), 'https://supersmile-tech.com');
  assert.equal(target.searchParams.has('part_number'), false);
});

test('contact prefills both lines before asynchronous main localization and follows language while untouched', () => {
  const ui = boot({ draft: '', search: '?category=custom-harness-01&category_name=Industrial%20Equipment%20Harness&part_number=0931058103&lang=zh' });
  assert.equal(ui.message.value, '咨询产品类别：工业设备线束\n型号 / 料号：0931058103');
  // The existing main.js only fills an empty message after its data request finishes.
  if (!ui.message.value) ui.message.value = '咨询产品类别：Industrial Equipment Harness';
  assert.match(ui.message.value, /料号：0931058103/);
  ui.language('en');
  assert.equal(ui.message.value, 'Product category inquiry: Industrial Equipment Harness\nModel / part number: 0931058103');
  ui.language('zh');
  assert.equal(ui.message.value, '咨询产品类别：工业设备线束\n型号 / 料号：0931058103');
});

test('every category can carry both names into contact and keep its own optional draft', () => {
  const options = {
    categoryForm: true,
    category: 'connector-systems-02',
    route: '/products/molex-compatible',
    categoryNames: { en: 'Molex-Compatible Wire Harnesses', zh: 'Molex 兼容线束' },
    search: '?lang=zh'
  };
  const outbound = boot(options);
  outbound.choice.checked = true;
  outbound.choice.dispatch('change');
  outbound.input.value = '  43025-0400  ';
  outbound.form.dispatch('submit', { preventDefault() {} });
  const target = new URL(outbound.destinations.at(-1), 'https://supersmile-tech.com');
  assert.equal(target.searchParams.get('category'), options.category);
  assert.equal(target.searchParams.get('category_name_en'), options.categoryNames.en);
  assert.equal(target.searchParams.get('category_name_zh'), options.categoryNames.zh);
  assert.equal(target.searchParams.get('source_page'), options.route);
  const contact = boot({ draft: '', search: target.search });
  assert.equal(contact.message.value, '咨询产品类别：Molex 兼容线束\n型号 / 料号：43025-0400');
  contact.language('en');
  assert.equal(contact.message.value, 'Product category inquiry: Molex-Compatible Wire Harnesses\nModel / part number: 43025-0400');
  contact.language('zh');
  assert.equal(contact.message.value, '咨询产品类别：Molex 兼容线束\n型号 / 料号：43025-0400');
  const returned = boot({ ...options, historyState: outbound.history.state });
  assert.equal(returned.input.value, '  43025-0400  ');
  assert.equal(returned.choice.checked, true);
  const differentCategory = boot({ categoryForm: true, historyState: outbound.history.state });
  assert.equal(differentCategory.input.value, '');
  assert.equal(differentCategory.choice.checked, false);
  outbound.choice.checked = false;
  outbound.form.dispatch('submit', { preventDefault() {} });
  const withoutPart = new URL(outbound.destinations.at(-1), 'https://supersmile-tech.com');
  assert.equal(withoutPart.searchParams.has('part_number'), false);
  const categoryOnly = boot({ draft: '', search: withoutPart.search });
  assert.equal(categoryOnly.message.value, '咨询产品类别：Molex 兼容线束');
  categoryOnly.language('en');
  assert.equal(categoryOnly.message.value, 'Product category inquiry: Molex-Compatible Wire Harnesses');
});

test('history restoration resynchronizes the optional part field without clearing text or taking focus', () => {
  const ui = boot({ categoryForm: true });
  assert.equal(ui.field.hidden, true);
  assert.equal(ui.input.disabled, true);
  ui.choice.checked = true;
  ui.input.value = 'A660-4004-T751#L7R503';
  ui.pageShow();
  assert.equal(ui.field.hidden, false);
  assert.equal(ui.input.disabled, false);
  assert.equal(ui.choice.attributes['aria-expanded'], 'true');
  assert.equal(ui.input.focused, false);
  assert.equal(ui.input.value, 'A660-4004-T751#L7R503');
  ui.animationFrame();
  // Some browsers restore persisted controls after synchronous pageshow handlers.
  ui.choice.checked = false;
  ui.pageShow();
  ui.choice.checked = true;
  assert.equal(ui.field.hidden, true);
  ui.animationFrame();
  assert.equal(ui.field.hidden, false);
  assert.equal(ui.input.disabled, false);
  assert.equal(ui.choice.attributes['aria-expanded'], 'true');
  assert.equal(ui.input.value, 'A660-4004-T751#L7R503');
  assert.equal(ui.input.focused, false);
  ui.choice.checked = false;
  ui.pageShow();
  ui.animationFrame();
  assert.equal(ui.field.hidden, true);
  assert.equal(ui.input.disabled, true);
  assert.equal(ui.choice.attributes['aria-expanded'], 'false');
  assert.equal(ui.input.value, 'A660-4004-T751#L7R503');
});

test('returning from contact restores the submitted current-entry draft even when the browser omits text restoration', () => {
  const original = { unrelatedPageState: { page: 7 }, marker: 'keep-me' };
  const outbound = boot({ categoryForm: true, historyState: original, search: '?lang=zh' });
  outbound.choice.checked = true;
  outbound.choice.dispatch('change');
  outbound.input.value = '  09 3105 81 03  ';
  outbound.input.dispatch('input');
  outbound.form.dispatch('submit', { preventDefault() {} });
  const destination = new URL(outbound.destinations.at(-1), 'https://supersmile-tech.com');
  assert.equal(destination.searchParams.get('part_number'), '09 3105 81 03');
  assert.equal(outbound.history.state.marker, 'keep-me');
  assert.equal(outbound.history.state.unrelatedPageState, original.unrelatedPageState);
  assert.equal(outbound.historyReplacements.at(-1).length, 2, 'replaceState does not change the current URL');
  const contact = boot({ draft: '', search: destination.search });
  assert.equal(contact.message.value, '咨询产品类别：工业设备线束\n型号 / 料号：09 3105 81 03');

  // A freshly initialized back-navigation document starts without restored controls.
  const returned = boot({ categoryForm: true, historyState: outbound.history.state, search: '?lang=zh' });
  assert.equal(returned.choice.checked, true);
  assert.equal(returned.input.value, '  09 3105 81 03  ');
  // The browser restores just the checkbox and leaves autocomplete=off text empty.
  returned.input.value = '';
  returned.pageShow();
  assert.equal(returned.input.value, '  09 3105 81 03  ');
  returned.input.value = '';
  returned.animationFrame();
  assert.equal(returned.input.value, '  09 3105 81 03  ');
  assert.equal(returned.field.hidden, false);
  assert.equal(returned.input.disabled, false);
  assert.equal(returned.choice.attributes['aria-expanded'], 'true');
  assert.equal(returned.input.focused, false);
});

test('an unchecked saved draft restores its text without sending a part number or overwriting a newer edit', () => {
  const outbound = boot({ categoryForm: true });
  outbound.input.value = 'Keep this optional draft';
  outbound.form.dispatch('submit', { preventDefault() {} });
  assert.equal(new URL(outbound.destinations.at(-1), 'https://supersmile-tech.com').searchParams.has('part_number'), false);
  const returned = boot({ categoryForm: true, historyState: outbound.history.state });
  assert.equal(returned.choice.checked, false);
  assert.equal(returned.input.value, 'Keep this optional draft');
  assert.equal(returned.field.hidden, true);
  assert.equal(returned.input.disabled, true);
  returned.pageShow();
  returned.choice.checked = true;
  returned.choice.dispatch('change');
  returned.input.value = 'New text entered after returning';
  returned.input.dispatch('input');
  returned.animationFrame();
  assert.equal(returned.input.value, 'New text entered after returning');
  assert.equal(returned.choice.checked, true);
  returned.input.value = '';
  returned.input.dispatch('input');
  returned.pageShow();
  returned.animationFrame();
  assert.equal(returned.input.value, '', 'an intentional new clear stays empty');
});

test('history drafts restore only their own category and leave unsupported prior state untouched', () => {
  const unrelated = { __ssCategoryInquiry_v1: { category: 'another-category', usePart: true, value: 'Wrong category' } };
  const ui = boot({ categoryForm: true, historyState: unrelated });
  ui.pageShow();
  ui.animationFrame();
  assert.equal(ui.choice.checked, false);
  assert.equal(ui.input.value, '');
  for (const state of ['another-app-state', ['another', 'app']]) {
    const existing = boot({ categoryForm: true, historyState: state });
    existing.form.dispatch('submit', { preventDefault() {} });
    assert.equal(existing.history.state, state);
    assert.equal(existing.historyReplacements.length, 0);
    assert.equal(existing.destinations.length, 1);
  }
});

test('contact prefill preserves edited messages, empty edits and restored drafts', () => {
  const search = '?category=custom-harness-01&part_number=123&lang=en';
  const existing = boot({ draft: 'Existing restored customer draft', search });
  existing.language('zh');
  assert.equal(existing.message.value, 'Existing restored customer draft');
  const edited = boot({ draft: '', search });
  edited.message.value = 'Please make 100 pieces with 1 m cable.';
  edited.message.dispatch('input');
  edited.language('zh');
  assert.equal(edited.message.value, 'Please make 100 pieces with 1 m cable.');
  const cleared = boot({ draft: '', search });
  cleared.message.value = '';
  cleared.message.dispatch('input');
  cleared.language('zh');
  assert.equal(cleared.message.value, '');
  const restoredLater = boot({ draft: '', search });
  restoredLater.message.value = 'Draft restored after initialization';
  restoredLater.language('zh');
  assert.equal(restoredLater.message.value, 'Draft restored after initialization');
});

test('contact pages without a part number are unchanged and raw query text stays plain text', () => {
  const untouched = boot({ draft: '', search: '?category=custom-harness-01&part_number=%20%20' });
  untouched.language('zh');
  assert.equal(untouched.message.value, '');
  const source = '<img src=x onerror=alert(1)> & a=b';
  const query = new URLSearchParams({ category: 'another-category', category_name: source, part_number: source });
  const unsafe = boot({ draft: '', search: '?' + query, lang: 'en' });
  assert.equal(unsafe.message.value, `Product category inquiry: ${source}\nModel / part number: ${source}`);
  assert.equal(unsafe.message.children.length, 0);
  const scope = { URLSearchParams };
  runInNewContext(script, scope);
  const long = scope.SS_CATEGORY_INQUIRY.contactPrefill(new URLSearchParams({ part_number: 'x'.repeat(800) }), 'en');
  assert.equal(long.split('Model / part number: ')[1].length, 500);
});

test('contact integration loads once after main and delayed initialization handles DOM readiness', () => {
  assert.equal((contactPage.match(/id="category-inquiry-script"/g) || []).length, 1);
  assert.match(contactPage, /<script id="category-inquiry-script" defer src="\/assets\/js\/category-inquiry\.js\?v=20261015-references-all1"><\/script>/);
  assert.ok(contactPage.indexOf('/assets/js/main.js') < contactPage.indexOf('/assets/js/category-inquiry.js'));
  const ui = boot({ readyState: 'loading', draft: '', search: '?category=custom-harness-01&part_number=123&lang=zh' });
  assert.equal(ui.message.value, '');
  ui.domReady();
  assert.match(ui.message.value, /型号 \/ 料号：123/);
  ui.api.init();
  assert.match(ui.message.value, /型号 \/ 料号：123/);
});
