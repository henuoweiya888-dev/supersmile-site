import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'content/custom-service-refresh-copy.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'content/custom-service-image-plan.json'),'utf8'));
const copy={...source.copy,home:{en:'Home',zh:'首页'}};
// The shared runtime owns the service H1, contact form, URL language and metadata.
const page=fs.readFileSync(path.join(root,'custom.html'),'utf8');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(tag,key,value,attrs='')=>{
  if(value)copy[key]=value;
  return `<${tag}${attrs} data-service-copy="${key}">${escape(copy[key].en)}</${tag}>`;
};
function image(item,key,alt,attrs=''){
  copy[key]=alt;
  if(!fs.existsSync(path.join(root,item.path))) throw Error(`Missing image: ${item.path}`);
  return `<img src="${escape(item.path)}" width="${item.dimensions[0]}" height="${item.dimensions[1]}" alt="${escape(alt.en)}" data-service-alt="${key}" loading="lazy" decoding="async"${attrs}>`;
}
const altPairs=[
  [{en:'Multi-branch harness with several equipment interfaces',zh:'带多种设备接口的多分支线束'},{en:'Branched harness with a braided protective sleeve',zh:'采用编织防护套的分支线束'}],
  [{en:'Double-ended cable with circular M12 connectors',zh:'采用M12圆形接口的双端电缆组件'},{en:'D-Sub cable assembly with several connector branches',zh:'带多个接口分支的D-Sub电缆组件'}],
  [{en:'OBD diagnostic cable with three interface branches',zh:'带三个接口分支的OBD诊断电缆'},{en:'Turbo actuator connector lead with protected cable routing',zh:'带防护线段的涡轮执行器连接线'}],
  [{en:'Terminated cable with a sealed rectangular connector',zh:'带密封矩形连接器的端接电缆'},{en:'Assorted fine-pitch connector leads and terminal wiring',zh:'多种细间距接口引线与端子配线'}],
  [{en:'Fine-pitch double-ended wire assembly',zh:'细间距双端连接线组件'},{en:'Molded Y-branch cable assembly',zh:'带模制分支的Y形电缆组件'}],
  [{en:'Color-coded flexible conductors',zh:'按颜色区分的柔性导线'},{en:'Prepared cable end showing cable layers and conductor termination',zh:'展示线缆层次和芯线端接的加工端部'}]
];
const families=source.families.map((family,index)=>{
  const media=plan.families.find(item=>item.id===family.id);
  if(!media||media.images.length!==2)throw Error(`Image pair missing: ${family.id}`);
  return `<article class="cs3-family" id="service-${family.id}" data-service-family="${family.id}">
    ${text('h3',`family${index}Title`,family.title)}
    <div class="cs3-family-media">${media.images.map((item,n)=>`<figure>${image(item,`family${index}Image${n}`,altPairs[index][n])}</figure>`).join('')}</div>
    ${text('p',`family${index}Description`,family.description,' class="cs3-family-description"')}
    ${text('h4','scopeOptionsLabel')}
    <ul>${family.options.map((item,n)=>text('li',`family${index}Option${n}`,item)).join('')}</ul>
    <div class="cs3-family-review">${text('h4','scopeConfirmLabel')}${family.confirm.map((item,n)=>text('p',`family${index}Confirm${n}`,item)).join('')}</div>
    <a class="cs3-family-link" href="${family.href}">${text('span','scopeProductsCta')}<span aria-hidden="true">→</span></a>
  </article>`;
}).join('\n');

