/* Super Smile site - 20 languages */
let SITE = null, PRODS = null, SERIES = null, CAPABILITIES = null, CATEGORY_DETAILS = null, LANG = 'en';
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
  en:{title:'Turbo Actuator Harness', desc:'Catalogue reference for actuator-side connector and harness requirements; materials and compatibility are confirmed per project.'},
  zh:{title:'涡轮执行器连接线束', desc:'用于核对执行器端接口与线束需求的产品参考；材料和兼容范围按项目确认。'}
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
function htmlEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
// 多语言取值：o[LANG] 回退 o.en 回退空
function t(o){
  if(!o) return '';
  if(typeof o === 'string') return o;
  return o[LANG] || o.en || o.zh || Object.values(o).find(v=>v) || '';
}

const PCC_COPY={
  type:{en:'Product type',zh:'产品小类'},
  overview:{en:'Overview',zh:'产品介绍'},
  back:{en:'Back to Products',zh:'返回产品中心'},
  consult:{en:'Ask About This Product Type',zh:'咨询这一类产品'},
  range:{en:'custom product range',zh:'可定制产品范围'}
};

function collectLocalizedNodes(value,nodes=[],seen=new Set()){
  if(!value||typeof value!=='object'||seen.has(value)) return nodes;
  seen.add(value);
  if(!Array.isArray(value)&&typeof value.en==='string'){
    if(!value[LANG]) nodes.push(value);
    return nodes;
  }
  if(Array.isArray(value)) value.forEach(item=>collectLocalizedNodes(item,nodes,seen));
  else Object.values(value).forEach(item=>collectLocalizedNodes(item,nodes,seen));
  return nodes;
}

function translationCache(lang){
  try{return JSON.parse(localStorage.getItem(`ss-page-translations-v1-${lang}`)||'{}');}catch(e){return {};}
}

function saveTranslationCache(lang,cache){
  try{localStorage.setItem(`ss-page-translations-v1-${lang}`,JSON.stringify(cache));}catch(e){}
}

function translationChunks(entries,maxLength=2400){
  const chunks=[];let current=[];let length=0;
  entries.forEach(entry=>{
    const addition=entry.source.length+18;
    if(current.length&&length+addition>maxLength){chunks.push(current);current=[];length=0;}
    current.push(entry);length+=addition;
  });
  if(current.length) chunks.push(current);
  return chunks;
}

async function googleTranslateChunk(chunk,lang){
  const source=chunk.map((entry,index)=>`[[SS${String(index).padStart(3,'0')}]]\n${entry.source}`).join('\n');
  const query=new URLSearchParams({client:'gtx',sl:'en',tl:lang,dt:'t',q:source});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const response=await fetch(`https://translate.googleapis.com/translate_a/single?${query}`,{signal:controller.signal,referrerPolicy:'no-referrer'});
    if(!response.ok) throw new Error(`translation HTTP ${response.status}`);
    const payload=await response.json();
    const translated=(payload[0]||[]).map(part=>part[0]||'').join('');
    const matches=[...translated.matchAll(/\[\[SS(\d{3})\]\]\s*([\s\S]*?)(?=\n?\[\[SS\d{3}\]\]|$)/g)];
    if(matches.length!==chunk.length) throw new Error('translation segment mismatch');
    matches.forEach(match=>{const entry=chunk[Number(match[1])];if(entry) entry.translation=match[2].trim();});
  }finally{clearTimeout(timer);}
}

async function translateLocalizedNodes(nodes,lang){
  if(lang==='en'||lang==='zh'||!nodes.length) return;
  const cache=translationCache(lang);
  const unique=new Map();
  nodes.forEach(node=>{
    const source=node.en.trim();
    if(cache[source]) node[lang]=cache[source];
    else if(!unique.has(source)) unique.set(source,{source,nodes:[]});
    if(!node[lang]&&unique.has(source)) unique.get(source).nodes.push(node);
  });
  const entries=[...unique.values()];
  if(!entries.length) return;
  try{
    for(const chunk of translationChunks(entries)) await googleTranslateChunk(chunk,lang);
    entries.forEach(entry=>{
      if(!entry.translation) return;
      cache[entry.source]=entry.translation;
      entry.nodes.forEach(node=>{node[lang]=entry.translation;});
    });
    saveTranslationCache(lang,cache);
  }catch(error){console.warn('Page translation unavailable:',error);}
}

async function ensureCurrentPageLanguage(){
  if(LANG==='en'||LANG==='zh'||!CAPABILITIES) return;
  const nodes=collectLocalizedNodes(PCC_COPY);
  collectLocalizedNodes(CAPABILITIES,nodes);
  const itemEntries=[];
  for(const group of CAPABILITIES.groups||[]){
    const translated=[];
    for(const source of group.items?.en||[]){
      const holder={en:source};translated.push(holder);itemEntries.push(holder);
    }
    group.items[LANG]=translated;
  }
  if(pageIdentity()==='page-product-category'){
    const record=productCategoryPageRecord();
    if(record){
      const itemDetail=(CATEGORY_DETAILS||{})[record.key]||{};
      const fallback=CAPABILITIES.categoryDetail?.sets?.[record.group.id]||{};
      collectLocalizedNodes(itemDetail,nodes);
      collectLocalizedNodes(fallback,nodes);
      collectLocalizedNodes(CAPABILITIES.categoryDetail,nodes);
    }
  }
  await translateLocalizedNodes([...nodes,...itemEntries],LANG);
  for(const group of CAPABILITIES.groups||[]){
    group.items[LANG]=(group.items[LANG]||[]).map(item=>item[LANG]||item.en);
  }
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
  const [s,p,series,capabilities,categoryDetails] = await Promise.all([
    fetch('/data/site.json?v=20260902v17').then(r=>r.json()),
    fetch('/data/products.json?v=20260831v7').then(r=>r.json()),
    fetch('/data/product-series.json?v=20260902v1').then(r=>r.json()),
    fetch('/data/product-capabilities.json?v=20260902v4').then(r=>r.json()),
    fetch('/data/product-category-details.json?v=20260902v1').then(r=>r.json())
  ]);
  SITE=s; PRODS=p; SERIES=series; CAPABILITIES=capabilities; CATEGORY_DETAILS=categoryDetails;
  applyEvidenceBoundaries();
  const q=new URLSearchParams(location.search);
  LANG = q.get('lang') || localStorage.getItem('lang') || 'en';
  // 若存储的语言不在列表，回退en
  if(!LANGS.some(l=>l.code===LANG)) LANG='en';
  localStorage.setItem('lang', LANG);
}

function applyEvidenceBoundaries(){
  if(!SITE) return;
  if(SITE.custom_intro) SITE.custom_intro.desc={
    en:'Send a drawing, sample, connector photo or pinout. We first review the interfaces, materials, process feasibility and inspection requirements, then define the sample and production scope for the specific project.',
    zh:'提供图纸、样品、接口照片或针脚定义后，我们先审核接口、材料、工艺可行性与检验要求，再为具体项目确定打样和生产范围。'
  };
  if(SITE.apps){
    SITE.apps.title={en:'Verified Product Application Areas',zh:'已核实的产品应用范围'};
    SITE.apps.items={
      en:['Automotive Diagnostic & ECU Service','Heavy-Duty Diesel Diagnostic','Low-Voltage EV Diagnostic','OEM Replacement & Aftermarket'],
      zh:['汽车诊断与ECU维修','重型柴油设备诊断','新能源汽车低压诊断','OEM替换与后市场维修']
    };
    SITE.apps.images=[
      '/assets/images/applications/automotive-diagnostics-photoreal-v2.jpg',
      '/assets/images/applications/heavy-duty-j1939-photoreal-v2.jpg',
      '/assets/images/products/p038_IM315.jpg',
      '/assets/images/applications/oem-remanufacturing-photoreal-v2.jpg'
    ];
  }
  if(SITE.factory){
    SITE.factory.desc={
      en:'Engineering review, incoming material inspection, crimping, assembly, continuity checks and shipment review are coordinated within one project quality flow. The actual product capability and inspection scope are confirmed for each order.',
      zh:'工程确认、来料检验、压接加工、组装、导通检查和出货复核纳入同一套项目质量流程；实际产品能力与检验范围按订单逐项确认。'
    };
    SITE.factory.clients={
      en:'Public product references currently cover automotive diagnostic, heavy-duty, low-voltage EV and turbo-related assemblies.',
      zh:'当前公开产品参考覆盖汽车诊断、重卡、低压新能源诊断及涡轮相关组件。'
    };
  }
  const beyond=(SITE.blocks||[]).find(block=>block&&block.title&&block.title.en==='Beyond the Stock List');
  if(beyond) beyond.text={
    en:'The Stock Center shows selected catalogue products. Requirements outside the documented automotive diagnostic, heavy-duty, low-voltage EV and turbo-related range require a separate capability, material, tooling and validation review before quotation.',
    zh:'现货中心展示部分产品库型号。超出汽车诊断、重卡、低压新能源诊断和涡轮相关已记录范围的需求，报价前必须单独审核能力、材料、工装与验证方案。'
  };
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
    ensureCurrentPageLanguage().then(()=>renderAll());
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
  nav.innerHTML=links.map(([href,k])=>{
    const active=href==='/products'?(here==='/products'||here.startsWith('/products/')):href===here;
    const link=`<a href="${href}" class="${active?'active':''}${k==='products'?' nav-products-link':''}"${k==='products'?' aria-haspopup="true" aria-expanded="false"':''}>${t(n[k])}</a>`;
    return k==='products'?`<div class="nav-products-entry">${link}<button class="product-mega-toggle" type="button" aria-label="${htmlEscape(t(n.products))}" aria-expanded="false">${ico('chevronDown')}</button></div>`:link;
  }).join('');
  renderProductMegaMenu();
}

