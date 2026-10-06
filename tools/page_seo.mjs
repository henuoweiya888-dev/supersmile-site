import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { buildSeoPolicy, createRuntimePolicy, htmlPathForRoute, root, SEO_VERSION, withSeoPolicy } from './seo_policy.mjs';

const policy = await buildSeoPolicy();
const runtime = createRuntimePolicy(policy);
const editorialScripts = new Set(['appliance-wire-editorial.js','automotive-primary-wire-editorial.js','can-bus-editorial.js','coaxial-editorial.js','coil-motion-editorial.js','emi-field-editorial.js','equipment-wire-editorial.js','fine-pitch-magazine.js','fpc-ffc-magazine.js','ftdi-signal-editorial.js','fuse-harness-magazine.js','high-temperature-overmolding-editorial.js','idc-ribbon-magazine.js','low-pressure-molding-editorial.js','micro-d-magazine.js','panel-mount-magazine.js','panduit-magazine.js','phoenix-magazine.js','ptfe-magazine.js','strain-relief-magazine.js','ultrasonic-splice-editorial.js','waterproof-design-magazine.js','wire-special-editorial.js']);
const scope = { URLSearchParams };
runInNewContext(fs.readFileSync(path.join(root,'assets/js/manufacturing-context.js'),'utf8'),scope);
export function withPageSeo(html,route) {
  const page = policy.pages.find(page=>page.route===route);
  if(!page) return html;
  let output=withSeoPolicy(html,route,policy);
  const resolved=runtime.resolve({path:route,lang:'en'});
  const section=scope.SS_MANUFACTURING_CONTEXT.render({path:route,lang:'en',procurementContext:resolved.procurementContext,categoryKey:page.categoryKey,productId:page.productId});
  output=output.replace(/<!-- MANUFACTURING CONTEXT START -->[\s\S]*?<!-- MANUFACTURING CONTEXT END -->\s*/g,'');
  output=output.replace(/<p\b[^>]*class="seo-keywords"[^>]*>[\s\S]*?<\/p>\s*/g,'');
  if(!/<footer\b[^>]*class="footer"/i.test(output)) throw new Error(`Missing footer: ${route}`);
  output=output.replace(/<footer\b[^>]*class="footer"/i,`<!-- MANUFACTURING CONTEXT START -->\n${section}\n<!-- MANUFACTURING CONTEXT END -->\n<footer class="footer"`);
  output=output.replace(/<link\b[^>]*id="manufacturing-context-style"[^>]*>\s*/g,'');
  const css=`<link id="manufacturing-context-style" rel="stylesheet" href="/assets/css/manufacturing-context.css?v=${SEO_VERSION}">\n`;
  output=output.includes('<link id="product-gallery-style"')?output.replace('<link id="product-gallery-style"',css+'<link id="product-gallery-style"'):output.replace('</head>',css+'</head>');
  output=output.replace(/<script\b[^>]*id="manufacturing-context-script"[^>]*>\s*<\/script>\s*/g,'');
  output=output.replace(/<script\b[^>]*src="\/assets\/js\/main\.js[^"']*"[^>]*>/,`<script id="manufacturing-context-script" defer src="/assets/js/manufacturing-context.js?v=${SEO_VERSION}"></script>\n$&`);
  output=output.replace(/(\bsrc="\/assets\/js\/)([^"?]+\.js)(?:\?[^"']*)?"/g,(tag,prefix,filename)=>editorialScripts.has(filename)?`${prefix}${filename}?v=${SEO_VERSION}"`:tag);
  return output;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [arg]=process.argv.slice(2);
  const pages=arg&&arg!=='--write'?[{route:new URL(fs.readFileSync(arg,'utf8').match(/rel="canonical" href="([^"]+)"/)[1]).pathname,file:arg}]:policy.pages.map(page=>({route:page.route,file:path.join(root,htmlPathForRoute(page.route))}));
  let changed=0;
  for(const page of pages){
    const html=fs.readFileSync(page.file,'utf8');
    const next=withPageSeo(html,page.route);
    if(html!==next){changed++;if(arg)fs.writeFileSync(page.file,next);}
  }
  console.log(JSON.stringify({pages:pages.length,changed,mode:arg?'applied':'read-only'}));
}
