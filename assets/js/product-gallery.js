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
    hi: ['लोकप्रिय उत्पादों की तस्वीरें', 'पिछली तस्वीरें', 'अगली तस्वीरें', 'उत्पादों की तस्वीरें', 'तस्वीर बंद करें', 'तस्वीर देखें: '],
    es: ['Fotos de productos populares', 'Fotos anteriores', 'Fotos siguientes', 'Fotos de productos, desplazar horizontalmente', 'Cerrar fotografía', 'Ver fotografía: '],
    fr: ['Photos de produits populaires', 'Photos précédentes', 'Photos suivantes', 'Photos de produits, défilement horizontal', 'Fermer la photo', 'Voir la photo : '],
    ar: ['صور المنتجات الشائعة', 'الصور السابقة', 'الصور التالية', 'صور المنتجات، تمرير أفقي', 'إغلاق الصورة', 'عرض الصورة: '],
    bn: ['জনপ্রিয় পণ্যের ছবি', 'আগের ছবি', 'পরের ছবি', 'পণ্যের ছবি', 'ছবি বন্ধ করুন', 'ছবি দেখুন: '],
    pt: ['Fotos de produtos populares', 'Fotos anteriores', 'Fotos seguintes', 'Fotos de produtos, rolagem horizontal', 'Fechar foto', 'Ver foto: '],
    ru: ['Фото популярных изделий', 'Предыдущие фотографии', 'Следующие фотографии', 'Фотографии изделий, горизонтальная прокрутка', 'Закрыть фотографию', 'Посмотреть фотографию: '],
    ur: ['مقبول مصنوعات کی تصاویر', 'پچھلی تصاویر', 'اگلی تصاویر', 'مصنوعات کی تصاویر', 'تصویر بند کریں', 'تصویر دیکھیں: '],
    id: ['Foto Produk Populer', 'Foto sebelumnya', 'Foto berikutnya', 'Foto produk, gulir horizontal', 'Tutup foto', 'Lihat foto: '],
    de: ['Fotos beliebter Produkte', 'Vorherige Produktfotos', 'Nächste Produktfotos', 'Produktfotos, horizontal scrollen', 'Foto schließen', 'Foto ansehen: '],
    ja: ['人気製品の実物写真', '前の製品写真', '次の製品写真', '製品写真、横方向にスクロール', '写真を閉じる', '写真を見る：'],
    tr: ['Popüler Ürün Fotoğrafları', 'Önceki fotoğraflar', 'Sonraki fotoğraflar', 'Ürün fotoğrafları, yatay kaydırın', 'Fotoğrafı kapat', 'Fotoğrafı görüntüle: '],
    vi: ['Ảnh sản phẩm nổi bật', 'Ảnh trước', 'Ảnh tiếp theo', 'Ảnh sản phẩm, cuộn ngang', 'Đóng ảnh', 'Xem ảnh: '],
    ko: ['인기 제품 실물 사진', '이전 제품 사진', '다음 제품 사진', '제품 사진, 가로 스크롤', '사진 닫기', '사진 보기: '],
    it: ['Foto dei prodotti più richiesti', 'Foto precedenti', 'Foto successive', 'Foto dei prodotti, scorrimento orizzontale', 'Chiudi foto', 'Visualizza foto: '],
    nl: ['Foto’s van populaire producten', 'Vorige productfoto’s', 'Volgende productfoto’s', 'Productfoto’s, horizontaal scrollen', 'Foto sluiten', 'Foto bekijken: '],
    pl: ['Zdjęcia popularnych produktów', 'Poprzednie zdjęcia', 'Następne zdjęcia', 'Zdjęcia produktów, przewijanie poziome', 'Zamknij zdjęcie', 'Zobacz zdjęcie: '],
    th: ['ภาพถ่ายสินค้ายอดนิยม', 'ภาพก่อนหน้า', 'ภาพถัดไป', 'ภาพสินค้า เลื่อนแนวนอน', 'ปิดภาพ', 'ดูภาพ: ']
  };
  const language = () => (new URLSearchParams(location.search).get('lang') || document.documentElement.lang).toLowerCase().split('-')[0];
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
      item.querySelector('button').setAttribute('aria-label', strings[5] + name);
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
  items.forEach(item => item.querySelector('button').addEventListener('click', event => {
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
