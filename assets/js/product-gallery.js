(() => {
  const gallery = document.querySelector('.pcc-gallery');
  if (!gallery) return;
  const track = gallery.querySelector('.pcc-gallery-track');
  const previous = gallery.querySelector('[data-gallery-direction="previous"]');
  const next = gallery.querySelector('[data-gallery-direction="next"]');
  const count = gallery.querySelector('.pcc-gallery-count');
  const items = [...track.querySelectorAll('.pcc-gallery-item')];
  const dialog = document.querySelector('.pcc-photo-dialog');
  const close = dialog.querySelector('.pcc-dialog-close');
  const image = dialog.querySelector('.pcc-dialog-image');
  const title = dialog.querySelector('.pcc-dialog-title');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let openedBy = null;
  const copy = {
    en: ['Popular Product Photos', 'Previous product photographs', 'Next product photographs', 'Product photographs, scroll horizontally', 'Close photograph', 'View photograph: '],
    zh: ['热门产品实拍', '上一组产品图片', '下一组产品图片', '产品实物图片，可左右滚动', '关闭大图', '查看大图：'],
  };
  const language = () => String(new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'en').toLowerCase().split('-')[0] === 'zh' ? 'zh' : 'en';
  const chinese = () => language() === 'zh';
  const rtl = () => getComputedStyle(track).direction === 'rtl';
  function setDialogTitle(item) {
    const name = item.dataset[chinese() ? 'nameZh' : 'nameEn'];
    title.textContent = [item.dataset.model, name].filter(Boolean).join(' · ');
    image.alt = name;
  }
  function localize() {
    const strings = copy[language()] || copy.en;
    gallery.querySelector('h2').textContent = strings[0];
    items.forEach(item => {
      const name = item.dataset[chinese() ? 'nameZh' : 'nameEn'];
      item.querySelector('.pcc-gallery-name-text').textContent = name;
      item.querySelector('img').alt = name;
      const control = item.querySelector('.pcc-gallery-photo');
      control.setAttribute('aria-label', (control.dataset.productDetailPath ? (chinese() ? '查看产品详情：' : 'View product details: ') : strings[5]) + name);
    });
    previous.setAttribute('aria-label', strings[1]);
    next.setAttribute('aria-label', strings[2]);
    previous.textContent = rtl() ? '→' : '←';
    next.textContent = rtl() ? '←' : '→';
    track.setAttribute('aria-label', strings[3]);
    close.setAttribute('aria-label', strings[4]);
    if (dialog.open && openedBy) setDialogTitle(openedBy.closest('.pcc-gallery-item'));
    update();
  }
  function step() {
    return items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).gap) || 0);
  }
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    const position = Math.abs(track.scrollLeft);
    previous.disabled = position < 3;
    next.disabled = position >= max - 3;
    const index = Math.min(items.length, Math.round(position / step()) + 1);
    count.textContent = `${String(index).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }
  function move(direction) {
    const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const visible = Math.max(1, Math.floor((track.clientWidth - 2 * padding) / step()));
    track.scrollBy({left: direction * step() * visible * (rtl() ? -1 : 1), behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive: true});
  window.addEventListener('resize', update);
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move((event.key === 'ArrowRight' ? 1 : -1) * (rtl() ? -1 : 1));
    }
  });
  items.filter(item => item.querySelector('button.pcc-gallery-photo')).forEach(item => item.querySelector('button.pcc-gallery-photo').addEventListener('click', event => {
    openedBy = event.currentTarget;
    image.src = item.dataset.fullImage || item.querySelector('img').src;
    setDialogTitle(item);
    dialog.showModal();
    close.focus();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (openedBy) openedBy.focus({preventScroll: true}); });
  new MutationObserver(localize).observe(document.documentElement, {attributes: true, attributeFilter: ['lang', 'dir']});
  localize();
})();
