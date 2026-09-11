(() => {
  const host = document.getElementById('lpm-content');
  if (!host) return;
  const root = '/assets/images/product-categories/stock/low-pressure-molding/';
  const files = {'process-boundary':'route-selection.jpg','insert-map':'insert-map.jpg','resin-system':'resin-system.jpg','material-preparation':'material-preparation.jpg','tooling-fixture':'tooling-fixture.jpg','flow-window':'flow-window.jpg','cable-interface':'cable-interface.jpg','validation':'validation.jpg'};
  const captions = {
    'process-boundary':['电路工艺板用于说明成型前应先定义裸件、外形与保留区域，并非本产品实物。','A circuit process panel illustrates defining the bare insert, outline and keep-out areas before molding; it is not our finished product.'],
    'insert-map':['显微检查场景用于说明敏感元件、禁压区与检查基准的识别。','Microscope inspection represents identification of sensitive components, no-load zones and inspection references.'],
    'resin-system':['聚酰胺粒料说明材料必须按确切牌号、批次和状态管理。','Polyamide pellets illustrate control by exact grade, lot and condition.'],
    'material-preparation':['电子组件作业场景对应上线前的清洁、状态确认与操作纪律。','Electronics work represents cleanliness, condition checks and handling discipline before molding.'],
    'tooling-fixture':['批量工装场景用于说明定位、重复性与受控接触，并非低压成型设备。','A production fixture illustrates location, repeatability and controlled contact; it is not low-pressure molding equipment.'],
    'flow-window':['数控设备用于说明受控路径与工艺窗口，并非低压成型机。','CNC equipment represents controlled paths and process windows; it is not a low-pressure molding machine.'],
    'cable-interface':['电缆接头近景说明出线界面、弯曲与密封几何需要一起定义。','A cable connector illustrates how exit interfaces, bending and sealing geometry must be defined together.'],
    'validation':['电子测试场景说明成型后的组件仍需进行电气与功能复核，不代表特定测试结果。','Electronics testing illustrates post-molding electrical and functional checks; it does not represent specific test results.']
  };
  const isZh = () => new URLSearchParams(location.search).get('lang') !== 'en';
  const pick = (value, zh) => typeof value === 'string' ? value : (value?.[zh ? 'zh' : 'en'] || '');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const photo = (topic, zh, eager = false) => `<figure class="lpm-photo"><img src="${root}${files[topic.id]}" alt="${esc(pick(topic.title, zh))}" ${eager ? '' : 'loading="lazy"'}><figcaption>${esc(captions[topic.id][zh ? 0 : 1])}</figcaption></figure>`;
  const story = (topic, zh, cls = '') => `<article class="lpm-story ${cls}">${photo(topic, zh)}<div class="lpm-copy"><h3>${esc(pick(topic.title, zh))}</h3><p>${esc(pick(topic.copy, zh))}</p></div></article>`;
  const head = (n, eyebrow, title) => `<header class="lpm-head"><span>${n}</span><div><p>${esc(eyebrow)}</p><h2>${esc(title)}</h2></div></header>`;

  async function render() {
    try {
      const zh = isZh();
      const res = await fetch('/content/product-category-drafts/low-pressure-molding.json', {cache:'no-store'});
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json(); const page = data.page; const t = page.chapters; const title = pick(page.displayTitle, zh);
      document.documentElement.lang = zh ? 'zh-CN' : 'en';
      document.title = zh ? '低压成型｜电子组件包封、线缆出线与工艺验证｜超斯迈尔' : 'Custom Low-Pressure Molding for Electronics & Cable Assemblies | Super Smile';
      document.querySelector('meta[name="description"]')?.setAttribute('content', zh ? '定制低压成型电子组件与线缆组件，覆盖聚酰胺热熔材料、嵌件布局、模具密封、浇口排气、线缆出线、应力释放及成型后验证。' : 'Custom low-pressure molding for electronics and cable assemblies, covering hot-melt resin, insert layout, tooling seals, gate and vent design, cable exits, strain relief and post-molding validation.');
      const ui = {home:zh?'首页':'Home',products:zh?'产品中心':'Products',group:zh?'特色电缆组件':'Specialty Cable Assemblies',kicker:zh?'产品小类 · 电子组件防护':'PRODUCT CATEGORY · ELECTRONICS PROTECTION',ask:zh?'咨询这一类产品':'Ask About This Product Type',back:zh?'返回产品中心':'Back to Products',closing:zh?'先定义嵌件，再塑造保护外壳。':'Define the insert before shaping the enclosure.',send:zh?'发送组件与工况资料':'Send Your Assembly Requirements'};
      const values = {'lpm-home':ui.home,'lpm-products':ui.products,'lpm-group':ui.group,'lpm-kicker':ui.kicker,'lpm-title':title,'lpm-subtitle':pick(page.subtitle,zh),'lpm-lead':pick(page.lead,zh),'lpm-cta':ui.ask,'lpm-back':ui.back,'lpm-closing-group':ui.group,'lpm-closing-title':ui.closing,'lpm-closing-cta':ui.send};
      Object.entries(values).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
      const href=`/contact?category=specialty-14&category_name=${encodeURIComponent(title)}`; document.getElementById('lpm-cta')?.setAttribute('href',href); document.getElementById('lpm-closing-cta')?.setAttribute('href',href);

      const opening=`<section class="lpm-opening"><div class="lpm-opening-copy"><span class="lpm-label">${zh?'一个外壳，三条边界':'ONE ENCLOSURE, THREE BOUNDARIES'}</span><h2>${zh?'低压成型先回答“保护什么”':'Low-pressure molding starts with what must be protected'}</h2><p>${esc(pick(data.intro,zh))}</p><p>${esc(pick(data.knowledge,zh))}</p></div><div class="lpm-boundaries"><div><b>01</b><h3>${zh?'保护边界':'Protection'}</h3><p>${zh?'覆盖、缓冲、阻隔与环境暴露。':'Coverage, cushioning, barriers and exposure.'}</p></div><div><b>02</b><h3>${zh?'接口边界':'Interfaces'}</h3><p>${zh?'接头、线缆出线、面板与对插面。':'Connectors, cable exits, panels and mating faces.'}</p></div><div><b>03</b><h3>${zh?'维护边界':'Service'}</h3><p>${zh?'可接近、可检查、可替换与装配顺序。':'Access, inspection, replacement and assembly order.'}</p></div></div></section>`;
      const index=`<nav class="lpm-index" aria-label="${zh?'页面章节':'Page chapters'}"><a href="#lpm-boundary"><b>01</b>${zh?'保护边界':'Protection boundary'}</a><a href="#lpm-material"><b>02</b>${zh?'材料准备':'Material readiness'}</a><a href="#lpm-tool"><b>03</b>${zh?'工装流动':'Tooling and flow'}</a><a href="#lpm-interface"><b>04</b>${zh?'接口验证':'Interface validation'}</a></nav>`;
      const boundary=`<section class="lpm-section lpm-boundary" id="lpm-boundary">${head('01',zh?'先决定防护路线，再讨论材料':'CHOOSE THE PROTECTION ROUTE BEFORE THE RESIN',zh?'成型边界与嵌件地图':'Molding Boundary and Insert Map')}<div class="lpm-boundary-grid">${story(t[0],zh,'lpm-feature')}${story(t[1],zh,'lpm-compact')}</div></section>`;
      const material=`<section class="lpm-section lpm-material" id="lpm-material">${head('02',zh?'同一种材料家族也可能有完全不同的加工窗口':'ONE MATERIAL FAMILY CAN CONTAIN VERY DIFFERENT PROCESS WINDOWS',zh?'树脂体系与上线准备':'Resin System and Material Readiness')}<div class="lpm-material-grid">${story(t[2],zh)}${story(t[3],zh)}</div></section>`;
      const tool=`<section class="lpm-section lpm-tool" id="lpm-tool">${head('03',zh?'模具既要闭合，也要保护嵌件':'THE TOOL MUST CLOSE WITHOUT LOADING THE INSERT',zh?'工装、浇口与流动窗口':'Tooling, Gates and Flow Window')}<div class="lpm-tool-grid">${story(t[4],zh)}${story(t[5],zh)}</div></section>`;
      const intr=`<section class="lpm-section lpm-interface" id="lpm-interface">${head('04',zh?'成型结束后，电气组件才真正开始接受验证':'VALIDATION STARTS AFTER THE MOLD OPENS',zh?'线缆出线、应力释放与组合验证':'Cable Exits, Strain Relief and Assembly Validation')}<div class="lpm-interface-grid">${story(t[6],zh)}${story(t[7],zh)}</div></section>`;
      const release=`<section class="lpm-section lpm-release">${head('05',zh?'用工程输入替代外观猜测':'REPLACE APPEARANCE-BASED ASSUMPTIONS WITH ENGINEERING INPUTS',zh?'报价、打样与放行资料':'Quotation, Sampling and Release Data')}<div class="lpm-release-grid"><div class="lpm-inputs"><ol>${page.inputs.map((item,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span>${esc(pick(item,zh))}</span></li>`).join('')}</ol><div class="lpm-release-note"><span class="lpm-label">${zh?'受控放行':'CONTROLLED RELEASE'}</span><p>${esc(pick(data.delivery,zh))}</p></div></div><div class="lpm-faq"><h3>${zh?'低压成型常见问题':'Low-Pressure Molding Questions'}</h3>${page.faq.map(item=>`<details><summary>${esc(pick(item.q,zh))}</summary><p>${esc(pick(item.a,zh))}</p></details>`).join('')}</div></div></section><details class="lpm-credits"><summary>${zh?'图片来源与技术依据':'Image sources and technical references'}</summary><p>${zh?'图片用于解释材料、设备接口与验证概念，不代表我司量产实物、现有设备、既有试验结果或认证。':'Images explain materials, equipment interfaces and validation concepts; they do not represent our production parts, equipment, completed tests or certification.'}</p><a href="${root}SOURCES.md">${zh?'查看来源与适用说明':'View sources and applicability notes'}</a></details>`;
      host.innerHTML=`<div class="lpm-page">${opening}${index}${boundary}${material}${tool}${intr}${release}</div>`;
    } catch (err) { host.innerHTML=`<p class="lpm-error">${isZh()?'内容暂时无法载入。':'Content could not load.'}</p>`; }
  }
  render();
})();
