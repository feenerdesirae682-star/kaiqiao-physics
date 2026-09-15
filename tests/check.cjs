/* 不启动网页服务，直接检查静态页面。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const state = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), state);
const data = state.window.KAIQIAO;
const catalog = [...data.juniorCategories, ...data.seniorCategories].flatMap(c => c.items);
assert.equal(new Set(catalog).size, catalog.length, '目录条目必须唯一');
assert.equal(new Set(data.questions.map(q => q.id)).size, data.questions.length, '例题标识必须唯一');
for (const [name, detail] of Object.entries(data.techDetail)) {
  assert(catalog.includes(name), `详解未列入目录：${name}`);
  assert(detail.conditions && detail.example && detail.summary, `详解缺少条件或内容：${name}`);
}
for (const q of data.questions) {
  assert(data.modules.some(m => m.title === q.knowledgeModule && m.level === q.grade), `知识模块不匹配：${q.id}`);
  for (const name of q.techniques) assert(data.techDetail[name], `关联大招不存在：${q.id}/${name}`);
}
const pages = ['index.html', 'techniques.html', 'questions.html', 'about.html'];
for (const name of pages) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    const url = match[1];
    if (!/^https?:/.test(url)) assert(fs.existsSync(path.join(root, url)), `本地链接缺失：${name}/${url}`);
  }
}
console.log(`数据检查通过：${Object.keys(data.techDetail).length} 个详解，${data.questions.length} 道例题，${catalog.length} 个目录条目。`);
if (!process.argv.includes('--browser')) process.exit(0);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const screenshotDir = process.env.SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : { channel: 'msedge' }) });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // 外部肖像不影响学习路径；固定离线状态，同时验证照片的失败回退。
    await page.route('https://**/*', route => route.abort());
    const url = name => pathToFileURL(path.join(root, name)).href;
    const go = name => page.goto(url(name), { waitUntil: 'domcontentloaded' });
    for (const width of [360, 390, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of pages) {
        await go(name);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${width} 横向溢出`);
      }
    }
    console.log('四页 × 五种宽度的响应式检查通过。');
    await page.setViewportSize({ width: 390, height: 844 });
    await go('index.html');
    await page.getByRole('button', { name: '打开导航菜单' }).click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.getByRole('link', { name: '物理大招库', exact: true }).first().click();
    assert.equal(await page.title(), '物理大招库 · 开窍物理');
    await page.getByRole('button', { name: '打开导航菜单' }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.getByRole('button', { name: '切换明暗主题' }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('button', { name: '切换明暗主题' }).click();
    await page.getByRole('button', { name: '初中', exact: true }).click();
    await page.getByLabel('搜索大招').fill('液面');
    assert.equal(await page.locator('.tech-row').count(), 1);
    await page.getByLabel('搜索大招').fill('不存在的方法');
    assert(await page.locator('#empty').isVisible());
    await page.getByRole('button', { name: '清除搜索，查看本学段详解' }).click();
    assert.equal(await page.locator('.tech-row').count(), 4);
    await page.getByLabel('仅看公开详解').uncheck();
    assert.equal(await page.locator('.tech-row').count(), data.juniorCategories.flatMap(c => c.items).length);
    await page.locator('[data-tech="双漂法测密度"]').click();
    assert(await page.getByText('此条目目前仅作目录展示', { exact: false }).isVisible());
    await page.getByRole('button', { name: '关闭详情' }).click();
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('tech'));
    assert(!new URL(page.url()).searchParams.has('tech'));
    for (const [index, title, question] of [[0, '冰化水液面升降速判', '冰化盐水液面变化'], [1, '弹性碰撞双极值定论', '弹性碰撞速度交换']]) {
      await go('index.html');
      await page.locator('.route-card').nth(index).click();
      assert.equal(await page.locator('#detail-title').innerText(), title);
      assert(await page.locator('.condition-box').isVisible());
      await page.locator('.related-link').first().click();
      assert.equal(await page.locator('#detail-title').innerText(), question);
      assert.equal(await page.locator('.answer').getAttribute('open'), null);
      await page.getByText('我已尝试，展开解析', { exact: true }).click();
      assert(await page.locator('.answer .pre').isVisible());
      assert(await page.evaluate(() => {const b=document.querySelector('.dialog-body');return b.scrollWidth<=b.clientWidth+1;}));
      if (screenshotDir && index === 0) await page.screenshot({ path: path.join(screenshotDir, '手机例题解析.png') });
      await page.locator('.related-link').first().click();
      assert.equal(await page.locator('#detail-title').innerText(), title);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert(await page.locator('dialog').isVisible());
      await page.keyboard.press('Escape');
      assert(!await page.locator('dialog').isVisible());
    }
    console.log('两条入门路线、目录提示、搜索空状态、菜单、深层链接、解析折叠与主题持久化检查通过。');
    for (const q of data.questions) {
      await page.goto(url('questions.html') + '?' + new URLSearchParams({ g: q.grade, question: q.id }), { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#detail-title').innerText(), q.topic);
      if (!q.techniques.length) {
        await page.locator('.related-link').click();
        assert.equal(await page.locator('#modules details[open] h3').innerText(), q.knowledgeModule);
      }
    }
    await page.goto(url('techniques.html') + '?tech=%3Cscript%3Ealert(1)%3C/script%3E', { waitUntil: 'domcontentloaded' });
    assert(await page.locator('#page-notice').isVisible());
    await page.goto(url('questions.html') + '?question=missing', { waitUntil: 'domcontentloaded' });
    assert(await page.locator('#page-notice').isVisible());
    await go('questions.html');
    await page.getByLabel('搜索例题').fill('不存在的题');
    assert(await page.locator('#empty').isVisible());
    await page.locator('#empty [data-clear]').click();
    assert.equal(await page.locator('.qcard').count(), data.questions.length);
    if (screenshotDir) {
      await go('techniques.html');
      await page.screenshot({ path: path.join(screenshotDir, '手机大招库.png'), fullPage: true });
      await go('index.html');
      await page.locator('.learning-start').screenshot({ path: path.join(screenshotDir, '手机学习入口.png') });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: path.join(screenshotDir, '电脑首页.png') });
    }
    assert.deepEqual(errors, [], '页面不应出现脚本错误');
    console.log('全部例题链接、知识模块回跳、无效链接和例题搜索检查通过；无页面脚本错误。');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
