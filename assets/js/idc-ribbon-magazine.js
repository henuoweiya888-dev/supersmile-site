(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;

  const imagePath = '/assets/images/product-categories/stock/idc-ribbon/';
  const captions = {
    interface: ['IDC 插座与扁平排线实拍用于说明接口、排线与方向需要共同定义。', 'An IDC socket and flat cable illustrate why interface, cable and orientation must be defined together.'],
    pitch: ['高密度 ATA 排线近景说明导体中心距不能仅凭接头外观判断。', 'A high-density ATA ribbon close-up shows why conductor spacing cannot be inferred from connector appearance.'],
    polarity: ['彩色排线有助于回路识别，但色序本身不构成针脚定义。', 'Color-coded ribbon helps circuit identification, but the color sequence is not a pinout.'],
    mapping: ['电子模块与排线接口用于说明板间映射和方向关系。', 'An electronic module and ribbon interface illustrate board-to-board mapping and orientation.'],
    termination: ['IDC 接点近景用于说明线材、槽口与压盖形成完整端接系统。', 'An IDC contact close-up illustrates the cable, slot and cover as one termination system.'],
    tooling: ['端接与测试工具实拍强调专用定位、支撑和过程检查。', 'Termination and test tools emphasize dedicated location, support and process inspection.'],
    'strain-relief': ['穿过应力释放盖的排线展示端接区附近的载荷管理。', 'Ribbon routed through a strain-relief cover shows load management near the termination zone.'],
    routing: ['设备内部排线实景说明长度、折叠与检修空间需要一起规划。', 'Ribbon inside equipment shows why length, folds and service access must be planned together.'],
    applications: ['实验室设备代表多通道内部连接场景，并非特定产品认证。', 'Laboratory equipment represents a multi-circuit internal connection context, not product certification.'],
    equipment: ['医疗电子设备电路板用于说明项目边界和受控证据的重要性。', 'A medical electronic device board illustrates project boundaries and controlled evidence.'],
    testing: ['线缆测试仪代表逐点导通、开路与短路检查。', 'A cable tester represents point-to-point continuity, open and short checks.'],
    release: ['细间距接头近景说明外观相似并不等于可以互换。', 'A fine-pitch connector close-up shows why visual similarity does not establish interchangeability.']
  };

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
  const pick = (value, zh) => value?.[zh ? 'zh' : 'en'] || '';

  function photo(topic, zh, loading = 'lazy') {
    const caption = captions[topic.id] || ['', ''];
    return `<figure class="idc-photo"><img src="${imagePath}${topic.id}.jpg" alt="${escapeHtml(pick(topic.title, zh))}" width="1400" height="930" loading="${loading}" decoding="async"><figcaption>${escapeHtml(caption[zh ? 0 : 1])}</figcaption></figure>`;
  }

  function story(topic, zh, modifier = '') {
    return `<article class="idc-story ${modifier}">${photo(topic, zh)}<div class="idc-copy"><h3>${escapeHtml(pick(topic.title, zh))}</h3><p>${escapeHtml(pick(topic.copy, zh))}</p></div></article>`;
  }

  async function render() {
    try {
      const response = await fetch('/content/product-category-drafts/idc-ribbon-cable-assembly.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const page = data.page;
      const requestedLanguage = new URLSearchParams(location.search).get('lang') || 'en';
      const zh = requestedLanguage === 'zh' || requestedLanguage === 'zh-CN';
      const title = pick(page.displayTitle, zh);
      document.documentElement.lang = zh ? 'zh-CN' : 'en';
      document.title = zh ? 'IDC 扁平排线组件 | 1.27mm、2.54mm 与受控压接 | 超斯迈尔' : 'Custom IDC Ribbon Cable Assembly | Controlled Mass Termination | Super Smile';

      const titleNode = document.getElementById('pcc-title');
      const introNode = document.getElementById('pcc-intro');
      const heroNode = document.getElementById('pcc-hero-image');
      const closingNode = document.getElementById('pcc-closing-title');
      if (titleNode) titleNode.textContent = zh ? 'IDC\n扁平排线组件' : 'IDC Ribbon\nCable Assembly';
      if (introNode) introNode.textContent = pick(data.intro, zh);
      if (heroNode) heroNode.src = `${imagePath}hero.jpg`;
      if (closingNode) closingNode.textContent = title;

      const contactQuery = new URLSearchParams({category: 'specialty-04', category_name: title, lang: zh ? 'zh' : requestedLanguage});
      ['pcc-cta', 'pcc-closing-cta'].forEach(id => {
        const link = document.getElementById(id);
        if (link) link.href = `/contact?${contactQuery.toString()}`;
      });

      const topic = page.chapters;
      const sectionHeader = (number, overlineZh, overlineEn, titleZh, titleEn) => `<header class="idc-section-header"><span>${number}</span><div><p>${escapeHtml(zh ? overlineZh : overlineEn)}</p><h2>${escapeHtml(zh ? titleZh : titleEn)}</h2></div></header>`;

      const opening = `<section class="idc-opening"><figure><img src="${imagePath}opening.jpg" alt="${escapeHtml(zh ? '带极性边标识的扁平排线' : 'Flat ribbon cable with polarity edge marking')}" width="1280" height="960" loading="lazy" decoding="async"><figcaption>${escapeHtml(zh ? '成卷灰色排线的彩色边线用于识别基准导体，但仍需配合针脚表。' : 'The colored edge on gray ribbon cable identifies a reference conductor, but still requires a pin map.')}</figcaption></figure><div><span>${zh ? '定义原则' : 'DEFINITION PRINCIPLE'}</span><h2>${escapeHtml(zh ? '不是“压上去”，而是建立可重复接口' : 'Not merely pressed together—a repeatable interface')}</h2><p>${escapeHtml(pick(page.lead, zh))}</p><dl><div><dt>${zh ? '几何' : 'GEOMETRY'}</dt><dd>${zh ? '节距、位数、方向' : 'Pitch, count, orientation'}</dd></div><div><dt>${zh ? '工艺' : 'PROCESS'}</dt><dd>${zh ? '工装、压合、支撑' : 'Tooling, seating, support'}</dd></div><div><dt>${zh ? '证据' : 'EVIDENCE'}</dt><dd>${zh ? '外观、导通、版本' : 'Visual, continuity, revision'}</dd></div></dl></div></section>`;

      const contents = `<nav class="idc-contents" aria-label="${zh ? '本页目录' : 'On this page'}"><a href="#idc-definition"><span>01</span>${zh ? '接口定义' : 'Interface Definition'}</a><a href="#idc-process"><span>02</span>${zh ? '端接工艺' : 'Termination Process'}</a><a href="#idc-routing"><span>03</span>${zh ? '路径规划' : 'Routing'}</a><a href="#idc-applications"><span>04</span>${zh ? '应用边界' : 'Applications'}</a><a href="#idc-verification"><span>05</span>${zh ? '检验放行' : 'Verification'}</a><a href="#idc-specification"><span>06</span>${zh ? '询价信息' : 'Inputs'}</a><a href="#idc-faq"><span>07</span>${zh ? '常见问题' : 'FAQ'}</a></nav>`;

      const definition = `<section class="idc-group idc-definition" id="idc-definition">${sectionHeader('01', '先消除方向歧义', 'REMOVE ORIENTATION AMBIGUITY FIRST', '接口定义', 'Interface Definition')}<div class="idc-definition-lead">${story(topic[0], zh, 'idc-story-lead')}</div><div class="idc-definition-grid">${[1,2,3].map(index => story(topic[index], zh)).join('')}</div></section>`;

      const process = `<section class="idc-group idc-process" id="idc-process">${sectionHeader('02', '三项工艺必须成套', 'THREE CONTROLS WORK AS ONE', '批量端接工艺', 'Mass Termination Process')}<div class="idc-process-grid">${[4,5,6].map((index, order) => `<article class="idc-process-stage"><span>0${order + 1}</span>${photo(topic[index], zh)}<div class="idc-copy"><h3>${escapeHtml(pick(topic[index].title, zh))}</h3><p>${escapeHtml(pick(topic[index].copy, zh))}</p></div></article>`).join('')}</div></section>`;

      const routing = `<section class="idc-group idc-routing" id="idc-routing">${sectionHeader('03', '让平面几何适应真实设备', 'FIT FLAT GEOMETRY TO REAL EQUIPMENT', '布线与折叠', 'Routing & Folding')}<article>${photo(topic[7], zh)}<div class="idc-copy"><span>${zh ? '安装专题' : 'INSTALLATION FEATURE'}</span><h3>${escapeHtml(pick(topic[7].title, zh))}</h3><p>${escapeHtml(pick(topic[7].copy, zh))}</p></div></article></section>`;

      const applications = `<section class="idc-group idc-applications" id="idc-applications">${sectionHeader('04', '应用名称不能代替技术条件', 'APPLICATION NAMES DO NOT REPLACE REQUIREMENTS', '设备应用与项目边界', 'Equipment Applications & Project Boundaries')}<div class="idc-application-grid">${[8,9].map(index => story(topic[index], zh)).join('')}</div></section>`;

      const verification = `<section class="idc-group idc-verification" id="idc-verification">${sectionHeader('05', '从首件到重复批次', 'FROM FIRST ARTICLE TO REPEAT LOTS', '检验与受控放行', 'Inspection & Controlled Release')}<div class="idc-verification-grid">${[10,11].map(index => story(topic[index], zh)).join('')}</div></section>`;

      const inputs = `<section class="idc-spec" id="idc-specification">${sectionHeader('06', '生产前确认', 'DEFINE BEFORE PRODUCTION', '询价与工程审核信息', 'Quotation & Engineering Inputs')}<ol>${page.inputs.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(pick(item, zh))}</li>`).join('')}</ol></section>`;

      const faq = `<section class="idc-faq" id="idc-faq">${sectionHeader('07', '采购与工程', 'PURCHASING & ENGINEERING', 'IDC 排线常见问题', 'IDC Ribbon Cable Questions')}<div>${page.faq.map(item => `<details><summary>${escapeHtml(pick(item.q, zh))}</summary><p>${escapeHtml(pick(item.a, zh))}</p></details>`).join('')}</div></section>`;

      const credits = `<details class="idc-credits"><summary>${zh ? '图片来源与技术依据' : 'Photo sources and technical references'}</summary><p>${zh ? '图片用于说明接口、材料、工艺、安装、应用或检验概念，不代表超斯迈尔产品实拍、指定零件认证或项目验证结果。' : 'Images illustrate interface, material, process, installation, application or inspection concepts. They do not represent Super Smile product photography, specified component certification or project validation results.'}</p><a href="/assets/images/product-categories/stock/idc-ribbon/SOURCES.md" target="_blank" rel="noopener">${zh ? '查看图片许可与技术来源' : 'View photo licenses and technical sources'}</a></details>`;

      host.innerHTML = `<div class="idc-page">${opening}${contents}${definition}${process}${routing}${applications}${verification}${inputs}${faq}${credits}</div>`;

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), {threshold: .12, rootMargin: '0px 0px -7%'});
      host.querySelectorAll('.idc-section-header,.idc-story,.idc-process-stage,.idc-routing article').forEach(node => observer.observe(node));
    } catch (error) {
      host.innerHTML = `<p class="idc-error">${navigator.language.startsWith('zh') ? '页面内容暂时无法载入，请刷新重试。' : 'This page could not load. Please refresh and try again.'}</p>`;
    }
  }

  render();
  window.setTimeout(render, 1400);
  window.setTimeout(render, 3200);
})();
