import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const localized = (tag, className, copy, attributes = '') => `<${tag} class="${className}" data-mr-en="${esc(copy.en)}" data-mr-zh="${esc(copy.zh)}"${attributes}>${esc(copy.en)}</${tag}>`;

export function renderReferences(data) {
  const group = definition => {
    const items = data[definition.key].map(item => {
      const search = [item.brand, item.identifier, ...item.aliases, ...Object.values(item.description), ...Object.values(item.engineering_use)].join(' ');
      const alias = item.aliases.length ? localized('p', 'mr-aliases', {
        en: data.alias_label.en + item.aliases.join(' / '),
        zh: data.alias_label.zh + item.aliases.join(' / '),
      }) : '';
      return `<li class="mr-entry" data-mr-entry data-mr-search="${esc(search)}"><span class="mr-brand">${esc(item.brand)}</span><h4 class="mr-part">${esc(item.identifier)}</h4>${localized('p', 'mr-spec', item.description)}${localized('p', 'mr-use', item.engineering_use)}${alias}${localized('a', 'mr-source', data.source_label, ` href="${esc(item.source_url)}" target="_blank" rel="noopener noreferrer"`)}</li>`;
    }).join('\n');
    return `<section class="mr-group" aria-labelledby="mr-${definition.key}-title"><header class="mr-group-head">${localized('h3', '', definition.title, ` id="mr-${definition.key}-title"`)}${localized('p', '', definition.intro)}</header><ul class="mr-list">${items}</ul></section>`;
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
  html = html.replace('<link id="example-product-links-style"', '<link id="model-references-style" rel="stylesheet" href="/assets/css/model-references.css?v=20261015-pilot1">\n<link id="example-product-links-style"');
  return html.replace('<!-- PRODUCT PHOTO DIALOG START -->', '<script id="model-references-script" defer src="/assets/js/model-references.js?v=20261015-pilot1"></script>\n<!-- PRODUCT PHOTO DIALOG START -->');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const key = process.argv[2] || 'custom-harness-01';
  if (key !== 'custom-harness-01') throw new Error('Only the approved industrial-equipment pilot is enabled.');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/model-references', `${key}.json`), 'utf8'));
  const filename = path.join(root, data.route.slice(1) + '.html');
  fs.writeFileSync(filename, patchPage(fs.readFileSync(filename, 'utf8'), data));
  console.log(`Updated ${data.route}: ${data.products.length} finished references, ${data.materials.length} materials.`);
}
