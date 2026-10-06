import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSeoPolicy, htmlPathForRoute, root, serializeRuntime, withSeoPolicy } from './seo_policy.mjs';

const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--build', '--write'].includes(arg)) throw new Error(`Unknown argument: ${arg}`);
const policy = await buildSeoPolicy();
const report = { version: policy.version, publicPages: policy.pages.length, changedPages: 0, maxTitleLength: { en: 0, zh: 0 }, maxDescriptionLength: { en: 0, zh: 0 }, kinds: {} };
for (const page of policy.pages) {
  report.kinds[page.kind] = (report.kinds[page.kind] || 0) + 1;
  for (const lang of ['en', 'zh']) {
    report.maxTitleLength[lang] = Math.max(report.maxTitleLength[lang], page.title[lang].length);
    report.maxDescriptionLength[lang] = Math.max(report.maxDescriptionLength[lang], page.description[lang].length);
  }
  const file = path.join(root, htmlPathForRoute(page.route));
  const html = await fs.readFile(file, 'utf8');
  const updated = withSeoPolicy(html, page.route, policy);
  if (updated !== html) {
    report.changedPages++;
    if (args.has('--write')) await fs.writeFile(file, updated);
  }
}
if (args.has('--build') || args.has('--write')) await fs.writeFile(path.join(root, 'assets/js/seo-policy.js'), serializeRuntime(policy));
console.log(JSON.stringify({ ...report, mode: args.has('--write') ? 'applied' : args.has('--build') ? 'module-built-only' : 'read-only-report' }, null, 2));
