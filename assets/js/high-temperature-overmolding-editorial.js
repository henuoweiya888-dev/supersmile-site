(() => {
  const host = document.getElementById('ht-content');
  if (!host) return;

  const root = '/assets/images/product-categories/stock/high-temperature-overmolding/';
  const files = {
    'thermal-map': 'thermal-mapping.jpg',
    materials: 'polymer-compound.jpg',
    compatibility: 'surface-preparation.jpg',
    preparation: 'drying-preheat.jpg',
    tooling: 'tooling-control.jpg',
    geometry: 'strain-relief-geometry.jpg',
    sealing: 'sealing-interface.jpg',
    validation: 'validation.jpg'
  };
  const captions = {
    'thermal-map': ['热像设备用于说明温区识别；并非本产品实测报告。', 'Thermal imaging illustrates zone mapping; it is not a product test report.'],
    materials: ['注塑粒料用于说明材料牌号、批次与预处理需要受控。', 'Molding pellets illustrate controlled grades, lots and conditioning.'],
    compatibility: ['工业表面处理场景对应清洁度与界面准备，不代表本厂具体工序。', 'Industrial surface preparation represents cleanliness and interface control, not a specific factory process.'],
    preparation: ['实验室烘箱用于说明干燥与预热概念；实际参数由材料数据与验证确定。', 'A laboratory oven illustrates drying and preheating; material data and validation define actual settings.'],
    tooling: ['加工设备对应模腔、浇口、排气与嵌件定位的工装控制。', 'Machining represents tooling control of cavities, gates, venting and insert location.'],
    geometry: ['带弯曲保护的电缆接头说明载荷应从刚性端接处逐步过渡。', 'Cable glands with bend protection illustrate gradual load transfer from rigid terminations.'],
    sealing: ['密封圈说明压缩量、界面状态和安装几何共同决定密封。', 'O-rings illustrate how compression, interfaces and installation geometry work together.'],
    validation: ['实验室设备用于说明受控验证；不代表已完成特定标准认证。', 'Laboratory equipment represents controlled validation, not completed certification.']
  };

  const isZh = () => new URLSearchParams(location.search).get('lang') !== 'en';
  const pick = (value, zh) => typeof value === 'string' ? value : (value?.[zh ? 'zh' : 'en'] || '');
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const photo = (topic, zh) => `
    <figure class="ht-photo">
      <img src="${root}${files[topic.id]}" alt="${esc(pick(topic.title, zh))}" loading="lazy">
      <figcaption>${esc(captions[topic.id][zh ? 0 : 1])}</figcaption>
    </figure>`;
  const story = (topic, zh, extra = '') => `
    <article class="ht-story ${extra}">
      ${photo(topic, zh)}
      <div class="ht-copy"><h3>${esc(pick(topic.title, zh))}</h3><p>${esc(pick(topic.copy, zh))}</p></div>
    </article>`;
  const head = (number, eyebrow, title) => `
    <header class="ht-head"><span>${number}</span><div><p>${esc(eyebrow)}</p><h2>${esc(title)}</h2></div></header>`;

  async function render() {
    try {
      const zh = isZh();
      const response = await fetch('/content/product-category-drafts/high-temperature-overmolding.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      const page = data.page;
      const topics = page.chapters;
      const title = pick(page.displayTitle, zh);

      document.documentElement.lang = zh ? 'zh-CN' : 'en';
      document.title = zh
        ? '高温包覆成型电缆组件｜高温注塑、嵌件成型与热循环验证｜超斯迈尔'
        : 'Custom High-Temperature Overmolded Cable Assembly | Insert Molding | Super Smile';
      document.querySelector('meta[name="description"]')?.setAttribute('content', zh
        ? '定制高温包覆成型电缆组件，覆盖硅胶与高温热塑料、嵌件成型、材料相容性、应力释放、密封、热老化与冷热循环验证。'
        : 'Custom high-temperature overmolded cable assemblies covering silicone and high-temperature thermoplastics, insert compatibility, strain relief, sealing, heat aging and thermal cycling.');

      const text = {
        home: zh ? '首页' : 'Home', products: zh ? '产品中心' : 'Products', group: zh ? '特色电缆组件' : 'Specialty Cable Assemblies',
        kicker: zh ? '产品小类 · 热界面工程' : 'PRODUCT CATEGORY · THERMAL INTERFACE ENGINEERING',
        ask: zh ? '咨询这一类产品' : 'Ask About This Product Type', back: zh ? '返回产品中心' : 'Back to Products',
        closing: zh ? '先定义温度，再选择材料。' : 'Define the heat before selecting the material.',
        send: zh ? '发送温度谱与项目资料' : 'Send the Thermal Profile'
      };
      const values = {
        'ht-home': text.home, 'ht-products': text.products, 'ht-group': text.group, 'ht-kicker': text.kicker,
        'ht-title': title, 'ht-subtitle': pick(page.subtitle, zh), 'ht-lead': pick(page.lead, zh),
        'ht-cta': text.ask, 'ht-back': text.back, 'ht-closing-group': text.group,
        'ht-closing-title': text.closing, 'ht-closing-cta': text.send
      };
      Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
      const contactHref = `/contact?category=specialty-13&category_name=${encodeURIComponent(title)}`;
      document.getElementById('ht-cta')?.setAttribute('href', contactHref);
      document.getElementById('ht-closing-cta')?.setAttribute('href', contactHref);

      const opening = `
        <section class="ht-opening">
          <div><span class="ht-opening-label">${zh ? '一个温度数字不够' : 'ONE TEMPERATURE NUMBER IS NOT ENOUGH'}</span><h2>${zh ? '高温包覆不是一种材料选择' : 'High-temperature overmolding is not one material choice'}</h2><p>${esc(pick(data.intro, zh))}</p><p>${esc(pick(data.knowledge, zh))}</p></div>
          <div class="ht-thermal-strip">
            <div><b>01</b><span>${zh ? '持续工作与电流温升' : 'Continuous duty + current rise'}</span></div>
            <div><b>02</b><span>${zh ? '短时峰值与冷热循环' : 'Short peaks + thermal cycling'}</span></div>
            <div><b>03</b><span>${zh ? '成型与固化工艺热量' : 'Molding + curing process heat'}</span></div>
          </div>
        </section>`;
      const rail = `
        <nav class="ht-index" aria-label="${zh ? '页面章节' : 'Page chapters'}">
          <a href="#ht-thermal"><b>01</b>${zh ? '温度与材料' : 'Heat + materials'}</a>
          <a href="#ht-process"><b>02</b>${zh ? '界面与预处理' : 'Interfaces + preparation'}</a>
          <a href="#ht-tooling"><b>03</b>${zh ? '工装与几何' : 'Tooling + geometry'}</a>
          <a href="#ht-evidence"><b>04</b>${zh ? '密封与证据' : 'Sealing + evidence'}</a>
        </nav>`;
      const thermal = `
        <section class="ht-section ht-thermal" id="ht-thermal">
          ${head('01', zh ? '先画温度地图，再比较材料窗口' : 'MAP THE HEAT BEFORE COMPARING MATERIAL WINDOWS', zh ? '温度谱与聚合物体系' : 'Thermal Profile and Polymer System')}
          <div class="ht-thermal-grid">${story(topics[0], zh)}${story(topics[1], zh)}</div>
        </section>`;
      const process = `
        <section class="ht-section ht-process" id="ht-process">
          ${head('02', zh ? '粘接从旧表面开始' : 'ADHESION STARTS AT THE EXISTING SURFACE', zh ? '材料界面、清洁与预处理' : 'Material Interfaces, Cleanliness and Conditioning')}
          <div class="ht-process-grid">${story(topics[2], zh)}${story(topics[3], zh)}</div>
        </section>`;
      const tooling = `
        <section class="ht-section ht-tooling" id="ht-tooling">
          ${head('03', zh ? '让熔体流动，也让载荷逐级离开端接点' : 'CONTROL THE FLOW AND TRANSFER LOAD AWAY FROM THE TERMINATION', zh ? '模具流动与应力释放几何' : 'Tool Flow and Strain-Relief Geometry')}
          <div class="ht-tool-grid">${story(topics[4], zh)}${story(topics[5], zh)}</div>
        </section>`;
      const evidence = `
        <section class="ht-section ht-evidence" id="ht-evidence">
          ${head('04', zh ? '密封结论属于完整组件' : 'SEALING EVIDENCE BELONGS TO THE COMPLETE ASSEMBLY', zh ? '界面密封与组合验证' : 'Interface Sealing and Combined Validation')}
          <div class="ht-evidence-grid">${story(topics[6], zh)}${story(topics[7], zh)}</div>
        </section>`;
      const release = `
        <section class="ht-section ht-release" id="ht-release">
          ${head('05', zh ? '报价前先补齐工程输入' : 'COMPLETE THE ENGINEERING INPUTS BEFORE QUOTATION', zh ? '从热需求到受控放行' : 'From Thermal Requirements to Controlled Release')}
          <div class="ht-release-grid">
            <div class="ht-inputs"><ol>${page.inputs.map((item, index) => `<li><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(pick(item, zh))}</span></li>`).join('')}</ol><div class="ht-release-note"><span class="ht-note-label">${zh ? '放行记录' : 'RELEASE RECORD'}</span><p>${esc(pick(data.delivery, zh))}</p></div></div>
            <div class="ht-faq"><h3>${zh ? '高温包覆成型常见问题' : 'High-Temperature Overmolding Questions'}</h3>${page.faq.map(item => `<details><summary>${esc(pick(item.q, zh))}</summary><p>${esc(pick(item.a, zh))}</p></details>`).join('')}</div>
          </div>
        </section>
        <details class="ht-credits"><summary>${zh ? '图片来源与技术依据' : 'Image sources and technical references'}</summary><p>${zh ? '图片用于解释材料、工艺与验证概念，不代表我司量产实物、既有试验结果或认证。' : 'Images explain materials, process and validation concepts; they do not represent our production parts, completed tests or certification.'}</p><a href="${root}SOURCES.md">${zh ? '查看来源与适用说明' : 'View sources and applicability notes'}</a></details>`;

      host.innerHTML = `<div class="ht-page">${opening}${rail}${thermal}${process}${tooling}${evidence}${release}</div>`;
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), {threshold: 0.08, rootMargin: '0px 0px -30px'});
      host.querySelectorAll('.ht-head,.ht-story,.ht-inputs,.ht-faq details').forEach(node => observer.observe(node));
    } catch (error) {
      host.innerHTML = `<p class="ht-error">${isZh() ? '内容暂时无法载入。' : 'Content could not load.'}</p>`;
    }
  }

  render();
})();
