// Run an explicitly selected category against local or public hosting.
const {chromium}=require('playwright');
const [slug,base='http://127.0.0.1:8770',widths='1280,390,320']=process.argv.slice(2);
if(!slug)throw new Error('Expected a category slug');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',...(base.startsWith('https:')?{proxy:{server:'http://127.0.0.1:7897'}}:{})});
 let failed=false;
 for(const width of widths.split(',').map(Number))for(const lang of ['en','zh']){
  const page=await browser.newPage({viewport:{width,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/products/'+slug+'?lang='+lang+'&qa=published-'+Date.now(),{waitUntil:'networkidle',timeout:60000});
   await page.locator('.te-topic').first().waitFor({timeout:15000});
   await page.evaluate(async()=>{for(const img of document.querySelectorAll('img[loading="lazy"]'))img.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
   const result=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,chapters:document.querySelectorAll('.te-topic').length,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.querySelectorAll('.pcc-main img')].filter(i=>!i.naturalWidth).map(i=>i.src),header:getComputedStyle(document.querySelector('.header')).position,cta:document.querySelector('#pcc-cta')?.href,back:document.querySelector('#pcc-back')?.href,figures:[...document.querySelectorAll('.te-photo')].map(e=>{const r=e.getBoundingClientRect();return{left:Math.round(r.left),right:Math.round(r.right)}})}));
   const badEdges=result.figures.some(f=>width<768?Math.abs(f.left)>1||Math.abs(f.right-width)>1:Math.abs(f.left)>1&&Math.abs(f.right-width)>1);
   const details=page.locator('.pcc-rich-faq details').nth(1);await details.locator('summary').click();result.faqOpens=await details.getAttribute('open')!==null;
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:'/tmp/'+slug+'-'+(base.startsWith('https:')?'public':'local')+'-'+width+'-'+lang+'.png',fullPage:true});
   result.errors=errors;result.badEdges=badEdges;failed ||=result.overflow||result.broken.length>0||errors.length>0||badEdges||!result.faqOpens||result.header!=='fixed';
   console.log(JSON.stringify({width,lang,...result}));
  }catch(e){failed=true;console.log(JSON.stringify({width,lang,error:e.message}));}
  await page.close();
 }
 await browser.close();if(failed)process.exitCode=1;
})();
