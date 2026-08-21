/* Super Smile site - 20 languages */
let SITE = null, PRODS = null, LANG = 'en';
const LANGS = [
  {code:'en',name:'English',flag:'🇬🇧'},{code:'zh',name:'中文',flag:'🇨🇳'},
  {code:'hi',name:'हिन्दी',flag:'🇮🇳'},{code:'es',name:'Español',flag:'🇪🇸'},
  {code:'fr',name:'Français',flag:'🇫🇷'},{code:'ar',name:'العربية',flag:'🇸🇦'},
  {code:'bn',name:'বাংলা',flag:'🇧🇩'},{code:'pt',name:'Português',flag:'🇵🇹'},
  {code:'ru',name:'Русский',flag:'🇷🇺'},{code:'ur',name:'اردو',flag:'🇵🇰'},
  {code:'id',name:'Indonesia',flag:'🇮🇩'},{code:'de',name:'Deutsch',flag:'🇩🇪'},
  {code:'ja',name:'日本語',flag:'🇯🇵'},{code:'tr',name:'Türkçe',flag:'🇹🇷'},
  {code:'vi',name:'Tiếng Việt',flag:'🇻🇳'},{code:'ko',name:'한국어',flag:'🇰🇷'},
  {code:'it',name:'Italiano',flag:'🇮🇹'},{code:'nl',name:'Nederlands',flag:'🇳🇱'},
  {code:'pl',name:'Polski',flag:'🇵🇱'},{code:'th',name:'ไทย',flag:'🇹🇭'}
];



const HOT = {
  en:{title:'Hot Products · Turbo Actuator Connecting Harness', desc:'Heat-resistant fiberglass tube, custom OEM/ODM for turbo actuator wiring. Samples available.'},
  zh:{title:'热卖产品·涡轮增压执行器连接线', desc:'耐高温玻纤管，适配涡轮执行器线束定制，OEM/ODM可打样。'}
};

const UI = {
  en:{title:'Send Us a Message',name:'Name',email:'Email',message:'Message',send:'Send Message',wa:'Chat on WhatsApp'},
  zh:{title:'给我们留言',name:'姓名',email:'邮箱',message:'留言内容',send:'发送消息',wa:'在 WhatsApp 上聊'},
  hi:{title:'हमें संदेश भेजें',name:'नाम',email:'ईमेल',message:'संदेश',send:'संदेश भेजें',wa:'WhatsApp पर चैट करें'},
  es:{title:'Envíenos un mensaje',name:'Nombre',email:'Correo electrónico',message:'Mensaje',send:'Enviar mensaje',wa:'Chatear por WhatsApp'},
  fr:{title:'Envoyez-nous un message',name:'Nom',email:'E-mail',message:'Message',send:'Envoyer le message',wa:'Discuter sur WhatsApp'},
  ar:{title:'أرسل لنا رسالة',name:'الاسم',email:'البريد الإلكتروني',message:'الرسالة',send:'إرسال الرسالة',wa:'الدردشة عبر واتساب'},
  bn:{title:'আমাদের মেসেজ পাঠান',name:'নাম',email:'ইমেইল',message:'মেসেজ',send:'মেসেজ পাঠান',wa:'WhatsApp-এ চ্যাট করুন'},
  pt:{title:'Envie-nos uma mensagem',name:'Nome',email:'E-mail',message:'Mensagem',send:'Enviar mensagem',wa:'Conversar no WhatsApp'},
  ru:{title:'Напишите нам',name:'Имя',email:'Email',message:'Сообщение',send:'Отправить сообщение',wa:'Написать в WhatsApp'},
  ur:{title:'ہمیں پیغام بھیجیں',name:'نام',email:'ای میل',message:'پیغام',send:'پیغام بھیجیں',wa:'WhatsApp پر چیٹ کریں'},
  id:{title:'Kirim Pesan kepada Kami',name:'Nama',email:'Email',message:'Pesan',send:'Kirim Pesan',wa:'Chat via WhatsApp'},
  de:{title:'Nachricht senden',name:'Name',email:'E-Mail',message:'Nachricht',send:'Nachricht senden',wa:'Auf WhatsApp chatten'},
  ja:{title:'メッセージを送る',name:'名前',email:'メール',message:'メッセージ',send:'送信する',wa:'WhatsAppでチャット'},
  tr:{title:'Bize Mesaj Gönderin',name:'Ad',email:'E-posta',message:'Mesaj',send:'Mesaj Gönder',wa:"WhatsApp'ta Sohbet Et"},
  vi:{title:'Gửi tin nhắn cho chúng tôi',name:'Tên',email:'Email',message:'Tin nhắn',send:'Gửi tin nhắn',wa:'Trò chuyện trên WhatsApp'},
  ko:{title:'메시지 보내기',name:'이름',email:'이메일',message:'메시지',send:'메시지 보내기',wa:'WhatsApp으로 채팅'},
  it:{title:'Inviaci un messaggio',name:'Nome',email:'Email',message:'Messaggio',send:'Invia messaggio',wa:'Chatta su WhatsApp'},
  nl:{title:'Stuur ons een bericht',name:'Naam',email:'E-mail',message:'Bericht',send:'Bericht versturen',wa:'Chatten op WhatsApp'},
  pl:{title:'Wyślij nam wiadomość',name:'Imię',email:'E-mail',message:'Wiadomość',send:'Wyślij wiadomość',wa:'Czatuj na WhatsApp'},
  th:{title:'ส่งข้อความถึงเรา',name:'ชื่อ',email:'อีเมล',message:'ข้อความ',send:'ส่งข้อความ',wa:'แชทบน WhatsApp'}
};

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
function setText(sel, val){ const el=$(sel); if(el) el.textContent = val ?? ''; }
function setHTML(sel, val){ const el=$(sel); if(el) el.innerHTML = val ?? ''; }
// 多语言取值：o[LANG] 回退 o.en 回退空
function t(o){
  if(!o) return '';
  if(typeof o === 'string') return o;
  return o[LANG] || o.en || o.zh || Object.values(o).find(v=>v) || '';
}

