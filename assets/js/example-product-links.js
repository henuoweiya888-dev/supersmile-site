(() => {
  'use strict';
  const links = [...document.querySelectorAll('.pcc-example-detail-link[data-product-detail-path]')];
  if (!links.length) return;
  function language() {
    const requested = new URLSearchParams(location.search).get('lang');
    if (requested === 'en' || requested === 'zh') return requested;
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'zh') return saved;
    } catch {}
    return document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  }
  function render() {
    const lang = language();
    const label = lang === 'zh' ? '查看产品详情' : 'View product details';
    links.forEach(link => {
      const path = link.dataset.productDetailPath;
      if (!/^\/products\/[a-z0-9-]+$/.test(path)) return;
      link.setAttribute('href', path + '?lang=' + lang);
      link.querySelector('[data-example-detail-label]').textContent = label;
      const card = link.closest('.pcc-gallery-item');
      const name = card?.dataset[lang === 'zh' ? 'nameZh' : 'nameEn'];
      link.setAttribute('aria-label', name ? label + (lang === 'zh' ? '：' : ': ') + name : label);
    });
  }
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();
