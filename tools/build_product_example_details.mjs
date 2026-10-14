import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const compiled=path.join(root,'.product-example-scale-qa/compiled-content.json');
const content=JSON.parse(await fs.readFile(compiled,'utf8'));
const media=JSON.parse(await fs.readFile(path.join(root,'.product-example-scale-qa/compiled-media.json'),'utf8'));
const shell=await fs.readFile(path.join(root,'products/braided-protection-harness.html'),'utf8');
const header=shell.match(/<header class="header">[\s\S]*?<\/header>/)[0];
const footer=shell.match(/<footer class="footer">[\s\S]*?<\/footer>/)[0];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=value=>`<span class="pe-copy" lang="en">${esc(value.en)}</span><span class="pe-copy" lang="zh">${esc(value.zh)}</span>`;
const ui=content.sharedCopy;
const literal=(en,zh)=>pair({en,zh});
const image=(m,cls='')=>`<img class="${cls}" src="${esc(m.path)}" width="${m.dimensions[0]}" height="${m.dimensions[1]}" alt="${esc(m.altEn)}" data-pe-alt-en="${esc(m.altEn)}" data-pe-alt-zh="${esc(m.altZh)}" loading="lazy" decoding="async">`;
const link=(url,label,cls='')=>`<a class="${cls}" href="${esc(url)}" data-pe-href="${esc(url)}">${pair(label)} <span aria-hidden="true">↗</span></a>`;

