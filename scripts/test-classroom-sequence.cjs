const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const evidence = path.resolve(root, '../evidence/survival-closing-20261120');
const live = process.argv.includes('--live');
const mode = live ? 'live' : 'local';
const origin = live ? 'https://www.kuaiyu.site' : 'https://slides.test';
const deckPath = '/slides/open_class/ai_survival/';
const desktop = { width: 1440, height: 1000 };
const mobile = { width: 390, height: 844 };
const sequence = [72, 23, 74, 75, 76, 77, 73, 30];
const titleText = 'How does a symbol become a decision? | 看见一个字，怎样变成一个判断？';
const frameSelector = '#stage iframe.classroom-app-frame';
const apps = {
  cycling: {
    path: '/apps/cycling/',
    ready: '#entryTitle',
    poster: 'cycling-definitive-dual-qr.jpg',
    size: [4398, 2475],
  },
  cardiac: {
    path: '/apps/cardiac_cycle/',
    ready: '#next',
    poster: 'cardiac-cycle-poster-watercolor-tri-qr.png',
    size: [4400, 2475],
  },
};

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    return require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
  }
}

function routeLocal(route) {
  const { pathname } = new URL(route.request().url());
  if (Object.values(apps).some(app => app.path === pathname)) {
    // Local deck assets use a minimal app document to test native iframe input.
    // The live check renders and interacts with the actual production documents.
    return route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Embedded keyboard fixture</title><body><main>Simulator fixture</main></body></html>',
    });
  }
  if (!pathname.startsWith('/slides/')) return route.fulfill({ status: 204 });

  const relative = decodeURIComponent(pathname.slice('/slides/'.length))
    .replace(/^open_class\/ai_survival-202608\//, 'ai/survival-202608/')
    .replace(/^open_class\/ai_survival\//, 'ai/survival/');
  let filename = path.join(root, relative);
  if (fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
  if (!fs.existsSync(filename)) return route.fulfill({ status: 404 });
  const contentType = {
    '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
    '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.png': 'image/png', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.woff2': 'font/woff2',
  }[path.extname(filename)];
  return route.fulfill({ path: filename, contentType });
}

async function expectSlide(page, id, position) {
  await page.waitForFunction(({ id, position }) =>
    location.hash === '#s' + id && document.querySelector('#slide-content')?.dataset.pdfPage === String(id)
      && document.querySelector('#current')?.textContent === String(position),
  { id, position }, { timeout: 8000 });
}

async function screenshot(page, label) {
  await page.locator('#stage').screenshot({ path: path.join(evidence, `${mode}-${label}.png`), animations: 'disabled' });
}

async function checkTitle(page, edition) {
  const title = page.locator('#slide-content h1.nn-decision-title');
  await title.waitFor();
  const layouts = {
    desktop, mobile, 'projector-wide': { width: 1280, height: 720 }, 'projector-4-3': { width: 1024, height: 768 },
  };
  for (const [label, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => document.fonts.ready);
    const layout = await title.evaluate(element => {
      const stage = element.closest('#stage').getBoundingClientRect();
      const parts = [...element.children].map(node => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, middle: (rect.top + rect.bottom) / 2 };
      });
      return { stage: { left: stage.left, right: stage.right }, parts };
    });
    assert.equal(await title.textContent(), titleText);
    assert.equal(layout.parts.length, 3);
    const [en, divider, zh] = layout.parts;
    assert(en.right <= divider.left + 1 && divider.right <= zh.left + 1, `${edition} P14 ${label} title order`);
    assert(Math.max(...layout.parts.map(part => part.middle)) - Math.min(...layout.parts.map(part => part.middle)) < 5,
      `${edition} P14 ${label} must use one line: ${JSON.stringify(layout)}`);
    assert(en.left >= layout.stage.left - 1 && zh.right <= layout.stage.right + 1,
      `${edition} P14 ${label} clips the title: ${JSON.stringify(layout)}`);
    await screenshot(page, `${edition}-P14-${label}`);
  }
  await page.setViewportSize(desktop);
}

