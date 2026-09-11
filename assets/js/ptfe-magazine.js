(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;

  const path = '/assets/images/product-categories/stock/ptfe-termination/';
  const groups = [
    ['material', '材料识别', 'Material Identity', [0, 1, 2]],
    ['termination', '端接工艺', 'Termination Process', [3, 4, 5]],
    ['installation', '热区与安装', 'Thermal & Installation', [6, 7]],
    ['applications', '应用场景', 'Applications', [8, 9]],
    ['verification', '检验与放行', 'Verification & Release', [10, 11]]
  ];
  const captions = {
    material: ['含氟绝缘电缆截面用于说明材料名称之外仍需识别完整结构。', 'A fluoropolymer-insulated cable section illustrates why the complete construction matters beyond the material name.'],
    construction: ['电缆截面展示导体、介质与外层共同形成一项具体结构。', 'A cable section shows how conductor, dielectric and outer layers form a specific construction.'],
    conductor: ['热电偶线用于说明导体合金、镀层与极性均属于回路定义。', 'A thermocouple lead illustrates that conductor alloy, finish and polarity belong to the circuit definition.'],
    stripping: ['机械剥线实景强调切入深度与剥线长度必须受控。', 'Mechanical stripping highlights the need to control incision depth and strip length.'],
    crimping: ['压接工具照片用于说明端子、线材与模具必须成套验证。', 'Crimp tooling illustrates that terminal, wire and die must be validated as one combination.'],
    soldering: ['航天接头焊接实景用于说明热输入、导体处理与检验窗口。', 'Aerospace connector soldering illustrates heat input, conductor preparation and inspection control.'],
    routing: ['多通道热电偶布线展示路径、标识、支撑与设备边界的关系。', 'Multi-channel thermocouple wiring shows the relationship among routing, identification, support and equipment boundaries.'],
    thermal: ['梯度烘箱代表受控热暴露环境，不等同于任何具体线材认证。', 'A gradient oven represents controlled heat exposure, not certification of any particular wire.'],
    laboratory: ['实验室仪器环境用于说明通道身份、洁净与维护要求。', 'A laboratory instrument environment illustrates channel identity, cleanliness and service requirements.'],
    aerospace: ['精密计量设备作业强调受控文件、校准与可追溯记录。', 'Precision measurement work emphasizes controlled documents, calibration and traceable records.'],
    testing: ['连续性测试工具代表点对点回路检查，实际限值按项目定义。', 'A continuity tester represents point-to-point checks; actual limits remain project-specific.'],
    release: ['不同规格热缩管说明外观相似的材料也需要准确料号与工艺条件。', 'Different heat-shrink sizes show why visually similar materials still need exact part numbers and process conditions.']
  };

  const pick = (value, zh) => value?.[zh ? 'zh' : 'en'] || '';
  const esc = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));

  function photo(topic, zh) {
    const caption = captions[topic.id] || ['', ''];
    return `<figure class="pte-photo"><img src="${path}${topic.id}.jpg" alt="${esc(pick(topic.title, zh))}" width="1400" height="934" loading="lazy" decoding="async"><figcaption>${esc(caption[zh ? 0 : 1])}</figcaption></figure>`;
  }

  async function render() {
    try {
      const response = await fetch('/content/product-category-drafts/ptfe-cable-termination.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const page = data.page;
      const lang = new URLSearchParams(location.search).get('lang') || 'en';
      const zh = lang === 'zh' || lang === 'zh-CN';
      document.documentElement.lang = zh ? 'zh-CN' : 'en';

      const title = pick(page.displayTitle, zh);
      const heroTitle = zh ? 'PTFE\n电缆端接' : 'PTFE Cable\nTermination';
      const titleNode = document.getElementById('pcc-title');
      const introNode = document.getElementById('pcc-intro');
      const closingNode = document.getElementById('pcc-closing-title');
      const heroNode = document.getElementById('pcc-hero-image');
      if (titleNode) titleNode.textContent = heroTitle;
      if (introNode) introNode.textContent = pick(data.intro, zh);
      if (closingNode) closingNode.textContent = title;
      if (heroNode) heroNode.src = `${path}hero.jpg`;
      document.title = zh ? 'PTFE 电缆端接 | 耐高温线束、Type EE 与受控加工 | 超斯迈尔' : 'Custom PTFE Cable Termination | High-Temperature Wire Assemblies | Super Smile';

      const query = new URLSearchParams({category: 'specialty-03', category_name: title, lang: zh ? 'zh' : lang});
      ['pcc-cta', 'pcc-closing-cta'].forEach(id => {
        const link = document.getElementById(id);
        if (link) link.href = `/contact?${query.toString()}`;
      });

      const opening = `<section class="pte-opening">
        <div class="pte-opening-copy"><span>${zh ? '定义起点' : 'START WITH DEFINITION'}</span><h2>${esc(zh ? '先定义线材，再定义端接' : 'Define the wire before the termination')}</h2><p>${esc(pick(page.lead, zh))}</p></div>
        <figure class="pte-opening-photo"><img src="${path}opening.jpg" alt="${esc(zh ? '高可靠设备装配环境' : 'High-reliability equipment assembly environment')}" width="1600" height="1068" loading="lazy" decoding="async"><figcaption>${esc(zh ? '高可靠设备环境用于说明线材、端接、路径与文件必须作为一个系统审核。' : 'A high-reliability equipment environment shows why wire, termination, routing and documentation must be reviewed as one system.')}</figcaption></figure>
      </section>`;

      const nav = `<nav class="pte-contents" aria-label="${zh ? '本页目录' : 'On this page'}">${groups.map(([id, cn, en], index) => `<a href="#ptfe-${id}"><span>${String(index + 1).padStart(2, '0')}</span>${esc(zh ? cn : en)}</a>`).join('')}<a href="#ptfe-specification"><span>06</span>${zh ? '询价信息' : 'Specification Inputs'}</a><a href="#ptfe-faq"><span>07</span>${zh ? '常见问题' : 'FAQ'}</a></nav>`;

      const sections = groups.map(([id, cn, en, indices], groupIndex) => {
        const stories = indices.map(index => {
          const topic = page.chapters[index];
          return `<article class="pte-story pte-story-${topic.id}">${photo(topic, zh)}<div class="pte-copy"><h3>${esc(pick(topic.title, zh))}</h3><p>${esc(pick(topic.copy, zh))}</p></div></article>`;
        }).join('');
        return `<section class="pte-group pte-${id}" id="ptfe-${id}" aria-labelledby="ptfe-heading-${id}"><header class="pte-section-header"><span aria-hidden="true">${String(groupIndex + 1).padStart(2, '0')}</span><div><p>${zh ? 'PTFE 电缆端接工程' : 'PTFE CABLE TERMINATION ENGINEERING'}</p><h2 id="ptfe-heading-${id}">${esc(zh ? cn : en)}</h2></div></header><div class="pte-spread">${stories}</div></section>`;
      }).join('');

      const inputs = `<section class="pte-spec" id="ptfe-specification"><header class="pte-section-header"><span aria-hidden="true">06</span><div><p>${zh ? '生产前确认' : 'DEFINE BEFORE PRODUCTION'}</p><h2>${zh ? '询价与工程审核信息' : 'Quotation & Engineering Inputs'}</h2></div></header><ol>${page.inputs.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${esc(pick(item, zh))}</li>`).join('')}</ol></section>`;
      const faq = `<section class="pte-faq" id="ptfe-faq"><header class="pte-section-header"><span aria-hidden="true">07</span><div><p>${zh ? '采购与工程' : 'PURCHASING & ENGINEERING'}</p><h2>${zh ? 'PTFE 电缆端接常见问题' : 'PTFE Cable Termination Questions'}</h2></div></header><div>${page.faq.map(item => `<details><summary>${esc(pick(item.q, zh))}</summary><p>${esc(pick(item.a, zh))}</p></details>`).join('')}</div></section>`;
      const credits = `<details class="pte-credits"><summary>${zh ? '图片来源与技术依据' : 'Photo sources and technical references'}</summary><p>${zh ? '图片用于说明材料结构、端接工艺、热区、应用或检验概念，不代表超斯迈尔产品实拍、指定材料认证或项目验证结果。' : 'Images illustrate material structure, termination, thermal zones, applications or inspection concepts. They do not represent Super Smile product photography, specified material certification or project validation results.'}</p><a href="/assets/images/product-categories/stock/ptfe-termination/SOURCES.md" target="_blank" rel="noopener">${zh ? '查看图片许可与技术来源' : 'View photo licenses and technical sources'}</a></details>`;

      host.innerHTML = `<div class="pte-page">${opening}${nav}${sections}${inputs}${faq}${credits}</div>`;

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), {threshold: .15, rootMargin: '0px 0px -8%'});
      host.querySelectorAll('.pte-section-header,.pte-story').forEach(node => observer.observe(node));
    } catch (error) {
      host.innerHTML = `<p class="pte-error">${navigator.language.startsWith('zh') ? '页面内容暂时无法载入，请刷新重试。' : 'This page could not load. Please refresh and try again.'}</p>`;
    }
  }

  render();
  window.setTimeout(render, 1400);
  window.setTimeout(render, 3200);
})();
