import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInContext } from 'node:vm';
import { createRenderContext, replaceDivContents } from './sync_priority_page_ssr.mjs';
import { withStaticNavigation } from './static_navigation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function captureProductDirectory(language = 'en') {
  const { context } = await createRenderContext('/products', language);
  const nodes = new Map();
  context.document.querySelector = selector => {
    if (!selector.startsWith('#pc-')) return null;
    if (!nodes.has(selector)) nodes.set(selector, { innerHTML: '', textContent: '', setAttribute() {} });
    return nodes.get(selector);
  };
  runInContext('renderProductsStatic()', context);
  return Object.fromEntries(['pc-directory', 'pc-guide-items', 'pc-process-steps'].map(id => [id, nodes.get('#' + id)?.innerHTML || '']));
}

export async function syncNavigation() {
  const site = JSON.parse(await fs.readFile(path.join(root, 'data/site.json'), 'utf8'));
  const files = [];
  for (const directory of ['', 'products', 'product']) {
    for (const entry of await fs.readdir(path.join(root, directory), { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.html')) files.push(path.join(directory, entry.name));
    }
  }
  const productMarkup = await captureProductDirectory();
  if (!productMarkup['pc-directory'].includes('pc-subcategory-link')) throw Error('Product directory rendering is empty');
  let changed = 0;
  for (const file of files) {
    const target = path.join(root, file);
    const before = await fs.readFile(target, 'utf8');
    let after = withStaticNavigation(before, site.nav);
    if (file === 'products.html') {
      for (const [id, markup] of Object.entries(productMarkup)) after = replaceDivContents(after, id, markup);
    }
    if (after !== before) {
      await fs.writeFile(target, after);
      changed += 1;
    }
  }
  return { checked: files.length, changed };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await syncNavigation()));
}
