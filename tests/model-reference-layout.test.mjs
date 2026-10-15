import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync(new URL('../assets/js/model-references.js', import.meta.url), 'utf8');

function fixture(width = 1440) {
  const frames = new Map(), resizeObservers = [], mutationObservers = [], fontListeners = new Map();
  const viewListeners = new Map();
  let frameId = 0;
  const view = {
    innerWidth: width,
    requestAnimationFrame(fn) { frames.set(++frameId, fn); return frameId; },
    addEventListener(type, fn) { viewListeners.set(type, fn); },
    ResizeObserver: class {
      constructor(fn) { this.fn = fn; resizeObservers.push(this); }
      observe(target) { this.target = target; }
    },
  };
  class Element {
    constructor(attrs = {}, children = [], text = '') {
      this.attrs = { ...attrs }; this.children = children; this.text = text;
      this.listeners = new Map(); this.style = { minHeight: '', marginTop: '' };
      this.value = ''; this.focused = false;
    }
    getAttribute(name) { return this.attrs[name] ?? null; }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    hasAttribute(name) { return name in this.attrs; }
    get hidden() { return this.hasAttribute('hidden'); }
    set hidden(value) { if (value) this.attrs.hidden = ''; else delete this.attrs.hidden; }
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(value) { if (value) this.attrs.disabled = ''; else delete this.attrs.disabled; }
    get lang() { return this.attrs.lang || ''; }
    set lang(value) { this.attrs.lang = value; }
    get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this.text = String(value); this.children = []; }
    descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
    querySelectorAll(selector) {
      const match = (node, one) => {
        if (one.startsWith('#')) return node.getAttribute('id') === one.slice(1);
        if (one.startsWith('.')) return (node.getAttribute('class') || '').split(/\s+/).includes(one.slice(1));
        const attrs = [...one.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)];
        assert.equal(attrs.map(attr => attr[0]).join(''), one, `Unsupported fixture selector ${one}`);
        return attrs.every(([, name, value]) => value === undefined ? node.hasAttribute(name) : node.getAttribute(name) === value);
      };
      return this.descendants().filter(node => selector.split(',').some(one => match(node, one.trim())));
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    addEventListener(type, fn) { this.listeners.set(type, fn); }
    fire(type, event = {}) { this.listeners.get(type)?.(event); }
    focus() { this.focused = true; }
    scrollIntoView() {}
    getBoundingClientRect() {
      const natural = typeof this.naturalHeight === 'function' ? this.naturalHeight() : this.naturalHeight || 0;
      return { top: (this.naturalTop || 0) + (parseFloat(this.style.marginTop) || 0),
        height: Math.max(natural, parseFloat(this.style.minHeight) || 0), width: view.innerWidth };
    }
  }
  const input = new Element({ id: 'mr-search' });
  const clear = new Element({ id: 'mr-clear', 'data-mr-en': 'Clear', 'data-mr-zh': '清除' });
  const status = new Element({ id: 'mr-search-status' });
  const empty = new Element({ id: 'mr-no-results', 'data-mr-en': 'None', 'data-mr-zh': '无匹配' });
  const groupStates = [40, 42].map((count, groupIndex) => {
    const rows = Array.from({ length: count }, (_, index) => {
      const id = `${groupIndex ? 'M' : 'P'}-${String(index).padStart(3, '0')}`;
      const row = new Element({ 'data-mr-entry': '', 'data-mr-search': `${id} shared brand` }, [], id);
      row.naturalHeight = () => 48 + ((index * 17 + groupIndex * 31) % 79)
        + (html.lang === 'zh' ? 4 : 0) + (view.innerWidth < 1200 ? 13 : 0);
      return row;
    });
    const list = new Element({ class: 'mr-list' }, rows);
    list.naturalTop = 160 + groupIndex * 19;
    const previous = new Element({ 'data-mr-page': 'previous' });
    const next = new Element({ 'data-mr-page': 'next' });
    const pageStatus = new Element({ class: 'mr-page-status' });
    const pagination = new Element({ class: 'mr-pagination', hidden: '' }, [previous, pageStatus, next]);
    const group = new Element({ class: 'mr-group' }, [pagination, list]);
    return { group, list, rows, previous, next, pageStatus };
  });
  const layout = new Element({ class: 'mr-groups' }, groupStates.map(state => state.group));
  const section = new Element({ id: 'category-model-references' }, [input, clear, status, empty, layout]);
  const html = new Element({ lang: 'en' }, [section]);
  const document = {
    documentElement: html,
    getElementById: id => html.querySelector('#' + id),
    querySelectorAll: selector => html.querySelectorAll(selector),
    fonts: { addEventListener(type, fn) { fontListeners.set(type, fn); } },
  };
  vm.runInNewContext(script, {
    document, window: view, location: { search: '' }, URLSearchParams,
    MutationObserver: class {
      constructor(fn) { mutationObservers.push(fn); }
      observe() {}
    },
  }, { filename: 'model-references.js' });
  const flush = () => {
    assert.ok(frames.size <= 1, 'One coalesced layout measurement is sufficient');
    const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn());
    assert.equal(frames.size, 0, 'Measuring and setting heights must not schedule itself');
  };
  const resize = newWidth => { view.innerWidth = newWidth; viewListeners.get('resize')?.(); flush(); };
  const language = value => { html.lang = value; mutationObservers.forEach(fn => fn()); flush(); };
  const query = value => { input.value = value; input.fire('input'); flush(); };
  const visible = state => state.rows.filter(row => !row.hidden);
  return { html, view, groupStates, frames, resizeObservers, fontListeners, input, clear, status,
    flush, resize, language, query, visible };
}

