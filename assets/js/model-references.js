(() => {
  'use strict';
  const section = document.getElementById('category-model-references');
  if (!section) return;
  const search = section.querySelector('#mr-search');
  const clear = section.querySelector('#mr-clear');
  const status = section.querySelector('#mr-search-status');
  const empty = section.querySelector('#mr-no-results');
  const entries = [...section.querySelectorAll('[data-mr-entry]')];
  const groups = [...section.querySelectorAll('.mr-group')];
  const jumpLinks = [...document.querySelectorAll('.mr-jump-link')];
  if (!search || !clear || !status) return;

  const supported = value => /^zh(?:-|$)/i.test(value || '') ? 'zh' : /^en(?:-|$)/i.test(value || '') ? 'en' : null;
  const requested = supported(new URLSearchParams(location.search).get('lang'));
  let language = requested || supported(document.documentElement.lang) || 'en';
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\-‐‑‒–—−_]+/g, '');
  const searchable = new Map(entries.map(entry => [entry, normalize(entry.getAttribute('data-mr-search') || entry.textContent)]));

  function filter() {
    const words = search.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    let visible = 0;
    entries.forEach(entry => {
      const matches = words.every(word => searchable.get(entry).includes(word));
      entry.hidden = !matches;
      if (matches) visible++;
    });
    groups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('[data-mr-entry]')].some(entry => !entry.hidden);
    });
    clear.disabled = !search.value;
    if (empty) empty.hidden = visible > 0;
    status.textContent = language === 'zh'
      ? (words.length ? `匹配 ${visible} / ${entries.length} 项参考` : `${entries.length} 项参考 · 可按品牌或料号搜索`)
      : (words.length ? `${visible} of ${entries.length} references match` : `${entries.length} references · Search by brand or part number`);
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
  localize();
})();
