import fs from 'node:fs';
import path from 'node:path';
import {runInNewContext} from 'node:vm';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const articles=[
 ['appliance-wire-editorial','appliance-wire-and-cable','awc-content','awc-page'],
 ['automotive-primary-wire-editorial','automotive-primary-wire','apw-content','apw-page'],
 ['can-bus-editorial','can-bus-cable','can-content','can-page'],
 ['coaxial-editorial','coaxial-cable','coax-content','coax-page'],
 ['coil-motion-editorial','spiral-coiled-cable','coil-content','coil-page'],
 ['emi-field-editorial','emi-shielded-cable-design','pcc-rich-content','ee-page'],
 ['equipment-wire-editorial','equipment-wire','eqw-content','eqw-page'],
 ['fine-pitch-magazine','32awg-fine-pitch-harness','pcc-rich-content','fp-page'],
 ['fpc-ffc-magazine','fpc-ffc-assembly','pcc-rich-content','ff-page'],
 ['ftdi-signal-editorial','ftdi-cable-assembly','pcc-rich-content','fe-page'],
 ['fuse-harness-magazine','littelfuse-bussmann-fuse-harness','pcc-rich-content','fh-page'],
 ['high-temperature-overmolding-editorial','high-temperature-overmolding','ht-content','ht-page'],
 ['idc-ribbon-magazine','idc-ribbon-cable-assembly','pcc-rich-content','idc-page'],
 ['low-pressure-molding-editorial','low-pressure-molding','lpm-content','lpm-page'],
 ['micro-d-magazine','micro-d-cable-assembly','pcc-rich-content','md-page'],
 ['panduit-magazine','panduit-compatible','pcc-rich-content','pa-page'],
 ['panel-mount-magazine','panel-mount-cable','pcc-rich-content','pm-page'],
 ['phoenix-magazine','phoenix-compatible','pcc-rich-content','ph-page'],
 ['ptfe-magazine','ptfe-cable-termination','pcc-rich-content','pte-page'],
 ['strain-relief-magazine','molded-strain-relief','pcc-rich-content','sr-page'],
 ['ultrasonic-splice-editorial','ultrasonic-welded-branch','pcc-rich-content','us-page'],
 ['waterproof-design-magazine','waterproof-design-harness','pcc-rich-content','wd-page']
];
export const flush=()=>new Promise(resolve=>setImmediate(resolve));
export function fixture(slug,hostId,initial='zh',fetchOverride) {
 const observers=new Set();
 function notify(target,type) {
  for(const observer of observers) if(observer.targets.some(x=>x.target===target&&x.options[type])) {
   if(observer.queued)continue;
   observer.queued=true;
   queueMicrotask(()=>{observer.queued=false;if(observers.has(observer))observer.callback([{target,type}]);});
  }
 }
 class MutationObserver {
  constructor(callback){this.callback=callback;this.targets=[];observers.add(this);}
  observe(target,options){this.targets.push({target,options});}
  disconnect(){observers.delete(this);}
 }
 function node() {
  let html='';
  const element={textContent:'',src:'',alt:'',href:'',querySelectorAll:()=>[],classList:{add(){}},setAttribute(name,value){this[name]=value;}};
  Object.defineProperty(element,'innerHTML',{get:()=>html,set(value){html=value;notify(element,'childList');}});
  Object.defineProperty(element,'firstElementChild',{get(){const classes=html.match(/^\s*<[^>]*class="([^"]*)"/)?.[1].split(/\s+/)||[];return {classList:{contains:cls=>classes.includes(cls)}};}});
  element.replaceChildren=child=>{element.innerHTML=`<p class="${child.className}">${child.textContent}</p>`;};
  return element;
 }
 const html=fs.readFileSync(path.join(root,'products',slug+'.html'),'utf8');
 const nodes=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],node()]));
 const host=nodes.get(hostId);host.innerHTML='<div class="generic-skeleton">Original generic article</div>';
 let lang=initial,fetches=0;
 const documentElement={};Object.defineProperty(documentElement,'lang',{get:()=>lang,set(value){lang=value;notify(documentElement,'attributes');}});
 const document={documentElement,getElementById:id=>nodes.get(id)||null,createElement:()=>node()};
 const location={search:'?lang='+lang};
 const sandbox={document,location,URLSearchParams,localStorage:{getItem:()=>lang},MutationObserver,
  queueMicrotask,matchMedia:()=>({matches:true}),navigator:{language:'en'},setTimeout,
  IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},
  fetch:async(url)=>{fetches++;if(fetchOverride)return fetchOverride(url,fetches);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))};}
 };
 sandbox.window=sandbox;
 runInNewContext(fs.readFileSync(path.join(root,'assets/js/editorial-lifecycle.js'),'utf8'),sandbox);
 return {host,nodes,html,sandbox,fetches:()=>fetches,
  load(script){runInNewContext(fs.readFileSync(path.join(root,'assets/js',script+'.js'),'utf8'),sandbox);},
  language(value){location.search='?lang='+value;documentElement.lang=value;},
  overwrite(){host.innerHTML='<section class="generic-skeleton"><h2></h2><img src="generic.jpg"></section>';}
 };
}
