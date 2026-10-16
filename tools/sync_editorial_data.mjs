import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let pages=0;
for(const filename of fs.readdirSync(path.join(root,'products')).filter(f=>f.endsWith('.html'))) {
 const file=path.join(root,'products',filename);let html=fs.readFileSync(file,'utf8');
 if(!html.includes('/assets/js/editorial-lifecycle.js'))continue;
 const scripts=[...html.matchAll(/<script src="(\/assets\/js\/[^?" ]+)(?:\?[^" ]*)?"/g)];
 const renderer=scripts.find(m=>fs.readFileSync(path.join(root,m[1]),'utf8').includes('SuperSmileEditorial.mount'));
 if(!renderer)throw Error('Missing dedicated article renderer: '+filename);
 const source=fs.readFileSync(path.join(root,renderer[1]),'utf8').match(/fetchContent\(['"]([^'"]+)['"]/)?.[1];
 if(!source?.startsWith('/content/product-category-drafts/'))throw Error('Unexpected editorial source: '+filename);
 const data=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,source),'utf8'))).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
 html=html.replace(/<script type="application\/json" id="editorial-page-data"[^>]*>[\s\S]*?<\/script>\n?/g,'');
 const marker='<script src="/assets/js/editorial-lifecycle.js';
 const start=html.indexOf(marker);
 html=html.slice(0,start)+`<script type="application/json" id="editorial-page-data" data-source="${source}">${data}</script>\n`+html.slice(start);
 fs.writeFileSync(file,html);pages++;
}
console.log('Synchronized inline bilingual article data for '+pages+' pages.');
