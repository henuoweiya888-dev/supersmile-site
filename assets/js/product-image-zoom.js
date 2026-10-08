/* Full-size photos open only when requested; displayed images stay optimized. */
(() => {
  document.querySelectorAll('.pd-img a[data-original-src]').forEach(link => {
    const image = link.querySelector('img');
    if (!image) return;
    const update = () => {
      const source = new URL(image.getAttribute('src'), location.href);
      const preview = new URL(link.dataset.previewSrc, location.href);
      if (source.origin !== location.origin || !source.pathname.startsWith('/assets/images/products/')) return;
      link.href = source.pathname === preview.pathname
        ? link.dataset.originalSrc
        : source.pathname + source.search + source.hash;
      const chinese = /^zh(?:-|$)/i.test(document.documentElement.lang);
      const label = chinese ? '查看原尺寸产品照片（在新标签页打开）' : 'View full-size product photo (opens in a new tab)';
      link.setAttribute('aria-label', label);
      link.title = label;
    };
    update();
    new MutationObserver(update).observe(image, { attributes: true, attributeFilter: ['src'] });
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    // Keep a just-selected thumbnail correct even before the observer callback.
    link.addEventListener('click', update);
  });
})();
