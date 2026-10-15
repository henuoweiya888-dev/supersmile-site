import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const localized = (tag, className, copy, attributes = '') => `<${tag} class="${className}" data-mr-en="${esc(copy.en)}" data-mr-zh="${esc(copy.zh)}"${attributes}>${esc(copy.en)}</${tag}>`;

export function pdfLink(item) {
  const value = item.pdf_url || item.source_url || '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (/\.pdf$/i.test(url.pathname) || item.pdf_verified === true) ? url.href : null;
  } catch { return null; }
}

export function renderReferences(data) {
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
  return `<!-- MODEL REFERENCES START -->
<section id="category-model-references" class="mr-section" aria-labelledby="mr-title">
<header class="mr-header">${localized('p', 'mr-kicker', data.kicker)}${localized('h2', 'mr-title', data.title, ' id="mr-title"')}${localized('p', 'mr-intro', data.intro)}</header>
<div class="mr-toolbar">${localized('label', 'mr-search-label', data.search_label, ' for="mr-search"')}<input id="mr-search" class="mr-search" type="search" placeholder="${esc(data.search_placeholder.en)}" data-mr-placeholder-en="${esc(data.search_placeholder.en)}" data-mr-placeholder-zh="${esc(data.search_placeholder.zh)}" aria-describedby="mr-search-status" autocomplete="off" spellcheck="false">${localized('button', 'mr-clear', data.clear, ' id="mr-clear" type="button" disabled')}<p id="mr-search-status" class="mr-search-status" role="status" aria-live="polite">${data.products.length + data.materials.length} references · Search by brand or part number</p></div>
${localized('p', '', data.empty, ' id="mr-no-results" hidden')}
<div class="mr-groups">${data.groups.map(group).join('\n')}</div>
<section class="mr-checks" aria-labelledby="mr-checks-title">${localized('h3', 'mr-checks-title', data.checks_title, ' id="mr-checks-title"')}<div class="mr-check-grid">${checks}</div></section>
${localized('p', 'mr-boundary', data.boundary)}<div class="mr-cta">${localized('p', '', data.cta.text)}${localized('a', '', data.cta.label, ` href="${esc(data.cta.url)}"`)}</div>
</section>
<!-- MODEL REFERENCES END -->`;
}

export function patchPage(html, data) {
  html = html.replace(/<!-- MODEL REFERENCES START -->[\s\S]*?<!-- MODEL REFERENCES END -->\n?/, '');
  html = html.replace(/<link id="model-references-style"[^>]*>\n?/, '');
  html = html.replace(/<script id="model-references-script"[^>]*><\/script>\n?/, '');
  html = html.replace(/<!-- MODEL REFERENCES JUMP START -->[\s\S]*?<!-- MODEL REFERENCES JUMP END -->/, '');
  if (!html.includes('<section class="pcc-closing">')) throw new Error('Pilot closing section missing');
  if (!html.includes('id="pcc-back"')) throw new Error('Pilot hero link missing');
  const jump = `<!-- MODEL REFERENCES JUMP START -->${localized('a', 'mr-jump-link', data.jump, ' href="#category-model-references"')}<!-- MODEL REFERENCES JUMP END -->`;
  html = html.replace('<a class="pcc-back-link" id="pcc-back"', jump + '<a class="pcc-back-link" id="pcc-back"');
  html = html.replace('  <section class="pcc-closing">', renderReferences(data) + '\n  <section class="pcc-closing">');
  html = html.replace('<link id="example-product-links-style"', '<link id="model-references-style" rel="stylesheet" href="/assets/css/model-references.css?v=20261015-compact2">\n<link id="example-product-links-style"');
  return html.replace('<!-- PRODUCT PHOTO DIALOG START -->', '<script id="model-references-script" defer src="/assets/js/model-references.js?v=20261015-compact2"></script>\n<!-- PRODUCT PHOTO DIALOG START -->');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const key = process.argv[2] || 'custom-harness-01';
  if (key !== 'custom-harness-01') throw new Error('Only the approved industrial-equipment pilot is enabled.');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/model-references', `${key}.json`), 'utf8'));
  const filename = path.join(root, data.route.slice(1) + '.html');
  fs.writeFileSync(filename, patchPage(fs.readFileSync(filename, 'utf8'), data));
  console.log(`Updated ${data.route}: ${data.products.length} finished references, ${data.materials.length} materials.`);
}
