import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import {buildSeoPolicy,htmlPathForRoute,root} from '../tools/seo_policy.mjs';
const policy=await buildSeoPolicy();
const removed=new Set(['/turbo-actuator-harness','/obd2-diagnostic-cable','/j1939-cable']);
test('the three specialist series never return to a public footer',async()=>{
 for(const p of policy.pages){const html=await fs.readFile(path.join(root,htmlPathForRoute(p.route)),'utf8');const footer=html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]||'';for(const m of footer.matchAll(/href="([^"]+)"/g))assert.ok(!removed.has(new URL(m[1],'https://supersmile-tech.com').pathname),p.route+' '+m[1]);}
});
test('footer labels follow destinations after specialist links are removed or reordered',async()=>{
 const source=await fs.readFile(path.join(root,'assets/js/main.js'),'utf8');const fn=source.match(/function renderSharedChrome\(\)\{[\s\S]*?\n\}/)[0];
 for(const lang of ['en','zh']){
  const links=['/contact','/about','/products','/custom','/'].map(href=>({textContent:'stale',getAttribute:()=>href}));const columns=[{}, {},{h5:{}}],footer={};
  const labels={home:{en:'Home',zh:'首页'},custom:{en:'Custom',zh:'定制服务'},products:{en:'Products',zh:'产品中心'},about:{en:'About',zh:'关于我们'},contact:{en:'Contact',zh:'联系我们'}};
  const context={URL,SITE:{nav:labels},PRODS:{categories:[{name:'OLD TURBO'},{name:'OLD OBD'},{name:'OLD J1939'}]},t:v=>typeof v==='string'?v:v[lang],$:selector=>selector==='.footer'?footer:null,$$:(selector,parent)=>parent===footer?columns:parent===columns[2]?links:[],textIn:(parent,selector,value)=>{if(parent.h5)parent.h5.textContent=value;},pageIdentity:()=> 'page-product-example'};
  runInNewContext(fn+'\nrenderSharedChrome();',context);
  assert.deepEqual(links.map(x=>x.textContent),['contact','about','products','custom','home'].map(k=>labels[k][lang]));
 }
});
test('contextual specialist guides are attached only to matching product sections',async()=>{
 const registry=JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8'));
 const related=JSON.parse(await fs.readFile(path.join(root,'content/product-example-related-series.json'),'utf8'));
 for(const p of registry.products){const html=await fs.readFile(path.join(root,htmlPathForRoute(p.route)),'utf8');const section=html.match(/<aside class="pe-related-series">[\s\S]*?<\/aside>/)?.[0];const expected=related[p.id]||related[p.categoryId];assert.equal(Boolean(section),Boolean(expected),p.route);if(expected)for(const x of expected.links)assert.ok(section.includes('href="'+x.href+'"'),p.route);}
});

test('every application direction includes its reviewed, distinct photograph and no text-only fallback',async()=>{
 const registry=JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8'));
 const plans=JSON.parse(await fs.readFile(path.join(root,'content/product-example-application-plans.json'),'utf8'));
 const topicPlans=JSON.parse(await fs.readFile(path.join(root,'content/product-example-application-overrides.json'),'utf8'));
 for(const p of registry.products){
  const html=await fs.readFile(path.join(root,htmlPathForRoute(p.route)),'utf8');
  const apps=html.match(/<section class="pe-section pe-applications"[\s\S]*?<\/section>/)[0];
  const images=[...apps.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(images.length,6,p.id);assert.equal(new Set(images).size,6,p.id);
  const plan=topicPlans[p.id]||plans.exampleOverrides?.[p.id]||plans.categories[p.categoryId];const keys=[];
  const headings=[...apps.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(m=>m[1]);const escape=t=>t.replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  for(const [i,d] of plan.directions.entries())for(const lang of ['en','zh'])assert.ok(headings[i].includes('lang=\"'+lang+'\">'+escape(d.title[lang])+'</span>'),p.id+' image/topic order '+i+' '+lang);
  for(const [i,src] of images.entries()){const candidate=plan.directions[i].candidates.find(c=>c.path===src);assert.ok(candidate,p.id+' direction '+i);keys.push(candidate.visualIdentity||candidate.sha256);}
  assert.equal(new Set(keys).size,6,p.id+' visual uniqueness');assert.ok(!apps.includes('pe-app-text'),p.id);
 }
});
test('construction close-ups use bounded, distinct regions of the displayed product, not unrelated stock photos',async()=>{
 const registry=JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8'));
 const crops=JSON.parse(await fs.readFile(path.join(root,'content/product-example-detail-crops.json'),'utf8')).products;
 for(const p of registry.products){
  const html=await fs.readFile(path.join(root,htmlPathForRoute(p.route)),'utf8');const hero=html.match(/class="pe-product-view"[\s\S]*?<img src="([^"]+)"/)[1];
  const structure=html.match(/id="pe-construction"[\s\S]*?<\/section>/)[0];const data=crops[p.id];
  assert.equal(data.path,hero,p.id);const srcs=[...structure.matchAll(/<img src="([^"]+)"/g)].map(m=>m[1]);assert.ok((srcs.length>=1&&srcs.length<=2)||(srcs.length===0&&data.omissionReason),p.id);assert.ok(srcs.every(src=>src===hero),p.id);
  const rois=[...structure.matchAll(/data-pe-crop="([^"]+)"/g)].map(m=>m[1].split(',').map(Number));assert.equal(rois.length,data.crops.length,p.id);
  for(const [x,y,w,h] of rois){assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1.00001&&y+h<=1.00001&&w*h<.6,p.id);}
  if(rois.length===2){const [a,b]=rois;const overlap=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));assert.ok(overlap/(a[2]*a[3]+b[2]*b[3]-overlap)<.25,p.id);}
 }
});

test('Wiring and Plug names cannot accidentally select ring-terminal load-path advice',async()=>{
 const registry=JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8'));
 for(const p of registry.products){const name=p.title.en+' '+p.title.zh;if(/\bring\b|\blug\b|\bbattery\b|搭接|环形端子|环端|电池|电瓶/i.test(name))continue;
  const html=await fs.readFile(path.join(root,htmlPathForRoute(p.route)),'utf8');const structure=html.match(/id="pe-construction"[\s\S]*?<\/section>/)[0];assert.ok(!structure.includes('Current path and end termination'),p.id+' '+p.title.en);
 }
});
