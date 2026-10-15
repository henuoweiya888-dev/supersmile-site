(() => {
  'use strict';
  const section = document.getElementById('category-model-references');
  if (!section) return;
  const search = section.querySelector('#mr-search');
  const clear = section.querySelector('#mr-clear');
  const status = section.querySelector('#mr-search-status');
  const empty = section.querySelector('#mr-no-results');
  const entries = [...section.querySelectorAll('[data-mr-entry]')];
  const groups = [...section.querySelectorAll('.mr-group')].map(group => {
    const pagination = group.querySelector('.mr-pagination');
    const previous = pagination?.querySelector('[data-mr-page="previous"]');
    const next = pagination?.querySelector('[data-mr-page="next"]');
    const items = [...group.querySelectorAll('[data-mr-entry]')];
    return { group, pagination, previous, next, items, list: group.querySelector('.mr-list'), matches: items, page: 1,
      pageSize: previous && next ? 20 : Infinity,
      pageStatus: pagination?.querySelector('.mr-page-status') };
  });
  const jumpLinks = [...document.querySelectorAll('.mr-jump-link')];
  if (!search || !clear || !status) return;

  const supported = value => /^zh(?:-|$)/i.test(value || '') ? 'zh' : /^en(?:-|$)/i.test(value || '') ? 'en' : null;
  const requested = supported(new URLSearchParams(location.search).get('lang'));
  let language = requested || supported(document.documentElement.lang) || 'en';
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\-‐‑‒–—−_]+/g, '');
  const searchable = new Map(entries.map(entry => [entry, normalize(entry.getAttribute('data-mr-search') || entry.textContent)]));
  let lastQuery = null;
  const view = typeof window === 'object' ? window : null;
  const alignedEntries = new Set();
  const alignedLists = new Set();
  let alignmentFrame = 0;

  function alignRows() {
    alignmentFrame = 0;
    alignedEntries.forEach(entry => { entry.style.minHeight = ''; });
    alignedLists.forEach(list => { list.style.marginTop = ''; });
    alignedEntries.clear();
    alignedLists.clear();
    // The two indexes share row rules only while they sit side by side.
    // Measure their natural content first so long identifiers remain uncut.
    const visibleGroups = groups.filter(state => !state.group.hidden && state.list?.getBoundingClientRect);
    if (!view || view.innerWidth <= 760 || visibleGroups.length !== 2) return;
    const columns = view.innerWidth >= 1200 ? 2 : 1;
    const visibleEntries = visibleGroups.map(state => state.items.filter(entry => !entry.hidden));
    const listTops = visibleGroups.map(state => state.list.getBoundingClientRect().top);
    const listTop = Math.max(...listTops);
    const rows = Array.from({ length: Math.ceil(Math.max(...visibleEntries.map(items => items.length)) / columns) }, (_, index) => {
      const items = visibleEntries.flatMap(list => list.slice(index * columns, (index + 1) * columns));
      return { items, height: Math.max(...items.map(entry => entry.getBoundingClientRect().height)) };
    });
    // Different title or pagination wrapping must not offset the first row.
    visibleGroups.forEach((state, index) => {
      const offset = Math.ceil((listTop - listTops[index]) * 100) / 100;
      if (offset > 0) {
        state.list.style.marginTop = `${offset}px`;
        alignedLists.add(state.list);
      }
    });
    rows.forEach(({ items, height }) => {
      const minHeight = `${Math.ceil(height * 100) / 100}px`;
      items.forEach(entry => {
        entry.style.minHeight = minHeight;
        alignedEntries.add(entry);
      });
    });
  }

  function scheduleAlignment() {
    if (!view?.requestAnimationFrame || alignmentFrame) return;
    alignmentFrame = view.requestAnimationFrame(alignRows);
  }

  function renderGroup(state) {
    const count = state.matches.length;
    const pages = state.pageSize === Infinity ? 1 : Math.max(1, Math.ceil(count / state.pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    const start = state.pageSize === Infinity ? 0 : (state.page - 1) * state.pageSize;
    state.items.forEach(entry => { entry.hidden = true; });
    state.matches.slice(start, start + state.pageSize).forEach(entry => { entry.hidden = false; });
    state.group.hidden = count === 0;
    if (state.pagination) state.pagination.hidden = count <= state.pageSize;
    if (state.previous) state.previous.disabled = state.page === 1;
    if (state.next) state.next.disabled = state.page === pages;
    if (state.pageStatus) state.pageStatus.textContent = language === 'zh'
      ? `第 ${state.page} / ${pages} 页 · ${count} 项`
      : `Page ${state.page} of ${pages} · ${count} items`;
    scheduleAlignment();
  }

  function filter() {
    const words = search.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    const queryChanged = search.value !== lastQuery;
    lastQuery = search.value;
    let matched = 0;
    groups.forEach(state => {
      if (queryChanged) state.page = 1;
      state.matches = state.items.filter(entry => words.every(word => searchable.get(entry).includes(word)));
      matched += state.matches.length;
      renderGroup(state);
    });
    clear.disabled = !search.value;
    if (empty) empty.hidden = matched > 0;
    status.textContent = language === 'zh'
      ? (words.length ? `匹配 ${matched} / ${entries.length} 项参考` : `${entries.length} 项参考 · 可按品牌或料号搜索`)
      : (words.length ? `${matched} of ${entries.length} references match` : `${entries.length} references · Search by brand or part number`);
  }

  function localize() {
    const nodes = [...section.querySelectorAll('[data-mr-en][data-mr-zh]'), ...jumpLinks];
    nodes.forEach(element => {
      const copy = element.getAttribute(`data-mr-${language}`);
      if (copy !== null && !element.children.length) element.textContent = copy;
    });
    section.querySelectorAll('[data-mr-placeholder-en], [data-mr-placeholder-zh]').forEach(element => {
      const copy = element.getAttribute(`data-mr-placeholder-${language}`);
      if (copy !== null) element.setAttribute('placeholder', copy);
    });
    [...section.querySelectorAll('[data-mr-aria-en], [data-mr-aria-zh]'), ...jumpLinks].forEach(element => {
      const copy = element.getAttribute(`data-mr-aria-${language}`);
      if (copy !== null) element.setAttribute('aria-label', copy);
    });
    if (empty && !empty.hasAttribute(`data-mr-${language}`)) {
      empty.textContent = language === 'zh'
        ? '未找到匹配项，请尝试品牌、完整料号或已列出的别名。'
        : 'No matching references. Try a brand, full part number or a listed alias.';
    }
    filter();
  }

  groups.forEach(state => {
    for (const [button, step] of [[state.previous, -1], [state.next, 1]]) {
      button?.addEventListener('click', () => {
        state.page += step;
        renderGroup(state);
        state.group.scrollIntoView?.({ block: 'start', behavior: 'auto' });
      });
    }
  });
  search.addEventListener('input', filter);
  search.addEventListener('search', filter);
  clear.addEventListener('click', () => {
    search.value = '';
    filter();
    search.focus();
  });
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && search.value) {
      search.value = '';
      filter();
    }
  });
  new MutationObserver(() => {
    const selected = supported(document.documentElement.lang);
    if (selected && selected !== language) {
      language = selected;
      localize();
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  view?.addEventListener('resize', scheduleAlignment, { passive: true });
  const groupLayout = section.querySelector('.mr-groups');
  if (view?.ResizeObserver && groupLayout) {
    let observedWidth = -1;
    new view.ResizeObserver(changes => {
      const width = changes[0]?.contentRect.width;
      // Our row heights change the container height; only width should retrigger
      // measurement, otherwise ResizeObserver would create a layout loop.
      if (Number.isFinite(width) && Math.abs(width - observedWidth) > 0.5) {
        observedWidth = width;
        scheduleAlignment();
      }
    }).observe(groupLayout);
  }
  document.fonts?.ready?.then(scheduleAlignment, () => {});
  document.fonts?.addEventListener?.('loadingdone', scheduleAlignment);
  localize();
})();
