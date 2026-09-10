const {chromium}=require('playwright');
const [slug,key,base='http://127.0.0.1:8770']=process.argv.slice(2);
if(!slug||!key)throw new Error('Expected slug and category key');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',...(base.startsWith('https:')?{proxy:{server:'http://127.0.0.1:7897'}}:{})});
 let failed=false;
 for(const width of [1280,390]){
  const page=await browser.newPage({viewport:{width,height:844}});
  try{
   await page.goto(base+'/products/'+slug+'?lang=zh&qa=nav-'+Date.now(),{waitUntil:'networkidle',timeout:60000});
   await page.locator('#product-mega .product-mega-group').first().waitFor({state:'attached'});
   if(width>=1081)await page.locator('.nav-products-entry').hover();
   else{await page.locator('.nav-toggle').click();await page.locator('.product-mega-toggle').click();}
   await page.locator('#product-mega').waitFor({state:'visible'});
   const result=await page.evaluate(key=>{
    const menu=document.querySelector('#product-mega');
    const live=[...menu.querySelectorAll('a[data-category-key]')];
    const target=live.find(e=>e.dataset.categoryKey===key);
    return{groups:menu.querySelectorAll('.product-mega-group').length,active:live.length,pending:menu.querySelectorAll('.is-pending').length,target:target?.getAttribute('href'),pendingLinks:menu.querySelectorAll('a.is-pending').length,expanded:document.querySelector('.product-mega-toggle')?.getAttribute('aria-expanded'),breadcrumb:document.querySelector('#pcc-group')?.textContent};
   },key);
   failed ||= result.groups!==6||!result.target?.includes(slug)||result.pendingLinks!==0||result.expanded!=='true';
   console.log(JSON.stringify({width,...result}));
  }catch(e){failed=true;console.log(JSON.stringify({width,error:e.message}));}
  await page.close();
 }
 await browser.close();if(failed)process.exitCode=1;
})();
