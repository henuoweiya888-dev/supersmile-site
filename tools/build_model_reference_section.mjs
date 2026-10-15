import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const localized = (tag, className, copy, attributes = '') => `<${tag} class="${className}" data-mr-en="${esc(copy.en)}" data-mr-zh="${esc(copy.zh)}"${attributes}>${esc(copy.en)}</${tag}>`;
export const REFERENCE_RUNTIME_VERSION = '20261015-references-all1';
const legacyPilot = {
  category_id: 'custom-harness-01',
  route: '/products/industrial-equipment-harness',
  category_name: { en: 'Industrial Equipment Harness', zh: '工业设备线束' }
};
const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'data/product-capabilities.json'), 'utf8'));
const slugify = value => String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const categoryRoutes = new Map(capabilities.groups.flatMap(group => group.items.en.map((name, index) => [
  `${group.id}-${String(index + 1).padStart(2, '0')}`, `/products/${slugify(name)}`
])).filter(([, route]) => {
  const filename = path.join(root, route.slice(1) + '.html');
  return fs.existsSync(filename) && fs.readFileSync(filename, 'utf8').includes(`rel="canonical" href="https://supersmile-tech.com${route}"`);
}));
const bilingual = value => value && ['en', 'zh'].every(lang => typeof value[lang] === 'string' && value[lang].trim());

