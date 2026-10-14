import assert from 'node:assert/strict';
import test from 'node:test';
import {assignApplicationPhotos} from '../tools/product_example_application_media.mjs';
const app=en=>({title:{en}});
const photo=(path,tags,key=path)=>({path,subjectEn:tags.join(' '),tags,canonicalPhotoKey:key,sha256:key});
test('a broad automation direction cannot consume the only photograph matching the CNC direction',()=>{
 const cnc=photo('/cnc.jpg',['industrial automation','CNC machine']);
 const robot=photo('/robot.jpg',['industrial automation','robot arm']);
 const result=assignApplicationPhotos([app('Industrial automation'),app('Machine tools & CNC')],[cnc,robot]);
 assert.equal(result[0].image.path,'/robot.jpg');assert.equal(result[1].image.path,'/cnc.jpg');
});
test('unrelated cabinet photos and industrial-only words do not force a vehicle photograph',()=>{
 const cabinet=photo('/cabinet.jpg',['industrial production','control cabinet']);
 assert.equal(assignApplicationPhotos([app('Vehicle equipment pigtails')],[cabinet])[0].image,null);
 assert.equal(assignApplicationPhotos([app('Industrial equipment')],[cabinet])[0].image,null);
});
test('different encodings of a single scene and photographs already used on the page remain one identity',()=>{
 const a=photo('/a.jpg',['diagnostic scan tool'],'same-scene');
 const b=photo('/b.jpg',['diagnostic scan tool'],'same-scene');
 const result=assignApplicationPhotos([app('Vehicle diagnostics'),app('Bench diagnostic links')],[a,b]);
 assert.equal(result.filter(x=>x.image).length,1);
 assert.equal(assignApplicationPhotos([app('Vehicle diagnostics')],[a],{seenKeys:new Set(['same-scene'])})[0].image,null);
});

test('engine display stands and photovoltaic panels do not masquerade as electronic displays or enclosure panels',()=>{
 const engine=photo('/engine.jpg',['engine on display stand','vehicle powertrain']);
 const solar=photo('/solar.jpg',['solar photovoltaic panel installation']);
 assert.equal(assignApplicationPhotos([app('Miniature display-board connections')],[engine])[0].image,null);
 assert.equal(assignApplicationPhotos([app('Enclosure through-panel connections')],[solar])[0].image,null);
});

test('reviewed direction plans use a global distinct assignment and fail instead of leaving a blank image',()=>{
 const a=photo('/a.jpg',['cabinet'],'a'),b=photo('/b.jpg',['sensor'],'b');a.contextOnly=true;
 const directions=[[a,b],[a]],applications=[app('Equipment enclosure'),app('Removable interface')];
 const picks=assignApplicationPhotos(applications,[a,b],{directionCandidates:directions});
 assert.deepEqual(picks.map(x=>x.image.path),['/b.jpg','/a.jpg']);
 assert.throws(()=>assignApplicationPhotos(applications,[a],{directionCandidates:[[a],[a]]}),/cannot provide six distinct/);
});
