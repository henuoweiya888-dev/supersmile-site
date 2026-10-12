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
  function render(options) {
    const {path, lang='en', procurementContext='', categoryKey='', productId=''} = options;
    if (lang !== 'en' && lang !== 'zh') return '';
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
    const markup = render(options);
    if(!markup) return;
    if(current) current.outerHTML=markup;
    else scope.document.querySelector('footer.footer')?.insertAdjacentHTML('beforebegin',markup);
  }
  scope.SS_MANUFACTURING_CONTEXT={render,apply};
})(typeof window==='undefined'?globalThis:window);
