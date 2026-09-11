(()=>{
  const body=document.body;
  if(!body.classList.contains('wire-special')) return;

  const titleNode=document.querySelector('title');
  const meta=document.querySelector('meta[name="description"]');
  const key=body.dataset.key;

  const applyPageLanguage=()=>{
    const urlLang=new URLSearchParams(location.search).get('lang');
    const lang=(urlLang==='zh'||document.documentElement.lang.toLowerCase().startsWith('zh'))?'zh':'en';
    const title=body.dataset[lang==='zh'?'titleZh':'titleEn'];
    const desiredTitle=lang==='zh'?`${title}定制与技术说明 | 超斯迈尔`:`Custom ${title} | Technical Cable Guide | Super Smile`;
    const desiredDescription=body.dataset[lang==='zh'?'descZh':'descEn'];

    const documentLang=lang==='zh'?'zh-CN':'en';
    body.dataset.lang=lang;
    if(document.documentElement.lang!==documentLang) document.documentElement.lang=documentLang;
    if(document.title!==desiredTitle) document.title=desiredTitle;
    if(meta&&meta.content!==desiredDescription) meta.content=desiredDescription;
    document.querySelectorAll('[data-contact-link]').forEach(link=>{
      link.href=`/contact?category=${encodeURIComponent(key)}&category_name=${encodeURIComponent(title)}`;
    });
  };

  applyPageLanguage();

  // Shared navigation data loads asynchronously and updates document metadata.
  // Keep this category page's more specific bilingual metadata after that render.
  const observer=new MutationObserver(()=>queueMicrotask(applyPageLanguage));
  if(titleNode) observer.observe(titleNode,{childList:true});
  if(meta) observer.observe(meta,{attributes:true,attributeFilter:['content']});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&'IntersectionObserver' in window){
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }),{rootMargin:'0px 0px -8%'});
    document.querySelectorAll('[data-reveal]').forEach(element=>revealObserver.observe(element));
  }else{
    document.querySelectorAll('[data-reveal]').forEach(element=>element.classList.add('is-visible'));
  }
})();