async function loadData(){
  if(SITE) return;
  const [s,p] = await Promise.all([
    fetch('/data/site.json').then(r=>r.json()),
    fetch('/data/products.json').then(r=>r.json())
  ]);
  SITE=s; PRODS=p;
  LANG = localStorage.getItem('lang') || 'en';
  // 若存储的语言不在列表，回退en
  if(!LANGS.some(l=>l.code===LANG)) LANG='en';
}

function renderLangSelector(){
  const box = $('#lang-box'); if(!box) return;
  const cur = LANGS.find(l=>l.code===LANG) || LANGS[0];
  box.innerHTML = `<button class="lang-btn" id="lang-btn">${cur.flag} ${cur.name} ▾</button>
    <div class="lang-menu" id="lang-menu">${LANGS.map(l=>
      `<button class="lang-opt ${l.code===LANG?'active':''}" data-lang="${l.code}">${l.flag} ${l.name}</button>`).join('')}</div>`;
  const btn=$('#lang-btn'), menu=$('#lang-menu');
  btn.onclick=(e)=>{ e.stopPropagation(); menu.classList.toggle('open'); };
  document.addEventListener('click',()=>menu.classList.remove('open'));
  $$('.lang-opt', box).forEach(b=>b.onclick=()=>{
    LANG=b.dataset.lang; localStorage.setItem('lang', LANG); menu.classList.remove('open'); renderAll();
  });
}

function renderNav(){
  const nav=$('#nav-links'); if(!nav) return;
  const n=SITE.nav;
  const links=[['index.html','home'],['custom.html','custom'],['products.html','products'],['about.html','about'],['contact.html','contact']];
  const here=location.pathname.split('/').pop()||'index.html';
  nav.innerHTML=links.map(([href,k])=>`<a href="${href}" class="${href===here?'active':''}">${t(n[k])}</a>`).join('')
    +`<a href="contact.html" class="nav-cta">${t(n.quote)}</a>`;
}