async function inspectOverview(page) {
  await page.locator('#overview-toggle').click();
  const ids = await page.locator('#overview-grid .thumb').evaluateAll(buttons => buttons.map(button => Number(button.dataset.page)));
  assert.equal(ids.length, 64);
  assert.deepEqual(ids.slice(-4), [63, 82, 83, 84]);
  assert.equal(new Set(ids).size, ids.length);
  for (const removed of [19, 24, 25, 26, 27, 28, 29, 33, 37, 41, 42, 43, 44, 45, 46, 47, 48]) assert(!ids.includes(removed), `Retired slide #s${removed}`);
  assert.deepEqual(ids.slice(28, 36), sequence);
  assert.deepEqual(ids.slice(36, 50), [31, 78, 34, 35, 38, 39, 40, 49, 50, 51, 79, 80, 81, 52]);
  await page.locator('#search').fill('32');
  assert.deepEqual(await page.locator('#overview-grid .thumb:visible').evaluateAll(buttons =>
    buttons.map(button => button.dataset.page)), ['75']);
  await page.locator('#overview [data-close]').click();
  await page.locator('#chapters-toggle').click();
  await page.locator('.chapter-option[data-chapter="applications"]').click();
  await expectSlide(page, 20, 21);
  await page.locator('#chapters-toggle').click();
  await page.locator('.chapter-option[data-chapter="future"]').click();
  await expectSlide(page, 52, 50);
  await page.locator('#chapters-toggle').click();
  await page.locator('.chapter-option[data-chapter="survive"]').click();
  await expectSlide(page, 56, 54);
  return ids;
}

async function jump(page, id, position) {
  await page.locator('#page-jump').click();
  await page.locator('#jump-input').fill(String(position));
  await page.locator('#jump-form').getByRole('button', { name: /Go/ }).click();
  await expectSlide(page, id, position);
}

async function buttonNavigate(page, selector, id, position, previousId, maxClicks = 1) {
  const button = page.locator(selector);
  assert(await button.isVisible() && await button.isEnabled(), `${selector} available on #s${previousId}`);
  // Existing pages may reveal up to several groups before moving forward.
  for (let i = 0; i < maxClicks; i++) {
    await button.click();
    if (new URL(page.url()).hash !== '#s' + previousId) break;
  }
  await expectSlide(page, id, position);
}

async function checkEmbeddedApp(page, app, id, position, edition) {
  const iframe = page.locator(frameSelector);
  await iframe.waitFor();
  assert.equal(await iframe.getAttribute('src'), app.path);
  const handle = await iframe.elementHandle();
  const frame = await handle.contentFrame();
  assert(frame, 'The app iframe should have a document');
  await frame.waitForURL(url => url.pathname === app.path, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await frame.locator(live ? app.ready : 'main').waitFor({ timeout: 30000 });

  for (const viewport of [mobile, desktop]) {
    await page.setViewportSize(viewport);
    for (const control of ['#prev', '#next']) {
      const button = page.locator(`#stage .slide-navigation ${control}`);
      assert(await button.isVisible() && await button.isEnabled());
      const [frameRect, buttonRect] = await Promise.all([iframe.boundingBox(), button.boundingBox()]);
      assert(frameRect.y + frameRect.height <= buttonRect.y + 1, `${control} overlaps app controls`);
      assert(buttonRect.x >= 0 && buttonRect.x + buttonRect.width <= viewport.width + 1);
    }
  }
  await page.locator('#next').focus();
  for (const key of ['ArrowLeft', 'ArrowRight']) {
    await page.keyboard.press(key);
    await expectSlide(page, id, position);
  }

  if (live && app === apps.cycling) {
    await frame.locator('button[data-mode="explore"]').click();
    await frame.locator('#startButton').waitFor({ timeout: 30000 });
  }
  await frame.evaluate(() => {
    window.qaClassroomKeys = [];
    addEventListener('keydown', event => window.qaClassroomKeys.push([event.key, event.isTrusted]), { capture: true });
    document.body.tabIndex = -1;
    document.body.focus();
  });
  if (live && app === apps.cycling) await frame.locator('#startButton').focus();
  assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'IFRAME');
  for (const key of ['ArrowLeft', 'ArrowRight']) await page.keyboard.press(key);
  const keys = await frame.evaluate(() => window.qaClassroomKeys);
  assert.deepEqual(keys, [['ArrowLeft', true], ['ArrowRight', true]]);
  let phase;
  if (live && app === apps.cardiac) {
    const before = await frame.locator('#time').innerText();
    await page.keyboard.press('ArrowRight');
    await frame.waitForFunction(value => document.getElementById('time')?.innerText !== value, before);
    phase = { before, after: await frame.locator('#time').innerText() };
  }
  await expectSlide(page, id, position);
  await screenshot(page, `${edition}-P${position}-app`);
  return { handle, info: { path: new URL(frame.url()).pathname, keys, phase } };
}

