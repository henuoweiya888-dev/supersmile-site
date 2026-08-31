/* Super Smile site - 20 languages */
let SITE = null, PRODS = null, LANG = 'en';
const LANGS = [
  {code:'en',name:'English',flag:'gb'},{code:'zh',name:'中文',flag:'cn'},
  {code:'hi',name:'हिन्दी',flag:'in'},{code:'es',name:'Español',flag:'es'},
  {code:'fr',name:'Français',flag:'fr'},{code:'ar',name:'العربية',flag:'sa'},
  {code:'bn',name:'বাংলা',flag:'bd'},{code:'pt',name:'Português',flag:'pt'},
  {code:'ru',name:'Русский',flag:'ru'},{code:'ur',name:'اردو',flag:'pk'},
  {code:'id',name:'Indonesia',flag:'id'},{code:'de',name:'Deutsch',flag:'de'},
  {code:'ja',name:'日本語',flag:'jp'},{code:'tr',name:'Türkçe',flag:'tr'},
  {code:'vi',name:'Tiếng Việt',flag:'vn'},{code:'ko',name:'한국어',flag:'kr'},
  {code:'it',name:'Italiano',flag:'it'},{code:'nl',name:'Nederlands',flag:'nl'},
  {code:'pl',name:'Polski',flag:'pl'},{code:'th',name:'ไทย',flag:'th'}
];



const HOT = {
  en:{title:'Turbo Actuator Harness', desc:'Heat-resistant fiberglass tube, custom OEM/ODM for turbo actuator wiring. Samples available.'},
  zh:{title:'涡轮执行器连接线束', desc:'耐高温玻纤管，适配涡轮执行器线束定制，OEM/ODM可打样。'}
};

const UI = {
  en:{title:'Send Us a Message',name:'Name',firstName:'First name',lastName:'Last name',email:'Email',message:'Message',send:'Send Message',wa:'Chat on WhatsApp'},
  zh:{title:'给我们留言',name:'姓名',firstName:'名',lastName:'姓',email:'邮箱',message:'留言内容',send:'发送消息',wa:'在 WhatsApp 上聊'},
  hi:{title:'हमें संदेश भेजें',name:'नाम',firstName:'प्रथम नाम',lastName:'उपनाम',email:'ईमेल',message:'संदेश',send:'संदेश भेजें',wa:'WhatsApp पर चैट करें'},
  es:{title:'Envíenos un mensaje',name:'Nombre',firstName:'Nombre',lastName:'Apellidos',email:'Correo electrónico',message:'Mensaje',send:'Enviar mensaje',wa:'Chatear por WhatsApp'},
  fr:{title:'Envoyez-nous un message',name:'Nom',firstName:'Prénom',lastName:'Nom',email:'E-mail',message:'Message',send:'Envoyer le message',wa:'Discuter sur WhatsApp'},
  ar:{title:'أرسل لنا رسالة',name:'الاسم',firstName:'الاسم الأول',lastName:'اسم العائلة',email:'البريد الإلكتروني',message:'الرسالة',send:'إرسال الرسالة',wa:'الدردشة عبر واتساب'},
  bn:{title:'আমাদের মেসেজ পাঠান',name:'নাম',firstName:'নাম',lastName:'পদবি',email:'ইমেইল',message:'মেসেজ',send:'মেসেজ পাঠান',wa:'WhatsApp-এ চ্যাট করুন'},
  pt:{title:'Envie-nos uma mensagem',name:'Nome',firstName:'Nome',lastName:'Sobrenome',email:'E-mail',message:'Mensagem',send:'Enviar mensagem',wa:'Conversar no WhatsApp'},
  ru:{title:'Напишите нам',name:'Имя',firstName:'Имя',lastName:'Фамилия',email:'Email',message:'Сообщение',send:'Отправить сообщение',wa:'Написать в WhatsApp'},
  ur:{title:'ہمیں پیغام بھیجیں',name:'نام',firstName:'پہلا نام',lastName:'خاندانی نام',email:'ای میل',message:'پیغام',send:'پیغام بھیجیں',wa:'WhatsApp پر چیٹ کریں'},
  id:{title:'Kirim Pesan kepada Kami',name:'Nama',firstName:'Nama depan',lastName:'Nama belakang',email:'Email',message:'Pesan',send:'Kirim Pesan',wa:'Chat via WhatsApp'},
  de:{title:'Nachricht senden',name:'Name',firstName:'Vorname',lastName:'Nachname',email:'E-Mail',message:'Nachricht',send:'Nachricht senden',wa:'Auf WhatsApp chatten'},
  ja:{title:'メッセージを送る',name:'名前',firstName:'名',lastName:'姓',email:'メール',message:'メッセージ',send:'送信する',wa:'WhatsAppでチャット'},
  tr:{title:'Bize Mesaj Gönderin',name:'Ad',firstName:'Ad',lastName:'Soyad',email:'E-posta',message:'Mesaj',send:'Mesaj Gönder',wa:"WhatsApp'ta Sohbet Et"},
  vi:{title:'Gửi tin nhắn cho chúng tôi',name:'Tên',firstName:'Tên',lastName:'Họ',email:'Email',message:'Tin nhắn',send:'Gửi tin nhắn',wa:'Trò chuyện trên WhatsApp'},
  ko:{title:'메시지 보내기',name:'이름',firstName:'이름',lastName:'성',email:'이메일',message:'메시지',send:'메시지 보내기',wa:'WhatsApp으로 채팅'},
  it:{title:'Inviaci un messaggio',name:'Nome',firstName:'Nome',lastName:'Cognome',email:'Email',message:'Messaggio',send:'Invia messaggio',wa:'Chatta su WhatsApp'},
  nl:{title:'Stuur ons een bericht',name:'Naam',firstName:'Voornaam',lastName:'Achternaam',email:'E-mail',message:'Bericht',send:'Bericht versturen',wa:'Chatten op WhatsApp'},
  pl:{title:'Wyślij nam wiadomość',name:'Imię',firstName:'Imię',lastName:'Nazwisko',email:'E-mail',message:'Wiadomość',send:'Wyślij wiadomość',wa:'Czatuj na WhatsApp'},
  th:{title:'ส่งข้อความถึงเรา',name:'ชื่อ',firstName:'ชื่อ',lastName:'นามสกุล',email:'อีเมล',message:'ข้อความ',send:'ส่งข้อความ',wa:'แชทบน WhatsApp'}
};

