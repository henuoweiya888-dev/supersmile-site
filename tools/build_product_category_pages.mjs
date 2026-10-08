import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withProductGallery } from './product_gallery_markup.mjs';
import { withPageSeo } from './page_seo.mjs';
import { staticNavigationMarkup } from './static_navigation.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const capabilities=JSON.parse(await fs.readFile(path.join(root,'data/product-capabilities.json'),'utf8'));
const details=JSON.parse(await fs.readFile(path.join(root,'data/product-category-details.json'),'utf8'));
const site=JSON.parse(await fs.readFile(path.join(root,'data/site.json'),'utf8'));
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const jsonForScript=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const localized=(value,lang='en')=>typeof value==='string'?value:(value?.[lang]||value?.en||value?.zh||'');
const slugify=value=>String(value||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const aiImages={
  'custom-harness-01':'/assets/images/product-categories/ai/web/custom-harness-01-industrial-equipment-wire-harness.jpg',
  'custom-harness-02':'/assets/images/product-categories/ai/web/custom-harness-02-control-panel-wire-harness.jpg',
  'custom-harness-03':'/assets/images/product-categories/ai/web/custom-harness-03-robotic-wire-harness.jpg',
  'custom-harness-04':'/assets/images/product-categories/ai/web/custom-harness-04-instrument-sensor-wire-harness.jpg',
  'custom-harness-05':'/assets/images/product-categories/ai/web/custom-harness-05-appliance-wire-harness.jpg',
  'custom-harness-06':'/assets/images/product-categories/ai/web/custom-harness-06-jumper-wire-harness.jpg',
  'custom-harness-07':'/assets/images/product-categories/ai/web/custom-harness-07-pigtail-branch-wire-harness.jpg',
  'custom-harness-08':'/assets/images/product-categories/ai/web/custom-harness-08-turnkey-wire-harness.jpg',
  'custom-harness-09':'/assets/images/product-categories/ai/web/custom-harness-09-braided-protection-wire-harness.jpg',
  'custom-harness-10':'/assets/images/product-categories/ai/web/custom-harness-10-prototype-small-batch-wire-harness.jpg',
  'custom-harness-11':'/assets/images/product-categories/ai/web/custom-harness-11-outdoor-waterproof-wire-harness.jpg',
  'custom-harness-12':'/assets/images/product-categories/stock/new-energy-refresh/10800215.jpg',
  'cable-assembly-01':'/assets/images/product-categories/stock/overmold-refresh/overmold-hero-ai.png'
};

function list(items){
  return (items||[]).map(item=>`<li>${esc(item)}</li>`).join('');
}

function richCards(items,className='pcc-photo-notes',ordered=false,fallbackImage=''){
  const wrapper=ordered?'ol':'div';
  const card=ordered?'li':'article';
  return `<${wrapper} class="${className}">${(items||[]).map((item,index)=>`<${card} class="pcc-photo-note"><figure class="pcc-item-media pcc-mask-${index%4+1}"><img src="${esc(item.image||fallbackImage)}" alt="${esc(localized(item.title))}" width="800" height="600" loading="lazy" decoding="async"></figure><div class="pcc-photo-copy"><h3>${esc(localized(item.title))}</h3><p>${esc(localized(item.copy))}</p></div></${card}>`).join('')}</${wrapper}>`;
}

function connectorAtlasMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-atlas-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-atlas-chapter pcc-atlas-chapter-${index%4+1}">
    <span class="pcc-atlas-index">${String(index+1).padStart(2,'0')}</span>
    ${image(chapter.image,localized(chapter.title))}
    <div class="pcc-atlas-copy"><p class="pcc-atlas-kicker">${esc(localized(chapter.kicker))}</p><h2>${esc(localized(chapter.title))}</h2><p class="pcc-atlas-summary">${esc(localized(chapter.copy))}</p><div class="pcc-atlas-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div>
  </article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-atlas-opening"><div><span>CONNECTOR ATLAS</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} product family`,'pcc-atlas-opening-media')}</section>
  <section class="pcc-atlas-sequence">${chapters}</section>
  <section class="pcc-rich-section pcc-rich-faq pcc-atlas-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section>
  <details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function dsubBlueprintMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-dsub-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-dsub-chapter pcc-dsub-chapter-${index%3+1}">
    <div class="pcc-dsub-label"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p></div>
    ${image(chapter.image,localized(chapter.title))}
    <div class="pcc-dsub-copy"><h2>${esc(localized(chapter.title))}</h2><p class="pcc-dsub-summary">${esc(localized(chapter.copy))}</p><div class="pcc-dsub-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div>
  </article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-dsub-opening"><div class="pcc-dsub-opening-copy"><span>INTERFACE DOSSIER</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} product family`,'pcc-dsub-opening-media')}</section><section class="pcc-dsub-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-dsub-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function ethernetChannelMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-eth-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-eth-chapter pcc-eth-chapter-${index+1}">
    <header class="pcc-eth-heading"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p><h2>${esc(localized(chapter.title))}</h2></header>
    ${image(chapter.image,localized(chapter.title))}
    <div class="pcc-eth-copy"><p class="pcc-eth-summary">${esc(localized(chapter.copy))}</p><div class="pcc-eth-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div>
  </article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-eth-opening"><div class="pcc-eth-opening-copy"><span>PAIR / PORT / ROUTE / TEST</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} connector detail`,'pcc-eth-opening-media')}</section>
  <section class="pcc-eth-sequence">${chapters}</section>
  <section class="pcc-rich-section pcc-rich-faq pcc-eth-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section>
  <details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function agriculturalFieldMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-ag-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-ag-chapter pcc-ag-chapter-${index+1}"><header class="pcc-ag-heading"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p><h2>${esc(localized(chapter.title))}</h2></header>${image(chapter.image,localized(chapter.title))}<div class="pcc-ag-copy"><p class="pcc-ag-summary">${esc(localized(chapter.copy))}</p><div class="pcc-ag-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div></article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-ag-opening"><div class="pcc-ag-opening-copy"><span>FIELD / MACHINE / INTERFACE / SERVICE</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} rear implement context`,'pcc-ag-opening-media')}</section><section class="pcc-ag-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-ag-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function fuelCircuitMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-fuel-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-fuel-chapter pcc-fuel-chapter-${index+1}"><div class="pcc-fuel-meta"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p></div>${image(chapter.image,localized(chapter.title))}<div class="pcc-fuel-copy"><h2>${esc(localized(chapter.title))}</h2><p class="pcc-fuel-summary">${esc(localized(chapter.copy))}</p><div class="pcc-fuel-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div></article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-fuel-opening"><div class="pcc-fuel-opening-copy"><span>POWER / INJECTION / FEEDBACK</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} fuel-rail context`,'pcc-fuel-opening-media')}</section><section class="pcc-fuel-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-fuel-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function cockpitCrosscarMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-cockpit-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-cockpit-chapter pcc-cockpit-chapter-${index+1}"><header class="pcc-cockpit-heading"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p><h2>${esc(localized(chapter.title))}</h2></header><div class="pcc-cockpit-copy"><p class="pcc-cockpit-summary">${esc(localized(chapter.copy))}</p><div class="pcc-cockpit-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div>${image(chapter.image,localized(chapter.title))}</article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${item.licenseUrl?`<a href="${esc(item.licenseUrl)}" target="_blank" rel="noopener">${esc(item.license)}</a>`:esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-cockpit-opening">${image(page.images.range,`${name} exposed dashboard wiring`,'pcc-cockpit-opening-media')}<div class="pcc-cockpit-opening-copy"><span>CLUSTER / CONTROL / CROSS-CAR / SERVICE</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div></section><section class="pcc-cockpit-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-cockpit-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function transmissionBoundaryMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-trans-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-trans-chapter pcc-trans-chapter-${index+1}"><header class="pcc-trans-chapter-heading"><span>${esc(localized(chapter.kicker).replace(/^\d+\s*\/\s*/,''))}</span><h3>${esc(localized(chapter.title))}</h3></header>${image(chapter.image,localized(chapter.title))}<div class="pcc-trans-copy"><p>${esc(localized(chapter.copy))}</p><div class="pcc-trans-points">${(chapter.points||[]).map(point=>`<section><h4>${esc(localized(point.title))}</h4><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div></article>`);
  const ordered=(['anderson-power-path','harting-interface-map','yazaki-system-map'].includes(page.layout)?chapters:[0,1,3,4,2,5].map(index=>chapters[index])).filter(Boolean);
  const regions=(page.regions||[]).map((region,index)=>`<section class="pcc-trans-region pcc-trans-region-${index+1}"><header class="pcc-trans-region-heading"><span>${String(index+1).padStart(2,'0')}</span><h2>${esc(localized(region))}</h2></header><div class="pcc-trans-region-body">${ordered.slice(index*2,index*2+2).join('')}</div></section>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${item.licenseUrl?`<a href="${esc(item.licenseUrl)}" target="_blank" rel="noopener">${esc(item.license)}</a>`:esc(item.license)}</span></li>`).join('');
  const label=page.layout==='yazaki-system-map'?'HOUSING / TERMINAL / SEAL / ROUTE':page.layout==='harting-interface-map'?'HOOD / INSERT / CONTACT / CABLE':page.layout==='anderson-power-path'?'POWERPOLE / SB / CONTACT / DUTY':'OUTSIDE / THROUGH-CASE / OIL-WET';
  const openingAlt=page.layout==='yazaki-system-map'?`${name} automotive wiring and connector context`:`${name} industrial control wiring context`;
  return `<section class="pcc-trans-opening"><div class="pcc-trans-opening-copy"><span>${label}</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,openingAlt,'pcc-trans-opening-media')}</section>${regions}<section class="pcc-rich-section pcc-rich-faq pcc-trans-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function richPageMarkup(page,name){
  if(page.layout==='connector-atlas') return connectorAtlasMarkup(page,name);
  if(page.layout==='dsub-blueprint') return dsubBlueprintMarkup(page,name);
  if(page.layout==='usb-signal-flow') return usbSignalFlowMarkup(page,name);
  if(page.layout==='ethernet-channel') return ethernetChannelMarkup(page,name);
  if(page.layout==='agricultural-field-guide') return agriculturalFieldMarkup(page,name);
  if(page.layout==='fuel-circuit-atlas') return fuelCircuitMarkup(page,name);
  if(page.layout==='cockpit-crosscar-map') return cockpitCrosscarMarkup(page,name);
  if(['transmission-fluid-boundary','anderson-power-path','harting-interface-map','yazaki-system-map'].includes(page.layout)) return transmissionBoundaryMarkup(page,name);
  const heading=key=>esc(localized(page.headings?.[key]));
  const image=(src,alt,className='')=>`<figure class="pcc-rich-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1536" height="1024" loading="lazy" decoding="async"></figure>`;
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  return `
  <section class="pcc-rich-section pcc-rich-intro">
    <header class="pcc-rich-heading"><h2>${heading('introduction')}</h2><p>${esc(localized(page.subtitle))}</p></header>
    <div class="pcc-rich-intro-grid"><div class="pcc-rich-lead"><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} product range`,'pcc-rich-media-wide')}</div>
  </section>
  <section class="pcc-rich-section pcc-rich-advantages">
    <header class="pcc-rich-heading"><h2>${heading('advantages')}</h2></header>
    ${richCards(page.variants,'pcc-photo-notes pcc-photo-notes-six pcc-variant-list',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-materials">
    <header class="pcc-rich-heading"><h2>${heading('materials')}</h2></header>
    ${richCards(page.materials,'pcc-photo-notes pcc-photo-notes-four pcc-material-list',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-solutions">
    <header class="pcc-rich-heading"><h2>${heading('solution')}</h2></header>${richCards(page.solutions,'pcc-photo-notes pcc-photo-notes-four pcc-solution-list',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-applications">
    <header class="pcc-rich-heading"><h2>${heading('applications')}</h2></header>
    ${richCards(page.applications,'pcc-photo-notes pcc-photo-notes-six pcc-application-index',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-process">
    <header class="pcc-rich-heading"><h2>${heading('method')}</h2></header>
    ${richCards(page.process,'pcc-photo-notes pcc-photo-notes-six pcc-process-rail',true,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-reliability">
    <header class="pcc-rich-heading"><h2>${heading('reliability')}</h2></header>
    ${richCards(page.reliability,'pcc-photo-notes pcc-photo-notes-four pcc-reliability-list',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-benefits">
    <header class="pcc-rich-heading"><h2>${heading('benefits')}</h2></header>
    ${richCards(page.benefits,'pcc-photo-notes pcc-photo-notes-four pcc-benefit-notes',false,page.images.range)}
  </section>
  <section class="pcc-rich-section pcc-rich-faq">
    <header class="pcc-rich-heading"><h2>${heading('faq')}</h2></header>
    <div class="pcc-faq-grid">${faq}</div>
  </section>`;
}

