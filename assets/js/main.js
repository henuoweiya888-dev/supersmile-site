/* Super Smile site - data driven */
let SITE = null, PRODS = null, LANG = 'en';

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

function setText(sel, val){ const el = $(sel); if(el) el.textContent = val ?? ''; }
function setHTML(sel, val){ const el = $(sel); if(el) el.innerHTML = val ?? ''; }

function t(o){
  if(!o) return '';
  if(LANG==='zh'){
    if(o.zh!=null) return o.zh;
    if(o.cn!=null) return o.cn;
    for(const k of Object.keys(o)) if(k.endsWith('_zh') && o[k]!=null) return o[k];
    return (o.en ?? o.cn ?? '');
  } else {
    if(o.en!=null) return o.en;
    for(const k of Object.keys(o)) if(k.endsWith('_en') && o[k]!=null) return o[k];
    return (o.cn ?? o.zh ?? '');
  }
}
function tf(o, zhK, enK){ return o ? (LANG==='zh' ? (o[zhK] ?? '') : (o[enK] ?? '')) : ''; }

async function loadData(){
  if (SITE) return;
  const [s, p] = await Promise.all([
    fetch('/data/site.json').then(r=>r.json()),
    fetch('/data/products.json').then(r=>r.json())
  ]);
  SITE = s; PRODS = p;
  LANG = localStorage.getItem('lang') || 'en';
}

function renderNav(){
  const nav = $('#nav-links'); if(!nav) return;
  const n = SITE.nav;
  const links = [
    ['index.html', tf(n,'home_zh','home_en')], ['custom.html', tf(n,'custom_zh','custom_en')],
    ['products.html', tf(n,'products_zh','products_en')], ['about.html', tf(n,'about_zh','about_en')],
    ['contact.html', tf(n,'contact_zh','contact_en')]
  ];
  const here = location.pathname.split('/').pop() || 'index.html';
  nav.innerHTML = links.map(([href,label]) =>
    `<a href="${href}" class="${href===here?'active':''}">${label}</a>`).join('')
    + `<a href="contact.html" class="nav-cta">${tf(n,'quote_zh','quote_en')}</a>`;
}

function renderLangToggle(){
  const box = $('#lang-box'); if(!box) return;
  box.innerHTML = `<button class="filter-btn ${LANG==='en'?'active':''}" data-lang="en">EN</button>
                   <button class="filter-btn ${LANG==='zh'?'active':''}" data-lang="zh">中文</button>`;
  $$('.filter-btn[data-lang]', box).forEach(b=>b.onclick=()=>{
    LANG = b.dataset.lang; localStorage.setItem('lang', LANG); renderAll();
  });
}

function renderHero(){
  if(!SITE.hero) return;
  const hero = SITE.hero;
  const h = $('#hero');
  if(h){
    h.style.backgroundImage = `linear-gradient(135deg, rgba(10,37,64,.94), rgba(18,58,99,.9), rgba(26,79,138,.88)), url(${hero.image})`;
    h.style.backgroundSize = 'cover'; h.style.backgroundPosition = 'center';
  }
  setText('#hero-badge', tf(hero,'badge_zh','badge_en'));
  setHTML('#hero-title', tf(hero,'title_zh','title_en'));
  setText('#hero-sub', tf(hero,'subtitle_zh','subtitle_en'));
  setText('#hero-btn1', tf(hero,'btn1_zh','btn1_en'));
  setText('#hero-btn2', tf(hero,'btn2_zh','btn2_en'));
  const st = $('#hero-stats');
  if(st && SITE.stats){
    st.innerHTML = SITE.stats.map(s=>`<div class="stat"><b>${s.num}${s.unit?' '+s.unit:''}</b><span>${tf(s,'label_zh','label_en')}</span></div>`).join('');
  }
}

function renderCustom(){
  if(!SITE.custom_intro) return;
  setText('#ci-tag', tf(SITE.custom_intro,'tag_zh','tag_en'));
  setText('#ci-title', tf(SITE.custom_intro,'title_zh','title_en'));
  setText('#ci-desc', tf(SITE.custom_intro,'desc_zh','desc_en'));
  const f = $('#features');
  if(f && SITE.features){
    f.innerHTML = SITE.features.map(x=>`<div class="card"><div class="ico">${x.ico}</div><h3>${tf(x,'title_zh','title_en')}</h3><p>${tf(x,'desc_zh','desc_en')}</p></div>`).join('');
  }
}

