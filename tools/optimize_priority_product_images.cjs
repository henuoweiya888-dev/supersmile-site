const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const sources = ['p081_glass_7.jpg', 'p083_ring_9.jpg'];

async function htmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(full) : Promise.resolve(entry.name.endsWith('.html') ? [full] : []);
  }));
  return groups.flat();
}

function updateImageReferences(input, manifest, { html = false } = {}) {
  const replace = text => manifest.reduce((result, item) => result.replaceAll(item.source, item.output), text);
  // Preserve explicit full-size links and their source mapping. Only displayed
  // resources and metadata use derivatives; clicking a photo keeps the original.
  return html ? input.split(/(<a\b[^>]*>)/gi).map(part => /^<a\b/i.test(part) ? part : replace(part)).join('') : replace(input);
}

async function optimizePriorityProductImages() {
  const sharp = require('sharp');
  const destination = path.join(root, 'assets/images/products/web');
  await fs.mkdir(destination, { recursive: true });
  const manifest = [];
  for (const filename of sources) {
    const source = `/assets/images/products/${filename}`;
    const output = `/assets/images/products/web/${filename.replace(/\.jpg$/, '-1600.webp')}`;
    const original = await fs.readFile(path.join(root, source));
    const originalMetadata = await sharp(original).metadata();
    const info = await sharp(original).rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 6 }).toFile(path.join(root, output));
    manifest.push({ source, output, sourceSha256: createHash('sha256').update(original).digest('hex'),
      sourceBytes: original.length, sourceWidth: originalMetadata.width, sourceHeight: originalMetadata.height,
      outputBytes: info.size, width: info.width, height: info.height, quality: 88 });
  }
  await fs.writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const references = [...await htmlFiles(root), path.join(root, 'data/products.json')];
  const changed = [];
  for (const file of references) {
    const before = await fs.readFile(file, 'utf8');
    const after = updateImageReferences(before, manifest, { html: file.endsWith('.html') });
    if (after !== before) {
      await fs.writeFile(file, after);
      changed.push(path.relative(root, file));
    }
  }
  return { images: manifest, changed };
}

module.exports = { updateImageReferences, optimizePriorityProductImages };
if (require.main === module) {
  optimizePriorityProductImages().then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(error => { console.error(error); process.exitCode = 1; });
}
