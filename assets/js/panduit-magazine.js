(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;
  const base = '/assets/images/product-categories/stock/panduit/';
  const groupOrder = ['components', 'manufacturing', 'protection'];
  const esc = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
  const captions = {
    terminals: ['端子实物用于说明压接筒、导体与工具必须成套核对。', 'A wired terminal illustrates why barrel, conductor and tool must be reviewed as a system.'],
    ties: ['不同长度与结构的扎带不能只按颜色或外观替换。', 'Cable ties of different size and construction cannot be substituted by appearance alone.'],
    labels: ['柜内线号展示标识与回路、孔位和维修路径的关联。', 'Cabinet wire labels connect identification with circuits, cavities and service routes.'],
    protection: ['波纹保护管展示路径防磨与弯曲空间，而非指定品牌规格。', 'Corrugated conduit illustrates route protection and bend space, not a specified brand part.'],
    'harness-board': ['成形线束展示分支长度与接口方向需要实体制造基准。', 'A formed harness shows why branch length and interface direction need physical manufacturing datums.'],
    tension: ['扎带锁齿截面说明安装张力最终作用在很小的接触区域。', 'A tie-lock cross-section shows how installation force acts through a small contact region.'],
    'crimp-tool': ['压接工具实物说明工具闭合并不等于端子、模具与线径正确匹配。', 'A hand crimper shows that tool closure alone does not prove a correct terminal, die and wire match.'],
    cleats: ['线夹展示电缆重量、支撑间距与安装表面之间的关系。', 'Cable cleats illustrate the relationship between cable mass, support spacing and mounting surface.'],
    'heat-shrink': ['热缩管系列用于说明收缩比、壁厚、胶层与工作温度需要分别定义。', 'Heat-shrink tubing illustrates that recovery ratio, wall, adhesive and temperature need separate definition.']
  };

  async function render() {
    const response = await fetch('/content/product-category-drafts/panduit-compatible.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const page = data.page;
    const lang = new URLSearchParams(location.search).get('lang') || 'en';
    const zh = lang === 'zh';
    const pick = value => value?.[zh ? 'zh' : 'en'] || '';
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    const title = pick(page.displayTitle);
    const heroTitle = zh ? 'Panduit\n兼容线束组件' : 'Panduit-Compatible\nHarness Components';
    const syncHeader = () => {
      const values = { 'pcc-title': heroTitle, 'pcc-intro': pick(data.intro), 'pcc-closing-title': title };
      Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node && node.textContent !== value) node.textContent = value; });
      const hero = document.getElementById('pcc-hero-image');
      if (hero && !hero.src.endsWith('/panduit/hero.jpg')) hero.src = `${base}hero.jpg`;
      const query = new URLSearchParams({category: data.key, category_name: title, lang: zh ? 'zh' : 'en'});
      ['pcc-cta', 'pcc-closing-cta'].forEach(id => { const link = document.getElementById(id); if (link) link.href = `/contact?${query}`; });
      document.title = zh ? 'Panduit 兼容线束组件 | 端子、扎带、标识与布线 | 超斯迈尔' : 'Custom Panduit-Compatible Harnesses | Terminals, Ties & Routing | Super Smile';
    };
    syncHeader();
    const syncObserver = new MutationObserver(syncHeader);
    ['pcc-title', 'pcc-intro', 'pcc-closing-title', 'pcc-hero-image'].forEach(id => { const node = document.getElementById(id); if (node) syncObserver.observe(node, id === 'pcc-hero-image' ? {attributes:true, attributeFilter:['src']} : {subtree:true, childList:true, characterData:true}); });
    window.setTimeout(() => syncObserver.disconnect(), 2800);
    window.setTimeout(syncHeader, 3000);

    const topicMarkup = topic => `<article class="pa-topic pa-topic-${esc(topic.id)}"><figure><img src="${base}${esc(topic.image)}" alt="${esc(pick(topic.title))}" width="1600" height="1100" loading="lazy" decoding="async"><figcaption>${esc(captions[topic.id]?.[zh ? 0 : 1] || '')}</figcaption></figure><div><h3>${esc(pick(topic.title))}</h3><p>${esc(pick(topic.copy))}</p></div></article>`;
    const groups = groupOrder.map((group, index) => `<section class="pa-group pa-${group}" id="panduit-${group}"><header class="pa-heading"><span>${String(index + 2).padStart(2, '0')}</span><h2>${esc(pick(page.headings[group]))}</h2></header><div class="pa-grid">${page.topics.filter(topic => topic.group === group).map(topicMarkup).join('')}</div></section>`).join('');
    const specification = `<section class="pa-spec" id="panduit-specification"><header class="pa-heading"><span>05</span><h2>${esc(pick(page.headings.specification))}</h2></header><ol>${page.specification.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${esc(pick(item))}</p></li>`).join('')}</ol></section>`;
    const faq = `<section class="pa-faq"><header class="pa-heading"><span>06</span><h2>${esc(pick(page.headings.faq))}</h2></header><div>${page.faq.map((item, index) => `<details${index === 0 ? ' open' : ''}><summary>${esc(pick(item.q))}</summary><p>${esc(pick(item.a))}</p></details>`).join('')}</div></section>`;
    host.innerHTML = `<div class="pa-page"><section class="pa-opening"><div><span>01 / COMPONENT SYSTEM</span><h2>${esc(pick(page.headings.introduction))}</h2><p>${esc(pick(page.lead))}</p><nav><a href="#panduit-components">${esc(pick(page.headings.components))}</a><a href="#panduit-manufacturing">${esc(pick(page.headings.manufacturing))}</a><a href="#panduit-protection">${esc(pick(page.headings.protection))}</a></nav></div><figure><img src="${base}opening.jpg" alt="${esc(zh ? '通信机柜中的布线和线缆管理' : 'Cabling and cable management in a communications rack')}" width="1280" height="960" loading="lazy" decoding="async"><figcaption>${esc(zh ? '机柜布线说明端接、标识、弯曲半径和维修通道必须作为整体审核。' : 'Rack cabling shows why termination, identification, bend radius and service access are reviewed together.')}</figcaption></figure></section>${groups}${specification}${faq}<details class="pa-sources"><summary>${zh ? '图片来源与使用说明' : 'Photo sources and use notes'}</summary><p>${zh ? '图片用于说明部件、工艺和安装环境，不代表超斯迈尔产品实拍或 Panduit 授权。' : 'Images illustrate components, processes and installation environments; they do not represent Super Smile products or Panduit authorization.'}</p><a href="/assets/images/product-categories/stock/panduit/SOURCES.md" target="_blank" rel="noopener">${zh ? '查看来源与许可记录' : 'View source and license record'}</a></details></div>`;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), {threshold:.14, rootMargin:'0px 0px -8%'});
      host.querySelectorAll('.pa-heading, .pa-topic').forEach(node => observer.observe(node));
    } else host.querySelectorAll('.pa-heading, .pa-topic').forEach(node => node.classList.add('is-visible'));
  }
  const run = () => render().catch(() => { host.innerHTML = '<p class="pa-error">Page content could not load. Please refresh and try again.</p>'; });
  run();
  window.setTimeout(run, 1600);
})();
