/* Binder editorial rebuild: preserve source copy, media, anchors and language data. */
(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;

  const chapters = [
    ['interfaces', '连接器系列', 'Connector Families', [0, 1, 2, 3, 4, 5]],
    ['workmanship', '材料与制造工艺', 'Materials & Workmanship', [6]],
    ['solutions', '连接解决方案', 'Connection Solutions', [7, 8, 9]],
    ['materials', '连接器用料', 'Connector Materials', [10, 11, 12, 13]],
    ['protection', '防尘与防潮设计', 'Dust & Moisture Protection', [14, 15]],
    ['applications', '行业与应用', 'Industries & Applications', [16, 17, 18, 19, 20]],
    ['quality', '可靠性与选型优势', 'Reliability & Selection Benefits', [21, 22, 23]],
    ['specification', '定制配置与长度', 'Custom Configurations & Lengths', [24, 25, 26, 27, 28]]
  ];

  const objectPhotos = new Set([0, 2, 5, 15, 21, 22, 24, 26]);
  let resizeObserver;
  let imageFrame;
  let revealObserver;

  function fitPhotos(page) {
    resizeObserver?.disconnect();
    cancelAnimationFrame(imageFrame);
    const resize = () => {
      cancelAnimationFrame(imageFrame);
      imageFrame = requestAnimationFrame(() => {
        if (!page.isConnected) return;
        page.querySelectorAll('.bm-story').forEach(story => {
          const copy = story.querySelector('.te-copy');
          if (!copy) return;
          const copyHeight = copy.getBoundingClientRect().height;
          const section = story.closest('.bm-group');
          const ceiling = section?.classList.contains('bm-interfaces') ? 250 : 310;
          const floor = matchMedia('(max-width: 767px)').matches ? 150 : 138;
          const height = Math.max(floor, Math.min(ceiling, copyHeight * 1.3));
          story.style.setProperty('--bm-image-height', `${Math.round(height)}px`);
        });
        const opening = page.querySelector('.te-opening');
        const openingCopy = opening?.firstElementChild;
        if (opening && openingCopy) {
          const height = Math.min(300, Math.max(185, openingCopy.getBoundingClientRect().height * .82));
          opening.style.setProperty('--bm-image-height', `${Math.round(height)}px`);
        }
      });
    };
    resizeObserver = new ResizeObserver(resize);
    page.querySelectorAll('.te-copy, .te-opening > div').forEach(copy => resizeObserver.observe(copy));
    document.fonts.ready.then(resize);
    resize();
  }

  function enableSectionMotion(page) {
    revealObserver?.disconnect();
    const headers = [...page.querySelectorAll('.bm-section-header')];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      headers.forEach(header => header.classList.add('is-visible'));
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .22 });
    headers.forEach(header => revealObserver.observe(header));
  }

  function compose() {
    const source = host.querySelector('.te-theme-binder-installation');
    if (!source) return;
    const articles = [...source.querySelectorAll('.te-topic')];
    if (articles.length !== 29) return;
    const isChinese = document.documentElement.lang.toLowerCase().startsWith('zh');
    const opening = source.querySelector('.te-opening');
    const faq = source.querySelector('.pcc-rich-faq');
    const credits = source.querySelector('.pcc-media-credits');
    if (!opening || !faq || !credits) return;

    opening.querySelector('.te-guide')?.remove();
    opening.classList.add('bm-opening');
    const fragment = document.createDocumentFragment();
    fragment.append(opening);

    const nav = document.createElement('nav');
    nav.className = 'bm-contents';
    nav.setAttribute('aria-label', isChinese ? '本页目录' : 'On this page');
    fragment.append(nav);

    chapters.forEach(([id, cn, en, indices], chapterIndex) => {
      const section = document.createElement('section');
      section.className = `bm-group bm-${id}`;
      section.id = `binder-${id}`;
      const heading = document.createElement('h2');
      heading.className = 'bm-heading';
      heading.id = `binder-heading-${id}`;
      heading.textContent = isChinese ? cn : en;
      section.setAttribute('aria-labelledby', heading.id);
      const number = document.createElement('span');
      number.className = 'bm-chapter-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(chapterIndex + 1).padStart(2, '0');
      const header = document.createElement('header');
      header.className = 'bm-section-header';
      header.append(number, heading);

      const spread = document.createElement('div');
      spread.className = 'bm-spread';
      indices.forEach((topicIndex, position) => {
        const article = articles.find(item => item.id === `technical-topic-${topicIndex}`);
        if (!article) return;
        article.className = `te-topic bm-story bm-story-${position + 1}`;
        const photo = article.querySelector('.te-photo');
        photo?.classList.toggle('bm-object-photo', objectPhotos.has(topicIndex));
        article.querySelector('.te-index')?.remove();
        const oldTitle = article.querySelector('h2');
        if (oldTitle) {
          const title = document.createElement('h3');
          title.innerHTML = oldTitle.innerHTML;
          oldTitle.replaceWith(title);
        }
        spread.append(article);
      });

      section.append(header, spread);
      fragment.append(section);
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.innerHTML = `<span>${String(chapterIndex + 1).padStart(2, '0')}</span>${isChinese ? cn : en}`;
      nav.append(link);
    });

    fragment.append(faq, credits);
    source.classList.remove('te-theme-binder-installation');
    source.classList.add('bm-page');
    source.replaceChildren(fragment);
    fitPhotos(source);
    enableSectionMotion(source);
  }

  new MutationObserver(compose).observe(host, { childList: true, subtree: true });
  compose();
})();