async function expectPairedFrame(page, handle, suspended) {
  assert.equal(await page.locator(frameSelector).count(), 1);
  const state = await handle.evaluate((frame, selector) => {
    const layer = frame.closest('.classroom-app-layer');
    return {
      same: frame === document.querySelector(selector),
      ariaHidden: layer.getAttribute('aria-hidden') === 'true',
      inert: layer.inert,
      tabIndex: frame.tabIndex,
      focused: frame === document.activeElement,
    };
  }, frameSelector);
  assert(state.same, 'The pair must keep the same app iframe');
  assert.equal(state.ariaHidden, suspended);
  assert.equal(state.inert, suspended);
  if (suspended) {
    assert.equal(state.tabIndex, -1);
    assert(!state.focused, 'The poster must reclaim keyboard focus from the app');
  }
  const frame = await handle.contentFrame();
  assert(await frame.evaluate(() => Array.isArray(window.qaClassroomKeys)), 'The app document must survive the round trip');
}

async function expectNoFrame(page) {
  assert.equal(await page.locator(frameSelector).count(), 0);
}

async function checkPosterLayout(page, image, size, label) {
  const [art, stage, navigation] = await Promise.all([
    image.boundingBox(), page.locator('#stage').boundingBox(), page.locator('#stage .slide-navigation').boundingBox(),
  ]);
  assert(art.x >= stage.x - 1 && art.x + art.width <= stage.x + stage.width + 1);
  assert(art.y >= stage.y - 1 && art.y + art.height <= stage.y + stage.height + 1);
  assert(Math.abs(art.width / art.height - size[0] / size[1]) < 0.02);
  assert(art.y + art.height <= navigation.y + 1, `${label} navigation overlaps poster art`);
  assert(await image.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return element.closest('#slide-content').contains(target);
  }), 'The poster must receive pointer events in front of the iframe');
}

async function checkPoster(page, app, position, edition, handle) {
  const image = page.locator('#slide-content > svg > image');
  await image.waitFor();
  await expectPairedFrame(page, handle, true);
  assert.equal(await page.locator('#slide-content iframe').count(), 0);
  assert.equal(await page.locator('#slide-content > svg > :not(image)').count(), 0);
  assert.match(await image.getAttribute('href'), new RegExp('/classroom-posters/' + app.poster.replace('.', '\\.') + '$'));
  const size = await image.evaluate(async element => {
    const bitmap = new Image();
    bitmap.src = element.getAttribute('href');
    await bitmap.decode();
    return [bitmap.naturalWidth, bitmap.naturalHeight];
  });
  assert.deepEqual(size, app.size);
  assert.match(await image.getAttribute('preserveAspectRatio'), /\bmeet\b/);
  for (const [label, viewport] of Object.entries({ desktop, mobile })) {
    await page.setViewportSize(viewport);
    const name = `${edition}-P${position}-poster-${label}`;
    await checkPosterLayout(page, image, size, name);
    await screenshot(page, name);
  }
  await page.setViewportSize(desktop);
  await page.locator('#fullscreen').click();
  await page.waitForFunction(() => document.fullscreenElement?.id === 'viewport', {}, { timeout: 8000 });
  const fullscreen = `${edition}-P${position}-poster-fullscreen`;
  try {
    await checkPosterLayout(page, image, size, fullscreen);
    await screenshot(page, fullscreen);
  } finally {
    await page.evaluate(() => document.exitFullscreen());
  }
  return { filename: app.poster, size };
}