function renderHero(){
  if(!SITE.hero) return;
  const h=$('#hero'); const hero=SITE.hero;
  if(h){ h.style.backgroundImage=`linear-gradient(135deg, rgba(10,37,64,.94), rgba(18,58,99,.9), rgba(26,79,138,.88)), url(${hero.image})`; h.style.backgroundSize='cover'; h.style.backgroundPosition='center'; }
  setText('#hero-badge', t(hero.badge));
  setHTML('#hero-title', t(hero.title));
  setText('#hero-sub', t(hero.subtitle));
  setText('#hero-btn1', t(hero.btn1));
  setText('#hero-btn2', t(hero.btn2));
  const st=$('#hero-stats');
  if(st && SITE.stats) st.innerHTML=SITE.stats.map(s=>`<div class="stat"><b>${s.num}${s.unit?' '+s.unit:''}</b><span>${t(s.label)}</span></div>`).join('');
}

function renderCustom(){
  if(!SITE.custom_intro) return;
  setText('#ci-tag', t(SITE.custom_intro.tag));
  setText('#ci-title', t(SITE.custom_intro.title));
  setText('#ci-desc', t(SITE.custom_intro.desc));
  const f=$('#features');
  if(f && SITE.features) f.innerHTML=SITE.features.map(x=>`<div class="card"><div class="card-head"><span class="ico">${x.ico}</span><h3>${t(x.title)}</h3></div><p>${t(x.desc)}</p></div>`).join('');
}

function renderProcess(){
  if(!SITE.process) return;
  setText('#pr-tag', t(SITE.process.tag));
  setText('#pr-title', t(SITE.process.title));
  const ps=$('#process-steps');
  if(ps && SITE.process.steps) ps.innerHTML=SITE.process.steps.map((s,i)=>`${i>0?'<div class="step-arrow">→</div>':''}<div class="step"><div class="step-head"><span class="num">${s.num}</span><h4>${t(s.title)}</h4></div></div>`).join('');
}

function renderApps(){
  if(!SITE.apps) return;
  setText('#ap-tag', t(SITE.apps.tag));
  setText('#ap-title', t(SITE.apps.title));
  const a=$('#apps');
  const icons=['🔌','🚛','🔋','🏭','🏥','🤖','🚢','🔧'];
  if(a && SITE.apps.items){ let items=SITE.apps.items[LANG]||SITE.apps.items.en||[]; if(typeof items==='string') items=items.split('|').map(x=>x.trim()).filter(Boolean); a.innerHTML=`<div class="apps-box">${items.map((x,i)=>`<div class="app"><span class="app-ico">${icons[i]||'🔌'}</span><span>${x}</span></div>`).join('')}</div>`; }
}

function renderFactory(){
  if(!SITE.factory) return;
  setText('#fa-tag', t(SITE.factory.tag));
  setText('#fa-title', t(SITE.factory.title));
  setText('#fa-desc', t(SITE.factory.desc));
  setText('#fa-clients', t(SITE.factory.clients));
  const fi=$('#fact-imgs'); if(fi && SITE.factory.images) fi.innerHTML=SITE.factory.images.map(i=>`<img src="${i}" alt="factory" loading="lazy">`).join('');
}

function renderCerts(){
  if(!SITE.certs) return;
  setText('#ce-tag', t(SITE.certs.tag));
  setText('#ce-title', t(SITE.certs.title));
  const cg=$('#cert-grid');
  if(cg && SITE.certs.items) cg.innerHTML=SITE.certs.items.map(x=>`<div class="cert">${x.img?`<img src="${x.img}" alt="${x.name}" style="max-height:160px;margin:0 auto 10px;object-fit:contain">`:''}<b>${x.name}</b><span>${t(x.desc)}</span></div>`).join('');
}

