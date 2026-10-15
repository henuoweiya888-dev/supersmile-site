(function (scope) {
  'use strict';
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const copy = {
    en: {heading:'Custom Wire Harness Manufacturing in China',start:'Start with the information you have',intro:'A sample, clear connector photos or a description of the equipment and required quantity is enough to start a review.',details:'Information for an accurate quotation',inputs:'When available, include drawings and BOM, connector and mating part numbers, pinout, wire length and gauge, branch layout, quantity and required tests. Materials, inspection scope and delivery are confirmed for each project.',quote:'Send a harness requirement',manufacturing:'Custom harness manufacturing',engineering:'Engineering review and production process',validation:'Prototype and sample validation',factory:'Factory and inspection workflow'},
    zh: {heading:'中国工厂 · 定制线束制造与 OEM/ODM',start:'先提供您现有的资料',intro:'没有完整图纸也可以先提供样品、清晰的接头照片，或说明目标设备、用途和所需数量，开始需求审核。',details:'准确报价需要哪些资料',inputs:'如有，请提供图纸与 BOM、连接器及对插件料号、pinout、长度与线规、分支布局、数量和测试要求。材料、检验范围和交付安排按具体项目确认。',quote:'提交线束需求',manufacturing:'定制线束制造',engineering:'工程审核与生产流程',validation:'打样与样品验证',factory:'工厂与检验流程'}
  };
  const specific = {
    '/products/molex-compatible': {en:'For a Molex-compatible assembly, include the connector series and exact mating part, pitch, circuit count, terminal choice and wire size. Compatibility is reviewed against the specified interface.',zh:'Molex 兼容线束请补充系列、准确对插件料号、间距、回路数、端子与线径；兼容性依据指定接口审核。'},
    '/products/automotive-diagnostic-and-obd-harness': {en:'For an OBD harness, identify the vehicle and tool interfaces, pin mapping, straight or branched layout, cable length and intended diagnostic task.',zh:'OBD 线束请说明车端与工具端接口、针脚对应、直连或分支布局、线长与目标诊断任务。'},
    '/obd2-diagnostic-cable': {en:'For an OBD2 cable, identify the vehicle and tool interfaces, pin mapping, straight or branched layout, cable length and intended diagnostic task.',zh:'OBD2 诊断线请说明车端与工具端接口、针脚对应、直连或分支布局、线长与目标诊断任务。'},
    '/products/equipment-wire': {en:'For equipment wiring, include current and voltage, wire gauge, termination, routing space, temperature or movement conditions and the required inspection scope.',zh:'设备连接线请补充电流与电压、线规、端接方式、布线空间、温度或运动条件，以及需要确认的检验范围。'}
  };
  function renderUnifiedInquiry(options) {
    const lang = options.lang || 'en';
    const bi = (tag, attrs, en, zh) => `<${tag} ${attrs} data-ci-en="${esc(en)}" data-ci-zh="${esc(zh)}">${esc(lang === 'zh' ? zh : en)}</${tag}>`;
    const title = {en:copy.en.heading,zh:copy.zh.heading};
    const business = {en:'Custom wire harness manufacturing from our China factory, with OEM/ODM project support.',zh:'中国工厂提供定制线束制造与 OEM/ODM 项目支持。'};
    if(options.procurementContext) business[lang]=options.procurementContext;
    const category = {en:'Industrial Equipment Harness',zh:'工业设备线束'};
    const links = [['/custom-wiring-harness','manufacturing'],['/custom','engineering'],['/custom#cu-process-title','validation'],['/about','factory']].map(([href,key])=>bi('a',`href="${href}"`,copy.en[key],copy.zh[key])).join('');
    return `<section class="manufacturing-context ci-section" id="manufacturing-context" data-unified-inquiry aria-labelledby="mc-heading"><div class="ci-inner"><div class="ci-copy">${bi('p','class="ci-kicker"','PROJECT REVIEW / CUSTOM MANUFACTURING','项目沟通 / 定制制造')}${bi('h2','id="mc-heading"',title.en,title.zh)}${bi('p','',business.en,business.zh)}${bi('p','',copy.en.intro,copy.zh.intro)}<nav class="mc-links" aria-label="Manufacturing capabilities">${links}</nav></div><form id="category-inquiry-form" class="ci-form" action="/contact" method="get" data-category="custom-harness-01" data-route="/products/industrial-equipment-harness">${bi('h3','','Discuss Custom Manufacturing & Sourcing','咨询定制与采购')}${bi('p','class="ci-help"','Start with a part number, drawing, sample or equipment requirement.','有料号、图纸或样品可以直接提供，也可以先说明设备需求。')}<input type="hidden" name="category" value="custom-harness-01"><input type="hidden" id="ci-category-name" name="category_name" value="${esc(category[lang])}" data-ci-en="${esc(category.en)}" data-ci-zh="${esc(category.zh)}"><input type="hidden" name="source_page" value="/products/industrial-equipment-harness"><input type="hidden" name="lang" value="${lang}"><label class="ci-choice" for="ci-use-part"><input type="checkbox" id="ci-use-part" aria-controls="ci-part-field" aria-expanded="false">${bi('span','','Include a model or part number (optional)','填写型号或料号（可选）')}</label><div id="ci-part-field" class="ci-part-field" hidden>${bi('label','for="ci-part-number"','Model / Part number','型号 / 料号')}<input id="ci-part-number" name="part_number" type="text" maxlength="500" disabled autocomplete="off" spellcheck="false" placeholder="${lang==='zh'?'可填写一个或多个编号':'One or more model or part numbers'}" data-ci-placeholder-en="One or more model or part numbers" data-ci-placeholder-zh="可填写一个或多个编号" aria-describedby="ci-part-help">${bi('p','id="ci-part-help" class="ci-help"','The number will be added to your message on the contact page.','填写的编号将自动带入联系页面的留言中。')}</div><details>${bi('summary','',copy.en.details,copy.zh.details)}${bi('p','',copy.en.inputs,copy.zh.inputs)}</details>${bi('button','class="mc-quote" id="ci-submit" type="submit"','Continue to Contact →','继续填写需求 →')}</form></div></section>`;
  }
  function render(options) {
    const {path, lang='en', procurementContext='', categoryKey='', productId=''} = options;
    if (lang !== 'en' && lang !== 'zh') return '';
    if(path === '/products/industrial-equipment-harness') return renderUnifiedInquiry(options);
    const c = copy[lang];
    const query = new URLSearchParams({source_page:path});
    if(categoryKey) query.set('category',categoryKey);
    if(productId) query.set('products',productId);
    const context = specific[path]?.[lang] || '';
    const links = `<nav class="mc-links" aria-label="${esc(c.manufacturing)}"><a href="/custom-wiring-harness">${esc(c.manufacturing)}</a><a href="/custom">${esc(c.engineering)}</a><a href="/custom#cu-process-title">${esc(c.validation)}</a><a href="/about">${esc(c.factory)}</a></nav>`;
    return `<section class="manufacturing-context" id="manufacturing-context" aria-labelledby="mc-heading"><div class="mc-inner"><div class="mc-business"><h2 id="mc-heading">${esc(c.heading)}</h2><p>${esc(procurementContext)}</p>${links}</div><div class="mc-inquiry"><h3>${esc(c.start)}</h3><p>${esc(c.intro)}</p>${context?`<p class="mc-topic">${esc(context)}</p>`:''}<details><summary>${esc(c.details)}</summary><p>${esc(c.inputs)}</p></details><a class="mc-quote" href="/contact?${esc(query.toString())}">${esc(c.quote)} <span aria-hidden="true">→</span></a></div></div></section>`;
  }
  function apply(options) {
    if(!scope.document || !options) return;
    const current = scope.document.getElementById('manufacturing-context');
    if(current?.hasAttribute?.('data-unified-inquiry')) return;
    const markup = render(options);
    if(!markup) return;
    if(current) current.outerHTML=markup;
    else scope.document.querySelector('footer.footer')?.insertAdjacentHTML('beforebegin',markup);
  }
  scope.SS_MANUFACTURING_CONTEXT={render,apply};
})(typeof window==='undefined'?globalThis:window);
