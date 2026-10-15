(function (scope) {
  'use strict';

  // Old bookmarks did not carry both category names; new links are data-driven.
  const legacyCategoryNames = { 'custom-harness-01': { en: 'Industrial Equipment Harness', zh: '工业设备线束' } };
  const languageOf = value => /^zh(?:-|$)/i.test(value || '') ? 'zh' : 'en';
  const partNumberOf = value => String(value || '').trim().slice(0, 500);
  const historyKey = '__ssCategoryInquiry_v1';

  function buildInquiryUrl({ category = '', categoryName = '', categoryNames = {}, route = '', lang = 'en', usePart = false, partNumber = '' }) {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (categoryName) query.set('category_name', categoryName);
    for (const language of ['en', 'zh']) if (categoryNames[language]) query.set(`category_name_${language}`, String(categoryNames[language]).slice(0, 160));
    if (route) query.set('source_page', route);
    query.set('lang', languageOf(lang));
    const part = usePart ? partNumberOf(partNumber) : '';
    if (part) query.set('part_number', part);
    return '/contact?' + query.toString();
  }

  function contactPrefill(query, lang) {
    const part = partNumberOf(query.get('part_number'));
    if (!part && !query.get('category_name_en') && !query.get('category_name_zh')) return '';
    const language = languageOf(lang);
    const category = query.get(`category_name_${language}`) || legacyCategoryNames[query.get('category')]?.[language] || query.get('category_name') || query.get('category') || (language === 'zh' ? '定制与采购需求' : 'Custom Manufacturing & Sourcing');
    return language === 'zh'
      ? `咨询产品类别：${category}${part ? `\n型号 / 料号：${part}` : ''}`
      : `Product category inquiry: ${category}${part ? `\nModel / part number: ${part}` : ''}`;
  }

  let initialized = false;
  function init() {
    const document = scope.document;
    if (!document || initialized) return;
    initialized = true;
    const query = new URLSearchParams(scope.location?.search || '');
    let language = query.has('lang') ? languageOf(query.get('lang')) : languageOf(document.documentElement.lang);
    const section = document.querySelector('#manufacturing-context[data-unified-inquiry]');
    const form = section?.querySelector('#category-inquiry-form');
    const choice = section?.querySelector('#ci-use-part');
    const field = section?.querySelector('#ci-part-field');
    const input = section?.querySelector('#ci-part-number');
    const message = document.getElementById('cf-msg');
    const canPrefill = Boolean(message && (partNumberOf(query.get('part_number')) || query.get('category_name_en') || query.get('category_name_zh')));
    let preserveDraft = Boolean(canPrefill && message.value);
    let edited = false;
    let automaticMessage = null;
    let inquiryEdited = false;

    function restoreInquiry() {
      const saved = scope.history?.state?.[historyKey];
      if (inquiryEdited || !form || !choice || !input || !saved || saved.category !== form.dataset.category || typeof saved.usePart !== 'boolean' || typeof saved.value !== 'string') return;
      // An existing different value can be a restored or freshly entered draft.
      if (input.value && input.value !== saved.value) return;
      choice.checked = saved.usePart;
      input.value = saved.value.slice(0, 500);
    }

    function saveInquiry() {
      if (!scope.history?.replaceState) return;
      const current = scope.history.state;
      // Do not replace an unrelated application's primitive or array history state.
      if (current !== null && current !== undefined && (typeof current !== 'object' || Array.isArray(current))) return;
      try {
        scope.history.replaceState({
          ...(current || {}),
          [historyKey]: { category: form.dataset.category, usePart: choice.checked, value: input.value.slice(0, 500) }
        }, '');
        inquiryEdited = false;
      } catch {
        // A blocked history update must not prevent the contact-page navigation.
      }
    }

    function updatePartField(focus) {
      if (!choice || !field || !input) return;
      field.hidden = !choice.checked;
      input.disabled = !choice.checked;
      choice.setAttribute('aria-expanded', String(choice.checked));
      if (focus && choice.checked) input.focus();
    }

    function localizeCategory() {
      if (!section) return;
      section.querySelectorAll('[data-ci-en][data-ci-zh]').forEach(element => {
        const copy = element.getAttribute(`data-ci-${language}`);
        if (copy === null) return;
        if (element.tagName === 'INPUT' && element.type === 'hidden') element.value = copy;
        else if (!element.children.length) element.textContent = copy;
      });
      section.querySelectorAll('[data-ci-placeholder-en][data-ci-placeholder-zh]').forEach(element => {
        element.setAttribute('placeholder', element.getAttribute(`data-ci-placeholder-${language}`));
      });
      const languageField = form?.querySelector('input[name="lang"]');
      if (languageField) languageField.value = language;
    }

    function prefillContact() {
      if (!canPrefill || preserveDraft || edited) return;
      if (automaticMessage !== null && message.value !== automaticMessage) {
        preserveDraft = true;
        return;
      }
      const copy = contactPrefill(query, language);
      message.value = copy;
      automaticMessage = copy;
    }

    if (form && choice && field && input) {
      choice.addEventListener('change', () => {
        inquiryEdited = true;
        updatePartField(true);
      });
      input.addEventListener('input', () => { inquiryEdited = true; });
      form.addEventListener('submit', event => {
        event.preventDefault();
        const nameField = form.querySelector('#ci-category-name');
        const categoryNames = {
          en: nameField?.getAttribute('data-ci-en') || legacyCategoryNames[form.dataset.category]?.en || '',
          zh: nameField?.getAttribute('data-ci-zh') || legacyCategoryNames[form.dataset.category]?.zh || ''
        };
        const categoryName = nameField?.value || categoryNames[language];
        saveInquiry();
        scope.location.assign(buildInquiryUrl({
          category: form.dataset.category,
          categoryName,
          categoryNames,
          route: form.dataset.route,
          lang: language,
          usePart: choice.checked,
          partNumber: input.value
        }));
      });
      restoreInquiry();
      updatePartField(false);
      scope.addEventListener?.('pageshow', () => {
        restoreInquiry();
        updatePartField(false);
        // History restoration can update form controls after pageshow listeners run.
        scope.requestAnimationFrame?.(() => {
          restoreInquiry();
          updatePartField(false);
        });
      });
    }
    if (canPrefill) message.addEventListener('input', () => { edited = true; });
    localizeCategory();
    prefillContact();
    if (scope.MutationObserver && (section || canPrefill)) {
      new scope.MutationObserver(() => {
        const selected = languageOf(document.documentElement.lang);
        if (selected === language) return;
        language = selected;
        localizeCategory();
        prefillContact();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  scope.SS_CATEGORY_INQUIRY = { buildInquiryUrl, contactPrefill, init };
  if (scope.document) {
    if (scope.document.readyState === 'loading') scope.document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
  }
})(typeof window === 'undefined' ? globalThis : window);
