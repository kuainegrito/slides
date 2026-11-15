const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require('C:/Users/kuaiy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const out = process.env.OTHER_TEST_OUT || path.resolve(root, '../runs/other-courseware-20261115/' + (live ? 'public-browser' : 'local-browser'));
fs.mkdirSync(out, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const courseEntry = manifest.decks.find(x => x.id === 'other/teaching-innovation');
const course = encodeURI(courseEntry.href.replace(/^\.\//, '/slides/'));
const categoryEntries = manifest.categories || [];
const origin = live ? 'https://www.kuaiyu.site' : 'https://slides.test';
const errors = [], checks = [];
function contentType(file) {
  return ({'.html':'text/html','.json':'application/json','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'})[path.extname(file)] || 'application/octet-stream';
}
(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true, ...(live && process.env.HTTPS_PROXY ? {proxy:{server:process.env.HTTPS_PROXY}} : {})});
  let authenticatedState;
  try {
    if (live) {
      const unauth = await browser.newContext({viewport:{width:1440,height:1000}});
      const page = await unauth.newPage();
      const response = await page.goto(origin + course, {waitUntil:'domcontentloaded', timeout:60000});
      assert.equal(response.status(), 200);
      assert((await page.locator('h1').innerText()).includes('输入密码'));
      const text = await page.locator('body').innerText();
      assert(text.includes('yukuai@gmc.edu.cn'));
      assert(text.includes('只需密码，无需用户名'));
      assert(!text.includes('教学创新不是材料包装'));
      assert.equal(await page.locator('input[name="password"]').count(), 1);
      assert.equal(await page.locator('input[name="username"]').count(), 0);
      await page.screenshot({path:path.join(out,'course-login.png')});
      const media = await unauth.request.get(origin + course + encodeURI('幻灯片/01_大主题小切口.jpg'));
      assert.equal(media.status(), 200);
      assert((media.headers()['content-type'] || '').includes('text/html'));
      assert((await media.text()).includes('yukuai@gmc.edu.cn'));
      const wrongResponse = page.waitForResponse(r => r.url().includes('/slides-course-login/') && r.request().method() === 'POST');
      await page.fill('#course-password', 'incorrect-test-password');
      await page.click('button[type="submit"]');
      assert.equal((await wrongResponse).status(), 401);
      assert((await page.locator('body').innerText()).includes('密码不正确'));
      const successful = page.waitForResponse(r => r.url().includes('/slides-course-login/') && r.request().method() === 'POST');
      await page.fill('#course-password', process.env.COURSE_PASSWORD || '');
      await page.click('button[type="submit"]');
      assert.equal((await successful).status(), 303);
      await page.waitForSelector('article.evidence');
      assert((await page.locator('h1').innerText()).includes('教学创新大赛专家讲座总结'));
      authenticatedState = await unauth.storageState();
      checks.push({check:'login-flow',singlePassword:true,wrongPasswordRejected:true,mediaProtected:true,hint:true});
      await unauth.close();
    }
    for (const width of [1440, 390]) {
      const context = await browser.newContext({viewport:{width,height:1000}, ...(live ? {storageState:authenticatedState} : {})});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.request().method() === 'GET' && r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
      if (!live) await page.route('**/*', async route => {
        if (route.request().method() !== 'GET') return route.fulfill({status:204});
        const url = new URL(route.request().url());
        if (!url.pathname.startsWith('/slides/')) return route.abort();
        let file = path.join(root, decodeURIComponent(url.pathname.slice(8)));
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        if (!fs.existsSync(file)) return route.fulfill({status:404, body:'missing'});
        await route.fulfill({path:file, contentType:contentType(file)});
      });
      await page.goto(origin + '/slides/', {waitUntil:'domcontentloaded', timeout:60000});
      await page.waitForSelector('.deck');
      assert.equal(await page.locator('.deck').count(), 3);
      assert.equal(categoryEntries.length, 3);
      const categoryText = await page.locator('#decks').innerText();
      for (const entry of categoryEntries) assert(categoryText.includes(entry.title), entry.title);
      const categoryLinks = await page.locator('.deck').evaluateAll(as => as.map(a => decodeURIComponent(a.href)));
      for (const entry of categoryEntries) {
        const expected = new URL(entry.href, origin + '/slides/').pathname;
        assert(categoryLinks.some(x => new URL(x).pathname === expected), JSON.stringify(categoryLinks));
      }
      if (width === 1440) await page.screenshot({path:path.join(out,'slides-center-1440.png')});
      for (const entry of categoryEntries) {
        await page.goto(new URL(entry.href, origin + '/slides/').href, {waitUntil:'domcontentloaded', timeout:60000});
        assert((await page.locator('h1').innerText()).includes(entry.title));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      }
      const otherLinks = await page.locator('a.deck').evaluateAll(as => as.map(a => decodeURIComponent(a.href)));
      assert(otherLinks.some(x => x.includes('教学创新大赛讲座总结')));
      if (width === 390) await page.screenshot({path:path.join(out,'other-category-390.png')});
      await page.goto(origin + course, {waitUntil:'domcontentloaded', timeout:60000});
      assert.equal((await page.locator('h1').innerText()).trim(), '教学创新大赛专家讲座总结');
      assert.equal(await page.locator('article.evidence').count(), 10);
      assert.equal(await page.locator('article.evidence blockquote').count(), 20);
      assert.equal(await page.locator('video').count(), 10);
      for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.images].every(x => x.complete && x.naturalWidth > 0), null, {timeout:30000});
      assert.equal(await page.locator('img').count(), 11);
      const bodyText = await page.locator('body').innerText();
      for (const forbidden of ['哪些内容被反复强调','本总结采用的证据规则','为什么算重点','方法、文件与使用边界','配套文件','字速率','局部能量']) assert(!bodyText.includes(forbidden), forbidden);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({path:path.join(out,`course-top-${width}.png`)});
      await page.locator('#evidence-01').scrollIntoViewIfNeeded();
      await page.locator('#evidence-01').screenshot({path:path.join(out,`course-evidence-${width}.png`)});
      await page.locator('#flowchart').scrollIntoViewIfNeeded();
      await page.locator('#flowchart').screenshot({path:path.join(out,`course-flow-${width}.png`)});
      const videoSources = await page.locator('video source').evaluateAll(xs => xs.map(x => x.src));
      assert.equal(new Set(videoSources).size, 10);
      await page.waitForFunction(() => {const v = document.querySelector('video'); return v && v.readyState >= 1 && v.duration > 49 && v.duration < 51;}, null, {timeout:30000});
      checks.push({width,categories:3,evidence:10,quotes:20,videos:10,images:11,videoMetadata:true,overflow:false,pageErrors:[]});
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out,'verification.json'), JSON.stringify({errors,checks},null,2));
    console.log(JSON.stringify({errors,checks},null,2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
