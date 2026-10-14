(() => {
 'use strict';
 const node=document.getElementById('pe-page-data');
 if(!node)return;
 const data=JSON.parse(node.textContent);
 const language=()=>document.documentElement.lang==='zh'?'zh':'en';
 function localize(){
  const lang=language();
  document.querySelectorAll('[data-pe-alt-en]').forEach(el=>{el.alt=el.dataset[lang==='zh'?'peAltZh':'peAltEn'];});
  document.querySelectorAll('[data-pe-aria-en]').forEach(el=>{el.setAttribute('aria-label',el.dataset[lang==='zh'?'peAriaZh':'peAriaEn']);});
  document.querySelectorAll('[data-pe-href]').forEach(el=>{
   const href=el.dataset.peHref;
   if(href.startsWith('#'))return;
   const url=new URL(href,location.origin);
   url.searchParams.set('lang',lang);
   if(url.pathname==='/contact')url.searchParams.set('category_name',data.title[lang]);
   el.href=url.pathname+url.search+url.hash;
  });
 }
 const view=document.querySelector('.pe-product-view');
 const tabs=[...document.querySelectorAll('[data-pe-view]')];
 tabs.forEach(button=>button.addEventListener('click',()=>{
  view.dataset.view=button.dataset.peView;
  tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
 }));
 const dialog=document.querySelector('.pe-image-dialog');
 const close=dialog.querySelector('.pe-dialog-close');
 view.addEventListener('click',()=>{dialog.showModal();close.focus();});
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
 });
 dialog.addEventListener('close',()=>view.focus({preventScroll:true}));
 new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 localize();
})();
