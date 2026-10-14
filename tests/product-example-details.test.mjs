import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {buildSeoPolicy,createRuntimePolicy,root,EXAMPLE_SEO_POLICY_SCRIPT_VERSION} from '../tools/seo_policy.mjs';

const content=JSON.parse(await fs.readFile(path.join(root,'content/product-example-registry.json'),'utf8'));
const inventory=JSON.parse(await fs.readFile(path.join(root,'content/product-example-inventory.json'),'utf8'));
const photos=new Map(inventory.records.map(r=>[r.exampleId,r.src]));
const policy=await buildSeoPolicy();
const runtime=createRuntimePolicy(policy);
const decode=s=>s.replace(/&amp;/g,'&');

test('all product presentations use unified bilingual SEO and contain no checkout or invented SKU',async()=>{
 assert.equal(content.products.length,1307);
 assert.equal(content.entries.length,1328);
 assert.equal(policy.pages.filter(x=>x.kind==='example').length,content.products.length);
 for(const p of content.products){
  const html=await fs.readFile(path.join(root,'products',p.slug+'.html'),'utf8');
  for(const lang of ['en','zh']){
   const metadata=runtime.resolve({path:p.route,lang});
   assert.equal(metadata.title,p.seoTitle[lang]);
   assert.equal(metadata.description,p.metaDescription[lang]);
  }
  assert.ok(html.includes(`/assets/js/seo-policy.js?v=${EXAMPLE_SEO_POLICY_SCRIPT_VERSION}`));
  assert.ok(html.indexOf('/assets/js/seo-policy.js')<html.indexOf('/assets/js/main.js'));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  const schema=JSON.parse(html.match(/<script id="pe-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const canonical='https://supersmile-tech.com'+p.route;
  assert.deepEqual(schema['@graph'].map(x=>x['@type']),['WebPage','BreadcrumbList']);
  const page=schema['@graph'].find(x=>x['@type']==='WebPage');
  assert.equal(page['@id'],canonical+'#webpage');
  assert.equal(page.url,canonical);
  assert.equal(page.name,p.title.en);
  assert.equal(page.mainEntity,undefined);
  assert.deepEqual(page.primaryImageOfPage,{'@type':'ImageObject',contentUrl:'https://supersmile-tech.com'+photos.get(p.id)});
  const breadcrumb=schema['@graph'].find(x=>x['@type']==='BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement.map(x=>x.position),[1,2,3]);
  assert.equal(breadcrumb.itemListElement.at(-1).item,canonical);
  assert.doesNotMatch(JSON.stringify(schema),/"(?:offers|review|aggregateRating|sku|mpn|manufacturer)"|"@type":"(?:Product|Service|Offer|Review|AggregateRating)"|#product/);
  assert.doesNotMatch(html,/add.to.cart|checkout|buy.now|\bEX-custom|\bEX-cable/i);
  assert.doesNotMatch(html,/>\s*REFERENCE\s*</);
  const targets=[...html.matchAll(/href="([^"<>]+)"/g)].map(m=>decode(m[1])).filter(x=>x.startsWith('/contact?'));
  assert.ok(targets.length>=2);
  for(const href of targets){
   const url=new URL(href,'https://supersmile-tech.com');
   assert.equal(url.searchParams.get('category'),p.categoryId);
   assert.equal(url.searchParams.get('source_page'),p.route);
   assert.equal(url.searchParams.get('category_name'),p.title.en);
  }
 }
});

test('new routes preserve the existing metadata ownership contract and consultation language context',async()=>{
 const script=await fs.readFile(path.join(root,'assets/js/product-example-detail.js'),'utf8');
 assert.doesNotMatch(script,/document\.title\s*=(?!=)|document\.documentElement\.lang\s*=(?!=)/);
 assert.doesNotMatch(script,/observe\(document\.head|meta\[name/);
 assert.match(script,/searchParams\.set\('category_name',data\.title\[lang\]\)/);
 assert.match(script,/searchParams\.set\('lang',lang\)/);
});
