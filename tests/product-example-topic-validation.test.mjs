import assert from 'node:assert/strict';import test from 'node:test';import {requiredExampleTopic,validateExampleTopic} from '../tools/product_example_topic_validation.mjs';
test('incompatible optical, thermal, display and auxiliary interfaces cannot fall back to a broad category topic',()=>{
 for(const [categoryId,nameEn]of [['connector-systems-13','MPO to LC Fiber Trunk'],['specialty-03','K-Type Thermocouple'],['cable-assembly-10','eDP Display Cable'],['automotive-10','Cigarette Lighter to Battery Clamps'],['cable-assembly-15','XT60 to SAE Cable'],['connector-systems-12','M12 Circular Cable'],['connector-systems-16','IX Data Cable']]){const r={exampleId:'EX-test',categoryId,nameEn};assert.ok(requiredExampleTopic(r),nameEn);assert.throws(()=>validateExampleTopic(r,null,null),/needs a complete reviewed product topic/);}
 assert.equal(requiredExampleTopic({categoryId:'wire-cable-18',nameEn:'Fiberglass Insulated Wire'}),null);
 assert.equal(requiredExampleTopic({categoryId:'cable-assembly-02',nameEn:'M12 Circular Connector Cable'}),null);
});
test('a reviewed topic needs six applications in the same order as its imagery plan',()=>{
 const r={exampleId:'EX-test',categoryId:'connector-systems-13',nameEn:'RJ45 Network Harness'},apps=Array.from({length:6},(_,i)=>({title:{en:'Direction '+i,zh:'方向 '+i},text:{en:'Equipment interface '+i,zh:'设备接口 '+i}}));
 const topic={configuration:Array(6).fill({}),applications:apps,faq:Array(3).fill({})},plan={directions:structuredClone(apps)};
 assert.doesNotThrow(()=>validateExampleTopic(r,topic,plan));plan.directions.reverse();assert.throws(()=>validateExampleTopic(r,topic,plan),/copy and photography plan disagree/);
});
