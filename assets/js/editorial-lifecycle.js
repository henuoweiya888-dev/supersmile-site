(() => {
  const mounted = new WeakMap();

  // The shared category renderer may finish after a dedicated article renderer.
  // Keep the article's owner alive across both that replacement and language changes.
  function mount({host, rootClass, render}) {
    if (!host || typeof render !== 'function') return;
    mounted.get(host)?.disconnect();
    let active = false;
    let pending = false;
    let scheduled = false;
    let stopped = false;
    let settledMarkup = null;
    let language = document.documentElement.lang;

    const ownsContent = () => host.firstElementChild?.classList.contains(rootClass);
    const request = () => {
      if (stopped) return;
      pending = true;
      if (active || scheduled) return;
      scheduled = true;
      queueMicrotask(run);
    };
    async function run() {
      scheduled = false;
      if (stopped || active || !pending) return;
      pending = false;
      active = true;
      let failed = false;
      try {
        // Only one render may await data at a time. A newer language request is
        // coalesced and rendered next, so an older response cannot finish last.
        failed = await render() === false;
      } catch (error) {
        failed = true;
        const note = document.createElement('p');
        note.className = 'editorial-load-error';
        note.textContent = document.documentElement.lang.startsWith('zh')
          ? '页面内容暂时无法载入，请刷新重试。'
          : 'This page could not load. Please refresh and try again.';
        host.replaceChildren(note);
      } finally {
        // A shared render can replace the article in the microtask between the
        // renderer's DOM write and this continuation. Recover that successful
        // render too, without treating an explicit failure as a retry request.
        if (!failed && !ownsContent()) pending = true;
        // Remember error markup too. Our own failed render is not a reason to
        // retry indefinitely; a later language change or external replacement is.
        settledMarkup = host.innerHTML;
        active = false;
        if (pending) request();
      }
    }

    const contentObserver = new MutationObserver(() => {
      if (active || ownsContent() || host.innerHTML === settledMarkup) return;
      request();
    });
    contentObserver.observe(host, {childList: true});
    const languageObserver = new MutationObserver(() => {
      const next = document.documentElement.lang;
      if (next === language) return;
      language = next;
      request();
    });
    languageObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
    const controller = {disconnect() {
      stopped = true;
      contentObserver.disconnect();
      languageObserver.disconnect();
    }};
    mounted.set(host, controller);
    request();
    return controller;
  }
  globalThis.SuperSmileEditorial = {mount};
})();