const engineeringMedia=[
  {...plan.technicalSupport[0],fit:'contain',alt:{en:'Mating connector housings with terminals and wire exits',zh:'带端子与出线结构的配套连接器壳体'}},
  {...plan.technicalSupport[1],fit:'contain',alt:{en:'Complete sample harness showing branch positions and interfaces',zh:'展示分支位置与接口的完整样品线束'}},
  {...plan.technicalSupport[2],fit:'contain',alt:{en:'Multi-core cable with a prepared jacket transition and exposed conductors',zh:'展示护套过渡与分出芯线的多芯电缆'}},
  {...plan.technicalSupport[3],fit:'cover',alt:{en:'Continuity test equipment connected to an assembled cable',zh:'连接电缆组件进行导通检查的检测设备'}}
];
const engineering=source.engineering.map((item,index)=>`<article class="cs3-definition-item">
  <figure>${image(engineeringMedia[index],`engineeringImage${index}`,engineeringMedia[index].alt,` style="object-fit:${engineeringMedia[index].fit}"`)}</figure>
  <div>${text('h3',`engineering${index}Title`,item.title)}${text('p',`engineering${index}Description`,item.description)}${text('p',`engineering${index}Example`,item.example,' class="cs3-output"')}</div>
</article>`).join('\n');
const steps=source.process.map((step,index)=>`<li class="cs3-step" data-service-step="${step.id}">
  <span class="cs3-step-number" aria-hidden="true">${step.number}</span>
  <div>${text('h3',`process${index}Title`,step.title)}${text('p',`process${index}Description`,step.description)}</div>
  <dl>${text('dt','processInputLabel')}${text('dd',`process${index}Input`,step.input)}${text('dt','processOutputLabel')}${text('dd',`process${index}Output`,step.output)}</dl>
</li>`).join('\n');
const processMedia=[plan.process[1],plan.process[0],plan.process[3]];
const processAlts=[{en:'Automated wire-processing equipment on the production floor',zh:'生产车间内的自动线材加工设备'},{en:'Prepared color-coded conductors at an assembly workstation',zh:'装配工位上已准备好的彩色导线'},{en:'Cable continuity inspection with test equipment',zh:'使用检测设备进行电缆导通检查'}];
const checklist=source.quoteChecklist.map((item,index)=>`<article>${text('h3',`quote${index}Title`,item.title)}${text('p',`quote${index}Description`,item.description)}</article>`).join('\n');
const faqs=source.faq.map((item,index)=>{
  const answer={...item.answer};
  // Explain engineering acceptance without adding unrelated legal notices.
  if(index===1){answer.en=answer.en.replace(' Brand references do not imply authorization.','');answer.zh=answer.zh.replace('品牌名称不代表品牌授权。','');}
  return `<details><summary>${text('span',`faq${index}Question`,item.question)}</summary>${text('p',`faq${index}Answer`,answer)}</details>`;
}).join('\n');

copy.heroImage={en:'Wire harness assembly and processing floor in Shenzhen',zh:'深圳线束组装与加工车间'};
const originalHero=page.match(/<section class="hero custom-hero custom-service-hero[^"]*">[\s\S]*?<\/section>/)?.[0]
  ||page.match(/<section class="hero custom-hero cs3-hero[^"]*">[\s\S]*?<\/section>/)?.[0];
if(!originalHero)throw Error('Original service hero is missing');
let hero=originalHero.replace('custom-service-hero"','cs3-hero"')
  .replaceAll('custom-service-hero-media','cs3-hero-media')
  .replace('container custom-service-hero-copy','cs3-wrap cs3-hero-copy')
  .replaceAll('custom-service-breadcrumb','cs3-breadcrumb')
  .replaceAll('custom-service-eyebrow','cs3-eyebrow')
  .replaceAll('custom-service-actions','cs3-actions');
hero=hero.replace(/<img\b[^>]*>/,`<img src="${plan.hero.path}" width="${plan.hero.dimensions[0]}" height="${plan.hero.dimensions[1]}" alt="${copy.heroImage.en}" data-service-alt="heroImage" decoding="async" fetchpriority="high">`)
  .replace('<a href="/">Home</a>',text('a','home',null,' href="/"'));
