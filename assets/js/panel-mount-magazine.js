(() => {
  const host=document.getElementById('pcc-rich-content'); if(!host)return;
  const root='/assets/images/product-categories/stock/panel-mount/';
  const files={boundary:'opening.jpg',mounting:'mounting.jpg',sealing:'sealing.jpg',hardware:'hardware.jpg',gasket:'gasket.jpg',usb:'usb-c.jpg',video:'hdmi.jpg',ethernet:'ethernet.jpg',applications:'applications.jpg',power:'power.jpg',process:'process.jpg',testing:'testing.jpg'};
  const captions={
    boundary:['线端插头与面板插座的对照，直观展示设备边界的两侧。','A cable plug beside its panel receptacle directly shows both sides of an equipment boundary.'],
    mounting:['前后方向不同的面板插座展示安装侧、螺母与出线对配合的影响。','Panel sockets in different orientations illustrate the effect of mounting side, nut and cable exit on fit.'],
    sealing:['海岸风浪用于表达暴露环境；真正的防护等级需由完整接口试验证明。','Coastal spray represents environmental exposure; actual ingress protection requires testing of the complete interface.'],
    hardware:['设备内部的可维修排线展示后方操作空间与固定件同样重要。','A serviceable internal ribbon connection illustrates why rear access and retention matter.'],
    gasket:['不同几何的密封圈与垫片强调材料、尺寸与压缩叠层必须匹配。','Different seals emphasize that material, dimensions and compression stack must match.'],
    usb:['USB-C 插头近景用于区分外形与端到端功能。','A USB-C close-up separates connector form from end-to-end function.'],
    video:['HDMI 插头细节用于说明高速通道不能只凭接口名称判断。','An HDMI plug detail illustrates why a high-speed channel cannot be defined by the port name alone.'],
    ethernet:['开放的网络配线面板展示线对、屏蔽和后端路径属于同一链路。','An open network patch panel shows pairs, shielding and rear routing as one channel.'],
    applications:['滑翔机仪表面板展示紧凑空间中的多种面板接口。','A sailplane instrument panel shows multiple panel interfaces in a compact service envelope.'],
    power:['铜母排展示大电流路径的截面、接触与温升问题。','Copper busbars illustrate cross-section, contact and temperature-rise concerns in high-current paths.'],
    process:['裁线、剥线、压接与基础测试工具展示工艺需要受控配套。','Cutting, stripping, crimping and basic test tools illustrate a controlled process set.'],
    testing:['线缆测试仪用于说明方法、夹具与参考面必须随验收要求定义。','A cable analyzer illustrates why method, fixture and reference plane must follow the acceptance requirement.']
  };
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pick=(v,zh)=>typeof v==='string'?v:v[zh?'zh':'en']; const isZh=()=>new URLSearchParams(location.search).get('lang')!=='en';
  const photo=(t,zh,cls='')=>`<figure class="pm-photo ${cls}"><img src="${root}${files[t.id]}" alt="${esc(pick(t.title,zh))}" loading="lazy" decoding="async"><figcaption>${esc(captions[t.id][zh?0:1])}</figcaption></figure>`;
  const story=(t,zh,cls='')=>`<article class="pm-story ${cls}">${photo(t,zh)}<div class="pm-copy"><h3>${esc(pick(t.title,zh))}</h3><p>${esc(pick(t.copy,zh))}</p></div></article>`;
  const head=(n,k,t)=>`<header class="pm-header"><span>${n}</span><div><p>${esc(k)}</p><h2>${esc(t)}</h2></div></header>`;
  async function render(){
    try{
      const zh=isZh(),data=await fetch('/content/product-category-drafts/panel-mount-cable.json',{cache:'no-store'}).then(r=>r.json()),p=data.page,t=p.chapters;
      document.documentElement.lang=zh?'zh-CN':'en'; document.title=zh?'面板安装电缆组件定制｜USB-C、HDMI、RJ45 与隔板接口｜超斯迈尔':'Custom Panel-Mount Cable Assemblies | USB-C, HDMI, RJ45 & Bulkhead | Super Smile';
      document.querySelector('meta[name="description"]')?.setAttribute('content',zh?'定制面板安装与隔板电缆组件，覆盖前装、后装、锁紧螺母、法兰、O 形圈、USB-C、HDMI、RJ45、功率、密封与测试。':'Custom panel-mount and bulkhead cable assemblies covering front and rear mounting, jam nuts, flanges, O-rings, USB-C, HDMI, RJ45, power, sealing and testing.');
      const title=pick(p.displayTitle,zh); document.getElementById('pcc-title').textContent=title; document.getElementById('pcc-intro').textContent=pick(data.intro,zh); document.getElementById('pcc-eyebrow').textContent=zh?'产品小类 · 设备边界接口':'PRODUCT CATEGORY · EQUIPMENT INTERFACE'; document.getElementById('pcc-group').textContent=zh?'特色电缆组件':'Specialty Cable Assemblies'; document.getElementById('pcc-cta').textContent=zh?'咨询这一类产品':'Ask About This Product Type'; document.getElementById('pcc-back').textContent=zh?'返回产品中心':'Back to Products'; document.getElementById('pcc-closing-title').textContent=title; document.getElementById('pcc-closing-group').textContent=zh?'特色电缆组件':'Specialty Cable Assemblies'; document.getElementById('pcc-closing-cta').textContent=zh?'发送面板与接口资料':'Send Panel Details';
      const opening=`<section class="pm-opening"><div class="pm-opening-copy"><span>${zh?'一道面板，两个工作世界':'ONE PANEL, TWO WORKING SIDES'}</span><h2>${esc(pick(p.subtitle,zh))}</h2><p class="pm-lead">${esc(pick(p.lead,zh))}</p><h3>${esc(pick(t[0].title,zh))}</h3><p>${esc(pick(t[0].copy,zh))}</p><dl><div><dt>${zh?'外侧':'OUTSIDE'}</dt><dd>${zh?'对插、防护、操作':'Mating, protection, access'}</dd></div><div><dt>${zh?'壁面':'PANEL'}</dt><dd>${zh?'开孔、厚度、固定':'Cutout, thickness, mounting'}</dd></div><div><dt>${zh?'内侧':'INSIDE'}</dt><dd>${zh?'端接、出线、维修':'Termination, exit, service'}</dd></div></dl></div>${photo(t[0],zh,'pm-opening-photo')}</section>`;
      const nav=`<nav class="pm-nav" aria-label="${zh?'本页目录':'On this page'}"><a href="#pm-adv"><b>01</b>${zh?'安装与防护':'Mount & protect'}</a><a href="#pm-materials"><b>02</b>${zh?'五金与密封':'Hardware & seals'}</a><a href="#pm-data"><b>03</b>${zh?'数据接口':'Data interfaces'}</a><a href="#pm-use"><b>04</b>${zh?'应用与功率':'Use & power'}</a><a href="#pm-release"><b>05</b>${zh?'制造与放行':'Build & release'}</a></nav>`;
      const adv=`<section class="pm-section pm-adv" id="pm-adv">${head('01',zh?'面板安装优势':'PANEL-MOUNT ADVANTAGE',zh?'保持、防护与维修必须同时成立':'Retention, Protection and Service Must Work Together')}<div class="pm-adv-grid">${story(t[1],zh)}${story(t[2],zh)}${story(t[3],zh)}</div></section>`;
      const materials=`<section class="pm-section pm-materials" id="pm-materials">${head('02',zh?'安装材料与零件':'MOUNTING MATERIALS',zh?'小零件决定整个边界是否成立':'Small Parts Decide Whether the Boundary Works')}<div class="pm-material-grid">${story(t[4],zh)}<aside><strong>${zh?'图纸上不能缺少':'DO NOT OMIT FROM THE DRAWING'}</strong><ul>${p.inputs.slice(0,4).map(x=>`<li>${esc(pick(x,zh))}</li>`).join('')}</ul></aside></div></section>`;
      const dataSection=`<section class="pm-section pm-data" id="pm-data">${head('03',zh?'面板数据与显示接口':'PANEL DATA & DISPLAY',zh?'接头能插上，不等于通道已被验证':'Mating Is Not the Same as Channel Validation')}<div class="pm-data-grid">${story(t[5],zh)}${story(t[6],zh)}${story(t[7],zh)}</div></section>`;
      const use=`<section class="pm-section pm-use" id="pm-use">${head('04',zh?'行业与高功率工况':'APPLICATIONS & POWER DUTY',zh?'应用给出环境，计算给出边界':'Application Sets Context; Engineering Sets Limits')}<div class="pm-use-grid">${story(t[8],zh,'pm-use-main')}${story(t[9],zh,'pm-power')}</div></section>`;
      const release=`<section class="pm-section pm-release" id="pm-release">${head('05',zh?'制造、测试与追溯':'MANUFACTURE, TEST & TRACE',zh?'把首件确认转化为稳定重复生产':'Turn First-Article Approval Into Repeatable Production')}<div class="pm-release-grid">${story(t[10],zh)}${story(t[11],zh)}</div><ol class="pm-release-list">${p.inputs.map((x,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span>${esc(pick(x,zh))}</span></li>`).join('')}</ol></section>`;
      const faq=`<section class="pm-faq">${head('06',zh?'采购与工程共同确认':'PURCHASING + ENGINEERING',zh?'面板安装电缆常见问题':'Panel-Mount Cable Questions')}<div>${p.faq.map(x=>`<details><summary>${esc(pick(x.q,zh))}</summary><p>${esc(pick(x.a,zh))}</p></details>`).join('')}</div></section>`;
      const credits=`<details class="pm-credits"><summary>${zh?'图片来源与技术依据':'Photo sources and technical references'}</summary><p>${zh?'图片用于说明接口、安装、环境、材料或测试概念，不代表超斯迈尔产品实拍、指定 BOM 或成品认证。':'Images illustrate interface, installation, environment, materials or test concepts. They do not represent Super Smile product photography, a specified BOM or finished-product certification.'}</p><a href="${root}SOURCES.md" target="_blank" rel="noopener">${zh?'查看图片许可与技术来源':'View image licenses and technical sources'}</a></details>`;
      host.innerHTML=`<div class="pm-page">${opening}${nav}${adv}${materials}${dataSection}${use}${release}${faq}${credits}</div>`;
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');o.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -4%'});host.querySelectorAll('.pm-header,.pm-story').forEach(n=>o.observe(n));}
    }catch(e){host.innerHTML=`<p class="pm-error">${isZh()?'页面内容暂时无法载入，请刷新重试。':'This page could not load. Please refresh and try again.'}</p>`;}
  }
  render(); setTimeout(render,1400); setTimeout(render,3200);
})();