function assertAligned(state, columns) {
  const lists = state.groupStates.map(group => state.visible(group));
  assert.deepEqual(lists.map(list => list.length), [20, 20]);
  assert.equal(state.groupStates[0].list.getBoundingClientRect().top, state.groupStates[1].list.getBoundingClientRect().top);
  for (let index = 0; index < 20; index += columns) {
    const row = lists.flatMap(list => list.slice(index, index + columns));
    const expected = Math.max(...row.map(entry => entry.naturalHeight()));
    assert.ok(row.every(entry => entry.getBoundingClientRect().height === expected), `Natural maximum at row ${index / columns}`);
  }
}

test('side-by-side lists align corresponding rows and their starts without truncating natural heights', () => {
  const state = fixture(); state.flush();
  assertAligned(state, 2);
  const oldPage = state.visible(state.groupStates[0]);
  state.groupStates[0].next.fire('click'); state.flush();
  assert.equal(state.visible(state.groupStates[0])[0], state.groupStates[0].rows[20]);
  assert.equal(state.visible(state.groupStates[1])[0], state.groupStates[1].rows[0]);
  assert.ok(oldPage.every(entry => entry.hidden && entry.style.minHeight === ''));
  assertAligned(state, 2);
  state.language('zh'); assertAligned(state, 2);
  assert.match(state.groupStates[0].pageStatus.textContent, /第 2 \/ 2 页/);
  state.resize(1000); assertAligned(state, 1);
});

test('stacked or single-result lists recover natural sizing; filtering keeps all pages searchable', () => {
  const state = fixture(); state.flush();
  state.resize(390);
  assert.ok(state.groupStates.every(group => group.list.style.marginTop === ''
    && group.rows.every(row => row.style.minHeight === '')));
  state.resize(1440); assertAligned(state, 2);
  state.query('M041');
  assert.equal(state.groupStates[0].group.hidden, true);
  assert.equal(state.visible(state.groupStates[1])[0], state.groupStates[1].rows[41]);
  assert.match(state.status.textContent, /1 of 82/);
  assert.ok(state.groupStates.every(group => group.list.style.marginTop === ''
    && group.rows.every(row => row.style.minHeight === '')));
  state.clear.fire('click'); state.flush();
  assert.ok(state.input.focused); assertAligned(state, 2);
});

test('width, fonts and language can trigger measurement while height-only observer notifications cannot loop', () => {
  const state = fixture(); state.flush();
  assert.equal(state.resizeObservers.length, 1);
  const observer = state.resizeObservers[0];
  observer.fn([{ contentRect: { width: 1300, height: 1500 } }]); state.flush();
  observer.fn([{ contentRect: { width: 1300, height: 1600 } }]);
  assert.equal(state.frames.size, 0);
  observer.fn([{ contentRect: { width: 1200, height: 1600 } }]);
  assert.equal(state.frames.size, 1); state.flush();
  state.fontListeners.get('loadingdone')(); state.fontListeners.get('loadingdone')();
  assert.equal(state.frames.size, 1); state.flush();
  state.language('zh'); assertAligned(state, 2);
});
