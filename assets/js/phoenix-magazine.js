(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;

  const groups = [
    ['interfaces', '接口与端接基础', 'Interfaces & Termination', [0, 1, 2, 3]],
    ['advantages', '产品优势', 'Engineering Advantages', [4, 5, 6, 7, 8]],
    ['solutions', '连接解决方案', 'Connection Solutions', [9, 10, 11]],
    ['range', '连接器与线束类型', 'Connector & Harness Types', [12, 13, 14, 15]],
    ['applications', '行业与应用', 'Industries & Applications', [16, 17, 18, 19, 20, 21]],
    ['environment', '环境与运行可靠性', 'Environment & Reliability', [22, 23, 24, 25, 26, 27]],
    ['verification', '选线、检验与交付', 'Sizing, Verification & Release', [28, 29, 30, 31, 32, 33, 34]]
  ];

  const path = '/assets/images/product-categories/stock/phoenix/';
  const captions = {
    identity: ['控制柜接线细节用于说明端子系统需要完整识别。', 'Control-cabinet wiring illustrates why a terminal system needs complete identification.'],
    combicon: ['板端与线端接口需要作为完整插拔系统核对。', 'Board and cable interfaces must be checked as one plug-in system.'],
    spring: ['自动化接线场景说明不同夹线机构需要不同操作方法。', 'Automation wiring illustrates that clamping mechanisms require different handling.'],
    ferrules: ['端子安装细节用于说明剥线、套管长度及压接形状。', 'Termination detail illustrates strip length, sleeve length and crimp shape.'],
    matching: ['接口防错与键位识别应进入受控图纸。', 'Keying and interface identification belong in the controlled drawing.'],
    protection: ['密封界面只有在实际装配状态下才有意义。', 'A sealing interface only has meaning in its installed condition.'],
    workmanship: ['端接工艺需要控制工具、材料与检验点。', 'Termination workmanship depends on controlled tools, materials and inspection points.'],
    custom: ['分支与线束结构应依据设备拓扑定义。', 'Branches and harness geometry should follow the equipment topology.'],
    delivery: ['设备端安装与维护空间也是交付成本的一部分。', 'Installation and service access are part of delivered cost.'],
    'automation-solution': ['控制柜端子、I/O 与现场设备构成完整连接链路。', 'Cabinet terminals, I/O and field devices form one connection chain.'],
    'energy-solution': ['新能源设备布线需要同时考虑直流回路与维护边界。', 'New-energy wiring must consider DC circuits and service boundaries together.'],
    'rail-solution': ['交通设备连接需明确振动、维护和文件要求。', 'Transit equipment connections require defined vibration, service and documentation needs.'],
    terminal: ['板端接头与针座是线束接口定义的一部分。', 'PCB headers and plugs are part of the harness interface definition.'],
    heavy: ['重载接头用于说明壳体、模块、锁扣与电缆入口的组合。', 'A heavy-duty connector illustrates the housing, insert, latch and cable-entry system.'],
    circular: ['圆形工业接头需核对编码、针数、方向及防护状态。', 'Circular industrial connectors require coding, contact, orientation and protection review.'],
    ethernet: ['工业网络链路不仅是接通，还要保持线对与屏蔽结构。', 'Industrial Ethernet links must preserve pair and shielding structure, not only continuity.'],
    industry: ['自动化产线带来传感器、执行器和控制柜之间的多种线束。', 'Automation lines create multiple harness types between sensors, actuators and cabinets.'],
    renewables: ['能源设备现场用于说明温度、户外暴露和维护条件。', 'Energy equipment illustrates temperature, outdoor exposure and maintenance conditions.'],
    transit: ['轨交应用需要把设备位置与线束支撑方式一起审核。', 'Rail applications require equipment position and harness support to be reviewed together.'],
    medical: ['医疗设备连接的清洁、识别及文件要求需按项目确认。', 'Cleaning, identification and documentation for medical equipment are project-specific.'],
    robotics: ['机器人布线需区分固定段、活动段和接口拆装位置。', 'Robot wiring separates fixed runs, moving runs and serviceable interfaces.'],
    telecom: ['网络设备互连重视端口识别、屏蔽及维护通道。', 'Network equipment interconnects depend on port identification, shielding and service paths.'],
    cold: ['低温材料选择需考虑弯曲、密封与冷凝。', 'Low-temperature selection considers flexing, sealing and condensation.'],
    heat: ['热区布线需控制导体温升并避开高温表面。', 'Hot-zone wiring must control conductor rise and avoid heated surfaces.'],
    humidity: ['冲洗和凝露会从不同路径进入连接系统。', 'Washdown and condensation reach a connection system through different paths.'],
    vibration: ['振动试验用于说明接头锁紧和线束支撑的重要性。', 'Vibration testing illustrates the importance of locking and cable support.'],
    chemicals: ['护套材料需根据实际油液、溶剂和清洁剂审核。', 'Jacket materials must be reviewed against actual oils, solvents and cleaning agents.'],
    uv: ['户外老化不仅包括雨水，也包括日照和温度循环。', 'Outdoor aging includes sunlight and temperature cycling as well as rain.'],
    sizing: ['导体截面由完整回路的负载、压降和温升共同决定。', 'Conductor size follows load, voltage drop and thermal rise across the complete circuit.'],
    drop: ['电压测量场景用于说明完整回路压降核算。', 'Voltage measurement illustrates complete-loop drop evaluation.'],
    pull: ['拉力检验验证特定端子、线材及压接工具组合。', 'Pull testing validates a particular terminal, conductor and crimp-tool combination.'],
    continuity: ['线缆测试设备用于核对点对点回路与错线。', 'Cable test equipment checks point-to-point circuits and miswires.'],
    insulation: ['绝缘结构和测试电压需按项目要求定义。', 'Insulation construction and test voltage must be defined by the project.'],
    withstand: ['耐压是独立验证项目，不等同于普通导通检查。', 'Dielectric withstand is a separate verification from ordinary continuity.'],
    release: ['受控记录把认可样品转化为可重复交付。', 'Controlled records turn an approved sample into repeatable delivery.']
  };

  const pick = (value, zh) => value?.[zh ? 'zh' : 'en'] || '';
  const esc = value => String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));

  async function render() {
    try {
      const response = await fetch('/content/product-category-drafts/phoenix-compatible.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const page = data.page;
      const zh = new URLSearchParams(location.search).get('lang') !== 'en';
      document.documentElement.lang = zh ? 'zh-CN' : 'en';

      const title = pick(page.displayTitle, zh);
      const heroTitle = zh ? 'Phoenix\n兼容电缆组件' : title;
      const syncHeader = () => {
        const titleNode = document.getElementById('pcc-title');
        const introNode = document.getElementById('pcc-intro');
        const closingNode = document.getElementById('pcc-closing-title');
        const heroNode = document.getElementById('pcc-hero-image');
        const query = new URLSearchParams({category: 'connector-systems-12', category_name: title, lang: zh ? 'zh' : 'en'});
        if (titleNode && titleNode.textContent !== heroTitle) titleNode.textContent = heroTitle;
        if (introNode && introNode.textContent !== pick(data.intro, zh)) introNode.textContent = pick(data.intro, zh);
        if (closingNode && closingNode.textContent !== title) closingNode.textContent = title;
        if (heroNode && !heroNode.src.endsWith('/phoenix/hero.jpg')) heroNode.src = `${path}hero.jpg`;
        ['pcc-cta', 'pcc-closing-cta'].forEach(id => {
          const link = document.getElementById(id);
          if (link) link.href = `/contact?${query.toString()}`;
        });
        document.title = zh ? 'Phoenix 兼容电缆组件 | 端子、M12 与控制柜线束 | 超斯迈尔' : 'Custom Phoenix Cable Harnesses | COMBICON, M12 & HEAVYCON | Super Smile';
      };
      syncHeader();
      const headerObserver = new MutationObserver(syncHeader);
      ['pcc-title', 'pcc-intro', 'pcc-closing-title', 'pcc-hero-image'].forEach(id => {
        const node = document.getElementById(id);
        if (!node) return;
        if (id === 'pcc-hero-image') headerObserver.observe(node, {attributes: true, attributeFilter: ['src']});
        else headerObserver.observe(node, {subtree: true, childList: true, characterData: true});
      });
      window.setTimeout(() => headerObserver.disconnect(), 2500);
      window.setTimeout(syncHeader, 3000);

      const opening = `
        <section class="ph-opening">
          <div class="ph-opening-copy">
            <h2>${esc(pick(page.headings.introduction, zh))}</h2>
            <p>${esc(pick(page.lead, zh))}</p>
          </div>
          <figure class="ph-photo"><img src="${path}opening.jpg" alt="${esc(zh ? '控制柜端子排和标识接线' : 'Labeled terminal wiring in a control cabinet')}" width="1400" height="934" loading="lazy" decoding="async"><figcaption>${esc(zh ? '控制柜连接展示端子、标识、导线与设备边界的整体关系。' : 'A control cabinet shows the relationship between terminals, labels, conductors and equipment boundaries.')}</figcaption></figure>
        </section>`;

      const nav = `<nav class="ph-contents" aria-label="${zh ? '本页目录' : 'On this page'}">${groups.map(([id, cn, en]) => `<a href="#phoenix-${id}">${esc(zh ? cn : en)}</a>`).join('')}</nav>`;

      const sections = groups.map(([id, cn, en, indices], groupIndex) => {
        const stories = indices.map(index => {
          const topic = page.chapters[index];
          const cap = captions[topic.id] || ['', ''];
          return `<article class="ph-story ph-story-${topic.id}">
            <figure class="ph-photo"><img src="${path}${topic.id}.jpg" alt="${esc(pick(topic.title, zh))}" width="1200" height="800" loading="lazy" decoding="async"><figcaption>${esc(cap[zh ? 0 : 1])}</figcaption></figure>
            <div class="ph-copy"><h3>${esc(pick(topic.title, zh))}</h3><p>${esc(pick(topic.copy, zh))}</p></div>
          </article>`;
        }).join('');
        return `<section class="ph-group ph-${id}" id="phoenix-${id}" aria-labelledby="phoenix-heading-${id}">
          <header class="ph-section-header"><span aria-hidden="true">${String(groupIndex + 1).padStart(2, '0')}</span><h2 id="phoenix-heading-${id}">${esc(zh ? cn : en)}</h2></header>
          <div class="ph-spread">${stories}</div>
        </section>`;
      }).join('');

      const faq = `<section class="ph-faq"><header class="ph-section-header"><span aria-hidden="true">08</span><h2>${esc(pick(page.headings.faq, zh))}</h2></header><div>${page.faq.map(item => `<details><summary>${esc(pick(item.q, zh))}</summary><p>${esc(pick(item.a, zh))}</p></details>`).join('')}</div></section>`;
      const credits = `<details class="ph-credits"><summary>${zh ? '图片来源与使用说明' : 'Photo sources and context'}</summary><p>${zh ? '页面图片用于说明接口、材料、安装环境或检验方法，不代表超斯迈尔产品实拍、Phoenix Contact 授权或项目验证结果。' : 'Images illustrate interfaces, materials, installation environments or verification methods. They do not represent Super Smile products, Phoenix Contact authorization or project test evidence.'}</p><a href="/assets/images/product-categories/stock/phoenix/SOURCES.md" target="_blank" rel="noopener">${zh ? '查看完整图片来源与许可记录' : 'View the complete source and license record'}</a></details>`;
      host.innerHTML = `<div class="ph-page">${opening}${nav}${sections}${faq}${credits}</div>`;

      const observer = matchMedia('(prefers-reduced-motion: reduce)').matches ? null : new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), {threshold: .18, rootMargin: '0px 0px -10%'});
      host.querySelectorAll('.ph-section-header').forEach(header => observer ? observer.observe(header) : header.classList.add('is-visible'));
    } catch (error) {
      host.innerHTML = `<p class="ph-error">${navigator.language.startsWith('zh') ? '页面内容暂时无法载入，请刷新重试。' : 'This page could not load. Please refresh and try again.'}</p>`;
    }
  }

  render();
})();
