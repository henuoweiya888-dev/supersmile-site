import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {assignApplicationPhotos} from './product_example_application_media.mjs';
import {validateExampleTopic} from './product_example_topic_validation.mjs';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const data=await read('content/product-example-inventory.json');
const pilots=await read('content/product-example-details.json');
const profiles={...await read('content/product-example-profiles-a.json'),...await read('content/product-example-profiles-b.json')};
const pools=await read('content/product-example-media-pools.json');
const visible=await read('content/product-example-visible-features.json');
const corrections=await read('content/product-example-content-corrections.json');
const applicationPlans=await read('content/product-example-application-plans.json');
const detailCrops=await read('content/product-example-detail-crops.json');
const topicOverrides=await read('content/product-example-topic-overrides.json');
const topicApplicationPlans=await read('content/product-example-application-overrides.json');
const categories=new Map(data.categories.map(c=>[c.id,c]));
const pair=(zh,en)=>({zh,en});
const featureRules=[
 [/braid|编织/i,pair('编织外层','Braided outer protection'),pair('编织层可用于束线与表面防磨；材料、覆盖长度和端部收口需结合安装路径确定。绝缘编织与金属屏蔽编织应分别定义。','A braid can organize the bundle and protect its surface. Define its material, coverage and end treatment around the routing path; distinguish insulating braid from metallic shielding.')],
 [/branch|分支|尾线|pigtail/i,pair('主干与分支','Trunk and branch layout'),pair('以设备固定点确定主干和各支路的尺寸基准，预留插拔、弯曲和维护空间，避免支路把拉力传递到端子。','Locate trunk and branch datums from equipment fixing points. Allow room for mating, bends and servicing so branches do not transfer installation loads to contacts.')],
 [/circular|圆形|\bm[5812][025]?\b|航空插/i,pair('圆形接口匹配','Circular mating interface'),pair('接口选型需核对系列、键位、针数、插合方向与锁紧方式；相近外形不能替代对插尺寸和接点定义。','Match the series, keying, contact count, mating direction and locking method. Similar shell outlines do not establish compatible dimensions or contact assignments.')],
 [/d-sub|db\d|micro-d|hd\d/i,pair('多针接口与出线','Multipin interface and exit'),pair('针位对应、螺钉或锁紧结构、后壳空间和出线方向需要一起审核，装配后应能够识别针位和电路版本。','Review contact mapping, screw or latch retention, backshell space and cable exit together. Keep contact positions and circuit revision identifiable after assembly.')],
 [/usb|hdmi|lvds|fakra|ethernet|rj45|coax|同轴|以太网/i,pair('信号路径','Signal path'),pair('在接口外形之外确认信号类型、线对分配、屏蔽连续性和端接方法；传输能力应按实际线材、长度及整机验证结果确定。','Define signal type, pair allocation, shield continuity and termination as well as the connector shape. Establish transmission performance from the actual cable, length and system validation.')],
 [/\bring\b|\blug\b|搭接|环形端子|环端|\bbattery\b|电池|电瓶/i,pair('载流与端部连接','Current path and end termination'),pair('依据持续与峰值负载、安装长度和温升要求选择导体与端接；端部接口、接触面、绝缘覆盖及固定方式需要成套确认；仅在采用环形端子时核对安装孔径。','Select conductors and terminations from continuous and peak loads, installed length and temperature rise. Confirm the end interface, contact surface, insulation coverage and fixing as a set; check mounting-bore size where ring terminals are specified.')],
 [/overmold|包胶|注塑|模制|molded/i,pair('包覆与应力消除','Molding and strain relief'),pair('包覆轮廓需兼顾接口插拔、弯曲空间和夹持位置。材料与成型工艺应与线材及连接器匹配，密封表现需另外验证。','Shape the molding around mating access, bend clearance and clamping. Match the material and process to the cable and connector; validate sealing separately.')],
 [/sealed|waterproof|防水|密封/i,pair('密封连接边界','Sealing boundary'),pair('将对插处、出线口、线间隙和装配接缝分别纳入密封设计；使用环境、装配状态和试验条件共同决定验收要求。','Treat the mating interface, cable exit, conductor gaps and assembly seams as separate sealing paths. Set acceptance criteria from the environment, assembly condition and test method.')],
 [/spiral|螺旋|弹簧/i,pair('伸缩与回弹空间','Extension and retraction'),pair('结合工作行程确认收缩长度、伸展长度、圈径和直线尾段；反复运动时还需审核回弹力、固定点与线材疲劳表现。','Define retracted and extended lengths, coil diameter and straight tails from the working stroke. Repeated motion also requires review of retraction force, fixing points and cable fatigue.')],
 [/ribbon|\bflat[- ](?:cable|wire|ribbon|flexible)|\bffc\b|\bfpc\b|排线|扁平(?:电缆|线|导体)/i,pair('排布与安装方向','Conductor layout and orientation'),pair('确认导体间距、排列顺序、弯折方向和插入面，避免翻转造成针位错误。扁平结构的固定与防磨需要结合设备空间安排。','Confirm conductor spacing, sequence, bend direction and insertion face to prevent reversed mapping. Plan fixing and abrasion protection around the available installation space.')],
 [/terminal block|端子排|端子台/i,pair('端子排接入','Terminal-block connection'),pair('核对端子编号、线径范围、剥线长度及紧固方法，并让标签与电路图保持对应，方便现场安装和故障排查。','Check terminal numbering, conductor range, strip length and tightening method. Match labels to the circuit drawing for installation and fault finding.')],
 [/relay|fuse|继电器|保险丝/i,pair('保护与控制回路','Protection and control circuits'),pair('先核对负载、控制逻辑、保护器件位置与维修可达性，再安排线径和分支。不能仅凭外壳形状判断保护额定或控制功能。','Define loads, control logic, protection-device positions and service access before conductor and branch selection. Housing shape alone does not establish ratings or control functions.')],
 [/shield|屏蔽|twisted|双绞/i,pair('线对与屏蔽端接','Pairs and shield termination'),pair('确认线对分配、屏蔽形式、接地路径和端接覆盖范围，避免屏蔽在分支或连接处意外中断。效果需在实际系统环境中验证。','Define pair allocation, shield construction, grounding path and termination coverage to avoid unintended breaks at branches or connections. Validate performance in the actual system.')],
 [/wire|cable|电线|线材|电缆/i,pair('导体与绝缘选配','Conductor and insulation selection'),pair('从电路负载、外径限制、弯曲方式与环境条件选择导体和绝缘体系；材料名称不应直接代替额定参数或验证结果。','Select conductors and insulation from circuit loads, diameter limits, bending and exposure. A material name does not replace ratings or validation results.')],
];
const slugify=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const canonicalRecords=data.records.filter(r=>r.canonicalId===r.exampleId);
const nameCounts=new Map();for(const r of canonicalRecords)for(const lang of ['En','Zh']){const k=lang+':'+r['name'+lang].toLowerCase();nameCounts.set(k,(nameCounts.get(k)||0)+1);}
const usedTitles={en:new Set(),zh:new Set()};const usedRoutes=new Set();
const products=[];const mediaPages={};
const assetSha=new Map();
async function sha(m){if(m.sha256)return m.sha256;if(!assetSha.has(m.path))assetSha.set(m.path,digest(await fs.readFile(path.join(root,m.path))));return assetSha.get(m.path);}
function compact(text,max){if(text.length<=max)return text;const words=text.slice(0,max+1).split(/\s+/);words.pop();return words.join(' ').replace(/[ ,;:\-]+$/,'');}
const pilotMediaKeys=new Set();
const routeById={};
const displayOverrides={
  'EX-cable-assembly-01-014':pair('四支路电源分配线束','4-Branch Power Distribution Harness'),
  'EX-cable-assembly-16-009':pair('双端密封RJ45连接电缆','Double-Ended Sealed RJ45 Connection Cable'),
  'EX-cable-assembly-16-010':pair('单端密封RJ45连接电缆','Single-Ended Sealed RJ45 Connection Cable'),
  'EX-cable-assembly-16-013':pair('RJ45设备连接电缆','RJ45 Equipment Connection Cable'),
  'EX-custom-harness-03-012':pair('面板安装机器人主线束','Panel-Mount Robot Main Harness'),
  'EX-custom-harness-03-018':pair('带接线盒的机器人主线束','Robot Main Harness with Junction Enclosure'),
  'EX-connector-systems-11-011':pair('金属后壳DB9转M12连接线束','DB9 to M12 Harness with Metal Backshell'),
  'EX-connector-systems-11-012':pair('模制后壳DB9转M12连接线束','DB9 to M12 Harness with Molded Backshell')
 };