function renderProductsTeaser(){
  if(!PRODS) return;
  setText('#pt-tag', t(SITE.products_teaser.tag));
  setText('#pt-title', t(SITE.products_teaser.title));
  setText('#pt-desc', t(SITE.products_teaser.desc));
  const grid=$('#cat-cards');
  if(grid) grid.innerHTML=PRODS.categories.map(c=>{
    const img=c.products[0] && c.products[0].images[0] || '';
    return `<a class="cat-card" href="products.html#${c.id}"><img src="${img}" alt="${t(c.name)}" loading="lazy"><div class="cat-body"><h3>${t(c.name)}</h3><p>${t(c.desc)}</p></div></a>`;
  }).join('');
}

function renderBlocks(){
  const c=$('#blocks'); if(!c || !SITE.blocks) return;
  c.innerHTML=SITE.blocks.map((b,i)=>{
    const hasImg=b.image?true:false, hasLink=b.link?true:false, rev=i%2===1?'block-rev':'';
    return `<div class="block ${rev}">${hasImg?`<div class="block-img"><img src="${b.image}" alt="${t(b.title)}" loading="lazy"></div>`:''}<div class="block-txt"><h3>${t(b.title)}</h3><p>${t(b.text)}</p>${hasLink?`<a class="btn btn-primary" href="${b.link}">${t(b.link_text)||'Learn More'}</a>`:''}</div></div>`;
  }).join('');
}

function renderCTA(){
  if(!SITE.cta) return;
  setText('#cta-title', t(SITE.cta.title));
  setText('#cta-desc', t(SITE.cta.desc));
}

function renderFooter(){
  if(!SITE) return;
  setText('#footer-about', t(SITE.footer_about));
  const c=SITE.contact;
  const fe=$('#f-email'); if(fe){ fe.textContent=c.email; fe.href='mailto:'+c.email; }
  const fw=$('#f-whatsapp'); if(fw){ fw.textContent=c.whatsapp; fw.href=c.whatsapp_link; }
  const fa=$('#f-alibaba'); if(fa) fa.href=c.alibaba;
  const fl=$('#f-links'); if(fl && c.links) fl.innerHTML=c.links.map(l=>`<a href="${l.url}" target="_blank">${t(l.label)}</a>`).join('');
  const year=$('#f-year'); if(year) year.textContent=new Date().getFullYear();
  const co=$('#f-company'); if(co) co.textContent=SITE.company.name_en;
}

function renderProductsPage(){
  const grid=$('#prod-grid'); if(!grid || !PRODS) return;
  const here=location.hash?location.hash.slice(1):PRODS.categories[0].id;
  const f=$('#filters');
  if(f) f.innerHTML=PRODS.categories.map(c=>`<button class="filter-btn ${c.id===here?'active':''}" data-cat="${c.id}">${t(c.name)}</button>`).join('');
  $$('.filter-btn[data-cat]',f||document).forEach(b=>b.onclick=()=>{ location.hash=b.dataset.cat; renderProductsPage(); });
  const cat=PRODS.categories.find(c=>c.id===here)||PRODS.categories[0];
  const head=$('#cat-head'); if(head) head.innerHTML=`<h2>${t(cat.name)}</h2><p>${t(cat.desc)}</p>`;
  grid.innerHTML=cat.products.map(p=>`<div class="prod"><img src="${p.images[0]}" alt="${t(p.name)}" loading="lazy"><div class="info"><b>${t(p.name)}</b><span>${t(p.name)===p.name.en?'':p.name.en}</span></div></div>`).join('');
}

function renderContact(){
  const c=$('#contact-info'); if(!c || !SITE) return;
  const ct=SITE.contact, co=SITE.company;
  const links=(ct.links&&ct.links.length)?ct.links.map(l=>`<div class="ci">🔗<div><b>${t(l.label)}</b><span><a href="${l.url}" target="_blank">${l.url}</a></span></div></div>`).join(''):'';
  c.innerHTML=`<div class="ci">📧<div><b>Email</b><span>${ct.email}</span></div></div><div class="ci">💬<div><b>WhatsApp</b><span>${ct.whatsapp} (${t(ct.sales)})</span></div></div>${links}<div class="ci">📍<div><b>${t({en:'Address',zh:'地址'})}</b><span>${t(co.address)}</span></div></div><div class="ci">🏭<div><b>${t({en:'Company',zh:'公司'})}</b><span>${co.name_en}</span></div></div>`;
  const wa=$('#contact-wa'); if(wa){ wa.textContent=ct.whatsapp; wa.href=ct.whatsapp_link; }
}

