/* Progressive enhancement: photographs remain readable without JavaScript. */
(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'te-image-dialog';
  dialog.setAttribute('aria-label', 'Photo detail / 图片详情');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'te-image-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close / 关闭');
  const photo = document.createElement('img');
  const caption = document.createElement('p');
  dialog.append(close, photo, caption);
  document.body.append(dialog);
  let previousOverflow = '';
  function enhance() {
    host.querySelectorAll('.te-photo > img').forEach(img => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'te-photo-open';
      button.setAttribute('aria-label', `View photo / 查看图片: ${img.alt}`);
      img.before(button);
      button.append(img);
      button.addEventListener('click', () => {
        photo.src = img.currentSrc || img.src;
        photo.alt = img.alt;
        caption.textContent = img.closest('figure').querySelector('figcaption')?.textContent || img.alt;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
      });
    });
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  new MutationObserver(enhance).observe(host, {childList:true, subtree:true});
  enhance();
})();
