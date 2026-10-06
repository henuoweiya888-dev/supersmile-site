(()=>{
  // The shared main.js owns document language and all page metadata.
  function editorialLanguage() {
    const requested = new URLSearchParams(location.search).get('lang');
    let stored = '';
    try { stored = localStorage.getItem('lang') || ''; } catch {}
    return String(requested || stored || document.documentElement.lang || 'en').toLowerCase().split('-')[0];
  }

  const body=document.body;
  if(!body.classList.contains('wire-special')) return;

  const key=body.dataset.key;

  const applyPageLanguage=()=>{
    const lang=editorialLanguage()==='zh'?'zh':'en';
    const title=body.dataset[lang==='zh'?'titleZh':'titleEn'];
    body.dataset.lang=lang;



    document.querySelectorAll('img[data-alt-en][data-alt-zh]').forEach(image=>{
      image.alt=image.dataset[lang==='zh'?'altZh':'altEn'];
    });
    document.querySelectorAll('[data-contact-link]').forEach(link=>{
      link.href=`/contact?category=${encodeURIComponent(key)}&category_name=${encodeURIComponent(title)}`;
    });
  };

  applyPageLanguage();

  // Follow the language selected by main.js without observing or rewriting the head.
  const observer=new MutationObserver(()=>queueMicrotask(applyPageLanguage));
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