function usbSignalFlowMarkup(page,name){
  const image=(src,alt,className='')=>`<figure class="pcc-usb-media ${className}"><img src="${esc(src)}" alt="${esc(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
  const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-usb-chapter pcc-usb-chapter-${index%4+1}">
    <div class="pcc-usb-meta"><span>${String(index+1).padStart(2,'0')}</span><p>${esc(localized(chapter.kicker))}</p></div>
    ${image(chapter.image,localized(chapter.title))}
    <div class="pcc-usb-copy"><h2>${esc(localized(chapter.title))}</h2><p class="pcc-usb-summary">${esc(localized(chapter.copy))}</p><div class="pcc-usb-points">${(chapter.points||[]).map(point=>`<section><h3>${esc(localized(point.title))}</h3><p>${esc(localized(point.copy))}</p></section>`).join('')}</div></div>
  </article>`).join('');
  const faq=(page.faq||[]).map((item,index)=>`<details${index===0?' open':''}><summary>${esc(localized(item.q))}</summary><p>${esc(localized(item.a))}</p></details>`).join('');
  const credits=(page.mediaCredits||[]).map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.file)}</a><span>${esc(item.author)} · ${esc(item.license)}</span></li>`).join('');
  return `<section class="pcc-usb-opening"><div class="pcc-usb-opening-copy"><span>SIGNAL / POWER / MECHANICS</span><h2>${esc(localized(page.headings?.introduction))}</h2><p>${esc(localized(page.lead))}</p></div>${image(page.images.range,`${name} interface family`,'pcc-usb-opening-media')}</section><section class="pcc-usb-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-usb-faq"><header class="pcc-rich-heading"><h2>${esc(localized(page.headings?.faq))}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${esc(localized(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
}

function pageTemplate({key,slug,name,group,image,intro,knowledge,notes,delivery,inputs,review,page}){
  const groupName=localized(group.directoryTitle||group.title);
  const canonical=`https://supersmile-tech.com/products/${slug}`;
  const title=`${name} | ${groupName} | Super Smile`;
  const editorialStyle=['custom-harness-01','custom-harness-02','custom-harness-03','custom-harness-04','custom-harness-05','custom-harness-06','custom-harness-07','custom-harness-08','custom-harness-09','custom-harness-10','custom-harness-11','custom-harness-12','cable-assembly-01'].includes(key)
    ? '<link rel="stylesheet" href="/assets/css/prebinder-editorial.css?v=20260912v19">'
    : '';
  const schema={
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Home',item:'https://supersmile-tech.com/'},
        {'@type':'ListItem',position:2,name:'Products',item:'https://supersmile-tech.com/products'},
        {'@type':'ListItem',position:3,name,item:canonical}
      ]},
      {'@type':'WebPage',name,description:intro,url:canonical,isPartOf:{'@type':'WebSite',name:'Super Smile',url:'https://supersmile-tech.com/'}}
    ]
  };
  const bodyContent=page?`<div id="pcc-rich-content">${richPageMarkup(page,name)}</div>`:`<div id="pcc-standard-content">
  <section class="pcc-editorial">
    <div class="pcc-editorial-grid">
      <article class="pcc-story pcc-story-lead"><span>KNOWLEDGE</span><h2 id="pcc-knowledge-title">Construction &amp; Engineering Basics</h2><p id="pcc-knowledge">${esc(knowledge)}</p></article>
      <article class="pcc-story"><span>SELECTION</span><h2 id="pcc-notes-title">Selection Notes</h2><p id="pcc-notes">${esc(notes)}</p></article>
      <article class="pcc-story"><span>DELIVERY</span><h2 id="pcc-delivery-title">Sampling &amp; Delivery</h2><p id="pcc-delivery">${esc(delivery)}</p></article>
    </div>
  </section>
  <section class="pcc-review">
    <div class="pcc-review-grid">
      <article><h2 id="pcc-inputs-title">Information to Send</h2><ul id="pcc-inputs">${list(inputs)}</ul></article>
      <article><h2 id="pcc-review-title">Engineering Review Focus</h2><ul id="pcc-review">${list(review)}</ul></article>
    </div>
  </section></div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(intro)}">
<link rel="stylesheet" href="/assets/css/style.css?v=20260825v3"><link rel="stylesheet" href="/assets/css/industrial-v2.css?v=20260926v94">${editorialStyle}
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#090a0d"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(intro)}"><meta property="og:image" content="https://supersmile-tech.com${esc(image)}">
<script type="application/ld+json">${jsonForScript(schema)}</script>
<script>window.SS_PRODUCT_CATEGORY=${jsonForScript({key,image})};</script>
</head>
<body class="page-product-category${page?' pcc-rich-page':''}" data-category-key="${esc(key)}">
<header class="header"><div class="container"><a class="logo" href="/"><img class="logo-img" src="/assets/images/ss-logo223.png" alt="Super Smile"><span class="logo-text"><span class="logo-name">Super<span>Smile</span></span><small class="logo-sub" id="logo-company"></small></span></a>${staticNavigationMarkup(site.nav)}<div id="lang-box" style="display:flex;gap:4px"></div><button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false"><span class="menu-icon" aria-hidden="true"><span></span><span></span></span></button></div></header>
<main class="pcc-main">
  <section class="pcc-hero">
    <nav class="breadcrumb pcc-breadcrumb" aria-label="Breadcrumb"><a id="pcc-home" href="/">Home</a><span class="crumb-sep" aria-hidden="true"></span><a id="pcc-products" href="/products">Products</a><span class="crumb-sep" aria-hidden="true"></span><span id="pcc-group">${esc(groupName)}</span></nav>
    <div class="pcc-hero-grid">
      <div class="pcc-hero-copy"><span class="pcc-kicker" id="pcc-eyebrow">Product type</span><h1 id="pcc-title">${esc(name)}</h1><span class="pcc-copy-label" id="pcc-overview-label">Overview</span><p id="pcc-intro">${esc(intro)}</p><div class="pcc-actions"><a class="btn btn-primary" id="pcc-cta" href="/contact?category=${esc(key)}&category_name=${encodeURIComponent(name)}">Ask About This Product Type</a><a class="pcc-back-link" id="pcc-back" href="/products">Back to Products</a></div></div>
      <figure class="pcc-hero-media"><img id="pcc-hero-image" src="${esc(image)}" alt="${esc(name)} - ${esc(groupName)}" width="1536" height="1024" decoding="async" fetchpriority="high"></figure>
    </div>
  </section>
  ${bodyContent}
  <section class="pcc-closing"><div><span id="pcc-closing-group">${esc(groupName)}</span><h2 id="pcc-closing-title">${esc(name)}</h2></div><a class="btn btn-primary" id="pcc-closing-cta" href="/contact?category=${esc(key)}&category_name=${encodeURIComponent(name)}">Send Your Requirement</a></section>
</main>
<footer class="footer"><div class="container"><div><h5>SuperSmile</h5><p id="footer-about" style="font-size:14px"></p></div><div><h5>Contact</h5><div id="f-contact" class="footer-contact"></div></div><div><h5>Links</h5><a href="/">Home</a><a href="/custom">Custom Wiring Harness</a><a href="/products">Products</a><a href="/turbo-actuator-harness">Turbo Actuator Harness</a><a href="/obd2-diagnostic-cable">OBD2 Diagnostic Cable</a><a href="/j1939-cable">J1939 Cable</a><a href="/about">About</a><a href="/contact">Contact</a></div></div><p class="seo-keywords">${esc(name.toLowerCase())} | ${esc(groupName.toLowerCase())} | custom cable manufacturer</p><div class="container bot">© <span id="f-year"></span> <span id="f-company"></span> · All Rights Reserved</div></footer>
<div class="toast" id="toast"></div><script src="/assets/js/main.js?v=20261008-gsc1"></script>
</body>
</html>`;
}

