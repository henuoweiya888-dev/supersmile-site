import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'data/product-photo-galleries.json');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const version = '20261014-photos2';
const exampleLinkVersion = '20261014-2';
const detailRegistryPath = path.join(root, 'content/product-example-registry.json');
const exampleDetails = fs.existsSync(detailRegistryPath)
  ? JSON.parse(fs.readFileSync(detailRegistryPath, 'utf8')).entries
  : [
    {categoryId:'custom-harness-09',sourceIndex:1,src:'/assets/images/product-galleries/40c15bc1f6d41dea.webp',route:'/products/braided-branch-harness'},
    {categoryId:'cable-assembly-02',sourceIndex:1,src:'/assets/images/product-galleries/e9da8e217b272957.webp',route:'/products/m12-4-pin-cable-assembly'}
  ];
const detailByEntry = new Map(exampleDetails.map(entry => [entry.categoryId+':'+entry.sourceIndex,entry]));
let cached;
function manifest() {
  return cached ||= fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
}

export function productGalleryMarkup(key) {
  const photos = manifest()[key]?.photos || [];
  if (!photos.length) return '';
  const cards = photos.map((photo, index) => {
    const model = photo.model ? `<span class="pcc-gallery-model" dir="auto">${esc(photo.model)}</span>` : '';
    const candidate = detailByEntry.get(key+':'+photo.sourceIndex);
    const detail = candidate && candidate.src === photo.src ? candidate : null;
    const photoMarkup = `<img src="${esc(photo.thumbnail)}" srcset="${esc(photo.thumbnail)} 600w, ${esc(photo.src)} 1200w" sizes="(max-width:700px) 74vw, (max-width:1100px) 29vw, 21vw" alt="${esc(photo.nameEn)}" width="1200" height="1200" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async"><span class="pcc-gallery-zoom" aria-hidden="true">↗</span>`;
    const photoControl = detail
      ? `<a class="pcc-gallery-photo" data-product-detail-path="${esc(detail.route)}" href="${esc(detail.route)}?lang=en" aria-label="View product details: ${esc(photo.nameEn)}">${photoMarkup}</a>`
      : `<button class="pcc-gallery-photo" type="button" aria-label="View photograph: ${esc(photo.nameEn)}">${photoMarkup}</button>`;
    return `<figure class="pcc-gallery-item" data-name-en="${esc(photo.nameEn)}" data-name-zh="${esc(photo.nameZh)}" data-model="${esc(photo.model)}" data-full-image="${esc(photo.src)}">
      ${photoControl}
      <figcaption><span class="pcc-gallery-no">${String(index + 1).padStart(2, '0')}</span><div class="pcc-gallery-name"><span class="pcc-gallery-name-text">${esc(photo.nameEn)}</span>${model}</div></figcaption>
    </figure>`;
  }).join('\n');
  return `<!-- PRODUCT GALLERY START -->
<section class="pcc-gallery" data-gallery-category="${esc(key)}" aria-labelledby="pcc-gallery-title">
  <header class="pcc-gallery-head"><h2 id="pcc-gallery-title">Popular Product Photos</h2><div class="pcc-gallery-controls"><span class="pcc-gallery-count">01 / ${String(photos.length).padStart(2, '0')}</span><button class="pcc-gallery-arrow" data-gallery-direction="previous" type="button" aria-label="Previous product photographs" disabled>←</button><button class="pcc-gallery-arrow" data-gallery-direction="next" type="button" aria-label="Next product photographs">→</button></div></header>
  <div class="pcc-gallery-track" tabindex="0" role="region" aria-label="Product photographs, scroll horizontally">${cards}</div>
</section>
<!-- PRODUCT GALLERY END -->`;
}

export function withProductGallery(input, key) {
  let html = input
    .replace(/\n<!-- PRODUCT GALLERY START -->[\s\S]*?<!-- PRODUCT GALLERY END -->/g, '')
    .replace(/<!-- PRODUCT PHOTO DIALOG START -->[\s\S]*?<!-- PRODUCT PHOTO DIALOG END -->\n/g, '')
    .replace(/<link\b[^>]*id="product-gallery-style"[^>]*>\n/g, '')
    .replace(/<script\b[^>]*id="product-gallery-script"[^>]*>[\s\S]*?<\/script>\n/g, '')
    .replace(/<link\b[^>]*id="example-product-links-style"[^>]*>\n/g, '')
    .replace(/<script\b[^>]*id="example-product-links-script"[^>]*>[\s\S]*?<\/script>\n/g, '')
    .replace(/<link\b[^>]*id="category-media-balance-style"[^>]*>\n/g, '')
    .replace(/\b has-product-gallery\b/g, '');
  const gallery = productGalleryMarkup(key);
  if (!gallery) return html;
  const main = /<main\b[^>]*>/.exec(html);
  if (!main) throw new Error(`Missing main content for ${key}`);
  const sections = /<\/?section\b[^>]*>/g;
  sections.lastIndex = main.index + main[0].length;
  let match;
  let depth = 0;
  let end = -1;
  while ((match = sections.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) { end = sections.lastIndex; break; }
  }
  if (end < 0) throw new Error(`Missing opening hero section for ${key}`);
  html = html.slice(0, end) + '\n' + gallery + html.slice(end);
  html = html.replace(/<body\b([^>]*\bclass=")([^"]*)"/, '<body$1$2 has-product-gallery"');
  const hasDetails = gallery.includes('data-product-detail-path=');
  const detailStyle = hasDetails ? `<link id="example-product-links-style" rel="stylesheet" href="/assets/css/example-product-links.css?v=${exampleLinkVersion}">\n` : '';
  html = html.replace('</head>', `${detailStyle}<link id="product-gallery-style" rel="stylesheet" href="/assets/css/product-gallery.css?v=${version}">\n<link id="category-media-balance-style" rel="stylesheet" href="/assets/css/category-media-balance.css?v=20261017-density1">\n</head>`);
  const dialog = `<!-- PRODUCT PHOTO DIALOG START -->
<dialog class="pcc-photo-dialog" aria-labelledby="pcc-dialog-title"><header class="pcc-dialog-head"><h2 class="pcc-dialog-title" id="pcc-dialog-title"></h2><button class="pcc-dialog-close" type="button" aria-label="Close photograph">×</button></header><img class="pcc-dialog-image" alt="" width="1200" height="1200"></dialog>
<!-- PRODUCT PHOTO DIALOG END -->
<script id="product-gallery-script" src="/assets/js/product-gallery.js?v=${version}"></script>${hasDetails ? `\n<script id="example-product-links-script" defer src="/assets/js/example-product-links.js?v=${exampleLinkVersion}"></script>` : ''}`;
  return html.replace('</body>', dialog + '\n</body>');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [filename, key] = process.argv.slice(2);
  if (!filename || !key) throw new Error('Expected page filename and category key.');
  fs.writeFileSync(filename, withProductGallery(fs.readFileSync(filename, 'utf8'), key));
}
