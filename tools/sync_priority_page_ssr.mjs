import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const emptyClassList = { contains: () => false, add() {}, remove() {}, toggle() {} };

// Evaluate the site's own renderers with inert DOM hooks. No browser, network,
// page lifecycle callback, gallery mutation or website submission is executed.
export async function createRenderContext(route, language = 'en') {
  const [script, site, products, capabilities, details] = await Promise.all([
    read('assets/js/main.js'), read('data/site.json'), read('data/products.json'),
    read('data/product-capabilities.json'), read('data/product-category-details.json'),
  ]);
  const main = { innerHTML: '' };
  const context = createContext({
    console, URL, URLSearchParams,
    location: { pathname: route, search: language === 'en' ? '' : `?lang=${language}` },
    window: {},
    document: {
      addEventListener() {},
      querySelector: selector => selector === 'main' ? main : null,
      querySelectorAll: () => [],
      body: { classList: emptyClassList, dataset: {} },
      documentElement: { lang: language },
    },
    localStorage: { getItem: () => language, setItem() {} },
    __site: JSON.parse(site), __products: JSON.parse(products),
    __capabilities: JSON.parse(capabilities), __details: JSON.parse(details),
    __language: language,
  });
  runInContext(script, context, { filename: 'main.js' });
  runInContext('SITE=__site; PRODS=__products; CAPABILITIES=__capabilities; CATEGORY_DETAILS=__details; LANG=__language; applyEvidenceBoundaries();', context);
  return { context, main };
}

export async function captureLanding(route, language = 'en') {
  const { context, main } = await createRenderContext(route, language);
  runInContext('renderLandingPage()', context);
  const copyFunction = {
    '/custom-wiring-harness': 'customLandingCopy',
    '/obd2-diagnostic-cable': 'obd2LandingCopy',
    '/turbo-actuator-harness': 'turboActuatorLandingCopy',
    '/j1939-cable': 'j1939LandingCopy',
  }[route];
  if (!copyFunction) throw Error(`Unsupported landing route: ${route}`);
  const copy = runInContext(`${copyFunction}()`, context);
  if (!main.innerHTML.includes('<h1>') || !copy.faqs?.length) throw Error(`Incomplete landing rendering: ${route}`);
  return { markup: main.innerHTML.trim(), copy };
}

export async function captureCategory(key, language = 'en') {
  const { context } = await createRenderContext('/products/' + key, language);
  context.__key = key;
  return runInContext(`(() => {
    const detail=CATEGORY_DETAILS[__key];
    const record=capabilityTypeRecord(__key);
    const name=detail.page.displayTitle?t(detail.page.displayTitle):t(record.group.items)[record.itemIndex];
    return {markup:renderProductCategoryRichMarkup(detail.page,name), intro:t(detail.intro), name};
  })()`, context);
}

export async function captureEquipment(language = 'en', { fail = false, initialMarkup = '' } = {}) {
  const [script, source] = await Promise.all([read('assets/js/equipment-wire-editorial.js'), read('content/product-category-drafts/equipment-wire.json')]);
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { textContent: '', innerHTML: id === 'eqw-content' ? initialMarkup : '', setAttribute() {} });
    return nodes.get(id);
  };
  const observers = [];
  const context = createContext({
    console, URLSearchParams,
    location: { search: language === 'en' ? '' : `?lang=${language}` },
    localStorage: { getItem: () => language },
    document: { getElementById: node, querySelector: () => null, documentElement: { lang: language } },
    MutationObserver: class { constructor(callback) { observers.push(callback); } observe() {} },
    fetch: async () => {
      if (fail) throw Error('Controlled unavailable source');
      return { ok: true, json: async () => JSON.parse(source) };
    },
  });
  runInContext(script, context, { filename: 'equipment-wire-editorial.js' });
  await new Promise(resolve => setImmediate(resolve));
  return { markup: node('eqw-content').innerHTML, nodes, context, observers };
}