function renderProductMegaMenu(){
  const nav=$('#nav-links');if(!nav||!CAPABILITIES) return;
  const menu=document.createElement('section');
  menu.className='product-mega';menu.id='product-mega';menu.setAttribute('aria-label',t(SITE.nav.products));
  menu.innerHTML=(CAPABILITIES.groups||[]).map(group=>{
    const items=t(group.items)||group.items?.en||[];
    return `<article class="product-mega-group"><h2><a href="/products#${group.id}">${htmlEscape(t(group.directoryTitle||group.title))}</a></h2><ul>${items.map((item,index)=>{
      const key=`${group.id}-${String(index+1).padStart(2,'0')}`;
      const live=Boolean((CATEGORY_DETAILS||{})[key]?.page);
      return live?`<li><a href="${productCapabilityHref(group,index)}" data-category-key="${key}">${htmlEscape(item)}</a></li>`:`<li><span class="is-pending" aria-disabled="true">${htmlEscape(item)}</span></li>`;
    }).join('')}</ul></article>`;
  }).join('');
  nav.appendChild(menu);
  const header=$('.header'),entry=$('.nav-products-entry'),link=$('.nav-products-link'),toggle=$('.product-mega-toggle');
  if(!header||!entry||!link||!toggle) return;
  let closeTimer;
  const setOpen=open=>{
    clearTimeout(closeTimer);header.classList.toggle('product-mega-open',open);
    link.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-expanded',String(open));
  };
  const scheduleClose=()=>{closeTimer=setTimeout(()=>setOpen(false),140);};
  if(matchMedia('(min-width:1081px) and (hover:hover) and (pointer:fine)').matches){
    entry.addEventListener('mouseenter',()=>setOpen(true));menu.addEventListener('mouseenter',()=>setOpen(true));
    entry.addEventListener('mouseleave',scheduleClose);menu.addEventListener('mouseleave',scheduleClose);
  }
  entry.addEventListener('focusin',event=>{if(event.target!==toggle) setOpen(true);});menu.addEventListener('focusin',()=>setOpen(true));
  menu.addEventListener('focusout',event=>{if(!menu.contains(event.relatedTarget)&&!entry.contains(event.relatedTarget)) scheduleClose();});
  toggle.onclick=event=>{event.preventDefault();event.stopPropagation();setOpen(!header.classList.contains('product-mega-open'));};
  if(!window.__productMegaOutsideBound){
    window.__productMegaOutsideBound=true;
    document.addEventListener('click',event=>{if(!event.target.closest('.nav-products-entry,.product-mega')) $('.header')?.classList.remove('product-mega-open');});
  }
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
  const grid=$('#prod-grid'); if(!grid || grid.closest('[hidden]') || !PRODS) return;
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
  grid.innerHTML=cat.products.map(p=>{const pn=productDisplayName(p,cat); return `<a class="prod" href="/product/${p.slug}" data-pid="${p.id}"><span class="prod-media"><img src="${p.images[0]}" alt="${pn}" loading="lazy"></span><div class="info"><b>${pn}</b><span>${t(cat.name)}</span></div></a>`;}).join('');
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
  en:{index:'Custom Wiring Harness Manufacturer in China | OEM/ODM | Super Smile',products:'Wire Harness & Cable Assembly Product Centre | Super Smile',custom:'Custom Wiring Harness | OEM/ODM Wire Harness Manufacturer China',about:'About Us | 3,000㎡ Wiring Harness Factory in Shenzhen, China',contact:'Contact the Wire Harness Factory | Get a Custom Harness Quote','turbo-actuator-harness':'Turbo Actuator Harness Manufacturer | Super Smile','obd2-diagnostic-cable':'OBD2 Diagnostic Cable Manufacturer | Super Smile','j1939-cable':'J1939 and Heavy-Duty Diagnostic Cable Manufacturer | Super Smile','custom-wiring-harness':'Custom Wiring Harness Manufacturer | OEM/ODM Wire Harness Factory China'},
  zh:{index:'线束工厂 | 定制线束 | 中国线束工厂 | 深圳市超斯迈尔科技有限公司',products:'线束产品中心 | 定制线束 | 汽车诊断线束 | 中国线束工厂',custom:'线束定制 | OEM/ODM线束工厂 | 中国线束定制厂家',about:'关于我们 | 线束工厂 | 深圳市超斯迈尔科技有限公司',contact:'联系线束工厂 | 定制线束询价 | 深圳市超斯迈尔科技有限公司'}
};
const DESCS = {
  en:{index:'Shenzhen Super Smile manufactures documented automotive diagnostic, heavy-duty, low-voltage EV and turbo-related cable assemblies, with project-specific engineering and inspection review.',products:'Browse custom wire harness, cable assembly, automotive, connector-system, specialty molding and wire-and-cable capabilities by product family and project requirement.',custom:'Custom wire harness and cable assembly requirements reviewed from drawings, samples, connector photos or pinouts, with project-specific materials, sampling and inspection scope.',about:'Meet Shenzhen Super Smile and review its engineering confirmation, incoming inspection, crimping, assembly, continuity checks and shipment review workflow.',contact:'Contact Super Smile to review a custom wiring harness, automotive diagnostic cable, heavy-duty cable or turbo actuator harness requirement.','turbo-actuator-harness':'Turbo actuator harnesses and connector leads reviewed against the exact actuator, connector, pin definition, materials and installation environment.','obd2-diagnostic-cable':'OBD2 diagnostic cable assemblies defined by the tool-side and vehicle-side interfaces, pin assignment, cable structure and intended diagnostic task.','j1939-cable':'Heavy-duty diagnostic cable assemblies defined by the exact tool, equipment, connector version, pin assignment and intended J1939 or service function.','custom-wiring-harness':'Custom wiring harness manufacturing from drawings, samples, connector photos or pin definitions, with engineering review, sample validation and project-specific inspection.'},
  zh:{index:'深圳市超斯迈尔科技有限公司公开产品范围涵盖汽车诊断、重卡、低压新能源诊断及涡轮相关电缆组件，工程与检验范围按项目确认。',products:'产品中心展示OBD2、重卡诊断、涡轮相关及低压新能源维修电缆参考，兼容与定制范围按项目确认。',custom:'依据图纸、样品、接口照片或针脚定义审核定制线束与电缆组件需求，材料、打样和检验范围按项目确认。',about:'了解超斯迈尔的工程确认、来料检验、压接、组装、导通检查与出货复核流程。',contact:'联系超斯迈尔，审核定制线束、汽车诊断线、重卡诊断线或涡轮执行器线束需求。'}
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
  if(window.SS_PRODUCT_CATEGORY || document.body?.classList.contains('page-product-category')) return 'page-product-category';
  if(path.includes('/products/')) return 'page-product-series';
  if(['turbo-actuator-harness','obd2-diagnostic-cable','j1939-cable','ev-diagnostic-cable','industrial-equipment-wiring-harness-guide','robotic-wiring-harness-flex-guide','wire-harness-prototype-sample-validation','custom-wiring-harness','custom-cable-assembly','automotive-wiring-harness','automotive-diagnostic-cable-manufacturer','ecu-programming-cable'].includes(leaf)) return 'page-landing';
  return 'page-'+leaf;
}

