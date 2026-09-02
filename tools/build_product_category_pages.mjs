import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const capabilities=JSON.parse(await fs.readFile(path.join(root,'data/product-capabilities.json'),'utf8'));
const details=JSON.parse(await fs.readFile(path.join(root,'data/product-category-details.json'),'utf8'));
const langCodes=['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','tr','vi','ko','it','nl','pl','th'];
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
  'custom-harness-12':'/assets/images/product-categories/ai/web/custom-harness-12-low-voltage-new-energy-wire-harness.jpg'
};

function alternates(slug){
  const canonical=`https://supersmile-tech.com/products/${slug}`;
  return [...langCodes.map(code=>`<link rel="alternate" hreflang="${code==='zh'?'zh-CN':code}" href="${canonical}?lang=${code}">`),`<link rel="alternate" hreflang="x-default" href="${canonical}?lang=en">`].join('\n');
}

function list(items){
  return (items||[]).map(item=>`<li>${esc(item)}</li>`).join('');
}

function richCards(items,className='pcc-photo-notes',ordered=false,fallbackImage=''){
  const wrapper=ordered?'ol':'div';
  const card=ordered?'li':'article';
  return `<${wrapper} class="${className}">${(items||[]).map((item,index)=>`<${card} class="pcc-photo-note"><figure class="pcc-item-media pcc-mask-${index%4+1}"><img src="${esc(item.image||fallbackImage)}" alt="${esc(localized(item.title))}" width="800" height="600" loading="lazy" decoding="async"></figure><div class="pcc-photo-copy"><h3>${esc(localized(item.title))}</h3><p>${esc(localized(item.copy))}</p></div></${card}>`).join('')}</${wrapper}>`;
}

function richPageMarkup(page,name){
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

function pageTemplate({key,slug,name,group,image,intro,knowledge,notes,delivery,inputs,review,page}){
  const groupName=localized(group.directoryTitle||group.title);
  const canonical=`https://supersmile-tech.com/products/${slug}`;
  const title=`${name} | ${groupName} | Super Smile`;
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
<link rel="stylesheet" href="/assets/css/style.css?v=20260825v3"><link rel="stylesheet" href="/assets/css/industrial-v2.css?v=20260902v50">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#090a0d"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(intro)}"><meta property="og:image" content="https://supersmile-tech.com${esc(image)}">
${alternates(slug)}
<script type="application/ld+json">${jsonForScript(schema)}</script>
<script>window.SS_PRODUCT_CATEGORY=${jsonForScript({key,image})};</script>
</head>
<body class="page-product-category${page?' pcc-rich-page':''}" data-category-key="${esc(key)}">
<header class="header"><div class="container"><a class="logo" href="/"><img class="logo-img" src="/assets/images/ss-logo223.png" alt="Super Smile"><span class="logo-text"><span class="logo-name">Super<span>Smile</span></span><small class="logo-sub" id="logo-company"></small></span></a><nav class="nav" id="nav-links"></nav><div id="lang-box" style="display:flex;gap:4px"></div><button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false"><span class="menu-icon" aria-hidden="true"><span></span><span></span></span></button></div></header>
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
<footer class="footer"><div class="container"><div><h5>SuperSmile</h5><p id="footer-about" style="font-size:14px"></p></div><div><h5>Contact</h5><div id="f-contact" class="footer-contact"></div></div><div><h5>Links</h5><a href="/">Home</a><a href="/custom">Custom Wiring Harness</a><a href="/products">Products</a><a href="/products/turbo-actuator-cables">Turbo Actuator Cables</a><a href="/products/obd2-and-universal-diagnostic-cables">OBD2 &amp; Universal Diagnostic Cables</a><a href="/products/heavy-duty-j1939-diagnostic-cables">Heavy-Duty J1939 Diagnostic Cables</a><a href="/about">About</a><a href="/contact">Contact</a></div></div><p class="seo-keywords">${esc(name.toLowerCase())} | ${esc(groupName.toLowerCase())} | custom cable manufacturer</p><div class="container bot">© <span id="f-year"></span> <span id="f-company"></span> · All Rights Reserved</div></footer>
<div class="fab" id="fab"><button class="fab-main" id="fab-main" type="button" aria-label="Contact"><span class="fab-icon"></span><span class="fab-label">Contact</span></button><div class="fab-menu" id="fab-menu"><a class="fab-item email" id="fab-email" href="mailto:sales@supersmile-tech.com">Email</a><button class="fab-item online" id="fab-online" type="button">Online Message</button><a class="fab-item wa" id="fab-wa" href="https://wa.me/447516289817" target="_blank" rel="noopener">WhatsApp</a></div></div>
<div class="contact-modal" id="contact-modal"><div class="contact-modal-overlay" data-close></div><div class="contact-modal-box" role="dialog" aria-modal="true"><button class="modal-close" type="button" data-close aria-label="Close">×</button><h3 id="modal-title">Send Us a Message</h3><form id="modal-form"><div class="field"><label id="modal-label-name">Name</label><input id="modal-name" required placeholder="Your name"></div><div class="field"><label id="modal-label-email">Email</label><input id="modal-email" type="email" required placeholder="you@company.com"></div><div class="field"><label id="modal-label-message">Message</label><textarea id="modal-message" required placeholder="Describe your requirement..."></textarea></div><button class="btn btn-primary" type="submit" id="modal-submit" style="width:100%">Send Message</button></form><p style="margin-top:12px;font-size:13px;text-align:center"><a id="modal-wa" href="#" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div></div>
<div class="toast" id="toast"></div><script src="/assets/js/main.js?v=20260902v45"></script>
</body>
</html>`;
}

await fs.mkdir(path.join(root,'products'),{recursive:true});
let count=0;
for(const group of capabilities.groups||[]){
  const fallback=capabilities.categoryDetail?.sets?.[group.id]||{};
  for(let index=0;index<(group.items?.en||[]).length;index+=1){
    const key=`${group.id}-${String(index+1).padStart(2,'0')}`;
    const name=group.items.en[index];
    const slug=slugify(name);
    const itemDetail=details[key]||{};
    const intro=localized(itemDetail.intro||fallback.intro);
    const knowledge=localized(itemDetail.knowledge||itemDetail.intro||fallback.intro);
    const notes=localized(itemDetail.notes)||`${localized(fallback.review||[]).slice(0,3).join('; ')}.`;
    const delivery=localized(itemDetail.delivery)||'After the requirement and interfaces are confirmed, the project moves through material review, sampling, validation and controlled production. Inspection points are agreed for each order.';
    const image=itemDetail.page?.images?.hero||aiImages[key]||group.image;
    const html=pageTemplate({key,slug,name,group,image,intro,knowledge,notes,delivery,inputs:localized(fallback.inputs||[]),review:localized(fallback.review||[]),page:itemDetail.page});
    await fs.writeFile(path.join(root,'products',`${slug}.html`),html);
    count+=1;
  }
}

console.log(`Generated ${count} product-category pages.`);
