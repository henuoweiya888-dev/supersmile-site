import crypto from 'node:crypto';
const stop=new Set('a an the and or for with from within into inside outside on at of to by in near between around through actual project application direction position location side end equipment module system unit internal external compact miniature small high density dense connection connector interface wiring wire cable lead adapter branch point device operation operating use service configuration support requirement installation select define record check review match control connection circuit signal power auxiliary existing detachable replacement'.split(' '));
const aliases={automotive:'vehicle',car:'vehicle',cars:'vehicle',vehicles:'vehicle',automated:'automation',automatic:'automation',robotics:'robot',robotic:'robot',robots:'robot',electronics:'electronic',actuators:'actuator',motors:'actuator',motor:'actuator',fans:'actuator',fan:'actuator',lcd:'display',displays:'display',screens:'display',screen:'display',headlamp:'light',headlight:'light',lamp:'light',lamps:'light',lighting:'light',lights:'light',controller:'controller',controllers:'controller',testing:'test',measurement:'test',measuring:'test',instrument:'test',instrumentation:'test',instruments:'test',oscilloscope:'test',photovoltaic:'energy',photovoltaics:'energy',solar:'energy',pv:'energy',conveyor:'handling',conveyors:'handling',logistics:'handling',diagnostics:'diagnostic',diagnosis:'diagnostic',scanner:'diagnostic',obd:'diagnostic',oximeter:'sensor',sensors:'sensor',relays:'relay',appliances:'appliance',ship:'marine',vessel:'marine',aircraft:'aviation',airframe:'aviation',aerospace:'aviation',battery:'battery',batteries:'battery',heating:'heat',heater:'heat',heated:'heat',hot:'heat',refrigeration:'cooling',cooling:'cooling',camera:'imaging',cameras:'imaging',video:'imaging',hmi:'display',hmis:'display'};
const weights={industrial:1,production:1,vehicle:4,engine:9,electronic:4,body:1,sensor:9,display:12,actuator:9,appliance:12,relay:12,panel:6,enclosure:5,light:12,cnc:15,test:14,energy:10,warehouse:9,handling:10,robot:10,diagnostic:12,port:3,bench:5,marine:12,battery:14,aviation:12,controller:10,heat:12,cooling:12,imaging:12,audio:12,antenna:12};
const termCache=new Map(),photoCache=new Map();
function terms(text){const key=String(text||'');if(termCache.has(key))return termCache.get(key);const result=new Set(key.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(t=>aliases[t]||((t.length>4&&!t.endsWith('ss')&&t.endsWith('s'))?t.slice(0,-1):t)).filter(t=>t.length>2&&!stop.has(t)));termCache.set(key,result);return result;}
function photoTerms(m){if(!photoCache.has(m.path))photoCache.set(m.path,terms([m.subjectEn,...(m.tags||[])].join(' ')));return photoCache.get(m.path);}
function score(app,m,seed,local){
 const wanted=terms(app.title.en),seen=new Set(photoTerms(m));
 const actual=[m.subjectEn,...(m.tags||[])].join(' ').toLowerCase();
 if(seen.has('display')&&!/lcd|screen|electronic display|display panel|monitor|instrument display|display module|hmi/.test(actual))seen.delete('display');
 if((wanted.has('panel')||wanted.has('enclosure'))&&seen.has('energy')&&!wanted.has('energy')){seen.delete('panel');seen.delete('enclosure');}
 if(/guitar|musical|orchestra|piano/.test(actual)&&!wanted.has('audio'))seen.delete('test');
 let titleScore=0;const matched=[];
 for(const token of wanted)if(seen.has(token)){titleScore+=weights[token]||5;matched.push(token);}
 // Generic "industrial" or "production" alone cannot establish a scene match.
 if(titleScore<4)return {value:0,matched};
 const jitter=parseInt(crypto.createHash('sha256').update(seed+m.path+app.title.en).digest('hex').slice(0,6),16)/0xffffff;
 return {value:titleScore*100+(local?2:0)+jitter,matched};
}
// Rectangular Hungarian assignment: six directions compete for all eligible photographs.
// Dummy columns permit text-only directions instead of forcing an unrelated photograph.
export function assignApplicationPhotos(applications,photos,{seenKeys=new Set(),seed='',localPaths=new Set(),overrides={},directionCandidates=null}={}){
 const unique=[];const keys=new Set(seenKeys);
 for(const m of photos){if((!directionCandidates&&m.contextOnly)||m.excludeFromProductExample)continue;const k=m.canonicalPhotoKey||m.visualIdentity||m.sha256||m.path;if(!keys.has(k)&&!seenKeys.has(m.sha256)){keys.add(k);unique.push(m);}}
 const matrix=applications.map((app,i)=>unique.map(m=>{
  if(directionCandidates){const rank=directionCandidates[i].findIndex(c=>c.path===m.path);return {value:rank<0?0:100000-rank*10+parseInt(crypto.createHash('sha256').update(seed+m.path+String(i)).digest('hex').slice(0,6),16)/0xffffff,matched:rank<0?[]:['reviewed-direction-candidate']};}
  const override=overrides[app.title.en];if(override===null)return {value:0,matched:[]};
  const s=score(app,m,seed,localPaths.has(m.path));if(override===m.path)return {value:100000+s.value,matched:['visually-reviewed-title-match']};return s;
 }));
 const n=applications.length,m=unique.length+n,u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
 const cost=(i,j)=>j<unique.length?-matrix[i][j].value:0;
 for(let i=1;i<=n;i++){
  p[0]=i;let j0=0;const min=Array(m+1).fill(Infinity),used=Array(m+1).fill(false);
  do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
   for(let j=1;j<=m;j++)if(!used[j]){const cur=cost(i0-1,j-1)-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}
   for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;
   j0=j1;
  }while(p[j0]!==0);
  do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
 }
 const picks=Array(n).fill(null);for(let j=1;j<=m;j++)if(p[j]&&j<=unique.length&&matrix[p[j]-1][j-1].value>0)picks[p[j]-1]={image:unique[j-1],score:matrix[p[j]-1][j-1].value,matchedTitleConcepts:matrix[p[j]-1][j-1].matched};
 if(directionCandidates&&picks.some(x=>!x))throw new Error('Application plan cannot provide six distinct photographs: '+seed);
 return picks.map((x,i)=>x?{...x,image:directionCandidates?(directionCandidates[i].find(c=>c.path===x.image.path)||x.image):x.image}:{image:null,reason:'No matching actual subject; keep this direction as text.'});
}
