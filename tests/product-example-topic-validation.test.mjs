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
test('contact temperature applications reject photographs of non-contact infrared thermometers',()=>{
 const record={exampleId:'EX-temperature-test',categoryId:'specialty-03',nameEn:'Pt100 RTD probe harness'};
 const apps=Array.from({length:6},(_,i)=>({title:{en:'RTD sensing point '+i,zh:'温阻测点 '+i},text:{en:'Define contact sensing and lead routing.',zh:'确认接触测温与引线路径。'}}));
 const topic={configuration:Array(6).fill({}),applications:apps,faq:Array(3).fill({})};
 const plan={directions:apps.map(app=>({...structuredClone(app),candidates:[{path:'/photos/heating-chamber.jpg',actualSubject:{en:'An oven heating chamber',zh:'烤箱加热腔体'}}]}))};
 assert.doesNotThrow(()=>validateExampleTopic(record,topic,plan));
 plan.directions[2].candidates=[{path:'/photos/infrared-tool.jpg',actualSubject:{en:'A handheld infrared thermometer',zh:'手持红外测温仪'}}];
 assert.throws(()=>validateExampleTopic(record,topic,plan),/cannot illustrate a contact temperature sensor/);
 plan.directions[2].candidates=[{path:'/assets/images/product-categories/stock/high-temperature-wire-and-cable/thermal-check.jpg',altEn:'Heated surface'}];
 assert.throws(()=>validateExampleTopic(record,topic,plan),/cannot illustrate a contact temperature sensor/);
});
test('known optical and storage photographs cannot stand in for copper or USB interfaces',()=>{
 const opticalPhoto={path:'/assets/images/product-categories/stock/shielded-twisted-pair/pair-ports.jpg'};
 const apps=Array.from({length:6},(_,i)=>({title:{en:'Rack connections '+i,zh:'机架连接 '+i},text:{en:'Define equipment ports and the routing space.',zh:'确认设备端口和走线路径。'}}));
 const topic={configuration:Array(6).fill({}),applications:apps,faq:Array(3).fill({})};
 const plan={directions:apps.map(app=>({...structuredClone(app),candidates:[opticalPhoto]}))};
 assert.throws(()=>validateExampleTopic({exampleId:'EX-copper',categoryId:'cable-assembly-16',nameEn:'RJ45 Ethernet cable'},undefined,plan),/cannot illustrate a copper network interface/);
 assert.doesNotThrow(()=>validateExampleTopic({exampleId:'EX-optical',categoryId:'connector-systems-13',nameEn:'LC Fiber cable'},topic,plan));
 const usbPlan={directions:[{title:{en:'USB interface',zh:'USB接口'},candidates:[{path:'/assets/images/product-categories/stock/power/data-centre-equipment-pexels.jpg'}]}]};
 assert.throws(()=>validateExampleTopic({exampleId:'EX-usb',categoryId:'cable-assembly-06',nameEn:'USB cable'},undefined,usbPlan),/cannot illustrate a USB interface with a SAS drive-bay/);
});
