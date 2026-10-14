/* Product-specific topics are required where a category spans incompatible interfaces. */
export function requiredExampleTopic(record){
 const title=[record.nameEn,record.nameZh,record.title?.en,record.title?.zh].filter(Boolean).join(' '),category=record.categoryId;
 if(/光纤|\boptical\b|\bfiber\b/i.test(title)&&!/fiberglass|glass fiber|玻璃纤维/i.test(title))return 'optical or mixed optical/electrical connection';
 if(/thermocouple|热电偶|热电阻|pt100|\brtd\b/i.test(title))return 'temperature measurement circuit';
 if(category==='connector-systems-13')return 'copper or optical network interface';
 if(category==='connector-systems-12'&&/\bm12\b/i.test(title))return 'circular interface, separate from terminal-block systems';
 if(category==='connector-systems-16'&&/rj45|\bix\b|\bm12\b/i.test(title))return 'data interface, separate from heavy-duty modular frames';
 if(category==='cable-assembly-10'&&/\bedp\b/i.test(title))return 'eDP display interface, separate from LVDS';
 if(category==='automotive-10'&&/cigarette|lighter|\bsae\b|点烟器/i.test(title))return 'auxiliary power or battery maintenance, separate from starter-current connections';
 if(category==='cable-assembly-15'&&/\bsae\b|dc circular|DC圆孔/i.test(title))return 'low-voltage auxiliary connection, separate from a PV string lead';
 if(category==='wire-cable-10'&&/poe|rj45/i.test(title))return 'copper data or PoE interface';
 return null;
}
export function validateExampleTopic(record,topic,applicationPlan){
 const name=[record.nameEn,record.nameZh,record.title?.en,record.title?.zh].filter(Boolean).join(' ');
 const optical=/光纤|\boptical\b|\bfiber\b/i.test(name);
 const copperOnly=!optical&&(/RJ45|Ethernet|以太网|双绞线/i.test(name)||record.categoryId==='cable-assembly-16'||(record.categoryId==='connector-systems-16'&&/\bIX\b|\bM12\b/i.test(name)));
 for(const [i,direction]of(applicationPlan?.directions||[]).entries())for(const photo of direction.candidates||[]){
  if(copperOnly&&photo.path==='/assets/images/product-categories/stock/shielded-twisted-pair/pair-ports.jpg')throw new Error(`${record.exampleId||record.id} application ${i} cannot illustrate a copper network interface with the reviewed LC optical/SFP photograph`);
  if(/USB/i.test([direction.title?.en,direction.title?.zh].join(' '))&&photo.path==='/assets/images/product-categories/stock/power/data-centre-equipment-pexels.jpg')throw new Error(`${record.exampleId||record.id} application ${i} cannot illustrate a USB interface with a SAS drive-bay photograph`);
 }
 const reason=requiredExampleTopic(record);if(!reason)return;
 if(!topic||topic.configuration?.length<6||topic.applications?.length!==6||topic.faq?.length<3||applicationPlan?.directions?.length!==6)throw new Error(`${record.exampleId||record.id} needs a complete reviewed product topic for ${reason}`);
 for(let i=0;i<6;i++)for(const language of ['zh','en'])if(topic.applications[i].title[language]!==applicationPlan.directions[i].title[language]||topic.applications[i].text[language]!==applicationPlan.directions[i].text[language])throw new Error(`${record.exampleId||record.id} application ${i} copy and photography plan disagree`);
 if(reason==='temperature measurement circuit')for(const [i,direction]of applicationPlan.directions.entries()){
  const copy=[direction.title?.en,direction.title?.zh,direction.text?.en,direction.text?.zh].join(' ');
  if(!/\bRTD\b|\bPt100\b|thermocouple|contact sensing|接触测温|温阻|热电阻|热电偶/i.test(copy))continue;
  for(const photo of direction.candidates||[]){
   const subject=[photo.actualSubject?.en,photo.actualSubject?.zh,photo.altEn,photo.altZh].join(' ');
   if(/infrared thermometer|红外测温/i.test(subject)||photo.path==='/assets/images/product-categories/stock/high-temperature-wire-and-cable/thermal-check.jpg')throw new Error(`${record.exampleId||record.id} application ${i} cannot illustrate a contact temperature sensor with a non-contact infrared thermometer`);
  }
 }
}