async function checkEdition(browser, edition) {
  const context = await browser.newContext({ viewport: desktop, reducedMotion: 'reduce' });
  const errors = [];
  try {
    await context.route('**/*', route => {
      if (!['GET', 'HEAD'].includes(route.request().method())) return route.fulfill({ status: 204 });
      return live ? route.continue() : routeLocal(route);
    });
    const page = await context.newPage();
    page.on('pageerror', error => { errors.push(error.message); });
    page.on('response', response => {
      const url = new URL(response.url());
      if (response.status() >= 400 && url.pathname.startsWith('/slides/')) errors.push(`${response.status()} ${url.pathname}`);
    });
    await page.goto(`${origin}${deckPath}${edition}/?qa=classroom-${Date.now()}#s12`, { waitUntil: 'domcontentloaded' });
    await expectSlide(page, 12, 14);
    assert.equal(await page.locator('#source-page').count(), 0);
    assert.equal(await page.locator('#total').textContent(), '64');
    await checkTitle(page, edition);
    const ids = await inspectOverview(page);
    await jump(page, 72, 29);
    await buttonNavigate(page, '#next', 23, 30, 72, 8);
    await buttonNavigate(page, '#next', 74, 31, 23, 8);
    const cycling = await checkEmbeddedApp(page, apps.cycling, 74, 31, edition);
    await buttonNavigate(page, '#next', 75, 32, 74);
    const cyclingPoster = await checkPoster(page, apps.cycling, 32, edition, cycling.handle);

    await page.locator('#stage').press('ArrowLeft');
    await expectSlide(page, 74, 31);
    await expectPairedFrame(page, cycling.handle, false);
    const cyclingFrame = await cycling.handle.contentFrame();
    await cyclingFrame.evaluate(() => document.body.focus());
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'IFRAME');
    await page.evaluate(() => { location.hash = 's75'; });
    await expectSlide(page, 75, 32);
    await expectPairedFrame(page, cycling.handle, true);
    await page.keyboard.press('ArrowLeft');
    await expectSlide(page, 74, 31);
    await buttonNavigate(page, '#prev', 23, 30, 74);
    await expectNoFrame(page);
    await jump(page, 75, 32);
    await expectNoFrame(page);
    await page.locator('#stage').press('ArrowRight');
    await expectSlide(page, 76, 33);
    await buttonNavigate(page, '#prev', 75, 32, 76);
    await expectNoFrame(page);
    await page.locator('#stage').press('ArrowRight');
    await expectSlide(page, 76, 33);
    const cardiac = await checkEmbeddedApp(page, apps.cardiac, 76, 33, edition);
    await buttonNavigate(page, '#next', 77, 34, 76);
    const cardiacPoster = await checkPoster(page, apps.cardiac, 34, edition, cardiac.handle);
    await page.locator('#stage').press('ArrowLeft');
    await expectSlide(page, 76, 33);
    await expectPairedFrame(page, cardiac.handle, false);
    await buttonNavigate(page, '#next', 77, 34, 76);
    await page.locator('#stage').press('ArrowRight');
    await expectSlide(page, 73, 35);
    await expectNoFrame(page);
    await page.locator('[data-kind=workbench]').waitFor();
    await buttonNavigate(page, '#next', 30, 36, 73, 8);
    await jump(page, 51, 46);
    await buttonNavigate(page, '#next', 79, 47, 51, 8);
    await buttonNavigate(page, '#next', 80, 48, 79, 8);
    await buttonNavigate(page, '#next', 81, 49, 80, 8);
    await buttonNavigate(page, '#next', 52, 50, 81, 8);
    assert.deepEqual([...new Set(errors)], []);
    return {
      edition, count: ids.length, sequence, title: titleText, cycling: cycling.info, cardiac: cardiac.info,
      cyclingPoster, cardiacPoster, framePersistsBetweenPairedSlides: true,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(evidence, { recursive: true });
  const temp = path.join(evidence, 'browser-temp');
  fs.mkdirSync(temp, { recursive: true });
  process.env.TMP = temp;
  process.env.TEMP = temp;
  const { chromium } = loadPlaywright();
  const proxyServer = live && (process.env.SCENE_BROWSER_PROXY || process.env.HTTPS_PROXY);
  const proxy = proxyServer ? { server: proxyServer } : undefined;
  const browser = await chromium.launch({ channel: 'chrome', headless: true, proxy });
  try {
    const checks = [];
    for (const edition of ['student', 'teacher']) checks.push(await checkEdition(browser, edition));
    const result = { pass: true, mode, checks };
    fs.writeFileSync(path.join(evidence, `classroom-sequence-${mode}.json`), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