function renderProcess(){
  if(!SITE.process) return;
  setText('#pr-tag', tf(SITE.process,'tag_zh','tag_en'));
  setText('#pr-title', tf(SITE.process,'title_zh','title_en'));
  const ps = $('#process-steps');
  if(ps && SITE.process.steps){
    ps.innerHTML = SITE.process.steps.map(s=>
      `<div class="step"><span class="num">${s.num}</span><h4>${tf(s,'title_zh','title_en')}</h4><p>${tf(s,'desc_zh','desc_en')}</p></div>`).join('');
  }
}

function renderApps(){
  if(!SITE.apps) return;
  setText('#ap-tag', tf(SITE.apps,'tag_zh','tag_en'));
  setText('#ap-title', tf(SITE.apps,'title_zh','title_en'));
  const a = $('#apps');
  if(a){
    a.innerHTML = SITE.apps[LANG==='zh'?'items_zh':'items_en'].map(x=>`<div class="app">${x}</div>`).join('');
  }
}

function renderFactory(){
  if(!SITE.factory) return;
  setText('#fa-tag', tf(SITE.factory,'tag_zh','tag_en'));
  setText('#fa-title', tf(SITE.factory,'title_zh','title_en'));
  setText('#fa-desc', tf(SITE.factory,'desc_zh','desc_en'));
  setText('#fa-clients', tf(SITE.factory,'clients_zh','clients_en'));
  const fi = $('#fact-imgs');
  if(fi && SITE.factory.images){
    fi.innerHTML = SITE.factory.images.map(i=>`<img src="${i}" alt="factory" loading="lazy">`).join('');
  }
}

function renderCerts(){
  if(!SITE.certs) return;
  setText('#ce-tag', tf(SITE.certs,'tag_zh','tag_en'));
  setText('#ce-title', tf(SITE.certs,'title_zh','title_en'));
  const cg = $('#cert-grid');
  if(cg && SITE.certs.items){
    cg.innerHTML = SITE.certs.items.map(x=>
      `<div class="cert">${x.img?`<img src="${x.img}" alt="${x.name}" style="max-height:160px;margin:0 auto 10px;object-fit:contain">`:''}<b>${x.name}</b><span>${tf(x,'desc_zh','desc_en')}</span></div>`).join('');
  }
}

function renderBlocks(){
  const c = $('#blocks');
  if(!c || !SITE.blocks) return;
  c.innerHTML = SITE.blocks.map((b, i)=>{
    const hasImg = b.image ? true : false;
    const hasLink = b.link ? true : false;
    const rev = i % 2 === 1 ? 'block-rev' : '';
    return `<div class="block ${rev}">
      ${hasImg ? `<div class="block-img"><img src="${b.image}" alt="${tf(b,'title_zh','title_en')}" loading="lazy"></div>` : ''}
      <div class="block-txt">
        <h3>${tf(b,'title_zh','title_en')}</h3>
        <p>${tf(b,'text_zh','text_en')}</p>
        ${hasLink ? `<a class="btn btn-primary" href="${b.link}" target="_blank">${tf(b,'link_text_zh','link_text_en') || 'Learn More'}</a>` : ''}
      </div>
    </div>`;
  }).join('');
}

function renderProductsTeaser(){
  if(!PRODS) return;
  setText('#pt-tag', tf(SITE.products_teaser,'tag_zh','tag_en'));
  setText('#pt-title', tf(SITE.products_teaser,'title_zh','title_en'));
  setText('#pt-desc', tf(SITE.products_teaser,'desc_zh','desc_en'));
  const grid = $('#cat-cards');
  if(grid){
    grid.innerHTML = PRODS.categories.map(c=>{
      const img = c.products[0] && c.products[0].images[0] || '';
      return `<a class="cat-card" href="products.html#${c.id}">
        <img src="${img}" alt="${t(c)}" loading="lazy">
        <div class="cat-body"><h3>${t(c)}</h3><p>${tf(c,'desc_cn','desc_en')}</p></div></a>`;
    }).join('');
  }
}

function renderCTA(){
  if(!SITE.cta) return;
  setText('#cta-title', tf(SITE.cta,'title_zh','title_en'));
  setText('#cta-desc', tf(SITE.cta,'desc_zh','desc_en'));
}