// Only complete, reviewed category data can enable the static reference section.
// The already-published pilot predates the validation/name fields and remains compatible.
export function validateReferenceData(data) {
  if (!data || typeof data !== 'object') throw new Error('Reference data is missing.');
  const legacy = data.category_id === legacyPilot.category_id && data.route === legacyPilot.route && data.validated === undefined;
  if (!legacy && data.validated !== true) throw new Error('Reference data must be explicitly validated.');
  if (categoryRoutes.get(data.category_id) !== data.route) throw new Error('Reference category and existing route do not match.');
  const categoryName = data.category_name || (legacy ? legacyPilot.category_name : null);
  if (!bilingual(categoryName)) throw new Error('Reference category_name requires English and Chinese.');
  if (!Array.isArray(data.products) || !Array.isArray(data.materials)) throw new Error('Reference products and materials must be arrays.');
  if (data.quantity_exception !== undefined) {
    const exception = data.quantity_exception;
    const counts = exception?.verified_counts;
    if (data.validated !== true || exception?.approved !== true || !['process_or_delivery', 'material_scope', 'narrow_published_range'].includes(exception.kind) || !bilingual(exception.reason) || typeof exception.audit_id !== 'string' || !exception.audit_id.trim()) throw new Error('A quantity exception requires explicit approval, validated data, an audited reason and a supported kind.');
    if (!counts || !Number.isInteger(counts.products) || !Number.isInteger(counts.materials) || counts.products !== data.products.length || counts.materials !== data.materials.length) throw new Error('Quantity exception verified counts must exactly match the reference arrays.');
    const empty = data.products.length + data.materials.length === 0;
    if (exception.engineering_only === true && (exception.kind !== 'process_or_delivery' || !empty || !Array.isArray(data.checks) || data.checks.length < 3)) throw new Error('Engineering-only exceptions require process_or_delivery, no stock references and at least three bilingual engineering schemes.');
    if (empty && exception.engineering_only !== true) throw new Error('An empty reference section requires an explicitly approved engineering-only process or delivery exception.');
  } else if (data.products.length < 200 || data.materials.length < 200) throw new Error('Each category requires at least 200 finished models and 200 material part numbers.');
  if (!Array.isArray(data.groups) || data.groups.length !== 2 || data.groups[0]?.key !== 'products' || data.groups[1]?.key !== 'materials') throw new Error('Reference groups must be products and materials in that order.');
  const seen = new Set();
  for (const item of [...data.products, ...data.materials]) {
    if (!item || typeof item.brand !== 'string' || !item.brand.trim() || typeof item.identifier !== 'string' || !item.identifier.trim() || !bilingual(item.description) || !Array.isArray(item.aliases) || item.aliases.some(alias => typeof alias !== 'string')) throw new Error('Every reference requires a manufacturer, exact identifier, aliases and bilingual product type.');
    const key = item.brand.trim().toLowerCase() + '|' + item.identifier.normalize('NFKC').replace(/[\s\p{Dash_Punctuation}]+/gu, '').toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate manufacturer part number: ${item.brand} ${item.identifier}`);
    seen.add(key);
  }
  const copyFields = ['title', 'kicker', 'intro', 'jump', 'search_label', 'search_placeholder', 'clear', 'empty', 'checks_title', 'boundary', 'source_label', 'service_label'];
  if (copyFields.some(key => !bilingual(data[key])) || !bilingual(data.pagination?.previous) || !bilingual(data.pagination?.next) || data.groups.some(group => !bilingual(group.title) || !bilingual(group.intro)) || !Array.isArray(data.checks) || !data.checks.length || data.checks.some(check => !bilingual(check.title) || !bilingual(check.copy))) throw new Error('Every public reference label and engineering check requires both languages.');
  if (data.service_label.zh !== '可制作兼容替代件、自有原厂采购渠道') throw new Error('The approved sourcing service sentence must be preserved.');
  return { validated: true, category_id: data.category_id, route: data.route, category_name: categoryName };
}

export function referenceDataForCategory(categoryKey, route) {
  if (categoryRoutes.get(categoryKey) !== route) return null;
  const filename = path.join(root, 'data/model-references', `${categoryKey}.json`);
  if (!fs.existsSync(filename)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    validateReferenceData(data);
    return data.route === route && data.category_id === categoryKey ? data : null;
  } catch { return null; }
}

export function renderInquiry(data) {
  const referenceConfiguration = validateReferenceData(data);
  const scope = {URLSearchParams};
  runInNewContext(fs.readFileSync(path.join(root, 'assets/js/manufacturing-context.js'), 'utf8'), scope);
  return scope.SS_MANUFACTURING_CONTEXT.render({path:data.route,lang:'en',categoryKey:data.category_id,referenceConfiguration});
}

export function pdfLink(item) {
  const value = item.pdf_url || item.source_url || '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (/\.pdf$/i.test(url.pathname) || item.pdf_verified === true) ? url.href : null;
  } catch { return null; }
}

export function renderReferences(data) {
  validateReferenceData(data);
  const engineeringOnly = data.quantity_exception?.engineering_only === true;
  const visibleGroups = data.groups.filter(definition => data[definition.key].length > 0);
  const stacked = visibleGroups.length === 2 && (data.products.length < 20 || data.materials.length < 20);
  const group = definition => {
    const items = data[definition.key].map(item => {
      const search = [item.brand, item.identifier, ...item.aliases, ...Object.values(item.description)].join(' ');
      const alias = item.aliases.length ? `<span class="mr-alias"> / ${item.aliases.map(esc).join(' / ')}</span>` : '';
      const pdf = pdfLink(item);
      const source = pdf ? localized('a', 'mr-source', data.source_label, ` href="${esc(pdf)}" target="_blank" rel="noopener noreferrer" data-mr-aria-en="${esc(item.identifier + ' PDF datasheet')}" data-mr-aria-zh="${esc(item.identifier + ' PDF 规格书')}" aria-label="${esc(item.identifier + ' PDF datasheet')}"`) : '';
      return `<li class="mr-entry" data-mr-entry data-mr-search="${esc(search)}"><div class="mr-entry-head"><span class="mr-brand">${esc(item.brand)}</span><h4 class="mr-part">${esc(item.identifier)}${alias}</h4>${source}</div>${localized('p', 'mr-spec', item.description)}${localized('p', 'mr-service', data.service_label)}</li>`;
    }).join('\n');
    const pagination = `<nav class="mr-pagination" aria-label="Reference pages" data-mr-aria-en="${esc(definition.title.en + ' pages')}" data-mr-aria-zh="${esc(definition.title.zh + '分页')}" hidden>${localized('button', '', data.pagination.previous, ` type="button" data-mr-page="previous" aria-controls="mr-${definition.key}-list"`)}<p class="mr-page-status" role="status" aria-live="polite"></p>${localized('button', '', data.pagination.next, ` type="button" data-mr-page="next" aria-controls="mr-${definition.key}-list"`)}</nav>`;
    return `<section class="mr-group" aria-labelledby="mr-${definition.key}-title"><header class="mr-group-head">${localized('h3', '', definition.title, ` id="mr-${definition.key}-title"`)}${localized('p', '', definition.intro)}</header>${pagination}<ul class="mr-list" id="mr-${definition.key}-list">${items}</ul></section>`;
  };
  const checks = data.checks.map((check, index) => `<div class="mr-check">${localized('h4', 'mr-check-label', { en: `${String(index + 1).padStart(2, '0')}  ${check.title.en}`, zh: `${String(index + 1).padStart(2, '0')}  ${check.title.zh}` })}${localized('p', 'mr-check-copy', check.copy)}</div>`).join('\n');
  const inventory = engineeringOnly ? '' : `<div class="mr-toolbar">${localized('label', 'mr-search-label', data.search_label, ' for="mr-search"')}<input id="mr-search" class="mr-search" type="search" placeholder="${esc(data.search_placeholder.en)}" data-mr-placeholder-en="${esc(data.search_placeholder.en)}" data-mr-placeholder-zh="${esc(data.search_placeholder.zh)}" aria-describedby="mr-search-status" autocomplete="off" spellcheck="false">${localized('button', 'mr-clear', data.clear, ' id="mr-clear" type="button" disabled')}<p id="mr-search-status" class="mr-search-status" role="status" aria-live="polite">${data.products.length + data.materials.length} references · Search by brand or part number</p></div>
${localized('p', '', data.empty, ' id="mr-no-results" hidden')}
<div class="mr-groups${stacked ? ' mr-groups--stacked' : ''}">${visibleGroups.map(group).join('\n')}</div>`;
  return `<!-- MODEL REFERENCES START -->
<section id="category-model-references" class="mr-section"${engineeringOnly ? ' data-mr-mode="engineering"' : ''} aria-labelledby="mr-title">
<header class="mr-header"><div class="mr-header-copy">${localized('p', 'mr-kicker', data.kicker)}${localized('h2', 'mr-title', data.title, ' id="mr-title"')}${localized('p', 'mr-intro', data.intro)}</div>${localized('a', 'mr-to-top', {en:'Back to Top ↑',zh:'返回顶部 ↑'}, ' href="#page-top"')}</header>
${inventory}
<section class="mr-checks" aria-labelledby="mr-checks-title">${localized('h3', 'mr-checks-title', data.checks_title, ' id="mr-checks-title"')}<div class="mr-check-grid">${checks}</div></section>
${localized('p', 'mr-boundary', data.boundary)}
</section>
<!-- MODEL REFERENCES END -->`;
}

export function patchPage(html, data) {
  validateReferenceData(data);
  html = html.replace(/<!-- MODEL REFERENCES START -->[\s\S]*?<!-- MODEL REFERENCES END -->\n?/, '');
  html = html.replace(/<link id="model-references-style"[^>]*>\n?/, '');
  html = html.replace(/<script id="model-references-script"[^>]*><\/script>\n?/, '');
  html = html.replace(/<script id="category-inquiry-script"[^>]*><\/script>\n?/, '');
  html = html.replace(/<!-- MODEL REFERENCES JUMP START -->[\s\S]*?<!-- MODEL REFERENCES JUMP END -->/, '');
  if (!html.includes('</main>')) throw new Error(`Category main section missing: ${data.route}`);
  const heroBack = /<a\b(?=[^>]*\bclass="[^"]*\b(?:pcc-back-link|[\w-]+-back)\b[^"]*")(?=[^>]*\bhref="\/products")[^>]*>/;
  if (!heroBack.test(html)) throw new Error(`Category hero link missing: ${data.route}`);
  if (!html.includes('<!-- PRODUCT PHOTO DIALOG START -->')) throw new Error(`Category product-photo integration point missing: ${data.route}`);
  if (!html.includes('<!-- MANUFACTURING CONTEXT START -->')) throw new Error(`Category manufacturing context missing: ${data.route}`);
  const jump = `<!-- MODEL REFERENCES JUMP START -->${localized('a', 'mr-jump-link', data.jump, ' href="#category-model-references"')}<!-- MODEL REFERENCES JUMP END -->`;
  html = html.replace(heroBack, match => jump + match);
  html = html.replace(/\s*<section\b[^>]*\bclass="[^"]*\bpcc-closing\b[^"]*"[^>]*>[\s\S]*?<\/section>\s*/, '\n');
  html = html.replace('</main>', renderReferences(data) + '\n</main>');
  html = html.replace(/<!-- MANUFACTURING CONTEXT START -->[\s\S]*?<!-- MANUFACTURING CONTEXT END -->/, `<!-- MANUFACTURING CONTEXT START -->\n${renderInquiry(data)}\n<!-- MANUFACTURING CONTEXT END -->`);
  html = html.replace(/<body\b(?![^>]*\bid=)/, '<body id="page-top"');
  html = html.replace(/manufacturing-context\.js\?v=[^"']+/g, `manufacturing-context.js?v=${REFERENCE_RUNTIME_VERSION}`);
  const style = `<link id="model-references-style" rel="stylesheet" href="/assets/css/model-references.css?v=${REFERENCE_RUNTIME_VERSION}">\n`;
  html = html.includes('<link id="example-product-links-style"') ? html.replace('<link id="example-product-links-style"', style + '<link id="example-product-links-style"') : html.replace('</head>', style + '</head>');
  return html.replace('<!-- PRODUCT PHOTO DIALOG START -->', `<script id="model-references-script" defer src="/assets/js/model-references.js?v=${REFERENCE_RUNTIME_VERSION}"></script>\n<script id="category-inquiry-script" defer src="/assets/js/category-inquiry.js?v=${REFERENCE_RUNTIME_VERSION}"></script>\n<!-- PRODUCT PHOTO DIALOG START -->`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const key = process.argv[2] || 'custom-harness-01';
  if (!categoryRoutes.has(key)) throw new Error('An existing category ID is required.');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/model-references', `${key}.json`), 'utf8'));
  validateReferenceData(data);
  if (data.category_id !== key) throw new Error('Reference filename and category_id must match.');
  const filename = path.join(root, data.route.slice(1) + '.html');
  fs.writeFileSync(filename, patchPage(fs.readFileSync(filename, 'utf8'), data));
  console.log(`Updated ${data.route}: ${data.products.length} finished references, ${data.materials.length} materials.`);
}
