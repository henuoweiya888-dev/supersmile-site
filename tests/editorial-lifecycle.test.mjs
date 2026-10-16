import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fixture,flush,root,articles} from './editorial-lifecycle-fixture.mjs';
test('a slow article response cannot finish after the newest selected language',async()=>{
 let release;const data=JSON.parse(fs.readFileSync(path.join(root,'content/product-category-drafts/micro-d-cable-assembly.json'),'utf8'));
 const f=fixture('micro-d-cable-assembly','pcc-rich-content','zh',async(url,count)=>{
  if(count===1)await new Promise(resolve=>{release=resolve;});
  return {ok:true,json:async()=>data};
 });
 f.load('micro-d-magazine');await flush();
 f.language('en');f.language('zh');f.language('en');f.overwrite();
 await flush();assert.equal(f.fetches(),1,'Do not start concurrent renders.');
 release();await flush();await flush();
 assert.equal(f.fetches(),1,'Reuse the one successful bilingual source for the newest render.');
 assert.match(f.host.innerHTML,/class="md-page"/);assert.doesNotMatch(f.host.innerHTML,/[\u3400-\u9fff]/);
});
test('a render failure stops until a new external event and can recover',async()=>{
 let fail=true;
 const f=fixture('micro-d-cable-assembly','pcc-rich-content','zh',async()=>{
  if(fail)throw Error('Temporary response failure');
  return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'content/product-category-drafts/micro-d-cable-assembly.json'),'utf8'))};
 });
 f.load('micro-d-magazine');await flush();await flush();
 assert.match(f.host.innerHTML,/md-error/);assert.equal(f.fetches(),1,'No repeated failure requests.');
 fail=false;f.language('en');await flush();
 assert.match(f.host.innerHTML,/class="md-page"/);assert.equal(f.fetches(),2);
});
test('an uncaught renderer failure creates one error message without a mutation loop',async()=>{
 const f=fixture('micro-d-cable-assembly','pcc-rich-content');let attempts=0;
 f.sandbox.SuperSmileEditorial.mount({host:f.host,rootClass:'owned-page',render:async()=>{attempts++;throw Error('Failed');}});
 await flush();await flush();assert.equal(attempts,1);assert.match(f.host.innerHTML,/editorial-load-error/);
 f.overwrite();await flush();await flush();assert.equal(attempts,2,'One fresh external replacement allows one new attempt.');
});
test('a generic replacement in the render completion microtask is restored',async()=>{
 const f=fixture('micro-d-cable-assembly','pcc-rich-content');let attempts=0;
 f.sandbox.SuperSmileEditorial.mount({host:f.host,rootClass:'owned-page',render:async()=>{
  attempts++;f.host.innerHTML='<div class="owned-page">Complete illustrated article</div>';
  if(attempts===1)queueMicrotask(()=>f.overwrite());
 }});
 await flush();await flush();
 assert.equal(attempts,2);assert.match(f.host.innerHTML,/owned-page/);
});

test('switching language reuses parsed bilingual data even if later requests would fail',async()=>{
 let fail=false;
 const data=JSON.parse(fs.readFileSync(path.join(root,'content/product-category-drafts/micro-d-cable-assembly.json'),'utf8'));
 const f=fixture('micro-d-cable-assembly','pcc-rich-content','zh',async()=>{
  if(fail)throw Error('Later network outage');return {ok:true,json:async()=>data};
 });
 f.load('micro-d-magazine');await flush();assert.match(f.host.innerHTML,/class="md-page"/);
 fail=true;f.language('en');f.overwrite();await flush();
 assert.equal(f.fetches(),1);assert.match(f.host.innerHTML,/class="md-page"/);
 assert.doesNotMatch(f.host.innerHTML,/[\u3400-\u9fff]/);
});

test('an article can render and switch language from embedded data without a network request',async()=>{
 const f=fixture('micro-d-cable-assembly','pcc-rich-content','zh',async()=>{throw Error('Network unavailable');});
 const embedded=f.nodes.get('editorial-page-data');
 embedded.dataset={source:'/content/product-category-drafts/micro-d-cable-assembly.json'};
 embedded.textContent=fs.readFileSync(path.join(root,'content/product-category-drafts/micro-d-cable-assembly.json'),'utf8');
 f.load('micro-d-magazine');await flush();assert.match(f.host.innerHTML,/class="md-page"/);
 f.language('en');f.overwrite();await flush();assert.match(f.host.innerHTML,/class="md-page"/);
 assert.doesNotMatch(f.host.innerHTML,/[\u3400-\u9fff]/);assert.equal(f.fetches(),0);
});
test('all dedicated articles ship complete matching bilingual data before their renderer',()=>{
 for(const [script,slug] of articles) {
  const html=fs.readFileSync(path.join(root,'products',slug+'.html'),'utf8');
  const blocks=[...html.matchAll(/<script type="application\/json" id="editorial-page-data" data-source="([^"]+)">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length,1,slug);
  assert.deepEqual(JSON.parse(blocks[0][2]),JSON.parse(fs.readFileSync(path.join(root,blocks[0][1]),'utf8')),slug);
  assert.ok(blocks[0].index<html.indexOf(script+'.js'),slug);
 }
});
