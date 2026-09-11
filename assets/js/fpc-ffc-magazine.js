(() => {
  const host = document.getElementById('pcc-rich-content');
  if (!host) return;

  const root = '/assets/images/product-categories/stock/fpc-ffc/';
  const files = {
    difference:'distinction.jpg', pitch:'pitch.jpg', 'contact-side':'contact-side.jpg', tail:'tail-geometry.jpg',
    connector:'zif-system.jpg', mating:'insertion.jpg', bend:'bend.jpg', routing:'routing.jpg', display:'display.jpg',
    equipment:'equipment.jpg', inspection:'inspection.jpg', release:'release.jpg'
  };
  const captions = {
    difference:['柔性印制电路实拍用于说明图形化铜路与异形轮廓。','A flexible printed circuit illustrates patterned copper and shaped geometry.'],
    pitch:['FPC 摄像连接线展示薄型尾端，准确规格仍以双方图纸为准。','An FPC camera lead shows a thin tail; exact geometry remains drawing-controlled.'],
    'contact-side':['细间距板端接头展示接点排列，不能仅凭外观判断触点面。','A fine-pitch board connector shows the contact array; contact side cannot be inferred by appearance alone.'],
    tail:['柔性电子结构展示尾端、焊盘与异形走线之间的关系。','Flexible electronics illustrate the relationship between tail, pads and shaped traces.'],
    connector:['显示模组柔性电路用于说明线缆、接头与设备是一套接口系统。','A display-module flex illustrates cable, connector and equipment as one interface system.'],
    mating:['接头操作近景强调平直插入与正确锁扣动作。','A connector close-up emphasizes square insertion and correct actuator handling.'],
    bend:['柔性传感器实拍用于说明弯曲方向与半径需要被定义。','A flex sensor illustrates why bend direction and radius must be defined.'],
    routing:['设备内部柔性互连展示支撑、空间与装配顺序的重要性。','A flexible interconnect inside equipment shows the importance of support, space and assembly order.'],
    display:['柔性显示研究场景代表薄型显示互连应用，不构成项目认证。','A flexible-display research scene represents thin display interconnects, not project certification.'],
    equipment:['摄像与音频子板展示 FPC 在紧凑电子设备中的多功能连接。','A camera and audio sub-board shows multifunction FPC routing in compact electronics.'],
    inspection:['传感器与柔性电路微距图强调放大检验精细几何。','A sensor and flexible-circuit macro emphasizes magnified inspection of fine geometry.'],
    release:['手机内部 FFC 实拍用于说明替代件必须与受控版本匹配。','An internal phone FFC illustrates why replacements must match the controlled revision.']
  };

  const pick = (value, zh) => typeof value === 'string' ? value : value[zh ? 'zh' : 'en'];
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const langZh = () => new URLSearchParams(location.search).get('lang') !== 'en';
  const cap = (id, zh) => captions[id][zh ? 0 : 1];
  const photo = (topic, zh) => `<figure class="ff-photo"><img src="${root}${files[topic.id]}" alt="${esc(pick(topic.title, zh))}" loading="lazy" decoding="async"><figcaption>${esc(cap(topic.id, zh))}</figcaption></figure>`;
  const story = (topic, zh, extra='') => `<article class="ff-story ${extra}">${photo(topic, zh)}<div class="ff-copy"><h3>${esc(pick(topic.title, zh))}</h3><p>${esc(pick(topic.copy, zh))}</p></div></article>`;
  const header = (no, zhTitle, enTitle, zhSub, enSub) => `<header class="ff-section-header"><span>${no}</span><div><p>${zh ? esc(zhSub) : esc(enSub)}</p><h2>${zh ? esc(zhTitle) : esc(enTitle)}</h2></div></header>`;
  let zh = true;

  async function render() {
    try {
      zh = langZh();
      const data = await fetch('/content/product-category-drafts/fpc-ffc-assembly.json', {cache:'no-store'}).then(response => response.json());
      const page = data.page;
      const topic = page.chapters;
      document.documentElement.lang = zh ? 'zh-CN' : 'en';
      document.title = zh ? 'FPC / FFC 电缆组件定制｜ZIF、0.3/0.5/1.0mm 节距与动态弯折｜超斯迈尔' : 'Custom FPC / FFC Cable Assemblies | ZIF, Fine Pitch & Dynamic Flex | Super Smile';
      document.querySelector('meta[name="description"]')?.setAttribute('content', zh ? '定制 FPC 与 FFC 电缆组件，覆盖 ZIF/LIF 接头、0.3/0.5/1.0mm 节距、上/下接点、同面/异面尾端、补强板、动态弯折、屏蔽布线与电气检验。' : 'Custom FPC and FFC cable assemblies covering ZIF/LIF connectors, 0.3/0.5/1.0 mm pitch, contact side, tail geometry, stiffeners, dynamic flex, routing and testing.');
      const title = pick(page.displayTitle, zh);
      document.getElementById('pcc-title').textContent = title;
      document.getElementById('pcc-intro').textContent = pick(data.intro, zh);
      document.getElementById('pcc-eyebrow').textContent = zh ? '产品小类 · 柔性互连' : 'PRODUCT CATEGORY · FLEXIBLE INTERCONNECT';
      document.getElementById('pcc-group').textContent = zh ? '特色电缆组件' : 'Specialty Cable Assemblies';
      document.getElementById('pcc-hero-image').src = `${root}opening.jpg`;
      document.getElementById('pcc-hero-image').alt = title;
      document.getElementById('pcc-cta').textContent = zh ? '咨询这一类产品' : 'Ask About This Product Type';
      document.getElementById('pcc-back').textContent = zh ? '返回产品中心' : 'Back to Products';
      document.getElementById('pcc-closing-title').textContent = title;
      document.getElementById('pcc-closing-group').textContent = zh ? '特色电缆组件' : 'Specialty Cable Assemblies';
      document.getElementById('pcc-closing-cta').textContent = zh ? '发送接口与图纸' : 'Send Interface Details';

      const opening = `<section class="ff-opening"><div><span>${zh ? '先辨别结构，再定义接口' : 'IDENTIFY THE CONSTRUCTION FIRST'}</span><h2>${zh ? '薄，不代表简单' : 'Thin does not mean simple'}</h2><p class="ff-lead">${esc(pick(page.lead, zh))}</p><h3>${esc(pick(topic[0].title,zh))}</h3><p>${esc(pick(topic[0].copy,zh))}</p><dl><div><dt>${zh?'几何':'GEOMETRY'}</dt><dd>${zh?'节距、厚度、触点面':'Pitch, thickness, contact side'}</dd></div><div><dt>${zh?'操作':'HANDLING'}</dt><dd>${zh?'插接、锁扣、弯折':'Insertion, latch, bending'}</dd></div><div><dt>${zh?'证据':'EVIDENCE'}</dt><dd>${zh?'放大检验与逐路电测':'Magnified inspection and circuit test'}</dd></div></dl></div>${photo(topic[0],zh)}</section>`;
      const nav = `<nav class="ff-contents" aria-label="${zh?'本页目录':'On this page'}"><a href="#ff-geometry"><span>01</span>${zh?'接口几何':'Interface'}</a><a href="#ff-mating"><span>02</span>${zh?'对插操作':'Mating'}</a><a href="#ff-motion"><span>03</span>${zh?'运动布线':'Motion'}</a><a href="#ff-use"><span>04</span>${zh?'应用边界':'Applications'}</a><a href="#ff-quality"><span>05</span>${zh?'检验放行':'Quality'}</a><a href="#ff-inputs"><span>06</span>${zh?'询价信息':'Inputs'}</a><a href="#ff-faq"><span>07</span>${zh?'常见问题':'FAQ'}</a></nav>`;
      const geometry = `<section class="ff-group ff-geometry" id="ff-geometry">${header('01','把所有尺寸画在同一张图上','Put Every Dimension on One Drawing','接口几何','INTERFACE GEOMETRY')}<div class="ff-geometry-grid">${[1,2,3].map(i=>story(topic[i],zh)).join('')}</div></section>`;
      const mating = `<section class="ff-group ff-mating" id="ff-mating">${header('02','接头与动作必须成套确认','Connector and Motion Work as One','插接操作','MATING PROCESS')}<div class="ff-mating-grid">${[4,5].map((i,n)=>`<article><span>0${n+1}</span>${photo(topic[i],zh)}<div class="ff-copy"><h3>${esc(pick(topic[i].title,zh))}</h3><p>${esc(pick(topic[i].copy,zh))}</p></div></article>`).join('')}</div></section>`;
      const motion = `<section class="ff-group ff-motion" id="ff-motion">${header('03','在定长前规划真实路径','Plan the Real Route Before Fixing Length','运动与布线','MOTION & ROUTING')}<div class="ff-motion-grid">${story(topic[6],zh,'ff-motion-lead')}${story(topic[7],zh)}</div></section>`;
      const use = `<section class="ff-group ff-use" id="ff-use">${header('04','应用名称不能替代工作条件','Application Names Do Not Replace Duty','设备应用','EQUIPMENT APPLICATIONS')}<div class="ff-use-grid">${[8,9].map(i=>story(topic[i],zh)).join('')}</div></section>`;
      const quality = `<section class="ff-group ff-quality" id="ff-quality">${header('05','从微距外观到版本记录','From Macro Inspection to Revision Records','检验与放行','INSPECTION & RELEASE')}<div class="ff-quality-grid">${[10,11].map(i=>story(topic[i],zh)).join('')}</div></section>`;
      const inputs = `<section class="ff-inputs" id="ff-inputs">${header('06','询价前先补齐这些信息','Complete These Inputs Before Quotation','工程输入','ENGINEERING INPUTS')}<ol>${page.inputs.map((item,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>${esc(pick(item,zh))}</li>`).join('')}</ol></section>`;
      const faq = `<section class="ff-faq" id="ff-faq">${header('07','采购与工程','Purchasing & Engineering','FPC / FFC 常见问题','FPC / FFC QUESTIONS')}<div>${page.faq.map(item=>`<details><summary>${esc(pick(item.q,zh))}</summary><p>${esc(pick(item.a,zh))}</p></details>`).join('')}</div></section>`;
      const credits = `<details class="ff-credits"><summary>${zh?'图片来源与技术依据':'Photo sources and technical references'}</summary><p>${zh?'图片用于说明结构、接头、运动、应用或检验概念，不代表超斯迈尔产品实拍、指定零件认证或项目验证结果。':'Images illustrate construction, connector, motion, application or inspection concepts. They do not represent Super Smile product photography, specified-part certification or project validation.'}</p><a href="${root}SOURCES.md" target="_blank" rel="noopener">${zh?'查看图片许可与技术来源':'View photo licenses and technical sources'}</a></details>`;
      host.innerHTML = `<div class="ff-page">${opening}${nav}${geometry}${mating}${motion}${use}${quality}${inputs}${faq}${credits}</div>`;
      if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.1,rootMargin:'0px 0px -6%'});
      host.querySelectorAll('.ff-section-header,.ff-story,.ff-mating article').forEach(node=>observer.observe(node));
    } catch (error) {
      host.innerHTML = `<p class="ff-error">${langZh()?'页面内容暂时无法载入，请刷新重试。':'This page could not load. Please refresh and try again.'}</p>`;
    }
  }
  render(); setTimeout(render,1400); setTimeout(render,3200);
})();