function renderAbout(){
  const co=SITE&&SITE.company; if(!co) return;
  const el=$('#about-company'); if(el) el.textContent=co.name_en;
  setText('#about-addr', t(co.address));
  setText('#about-certs', t(co.cert_notes));
}

function renderTitle(){
  document.title=`Super Smile | ${t({en:'Custom Wiring Harness & Diagnostic Cable Manufacturer',zh:'定制线束与诊断线制造商'})}`;
}

function renderFab(){
  if(!SITE) return;
  const wa=$('#fab-wa'); if(wa && SITE.contact) wa.href = SITE.contact.whatsapp_link || 'https://wa.me/447516289817';
  const online=$('#fab-online'); if(online && SITE.nav) online.textContent = t(SITE.nav.contact);
  const main=$('#fab-main'), menu=$('#fab-menu');
  if(main && menu){
    main.onclick=(e)=>{ e.stopPropagation(); menu.classList.toggle('open'); };
    if(!window.__fabBound){
      window.__fabBound=true;
      document.addEventListener('click',(e)=>{ if(!e.target.closest('#fab')) menu.classList.remove('open'); });
    }
  }
  if(online && !window.__modalOpenBound){
    window.__modalOpenBound=true;
    online.onclick=(e)=>{ e.stopPropagation(); menu && menu.classList.remove('open'); openModal(); };
  }
  renderModal();
}

function openModal(){
  const m=$('#contact-modal'); if(m) m.classList.add('open');
}
function closeModal(){
  const m=$('#contact-modal'); if(m) m.classList.remove('open');
}
function renderModal(){
  const m=$('#contact-modal'); if(!m || !SITE) return;
  const u=UI[LANG]||UI.en;
  setText('#modal-title', u.title); setText('#modal-label-name', u.name);
  setText('#modal-label-email', u.email); setText('#modal-label-message', u.message);
  setText('#modal-submit', u.send); setText('#modal-wa', u.wa);
  const wa=$('#modal-wa'); if(wa && SITE.contact) wa.href = SITE.contact.whatsapp_link || 'https://wa.me/447516289817';
}

function renderHotProduct(){
  const h=HOT[LANG]||HOT.en;
  setText('#hot-title', h.title);
  setText('#hot-desc', h.desc);
}

function renderAll(){
  renderNav(); renderLangSelector();
  renderHero(); renderHotProduct(); renderCustom(); renderProcess(); renderApps();
  renderFactory(); renderCerts(); renderProductsTeaser(); renderBlocks(); renderCTA();
  renderFooter(); renderProductsPage(); renderContact(); renderAbout(); renderTitle(); renderFab();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await loadData(); }catch(e){ console.error(e); return; }
  renderAll();
  const tg=$('#nav-toggle'); if(tg) tg.onclick=()=>{ $('#nav-links').classList.toggle('open'); };
  const form=$('#contact-form');
  if(form) form.onsubmit=(ev)=>{ ev.preventDefault(); const name=$('#cf-name').value, email=$('#cf-email').value, msg=$('#cf-msg').value;
    window.location.href=`mailto:${SITE.contact.email}?subject=${encodeURIComponent('Inquiry from website - '+name)}&body=${encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+msg)}`; };
  const modal=$('#contact-modal');
  if(modal){
    $$('[data-close]', modal).forEach(el=>el.onclick=closeModal);
    const overlay=modal.querySelector('.contact-modal-overlay');
    if(overlay) overlay.onclick=closeModal;
    const mf=$('#modal-form');
    if(mf) mf.onsubmit=(ev)=>{ ev.preventDefault(); const name=$('#modal-name').value, email=$('#modal-email').value, msg=$('#modal-message').value;
      window.location.href=`mailto:${SITE.contact.email}?subject=${encodeURIComponent('Website inquiry - '+name)}&body=${encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\n'+msg)}`; };
  }
});