for(const original of canonicalRecords){
 const r=displayOverrides[original.exampleId]?{...original,nameZh:displayOverrides[original.exampleId].zh,nameEn:displayOverrides[original.exampleId].en}:original;
 const pilot=pilots.products.find(p=>p.id===r.exampleId);
 const h=digest(r.exampleId).slice(0,7);
 const route=pilot?.route||'/products/'+slugify(r.nameEn).slice(0,87).replace(/-$/,'')+'-'+h;
 if(usedRoutes.has(route))throw new Error('Route collision '+route);usedRoutes.add(route);routeById[r.exampleId]=route;
 const cat=categories.get(r.categoryId),profile=profiles[r.categoryId];
 const appPlan=topicApplicationPlans[r.exampleId]||applicationPlans.exampleOverrides?.[r.exampleId]||applicationPlans.categories[r.categoryId];if(!appPlan||appPlan.directions.length!==6)throw new Error('Missing reviewed application plan '+r.exampleId);validateExampleTopic(r,topicOverrides[r.exampleId],appPlan);if(!profile)throw new Error('Missing profile '+r.categoryId);
 if(profile.applicationTopics.length<6)throw new Error('Need six application directions: '+r.categoryId);
 const index=r.displayOrder-1;
 const isMaterial=r.groupId==='wire-cable'&&!/harness|assembly|connector|plug|线束|组件|接头|插头/i.test(r.nameEn+' '+r.nameZh);
 const displayCategory=topicOverrides[r.exampleId]?.category||pair(cat.nameZh,cat.nameEn);
 const title=pilot?.title||topicOverrides[r.exampleId]?.title||displayOverrides[r.exampleId]||pair(r.nameZh,r.nameEn);
 const seoTitle={};
 for(const lang of ['en','zh']){
  const base=title[lang];const dup=nameCounts.get((lang==='en'?'En':'Zh')+':'+r['name'+(lang==='en'?'En':'Zh')].toLowerCase())>1;
  let topic=dup?(lang==='en'?compact(base,42)+' · '+compact(displayCategory.en,17):base+' · '+displayCategory.zh):base;
  if(lang==='en')topic=compact(topic,61);
  let n=1;const original=topic;while(usedTitles[lang].has(topic)){n++;topic=compact(original,lang==='en'?55:150)+' · '+(lang==='en'?'Design ':'结构 ')+n;}
  usedTitles[lang].add(topic);seoTitle[lang]=topic+' | Super Smile-Tech';
 }
 const selected=featureRules.filter(([test])=>test.test(r.nameEn+' '+r.nameZh)).slice(0,3).map(([,title,text])=>({title,text}));
 const criteria=(profile.avoidMisidentification||[]).slice(0,2).map((text,i)=>({title:pair(i?'安装与验收':'接口与功能确认',i?'Installation and acceptance':'Interface and function review'),text}));
 const specific=visible[r.exampleId]?.features||[];
 const structure=[...specific,...selected,...criteria].filter((x,i,a)=>a.findIndex(y=>y.title.en===x.title.en)===i).slice(0,5);
 if(structure.length<3)structure.push({title:pair('制造依据','Manufacturing reference'),text:pair('确认图纸、连接关系、尺寸基准和样品版本后再制作，减少试装与重复生产中的差异。','Confirm drawings, circuit mapping, dimensional datums and sample revision before manufacture to control fit checks and repeat production.')});
 const metaDescription=pair(`${seoTitle.zh.split(' | ')[0]}：${cat.nameZh}的接口、结构选配与应用方向。中国工厂提供定制线束制造与 OEM/ODM 项目支持。`,`${seoTitle.en.split(' | ')[0]}: interfaces, configuration and application planning. Custom wire harness manufacturing from our China factory, with OEM/ODM support.`);
 const manufacturing={title:pair('中国工厂 · 定制线束制造','Custom wire harness manufacturing in China'),text:pair(`Super Smile-Tech 中国工厂围绕${cat.nameZh}的项目需求提供定制线束制造与 OEM/ODM 支持。我们从接口、电路与安装资料开始，协同物料选配、样品制作和制造文件确认，再按批准要求组织重复生产。`,`Our China factory supports ${cat.nameEn.toLowerCase()} projects through custom wire harness manufacturing and OEM/ODM development. Interface, circuit and installation data guide material selection, sample builds and manufacturing-document approval before repeat production.`)};
 const p={...(pilot||{}),id:r.exampleId,slug:route.split('/').pop(),route,categoryId:r.categoryId,categoryRoute:new URL(cat.pageUrl).pathname,group:pair(r.groupNameZh,r.groupNameEn),category:displayCategory,title,seoTitle,
  lede:pilot?.lede||(specific.length?pair(`${r.nameZh}的结构重点包括${specific.slice(0,3).map(x=>x.title.zh).join('、')}。接口、电路与安装资料将作为尺寸、物料和样品制作的确认依据。`,`${r.nameEn} combines ${specific.slice(0,3).map(x=>x.title.en.toLowerCase()).join(', ')}. Interface, circuit and installation data guide dimensions, material selection and sample review.`):isMaterial?pair(`${r.nameZh}可结合电路负载、敷设方式与环境要求进行选配。${specific[0]?.text.zh||profile.introVariants[index%profile.introVariants.length].zh}`,`${r.nameEn} can be selected around circuit loads, routing and exposure. ${specific[0]?.text.en||profile.introVariants[index%profile.introVariants.length].en}`):pair(`${r.nameZh}可围绕设备接口与安装路径进行配置。${specific[0]?.text.zh||profile.introVariants[index%profile.introVariants.length].zh}`,`${r.nameEn} can be configured around equipment interfaces and routing. ${specific[0]?.text.en||profile.introVariants[index%profile.introVariants.length].en}`)),
  heroImage:{src:r.src,dimensions:[r.publishedImageSize.width,r.publishedImageSize.height],alt:title},
  quickPoints:pilot?.quickPoints||(specific.length>=3?specific.slice(0,3).map(x=>x.title):isMaterial?[pair('导体与绝缘结构选配','Conductor and insulation selection'),pair('敷设与温度条件审核','Routing and temperature review'),pair('材料文件与样品确认','Material documents and sample approval')]:[pair('接口与回路对应审核','Interface and circuit review'),pair('线长与安装结构定制','Length and installation configuration'),pair('样品确认后组织制造','Manufacture from approved sample')]),
  structureIntro:pilot?.structureIntro||pair(`以${r.nameZh}的结构形式为起点，结合图纸和实际设备确认以下设计要点。`,`Use the ${r.nameEn.toLowerCase()} form as a starting point and confirm these design points against drawings and the actual equipment.`),
  structure:pilot?.structure||corrections[r.exampleId]?.structure||structure,
  applications:appPlan.directions.map(({title,text},i)=>{
   const app={title,text};
   if(app.text.en.split(/\s+/).length>=27)return app;
   const focus=profile.configuration[i%4].value;
   return {...app,text:pair(app.text.zh+'选配时，'+focus.zh,app.text.en+' '+focus.en)};
  }),
  applicationsIntro:pair('以下为可讨论的连接方向。实际适用性取决于接口、电路、安装环境和项目验证，可按设备需求调整。','These are connection directions for project discussion. Suitability depends on interfaces, circuits, installation conditions and project validation; configuration can be adapted to the equipment.'),
  configuration:pilot?.configuration||profile.configuration,
  customization:pilot?.customization||profile.customization,faq:pilot?.faq||profile.faq,manufacturing,
  cta:pilot?.cta||{title:pair('从您的接口与安装需求开始','Start with your interface and installation requirements'),text:isMaterial?pair(`提供${r.nameZh}的线材规范、导体截面、绝缘与护套要求、敷设工况及目标用量，我们据此梳理材料选配与样品确认事项。`,`Share cable specifications, conductor size, insulation and jacket requirements, installation conditions and target quantity for ${r.nameEn.toLowerCase()}. These guide material selection and sample review.`):pair(`提供${r.nameZh}的对插接口、回路表、目标长度或参考样品，我们据此梳理选配与样品确认事项。`,`Share mating interfaces, a circuit table, target lengths or a sample for the ${r.nameEn.toLowerCase()}. We can use them to review configuration and sample requirements.`),button:pair('沟通定制需求','Discuss project requirements'),href:'/contact?category='+r.categoryId},
  metaDescription,layoutType:profile.layoutType||'assembly-layout'};
 if(topicOverrides[r.exampleId]){Object.assign(p,topicOverrides[r.exampleId]);p.metaDescription=topicOverrides[r.exampleId].metaDescription||pair(`${p.seoTitle.zh.split(' | ')[0]}：接口、安装路径与项目确认事项。中国工厂提供定制线束制造及 OEM/ODM 项目评审支持。`,`${p.seoTitle.en.split(' | ')[0]}: interfaces, routing and project review. Our China factory supports custom wire harness manufacturing and OEM/ODM development.`);}
 const pool=pools.categories[r.categoryId];if(!pool)throw new Error('Missing media pool '+r.categoryId);
 const seen=new Set([await sha({path:r.src}),...(pilot?pilotMediaKeys:[])]);
 const choose=async(role,n,context='')=>{
  const list=[...(pool.roles[role]||[])];
  const scored=list.map(m=>({m,score:(m.categoryMatch==='direct-category'?20:0)+String(m.subjectContext||'').toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>3&&context.toLowerCase().includes(t)).length*4,tie:parseInt(digest(r.exampleId+m.path).slice(0,8),16)})).sort((a,b)=>b.score-a.score||a.tie-b.tie);
  const result=[];for(const {m} of scored){const h=await sha(m);if(seen.has(h))continue;seen.add(h);result.push({...m,altEn:m.altEn||m.subjectContext||cat.nameEn,altZh:m.altZh||cat.nameZh+'相关结构与场景'});if(result.length>=n)break;}return result;
 };
 const directionCandidates=appPlan.directions.map(d=>d.candidates);
 const assigned=assignApplicationPhotos(p.applications,directionCandidates.flat(),{seenKeys:seen,seed:r.exampleId,directionCandidates});
 const appImages=assigned.map(x=>x.image);
 for(const photo of appImages){seen.add(await sha(photo));seen.add(photo.canonicalPhotoKey||photo.visualIdentity||photo.path);}
 const constructionDetail=detailCrops.products[r.exampleId];
 if(!constructionDetail||(!constructionDetail.crops.length&&!constructionDetail.omissionReason)||constructionDetail.path!==r.src)throw new Error('Missing product-specific close-up '+r.exampleId);
 const engineering=(await choose('engineering',1))[0]||null;
 const inspection=(await choose('inspection',1))[0]||null;
 if(pilot)for(const m of [...appImages,engineering,inspection])if(m){pilotMediaKeys.add(await sha(m));pilotMediaKeys.add(m.canonicalPhotoKey||m.visualIdentity||m.path);}
 mediaPages[p.id]={constructionDetail,applicationImages:appImages,engineering,inspection};products.push(p);
}
const entries=data.records.map(r=>({id:r.exampleId,categoryId:r.categoryId,sourceIndex:r.sourceIndex,src:r.src,route:routeById[r.canonicalId]}));
const registry={schemaVersion:'2.0',products:products.map(({id,slug,route,categoryId,categoryRoute,title,seoTitle,metaDescription})=>({id,slug,route,categoryId,categoryRoute,title,seoTitle,metaDescription})),entries};
await fs.writeFile(path.join(root,'content/product-example-registry.json'),JSON.stringify(registry,null,2)+'\n');
await fs.mkdir(path.join(root,'.product-example-scale-qa'),{recursive:true});
await fs.writeFile(path.join(root,'.product-example-scale-qa/compiled-content.json'),JSON.stringify({sharedCopy:pilots.sharedCopy,products}));
await fs.writeFile(path.join(root,'.product-example-scale-qa/compiled-media.json'),JSON.stringify({pages:mediaPages}));
console.log(JSON.stringify({pages:products.length,entries:entries.length,categories:Object.keys(profiles).length,applicationDirections:products.reduce((s,p)=>s+p.applications.length,0),mediaCounts:Object.values(mediaPages).reduce((s,m)=>{s.photographs+=1+[...m.applicationImages,m.engineering,m.inspection].filter(Boolean).length;s.textOnlyApplicationDirections+=m.applicationImages.filter(x=>!x).length;return s},{photographs:0,textOnlyApplicationDirections:0})}));
