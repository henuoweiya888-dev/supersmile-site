import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {buildSeoPolicy,createRuntimePolicy,root,EXAMPLE_SEO_POLICY_SCRIPT_VERSION} from '../tools/seo_policy.mjs';

const content=JSON.parse(await fs.readFile(path.join(root,'content/product-example-details.json'),'utf8'));
const policy=await buildSeoPolicy();
const runtime=createRuntimePolicy(policy);
const decode=s=>s.replace(/&amp;/g,'&');

test('two product presentations use unified bilingual SEO and contain no checkout or invented SKU',async()=>{
 assert.equal(content.products.length,2);
 assert.equal(policy.pages.filter(x=>x.kind==='example').length,2);
 for(const p of content.products){
  const html=await fs.readFile(path.join(root,'products',p.slug+'.html'),'utf8');
  for(const lang of ['en','zh']){
   const metadata=runtime.resolve({path:p.route,lang});
   assert.equal(metadata.title,p.title[lang]+' | Super Smile-Tech');
   assert.equal(metadata.description,p.metaDescription[lang]);
  }
  assert.ok(html.includes(`/assets/js/seo-policy.js?v=${EXAMPLE_SEO_POLICY_SCRIPT_VERSION}`));
  assert.ok(html.indexOf('/assets/js/seo-policy.js')<html.indexOf('/assets/js/main.js'));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  const schema=JSON.parse(html.match(/<script id="pe-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const product=schema['@graph'].find(x=>x['@type']==='Product');
  assert.equal(product.url,'https://supersmile-tech.com'+p.route);
  assert.equal(product.image,'https://supersmile-tech.com'+p.heroImage.src);
  for(const key of ['offers','sku','mpn','manufacturer','aggregateRating'])assert.equal(product[key],undefined);
  assert.doesNotMatch(html,/add.to.cart|checkout|buy.now|EX-custom|EX-cable|REFERENCE/i);
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
