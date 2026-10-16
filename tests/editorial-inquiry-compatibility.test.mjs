import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=[
 ['fpc-ffc-magazine','fpc-ffc-assembly','ff-page'],
 ['micro-d-magazine','micro-d-cable-assembly','md-page'],
 ['panel-mount-magazine','panel-mount-cable','pm-page'],
 ['waterproof-design-magazine','waterproof-design-harness','wd-page'],
 ['ultrasonic-splice-editorial','ultrasonic-welded-branch','us-page'],
 ['emi-field-editorial','emi-shielded-cable-design','ee-page'],
 ['ftdi-signal-editorial','ftdi-cable-assembly','fe-page']
];
for(const [script,slug,className] of pages) for(const lang of ['en','zh']) {
 test(`${slug} keeps its illustrated article after inquiry consolidation (${lang})`,async()=>{
  const host={innerHTML:''};const nodes=new Map([['pcc-rich-content',host]]);
  const html=fs.readFileSync(path.join(root,'products',slug+'.html'),'utf8');
  assert.equal(html.includes('id="pcc-closing-title"'),false);
  const document={documentElement:{lang},getElementById(id){
   if(id.startsWith('pcc-closing-'))return null;
   if(!nodes.has(id))nodes.set(id,{textContent:'',src:'',alt:''});
   return nodes.get(id);
  }};
  const data=JSON.parse(fs.readFileSync(path.join(root,'content/product-category-drafts',slug+'.json'),'utf8'));
  runInNewContext(fs.readFileSync(path.join(root,'assets/js',script+'.js'),'utf8'),{
   document,location:{search:`?lang=${lang}`},URLSearchParams,
   localStorage:{getItem:()=>lang},matchMedia:()=>({matches:true}),setTimeout:()=>0,
   fetch:async()=>({json:async()=>data})
  });
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(host.innerHTML,new RegExp(`class="${className}"`));
  assert.doesNotMatch(host.innerHTML,/暂时无法载入|could not load/i);
  assert.ok((host.innerHTML.match(/<img\b/g)||[]).length>=8,'The article should keep its illustrated sections.');
  assert.match(host.innerHTML,/<section\b/);
 });
}