function decoratePage(){
  if(window.__siteDecorated) return;
  window.__siteDecorated=true;
  const body=document.body;
  const identity=pageIdentity();
  body.classList.add('site-redesign',identity);
  if(identity==='page-landing' && ['custom-wiring-harness','custom-cable-assembly','automotive-wiring-harness','automotive-diagnostic-cable-manufacturer','obd2-diagnostic-cable','ecu-programming-cable','turbo-actuator-harness','j1939-cable','ev-diagnostic-cable','industrial-equipment-wiring-harness-guide','robotic-wiring-harness-flex-guide','wire-harness-prototype-sample-validation'].includes(landingData().leaf)) body.classList.add('page-landing-custom');

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

function capabilityTypeRecord(key){
  if(!CAPABILITIES || !key) return null;
  for(const group of CAPABILITIES.groups||[]){
    const prefix=group.id+'-';
    if(!key.startsWith(prefix)) continue;
    const itemIndex=Number(key.slice(prefix.length))-1;
    if(Number.isInteger(itemIndex)&&itemIndex>=0&&itemIndex<(group.items?.en||[]).length) return {key,group,itemIndex};
  }
  return null;
}

function productCapabilitySlug(value){
  return String(value||'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function productCapabilityHref(group,itemIndex){
  const english=(group.items?.en||[])[itemIndex]||`${group.id}-${itemIndex+1}`;
  return `/products/${productCapabilitySlug(english)}`;
}

function renderProductsStatic(){
  if(pageIdentity()!=='page-products') return;
  if(!CAPABILITIES) return;
  const directory=$('#pc-directory');
  if(directory){
    directory.setAttribute('aria-label',t(CAPABILITIES.directory.title));
    directory.innerHTML=(CAPABILITIES.groups||[]).map(group=>`<article class="pc-group" id="${group.id}"><h2><span>${t(group.directoryTitle||group.title)}</span><span class="pc-group-chevron" aria-hidden="true"></span></h2><ul>${t(group.items).map((item,itemIndex)=>{const key=`${group.id}-${String(itemIndex+1).padStart(2,'0')}`;return `<li><a class="pc-subcategory-link" href="${productCapabilityHref(group,itemIndex)}" data-pc-category="${key}">${item}</a></li>`;}).join('')}</ul></article>`).join('');
  }
}

function productCategoryPageRecord(){
  const embedded=window.SS_PRODUCT_CATEGORY||{};
  return capabilityTypeRecord(embedded.key||document.body?.dataset.categoryKey||'');
}

function renderProductCategoryRichMarkup(page,item){
  const heading=key=>htmlEscape(t(page.headings?.[key]));
  const image=(src,alt,className='')=>`<figure class="pcc-rich-media ${className}"><img src="${htmlEscape(src)}" alt="${htmlEscape(alt)}" width="1536" height="1024" loading="lazy" decoding="async"></figure>`;
  if(page.layout==='connector-atlas'){
    const atlasImage=(src,alt,className='')=>`<figure class="pcc-atlas-media ${className}"><img src="${htmlEscape(src)}" alt="${htmlEscape(alt)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`;
    const chapters=(page.chapters||[]).map((chapter,index)=>`<article class="pcc-atlas-chapter pcc-atlas-chapter-${index%4+1}"><span class="pcc-atlas-index">${String(index+1).padStart(2,'0')}</span>${atlasImage(chapter.image,t(chapter.title))}<div class="pcc-atlas-copy"><p class="pcc-atlas-kicker">${htmlEscape(t(chapter.kicker))}</p><h2>${htmlEscape(t(chapter.title))}</h2><p class="pcc-atlas-summary">${htmlEscape(t(chapter.copy))}</p><div class="pcc-atlas-points">${(chapter.points||[]).map(point=>`<section><h3>${htmlEscape(t(point.title))}</h3><p>${htmlEscape(t(point.copy))}</p></section>`).join('')}</div></div></article>`).join('');
    const faq=(page.faq||[]).map((entry,index)=>`<details${index===0?' open':''}><summary>${htmlEscape(t(entry.q))}</summary><p>${htmlEscape(t(entry.a))}</p></details>`).join('');
    const credits=(page.mediaCredits||[]).map(entry=>`<li><a href="${htmlEscape(entry.url)}" target="_blank" rel="noopener">${htmlEscape(entry.file)}</a><span>${htmlEscape(entry.author)} · ${htmlEscape(entry.license)}</span></li>`).join('');
    return `<section class="pcc-atlas-opening"><div><span>CONNECTOR ATLAS</span><h2>${heading('introduction')}</h2><p>${htmlEscape(t(page.lead))}</p></div>${atlasImage(page.images.range,`${item} ${LANG==='zh'?'产品系列':'product family'}`,'pcc-atlas-opening-media')}</section><section class="pcc-atlas-sequence">${chapters}</section><section class="pcc-rich-section pcc-rich-faq pcc-atlas-faq"><header class="pcc-rich-heading"><h2>${heading('faq')}</h2></header><div class="pcc-faq-grid">${faq}</div></section><details class="pcc-media-credits"><summary>${htmlEscape(t(page.creditHeading))}</summary><ul>${credits}</ul></details>`;
  }
  const cards=(items,className='pcc-photo-notes',ordered=false)=>{
    const wrapper=ordered?'ol':'div';
    const card=ordered?'li':'article';
    return `<${wrapper} class="${className}">${(items||[]).map((entry,index)=>`<${card} class="pcc-photo-note"><figure class="pcc-item-media pcc-mask-${index%4+1}"><img src="${htmlEscape(entry.image||page.images.range)}" alt="${htmlEscape(t(entry.title))}" width="800" height="600" loading="lazy" decoding="async"></figure><div class="pcc-photo-copy"><h3>${htmlEscape(t(entry.title))}</h3><p>${htmlEscape(t(entry.copy))}</p></div></${card}>`).join('')}</${wrapper}>`;
  };
  const faq=(page.faq||[]).map((entry,index)=>`<details${index===0?' open':''}><summary>${htmlEscape(t(entry.q))}</summary><p>${htmlEscape(t(entry.a))}</p></details>`).join('');
  return `
  <section class="pcc-rich-section pcc-rich-intro">
    <header class="pcc-rich-heading"><h2>${heading('introduction')}</h2><p>${htmlEscape(t(page.subtitle))}</p></header>
    <div class="pcc-rich-intro-grid"><div class="pcc-rich-lead"><p>${htmlEscape(t(page.lead))}</p></div>${image(page.images.range,`${item} ${LANG==='zh'?'可定制产品范围':'product range'}`,'pcc-rich-media-wide')}</div>
  </section>
  <section class="pcc-rich-section pcc-rich-advantages">
    <header class="pcc-rich-heading"><h2>${heading('advantages')}</h2></header>
    ${cards(page.variants,'pcc-photo-notes pcc-photo-notes-six pcc-variant-list')}
  </section>
  <section class="pcc-rich-section pcc-rich-materials">
    <header class="pcc-rich-heading"><h2>${heading('materials')}</h2></header>
    ${cards(page.materials,'pcc-photo-notes pcc-photo-notes-four pcc-material-list')}
  </section>
  <section class="pcc-rich-section pcc-rich-solutions">
    <header class="pcc-rich-heading"><h2>${heading('solution')}</h2></header>
    ${cards(page.solutions,'pcc-photo-notes pcc-photo-notes-four pcc-solution-list')}
  </section>
  <section class="pcc-rich-section pcc-rich-applications">
    <header class="pcc-rich-heading"><h2>${heading('applications')}</h2></header>
    ${cards(page.applications,'pcc-photo-notes pcc-photo-notes-six pcc-application-index')}
  </section>
  <section class="pcc-rich-section pcc-rich-process">
    <header class="pcc-rich-heading"><h2>${heading('method')}</h2></header>
    ${cards(page.process,'pcc-photo-notes pcc-photo-notes-six pcc-process-rail',true)}
  </section>
  <section class="pcc-rich-section pcc-rich-reliability">
    <header class="pcc-rich-heading"><h2>${heading('reliability')}</h2></header>
    ${cards(page.reliability,'pcc-photo-notes pcc-photo-notes-four pcc-reliability-list')}
  </section>
  <section class="pcc-rich-section pcc-rich-benefits">
    <header class="pcc-rich-heading"><h2>${heading('benefits')}</h2></header>
    ${cards(page.benefits,'pcc-photo-notes pcc-photo-notes-four pcc-benefit-notes')}
  </section>
  <section class="pcc-rich-section pcc-rich-faq">
    <header class="pcc-rich-heading"><h2>${heading('faq')}</h2></header>
    <div class="pcc-faq-grid">${faq}</div>
  </section>`;
}

function renderProductCategoryPage(){
  if(pageIdentity()!=='page-product-category' || !CAPABILITIES) return;
  const record=productCategoryPageRecord();
  if(!record) return;
  const labels=CAPABILITIES.categoryDetail;
  const fallback=(labels.sets||{})[record.group.id]||{};
  const itemDetail=(CATEGORY_DETAILS||{})[record.key]||{};
  const item=t(record.group.items)[record.itemIndex];
  const group=t(record.group.directoryTitle||record.group.title);
  const intro=t(itemDetail.intro||fallback.intro);
  const knowledge=itemDetail.knowledge?t(itemDetail.knowledge):intro;
  const notes=itemDetail.notes?t(itemDetail.notes):`${t(fallback.review||[]).slice(0,3).join(LANG==='zh'?'；':'; ')}${LANG==='zh'?'。':'.'}`;
  const delivery=itemDetail.delivery?t(itemDetail.delivery):(LANG==='zh'?'确认需求与接口后进入物料审核、样品制作、验证和受控生产，具体检验项目按订单约定。':'After the requirement and interfaces are confirmed, the project moves through material review, sampling, validation and controlled production. Inspection points are agreed for each order.');
  const ui={home:t(SITE.nav.home),products:t(SITE.nav.products),type:t(PCC_COPY.type),overview:t(PCC_COPY.overview),back:t(PCC_COPY.back),consult:t(PCC_COPY.consult)};
  setText('#pcc-home',ui.home);setText('#pcc-products',ui.products);setText('#pcc-group',group);
  setText('#pcc-eyebrow',ui.type);setText('#pcc-title',item);setText('#pcc-overview-label',ui.overview);setText('#pcc-intro',intro);
  const titleEl=$('#pcc-title');if(titleEl){const length=[...item].length;titleEl.classList.toggle('is-medium',length>15&&length<=24);titleEl.classList.toggle('is-long',length>24);}
  setText('#pcc-knowledge-title',t(labels.knowledgeTitle));setText('#pcc-knowledge',knowledge);
  setText('#pcc-notes-title',t(labels.notesTitle));setText('#pcc-notes',notes);
  setText('#pcc-delivery-title',t(labels.deliveryTitle));setText('#pcc-delivery',delivery);
  setText('#pcc-inputs-title',t(labels.inputsTitle));setText('#pcc-review-title',t(labels.reviewTitle));
  const inputs=$('#pcc-inputs'),review=$('#pcc-review');
  if(inputs) inputs.innerHTML=t(fallback.inputs||[]).map(value=>`<li>${value}</li>`).join('');
  if(review) review.innerHTML=t(fallback.review||[]).map(value=>`<li>${value}</li>`).join('');
  const richContent=$('#pcc-rich-content');if(richContent&&itemDetail.page) richContent.innerHTML=renderProductCategoryRichMarkup(itemDetail.page,item);
  const back=$('#pcc-back');if(back) back.textContent=ui.back;
  const cta=$('#pcc-cta');if(cta){cta.textContent=ui.consult;cta.href=`/contact?category=${record.key}&category_name=${encodeURIComponent(item)}`;}
  setText('#pcc-closing-group',group);setText('#pcc-closing-title',item);
  const closingCta=$('#pcc-closing-cta');if(closingCta){closingCta.textContent=ui.consult;closingCta.href=`/contact?category=${record.key}&category_name=${encodeURIComponent(item)}`;}
  const embedded=window.SS_PRODUCT_CATEGORY||{};
  const heroImage=$('#pcc-hero-image');if(heroImage){heroImage.src=embedded.image||record.group.image;heroImage.alt=`${item} - ${group}`;}
  document.body.dataset.categoryKey=record.key;
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
    if(message){
      message.placeholder=u.message;
      textIn(message.closest('.field'),'label',u.message+' *');
      const q=new URLSearchParams(location.search);
      const categoryName=q.get('category_name')||q.get('category');
      if(categoryName&&!message.value) message.value=(LANG==='zh'?'咨询产品类别：':'Product category inquiry: ')+categoryName;
    }
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

function productSeriesRecord(){
  const leaf=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
  const embedded=window.SS_PRODUCT_SERIES;
  const series=(SERIES&&SERIES.series||[]).find(item=>item.slug===leaf)||(embedded&&embedded.series)||null;
  const category=series&&PRODS?(PRODS.categories||[]).find(item=>item.id===series.id):null;
  return {series,category};
}

function renderProductSeriesPage(){
  if(pageIdentity()!=='page-product-series') return;
  const main=$('main');
  const {series,category}=productSeriesRecord();
  if(!main || !series || !category) return;
  const ui=(LANG==='zh'?{
    home:'首页',products:'产品中心',records:'产品记录',seriesId:'系列编号',basis:'选择依据',basisValue:'型号 + 接口',index:'产品索引',indexTitle:'本系列真实产品',indexIntro:'打开具体产品，查看原始产品照片与现有记录，再提交准确需求。',inputs:'选型资料',scope:'范围说明',faq:'常见问题',faqTitle:'采购前需要确认',related:'相关产品系列',review:'项目审核',ctaTitle:'提供准确型号、接口与目标任务',ctaText:'请附上清晰接口照片、现有产品或样品、目标设备、所需功能及数量范围。报价前我们会先核对正确的产品路径。',contact:'联系超斯迈尔',send:'提交产品需求',all:'全部产品'
  }:{
    home:'Home',products:'Products',records:'Product records',seriesId:'Series ID',basis:'Selection basis',basisValue:'Model + interface',index:'Product index',indexTitle:'Real Products in This Series',indexIntro:'Open an item to inspect its original product photos and available record before sending a requirement.',inputs:'Selection inputs',scope:'Scope',faq:'FAQ',faqTitle:'Before You Order',related:'Related Product Series',review:'Project review',ctaTitle:'Send the Exact Model, Interface and Task',ctaText:'Include clear connector photos, the current product or sample, target equipment, required function and quantity range. We will review the correct product path before quoting.',contact:'Contact Super Smile',send:'Send Product Request',all:'All Products'
  });
  const title=t(series.title),description=t(series.description);
  const products=category.products||[];
  const hero=products[0];
  const heroImage=series.heroImage||hero.images[0];
  const heroAlt=series.heroAlt?t(series.heroAlt):t(hero.name);
  const related=(series.related||[]).map(id=>({series:(SERIES.series||[]).find(item=>item.id===id),category:(PRODS.categories||[]).find(item=>item.id===id)})).filter(item=>item.series&&item.category);
  main.innerHTML=`
    <section class="series-hero">
      <nav class="breadcrumb" aria-label="${ui.products}"><a href="/">${ui.home}</a><span class="crumb-sep" aria-hidden="true"></span><a href="/products">${ui.products}</a><span class="crumb-sep" aria-hidden="true"></span><span>${title}</span></nav>
      <div class="series-hero-grid"><div class="series-hero-copy"><span class="series-kicker">${t(series.eyebrow)}</span><h1>${title}</h1><p>${description}</p><div class="series-actions"><a class="btn btn-primary" href="/contact">${ui.send}</a><a class="btn btn-ghost" href="/products">${ui.all}</a></div></div><figure class="series-hero-media"><img src="${heroImage}" alt="${heroAlt}" width="1600" height="1000" decoding="async" fetchpriority="high"></figure></div>
      <div class="series-data-rail"><div><span>${ui.records}</span><strong>${products.length}</strong></div><div><span>${ui.seriesId}</span><strong>${category.id.toUpperCase()}</strong></div><div><span>${ui.basis}</span><strong>${ui.basisValue}</strong></div></div>
    </section>
    <section class="series-catalogue"><header><span>01 / ${ui.index}</span><h2>${ui.indexTitle}</h2><p>${ui.indexIntro}</p></header><div class="series-product-grid">${products.map((product,index)=>`<a class="series-product" href="/product/${product.slug}"><figure><img src="${product.images[0]}" alt="${t(product.name)}" width="720" height="720" ${index?'loading="lazy"':'fetchpriority="high"'} decoding="async"></figure><div><span>${String(product.id||'').toUpperCase()}</span><h2>${t(product.name)}</h2><span class="series-product-arrow" aria-hidden="true">→</span></div></a>`).join('')}</div></section>
    <section class="series-decision"><div><span>02 / ${ui.inputs}</span><h2>${t(series.decisionTitle)}</h2><p>${t(series.decisionIntro)}</p></div><ol>${t(series.checks).map((item,index)=>`<li><span>0${index+1}</span><p>${item}</p></li>`).join('')}</ol></section>
    <section class="series-scope"><span>03 / ${ui.scope}</span><h2>${t(series.scopeTitle)}</h2><p>${t(series.scopeText)}</p></section>
    <section class="series-faq"><header><span>04 / ${ui.faq}</span><h2>${ui.faqTitle}</h2></header><div>${series.faqs.map(item=>`<details><summary>${t(item.q)}</summary><p>${t(item.a)}</p></details>`).join('')}</div></section>
    ${related.length?`<section class="series-related"><header><span>05 / INDEX</span><h2>${ui.related}</h2></header><nav aria-label="${ui.related}">${related.map((item,index)=>`<a href="/products/${item.series.slug}"><span>0${index+1}</span><strong>${t(item.series.title)}</strong><small>${item.category.products.length} ${ui.records.toLowerCase()}</small><span aria-hidden="true">→</span></a>`).join('')}</nav></section>`:''}
    <section class="series-cta"><span>${ui.review}</span><h2>${ui.ctaTitle}</h2><p>${ui.ctaText}</p><a class="btn btn-primary" href="/contact">${ui.contact}</a></section>`;
}

function customLandingCopy(){
  const copy={
    en:{
      title:'Custom Wiring Harness Manufacturer',
      intro:'From drawings, samples, connector photos or pin definitions, we review the interface, cable structure and assembly requirements before sampling and production.',
      capability:'Define Every Connection',
      capabilityIntro:'Connector selection, pin routing, cable structure and identification are confirmed against the information agreed for each project.',
      families:'Built Around Real Product Families',
      familiesIntro:'Our current catalogue shows the connector formats and assembly experience that can support a new custom requirement.',
      process:'A Controlled Path to Production',
      quality:'Checks Defined Before Production',
      qualityIntro:'Inspection is based on the drawing, approved sample and requirements agreed for the project. Records and acceptance points are confirmed before shipment.',
      qualityItems:['Materials and connector compatibility reviewed before sampling','Pin mapping and assembly details checked against the approved specification','Continuity, appearance and functional checks agreed for the project','Final packaging and identification reviewed before shipment'],
      faq:'Custom Harness FAQ',
      ctaTitle:'Start With Your Drawing, Sample or Pinout',
      ctaText:'Send the available project information. Our team will review feasibility, missing details and the next confirmation step before quoting.',
      faqs:[
        ['What should I send for a quote?','A drawing, sample, connector photos, pin definition or target-device information can be used as the starting point. More complete information reduces confirmation time.'],
        ['Can you manufacture from a physical sample?','A sample can be reviewed together with photos and known specifications. The team will identify any details that still need confirmation before production.'],
        ['Which harness details can be customized?','Connector and terminal choice, pin routing, wire length and gauge, cable structure, labels and packaging can be reviewed for each project.'],
        ['How are sample and production quantities confirmed?','Quantity and schedule are confirmed after the design, material availability, testing requirements and manufacturing feasibility have been reviewed.'],
        ['What is checked before shipment?','The inspection plan is agreed for the project and can include pin mapping, continuity, appearance, identification, packaging and specified functional checks.']
      ]
    },
    zh:{
      title:'定制线束制造商',
      intro:'从图纸、样品、接口照片或针脚定义开始，先确认接口、线材结构与组装要求，再进入样品验证和批量生产。',
      capability:'把每一个连接定义清楚',
      capabilityIntro:'接口选型、针脚走向、线材结构与标识方式，均依据每个项目确认后的资料执行。',
      families:'以真实产品系列为基础',
      familiesIntro:'现有产品库展示了我们可用于新定制项目的接口形式与组装经验。',
      process:'从需求确认到稳定生产',
      quality:'生产前先明确检验边界',
      qualityIntro:'检验以图纸、确认样和项目约定要求为依据，出货前明确记录方式与验收项目。',
      qualityItems:['打样前复核物料与接口兼容性','依据确认规格检查针脚定义与组装细节','按项目约定执行导通、外观及功能检查','出货前复核标识、包装与装箱信息'],
      faq:'定制线束常见问题',
      ctaTitle:'从图纸、样品或针脚定义开始',
      ctaText:'把现有项目资料发给我们，团队会先确认可行性、缺失信息与下一步确认事项，再提供报价。',
      faqs:[
        ['询价需要提供哪些资料？','可以从图纸、样品、接口照片、针脚定义或目标设备信息开始。资料越完整，确认过程越高效。'],
        ['可以根据实物样品生产吗？','可以结合实物样品、照片及已知规格进行评估；生产前会列出仍需确认的细节。'],
        ['哪些线束细节可以定制？','可按项目评估接口与端子、针脚走向、线长与线径、线材结构、标签及包装。'],
        ['样品数量和批量数量如何确定？','需要在设计、物料供应、测试要求和生产可行性确认后，再确定数量与交期。'],
        ['出货前会检查什么？','检验方案按项目约定，可包括针脚定义、导通、外观、标识、包装及指定功能检查。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function cableAssemblyLandingCopy(){
  const copy={
    en:{
      title:'Custom Cable Assembly Manufacturer',
      intro:'For cables built between defined interfaces, we review connector fit, pin mapping, cable construction, length, identification and the checks required for the target equipment.',
      capability:'Specify the Complete Cable Assembly',
      capabilityIntro:'A cable assembly is confirmed as a complete interface-to-interface product: connectors, conductors, pin routing, protection, labels and packaging are reviewed together.',
      families:'Existing Assemblies Show the Starting Point',
      familiesIntro:'Our catalogue provides real connector and cable examples that can be referenced when defining a new assembly.',
      process:'From Interface Definition to Shipment',
      quality:'Acceptance Criteria Come First',
      qualityIntro:'Cable performance requirements vary by application. The required checks, limits and records are agreed before sampling rather than assumed from a generic product claim.',
      qualityItems:['Connector interfaces and mating information confirmed','Pin map, cable length and construction reviewed against the approved specification','Electrical or functional checks defined for the target assembly','Labels, packaging and shipment identification checked against the order'],
      faq:'Cable Assembly FAQ',
      ctaTitle:'Define Both Ends of the Cable',
      ctaText:'Send the connector information, pin map, cable requirements and target equipment details available. We will identify missing inputs before quoting.',
      faqs:[
        ['What is the difference between a cable assembly and a wiring harness?','A cable assembly commonly connects defined interfaces in a contained cable structure, while a wiring harness may route multiple branches and discrete wires. The final classification depends on the product design.'],
        ['What information is needed to define a cable assembly?','Connector part numbers or clear photos, pin mapping, cable length and construction, target equipment information, labels and required checks are useful starting inputs.'],
        ['Can cable length, connector type and labels be customized?','These items can be reviewed for each project, subject to component availability, electrical requirements and manufacturing feasibility.'],
        ['Do all cable assemblies use the same inspection plan?','No. Inspection points depend on the interface, signal or power requirements, cable construction and acceptance criteria agreed for the project.'],
        ['Can a current product be used as the reference?','Yes. An existing product or sample can be the starting point, provided the required interfaces, pin map and permitted design changes are confirmed.']
      ]
    },
    zh:{
      title:'定制电缆组件制造商',
      intro:'针对两端接口明确的电缆组件，逐项确认接口配合、针脚映射、线材结构、长度、标识以及目标设备所需的检验项目。',
      capability:'完整定义一条电缆组件',
      capabilityIntro:'电缆组件按完整的接口到接口产品确认：连接器、导体、针脚走向、防护结构、标签与包装需要一并评估。',
      families:'从现有组件找到设计起点',
      familiesIntro:'现有产品库提供真实的接口与线缆案例，可作为新组件定义时的参考。',
      process:'从接口定义到装箱交付',
      quality:'先确定验收标准，再开始打样',
      qualityIntro:'不同应用对电缆性能的要求不同。检验项目、限值与记录方式在打样前约定，不用笼统产品口号代替项目标准。',
      qualityItems:['确认两端接口及配合信息','依据确认规格复核针脚映射、线长与线材结构','为目标组件明确电气或功能检查项目','按订单复核标签、包装与出货标识'],
      faq:'电缆组件常见问题',
      ctaTitle:'先把电缆两端定义清楚',
      ctaText:'提供现有的接口资料、针脚映射、线材要求和目标设备信息，我们会先列出缺失输入，再进入报价。',
      faqs:[
        ['电缆组件与线束有什么区别？','电缆组件通常在相对完整的线缆结构中连接两个明确接口；线束可能包含更多分支和离散导线。最终分类仍取决于具体设计。'],
        ['定义电缆组件需要哪些资料？','可先提供接口料号或清晰照片、针脚映射、线长与结构、目标设备信息、标签和所需检验项目。'],
        ['线长、接口和标签可以定制吗？','可以按项目评估，但需要结合器件供应、电气要求与制造可行性确认。'],
        ['所有电缆组件都使用同一套检验方案吗？','不是。检验项目取决于接口、信号或供电要求、线材结构以及项目约定的验收标准。'],
        ['可以用现有产品作为参考吗？','可以从现有产品或样品开始，但需要确认目标接口、针脚定义以及允许调整的设计范围。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function automotiveHarnessLandingCopy(){
  const copy={
    en:{
      title:'Automotive Diagnostic Wiring Harnesses',
      intro:'We build low-voltage cable and harness assemblies for vehicle diagnostic tools, service equipment, gateway adapters and turbo actuator service applications, based on confirmed interfaces and pin definitions.',
      capability:'A Clear Automotive Scope',
      capabilityIntro:'This page covers diagnostic and service-equipment connections shown in our catalogue. Complete vehicle looms, safety-critical systems and high-voltage harnesses require separate capability review and are not implied here.',
      families:'Catalogue Evidence, Not Generic Claims',
      familiesIntro:'OBD2, heavy-duty diagnostic, specialty adapter and turbo-related products show the current range of interfaces we can discuss.',
      process:'Confirm the Vehicle-Side and Tool-Side Interfaces',
      quality:'Compatibility Must Be Verified',
      qualityIntro:'Connector shape alone does not confirm compatibility. Vehicle generation, diagnostic tool model, pin assignment and intended function need to be checked before production.',
      qualityItems:['Vehicle or equipment model and year range recorded','Both connector interfaces and locking features confirmed','Pin assignment and intended diagnostic function reviewed','Compatibility wording and labels checked before shipment'],
      faq:'Automotive Harness FAQ',
      ctaTitle:'Send the Vehicle, Tool and Connector Details',
      ctaText:'Share the vehicle or equipment model, diagnostic tool, connector photos, pin information and required length so the correct scope can be reviewed.',
      faqs:[
        ['Do you manufacture complete vehicle wiring looms?','Our current public catalogue focuses on low-voltage diagnostic, service-equipment and turbo-related assemblies. A complete vehicle loom is a separate project and requires an independent capability review.'],
        ['Is every OBD2-shaped cable compatible with every vehicle?','No. The connector form is only one part of compatibility. Pin allocation, protocol, tool requirements, vehicle generation and intended use also need confirmation.'],
        ['What details are needed for a replacement diagnostic cable?','Provide the diagnostic tool model, vehicle or equipment range, both connector views, pin information, cable length and photos or a sample of the current cable when available.'],
        ['Can brand-compatible replacement cables be discussed?','Yes, when the exact model and interface are verified. Compatibility descriptions do not imply endorsement or authorization by the referenced brand.'],
        ['Does this page include high-voltage EV harnesses?','No. The products shown here are low-voltage diagnostic and adapter assemblies. High-voltage EV harness capability is not claimed on this page.']
      ]
    },
    zh:{
      title:'汽车诊断线束制造商',
      intro:'依据已确认的接口与针脚定义，为汽车诊断工具、维修设备、网关转接和涡轮执行器维修场景生产低压电缆与线束组件。',
      capability:'明确汽车线束的实际范围',
      capabilityIntro:'本页只覆盖产品库中已有的诊断与维修设备连接。整车主线束、安全关键系统和高压线束需要单独审核能力，不在此笼统宣传。',
      families:'用真实产品证明，不用泛化口号',
      familiesIntro:'OBD2、重卡诊断、专用转接及涡轮相关产品，构成当前可以进一步讨论的接口范围。',
      process:'同时确认车辆端与设备端接口',
      quality:'兼容性必须逐项核实',
      qualityIntro:'接口外形相同不代表一定兼容。生产前需要核对车型代次、诊断设备型号、针脚定义与目标功能。',
      qualityItems:['记录车辆或设备型号及适用年份范围','确认两端接口、锁止结构与配合关系','复核针脚定义与目标诊断功能','出货前检查兼容性表述、标签和包装'],
      faq:'汽车诊断线束常见问题',
      ctaTitle:'提供车型、设备和接口资料',
      ctaText:'发送车辆或设备型号、诊断工具、接口照片、针脚信息与所需长度，我们会先核对正确的项目范围。',
      faqs:[
        ['你们生产整车主线束吗？','当前公开产品库聚焦低压诊断、维修设备及涡轮相关组件。整车主线束属于独立项目，必须另行审核能力。'],
        ['所有OBD2外形的线都能兼容所有车型吗？','不能。接口外形只是兼容性的一部分，还需确认针脚分配、协议、设备要求、车型代次和具体用途。'],
        ['定制替换诊断线需要哪些资料？','请提供诊断设备型号、车辆或设备范围、两端接口视图、针脚信息、线长，以及现有线缆照片或样品。'],
        ['可以讨论品牌兼容替换线吗？','可以，但必须核实准确型号与接口。兼容性描述不代表获得相关品牌背书或授权。'],
        ['本页包含新能源汽车高压线束吗？','不包含。本页展示的是低压诊断与转接组件，不在此声称高压新能源线束能力。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function automotiveDiagnosticLandingCopy(){
  const copy={
    en:{
      title:'Automotive Diagnostic Cable Manufacturer',
      intro:'A procurement hub for low-voltage diagnostic cables connecting vehicles, service equipment and scan tools across OBD2, heavy-duty, specialty and gateway-adapter applications.',
      capability:'Choose by Diagnostic System, Not Shape Alone',
      capabilityIntro:'Passenger-vehicle OBD2, heavy-duty J1939, device-specific main cables and gateway adapters use different interfaces and pin definitions. Each group has its own product and compatibility path.',
      families:'Five Product Paths From One Catalogue',
      familiesIntro:'Use the product families below to narrow the requirement before discussing length, connector, pinout, labels or packaging.',
      process:'From Equipment Match to Approved Sample',
      quality:'Compatibility Is a Project Requirement',
      qualityIntro:'A connector that fits mechanically can still be electrically or functionally incorrect. The vehicle, equipment, pin assignment and intended task must be reviewed together.',
      qualityItems:['Vehicle, engine or equipment scope recorded','Diagnostic tool and both connector interfaces identified','Pin assignment and intended function confirmed','Product name, compatibility note and packaging checked'],
      faq:'Diagnostic Cable FAQ',
      ctaTitle:'Identify the Vehicle and Diagnostic Tool First',
      ctaText:'Send the vehicle or equipment model, diagnostic tool, both connector views, existing cable reference and required function. We will route the request to the correct product family.',
      faqs:[
        ['How are OBD2, J1939 and device-specific cables different?','OBD2 commonly refers to the standardized passenger-vehicle diagnostic connector, J1939 covers heavy-duty vehicle communication and off-board diagnostic connections, while device-specific cables may use proprietary tool-side interfaces and pin maps.'],
        ['What should a diagnostic cable RFQ include?','Include the vehicle or equipment range, diagnostic tool model, both connector photos or part numbers, pin definition, cable length, required function and a current sample when available.'],
        ['Can one diagnostic cable work with every vehicle?','No. Mechanical fit does not prove protocol, pinout or tool compatibility. Each claimed vehicle and equipment combination needs confirmation.'],
        ['Is an ECU flashing cable the same as a normal diagnostic cable?','Not necessarily. Programming and flashing functions depend on the tool, target ECU, wiring path and operating procedure. A product should only be described for that function when the exact use has been verified.'],
        ['Are the EV products on this site high-voltage cables?','No. The EV-related products in the current catalogue are low-voltage diagnostic and gateway adapter cables, not high-voltage traction harnesses.']
      ]
    },
    zh:{
      title:'汽车诊断线制造商',
      intro:'面向汽车、维修设备与诊断工具之间的低压连接，统一梳理 OBD2、重卡、专用设备主线和网关转接等采购路径。',
      capability:'按诊断系统选择，不只看接口外形',
      capabilityIntro:'乘用车 OBD2、重卡 J1939、设备专用主线与网关转接使用不同接口和针脚定义，需要分别进入对应产品与兼容性路径。',
      families:'一个产品库，五条采购路径',
      familiesIntro:'先通过以下产品系列缩小需求范围，再确认线长、接口、针脚、标签和包装。',
      process:'从设备匹配到确认样品',
      quality:'兼容性属于项目要求',
      qualityIntro:'机械结构能够插合，不代表电气与功能一定正确。车型、设备、针脚定义与目标任务必须一起核对。',
      qualityItems:['记录车型、发动机或设备范围','识别诊断工具与两端接口','确认针脚定义与目标功能','复核产品名称、兼容说明和包装信息'],
      faq:'汽车诊断线常见问题',
      ctaTitle:'先确定车辆与诊断设备',
      ctaText:'提供车型或设备型号、诊断工具、两端接口视图、现有线缆参考与目标功能，我们会把需求分配到正确产品系列。',
      faqs:[
        ['OBD2、J1939和设备专用线有什么区别？','OBD2通常指乘用车标准诊断接口；J1939覆盖重型车辆通信与车外诊断连接；设备专用线还可能使用诊断工具侧的专有接口和针脚定义。'],
        ['诊断线询价需要提供什么？','请提供车型或设备范围、诊断工具型号、两端接口照片或料号、针脚定义、线长、目标功能以及现有样品。'],
        ['一条诊断线能兼容所有车型吗？','不能。机械插合不代表协议、针脚与设备兼容，每一组车型和诊断设备组合都需要确认。'],
        ['ECU刷写线与普通诊断线一样吗？','不一定。编程和刷写取决于诊断设备、目标 ECU、接线路径和操作流程，只有具体用途核实后才能这样描述产品。'],
        ['网站中的新能源产品属于高压线吗？','不属于。当前产品库中的新能源相关产品为低压诊断与网关转接线，不是高压动力线束。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function obd2LandingCopy(){
  const copy={
    en:{
      title:'OBD2 Diagnostic Cable Manufacturer',
      intro:'Passenger-vehicle diagnostic cable assemblies built around the standardized OBD interface and the confirmed scan-tool connection, pin assignment, cable length and intended service function.',
      capability:'Standard Connector, Project-Specific Cable',
      capabilityIntro:'The vehicle-side OBD connector provides a common physical access point, but the complete cable still depends on the tool-side interface, pin usage, protocol requirements and intended task.',
      families:'OBD2 Cables, Extensions and Tool Adapters',
      familiesIntro:'Use the relevant product family as the starting point, then verify the exact tool, vehicle range and cable function.',
      familyIds:['universal','adapter','specialty'],
      process:'Confirm Both Ends Before Sampling',
      quality:'Do Not Infer Compatibility From the Plug',
      qualityIntro:'A 16-pin connector can be physically similar across products while the pin allocation and intended diagnostic function differ. Compatibility must be documented for the actual combination.',
      qualityItems:['Vehicle range and scan-tool model identified','Vehicle-side and tool-side interfaces confirmed','Pin allocation and intended function reviewed','Length, strain protection, labels and packaging checked'],
      faq:'OBD2 Cable FAQ',
      ctaTitle:'Send the Scan Tool and Vehicle Details',
      ctaText:'Provide the scan-tool model, vehicle range, both connector views, required function and cable length so the correct OBD2 assembly can be reviewed.',
      faqs:[
        ['Does the OBD2 connector use a standardized physical interface?','Yes. The road-vehicle diagnostic connector is standardized for access to diagnostic information, but the complete cable and tool-side connection still require project-specific confirmation.'],
        ['Can every 16-pin OBD2 cable work with every scan tool?','No. The tool-side interface, pin assignment, supported protocol and intended task may differ even when the vehicle-side connector looks the same.'],
        ['What is needed to customize an OBD2 cable?','Provide the scan-tool model, vehicle range, connector photos or part numbers, pin definition, cable length, required function and an existing cable or sample when available.'],
        ['Are heavy-duty J1939 cables part of this page?','No. Heavy-duty J1939 and Deutsch diagnostic assemblies are handled in the dedicated J1939 and heavy-duty cable section.'],
        ['Can labels and packaging be reviewed?','Yes. Identification and packaging can be reviewed together with the technical assembly requirements and confirmed for the project.']
      ]
    },
    zh:{
      title:'OBD2诊断线制造商',
      intro:'围绕标准化车辆 OBD 接口，结合已确认的诊断设备端接口、针脚定义、线长和维修功能生产乘用车诊断线组件。',
      capability:'标准接口，不等于标准成品线',
      capabilityIntro:'车辆端 OBD 接口提供通用的物理访问点，但完整线缆仍取决于设备端接口、针脚用途、协议要求和目标任务。',
      families:'OBD2主线、延长线与设备转接',
      familiesIntro:'先从对应产品系列选择设计起点，再核实准确的诊断设备、车型范围与线缆功能。',
      familyIds:['universal','adapter','specialty'],
      process:'打样前同时确认两端接口',
      quality:'不能只看插头判断兼容性',
      qualityIntro:'不同产品可能使用外形相近的16针接口，但针脚分配和目标诊断功能仍有差异，必须按实际组合记录兼容范围。',
      qualityItems:['确认车型范围与诊断设备型号','核对车辆端和设备端接口','复核针脚分配与目标功能','检查线长、应力保护、标签和包装'],
      faq:'OBD2诊断线常见问题',
      ctaTitle:'提供诊断设备与车型资料',
      ctaText:'发送诊断设备型号、车型范围、两端接口视图、目标功能与线长，我们会核对正确的 OBD2 组件。',
      faqs:[
        ['OBD2是否使用标准化的物理接口？','是。道路车辆诊断接口针对诊断信息访问进行了标准化，但完整线缆和设备端连接仍需按项目确认。'],
        ['所有16针OBD2线都能用于所有诊断设备吗？','不能。即使车辆端接口外形相同，设备端接口、针脚分配、支持协议和目标任务也可能不同。'],
        ['定制OBD2线需要哪些资料？','请提供诊断设备型号、车型范围、接口照片或料号、针脚定义、线长、目标功能以及现有线缆或样品。'],
        ['重卡J1939诊断线属于本页吗？','不属于。重卡 J1939 与 Deutsch 诊断组件由独立的 J1939 和重卡诊断线页面承接。'],
        ['可以确认标签和包装吗？','可以。标识与包装可和技术组件要求一起评估，并按项目确认。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function ecuProgrammingLandingCopy(){
  const copy={
    en:{
      title:'ECU Programming Cable Manufacturer',
      intro:'Cable assemblies for verified diagnostic programming and main-test workflows, built from real product references and confirmed against the tool, target ECU, connector interfaces and required wiring path.',
      capability:'Programming Is a System-Level Function',
      capabilityIntro:'A cable cannot be classified by connector shape alone. The diagnostic tool, ECU, power arrangement, pin routing and operating procedure determine whether an assembly is suitable for a programming task.',
      families:'Current ECU and Main-Test Cable References',
      familiesIntro:'The products below are existing catalogue references. Each new requirement still needs its exact equipment and function checked before compatibility is stated.',
      productSlugs:['dts-9-pin-deutsch-obd2-ecu-flashing','dts-9-pin-deutsch-main-ecu-flashing','dts-metal-shell-9-pin-deutsch-to','dts-3-row-db15-to-obd2-16','dts-2-row-db15-to-obd2-16'],
      process:'Verify the Complete Programming Setup',
      quality:'Function Must Be Confirmed, Not Assumed',
      qualityIntro:'The approved sample, wiring definition and actual equipment combination establish the acceptance criteria. A generic continuity result alone does not prove a programming function.',
      qualityItems:['Diagnostic tool and target ECU recorded','Connector interfaces and pin route verified','Required wiring and operating context confirmed','Compatibility wording limited to the checked setup'],
      faq:'ECU Programming Cable FAQ',
      ctaTitle:'Send the Tool, ECU and Existing Cable Reference',
      ctaText:'Provide the diagnostic tool model, target ECU or equipment, both connector views, pin information, intended task and an existing cable or sample when available.',
      faqs:[
        ['Is every diagnostic cable suitable for ECU programming?','No. Programming depends on the diagnostic tool, target ECU, connector interfaces, pin route, power arrangement and procedure. The complete setup must be verified.'],
        ['What information is needed for an ECU cable request?','Provide the tool model, target ECU or equipment, connector photos or part numbers, pin definition, cable length, intended task and an existing sample when available.'],
        ['Does continuity testing prove that flashing will work?','No. Continuity can confirm defined electrical paths, but it does not by itself prove protocol behavior, equipment compatibility or a successful programming procedure.'],
        ['Can an existing cable be used as the reference?','Yes, provided the requester has the right to use the sample and the required interfaces, wiring and permitted changes can be documented.'],
        ['How should compatibility be described?','Compatibility should name the exact checked tool, equipment or ECU scope and should not imply endorsement or authorization by a referenced brand.']
      ]
    },
    zh:{
      title:'ECU编程线制造商',
      intro:'围绕真实产品参考，为已核实的诊断编程与主测试流程生产电缆组件，并结合诊断设备、目标 ECU、两端接口和所需接线路径确认用途。',
      capability:'编程功能由完整系统决定',
      capabilityIntro:'不能只根据接口外形判断一条线是否适合编程。诊断设备、目标 ECU、供电方式、针脚走向和操作流程共同决定实际用途。',
      families:'现有ECU与主测试线参考',
      familiesIntro:'以下为产品库中的真实产品参考；任何新需求仍需核实准确设备与功能后，才能描述兼容范围。',
      productSlugs:['dts-9-pin-deutsch-obd2-ecu-flashing','dts-9-pin-deutsch-main-ecu-flashing','dts-metal-shell-9-pin-deutsch-to','dts-3-row-db15-to-obd2-16','dts-2-row-db15-to-obd2-16'],
      process:'核实完整的编程设备组合',
      quality:'功能必须验证，不能推测',
      qualityIntro:'确认样、接线定义与实际设备组合共同决定验收标准；普通导通结果本身不能证明编程功能。',
      qualityItems:['记录诊断设备与目标ECU','核对两端接口和针脚路径','确认接线要求与操作环境','兼容性表述限定在已核实组合内'],
      faq:'ECU编程线常见问题',
      ctaTitle:'提供诊断设备、ECU和现有线缆参考',
      ctaText:'发送诊断设备型号、目标 ECU 或设备、两端接口视图、针脚信息、目标任务以及现有线缆或样品。',
      faqs:[
        ['所有诊断线都适合ECU编程吗？','不适合。编程取决于诊断设备、目标 ECU、接口、针脚路径、供电方式和操作流程，必须核实完整组合。'],
        ['ECU线需求需要提供哪些资料？','请提供诊断设备型号、目标 ECU 或设备、接口照片或料号、针脚定义、线长、目标任务及现有样品。'],
        ['导通测试能证明刷写功能正常吗？','不能。导通可以确认规定的电气路径，但不能单独证明协议行为、设备兼容或编程流程成功。'],
        ['可以用现有线缆作为参考吗？','可以，但需求方需要拥有使用样品的权利，并能记录目标接口、接线和允许调整的范围。'],
        ['兼容性应该如何描述？','只描述已核实的诊断设备、目标 ECU 或设备范围，不暗示获得相关品牌背书或授权。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function turboActuatorLandingCopy(){
  const copy={
    en:{
      title:'Turbo Actuator Harness Manufacturer',
      intro:'Harnesses, connector leads and adjacent service parts for electronic turbo actuator applications, reviewed from the exact actuator, connector, pin definition and installation environment.',
      capability:'Define the Actuator-Side Connection First',
      capabilityIntro:'A turbo actuator connection is not identified by appearance alone. The actuator platform, connector keying, terminal arrangement, wire route and nearby heat or vibration conditions need to be documented before a replacement or custom assembly is approved.',
      families:'Current Turbo-Related Product References',
      familiesIntro:'These are existing catalogue records for a Holset actuator harness, turbo actuator and motor rubber grommet. They provide a practical starting point, not a blanket compatibility claim.',
      productSlugs:['holset-turbo-actuator-harness','turbo-actuator','motor-rubber-grommet'],
      heroProductSlug:'holset-turbo-actuator-harness',
      process:'Confirm the Assembly Against the Real Application',
      quality:'Material and Compatibility Claims Need Evidence',
      qualityIntro:'Temperature resistance, sealing, vibration performance and model compatibility depend on the selected materials and the verified installation. Required limits and checks must therefore be set for the specific project.',
      qualityItems:['Actuator platform and equipment application recorded','Connector keying, terminals and pin route confirmed','Wire protection and installation environment reviewed','Labels and compatibility wording limited to the approved scope'],
      faq:'Turbo Actuator Harness FAQ',
      ctaTitle:'Send the Actuator and Connector Reference',
      ctaText:'Provide the actuator model, equipment application, connector views, pin information, required length and the original harness or sample when available.',
      faqs:[
        ['Can a connector photo alone confirm the correct turbo harness?','No. A photo helps identify the housing, but the actuator platform, connector keying, terminals, pin route and intended equipment still need confirmation.'],
        ['What should be supplied for a replacement harness request?','Provide the actuator model, equipment or engine application, connector photos, pin information, cable length, installation details and an existing sample when available.'],
        ['Is every turbo actuator harness heat resistant?','The allowable temperature depends on the wire, sleeve, connector, terminals and installation position. A temperature claim should only be made against the selected material specification or agreed test requirement.'],
        ['Can an existing harness be used as the development reference?','Yes, when the requester has the right to use it and the interfaces, wiring, materials and permitted design changes can be documented.'],
        ['How is compatibility confirmed?','Compatibility is limited to the actuator and equipment scope that has been checked. A similar connector shape or brand name alone is not sufficient evidence.']
      ]
    },
    zh:{
      title:'涡轮执行器线束制造商',
      intro:'围绕电子涡轮执行器应用生产线束、连接引线及相关维修零件，并依据准确的执行器、接口、针脚定义和安装环境审核需求。',
      capability:'先定义执行器端连接',
      capabilityIntro:'不能只凭外观识别涡轮执行器连接。确认替换或定制组件前，需要记录执行器平台、接口防错、端子排列、线束走向以及附近的温度与振动环境。',
      families:'现有涡轮相关产品参考',
      familiesIntro:'以下为产品库中已有的 Holset 执行器线束、涡轮执行器和电机胶圈记录，可作为项目起点，但不代表笼统兼容所有型号。',
      productSlugs:['holset-turbo-actuator-harness','turbo-actuator','motor-rubber-grommet'],
      heroProductSlug:'holset-turbo-actuator-harness',
      process:'结合真实应用确认整套组件',
      quality:'材料与兼容性结论必须有依据',
      qualityIntro:'耐温、密封、振动表现和型号兼容性取决于所选材料与已核实的安装环境，因此必须按具体项目确定限值与检查项目。',
      qualityItems:['记录执行器平台与设备应用','确认接口防错、端子和针脚路径','审核线材防护与实际安装环境','标签及兼容性表述限定在批准范围内'],
      faq:'涡轮执行器线束常见问题',
      ctaTitle:'提供执行器与接口参考',
      ctaText:'发送执行器型号、设备应用、接口视图、针脚信息、所需长度，以及现有线束或样品。',
      faqs:[
        ['只看接口照片能确认正确的涡轮线束吗？','不能。照片可以帮助识别外壳，但仍需确认执行器平台、接口防错、端子、针脚路径和目标设备。'],
        ['替换线束需求需要提供哪些资料？','请提供执行器型号、设备或发动机应用、接口照片、针脚信息、线长、安装细节及现有样品。'],
        ['所有涡轮执行器线束都能耐高温吗？','允许温度取决于线材、套管、接口、端子和安装位置。只有依据选定材料规格或约定测试要求，才能给出耐温结论。'],
        ['可以使用现有线束作为开发参考吗？','可以，但需求方需要拥有使用该样品的权利，并能记录接口、接线、材料和允许变更的范围。'],
        ['如何确认兼容范围？','兼容范围只限定在已经核实的执行器与设备组合内；相似接口外形或品牌名称本身不是充分依据。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function j1939LandingCopy(){
  const copy={
    en:{
      title:'J1939 and Heavy-Duty Diagnostic Cable Manufacturer',
      intro:'Diagnostic and service cable assemblies for heavy-duty vehicles and diesel equipment, defined by the actual tool, equipment, connector variant, pin assignment and intended network or test function.',
      capability:'Separate Connector Format from Network Function',
      capabilityIntro:'A 9-pin Deutsch-style connector does not by itself prove J1939 compatibility. Connector keying, pin population, power paths, network wiring, diagnostic tool requirements and equipment generation all need to be checked.',
      families:'Heavy-Duty Product References',
      familiesIntro:'The catalogue records below show existing 9-pin Deutsch, OBD2, DB15, heavy-duty scanner and Cummins-related cable references. Each listing keeps its own verified scope.',
      productSlugs:['dts-9-pin-deutsch-obd2-ecu-flashing','dts-9-pin-deutsch-main-ecu-flashing','dts-metal-shell-9-pin-deutsch-to','launch-x431-hd-cable','cummins-insite'],
      heroProductSlug:'dts-9-pin-deutsch-obd2-ecu-flashing',
      process:'Verify Tool, Vehicle and Network Together',
      quality:'Signal and Power Paths Must Be Defined',
      qualityIntro:'Continuity is useful for checking an approved pin map, but it does not establish network behavior or tool compatibility. Cable structure, power routes and any required signal checks must be agreed for the exact application.',
      qualityItems:['Diagnostic tool and equipment scope recorded','Connector version, keying and populated pins confirmed','Power, ground and network paths reviewed against the approved definition','Compatibility wording restricted to the checked setup'],
      faq:'J1939 and Heavy-Duty Cable FAQ',
      ctaTitle:'Send the Tool and Equipment Details',
      ctaText:'Provide the scanner or interface model, vehicle or equipment range, connector views, pin definition, required function, length and an existing cable when available.',
      faqs:[
        ['Does every 9-pin Deutsch diagnostic connector use J1939?','No. Similar connector formats can use different keying, pin population, power arrangements or network assignments. The actual equipment and pin definition must be checked.'],
        ['What information is needed for a heavy-duty diagnostic cable?','Provide the diagnostic tool, vehicle or equipment range, both connector versions, pin map, cable length, intended task and an existing sample when available.'],
        ['Can an OBD2 adapter be treated as a universal truck cable?','No. OBD2 describes a connector family, while the vehicle-side network, pin routing, tool support and intended function determine compatibility.'],
        ['Does continuity testing prove J1939 communication?','No. Continuity can verify defined electrical paths, but network communication also depends on the equipment, wiring structure, interfaces and complete operating setup.'],
        ['How should brand and model compatibility be described?','Only the checked tool, vehicle or equipment scope should be named, without implying endorsement or authorization by the referenced manufacturer.']
      ]
    },
    zh:{
      title:'J1939与重卡诊断线制造商',
      intro:'为重型车辆和柴油设备生产诊断与维修电缆组件，并依据实际诊断工具、设备、接口版本、针脚定义以及目标网络或测试功能确定产品。',
      capability:'区分接口外形与网络功能',
      capabilityIntro:'9针Deutsch类接口本身不能证明兼容J1939。接口防错、已装针位、供电路径、网络接线、诊断设备要求和车辆代次都需要逐项核实。',
      families:'重卡诊断产品参考',
      familiesIntro:'以下产品库记录包含9针Deutsch、OBD2、DB15、重卡诊断设备及Cummins相关电缆参考，每个产品仍保留各自已核实的适用范围。',
      productSlugs:['dts-9-pin-deutsch-obd2-ecu-flashing','dts-9-pin-deutsch-main-ecu-flashing','dts-metal-shell-9-pin-deutsch-to','launch-x431-hd-cable','cummins-insite'],
      heroProductSlug:'dts-9-pin-deutsch-obd2-ecu-flashing',
      process:'同时核实设备、车辆与网络',
      quality:'必须明确网络与供电路径',
      qualityIntro:'导通检查可用于核对批准后的针脚图，但不能单独证明网络通讯或设备兼容。线缆结构、供电路径及所需信号检查应按准确应用约定。',
      qualityItems:['记录诊断设备与目标车辆或设备','确认接口版本、防错和已装针位','按照批准定义复核供电、接地与网络路径','兼容性表述限定在已核实组合内'],
      faq:'J1939与重卡诊断线常见问题',
      ctaTitle:'提供诊断设备与车辆资料',
      ctaText:'发送诊断设备或接口型号、车型或设备范围、接口视图、针脚定义、目标功能、线长及现有线缆。',
      faqs:[
        ['所有9针Deutsch诊断接口都使用J1939吗？','不是。相似接口可能采用不同防错、针位、供电方式或网络分配，必须核实实际设备与针脚定义。'],
        ['重卡诊断线需要提供哪些资料？','请提供诊断设备、车型或设备范围、两端接口版本、针脚图、线长、目标任务及现有样品。'],
        ['OBD2转接线可以当作通用重卡诊断线吗？','不能。OBD2只描述接口系列，车辆端网络、针脚路径、设备支持和目标功能共同决定兼容性。'],
        ['导通测试能证明J1939通讯正常吗？','不能。导通可以核对规定的电气路径，但网络通讯还取决于设备、线材结构、接口和完整操作组合。'],
        ['品牌与型号兼容性应该如何描述？','只描述已核实的诊断设备、车辆或设备范围，不暗示获得相关制造商背书或授权。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function evDiagnosticLandingCopy(){
  const copy={
    en:{
      title:'EV Diagnostic Cable Manufacturer',
      intro:'Low-voltage diagnostic, gateway, Ethernet, CAN and compressor-service cable assemblies for selected electric-vehicle tools and applications shown in our catalogue.',
      capability:'Keep Low-Voltage Service Cables in Scope',
      capabilityIntro:'This page covers diagnostic and service-equipment connections. It does not claim capability for high-voltage traction-battery, charging or orange-cable assemblies, which require a separate safety, material and process qualification.',
      families:'Current EV Diagnostic Product References',
      familiesIntro:'These existing NIO, LAUNCH, iCarsoft Tesla and EV compressor cable records provide the starting point for exact tool and vehicle verification.',
      productSlugs:['nio-nt2-0-ev-gateway-diagnostic-cable','launch-htt-ev17-3-row-db15-to','icarsoft-e2-tesla-lan-obd2-diagnostic-adapter','icarsoft-e2-tesla-can-adapter','6-in-1-ev-ac-compressor-diagnostic'],
      heroProductSlug:'nio-nt2-0-ev-gateway-diagnostic-cable',
      process:'Confirm Vehicle Generation, Tool and Intended Task',
      quality:'EV Compatibility Is Interface-Specific',
      qualityIntro:'Vehicle generation, service tool, gateway or network interface, connector variant and intended task must be checked together. A matching plug alone is not sufficient.',
      qualityItems:['Vehicle model and generation recorded','Diagnostic tool or service equipment confirmed','Network interface and pin route reviewed','Product wording limited to the verified low-voltage task'],
      faq:'EV Diagnostic Cable FAQ',
      ctaTitle:'Send the EV, Tool and Interface Reference',
      ctaText:'Provide the vehicle model and generation, diagnostic tool, connector views, intended task, pin information and an existing cable when available.',
      faqs:[
        ['Does this page cover high-voltage EV harnesses?','No. It covers low-voltage diagnostic and service-equipment connections shown in the catalogue. High-voltage traction-battery and charging assemblies are outside this page scope.'],
        ['Can one EV diagnostic cable work with every model year?','Not necessarily. Vehicle generation, gateway or network interface, tool support and pin routing can change, so the exact scope must be checked.'],
        ['What details are needed for an EV diagnostic cable request?','Provide the vehicle model and generation, tool or service equipment, connector information, pin definition, cable length and intended task.'],
        ['Are Ethernet, CAN and OBD2 adapters interchangeable?','No. They describe different interfaces and operating contexts. The required network, tool and pin route need to be defined for the target task.'],
        ['How should compatibility be stated?','Only the verified vehicle generation, tool and function should be named, without implying endorsement by the referenced brand.']
      ]
    },
    zh:{
      title:'新能源汽车诊断线制造商',
      intro:'为产品库中已有的新能源汽车工具与应用生产低压诊断、网关、以太网、CAN及压缩机维修电缆组件。',
      capability:'将范围限定在低压维修连接',
      capabilityIntro:'本页只覆盖诊断与维修设备连接，不宣传高压动力电池、充电或橙色高压线缆组件能力；这些项目需要独立的安全、材料与工艺资质审核。',
      families:'现有新能源诊断产品参考',
      familiesIntro:'以下为已有的蔚来、LAUNCH、iCarsoft Tesla及新能源压缩机电缆记录，可作为核实准确设备与车型的起点。',
      productSlugs:['nio-nt2-0-ev-gateway-diagnostic-cable','launch-htt-ev17-3-row-db15-to','icarsoft-e2-tesla-lan-obd2-diagnostic-adapter','icarsoft-e2-tesla-can-adapter','6-in-1-ev-ac-compressor-diagnostic'],
      heroProductSlug:'nio-nt2-0-ev-gateway-diagnostic-cable',
      process:'同时确认车型代次、设备与任务',
      quality:'新能源兼容性取决于准确接口',
      qualityIntro:'车型代次、维修设备、网关或网络接口、连接器版本和目标任务需要一起核实；接口能插上并不足以证明兼容。',
      qualityItems:['记录车型与车辆代次','确认诊断工具或维修设备','复核网络接口与针脚路径','产品表述限定在已核实的低压任务内'],
      faq:'新能源汽车诊断线常见问题',
      ctaTitle:'提供车型、设备与接口参考',
      ctaText:'发送车型及代次、诊断设备、接口视图、目标任务、针脚信息与现有线缆。',
      faqs:[
        ['本页是否包含新能源高压线束？','不包含。本页只覆盖产品库中的低压诊断与维修设备连接，高压动力电池及充电组件不在本页能力范围内。'],
        ['同一条新能源诊断线能兼容所有年份吗？','不一定。车型代次、网关或网络接口、诊断设备支持和针脚路径可能变化，必须核实准确范围。'],
        ['新能源诊断线需求需要哪些资料？','请提供车型及代次、诊断或维修设备、接口信息、针脚定义、线长和目标任务。'],
        ['以太网、CAN和OBD2转接线可以互换吗？','不能。它们对应不同接口与使用环境，目标任务所需网络、设备和针脚路径必须明确。'],
        ['兼容性应该如何描述？','只描述已核实的车型代次、诊断设备与功能，不暗示获得相关品牌背书。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function industrialEquipmentGuideCopy(){
  const copy={
    en:{
      title:'Industrial Equipment Wiring Harness Requirements Guide',
      intro:'A practical input and validation checklist for engineering and procurement teams defining a new industrial equipment harness or cable assembly before supplier capability review.',
      heroImage:'/assets/images/applications/industrial-equipment-photoreal-v2.jpg',
      capability:'Define the Operating Environment Before the Drawing',
      capabilityIntro:'Connector selection and wire size cannot be reviewed in isolation. Fixed or moving installation, voltage and current, temperature, vibration, bend radius, liquids, abrasion, service access and applicable project standards all affect the design inputs.',
      hideFamilies:true,
      process:'Turn Requirements into an Approved Sample',
      quality:'Build the Validation Plan Around the Application',
      qualityIntro:'There is no single generic test plan for every industrial harness. The approved drawing, material specifications, operating environment and customer acceptance criteria determine which electrical, mechanical and environmental checks are required.',
      qualityItems:['Operating voltage, current and circuit functions documented','Connector interfaces, pin map, wire structure and routing constraints defined','Mechanical and environmental risks converted into measurable requirements','Sample records and acceptance criteria approved before volume discussion'],
      faq:'Industrial Harness Requirements FAQ',
      ctaTitle:'Prepare the Project Inputs for Capability Review',
      ctaText:'Send the drawing or sample, connector details, pin map, electrical loads, installation environment, required checks and expected quantity range. We will first identify missing information and review feasibility.',
      faqs:[
        ['What information should an industrial harness drawing contain?','At minimum, identify both interfaces, pin assignment, wire size and construction, circuit functions, finished dimensions, branches, labels, protection, tolerances and any referenced material or workmanship specifications.'],
        ['How should the installation environment be described?','Record whether the harness is fixed or moving, the expected temperature range, vibration, bend radius, abrasion, oil or chemical exposure, moisture or dust, service access and nearby heat sources.'],
        ['Can wire gauge be selected from current alone?','Not reliably. Current is one input, but conductor length, voltage drop, bundling, ambient temperature, duty cycle, insulation and applicable project requirements also affect the choice.'],
        ['Which tests are normally considered?','Possible checks include visual inspection, dimensions, continuity, resistance, insulation, pull force, retention, sealing or environmental validation. The actual list and limits must be agreed for the project.'],
        ['Does this guide prove that every industrial harness can be manufactured?','No. It is a requirements checklist. Manufacturing capability, materials, tooling, process controls and validation scope must be reviewed for each project before a supply commitment is made.']
      ]
    },
    zh:{
      title:'工业设备线束需求与验证指南',
      intro:'面向工程与采购人员的新项目资料清单，用于在供应商能力审核前，完整定义工业设备线束或电缆组件。',
      heroImage:'/assets/images/applications/industrial-equipment-photoreal-v2.jpg',
      capability:'先定义工作环境，再完善图纸',
      capabilityIntro:'接口选择和线径不能脱离实际应用单独判断。固定或运动安装、电压电流、温度、振动、弯曲半径、液体、磨损、维修空间和项目适用标准都会影响设计输入。',
      hideFamilies:true,
      process:'把需求转化为批准样品',
      quality:'围绕实际应用制定验证计划',
      qualityIntro:'工业设备线束不存在一套适用于所有项目的通用测试方案。批准图纸、材料规格、工作环境和客户验收标准共同决定所需的电气、机械与环境检查。',
      qualityItems:['记录工作电压、电流与各回路功能','定义接口、针脚图、线材结构和布线限制','将机械与环境风险转化为可测量要求','批量讨论前批准样品记录与验收标准'],
      faq:'工业设备线束需求常见问题',
      ctaTitle:'准备项目资料，进入能力审核',
      ctaText:'发送图纸或样品、接口资料、针脚图、电气负载、安装环境、所需检查及预计数量范围，我们先识别缺失信息并审核可行性。',
      faqs:[
        ['工业线束图纸至少应包含什么？','至少标明两端接口、针脚定义、线径与结构、回路功能、成品尺寸、分支、标签、防护、容差及引用的材料或工艺规范。'],
        ['如何描述线束安装环境？','需要说明固定或运动安装、预计温度范围、振动、弯曲半径、磨损、油液或化学品、湿气或灰尘、维修空间及附近热源。'],
        ['只根据电流就能确定线径吗？','不能。除电流外，导体长度、压降、成束方式、环境温度、工作周期、绝缘和项目要求都会影响选择。'],
        ['通常需要考虑哪些测试？','可能包括外观、尺寸、导通、电阻、绝缘、拉力、保持力、密封或环境验证；实际项目与限值必须按需求约定。'],
        ['这份指南是否代表所有工业线束都能生产？','不代表。它是需求清单；材料、设备、工装、过程控制和验证范围必须逐项目审核后，才能作出供货承诺。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function roboticHarnessFlexGuideCopy(){
  const copy={
    en:{
      title:'Robotic Wiring Harness Flex and Routing Guide',
      intro:'A requirements checklist for defining motion, routing and validation conditions before developing a cable or harness for robotic and other repetitive-motion equipment.',
      heroImage:'/assets/images/applications/intelligent-robotics-photoreal-v2.jpg',
      capability:'Describe the Motion Profile Before Selecting Cable',
      capabilityIntro:'Repeated bending, torsion and acceleration create different loads from a fixed installation. Travel distance, bend radius, cycle rate, torsion angle, speed, acceleration, cable-chain use, unsupported span and environmental exposure should be documented first.',
      hideFamilies:true,
      process:'Move from Motion Definition to Tested Sample',
      quality:'Cycle Life Is a Test Result, Not a Generic Label',
      qualityIntro:'A cable described as flexible does not automatically have a verified service life in every robot. The complete assembly, routing, connectors, strain relief and representative motion profile need an agreed validation method and acceptance point.',
      qualityItems:['Axes, travel, speed, acceleration and cycle rate recorded','Minimum bend radius, torsion angle and routing constraints defined','Connector retention, strain relief and moving interfaces documented','Representative cycle test method and failure criteria agreed'],
      faq:'Robotic Harness Flex FAQ',
      ctaTitle:'Prepare the Motion and Routing Inputs',
      ctaText:'Send the equipment layout, motion path, cycle target, bend and torsion limits, connector and pin data, electrical loads, environment and an existing sample. Feasibility must be reviewed before any service-life commitment.',
      faqs:[
        ['What makes a robotic harness different from a fixed harness?','A robotic harness may experience repeated bending, torsion, acceleration and connector movement. Its construction and routing therefore need to be reviewed against the real motion profile.'],
        ['Is a small bend radius always better?','No. Every selected cable and assembly has routing limits. Bending below the verified minimum can increase conductor, shield or jacket fatigue.'],
        ['Can a flex-cycle value be reused for another robot?','Not automatically. Cycle results depend on bend radius, travel, speed, acceleration, torsion, temperature, cable-chain conditions, terminations and the test method.'],
        ['Which details are needed before prototype development?','Provide motion axes, travel, cycle rate, speed, acceleration, bend and torsion limits, routing, connectors, pin map, electrical load, environment and target validation.'],
        ['Does this guide prove current robotic harness supply experience?','No. It is a technical requirements guide. Product capability and life validation must be reviewed and demonstrated for each project before a supply claim is made.']
      ]
    },
    zh:{
      title:'机器人线束弯折与布线指南',
      intro:'面向机器人及其他重复运动设备的需求清单，用于在开发线缆或线束前定义运动、布线与验证条件。',
      heroImage:'/assets/images/applications/intelligent-robotics-photoreal-v2.jpg',
      capability:'先描述运动轨迹，再选择线缆',
      capabilityIntro:'重复弯折、扭转和加速度产生的负载不同于固定安装。应先记录行程、弯曲半径、循环频率、扭转角度、速度、加速度、拖链使用、悬空跨度和环境暴露。',
      hideFamilies:true,
      process:'从运动定义到代表性样品验证',
      quality:'弯折寿命是测试结果，不是通用标签',
      qualityIntro:'标注“柔性”的线缆不代表在所有机器人中都有相同寿命。完整组件、布线路径、接口、应力释放和代表性运动轨迹需要约定验证方法与失效判定。',
      qualityItems:['记录运动轴、行程、速度、加速度与循环频率','定义最小弯曲半径、扭转角度和布线限制','记录接口保持、应力释放和运动连接位置','约定代表性循环测试方法与失效标准'],
      faq:'机器人线束弯折常见问题',
      ctaTitle:'准备运动轨迹与布线资料',
      ctaText:'发送设备布局、运动路径、循环目标、弯曲与扭转限制、接口和针脚资料、电气负载、环境及现有样品；任何寿命承诺前必须审核可行性。',
      faqs:[
        ['机器人线束与固定线束有什么不同？','机器人线束可能承受重复弯折、扭转、加速度和接口运动，因此结构与布线需要结合真实运动轨迹审核。'],
        ['弯曲半径越小越好吗？','不是。所选线缆和组件都有布线限制，低于已验证的最小半径会增加导体、屏蔽或护套疲劳。'],
        ['一个机器人的循环次数可以直接套用到另一个机器人吗？','不能。循环结果取决于弯曲半径、行程、速度、加速度、扭转、温度、拖链条件、端接和测试方法。'],
        ['打样前需要哪些运动资料？','请提供运动轴、行程、循环频率、速度、加速度、弯曲与扭转限制、布线、接口、针脚图、电气负载、环境和目标验证。'],
        ['这份指南是否证明公司已有机器人线束供货经验？','不证明。它是技术需求指南；产品能力和寿命验证必须逐项目审核并获得证据后，才能作出供货声明。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function harnessPrototypeGuideCopy(){
  const copy={
    en:{
      title:'Wire Harness Prototype and Sample Validation Guide',
      intro:'A structured path from drawings, samples or pin definitions to an approved wire harness sample that can support controlled production discussion.',
      heroImage:'/assets/images/factory/process-sample-validation-photoreal-v3.jpg',
      capability:'Define What the Prototype Must Prove',
      capabilityIntro:'A prototype is not only a visual sample. It should confirm connector mating, pin routes, dimensions, branches, materials, labels, protection, installation fit and the agreed electrical or functional checks for the target application.',
      hideFamilies:true,
      process:'Move from Input Review to Approved Sample',
      quality:'Freeze the Approved Definition Before Scale-Up',
      qualityIntro:'The approved drawing, bill of materials, pin map, sample observations and acceptance records form the production reference. Open questions and deviations should be closed before quantity, tooling or delivery commitments are finalized.',
      qualityItems:['Input documents and unresolved questions logged','Prototype configuration linked to drawing, BOM and pin-map revisions','Fit, dimensions and agreed checks recorded against acceptance criteria','Approved sample and any deviations controlled before production release'],
      faq:'Harness Prototype and Sample FAQ',
      ctaTitle:'Send the Prototype Inputs',
      ctaText:'Provide the drawing or existing sample, connector and pin information, dimensions, materials, installation context, target checks, expected quantity range and required approval process. Timing is reviewed after component and tooling feasibility are known.',
      faqs:[
        ['What is the minimum information needed to start a harness prototype?','Start with connector information or clear samples, a pin map, finished length and branch dimensions, wire requirements, labels or protection, target equipment and the checks required for approval.'],
        ['How many prototype pieces are required?','There is no universal quantity. It depends on fit checks, destructive or environmental tests, customer approval steps, retained samples and whether more than one equipment configuration must be verified.'],
        ['What does an approved sample establish?','It establishes the reviewed physical and electrical configuration for the agreed scope. Approval should be linked to drawing, material and pin-map revisions, plus any accepted deviations.'],
        ['Can production begin before every question is closed?','Unresolved items create change and compatibility risk. Critical interfaces, wiring, materials, dimensions, checks and approval authority should be resolved before production release.'],
        ['How long does prototype development take?','Timing depends on component availability, tooling, design completeness, complexity, test scope and approval cycles. It should be estimated after the project inputs are reviewed rather than promised as one fixed number.']
      ]
    },
    zh:{
      title:'线束打样与样品验证指南',
      intro:'将图纸、样品或针脚定义转化为批准线束样品的结构化路径，为后续受控生产讨论建立依据。',
      heroImage:'/assets/images/factory/process-sample-validation-photoreal-v3.jpg',
      capability:'先明确样品需要证明什么',
      capabilityIntro:'样品不只是外观件，还应确认接口配合、针脚路径、尺寸、分支、材料、标签、防护、安装适配以及目标应用约定的电气或功能检查。',
      hideFamilies:true,
      process:'从资料审核到批准样品',
      quality:'放大生产前冻结批准定义',
      qualityIntro:'批准图纸、物料清单、针脚图、样品观察与验收记录共同构成生产参考。数量、工装或交付承诺确定前，应关闭未决问题与偏差。',
      qualityItems:['记录输入文件与尚未解决的问题','样品配置关联图纸、BOM和针脚图版本','按照验收标准记录配合、尺寸与约定检查','生产放行前受控保存批准样品及允许偏差'],
      faq:'线束打样与样品常见问题',
      ctaTitle:'发送打样资料',
      ctaText:'提供图纸或现有样品、接口与针脚信息、尺寸、材料、安装环境、目标检查、预计数量范围和批准流程；物料与工装可行性明确后再评估周期。',
      faqs:[
        ['开始线束打样至少需要哪些资料？','至少提供接口资料或清晰样品、针脚图、成品长度与分支尺寸、线材要求、标签或防护、目标设备和批准所需检查。'],
        ['需要多少件样品？','没有通用数量。样品数取决于装配验证、破坏性或环境测试、客户批准步骤、留样要求及需要核实的设备配置数量。'],
        ['批准样品确认了什么？','它确认约定范围内审核后的物理与电气配置；批准应关联图纸、材料和针脚图版本，以及已接受的偏差。'],
        ['所有问题关闭前可以开始生产吗？','未决问题会增加变更与兼容风险。关键接口、接线、材料、尺寸、检查和批准权限应在生产放行前解决。'],
        ['线束打样需要多长时间？','周期取决于物料供应、工装、设计完整度、复杂度、测试范围和批准轮次，应审核项目资料后评估，不用一个固定数字承诺所有项目。']
      ]
    }
  };
  return copy[LANG]||copy.en;
}

function pillarRelatedLinks(){
  const leaf=landingData().leaf;
  const labels={
    en:{title:'Continue by Requirement',harness:'Custom Wiring Harness',cable:'Custom Cable Assembly',automotive:'Automotive Diagnostic Harnesses',diagnostic:'Diagnostic Cable Product Hub',obd:'OBD2 Diagnostic Cables',j1939:'J1939 & Heavy-Duty Cables',ecu:'ECU Programming Cables',turbo:'Turbo Actuator Harnesses',ev:'EV Diagnostic Cables',guide:'Industrial Harness Requirements Guide',robot:'Robotic Harness Flex Guide',prototype:'Harness Prototype & Sample Validation',products:'All Products'},
    zh:{title:'按需求继续查看',harness:'定制线束',cable:'定制电缆组件',automotive:'汽车诊断线束',diagnostic:'汽车诊断线产品总入口',obd:'OBD2诊断线',j1939:'J1939与重卡诊断线',ecu:'ECU编程线',turbo:'涡轮执行器线束',ev:'新能源汽车诊断线',guide:'工业设备线束需求指南',robot:'机器人线束弯折指南',prototype:'线束打样与样品验证',products:'全部产品'}
  };
  const l=labels[LANG]||labels.en;
  const maps={
    'custom-wiring-harness':[['/wire-harness-prototype-sample-validation',l.prototype],['/custom-cable-assembly',l.cable],['/automotive-wiring-harness',l.automotive],['/products',l.products]],
    'custom-cable-assembly':[['/custom-wiring-harness',l.harness],['/industrial-equipment-wiring-harness-guide',l.guide],['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/products',l.products]],
    'automotive-wiring-harness':[['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/turbo-actuator-harness',l.turbo],['/products',l.products]],
    'automotive-diagnostic-cable-manufacturer':[['/obd2-diagnostic-cable',l.obd],['/j1939-cable',l.j1939],['/ecu-programming-cable',l.ecu],['/ev-diagnostic-cable',l.ev]],
    'obd2-diagnostic-cable':[['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/ecu-programming-cable',l.ecu],['/products#universal',l.products]],
    'ecu-programming-cable':[['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/j1939-cable',l.j1939],['/products#heavyduty',l.products]],
    'turbo-actuator-harness':[['/automotive-wiring-harness',l.automotive],['/products#turbo',l.products],['/custom-wiring-harness',l.harness]],
    'j1939-cable':[['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/ecu-programming-cable',l.ecu],['/products#heavyduty',l.products]],
    'ev-diagnostic-cable':[['/automotive-diagnostic-cable-manufacturer',l.diagnostic],['/obd2-diagnostic-cable',l.obd],['/products#specialty',l.products]],
    'industrial-equipment-wiring-harness-guide':[['/robotic-wiring-harness-flex-guide',l.robot],['/custom-wiring-harness',l.harness],['/custom-cable-assembly',l.cable]],
    'robotic-wiring-harness-flex-guide':[['/industrial-equipment-wiring-harness-guide',l.guide],['/custom-wiring-harness',l.harness],['/contact',l.title]],
    'wire-harness-prototype-sample-validation':[['/custom-wiring-harness',l.harness],['/custom-cable-assembly',l.cable],['/contact',l.title]]
  };
  return {title:l.title,items:maps[leaf]||[]};
}

function renderCustomLandingPage(main,c=customLandingCopy()){
  const featureItems=(SITE.features||[]).slice(0,4);
  const processItems=(SITE.process&&SITE.process.steps||[]).slice(0,4);
  const directProducts=[];
  if(c.productSlugs&&c.productSlugs.length){
    for(const category of (PRODS.categories||[])) for(const product of (category.products||[])) if(c.productSlugs.includes(product.slug)) directProducts.push({category,product});
    directProducts.sort((a,b)=>c.productSlugs.indexOf(a.product.slug)-c.productSlugs.indexOf(b.product.slug));
  }
  const familySource=c.familyIds&&c.familyIds.length?(PRODS.categories||[]).filter(category=>c.familyIds.includes(category.id)):(PRODS.categories||[]).slice(0,5);
  const families=directProducts.length?directProducts:familySource.map(category=>({category,product:(category.products||[])[0]})).filter(item=>item.product);
  const heroRecord=directProducts.find(item=>item.product.slug===c.heroProductSlug);
  const heroImage=c.heroImage||(heroRecord?heroRecord.product.images[0]:featureItems[0].image);
  const heroAlt=heroRecord?productDisplayName(heroRecord.product,heroRecord.category):c.title;
  const related=pillarRelatedLinks();
  main.innerHTML=`
    <nav class="breadcrumb custom-breadcrumb" aria-label="${t(SITE.nav.products)}"><a href="/">${t(SITE.nav.home)}</a><span class="crumb-sep" aria-hidden="true"></span><span>${c.title}</span></nav>
    <section class="custom-landing-hero">
      <div class="custom-hero-copy"><span class="custom-eyebrow">${t(SITE.custom_intro.tag)}</span><h1>${c.title}</h1><p>${c.intro}</p><div class="landing-actions"><a class="btn btn-primary" href="/contact">${t(SITE.nav.quote)}</a><a class="btn btn-ghost" href="/products">${t(SITE.nav.products)}</a></div></div>
      <figure class="custom-hero-media"><img src="${heroImage}" alt="${heroAlt}" decoding="async"></figure>
    </section>
    <section class="custom-capability custom-section">
      <header class="custom-section-head"><span>${t(SITE.custom_intro.tag)}</span><h2>${c.capability}</h2><p>${c.capabilityIntro}</p></header>
      <div class="custom-feature-list">${featureItems.map((item,index)=>`<article class="custom-feature-row ${index%2?'is-reversed':''}"><figure><img src="${item.image}" alt="${t(item.title)}" loading="lazy" decoding="async"></figure><div><span class="custom-index">0${index+1}</span><h3>${t(item.title)}</h3><p>${t(item.desc)}</p></div></article>`).join('')}</div>
    </section>
    ${c.hideFamilies?'':`<section class="custom-families custom-section">
      <header class="custom-section-head"><span>${t(SITE.nav.products)}</span><h2>${c.families}</h2><p>${c.familiesIntro}</p></header>
      <div class="custom-family-grid">${families.map(({category,product})=>`<a class="custom-family" href="${directProducts.length?`/product/${product.slug}`:`/products#${category.id}`}"><figure><img src="${product.images[0]}" alt="${directProducts.length?productDisplayName(product,category):t(category.name)}" loading="lazy" decoding="async"></figure><div><span>${String(product.id||'').toUpperCase()}</span><h3>${directProducts.length?productDisplayName(product,category):t(category.name)}</h3><p>${t(category.desc)}</p></div></a>`).join('')}</div>
    </section>`}
    <section class="custom-process custom-section">
      <header class="custom-section-head"><span>${t(SITE.process.tag)}</span><h2>${c.process}</h2></header>
      <div class="custom-process-grid">${processItems.map(item=>`<article><figure><img src="${item.image}" alt="${t(item.title)}" loading="lazy" decoding="async"></figure><div><span>${item.num}</span><h3>${t(item.title)}</h3><p>${t(item.desc)}</p></div></article>`).join('')}</div>
    </section>
    <section class="custom-quality custom-section"><div><span class="custom-eyebrow">QC / PROJECT BASIS</span><h2>${c.quality}</h2><p>${c.qualityIntro}</p></div><ol>${c.qualityItems.map((item,index)=>`<li><span>0${index+1}</span><p>${item}</p></li>`).join('')}</ol></section>
    <section class="custom-faq custom-section"><header class="custom-section-head"><span>FAQ</span><h2>${c.faq}</h2></header><div>${c.faqs.map(item=>`<details><summary>${item[0]}</summary><p>${item[1]}</p></details>`).join('')}</div></section>
    ${related.items.length?`<section class="custom-related custom-section"><header class="custom-section-head"><span>INDEX / NEXT</span><h2>${related.title}</h2></header><nav aria-label="${related.title}">${related.items.map((item,index)=>`<a href="${item[0]}"><span>0${index+1}</span><strong>${item[1]}</strong><span aria-hidden="true">→</span></a>`).join('')}</nav></section>`:''}
    <section class="landing-cta custom-cta"><h2>${c.ctaTitle}</h2><p>${c.ctaText}</p><a class="btn btn-primary" href="/contact">${t(SITE.nav.contact)}</a></section>`;
}

function renderLandingPage(){
  if(pageIdentity()!=='page-landing') return;
  const main=$('main'); if(!main) return;
  const {leaf,category}=landingData();
  const custom=leaf==='custom-wiring-harness';
  const cableAssembly=leaf==='custom-cable-assembly';
  const automotiveHarness=leaf==='automotive-wiring-harness';
  const automotiveDiagnostic=leaf==='automotive-diagnostic-cable-manufacturer';
  const obd2=leaf==='obd2-diagnostic-cable';
  const ecuProgramming=leaf==='ecu-programming-cable';
  const turboActuator=leaf==='turbo-actuator-harness';
  const j1939=leaf==='j1939-cable';
  const evDiagnostic=leaf==='ev-diagnostic-cable';
  const industrialGuide=leaf==='industrial-equipment-wiring-harness-guide';
  const roboticGuide=leaf==='robotic-wiring-harness-flex-guide';
  const prototypeGuide=leaf==='wire-harness-prototype-sample-validation';
  if(custom || cableAssembly || automotiveHarness || automotiveDiagnostic || obd2 || ecuProgramming || turboActuator || j1939 || evDiagnostic || industrialGuide || roboticGuide || prototypeGuide){
    const copy=prototypeGuide?harnessPrototypeGuideCopy():(roboticGuide?roboticHarnessFlexGuideCopy():(industrialGuide?industrialEquipmentGuideCopy():(evDiagnostic?evDiagnosticLandingCopy():(j1939?j1939LandingCopy():(turboActuator?turboActuatorLandingCopy():(ecuProgramming?ecuProgrammingLandingCopy():(obd2?obd2LandingCopy():(automotiveDiagnostic?automotiveDiagnosticLandingCopy():(automotiveHarness?automotiveHarnessLandingCopy():(cableAssembly?cableAssemblyLandingCopy():customLandingCopy()))))))))));
    renderCustomLandingPage(main,copy); return;
  }
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
    const series=(SERIES&&SERIES.series||[]).find(item=>item.id===category.id);
    const categoryHref=series?`/products/${series.slug}`:`/products#${category.id}`;
    crumb.classList.add('breadcrumb');
    crumb.setAttribute('aria-label',t(SITE.nav.products));
    crumb.innerHTML=`<a href="/">${t(SITE.nav.home)}</a><span class="crumb-sep" aria-hidden="true"></span><a href="/products">${t(SITE.nav.products)}</a><span class="crumb-sep" aria-hidden="true"></span><a href="${categoryHref}">${t(category.name)}</a><span class="crumb-sep" aria-hidden="true"></span><span>${name}</span>`;
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
  else if(identity==='page-products'&&CAPABILITIES){
    const record=capabilityTypeRecord(new URLSearchParams(location.search).get('category')||'');
    if(record){
      const item=t(record.group.items)[record.itemIndex];
      const detail=CAPABILITIES.categoryDetail?.sets?.[record.group.id];
      title=item+' | '+t(CAPABILITIES.hero.title)+' | '+title;
      description=detail?t(detail.intro):t(CAPABILITIES.hero.description);
    }else{
      title=t(CAPABILITIES.hero.title)+' | '+title;
      description=t(CAPABILITIES.hero.description);
    }
  }
  else if(identity==='page-product-series'){
    const record=productSeriesRecord();
    if(record.series){ title=t(record.series.title)+' | '+title; description=t(record.series.description); }
  }
  else if(identity==='page-product-category'){
    const record=productCategoryPageRecord();
    if(record){
      const item=t(record.group.items)[record.itemIndex];
      const fallback=CAPABILITIES?.categoryDetail?.sets?.[record.group.id];
      const itemDetail=(CATEGORY_DETAILS||{})[record.key]||{};
      title=item+' | '+t(record.group.directoryTitle||record.group.title)+' | '+title;
      description=t(itemDetail.intro||fallback?.intro||record.group.description);
    }
  }
  else if(identity==='page-custom'){ title=t(SITE.custom_intro.title)+' | '+title; description=t(SITE.custom_intro.desc); }
  else if(identity==='page-about'){ title=t(SITE.nav.about)+' | '+title; description=t(SITE.factory.desc); }
  else if(identity==='page-contact'){ title=t(SITE.nav.contact)+' | '+title; description=t(SITE.cta.desc); }
  else if(identity==='page-landing'){
    const {leaf,category}=landingData();
    const custom=leaf==='custom-wiring-harness';
    const cableAssembly=leaf==='custom-cable-assembly';
    const automotiveHarness=leaf==='automotive-wiring-harness';
    const automotiveDiagnostic=leaf==='automotive-diagnostic-cable-manufacturer';
    const obd2=leaf==='obd2-diagnostic-cable';
    const ecuProgramming=leaf==='ecu-programming-cable';
    const turboActuator=leaf==='turbo-actuator-harness';
    const j1939=leaf==='j1939-cable';
    const evDiagnostic=leaf==='ev-diagnostic-cable';
    const industrialGuide=leaf==='industrial-equipment-wiring-harness-guide';
    const roboticGuide=leaf==='robotic-wiring-harness-flex-guide';
    const prototypeGuide=leaf==='wire-harness-prototype-sample-validation';
    const customCopy=custom?customLandingCopy():(cableAssembly?cableAssemblyLandingCopy():(automotiveHarness?automotiveHarnessLandingCopy():(automotiveDiagnostic?automotiveDiagnosticLandingCopy():(obd2?obd2LandingCopy():(ecuProgramming?ecuProgrammingLandingCopy():(turboActuator?turboActuatorLandingCopy():(j1939?j1939LandingCopy():(evDiagnostic?evDiagnosticLandingCopy():(industrialGuide?industrialEquipmentGuideCopy():(roboticGuide?roboticHarnessFlexGuideCopy():(prototypeGuide?harnessPrototypeGuideCopy():null)))))))))));
    const name=customCopy?customCopy.title:(category?t(category.name):t(SITE.products_teaser.title));
    title=name+' | '+title;
    description=customCopy?customCopy.intro:(category?t(category.desc):t(SITE.products_teaser.desc));
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
  renderProductSeriesPage();
  renderProductCategoryPage();
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
  ensureCurrentPageLanguage().then(()=>renderAll());
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
      $('.header')?.classList.remove('product-mega-open');
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