function renderFooter(){
  if(!SITE) return;
  setText('#footer-about', tf(SITE,'footer_about_zh','footer_about_en'));
  const c = SITE.contact;
  const fe = $('#f-email'); if(fe){ fe.textContent = c.email; fe.href = 'mailto:'+c.email; }
  const fw = $('#f-whatsapp'); if(fw){ fw.textContent = c.whatsapp; fw.href = c.whatsapp_link; }
  const fa = $('#f-alibaba'); if(fa) fa.href = c.alibaba;
  const fl = $('#f-links'); if(fl && c.links){
    fl.innerHTML = c.links.map(l=>`<a href="${l.url}" target="_blank">${tf(l,'label_zh','label_en')}</a>`).join('');
  }
  const year = $('#f-year'); if(year) year.textContent = new Date().getFullYear();
  const co = $('#f-company'); if(co) co.textContent = SITE.company.name_en;
}

function renderProductsPage(){
  const grid = $('#prod-grid'); if(!grid || !PRODS) return;
  const here = location.hash ? location.hash.slice(1) : PRODS.categories[0].id;
  const f = $('#filters');
  if(f){
    f.innerHTML = PRODS.categories.map(c=>`<button class="filter-btn ${c.id===here?'active':''}" data-cat="${c.id}">${t(c)}</button>`).join('');
    $$('.filter-btn[data-cat]', f).forEach(b=>b.onclick=()=>{
      location.hash = b.dataset.cat; renderProductsPage();
    });
  }
  const cat = PRODS.categories.find(c=>c.id===here) || PRODS.categories[0];
  const head = $('#cat-head');
  if(head){ head.innerHTML = `<h2>${t(cat)}</h2><p>${tf(cat,'desc_cn','desc_en')}</p>`; }
  grid.innerHTML = cat.products.map(p=>`
    <div class="prod">
      <img src="${p.images[0]}" alt="${t(p)}" loading="lazy">
      <div class="info"><b>${t(p)}</b><span>${p.en}</span></div>
    </div>`).join('');
}

function renderContact(){
  const c = $('#contact-info'); if(!c || !SITE) return;
  const ct = SITE.contact, co = SITE.company;
  const links = (ct.links && ct.links.length) ? ct.links.map(l=>
    `<div class="ci">🔗<div><b>${tf(l,'label_zh','label_en')}</b><span><a href="${l.url}" target="_blank">${l.url}</a></span></div></div>`).join('') : '';
  c.innerHTML = `
    <div class="ci">📧<div><b>Email</b><span>${ct.email}</span></div></div>
    <div class="ci">💬<div><b>WhatsApp</b><span>${ct.whatsapp} (${tf(ct,'sales_zh','sales_en')})</span></div></div>
    ${links}
    <div class="ci">📍<div><b>${t({en:'Address',zh:'地址'})}</b><span>${tf(co,'address_zh','address_en')}</span></div></div>
    <div class="ci">🏭<div><b>${t({en:'Company',zh:'公司'})}</b><span>${co.name_en}</span></div></div>`;
  const wa = $('#contact-wa'); if(wa){ wa.textContent = ct.whatsapp; wa.href = ct.whatsapp_link; }
}

function renderAbout(){
  const co = SITE && SITE.company;
  if(!co) return;
  const el = $('#about-company'); if(el) el.textContent = co.name_en;
  setText('#about-addr', tf(co,'address_zh','address_en'));
  setText('#about-certs', tf(co,'cert_notes_zh','cert_notes_en'));
}

function renderTitle(){
  document.title = `Super Smile | ${t({en:'Custom Wiring Harness & Diagnostic Cable Manufacturer', zh:'定制线束与诊断线制造商'})}`;
}

function renderAll(){
  renderNav(); renderLangToggle();
  renderHero(); renderCustom(); renderProcess(); renderApps();
  renderFactory(); renderCerts(); renderProductsTeaser(); renderCTA();
  renderFooter(); renderBlocks(); renderProductsPage(); renderContact(); renderAbout(); renderTitle();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await loadData(); }catch(e){ console.error(e); return; }
  renderAll();
  const tg = $('#nav-toggle');
  if(tg) tg.onclick = ()=>{ $('#nav-links').classList.toggle('open'); };
  const form = $('#contact-form');
  if(form) form.onsubmit = (ev)=>{
    ev.preventDefault();
    const name = $('#cf-name').value, email = $('#cf-email').value, msg = $('#cf-msg').value;
    const subj = encodeURIComponent('Inquiry from website - ' + name);
    const body = encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+msg);
    window.location.href = `mailto:${SITE.contact.email}?subject=${subj}&body=${body}`;
  };
});