await fs.mkdir(path.join(root,'products'),{recursive:true});
const requestedKeys=new Set(process.argv.slice(2));
let count=0;
for(const group of capabilities.groups||[]){
  const fallback=capabilities.categoryDetail?.sets?.[group.id]||{};
  for(let index=0;index<(group.items?.en||[]).length;index+=1){
    const key=`${group.id}-${String(index+1).padStart(2,'0')}`;
    if(requestedKeys.size && !requestedKeys.has(key)) continue;
    const name=group.items.en[index];
    const slug=slugify(name);
    const itemDetail=details[key]||{};
    // Directory-only candidates remain unavailable until their editorial page is approved.
    if(!itemDetail.page) continue;
    const intro=localized(itemDetail.intro||fallback.intro);
    const knowledge=localized(itemDetail.knowledge||itemDetail.intro||fallback.intro);
    const notes=localized(itemDetail.notes)||`${localized(fallback.review||[]).slice(0,3).join('; ')}.`;
    const delivery=localized(itemDetail.delivery)||'After the requirement and interfaces are confirmed, the project moves through material review, sampling, validation and controlled production. Inspection points are agreed for each order.';
    const image=itemDetail.page?.images?.hero||aiImages[key]||group.image;
    const html=pageTemplate({key,slug,name,group,image,intro,knowledge,notes,delivery,inputs:localized(fallback.inputs||[]),review:localized(fallback.review||[]),page:itemDetail.page});
    await fs.writeFile(path.join(root,'products',`${slug}.html`),withPageSeo(withProductGallery(html,key),`/products/${slug}`));
    count+=1;
  }
}

console.log(`Generated ${count} product-category pages.`);
