/* 直接使用 file://，不启动项目服务；离线测试不依赖外部字体和肖像。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const state = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), state);
const data = state.window.KAIQIAO;
const engineName = process.env.BROWSER_ENGINE || 'chromium';
assert(['chromium', 'webkit', 'firefox'].includes(engineName));
const engine = require(process.env.PLAYWRIGHT_MODULE || 'playwright')[engineName];
const href = (file, params = {}) => pathToFileURL(path.join(root, file)).href + '?' + new URLSearchParams(params);
const errors = [];
async function setup(browser, viewport, legacy = false) {
  const context = await browser.newContext({ viewport, hasTouch: true, reducedMotion: 'reduce' });
  await context.route('https://**/*', route => route.abort());
  if (legacy) await context.addInitScript(() => {
    HTMLDialogElement.prototype.showModal = undefined;
    HTMLDialogElement.prototype.close = undefined;
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const media = original(query);
      media.addEventListener = undefined;
      return media;
    };
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('存储不可用'); } });
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  return { context, page };
}
async function assertReading(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: 页面横向溢出`);
  assert(await page.locator('.dialog-body').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${label}: 内容横向溢出`);
  assert(await page.locator('.dialog-body').evaluate(el => el.clientHeight >= 80), `${label}: 阅读区高度不足`);
  const close = await page.locator('[data-close]').boundingBox();
  const viewport = page.viewportSize();
  assert(close && close.width >= 44 && close.height >= 44, `${label}: 关闭按钮触控尺寸不足`);
  assert(close.x >= 0 && close.y >= 0 && close.x + close.width <= viewport.width + 1 && close.y + close.height <= viewport.height + 1, `${label}: 关闭按钮超出视口`);
}
(async () => {
  const browser = await engine.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  try {
    let detailCount = 0;
    for (const viewport of [{width:320,height:568},{width:390,height:844},{width:568,height:320}]) {
      const { context, page } = await setup(browser, viewport);
      for (const q of data.questions) {
        await page.goto(href('questions.html', { question:q.id }), {waitUntil:'domcontentloaded'});
        assert.equal(await page.locator('#detail-title').innerText(), q.topic);
        if (q.source.status === 'unverified') {
          assert.match(await page.locator('.source-note').innerText(), /尚未核对原卷/);
          assert(!(await page.locator('dialog').innerText()).includes(q.source.originalLabel.paper), `${q.id}: 不应显示未经核对的卷名`);
        } else {
          assert.match(await page.locator('.source-note').innerText(), /本站编写的教学示例/);
        }
        assert.equal(await page.locator('.answer[open]').count(), 0);
        await page.locator('.answer summary').tap();
        await assertReading(page, `${q.id}/${viewport.width}`);
        await page.locator('.related-link').last().scrollIntoViewIfNeeded();
        assert(await page.locator('.related-link').last().isVisible());
        await page.locator('[data-close]').tap();
        await page.waitForFunction(() => !document.querySelector('dialog').open && !new URL(location.href).searchParams.has('question'));
        assert(!new URL(page.url()).searchParams.has('question'));
        detailCount++;
      }
      for (const name of Object.keys(data.techDetail)) {
        await page.goto(href('techniques.html', {tech:name}), {waitUntil:'domcontentloaded'});
        await assertReading(page, `${name}/${viewport.width}`);
        detailCount++;
      }
      if (process.env.SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path:path.join(process.env.SCREENSHOT_DIR, `详情-${viewport.width}x${viewport.height}.png`) });
      }
      await page.goto(href('questions.html'));
      for (const q of data.questions) {
        const expected=q.source.status==='unverified'?/出处待核对/:/本站教学示例/;
        assert.match(await page.locator(`[data-question="${q.id}"] .chip`).innerText(), expected);
      }
      const card = page.locator('.qcard').first();
      await card.tap();
      await page.locator('[data-close]').tap();
      await page.waitForFunction(() => !document.querySelector('dialog').open && !new URL(location.href).searchParams.has('question'));
      assert(await card.evaluate(el => document.activeElement === el), '关闭后恢复入口焦点');
      await context.close();
    }
    // 单独覆盖导航断点切换和旧 API 降级；模拟不代表 Safari 真机验收。
    for (const legacy of [false, true]) {
      const { context, page } = await setup(browser, {width:390,height:844}, legacy);
      await page.goto(href('questions.html', {question:data.questions[0].id}));
      if (legacy) {
        assert.equal(await page.locator('dialog').getAttribute('role'), 'region');
        assert.equal(await page.locator('body.dialog-open').count(), 0);
        await page.locator('.answer summary').tap();
        assert(await page.locator('.answer .pre').isVisible());
      }
      await page.locator('[data-close]').tap();
      await page.waitForFunction(() => !document.querySelector('dialog').hasAttribute('open') && !new URL(location.href).searchParams.has('question'));
      assert(!new URL(page.url()).searchParams.has('question'));
      await page.locator('.menu-toggle').tap();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
      await page.setViewportSize({width:1280,height:900});
      await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false');
      await page.setViewportSize({width:390,height:844});
      assert(!await page.locator('.nav-links').isVisible());
      await page.locator('.theme-toggle').tap();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      if (legacy) {
        await page.locator('.qcard').first().tap();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('dialog[open]').count(), 0);
      }
      await context.close();
    }
    assert.deepEqual(errors, [], '页面脚本错误');
    console.log(`${engineName}：${detailCount} 次详情阅读、${data.questions.length} 个来源标签、触控关闭、焦点恢复、断点切换及旧 API/存储降级通过。`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