// Match a nested div by depth; the rich editorial markup contains many divs.
export function replaceDivContents(html, id, markup) {
  const opening = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  if (!opening) throw Error(`Missing SSR content host: ${id}`);
  const start = opening.index + opening[0].length;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 1;
  for (let match; (match = tags.exec(html));) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(0, start) + markup + html.slice(match.index);
  }
  throw Error(`Unclosed SSR content host: ${id}`);
}

function replaceText(html, id, value) {
  const pattern = new RegExp(`(<[a-z][^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/[a-z][^>]*>)`, 'i');
  if (!pattern.test(html)) throw Error(`Missing SSR text host: ${id}`);
  return html.replace(pattern, (_match, start, end) => start + escape(value) + end);
}

function ensureBodyClasses(html, required) {
  return html.replace(/<body\b([^>]*)>/, (_match, attributes) => {
    const existing = /\bclass="([^"]*)"/.exec(attributes);
    const classes = new Set([...(existing?.[1] || '').split(/\s+/).filter(Boolean), ...required]);
    const attribute = `class="${[...classes].join(' ')}"`;
    return '<body' + (existing ? attributes.replace(existing[0], attribute) : attributes + ' ' + attribute) + '>';
  });
}

function updateFaqSchema(html, copy, route) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://supersmile-tech.com/' },
        { '@type': 'ListItem', position: 2, name: copy.title, item: 'https://supersmile-tech.com' + route },
      ] },
      { '@type': 'FAQPage', mainEntity: copy.faqs.map(([question, answer]) => ({
        '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
      })) },
    ],
  };
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
}

async function write(name, transform) {
  const before = await read(name);
  const after = await transform(before);
  if (before !== after) await fs.writeFile(path.join(root, name), after);
  return { file: name, changed: before !== after };
}

export async function syncLandingPages(routes = ['/custom-wiring-harness', '/obd2-diagnostic-cable', '/turbo-actuator-harness', '/j1939-cable']) {
  const results = [];
  for (const route of routes) {
    const { markup, copy } = await captureLanding(route);
    results.push(await write(route.slice(1) + '.html', html => {
      const updated = html.replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/, (_match, start, end) => `${start}\n${markup}\n${end}`);
      return ensureBodyClasses(updateFaqSchema(updated, copy, route), ['site-redesign', 'page-landing', 'page-landing-custom']);
    }));
  }
  return results;
}

export async function syncPriorityPages() {
  const results = await syncLandingPages();
  const { context } = await createRenderContext('/custom');
  const serviceTitle = runInContext('t(CUSTOM_SERVICE.heroTitle)', context);
  const serviceCopy = runInContext('t(CUSTOM_SERVICE.heroCopy)', context);
  const contact = await read('contact.html');
  const contactForm = contact.match(/<form id="contact-form"[\s\S]*?<\/form>/)?.[0];
  if (!contactForm?.includes('id="cf-submit"')) throw Error('Direct inquiry form is unavailable');
  results.push(await write('custom.html', html => {
    html = replaceText(replaceText(html, 'cu-title', serviceTitle), 'cu-desc', serviceCopy);
    return ensureBodyClasses(html.replace(/<form id="contact-form"[\s\S]*?<\/form>/, contactForm), ['site-redesign', 'page-custom']);
  }));
  for (const [key, filename] of [
    ['connector-systems-02', 'products/molex-compatible.html'],
    ['automotive-01', 'products/automotive-diagnostic-and-obd-harness.html'],
  ]) {
    const { markup, intro } = await captureCategory(key);
    results.push(await write(filename, html => replaceText(replaceDivContents(html, 'pcc-rich-content', markup), 'pcc-intro', intro)));
  }
  const equipment = await captureEquipment();
  if (!equipment.markup.includes('eqw-scope')) throw Error('Equipment SSR rendering is incomplete');
  results.push(await write('products/equipment-wire.html', html => {
    html = replaceDivContents(html, 'eqw-content', equipment.markup);
    for (const id of ['eqw-title', 'eqw-subtitle', 'eqw-lead']) html = replaceText(html, id, equipment.nodes.get(id).textContent);
    return html;
  }));
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await syncPriorityPages()));
}
