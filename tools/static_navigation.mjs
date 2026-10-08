// Initial HTML navigation remains usable and crawlable before the client renders
// the localized navigation and product mega menu.
const links = [['/', 'home'], ['/custom', 'custom'], ['/products', 'products'], ['/about', 'about'], ['/contact', 'contact']];
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));

export function staticNavigationMarkup(labels) {
  return `<nav class="nav" id="nav-links" aria-label="Main navigation">${links.map(([href, key]) => {
    const label = labels[key]?.en;
    if (!label) throw Error(`Missing English navigation label: ${key}`);
    return `<a href="${href}">${escape(label)}</a>`;
  }).join('')}</nav>`;
}

export function withStaticNavigation(html, labels) {
  return html.replace(/<nav\b[^>]*\bid="nav-links"[^>]*>[\s\S]*?<\/nav>/, staticNavigationMarkup(labels));
}
