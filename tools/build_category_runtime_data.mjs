import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The editorial source stays in one file. Browsers only need the navigation
// summaries and, on a category page, that category's full editorial record.
export function splitCategoryData(details) {
  const index = {};
  const pages = {};
  for (const [key, detail] of Object.entries(details)) {
    if (!/^[a-z]+(?:-[a-z]+)*-\d{2}$/.test(key)) throw Error(`Invalid category key: ${key}`);
    const { page, ...summary } = detail;
    index[key] = {
      ...summary,
      page: page ? { ...(page.displayTitle ? { displayTitle: page.displayTitle } : {}), ...(page.layout ? { layout: page.layout } : {}) } : null,
      summaryOnly: true,
    };
    if (page) pages[key] = detail;
  }
  return { index, pages };
}

export async function buildCategoryRuntimeData(siteRoot = root) {
  const details = JSON.parse(await fs.readFile(path.join(siteRoot, 'data/product-category-details.json'), 'utf8'));
  const { index, pages } = splitCategoryData(details);
  const destination = path.join(siteRoot, 'data/product-category-pages');
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(path.join(siteRoot, 'data/product-category-index.json'), JSON.stringify(index) + '\n');
  await Promise.all(Object.entries(pages).map(([key, detail]) => fs.writeFile(path.join(destination, `${key}.json`), JSON.stringify(detail) + '\n')));
  return { categories: Object.keys(pages).length, indexBytes: Buffer.byteLength(JSON.stringify(index) + '\n') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await buildCategoryRuntimeData()));
}
