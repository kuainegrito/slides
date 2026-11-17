const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {chromium} = require('C:/Users/kuaiy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const out = path.resolve(root, '../evidence/application-particles-20261117');
fs.mkdirSync(out, {recursive:true});
const base = live ? 'https://www.kuaiyu.site' : 'https://slides.test';
const errors = [], checks = [];
async function localRoute(context) {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith('/slides/')) return route.fulfill({status:204});
    const rel = url.pathname.slice(8).replace('open_class/ai_survival-202608/','ai/survival-202608/').replace('open_class/ai_survival/','ai/survival/');
    let file = path.join(root, rel);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    return fs.existsSync(file) ? route.fulfill({path:file,contentType:({'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(file)]}) : route.fulfill({status:404});
  });
}
(async()=>{
  const browser = await chromium.launch({channel:'chrome',headless:true,...(process.env.SCENE_BROWSER_PROXY?{proxy:{server:process.env.SCENE_BROWSER_PROXY}}:{})});
  try {
    for (const edition of ['student','teacher']) for (const [id,number,kind] of [[20,22,'prose'],[22,25,'code']]) {
      const context = await browser.newContext({viewport:{width:1440,height:1000}});
      if (!live) await localRoute(context);
      const page = await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',response=>{if(response.status()>=400 && new URL(response.url()).pathname.startsWith('/slides/'))errors.push(`${response.status()} ${response.url()}`);});
      page.on('requestfailed',request=>{if(/\.(js|css|json)(\?|$)/.test(request.url()) && !request.failure()?.errorText.includes('ERR_ABORTED'))errors.push(`${request.failure()?.errorText} ${request.url()}`);});
      await page.goto(`${base}/slides/open_class/ai_survival/${edition}/?qa=application-scenes#s${id}`,{waitUntil:'domcontentloaded',timeout:45000});
      const scene = page.locator('.application-scene');
      await scene.waitFor();
      assert.equal(await page.locator('#current').textContent(),String(number));
      assert.equal(await scene.getAttribute('data-scene'),kind);
      if (process.argv.includes('--timeline') && edition==='student') {
        const sample=await page.evaluate(()=>new Promise(resolve=>{
          const intervals=[],drawCosts=[],phases=new Set(),start=performance.now();let previous=start;
          function frame(now){intervals.push(now-previous);drawCosts.push(document.querySelector('.application-scene').sceneRenderMs);previous=now;phases.add(document.querySelector('.application-scene').dataset.phase);if(now-start<24500)requestAnimationFrame(frame);else {intervals.sort((a,b)=>a-b);drawCosts.sort((a,b)=>a-b);resolve({drawP95:drawCosts[Math.floor(drawCosts.length*.95)],drawMax:drawCosts.at(-1),domNodes:document.querySelector('.application-scene').querySelectorAll('*').length,frames:intervals.length,p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),phases:[...phases]});}}
          requestAnimationFrame(frame);
        }));
        assert.deepEqual(sample.phases,['0','1','2','3']);
        fs.writeFileSync(path.join(out,`${kind}${live?'-live':''}-frames.json`),JSON.stringify(sample,null,2));
      }
      await page.waitForTimeout(400);
      assert(Number(await scene.getAttribute('data-elapsed')) > 0);
      await scene.locator('[data-action=pause]').click();
      const snapshot = await scene.locator(':scope>svg').innerHTML();
      await page.waitForTimeout(160);
      assert.equal(await scene.locator(':scope>svg').innerHTML(),snapshot,'pause freezes all SVG art');
      for (const phase of [0,1,2,3]) {
        await scene.locator(`[data-phase="${phase}"]`).click();
        assert.equal(await scene.getAttribute('data-phase'),String(phase));
      }
      if (kind==='code') {
        for(const level of [1,0]) {
          await scene.locator(`[data-variant="${level}"]`).click();
          assert.equal(await scene.getAttribute('data-variant'),String(level));
        }
        assert.equal(await scene.locator('[data-test][data-pass="true"]').count(),3);
        await scene.locator('[data-variant="1"]').click();
        assert.equal(await scene.locator('[data-test][data-pass="false"]').count(),3);
        await scene.locator('[data-variant="0"]').click();
      } else assert.equal(await scene.locator('[data-output]').count(),4);
      assert.equal(await scene.locator('[data-result]').count(),4);
      assert.equal(await scene.locator('[data-effect=convergence]').count(),2);
      assert.equal(await scene.locator('[data-effect=comet-trails]').count(),7);
      const resultBefore=await scene.locator('[data-effect=result-process]').evaluateAll(nodes=>nodes.map(n=>n.innerHTML));
      const finalArt = await scene.locator(':scope>svg').innerHTML();
      await scene.locator('[data-action=pause]').click();
      await page.waitForTimeout(250);
      assert.notEqual(await scene.locator(':scope>svg').innerHTML(),finalArt,'final view keeps animating');
      const resultAfter=await scene.locator('[data-effect=result-process]').evaluateAll(nodes=>nodes.map(n=>n.innerHTML));
      resultBefore.forEach((before,i)=>assert.notEqual(before,resultAfter[i],'each outcome has its own animation'));
      await page.click('#motion');
      const globalFrozen = await scene.locator(':scope>svg').innerHTML();
      await page.waitForTimeout(160);
      assert.equal(await scene.locator(':scope>svg').innerHTML(),globalFrozen);
      await page.click('#motion');
      await scene.locator('[data-action=pause]').click();
      await page.locator('#stage').screenshot({path:path.join(out,`${edition}-${kind}${live?'-live':''}.png`)});
      await scene.locator('[data-action=original]').click();
      assert(await scene.locator('.as-original').isVisible());
      await scene.locator('[data-action=replay]').click();
      assert(await scene.locator('.as-original').isHidden());
      assert((await scene.locator('[data-action=original]').textContent()).includes('Original'));
      assert(Number(await scene.getAttribute('data-elapsed'))<1);
      await scene.locator('[data-phase="3"]').click();
      await scene.locator('[data-action=pause]').focus();
      await page.keyboard.press('Space');
      assert.equal(await page.locator('#current').textContent(),String(number));
      await scene.locator('[data-action=pause]').click();
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:path.join(out,`${edition}-${kind}${live?'-live':''}-mobile.png`)});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      const boxes = await scene.evaluate(el=>({svg:el.querySelector(':scope>svg').getBoundingClientRect().bottom,controls:el.querySelector('.as-controls').getBoundingClientRect().top}));
      assert(boxes.svg<=boxes.controls+1,'mobile controls do not cover the SVG');
      await page.click('#next');
      assert.equal(await page.locator('.application-scene').count(),0);
      await page.click('#prev');
      await scene.waitFor();
      assert(Number(await scene.getAttribute('data-elapsed'))<1,'reentry resets scene');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.evaluate(()=>localStorage.removeItem('ai-survival-'+document.documentElement.dataset.edition+'-motion'));
      await page.reload({waitUntil:'domcontentloaded',timeout:45000});await scene.waitFor();
      assert.equal(await scene.getAttribute('data-phase'),'3');
      const reduced=await scene.locator(':scope>svg').innerHTML();await page.waitForTimeout(180);
      assert.equal(await scene.locator(':scope>svg').innerHTML(),reduced);
      checks.push({edition,number,kind,pass:true});
      await context.close();
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,live?'live-verification.json':'verification.json'),JSON.stringify({pass:true,live,errors,checks},null,2));
    console.log(JSON.stringify({pass:true,live,checks}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
