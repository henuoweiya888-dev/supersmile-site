import test from 'node:test';
import assert from 'node:assert/strict';
import {articles,fixture,flush} from './editorial-lifecycle-fixture.mjs';
for(const [script,slug,hostId,className] of articles) {
 test(`${slug} preserves its illustrated article through language switches and a late generic replacement`,async()=>{
  const f=fixture(slug,hostId);
  assert.ok(f.html.indexOf('editorial-lifecycle.js')<f.html.indexOf(script+'.js'),'The lifecycle helper must load before the renderer.');
  f.load(script);await flush();
  function intact(){
   assert.match(f.host.innerHTML,new RegExp(`class="${className}"`));
   assert.doesNotMatch(f.host.innerHTML,/暂时无法载入|could not load/i);
   assert.ok((f.host.innerHTML.match(/<img\b/g)||[]).length>=8,'Keep the illustrated sections.');
   assert.doesNotMatch(f.host.innerHTML,/<h[23][^>]*>\s*<\/h[23]>/,'No empty chapter titles.');
  }
  intact();const zh=f.host.innerHTML;const firstFetches=f.fetches();
  await flush();assert.equal(f.fetches(),firstFetches,'An owned article must not trigger itself again.');
  f.language('en');f.overwrite();await flush();intact();const en=f.host.innerHTML;
  assert.notEqual(en,zh,'The article copy must change language.');
  assert.doesNotMatch(en,/[\u3400-\u9fff]/,'English article copy should be English.');
  f.overwrite();await flush();intact();assert.equal(f.host.innerHTML,en,'Restore a late shared-renderer overwrite.');
  f.language('zh');f.overwrite();await flush();intact();assert.equal(f.host.innerHTML,zh);
  const finalFetches=f.fetches();await flush();assert.equal(f.fetches(),finalFetches,'Settled rendering must stop.');
 });
}