const PC = {
  en:{contact:'Contact the merchant about this product', label:'Select Products (optional)', trigger:'Select products...', sel:'selected', none:'No product', search:'Search products...'},
  zh:{contact:'通过这款产品与商家取得联系', label:'选择产品（可选）', trigger:'选择产品...', sel:'已选', none:'不选择产品', search:'搜索产品...'}
};
let selectedProducts = [];
function findProduct(pid){
  if(!PRODS) return null;
  for(const c of (PRODS.categories||[])){
    const p=(c.products||[]).find(x=>x.id===pid);
    if(p) return p;
  }
  return null;
}
function findProductCategory(product){
  if(!PRODS || !product) return null;
  return PRODS.categories.find(c=>(c.products||[]).some(p=>p.id===product.id))||null;
}
function productDisplayName(product,category=findProductCategory(product)){
  if(!product) return '';
  if(LANG==='en' || LANG==='zh') return product.name[LANG] || product.name.en || product.id;
  return `${category?t(category.name):t(SITE.nav.products)} · ${String(product.id||'').toUpperCase()}`;
}
function getUrlProducts(){
  const q=new URLSearchParams(location.search);
  return (q.get('products')||'').split(',').map(s=>s.trim()).filter(Boolean);
}
function openProductModal(pid, prodEl){
  const p=findProduct(pid); if(!p) return;
  const pc=productCopy();
  const btn=$('#pm-contact-btn');
  if(btn){ btn.textContent=pc.contact; btn.href=routeWithLang('/contact?products='+encodeURIComponent(pid)); }
  const m=$('#product-pop');
  if(!m) return;
  positionPop(m, prodEl);
  m.dataset.pid=pid;
  m.classList.add('open');
}
function closeProductModal(){
  const m=$('#product-pop'); if(m) m.classList.remove('open');
}
function positionPop(m, prodEl){
  const margin=12, vw=window.innerWidth, vh=window.innerHeight;
  const rect=prodEl?prodEl.getBoundingClientRect():{right:vw/2,bottom:vh/2,top:vh/2};
  const w=m.offsetWidth||230, h=m.offsetHeight||64;
  let left=rect.right-w;
  let top=rect.bottom+10;
  if(left<margin) left=margin;
  if(left+w>vw-margin) left=vw-w-margin;
  if(top+h>vh-margin) top=rect.top-h-10;
  if(top<margin) top=margin;
  m.style.left=left+'px';
  m.style.top=top+'px';
}
function copyText(text){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text); return true; }
  }catch(e){}
  try{
    const ta=document.createElement('textarea');
    ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    return true;
  }catch(e){ return false; }
}
function mailComposeUrl(d, to, subject, body){
  const T=encodeURIComponent(to), S=encodeURIComponent(subject), B=encodeURIComponent(body);
  let provider='', compose=null, login=null;
  if(/gmail\.com|googlemail\.com/.test(d)){ provider='Gmail'; compose=`https://mail.google.com/mail/?view=cm&fs=1&to=${T}&su=${S}&body=${B}`; login='https://mail.google.com/'; }
  else if(/outlook\.com|hotmail\.com|live\.com|msn\.com/.test(d)){ provider='Outlook'; compose=`https://outlook.live.com/mail/0/deeplink/compose?to=${T}&subject=${S}&body=${B}`; login='https://outlook.live.com/'; }
  else if(/yahoo\.com|ymail\.com|rocketmail\.com/.test(d)){ provider='Yahoo Mail'; compose=`https://compose.mail.yahoo.com/?to=${T}&subject=${S}&body=${B}`; login='https://mail.yahoo.com/'; }
  else if(/qq\.com|vip\.qq\.com|foxmail\.com/.test(d)){ provider='QQ邮箱'; compose=null; login='https://mail.qq.com/'; }
  else if(/163\.com|126\.com|yeah\.net/.test(d)){ provider='163邮箱'; compose=null; login='https://mail.163.com/'; }
  else { provider='Email'; compose=null; login=null; }
  return {provider, compose, login};
}
let __toastTimer=null;
function showToast(msg){
  const t=$('#toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(__toastTimer);
  __toastTimer=setTimeout(()=>t.classList.remove('show'), 5000);
}
function sendMail(subject, body, customerEmail){
  const to=SITE.contact.email;
  const d=(customerEmail||'').split('@')[1]||'';
  const r=mailComposeUrl(d, to, subject, body);
  if(r.compose){
    copyText('To: '+to+'\nSubject: '+subject+'\n\n'+body);
    window.open(r.compose, '_blank');
    showToast(r.provider+' ✓');
  } else if(r.login){
    copyText('To: '+to+'\nSubject: '+subject+'\n\n'+body);
    window.open(r.login, '_blank');
    showToast(r.provider+' ✓');
  } else {
    window.location.href='mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  }
}

function renderProductSelect(){
  const panel=$('#ps-panel'); if(!panel || !PRODS) return;
  const pc=productCopy();
  if(!window.__psInit){
    window.__psInit=true;
    const preset=getUrlProducts();
    selectedProducts=preset.filter(pid=>findProduct(pid));
  }
  panel.innerHTML=`<div class="ps-search"><input type="text" id="ps-search" placeholder="${pc.search}" autocomplete="off"></div>`+
    `<div class="ps-none-row ${selectedProducts.length===0?'active':''}" id="ps-none-row">${pc.none}</div>`+
    PRODS.categories.map(c=>{
      const prods=c.products||[];
      return `<div class="ps-group"><div class="ps-group-title">${t(c.name)}</div>`+
        prods.map(p=>{const sk=Object.values(p.name||{}).join(' ').toLowerCase().replace(/"/g,'&quot;'); const pn=productDisplayName(p,c); return `<label class="ps-item" data-search="${sk}"><input type="checkbox" value="${p.id}" ${selectedProducts.includes(p.id)?'checked':''}> <img src="${p.images[0]}" alt="${pn}" loading="lazy"> <span>${pn}</span></label>`;}).join('')+
        `</div>`;
    }).join('');
  const sInput=$('#ps-search');
  if(sInput) sInput.oninput=()=>{
    const kw=(sInput.value||'').toLowerCase().trim();
    $$('#ps-panel .ps-item').forEach(item=>{
      item.style.display=(!kw || (item.dataset.search||'').includes(kw)) ? '' : 'none';
    });
    $$('#ps-panel .ps-group').forEach(g=>{
      const any=[...g.querySelectorAll('.ps-item')].some(it=>it.style.display!=='none');
      g.style.display=any?'':'none';
    });
  };
  const noneRow=$('#ps-none-row');
  if(noneRow) noneRow.onclick=()=>{
    selectedProducts=[];
    $$('#ps-panel input[type=checkbox]').forEach(cb=>cb.checked=false);
    updatePsTrigger();
  };
  $$('#ps-panel input[type=checkbox]').forEach(cb=>{
    cb.onchange=()=>{
      if(cb.checked){ if(!selectedProducts.includes(cb.value)) selectedProducts.push(cb.value); }
      else { selectedProducts=selectedProducts.filter(v=>v!==cb.value); }
      updatePsTrigger();
    };
  });
  const label=$('#cf-products-label'); if(label) label.textContent=pc.label;
  updatePsTrigger();
}
function updatePsTrigger(){
  const pc=productCopy();
  const trig=$('#ps-trigger');
  const noneRow=$('#ps-none-row');
  if(noneRow) noneRow.classList.toggle('active', selectedProducts.length===0);
  if(!trig) return;
  if(selectedProducts.length===0){ trig.textContent=pc.trigger; return; }
  if(selectedProducts.length<=2){
    trig.textContent=selectedProducts.map(pid=>{const p=findProduct(pid);return p?productDisplayName(p):pid;}).join(', ');
    return;
  }
  trig.textContent=selectedProducts.length+' '+pc.sel;
}
function bindPsToggle(){
  const trig=$('#ps-trigger'), panel=$('#ps-panel');
  if(!trig||!panel||window.__psBound) return;
  window.__psBound=true;
  panel.setAttribute('aria-hidden',String(!panel.classList.contains('open')));
  trig.setAttribute('aria-controls','ps-panel');
  trig.setAttribute('aria-expanded',String(panel.classList.contains('open')));
  const setOpen=(open)=>{
    panel.classList.toggle('open',open);
    panel.setAttribute('aria-hidden',String(!open));
    trig.setAttribute('aria-expanded',String(open));
  };
  trig.onclick=(e)=>{ e.stopPropagation(); setOpen(!panel.classList.contains('open')); };
  document.addEventListener('click',(e)=>{ if(!e.target.closest('#ps')) setOpen(false); });
}

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

function currentUI(){ return UI[LANG] || UI.en; }
function productCopy(){
  if(PC[LANG]) return PC[LANG];
  const products=SITE ? t(SITE.nav.products) : '';
  const quote=SITE ? t(SITE.nav.quote) : '';
  return {
    contact:quote,
    label:products,
    trigger:products+'…',
    sel:'✓',
    none:'—',
    search:products+'…'
  };
}
function routeWithLang(href){
  if(!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) return href;
  try{
    const url=new URL(href,location.origin);
    if(url.origin!==location.origin) return href;
    url.searchParams.set('lang',LANG);
    return url.pathname+url.search+url.hash;
  }catch(e){ return href; }
}
function syncLanguageUrl(){
  try{
    const url=new URL(location.href);
    url.searchParams.set('lang',LANG);
    history.replaceState(history.state,'',url.pathname+url.search+url.hash);
  }catch(e){}
}
function localizeInternalLinks(){
  $$('a[href]').forEach(a=>{
    const href=a.getAttribute('href');
    const localized=routeWithLang(href);
    if(localized!==href) a.setAttribute('href',localized);
  });
}

async function loadData(){
  if(SITE) return;
  const [s,p] = await Promise.all([
    fetch('/data/site.json?v=20260831v16').then(r=>r.json()),
    fetch('/data/products.json?v=20260831v7').then(r=>r.json())
  ]);
  SITE=s; PRODS=p;
  const q=new URLSearchParams(location.search);
  LANG = q.get('lang') || localStorage.getItem('lang') || 'en';
  // 若存储的语言不在列表，回退en
  if(!LANGS.some(l=>l.code===LANG)) LANG='en';
  localStorage.setItem('lang', LANG);
}

function renderLangSelector(){
  const box = $('#lang-box'); if(!box) return;
  const cur = LANGS.find(l=>l.code===LANG) || LANGS[0];
  box.innerHTML = `<button class="lang-btn" id="lang-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span class="lang-globe"><img class="lang-flag lang-current-flag" src="/assets/images/flags/${cur.flag}.svg" alt="" aria-hidden="true" width="28" height="21"></span><span class="lang-current">${cur.name}</span>${ico('chevronDown','lang-chevron')}
    </button>
    <div class="lang-menu" id="lang-menu" role="listbox" aria-hidden="true">${LANGS.map(l=>
      `<button class="lang-opt ${l.code===LANG?'active':''}" type="button" role="option" aria-selected="${l.code===LANG}" data-lang="${l.code}"><span class="lang-flag-slot"><img class="lang-flag" src="/assets/images/flags/${l.flag}.svg" alt="" aria-hidden="true" width="28" height="21" loading="lazy" decoding="async"></span><span class="lang-name">${l.name}</span>${l.code===LANG?ico('check','lang-check'):''}</button>`).join('')}</div>`;
  const btn=$('#lang-btn'), menu=$('#lang-menu');
  btn.setAttribute('aria-label',cur.name);
  btn.onclick=(e)=>{
    e.stopPropagation();
    const open=menu.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-hidden',String(!open));
  };
  if(!window.__langOutsideBound){
    window.__langOutsideBound=true;
    document.addEventListener('click',()=>{
      const currentMenu=$('#lang-menu'), currentBtn=$('#lang-btn');
      if(currentMenu){currentMenu.classList.remove('open');currentMenu.setAttribute('aria-hidden','true');}
      if(currentBtn) currentBtn.setAttribute('aria-expanded','false');
    });
  }
  $$('.lang-opt', box).forEach(b=>b.onclick=()=>{
    LANG=b.dataset.lang;
    localStorage.setItem('lang', LANG);
    syncLanguageUrl();
    menu.classList.remove('open');
    renderAll();
  });
}

function renderLogoCompany(){
  if(SITE && SITE.company) setText('#logo-company', t(SITE.company.name));
}

function renderNav(){
  const nav=$('#nav-links'); if(!nav) return;
  const n=SITE.nav;
  const links=[['/','home'],['/custom','custom'],['/products','products'],['/about','about'],['/contact','contact']];
  const here=(location.pathname||'/').replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/';
  nav.innerHTML=links.map(([href,k])=>`<a href="${href}" class="${href===here?'active':''}">${t(n[k])}</a>`).join('');
}

function renderHero(){
  if(!SITE.hero) return;
  const h=$('#hero'); const hero=SITE.hero;
  if(h && !h.querySelector('.hero-media')){
    h.style.backgroundImage=`linear-gradient(135deg, rgba(10,37,64,.94), rgba(18,58,99,.9), rgba(26,79,138,.88)), url(${hero.image})`;
    h.style.backgroundSize='cover';
    h.style.backgroundPosition='center';
  }else if(h){
    h.style.removeProperty('background-image');
    h.style.removeProperty('background-size');
    h.style.removeProperty('background-position');
  }
  setText('#hero-badge', t(hero.badge));
  setHTML('#hero-title', t(hero.title));
  setText('#hero-coverage', t(hero.coverage));
  setText('#hero-sub', t(hero.subtitle));
  setText('#hero-btn1', t(hero.btn1));
  setText('#hero-btn2', t(hero.btn2));
  const st=$('#hero-stats');
  if(st && SITE.stats) st.innerHTML=SITE.stats.map(s=>{
    const unit=typeof s.unit==='object'?t(s.unit):(s.unit||'');
    return `<div class="stat"><b>${s.icon?ico(s.icon,'stat-icon'):`${s.num}${unit?' '+unit:''}`}</b><span>${t(s.label)}</span></div>`;
  }).join('');
}

const ICONS = {
  connector:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  signal:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  cable:'<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  package:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  car:'<path d="M5 16l1.2-4A2 2 0 0 1 8.1 10h7.8a2 2 0 0 1 1.9 2l1.2 4"/><path d="M4 16h16"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>',
  truck:'<rect x="1" y="6" width="14" height="12"/><path d="M15 10h4l4 4v4h-2"/><circle cx="6.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  battery:'<rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="11" x2="23" y2="13"/><rect x="4" y="9" width="12" height="6" rx="1"/>',
  factory:'<path d="M2 21h20"/><path d="M4 21V9l5 3V9l5 3V4h6v17"/>',
  medical:'<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  robot:'<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M9 17h6"/>',
  plane:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  chevronDown:'<path d="m7 9.5 5 5 5-5"/>',
  chevronRight:'<path d="m9.5 6.5 5.5 5.5-5.5 5.5"/>',
  arrowRight:'<path d="M5 12h13M14 7l5 5-5 5"/>',
  check:'<path d="m5 12.5 4.2 4.2L19 7"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7 5.6-6"/>',
  close:'<path d="m7 7 10 10M17 7 7 17"/>',
  mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m5 7 7 5.25L19 7"/>',
  chat:'<path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.8-4.8A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  chatPhone:'<circle cx="12" cy="12" r="9"/><path d="M8.6 7.6c.7 4 3.8 7.1 7.8 7.8l1-1.3-2.3-1.1-.8.8a8 8 0 0 1-4.1-4.1l.8-.8-1.1-2.3-1.3 1Z"/>',
  phone:'<path d="M8.7 3.5 6.3 4.6c-.8.4-1.2 1.3-1 2.1 1.5 6.1 6.2 10.8 12.3 12.3.9.2 1.8-.2 2.1-1l1.1-2.4-4.2-2-1.2 1.6c-2.8-1.2-5-3.4-6.2-6.2l1.6-1.2-2.1-4.3Z"/>',
  mapPin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  building:'<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M8 7h4M8 11h4M8 15h4M8 19h4M2 21h20"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m5 17 4.5-4.5 3 3 2.5-2.5 4 4"/>',
  diagram:'<path d="M7 3h10v5H7zM4 16h7v5H4zM13 16h7v5h-7zM12 8v4M7.5 16v-2h9v2"/>',
  ruler:'<path d="m4 17 13-13 3 3L7 20H4v-3Z"/><path d="m14 7 3 3M11 10l2 2M8 13l3 3"/>',
  spark:'<path d="M12 3c.8 3.1 2.4 4.8 5.5 5.5C14.4 9.3 12.8 11 12 14c-.8-3-2.4-4.7-5.5-5.5C9.6 7.8 11.2 6.1 12 3Z"/><path d="M18.5 14.5c.4 1.5 1.2 2.3 2.5 2.7-1.3.4-2.1 1.2-2.5 2.8-.4-1.6-1.2-2.4-2.5-2.8 1.3-.4 2.1-1.2 2.5-2.7Z"/>',
  network:'<circle cx="7" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m9.3 10.8 5.4-3.6M9.3 13.2l5.4 3.6"/>',
  storefront:'<path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5"/>',
  externalLink:'<path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>'
};
function ico(name, extraClass=''){
  return `<svg class="ico-svg${extraClass?' '+extraClass:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]||ICONS.connector}</svg>`;
}

const BRAND_ICONS = {
  whatsapp:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'
};
function brandIcon(name, extraClass=''){
  const path=BRAND_ICONS[name];
  if(!path) return ico('externalLink',extraClass);
  return `<svg class="ico-svg brand-icon${extraClass?' '+extraClass:''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
}

function renderCustom(){
  if(!SITE.custom_intro) return;
  setText('#ci-title', t(SITE.custom_intro.title));
  setText('#ci-desc', t(SITE.custom_intro.desc));
  const f=$('#features');
  const fc=['connector','signal','cable','package'];
  if(f && SITE.features) f.innerHTML=SITE.features.map((x,i)=>`<div class="card">${x.image?`<div class="feature-media"><img src="${x.image}" alt="${t(x.title)}" loading="lazy"></div>`:''}<div class="card-head"><span class="icon-tile">${ico(fc[i])}</span><h3>${t(x.title)}</h3></div><p>${t(x.desc)}</p></div>`).join('');
}

function renderProcess(){
  if(!SITE.process) return;
  setText('#pr-tag', t(SITE.process.tag));
  setText('#pr-title', t(SITE.process.title));
  const ps=$('#process-steps');
  if(ps && SITE.process.steps) ps.innerHTML=SITE.process.steps.map((s,i)=>`${i>0?`<div class="step-arrow">${ico('chevronRight')}</div>`:''}<div class="step">${s.image?`<div class="step-media"><img src="${s.image}" alt="${t(s.title)}" loading="lazy"></div>`:''}<div class="step-head"><h4>${t(s.title)}</h4></div><p>${t(s.desc)}</p></div>`).join('');
}

function renderApps(){
  if(!SITE.apps) return;
  setText('#ap-tag', t(SITE.apps.tag));
  setText('#ap-title', t(SITE.apps.title));
  const a=$('#apps');
  if(a && SITE.apps.items){
    let items=SITE.apps.items[LANG]||SITE.apps.items.en||[];
    if(typeof items==='string') items=items.split('|').map(x=>x.trim()).filter(Boolean);
    const images=SITE.apps.images||[];
    a.innerHTML=`<div class="cards cards-4">${items.map((x,i)=>`<div class="card"${images[i]?` style="--app-image:url('${images[i]}')"`:''}><div class="card-head"><h3>${x}</h3></div></div>`).join('')}</div>`;
  }
}

function renderFactory(){
  if(!SITE.factory) return;
  setText('#fa-tag', t(SITE.factory.tag));
  setText('#fa-title', t(SITE.factory.title));
  setText('#fa-desc', t(SITE.factory.desc));
  setText('#fa-clients', t(SITE.factory.clients));
  const fi=$('#fact-imgs');
  if(fi && SITE.factory.images){
    fi.replaceChildren(...SITE.factory.images.map((item,index)=>{
      const src=typeof item==='string'?item:item.src;
      const alt=typeof item==='object'&&item.alt?t(item.alt):`${t(SITE.factory.title)} ${index+1}`;
      const img=document.createElement('img');
      img.src=src;
      img.alt=alt;
      img.loading='lazy';
      img.decoding='async';
      return img;
    }));
  }
}

function renderCerts(){
  if(!SITE.certs) return;
  setText('#ce-tag', t(SITE.certs.tag));
  setText('#ce-title', t(SITE.certs.title));
  const cg=$('#cert-grid');
  if(cg && SITE.certs.items) cg.innerHTML=SITE.certs.items.map(x=>`<div class="cert">${x.img?`<img src="${x.img}" alt="${t(x.name)}" style="max-height:160px;margin:0 auto 10px;object-fit:contain">`:''}<b>${t(x.name)}</b><span>${t(x.desc)}</span></div>`).join('');
}

function renderProductsTeaser(){
  if(!PRODS) return;
  setText('#pt-tag', t(SITE.products_teaser.tag));
  setText('#pt-title', t(SITE.products_teaser.title));
  setText('#pt-desc', t(SITE.products_teaser.desc));
  const grid=$('#cat-cards');
  if(grid) grid.innerHTML=PRODS.categories.map(c=>{
    const img=c.products[0] && c.products[0].images[0] || '';
    return `<a class="cat-card" href="/products#${c.id}"><span class="cat-media"><img src="${img}" alt="${t(c.name)}" loading="lazy"></span><div class="cat-body"><h3>${t(c.name)}</h3><p>${t(c.desc)}</p></div></a>`;
  }).join('');
}

function renderBlocks(){
  const c=$('#blocks'); if(!c || !SITE.blocks) return;
  c.innerHTML=SITE.blocks.map((b,i)=>{
    const hasImg=b.image?true:false, hasLink=b.link?true:false, rev=i%2===1?'block-rev':'';
    const linkLabel=(t(b.link_text)||t(SITE.nav.products)).replace(/\s*[→›]\s*$/,'');
    return `<div class="block ${rev}">${hasImg?`<div class="block-img"><img src="${b.image}" alt="${t(b.title)}" loading="lazy"></div>`:''}<div class="block-txt"><div class="block-copy"><h3>${t(b.title)}</h3><p>${t(b.text)}</p></div>${hasLink?`<a class="btn btn-primary btn-with-icon" href="${b.link}"><span>${linkLabel}</span>${ico('arrowRight','btn-icon')}</a>`:''}</div></div>`;
  }).join('');
}

function renderCTA(){
  if(!SITE.cta) return;
  setText('#cta-title', t(SITE.cta.title));
  setText('#cta-desc', t(SITE.cta.desc));
}

const FOOT_ICONS = {
  mail:'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  whatsapp:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  facebook:'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  alibaba:'M3.996 4.517h5.291L8.01 6.324 4.153 7.506a1.668 1.668 0 0 0-1.165 1.601v5.786a1.668 1.668 0 0 0 1.165 1.6l3.857 1.183 1.277 1.807H3.996A3.996 3.996 0 0 1 0 15.487V8.513a3.996 3.996 0 0 1 3.996-3.996m16.008 0h-5.291l1.277 1.807 3.857 1.182c.715.227 1.17.889 1.165 1.601v5.786a1.668 1.668 0 0 1-1.165 1.6l-3.857 1.183-1.277 1.807h5.291A3.996 3.996 0 0 0 24 15.487V8.513a3.996 3.996 0 0 0-3.996-3.996m-4.007 8.345H8.002v-1.804h7.995Z'
};
function footIcon(name){
  if(name==='whatsapp') return brandIcon('whatsapp','ficon');
  const map={mail:'mail',whatsapp:'chatPhone',facebook:'network',alibaba:'storefront',link:'externalLink'};
  return ico(map[name]||map.link,'ficon');
}

function renderFooter(){
  if(!SITE) return;
  setText('#footer-about', t(SITE.footer_about));
  const c=SITE.contact;
  const fc=$('#f-contact');
  if(fc){
    const items=[{icon:'mail', label:c.email, url:'mailto:'+c.email}];
    (c.links||[]).forEach(l=>{
      const u=l.url||'';
      let icon='link';
      if(/wa\.me|whatsapp/i.test(u)) icon='whatsapp';
      else if(/facebook\.com|fb\.com/i.test(u)) icon='facebook';
      else if(/alibaba\.com|aliexpress/i.test(u)) icon='alibaba';
      items.push({icon:icon, label:t(l.label), url:u});
    });
    fc.innerHTML=items.map(it=>{
      const ext=it.url.indexOf('mailto:')===0?'':' target="_blank" rel="noopener"';
      return '<a href="'+it.url+'"'+ext+'>'+footIcon(it.icon)+'<span>'+it.label+'</span></a>';
    }).join('');
  }
  const year=$('#f-year'); if(year) year.textContent=new Date().getFullYear();
  const co=$('#f-company'); if(co) co.textContent=t(SITE.company.name);
}

function renderProductsPage(){
  const grid=$('#prod-grid'); if(!grid || !PRODS) return;
  const requested=location.hash?location.hash.slice(1):'';
  const cat=PRODS.categories.find(c=>c.id===requested)||PRODS.categories[0];
  const here=cat.id;
  const f=$('#filters');
  if(f){
    f.setAttribute('aria-label',t(SITE.products_teaser.title));
    f.innerHTML=PRODS.categories.map(c=>`<button class="filter-btn ${c.id===here?'active':''}" type="button" aria-pressed="${c.id===here?'true':'false'}" aria-controls="prod-grid" data-cat="${c.id}">${t(c.name)}</button>`).join('');
    $$('.filter-btn[data-cat]',f).forEach(b=>b.onclick=()=>{
      const next=b.dataset.cat;
      if(location.hash.slice(1)!==next) location.hash=next;
    });
  }
  grid.setAttribute('aria-label',t(cat.name));
  grid.innerHTML=cat.products.map(p=>{const pn=productDisplayName(p,cat); return `<a class="prod" href="/product/${p.slug}.html" data-pid="${p.id}"><span class="prod-media"><img src="${p.images[0]}" alt="${pn}" loading="lazy"></span><div class="info"><b>${pn}</b><span>${t(cat.name)}</span></div></a>`;}).join('');
  localizeInternalLinks();
}

const CONTACT_ICONS = {
  email:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#1f5fd6" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  whatsapp:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
  phone:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#1f5fd6" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
  facebook:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
  alibaba:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FF6A00" d="M3.996 4.517h5.291L8.01 6.324 4.153 7.506a1.668 1.668 0 0 0-1.165 1.601v5.786a1.668 1.668 0 0 0 1.165 1.6l3.857 1.183 1.277 1.807H3.996A3.996 3.996 0 0 1 0 15.487V8.513a3.996 3.996 0 0 1 3.996-3.996m16.008 0h-5.291l1.277 1.807 3.857 1.182c.715.227 1.17.889 1.165 1.601v5.786a1.668 1.668 0 0 1-1.165 1.6l-3.857 1.183-1.277 1.807h5.291A3.996 3.996 0 0 0 24 15.487V8.513a3.996 3.996 0 0 0-3.996-3.996m-4.007 8.345H8.002v-1.804h7.995Z"/></svg>',
  address:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#1f5fd6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>',
  company:'<svg class="ci-ic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#1f5fd6" d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>'
};
const CONTACT_ICON_NAMES = {email:'mail',whatsapp:'chatPhone',phone:'phone',facebook:'network',alibaba:'storefront',address:'mapPin',company:'building'};
const CL = {
  email:{en:'Email', zh:'邮箱'},
  whatsapp:{en:'WhatsApp', zh:'WhatsApp'},
  phone:{en:'Phone', zh:'电话'},
  facebook:{en:'Facebook', zh:'Facebook'},
  alibaba:{en:'Alibaba Store', zh:'阿里国际站'},
  address:{en:'Address', zh:'地址'},
  company:{en:'Company', zh:'公司'}
};

function contactLabel(key){
  if(CL[key] && CL[key][LANG]) return CL[key][LANG];
  const u=currentUI();
  if(key==='email') return u.email;
  if(key==='whatsapp') return 'WhatsApp';
  if(key==='facebook') return 'Facebook';
  if(key==='alibaba') return 'Alibaba';
  if(key==='address' || key==='company') return t(SITE.nav.about);
  return t(SITE.nav.contact);
}

function renderContact(){
  const c=$('#contact-info'); if(!c || !SITE) return;
  const ct=SITE.contact, co=SITE.company;
  const item=(ic,label,inner)=>`<div class="ci"><span class="ci-icon">${ic==='whatsapp'?brandIcon('whatsapp'):ico(CONTACT_ICON_NAMES[ic]||'externalLink')}</span><div><b>${contactLabel(label)}</b>${inner}</div></div>`;
  const phones=(ct.phones||[]).map(p=>`<span><a href="tel:${p.replace(/[^+\d]/g,'')}">${p}</a></span>`).join('');
  const short=u=>u.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];
  const html =
    item('email','email',`<span><a href="mailto:${ct.email}">${ct.email}</a></span>`) +
    item('whatsapp','whatsapp',`<span><a href="${ct.whatsapp_link}" target="_blank" rel="noopener">${ct.whatsapp}</a></span>`) +
    item('phone','phone',phones) +
    item('facebook','facebook',`<span><a href="${ct.facebook}" target="_blank" rel="noopener">${short(ct.facebook)}</a></span>`) +
    item('alibaba','alibaba',`<span><a href="${ct.alibaba}" target="_blank" rel="noopener">${short(ct.alibaba)}</a></span>`) +
    item('address','address',`<span>${t(co.address)}</span>`) +
    item('company','company',`<span>${t(co.name)}</span>`);
  c.innerHTML=html;
  const wa=$('#contact-wa'); if(wa){ wa.textContent=ct.whatsapp; wa.href=ct.whatsapp_link; }
}

function renderAbout(){
  const co=SITE&&SITE.company; if(!co) return;
  const el=$('#about-company'); if(el) el.textContent=t(co.name);
  setText('#about-addr', t(co.address));
  setText('#about-certs', t(co.cert_notes));
  setText('#about-credit-label', (t(co.credit_label)||'Unified Social Credit Code')+': ');
  setText('#about-credit-code', co.credit_code || '');
  setText('#about-intl-label', (t(co.international_label)||'International Sales Dept.')+': ');
  setText('#about-intl-name', t(co.international_name));
}

const TITLES = {
  en:{index:'Custom Wiring Harness Manufacturer in China | OEM/ODM | Super Smile',products:'Wire Harness Products | OBD2 Diagnostic Cables, Turbo Actuator Harness, J1939',custom:'Custom Wiring Harness | OEM/ODM Wire Harness Manufacturer China',about:'About Us | 3,000㎡ Wiring Harness Factory in Shenzhen, China',contact:'Contact the Wire Harness Factory | Get a Custom Harness Quote','turbo-actuator-harness':'Turbo Actuator Harness | OEM Turbo Actuator Wiring Harness Manufacturer','obd2-diagnostic-cable':'OBD2 Diagnostic Cable | Custom OBD2 Cable Manufacturer China','j1939-cable':'J1939 Cable | Heavy-Duty Truck Diagnostic Cable Manufacturer','custom-wiring-harness':'Custom Wiring Harness Manufacturer | OEM/ODM Wire Harness Factory China'},
  zh:{index:'线束工厂 | 定制线束 | 中国线束工厂 | 深圳市超斯迈尔科技有限公司',products:'线束产品中心 | 定制线束 | 汽车诊断线束 | 中国线束工厂',custom:'线束定制 | OEM/ODM线束工厂 | 中国线束定制厂家',about:'关于我们 | 线束工厂 | 深圳市超斯迈尔科技有限公司',contact:'联系线束工厂 | 定制线束询价 | 深圳市超斯迈尔科技有限公司'}
};
const DESCS = {
  en:{index:'Shenzhen Super Smile is a 3,000㎡ custom wiring harness & cable assembly factory in China — OBD2 diagnostic cables, turbo actuator harnesses, heavy-duty J1939 cables. OEM/ODM, low MOQ, 7-day samples.',products:'Browse our stock & custom wire harness products: OBD2 diagnostic cables, heavy-duty J1939 cables, turbo actuator harnesses, EV/new-energy cables and more. OEM/ODM factory direct.',custom:'Custom wire harness & cable assemblies built from drawing, sample or pinout — MOQ from 10 pcs, 7-day samples, 100% continuity tested. OEM/ODM factory in Shenzhen, China.',about:'Meet Shenzhen Super Smile — a 3,000㎡ wiring harness factory with 100+ staff. OEM/ODM custom wire harnesses for automotive, turbo, medical, robotics, appliances and more.',contact:'Get a fast quote for custom wire harnesses, OBD2 diagnostic cables and turbo actuator harnesses. Contact us by WhatsApp, email or online form — we reply within 24 hours.','turbo-actuator-harness':'OEM turbo actuator connecting harness & pigtail manufacturer in China. Heat-resistant, built to drawing, sample or pinout — MOQ from 10 pcs, 7-day samples, 100% tested.','obd2-diagnostic-cable':'Custom OBD2 diagnostic cable manufacturer in China — OBD2 16-pin, heavy-duty truck and EV diagnostic cables, OEM/ODM, low MOQ, fast samples.','j1939-cable':'J1939 cable and heavy-duty truck diagnostic cable manufacturer — custom connectors, pinout and cable structure, OEM/ODM factory direct from China.','custom-wiring-harness':'Custom wiring harness manufacturer for OEM/ODM — automotive, turbo, medical, robotics, appliance harnesses from drawing or sample. MOQ 10 pcs, 7-day samples.'},
  zh:{index:'深圳市超斯迈尔科技有限公司是专业线束工厂，提供定制线束、汽车诊断线、重卡J1939线束、新能源线束、涡轮增压执行器线束，OEM/ODM工厂直供。',products:'线束产品中心：现货诊断线、OBD2诊断线、重卡柴油诊断线、涡轮增压执行器连接线、转接头，支持OEM/ODM定制。',custom:'定制线束：连接器、针脚、线材结构、品牌包装均可定制，99%线束可根据图纸或样品开模。',about:'深圳市超斯迈尔科技有限公司，3000平方米线束工厂，100+员工，专业生产汽车诊断线束和定制线束。',contact:'联系深圳市超斯迈尔科技有限公司，获取定制线束、汽车诊断线、重卡线束、新能源线束报价。'}
};
function renderTitle(){
  const page=location.pathname.split('/').pop()||'index.html';
  const key=page.replace('.html','')||'index';
  const tmap=TITLES[LANG]||TITLES.en;
  const dmap=DESCS[LANG]||DESCS.en;
  if(tmap[key]) document.title=tmap[key];
  const m=document.querySelector('meta[name="description"]');
  if(m && dmap[key]) m.setAttribute('content', dmap[key]);
}

function renderFab(){
  if(!SITE) return;
  const u=currentUI();
  const wa=$('#fab-wa'); if(wa && SITE.contact) wa.href = SITE.contact.whatsapp_link || 'https://wa.me/447516289817';
  const em=$('#fab-email'); if(em && SITE.contact){ em.href = 'mailto:' + SITE.contact.email; em.innerHTML = ico('mail','fab-item-icon')+'<span>'+u.email+'</span>'; }
  const online=$('#fab-online'); if(online) online.innerHTML = ico('chat','fab-item-icon')+'<span>'+u.title+'</span>';
  if(wa) wa.innerHTML=brandIcon('whatsapp','fab-item-icon')+'<span>WhatsApp</span>';
  const main=$('#fab-main'), menu=$('#fab-menu');
  if(main && menu){
    const label=t(SITE.nav.contact);
    main.innerHTML='<span class="fab-icon">'+ico('chat')+'</span><span class="fab-label">'+label+'</span>';
    main.setAttribute('aria-label',label);
    main.setAttribute('aria-controls','fab-menu');
    const setFabOpen=(open)=>{
      menu.classList.toggle('open',open);
      menu.setAttribute('aria-hidden',String(!open));
      main.setAttribute('aria-expanded',String(open));
    };
    setFabOpen(false);
    main.onclick=(e)=>{ e.stopPropagation(); setFabOpen(!menu.classList.contains('open')); };
    if(!window.__fabBound){
      window.__fabBound=true;
      document.addEventListener('click',(e)=>{ if(!e.target.closest('#fab')) setFabOpen(false); });
    }
    if(online){
      online.onclick=(e)=>{ e.stopPropagation(); setFabOpen(false); openModal(); };
    }
  }
  renderModal();
}

let __modalReturnFocus=null;
function openModal(){
  const m=$('#contact-modal'); if(!m) return;
  __modalReturnFocus=document.activeElement;
  m.classList.add('open');
  requestAnimationFrame(()=>{ const target=m.querySelector('input,textarea,button,a[href]'); if(target) target.focus(); });
}
function closeModal(){
  const m=$('#contact-modal'); if(!m) return;
  const wasOpen=m.classList.contains('open');
  m.classList.remove('open');
  if(wasOpen && __modalReturnFocus && typeof __modalReturnFocus.focus==='function') __modalReturnFocus.focus();
  __modalReturnFocus=null;
}
function renderModal(){
  const m=$('#contact-modal'); if(!m || !SITE) return;
  const dialog=m.querySelector('[role="dialog"]'); if(dialog) dialog.setAttribute('aria-labelledby','modal-title');
  const u=UI[LANG]||UI.en;
  setText('#modal-title', u.title); setText('#modal-label-name', u.name);
  setText('#modal-label-email', u.email); setText('#modal-label-message', u.message);
  setText('#modal-submit', u.send); setText('#modal-wa', u.wa);
  const name=$('#modal-name'), email=$('#modal-email'), message=$('#modal-message');
  if(name) name.placeholder=u.name;
  if(email) email.placeholder=u.email;
  if(message) message.placeholder=u.message;
  const wa=$('#modal-wa'); if(wa && SITE.contact) wa.href = SITE.contact.whatsapp_link || 'https://wa.me/447516289817';
  $$('.modal-close').forEach(btn=>{
    btn.innerHTML=ico('close','modal-close-icon');
    btn.setAttribute('aria-label',u.title);
  });
}

function renderHotProduct(){
  const p=findProduct('p081');
  const cat=PRODS && PRODS.categories.find(c=>(c.products||[]).some(x=>x.id==='p081'));
  const title=$('#hot-title');
  if(title){
    title.textContent='';
    const prefix=document.createElement('span');
    prefix.className='hot-title-prefix';
    prefix.textContent=t(SITE.products_teaser.hot_prefix);
    const name=document.createElement('span');
    name.className='hot-title-name';
    name.textContent=p?productDisplayName(p,cat):t(SITE.products_teaser.title);
    title.append(prefix,name);
  }
  setText('#hot-desc', cat?t(cat.desc):t(SITE.products_teaser.desc));
}

function hydrateStaticIcons(){
  const navToggle=$('#nav-toggle');
  if(navToggle){
    if(!navToggle.querySelector('.menu-icon')) navToggle.innerHTML='<span class="menu-icon" aria-hidden="true"><span></span><span></span></span>';
    navToggle.setAttribute('aria-label',t(SITE.nav.products));
  }
  $$('[data-ui-icon]').forEach(el=>{
    if(!el.querySelector('svg')) el.innerHTML=ico(el.dataset.uiIcon||'connector');
  });
}

/* Progressive enhancement layer for the shared industrial UI.
   All features remain usable when motion APIs are unavailable. */
let __revealObserver=null;

function syncDocumentLanguage(){
  document.documentElement.lang=LANG||'en';
  document.documentElement.dir=['ar','ur'].includes(LANG)?'rtl':'ltr';
}

function pageIdentity(){
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const leaf=(path.split('/').pop()||'index').replace(/\.html$/,'');
  if(path==='/' || leaf==='index') return 'page-home';
  if(path.includes('/product/')) return 'page-product';
  if(['turbo-actuator-harness','obd2-diagnostic-cable','j1939-cable','custom-wiring-harness'].includes(leaf)) return 'page-landing';
  return 'page-'+leaf;
}

function decoratePage(){
  if(window.__siteDecorated) return;
  window.__siteDecorated=true;
  const body=document.body;
  const identity=pageIdentity();
  body.classList.add('site-redesign',identity);

  const main=$('main');
  if(main){
    if(identity==='page-product') main.classList.add('product-main');
    if(identity==='page-landing'){
      const crumb=main.querySelector('nav[aria-label="Breadcrumb"],nav.breadcrumb');
      if(crumb) crumb.classList.add('breadcrumb');
      const actions=[...main.children].find(el=>el.tagName==='DIV' && el.querySelector('.btn'));
      if(actions) actions.classList.add('landing-actions');
      const sections=[...main.children].filter(el=>el.tagName==='SECTION');
      if(sections.length) sections[sections.length-1].classList.add('landing-cta');
    }
  }

  const crumb=$('nav[aria-label="Breadcrumb"],nav.breadcrumb');
  if(crumb) crumb.classList.add('breadcrumb');

  setupHeaderMotion();
  setupScrollProgress();
  setupProductGallery();
  refreshMotion();
  requestAnimationFrame(()=>body.classList.add('page-ready'));
}

function setupScrollProgress(){
  if(window.__scrollProgressBound) return;
  window.__scrollProgressBound=true;
  const bar=document.createElement('div');
  bar.className='scroll-progress';
  bar.setAttribute('aria-hidden','true');
  bar.innerHTML='<span></span>';
  document.body.appendChild(bar);
  const fill=bar.firstElementChild;
  let ticking=false;
  const update=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    fill.style.transform='scaleX('+Math.min(1,Math.max(0,window.scrollY/max))+')';
    ticking=false;
  };
  const request=()=>{
    if(!ticking){ticking=true;requestAnimationFrame(update);}
  };
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
  update();
}

function setupHeaderMotion(){
  if(window.__headerMotionBound) return;
  window.__headerMotionBound=true;
  const header=$('.header');
  if(!header) return;
  let ticking=false;
  const update=()=>{
    header.classList.toggle('scrolled',window.scrollY>16);
    document.body.classList.toggle('has-scrolled',window.scrollY>160);
    ticking=false;
  };
  window.addEventListener('scroll',()=>{
    if(!ticking){ticking=true;requestAnimationFrame(update);}
  },{passive:true});
  update();
}

function setupProductGallery(){
  const mainImg=$('.pd-img img');
  const thumbs=$$('.pd-gallery img');
  if(!mainImg || !thumbs.length) return;
  thumbs.forEach((thumb,index)=>thumb.setAttribute('aria-label',t(SITE.nav.products)+' '+(index+1)+'/'+thumbs.length+': '+(thumb.alt||'')));
  if(mainImg.dataset.galleryBound) return;
  mainImg.dataset.galleryBound='true';
  const activate=(thumb)=>{
    if(!thumb || !thumb.src || mainImg.src===thumb.src) return;
    mainImg.classList.add('is-switching');
    const preload=new Image();
    preload.onload=()=>{
      mainImg.src=thumb.src;
      mainImg.alt=thumb.alt||mainImg.alt;
      thumbs.forEach(t=>t.classList.toggle('active',t===thumb));
      requestAnimationFrame(()=>mainImg.classList.remove('is-switching'));
    };
    preload.onerror=()=>mainImg.classList.remove('is-switching');
    preload.src=thumb.src;
  };
  thumbs.forEach((thumb,index)=>{
    thumb.tabIndex=0;
    thumb.setAttribute('role','button');
    thumb.addEventListener('click',()=>activate(thumb));
    thumb.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(thumb);}
    });
  });
}

function refreshMotion(){
  const body=document.body;
  if(!body || matchMedia('(prefers-reduced-motion: reduce)').matches){
    body&&body.classList.add('motion-ready');
    return;
  }
  body.classList.add('motion-ready');
  const items=$$(
    'section:not(.hero) .sec-head, section:not(.hero) .chapter-meta, .hot-wrap, .two-col, .contact-grid, '+
    '.page-landing main > section, .page-product .pd-wrap'
  );
  const groups=$$(
    '#features, #apps .cards, .process-steps, #fact-imgs, #cert-grid, '+
    '#cat-cards, #prod-grid, #blocks, .page-custom .cards-2, .pd-gallery, .pd-adv'
  );
  const media=$$('#fact-imgs img, .block-img, .cat-media, .prod-media, .pd-img');

  items.forEach(el=>el.classList.add('reveal-item'));
  media.forEach(el=>el.classList.add('media-reveal'));
  groups.forEach(group=>{
    group.classList.add('reveal-group');
    [...group.children].forEach((child,i)=>{
      child.classList.add('reveal-child');
      child.style.setProperty('--reveal-delay',Math.min(i,7)*65+'ms');
    });
  });

  const targets=[...new Set([...items,...groups,...media])].filter(el=>!el.dataset.revealObserved);
  if(!('IntersectionObserver' in window)){
    targets.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  if(!__revealObserver){
    __revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          __revealObserver.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -9% 0px',threshold:.08});
  }
  targets.forEach(el=>{
    el.dataset.revealObserved='true';
    __revealObserver.observe(el);
  });
}

function textIn(root,selector,value){
  const el=root && root.querySelector(selector);
  if(el) el.textContent=value==null?'':value;
  return el;
}

function renderSharedChrome(){
  if(!SITE) return;
  const footer=$('.footer');
  if(footer){
    const columns=$$(':scope > .container:first-child > div',footer);
    if(columns[1]) textIn(columns[1],'h5',t(SITE.nav.contact));
    if(columns[2]){
      textIn(columns[2],'h5',t(SITE.nav.products));
      const links=$$('a',columns[2]);
      const categories=(PRODS&&PRODS.categories)||[];
      const labels=[
        t(SITE.nav.home),t(SITE.nav.custom),t(SITE.nav.products),
        categories[0]?t(categories[0].name):t(SITE.nav.products),
        categories[1]?t(categories[1].name):t(SITE.nav.products),
        categories[2]?t(categories[2].name):t(SITE.nav.products),
        t(SITE.nav.about),t(SITE.nav.contact)
      ];
      links.forEach((a,i)=>{ if(labels[i]) a.textContent=labels[i]; });
    }
    const keywords=$('.seo-keywords',footer);
    if(keywords){ keywords.hidden=true; keywords.setAttribute('aria-hidden','true'); }
    const bot=$(':scope > .container.bot',footer);
    if(bot) bot.innerHTML=`© <span id="f-year">${new Date().getFullYear()}</span> <span id="f-company">${t(SITE.company.name)}</span>`;
  }

  const heroLabel=$('.hero:not(.hero-home) .container');
  if(heroLabel && !['page-custom','page-about'].includes(pageIdentity())) heroLabel.dataset.sectionLabel=t(SITE.custom_intro.tag);
  $$('.block-txt').forEach((el,i)=>el.dataset.sectionLabel=t((SITE.blocks[i]||SITE.blocks[0]).title));
  $$('.cta .container').forEach(el=>el.dataset.sectionLabel=t(SITE.nav.quote));
  const modalBox=$('.contact-modal-box');
  if(modalBox) modalBox.dataset.sectionLabel=currentUI().title;

  $$('nav[aria-label="Breadcrumb"],nav.breadcrumb').forEach(nav=>{
    nav.classList.add('breadcrumb');
    nav.setAttribute('aria-label',t(SITE.nav.products));
  });
}

function renderHomeStatic(){
  if(pageIdentity()!=='page-home') return;
  const top=$$('.hero-topline span');
  if(top[0]) top[0].textContent='SS / SuperSmile';
  if(top[1]) top[1].textContent=t(SITE.hero.motto);
  const specs=$$('.hero-spec span');
  const specFor=(s)=>{
    const unit=typeof s.unit==='object'?t(s.unit):(s.unit||'');
    if(LANG==='zh') return `${t(s.label)}/${s.num}${unit}`;
    return `${t(s.label)} / ${s.num}${unit?` ${unit}`:''}`;
  };
  const specText=[specFor(SITE.stats[1]),specFor(SITE.stats[0]),specFor(SITE.stats[2])];
  specs.forEach((el,i)=>el.textContent=specText[i]||'');
  const scroll=$('.hero-scroll');
  if(scroll){ textIn(scroll,'span',t(SITE.products_teaser.tag)); scroll.setAttribute('aria-label',t(SITE.products_teaser.title)); }
  setText('.hot-action',t(SITE.nav.products));

  const chapterLabels={
    'custom-intro':SITE.custom_intro.tag,
    process:SITE.process.tag,
    factory:SITE.factory.tag,
    'products-teaser':SITE.products_teaser.tag,
    'blocks-sec':SITE.blocks[0].title,
    certs:SITE.certs.tag
  };
  Object.entries(chapterLabels).forEach(([id,label])=>{
    const el=$(`#${id} .chapter-meta span`);
    if(el) el.textContent=t(label);
  });
  const appTag=$('.applications-manifest .tag');
  if(appTag) appTag.textContent=t(SITE.apps.tag);
  setText('#all-products-btn',t(SITE.nav.products));
  setText('#cta-tag',t(SITE.nav.quote));
  localizeContactForm();

}

function renderProductsStatic(){
  if(pageIdentity()!=='page-products') return;
  const lead=$('.products-hero .sec-head');
  if(lead){
    textIn(lead,'h1',t(SITE.products_teaser.title));
    textIn(lead,'p',t(SITE.products_teaser.desc));
  }
}

function renderCustomStatic(){
  if(pageIdentity()!=='page-custom') return;
  const hero=$('body > section.hero');
  if(hero){
    textIn(hero,'h1',t(SITE.custom_intro.title));
    textIn(hero,'p',t(SITE.custom_intro.desc));
  }
  const customHeading=(key,fallback)=>SITE.custom_page?.headings?.[key]?.[LANG] || t(fallback);
  setText('#cu-details-title',customHeading('details',SITE.custom_intro.tag));
  setText('#cu-process-title',customHeading('process',SITE.process.title));
  setText('#cu-scope-title',customHeading('scope',SITE.apps.title));
  const cta=$('body > section.cta');
  if(cta){
    textIn(cta,'h2',t(SITE.cta.title));
    textIn(cta,'.custom-inquiry-lead',t(SITE.cta.desc));
    textIn(cta,'.custom-inquiry-copy .tag',t(SITE.nav.quote));
    localizeContactForm();
  }
}

function renderAboutStatic(){
  if(pageIdentity()!=='page-about') return;
  const hero=$('body.page-about > section.hero');
  if(hero){
    textIn(hero,'.hero-badge',t(SITE.factory.tag));
    const intro=$(':scope > .container > p:not(.about-credit)',hero);
    if(intro) intro.textContent=t(SITE.factory.desc);
    const imgs=$$('img',hero); imgs.forEach(img=>img.alt=t(SITE.company.name));
  }
  const aboutStory=SITE.about_story||{};
  const aboutStoryTag=SITE.about_story_tag||SITE.nav.about;
  const heads=[
    [$('#about-story'),aboutStoryTag,aboutStory.title||SITE.factory.title],
    [$('#about-snapshot'),SITE.hero.badge,SITE.company.name]
  ];
  heads.forEach(([section,tag,title])=>{
    if(!section) return;
    textIn(section,'.sec-head .tag',t(tag));
    textIn(section,'.sec-head h2',t(title));
  });
  const storyFlow=$('#about-story-flow');
  if(storyFlow){
    const localizedBody=aboutStory.body&&aboutStory.body[LANG];
    const paragraphs=Array.isArray(localizedBody)
      ? localizedBody
      : (Array.isArray(aboutStory.body&&aboutStory.body.en)?aboutStory.body.en:[]);
    const makeParagraph=text=>{
      const p=document.createElement('p');
      const highlight=aboutStory.highlight?t(aboutStory.highlight):'';
      const highlightAt=highlight?text.indexOf(highlight):-1;
      if(highlightAt<0) p.textContent=text;
      else{
        p.append(document.createTextNode(text.slice(0,highlightAt)));
        const strong=document.createElement('strong');
        strong.textContent=highlight;
        p.append(strong,document.createTextNode(text.slice(highlightAt+highlight.length)));
      }
      return p;
    };
    const images=(SITE.factory&&Array.isArray(SITE.factory.images))?SITE.factory.images.slice(0,6):[];
    const textGroups=[];
    let cursor=0;
    for(let i=0;i<Math.max(0,images.length-1);i++){
      const remaining=paragraphs.length-cursor;
      const slots=Math.max(1,images.length-1-i);
      const take=Math.max(0,Math.ceil(remaining/slots));
      textGroups.push(paragraphs.slice(cursor,cursor+take));
      cursor+=take;
    }
    const beats=images.map((item,index)=>{
      const beat=document.createElement('article');
      beat.className=`about-story-beat${index===images.length-1?' about-story-team':''}`;
      const figure=document.createElement('figure');
      figure.className='about-story-media';
      const img=document.createElement('img');
      img.src=typeof item==='string'?item:item.src;
      img.alt=typeof item==='object'&&item.alt?t(item.alt):`${t(SITE.factory.title)} ${index+1}`;
      img.loading=index===0?'eager':'lazy';
      img.decoding='async';
      figure.append(img);
      if(index<images.length-1){
        const copy=document.createElement('div');
        copy.className='about-story-copy';
        (textGroups[index]||[]).forEach(text=>copy.append(makeParagraph(text)));
        beat.append(copy,figure);
      }else{
        beat.append(figure);
      }
      return beat;
    });
    storyFlow.replaceChildren(...beats);
  }
  const cards=$$('#about-snapshot .card');
  const labels=[t({zh:'中国·深圳',en:'Shenzhen, China'}),t(SITE.factory.tag),t(SITE.factory.title),t(SITE.certs.title)];
  const values=[SITE.company.founded,'3,000 m²','100+','IP68'];
  cards.forEach((card,i)=>{ textIn(card,'h3',labels[i]); textIn(card,'p',values[i]); });
  const cta=$('body.page-about > section.cta');
  if(cta){
    textIn(cta,'h2',t(SITE.cta.title));
    textIn(cta,'p',t(SITE.cta.desc));
    textIn(cta,'.btn',t(SITE.nav.contact));
  }
}

function localizeContactForm(){
  const u=currentUI();
  const form=$('#contact-form');
  if(form){
    const firstName=$('#cf-first-name'),lastName=$('#cf-last-name'),name=$('#cf-name'),email=$('#cf-email'),message=$('#cf-msg');
    if(firstName){ firstName.placeholder=u.firstName||u.name; textIn(firstName.closest('.field'),'label',(u.firstName||u.name)+' *'); }
    if(lastName){ lastName.placeholder=u.lastName||u.name; textIn(lastName.closest('.field'),'label',(u.lastName||u.name)+' *'); }
    if(name){ name.placeholder=u.name; textIn(name.closest('.field'),'label',u.name+' *'); }
    if(email){ email.placeholder=u.email; textIn(email.closest('.field'),'label',u.email+' *'); }
    if(message){ message.placeholder=u.message; textIn(message.closest('.field'),'label',u.message+' *'); }
    textIn(form,'button[type="submit"]',u.send);
    const hint=$('p',form);
    if(hint){
      const href=(SITE.contact&&SITE.contact.whatsapp_link)||'#';
      hint.innerHTML=`${u.wa}: <a id="contact-wa" href="${href}" target="_blank" rel="noopener">WhatsApp</a>`;
    }
  }
}

function renderContactStatic(){
  if(pageIdentity()!=='page-contact') return;
  const hero=$('body > section.hero');
  if(hero){
    textIn(hero,'.hero-badge',t(SITE.nav.quote));
    textIn(hero,'h1',t(SITE.cta.title));
    textIn(hero,'p',t(SITE.cta.desc));
  }
  localizeContactForm();
}

function landingData(){
  const leaf=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  const map={'turbo-actuator-harness':'turbo','obd2-diagnostic-cable':'universal','j1939-cable':'heavyduty'};
  const category=PRODS.categories.find(c=>c.id===map[leaf]);
  return {leaf,category};
}

function renderLandingPage(){
  if(pageIdentity()!=='page-landing') return;
  const main=$('main'); if(!main) return;
  const {leaf,category}=landingData();
  const custom=leaf==='custom-wiring-harness';
  const name=custom?t(SITE.custom_intro.title):(category?t(category.name):t(SITE.products_teaser.title));
  const intro=custom?t(SITE.custom_intro.desc):(category?t(category.desc):t(SITE.products_teaser.desc));
  const detailItems=SITE.features||[];
  main.innerHTML=`
    <nav class="breadcrumb" aria-label="${t(SITE.nav.products)}"><a href="/">${t(SITE.nav.home)}</a><span class="crumb-sep" aria-hidden="true"></span><span>${name}</span></nav>
    <h1>${name}</h1>
    <p>${intro}</p>
    <div class="landing-actions"><a class="btn btn-primary" href="/contact">${t(SITE.nav.quote)}</a><a class="btn btn-ghost" href="/products">${t(SITE.nav.products)}</a></div>
    <section><h2>${t(SITE.custom_intro.title)}</h2><p>${t(SITE.custom_intro.desc)}</p></section>
    <section><h2>${t(SITE.blocks[0].title)}</h2><p>${t(SITE.blocks[0].text)}</p></section>
    <section><h2>${t(SITE.factory.title)}</h2><p>${t(SITE.factory.desc)}</p></section>
    <section><h2>${t(SITE.process.title)}</h2>${detailItems.map(item=>`<details><summary>${t(item.title)}</summary><p>${t(item.desc)}</p></details>`).join('')}</section>
    <section class="landing-cta"><h2>${t(SITE.cta.title)}</h2><p>${t(SITE.cta.desc)}</p><a class="btn btn-primary" href="/contact">${t(SITE.nav.contact)}</a></section>`;
}

function productRecordByRoute(){
  if(!PRODS) return null;
  const slug=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  for(const category of PRODS.categories){
    const product=(category.products||[]).find(p=>p.slug===slug);
    if(product) return {product,category};
  }
  return null;
}

function renderProductDetail(){
  if(pageIdentity()!=='page-product') return;
  const record=productRecordByRoute(); if(!record) return;
  const {product,category}=record;
  const name=productDisplayName(product,category);
  const main=$('main'); if(!main) return;
  const crumb=$('nav',main);
  if(crumb){
    crumb.classList.add('breadcrumb');
    crumb.setAttribute('aria-label',t(SITE.nav.products));
    crumb.innerHTML=`<a href="/">${t(SITE.nav.home)}</a><span class="crumb-sep" aria-hidden="true"></span><a href="/products">${t(SITE.nav.products)}</a><span class="crumb-sep" aria-hidden="true"></span><a href="/products#${category.id}">${t(category.name)}</a><span class="crumb-sep" aria-hidden="true"></span><span>${name}</span>`;
  }
  textIn(main,'.pd-side h1',name);
  $$('.pd-img img,.pd-gallery img',main).forEach(img=>img.alt=name);
  const list=$('.pd-hl',main);
  if(list){
    const lines=LANG==='en' && Array.isArray(product.highlights)
      ? product.highlights
      : [...SITE.features.map(item=>`${name} — ${t(item.desc)}`),t(SITE.blocks[0].text)];
    list.innerHTML=lines.map(line=>`<li>${line}</li>`).join('');
  }
  const units=SITE.stats.map(s=>typeof s.unit==='object'?t(s.unit):(s.unit||''));
  const values=[`10${units[0]?' '+units[0]:''}`,`7${units[1]?' '+units[1]:''}`,'100%','UL/RoHS'];
  const adv=$('.pd-adv',main);
  const advLabels=[t(SITE.stats[0].label),t(SITE.stats[1].label),t(SITE.stats[2].label),t(SITE.certs.title)];
  if(adv) adv.innerHTML=values.map((value,i)=>`<div class="adv"><b>${value}</b>${advLabels[i]}</div>`).join('');
  const contact=$('.pd-side > a.btn',main);
  if(contact){ contact.textContent=t(SITE.nav.quote); contact.href=`/contact?products=${encodeURIComponent(product.id)}`; }
  const meta=$('.pd-meta',main);
  if(meta) meta.textContent=`SKU: ${product.id} · OEM/ODM · ${t(SITE.custom_intro.tag)}`;
}

function renderDynamicSeo(){
  const identity=pageIdentity();
  let title=t(SITE.company.name),description=t(SITE.footer_about);
  if(identity==='page-home'){ title=t(SITE.hero.title)+' | '+title; description=t(SITE.hero.subtitle); }
  else if(identity==='page-products'){ title=t(SITE.products_teaser.title)+' | '+title; description=t(SITE.products_teaser.desc); }
  else if(identity==='page-custom'){ title=t(SITE.custom_intro.title)+' | '+title; description=t(SITE.custom_intro.desc); }
  else if(identity==='page-about'){ title=t(SITE.nav.about)+' | '+title; description=t(SITE.factory.desc); }
  else if(identity==='page-contact'){ title=t(SITE.nav.contact)+' | '+title; description=t(SITE.cta.desc); }
  else if(identity==='page-landing'){
    const {leaf,category}=landingData();
    const name=leaf==='custom-wiring-harness'?t(SITE.custom_intro.title):(category?t(category.name):t(SITE.products_teaser.title));
    title=name+' | '+title;
    description=leaf==='custom-wiring-harness'?t(SITE.custom_intro.desc):(category?t(category.desc):t(SITE.products_teaser.desc));
  }else if(identity==='page-product'){
    const record=productRecordByRoute();
    if(record){ title=productDisplayName(record.product,record.category)+' | '+title; description=t(record.category.desc); }
  }
  document.title=title;
  const desc=$('meta[name="description"]'); if(desc) desc.content=description;
  const ogTitle=$('meta[property="og:title"]'); if(ogTitle) ogTitle.content=title;
  const ogDesc=$('meta[property="og:description"]'); if(ogDesc) ogDesc.content=description;
}

function renderStaticPages(){
  renderLandingPage();
  renderProductDetail();
  setupProductGallery();
  renderHomeStatic();
  renderProductsStatic();
  renderCustomStatic();
  renderAboutStatic();
  renderContactStatic();
  renderSharedChrome();
  renderDynamicSeo();
  localizeInternalLinks();
}

function renderAll(){
  renderNav(); renderLogoCompany(); renderLangSelector();
  renderHero(); renderHotProduct(); renderCustom(); renderProcess(); renderApps();
  renderFactory(); renderCerts(); renderProductsTeaser(); renderBlocks(); renderCTA();
  renderFooter(); renderProductsPage(); renderContact(); renderAbout(); renderTitle(); renderFab(); renderProductSelect(); bindPsToggle();
  renderStaticPages();
  hydrateStaticIcons();
  syncDocumentLanguage();
  if(window.__siteDecorated) requestAnimationFrame(refreshMotion);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try{ await loadData(); }catch(e){ console.error(e); return; }
  renderAll();
  decoratePage();
  if(pageIdentity()==='page-products') window.addEventListener('hashchange',renderProductsPage);
  const tg=$('#nav-toggle'); if(tg){
    tg.setAttribute('aria-label',LANG==='zh'?'打开导航菜单':'Open navigation menu');
    tg.setAttribute('aria-expanded','false');
    tg.onclick=()=>{
      const nav=$('#nav-links'); if(!nav) return;
      const open=nav.classList.toggle('open');
      tg.setAttribute('aria-expanded',String(open));
      document.body.classList.toggle('nav-open',open);
    };
  }
  const form=$('#contact-form');
  if(form) form.onsubmit=(ev)=>{ ev.preventDefault();
    const firstNameEl=$('#cf-first-name'),lastNameEl=$('#cf-last-name'),legacyNameEl=$('#cf-name');
    const firstName=firstNameEl?firstNameEl.value.trim():'',lastName=lastNameEl?lastNameEl.value.trim():'';
    const name=legacyNameEl?legacyNameEl.value.trim():[firstName,lastName].filter(Boolean).join(' ');
    const email=$('#cf-email').value.trim(),msg=$('#cf-msg').value,u=currentUI();
    const prodItems = selectedProducts.map(pid=>{const p=findProduct(pid); if(!p) return '- '+pid; const img=p.images&&p.images[0]?location.origin+p.images[0]:''; return '- '+productDisplayName(p)+(img?'\n  '+img:'');}).join('\n');
    const prodLine = prodItems ? t(SITE.nav.products)+':\n'+prodItems : '';
    const nameLines=firstNameEl&&lastNameEl?(u.firstName||u.name)+': '+firstName+'\n'+(u.lastName||u.name)+': '+lastName:u.name+': '+name;
    const body = nameLines+'\n'+u.email+': '+email+'\n'+(prodLine?prodLine+'\n':'')+'\n'+msg;
    sendMail(t(SITE.nav.contact)+' - '+name, body, email); };
  const ppop=$('#product-pop');
  if(ppop){
    document.addEventListener('click',(e)=>{
      if(e.target.closest('#product-pop')) return;
      if(e.target.closest('.prod')) return; // product cards now link to dedicated pages
      if(ppop.classList.contains('open')) closeProductModal();
    });
  }
  const modal=$('#contact-modal');
  if(modal){
    $$('[data-close]', modal).forEach(el=>el.onclick=closeModal);
    const overlay=modal.querySelector('.contact-modal-overlay');
    if(overlay) overlay.onclick=closeModal;
    const mf=$('#modal-form');
    if(mf) mf.onsubmit=(ev)=>{ ev.preventDefault(); const name=$('#modal-name').value, email=$('#modal-email').value, msg=$('#modal-message').value, u=currentUI();
      sendMail(t(SITE.nav.contact)+' - '+name, u.name+': '+name+'\n'+u.email+': '+email+'\n\n'+msg, email); };
  }
  document.addEventListener('keydown',e=>{
    const openModalEl=$('#contact-modal.open');
    if(e.key==='Tab' && openModalEl){
      const focusable=$$('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',openModalEl).filter(el=>!el.hidden);
      if(focusable.length){
        const first=focusable[0], last=focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }
    }
    if(e.key==='Escape'){
      closeModal(); closeProductModal();
      const nav=$('#nav-links'); if(nav) nav.classList.remove('open');
      document.body.classList.remove('nav-open');
      const tg=$('#nav-toggle'); if(tg) tg.setAttribute('aria-expanded','false');
      const fabMenu=$('#fab-menu'),fabMain=$('#fab-main');
      if(fabMenu){fabMenu.classList.remove('open');fabMenu.setAttribute('aria-hidden','true');}
      if(fabMain) fabMain.setAttribute('aria-expanded','false');
      const langMenu=$('#lang-menu'),langBtn=$('#lang-btn');
      if(langMenu){langMenu.classList.remove('open');langMenu.setAttribute('aria-hidden','true');}
      if(langBtn) langBtn.setAttribute('aria-expanded','false');
      const psPanel=$('#ps-panel'),psTrigger=$('#ps-trigger');
      if(psPanel){psPanel.classList.remove('open');psPanel.setAttribute('aria-hidden','true');}
      if(psTrigger) psTrigger.setAttribute('aria-expanded','false');
    }
  });
});