const currentFiles=new Set(content.products.map(p=>p.slug+'.html'));
const retiredRoutes=[];
for(const filename of await fs.readdir(path.join(root,'products'))){
 if(!filename.endsWith('.html')||currentFiles.has(filename))continue;
 const old=await fs.readFile(path.join(root,'products',filename),'utf8');
 if(old.includes('<body class="page-product-example ')){retiredRoutes.push('/products/'+filename.slice(0,-5));await fs.unlink(path.join(root,'products',filename));}
}
for(const p of content.products){
 const m=media.pages[p.id];
 const siblings=content.products.filter(x=>x.categoryId===p.categoryId);
 const other=siblings[(siblings.findIndex(x=>x.id===p.id)+1)%siblings.length]||content.products.find(x=>x.id!==p.id);
 const isM12=p.categoryId==='cable-assembly-02';
 const applications=m.applicationImages;
 const process=m.engineering;
 const inspection=m.inspection;
 const construction=m.construction;
 const canonical='https://supersmile-tech.com'+p.route;
 const inquiry=new URL(p.cta.href,'https://supersmile-tech.com');
 inquiry.searchParams.set('source_page',p.route);
 inquiry.searchParams.set('category_name',p.title.en);
 const inquiryPath=inquiry.pathname+inquiry.search;
 const metadata={title:p.title,description:p.metaDescription,category:p.category,route:p.route,categoryRoute:p.categoryRoute,image:p.heroImage.src};
 const structured={
  '@context':'https://schema.org',
  '@graph':[
   {'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:p.title.en,description:p.metaDescription.en,mainEntity:{'@id':canonical+'#product'}},
   {'@type':'Product','@id':canonical+'#product',name:p.title.en,description:p.metaDescription.en,image:'https://supersmile-tech.com'+p.heroImage.src,url:canonical,category:p.category.en},
   {'@type':'BreadcrumbList',itemListElement:[
    {'@type':'ListItem',position:1,name:'Home',item:'https://supersmile-tech.com/'},
    {'@type':'ListItem',position:2,name:p.category.en,item:'https://supersmile-tech.com'+p.categoryRoute},
    {'@type':'ListItem',position:3,name:p.title.en,item:canonical}
   ]}
  ]
 };

 const html=`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.title.en)} | Super Smile-Tech</title>
<meta name="description" content="${esc(p.metaDescription.en)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="product"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${esc(p.title.en)} | Super Smile-Tech"><meta property="og:description" content="${esc(p.metaDescription.en)}"><meta property="og:image" content="https://supersmile-tech.com${p.heroImage.src}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#090a0d">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/css/style.css?v=20260825v3"><link rel="stylesheet" href="/assets/css/industrial-v2.css?v=20261012-bilingual1"><link rel="stylesheet" href="/assets/css/product-example-detail.css?v=20261014-2">
<script id="pe-structured-data" type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>
<script id="pe-page-data" type="application/json">${JSON.stringify(metadata).replaceAll('<','\\u003c')}</script>
</head><body class="page-product-example ${p.id==='EX-cable-assembly-02-001'?'pe-m12':p.id==='EX-custom-harness-09-001'?'pe-braided':'pe-assembly'} pe-layout-${p.layoutType}">
${header}
<main class="pe-main">
 <section class="pe-hero"><div class="pe-shell">
  <nav class="pe-crumb" aria-label="Breadcrumb"><a href="/" data-pe-href="/">${literal('Home','首页')}</a><i aria-hidden="true">/</i><a href="/products" data-pe-href="/products">${literal('Products','产品中心')}</a><i aria-hidden="true">/</i><a href="${p.categoryRoute}" data-pe-href="${p.categoryRoute}">${pair(p.category)}</a><i aria-hidden="true">/</i><span>${literal('Product details','产品详情')}</span></nav>
  <div class="pe-hero-grid"><div class="pe-product-media">
   <div class="pe-product-stage"><button class="pe-product-view" data-view="full" type="button" aria-label="Open product photograph" data-pe-aria-en="Open product photograph" data-pe-aria-zh="查看产品大图"><img src="${p.heroImage.src}" width="${p.heroImage.dimensions[0]}" height="${p.heroImage.dimensions[1]}" alt="${esc(p.heroImage.alt.en)}" data-pe-alt-en="${esc(p.heroImage.alt.en)}" data-pe-alt-zh="${esc(p.heroImage.alt.zh)}" fetchpriority="high"><span class="pe-zoom-label">${literal('View larger +','点击放大 +')}</span></button></div>
   ${['EX-cable-assembly-02-001','EX-custom-harness-09-001'].includes(p.id)?`<div class="pe-view-tabs" role="group" aria-label="Product photograph views" data-pe-aria-en="Product photograph views" data-pe-aria-zh="产品图片查看方式">${[['full','Complete product','完整产品'],['connector','Connection detail','连接端放大'],['protection','Cable detail',isM12?'出线端放大':'护套与分支']].map(([id,en,zh])=>`<button type="button" data-pe-view="${id}" aria-pressed="${id==='full'}">${literal(en,zh)}</button>`).join('')}</div>`:''}
  </div><div class="pe-hero-copy"><span class="pe-eyebrow">${pair(p.category)}</span><h1>${pair(p.title)}</h1><p>${pair(p.lede)}</p><ul class="pe-quick">${p.quickPoints.map(x=>`<li>${pair(x)}</li>`).join('')}</ul><div class="pe-actions">${link(inquiryPath,ui.ctaLabel,'pe-action')}${link('#pe-configuration',ui.configurationTitle,'pe-action pe-action-outline')}</div></div></div>
 </div></section>
 <nav class="pe-jump-nav" aria-label="On this page" data-pe-aria-en="On this page" data-pe-aria-zh="本页导览"><div class="pe-shell">${[['pe-construction',ui.overviewLabel],['pe-configuration',ui.configurationTitle],['pe-applications',ui.applicationsTitle],['pe-customization',{en:'Customization support',zh:'定制支持'}]].map(([id,label])=>`<a href="#${id}">${pair(label)}<span class="pe-arrow" aria-hidden="true">↘</span></a>`).join('')}</div></nav>
 <section class="pe-section" id="pe-construction"><div class="pe-shell">
  <div class="pe-section-head"><span class="pe-eyebrow">${literal('CONSTRUCTION','结构解析')}</span><h2>${pair(ui.structureTitle)}</h2><p>${pair(p.structureIntro)}</p></div>
  <div class="pe-construction ${construction?'':'pe-construction-text'}">${construction?`<div class="pe-construction-photo">${image(construction)}</div>`:''}<div class="pe-feature-list">${p.structure.map((x,i)=>`<article class="pe-feature"><span class="pe-feature-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${pair(x.title)}</h3><p>${pair(x.text)}</p></article>`).join('')}</div></div>
 </div></section>
 <section class="pe-section pe-configuration" id="pe-configuration"><div class="pe-shell pe-config-grid"><div class="pe-config-copy"><span class="pe-eyebrow">${literal('CONFIGURATION','结构与选配')}</span><h2>${pair(ui.configurationTitle)}</h2><p>${pair(ui.configurationLead)}</p></div><table class="pe-config-table"><tbody>${p.configuration.map(x=>`<tr><th scope="row">${pair(x.label)}</th><td>${pair(x.value)}</td></tr>`).join('')}</tbody></table></div></section>
 <section class="pe-section pe-applications" id="pe-applications"><div class="pe-shell"><div class="pe-section-head"><span class="pe-eyebrow">${literal('APPLICATIONS','连接的应用')}</span><h2>${pair(ui.applicationsTitle)}</h2><p>${pair(p.applicationsIntro)}</p></div><div class="pe-app-grid">${p.applications.map((x,i)=>`<article class="pe-app ${applications[i]?'':'pe-app-text'}">${applications[i]?`<div class="pe-app-media">${image(applications[i])}<h3>${pair(x.title)}</h3></div>`:`<div class="pe-app-heading"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${pair(x.title)}</h3></div>`}<p>${pair(x.text)}</p></article>`).join('')}</div></div></section>
 <section class="pe-section" id="pe-customization"><div class="pe-shell"><div class="pe-section-head"><span class="pe-eyebrow">${literal('ENGINEERING & PRODUCTION','工程与制造')}</span><h2>${pair(ui.customizationTitle)}</h2></div><div class="pe-support-grid"><div class="pe-support-media">${process?image(process):''}<div class="pe-motto">${pair(ui.slogan)}</div>${inspection?`<div class="pe-inspection-media">${image(inspection)}</div>`:''}</div><div class="pe-support-list"><article class="pe-manufacturing"><h3>${pair(p.manufacturing.title)}</h3><p>${pair(p.manufacturing.text)}</p></article>${p.customization.map(x=>`<article><h3>${pair(x.title)}</h3><p>${pair(x.text)}</p></article>`).join('')}</div></div></div></section>
 <section class="pe-section pe-faq"><div class="pe-shell pe-faq-grid"><div><span class="pe-eyebrow">${literal('PRODUCT QUESTIONS','产品问答')}</span><h2>${pair(ui.faqTitle)}</h2></div><div>${p.faq.map(x=>`<details><summary>${pair(x.question)}</summary><p>${pair(x.answer)}</p></details>`).join('')}</div></div></section>
 <section class="pe-cta"><div class="pe-shell pe-cta-grid"><div><h2>${pair(p.cta.title)}</h2><p>${pair(p.cta.text)}</p></div>${link(inquiryPath,p.cta.button,'pe-action')}</div></section>
 <nav class="pe-bottom-nav" aria-label="Continue exploring" data-pe-aria-en="Continue exploring" data-pe-aria-zh="继续了解产品"><div class="pe-shell">${link(p.categoryRoute,ui.relatedLabel)}${link(other.route,{en:other.title.en,zh:other.title.zh})}${link('/custom',ui.ctaProcess)}</div></nav>
</main>
${footer}
<dialog class="pe-image-dialog" aria-labelledby="pe-dialog-title"><div class="pe-dialog-head"><h2 id="pe-dialog-title">${pair(p.title)}</h2><button class="pe-dialog-close" type="button" aria-label="Close product photograph" data-pe-aria-en="Close product photograph" data-pe-aria-zh="关闭产品大图">×</button></div><img src="${p.heroImage.src}" width="${p.heroImage.dimensions[0]}" height="${p.heroImage.dimensions[1]}" alt="${esc(p.heroImage.alt.en)}" data-pe-alt-en="${esc(p.heroImage.alt.en)}" data-pe-alt-zh="${esc(p.heroImage.alt.zh)}"></dialog>
<div class="toast" id="toast"></div>
<script defer src="/assets/js/seo-policy.js?v=20261014-examples2"></script><script defer src="/assets/js/main.js?v=20261012-bilingual1"></script><script defer src="/assets/js/product-example-detail.js?v=20261014-2"></script>
</body></html>\n`;
 await fs.writeFile(path.join(root,'products',p.slug+'.html'),html);
}
const sitemapPath=path.join(root,'sitemap.xml');
let sitemap=await fs.readFile(sitemapPath,'utf8');
for(const route of retiredRoutes){const url='https://supersmile-tech.com'+route;sitemap=sitemap.replace(new RegExp('\\s*<url><loc>'+url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'<\\/loc>[\\s\\S]*?<\\/url>'), '');}
for(const p of content.products){
 const url='https://supersmile-tech.com'+p.route;
 if(!sitemap.includes('<loc>'+url+'</loc>'))sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc><lastmod>2026-10-14</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n</urlset>`);
 const parent='https://supersmile-tech.com'+p.categoryRoute;
 sitemap=sitemap.replace(new RegExp('(<loc>'+parent.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'<\\/loc><lastmod>)[^<]+'),(_all,prefix)=>prefix+'2026-10-14');
}
await fs.writeFile(sitemapPath,sitemap);
const {buildSeoPolicy,withSeoPolicy}=await import('./seo_policy.mjs');
const policy=await buildSeoPolicy(root);
for(const p of content.products){
 const filename=path.join(root,'products',p.slug+'.html');
 const html=await fs.readFile(filename,'utf8');
 await fs.writeFile(filename,withSeoPolicy(html,p.route,policy));
}
console.log('Built '+content.products.length+' bilingual product presentation pages.');
