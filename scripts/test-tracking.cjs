const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/kuaiy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'visit-log.js'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
 const results=[];
 for(const pathname of ['/slides/','/slides/ai/survival/','/slides/ai/survival/student/','/slides/ai/survival/teacher/','/slides/ai/survival-202608/','/slides/physio/cardiovascular/','/slides/physio/cardiovascular/deck.html','/slides/future/deep/page.html']){
  const context=await browser.newContext(),page=await context.newPage(),events=[];
  await page.route('**/*',async route=>{
   if(route.request().url().endsWith('/api/visit')){events.push(route.request().postDataJSON());await route.fulfill({status:200,body:'{"ok":true}'});}
   else await route.fulfill({contentType:'text/html',body:'<!doctype html><title>Slides test</title><body><button id="next">Next</button></body>'});
  });
  await page.goto('https://slides.test'+pathname);
  await page.addScriptTag({content:code});await page.waitForTimeout(100);
  await page.addScriptTag({content:code});await page.waitForTimeout(100);
  assert.equal(events.filter(e=>e.eventType==='pageview').length,1,'duplicate script');
  await page.evaluate(()=>location.hash='s2');await page.waitForTimeout(100);
  await page.evaluate(()=>window.dispatchEvent(new HashChangeEvent('hashchange')));await page.waitForTimeout(100);
  assert.equal(events.filter(e=>e.eventType==='hashchange').length,1,'duplicate hash callback');
  await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pagehide'));window.dispatchEvent(new PageTransitionEvent('pagehide'));});await page.waitForTimeout(100);
  const finals=events.filter(e=>e.duration.final);assert.equal(new Set(finals.map(e=>e.duration.pageId)).size,finals.length,'duplicate final');
  await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});await page.waitForTimeout(100);
  assert.equal(events.filter(e=>e.eventType==='pageshow').length,1,'BFCache');
  assert.equal(events.filter(e=>e.eventType==='pageview').length,1,'navigation inflated PV');
  assert.equal(new Set(events.map(e=>e.visitorId)).size,1);assert.equal(new Set(events.map(e=>e.sessionId)).size,1);
  assert.equal(await page.locator('#kuaiyuShareButton').count(),0);assert.equal(new URL(page.url()).search,'');
  results.push({pathname,events:events.length,pageviews:1});await context.close();
 }
 const rendered = await browser.newContext(), renderedPage = await rendered.newPage(), renderedEvents = [];
 await renderedPage.route('**/*', r => {
   if (new URL(r.request().url()).pathname === '/api/visit') {
     renderedEvents.push(r.request().postDataJSON());
     return r.fulfill({ status: 204 });
   }
   return r.fulfill({contentType:'text/html',body:'<!doctype html><html data-visit-slide=""><title>Rendered deck</title>'});
 });
 await renderedPage.goto('https://slides.test/slides/ai/survival/student/?lang=en&token=private-value#s9999');
 await renderedPage.evaluate(() => { window.KuaiyuShareLink = { fields: () => null }; });
 await renderedPage.addScriptTag({content:code});
 for (const fragment of ['#s21', '#s64', '#app-2', '#app-2', '#s21']) {
   await renderedPage.evaluate(id => {
     history.replaceState({}, '', id);
     document.documentElement.dataset.visitSlide = id;
   }, fragment);
 }
 await renderedPage.waitForFunction(() => document.documentElement.dataset.visitSlide === '#s21');
 const deadline = Date.now() + 3000;
 while (renderedEvents.filter(e => e.eventType === 'hashchange').length < 4 && Date.now() < deadline) {
   await new Promise(resolve => setTimeout(resolve, 20));
 }
 const starts = renderedEvents.filter(e => e.eventType !== 'page_duration');
 assert.deepEqual(starts.map(e => new URL(e.url).hash), ['', '#s21', '#s64', '#app-2', '#s21']);
 assert.equal(new Set(starts.map(e => e.duration.pageId)).size, 5);
 assert.equal(starts.filter(e => e.eventType === 'pageview').length, 1);
 assert.ok(renderedEvents.every(e => new URL(e.url).search === '?lang=en'));
 await rendered.close();

 const early = await browser.newContext(), earlyPage = await early.newPage(), earlyEvents = [];
 let finishHelper;
 await earlyPage.route('**/*', route => {
   const url = new URL(route.request().url());
   if (url.pathname === '/scripts/share-link.js') {
     return new Promise(resolve => {
       finishHelper = () => route.fulfill({contentType:'text/javascript',
         body:'window.KuaiyuShareLink = {fields: () => ({via:"fixtureSender1234",ownCode:"fixtureGenerated1234"})};'
       }).then(resolve);
     });
   }
   if (url.pathname === '/api/visit') {
     earlyEvents.push(route.request().postDataJSON());
     return route.fulfill({status:204});
   }
   return route.fulfill({contentType:'text/html',body:'<!doctype html><html data-visit-slide="#s21">'});
 });
 await earlyPage.goto('https://slides.test/slides/ai/survival/teacher/#s21');
 await earlyPage.addScriptTag({content:code});
 await earlyPage.evaluate(() => { document.documentElement.dataset.visitSlide = '#s64'; });
 assert.equal(earlyEvents.length, 0, 'visits wait for link attribution');
 assert.equal(typeof finishHelper, 'function');
 await finishHelper();
 const earlyDeadline = Date.now() + 3000;
 while (!earlyEvents.some(e => e.eventType === 'hashchange') && Date.now() < earlyDeadline) {
   await new Promise(resolve => setTimeout(resolve, 20));
 }
 assert.deepEqual(earlyEvents.filter(e => e.eventType !== 'page_duration').map(e => new URL(e.url).hash),
   ['#s21','#s64']);
 assert.ok(earlyEvents.every(e => e.share.via === 'fixtureSender1234' &&
   new URL(e.url).searchParams.get('via') === 'fixtureGenerated1234'));
 await early.close();
 const context=await browser.newContext(),page=await context.newPage(),requests=[];
 await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:'<title>Non slides</title>'}));
 await page.goto('https://slides.test/apps/uflowx/');page.on('request',r=>requests.push(r.url()));await page.addScriptTag({content:code});assert.equal(requests.length,0);assert.equal(await page.evaluate(()=>window.__kuaiyuVisitLoggerLoaded),undefined);
 await page.goto('https://slides.test/slides/');
 await page.evaluate(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});Object.defineProperty(window,'sessionStorage',{get(){throw Error('blocked')}});navigator.sendBeacon=()=>false;window.__events=[];window.fetch=(url,options)=>{window.__events.push(JSON.parse(options.body));return Promise.resolve({ok:true})};});
 await page.addScriptTag({content:code});await page.evaluate(()=>location.hash='fallback');await page.waitForTimeout(100);
 const fallback=await page.evaluate(()=>window.__events);assert.equal(fallback.filter(e=>e.eventType==='pageview').length,1);assert.equal(new Set(fallback.map(e=>e.visitorId)).size,1);
 await browser.close();console.log(JSON.stringify({passed:true,routes:results,storageDisabled:true,beaconFallback:true,nonSlidesUntouched:true},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