const markup=`<main class="custom-service-main cs3-main">
${hero}
<nav class="cs3-jump" aria-label="Service page sections" data-service-aria="sectionNavigation"><div class="cs3-wrap">
${[['#custom-scope','heroAnchorScope'],['#custom-definition','heroAnchorDefine'],['#custom-process','heroAnchorProcess'],['#custom-prepare','heroAnchorQuote']].map(([href,key])=>`<a href="${href}">${text('span',key)}<span aria-hidden="true">↘</span></a>`).join('')}
</div></nav>
<section class="cs3-section cs3-scope" id="custom-scope" aria-labelledby="cu-scope-title"><div class="cs3-wrap">
  <header class="cs3-section-head">${text('h2','scopeTitle',null,' id="cu-scope-title"')}${text('p','scopeLead')}</header>
  <div class="cs3-families">${families}</div>
</div></section>
<section class="cs3-section cs3-definition" id="custom-definition" aria-labelledby="cu-details-title"><div class="cs3-wrap">
  <header class="cs3-section-head">${text('h2','defineTitle',null,' id="cu-details-title"')}${text('p','defineLead')}</header>
  <div class="cs3-definition-grid">${engineering}</div>
</div></section>
<section class="cs3-section cs3-process" id="custom-process" aria-labelledby="cu-process-title"><div class="cs3-wrap">
  <header class="cs3-section-head">${text('h2','processTitle',null,' id="cu-process-title"')}${text('p','processLead')}</header>
  <div class="cs3-process-layout"><ol class="cs3-process-steps">${steps}</ol><div class="cs3-process-media">${processMedia.map((item,index)=>`<figure>${image(item,`processImage${index}`,processAlts[index])}</figure>`).join('')}</div></div>
  <div class="cs3-gate">${text('h3','processGateLabel')}${text('p','processGateCopy')}</div>
</div></section>
<section class="cs3-section cs3-prepare" id="custom-prepare" aria-labelledby="cs3-prepare-title"><div class="cs3-wrap">
  <header class="cs3-section-head">${text('h2','quoteTitle',null,' id="cs3-prepare-title"')}${text('p','quoteLead')}</header>
  <div class="cs3-checklist">${checklist}</div>${text('p','quoteScopeNote',null,' class="cs3-quote-note"')}
</div></section>
<section class="cs3-section cs3-faq" id="custom-faq" aria-labelledby="cs3-faq-title"><div class="cs3-wrap cs3-faq-layout">
  <header class="cs3-section-head">${text('h2','faqTitle',null,' id="cs3-faq-title"')}</header><div>${faqs}</div>
</div></section>
</main>`;
copy.sectionNavigation={en:'Service page sections',zh:'定制服务页内导航'};

let next=page.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,markup)
  .replace('/assets/css/custom-service-v2.css?v=20260912v1','/assets/css/custom-service-editorial.css?v=20261014-1');
if(!next.includes('/assets/js/custom-service-editorial.js')){
  next=next.replace('</body>','<script defer src="/assets/js/custom-service-editorial.js?v=20261014-1"></script>\n</body>');
}
fs.writeFileSync(path.join(root,'custom.html'),next);

const client=`/* Generated from content/custom-service-refresh-copy.json. */
(()=>{
  'use strict';
  const copy=${JSON.stringify(copy)};
  function currentLanguage(){
    const query=new URLSearchParams(location.search).get('lang');
    if(query==='en'||query==='zh')return query;
    try{const saved=localStorage.getItem('lang');if(saved==='en'||saved==='zh')return saved;}catch{}
    return document.documentElement.lang.startsWith('zh')?'zh':'en';
  }
  function render(){
    const lang=currentLanguage();
    document.querySelectorAll('[data-service-copy]').forEach(node=>{
      const entry=copy[node.dataset.serviceCopy];
      if(entry)node.textContent=entry[lang]||entry.en;
    });
    document.querySelectorAll('[data-service-alt]').forEach(node=>{
      const entry=copy[node.dataset.serviceAlt];
      if(entry)node.alt=entry[lang]||entry.en;
    });
    document.querySelectorAll('[data-service-aria]').forEach(node=>{
      const entry=copy[node.dataset.serviceAria];
      if(entry)node.setAttribute('aria-label',entry[lang]||entry.en);
    });
  }
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();
`;
fs.writeFileSync(path.join(root,'assets/js/custom-service-editorial.js'),client);
console.log(`Built service page: ${source.families.length} families, ${source.process.length} steps, ${source.faq.length} FAQs, ${Object.keys(copy).length} bilingual keys.`);
