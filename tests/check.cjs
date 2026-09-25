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
require('./source-policy.cjs').validateSources(data.questions);
const catalog = [...data.juniorCategories, ...data.seniorCategories].flatMap(c => c.items);
assert.equal(new Set(catalog).size, catalog.length, '目录条目必须唯一');
assert.equal(new Set(data.questions.map(q => q.id)).size, data.questions.length, '例题标识必须唯一');
for (const [name, detail] of Object.entries(data.techDetail)) {
  assert(catalog.includes(name), `详解未列入目录：${name}`);
  assert(detail.conditions && detail.example && detail.summary, `详解缺少条件或内容：${name}`);
  assert(['reviewed', 'draft'].includes(detail.reviewStatus), `详解缺少审校状态：${name}`);
  assert(/^(初中|高中)\/.+/.test(detail.chapter), `详解缺少统一章节映射：${name}`);
}
assert.equal(Object.values(data.techDetail).filter(d=>d.reviewStatus==='reviewed').length, 81, '已审校方法数量变化须人工复核（2026-09-25 第一批 20 → 28、第二批 28 → 43、第三批 43 → 78、第四批 78 → 81，见 CONTENT_REVIEW_BATCH1/2/3/4.md）');
assert.equal(Object.values(data.techDetail).filter(d=>d.reviewStatus==='draft').length, 0, '待审校方法数量变化须人工复核（2026-09-25 第一批 61 → 53、第二批 53 → 38、第三批 38 → 3、第四批 3 → 0）');
assert.equal(data.questions.filter(q=>q.source.status==='unverified').length, 13, '待核对题目数量变化须人工复核（2026-09-25 维护者题库核对：16 → 13，见 SOURCE_VERIFICATION_BATCH2.md）');
assert.equal(data.questions.filter(q=>q.source.status==='bank-original').length, 1, '与维护者题库一致的题目数量变化须人工复核');
assert.equal(data.questions.filter(q=>q.source.status==='bank-adapted').length, 2, '据维护者题库改编的题目数量变化须人工复核');
assert.equal(data.questions.filter(q=>q.source.status==='teaching-example').length, 37, '本站教学示例数量变化须人工复核');
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
const engineName = process.env.BROWSER_ENGINE || 'chromium';
assert(['chromium', 'webkit', 'firefox'].includes(engineName), '未知浏览器引擎');
const engine = require(process.env.PLAYWRIGHT_MODULE || 'playwright')[engineName];
const screenshotDir = process.env.SCREENSHOT_DIR;
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
(async () => {
  const browser = await engine.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // 外部肖像不影响学习路径；固定离线状态，同时验证照片的失败回退。
    await page.route('https://**/*', route => route.abort());
    const url = name => pathToFileURL(path.join(root, name)).href;
    const go = name => page.goto(url(name), { waitUntil: 'domcontentloaded' });
    for (const width of [320, 360, 390, 568, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of pages) {
        await go(name);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${width} 横向溢出`);
      }
    }
    console.log(`${engineName}：四页 × 七种宽度的响应式检查通过。`);
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
    assert.equal(await page.locator('.tech-row').count(), data.juniorCategories.flatMap(c => c.items.map(n => ({ n, c }))).filter(({ n, c }) => data.techDetail[n].reviewStatus === 'reviewed' && `${n} ${data.techDetail[n].tagline || ''} ${c.title}`.includes('液面')).length); // 初中已审校方法里名称/副标题/分类含"液面"的条数（第三批后为 2）
    await page.getByLabel('搜索大招').fill('不存在的方法');
    assert(await page.locator('#empty').isVisible());
    await page.getByRole('button', { name: '清除搜索，查看本学段详解' }).click();
    assert.equal(await page.locator('.tech-row').count(), data.juniorCategories.flatMap(c => c.items).filter(n => data.techDetail[n].reviewStatus === 'reviewed').length); // 初中已审校方法数（第二批后为 10）
    await page.getByLabel('仅看已审校方法').uncheck();
    assert.equal(await page.locator('.tech-row').count(), data.juniorCategories.flatMap(c => c.items).length);
    // 草稿提示：本学段还有草稿就抽查一条必须显示提示；没有草稿则抽查一条已审校方法必须不显示
    const juniorDraft = data.juniorCategories.flatMap(c => c.items).find(n => data.techDetail[n].reviewStatus === 'draft');
    await page.locator(`[data-tech="${juniorDraft || '冰化水液面升降速判'}"]`).click();
    const draftNotice = page.getByText('尚未完成适用条件和推导的逐条教研审校', { exact: false });
    assert.equal((await draftNotice.count()) > 0 && await draftNotice.isVisible(), Boolean(juniorDraft), '草稿提示应只在草稿方法上显示');
    await page.getByRole('button', { name: '关闭详情' }).click();
    await page.waitForFunction(() => !new URL(location.href).searchParams.has('tech'));
    assert(!new URL(page.url()).searchParams.has('tech'));
    for (const [index, title, question] of [[0, '冰化水液面升降速判', '冰化盐水液面变化'], [1, '弹性碰撞双极值定论', '弹性碰撞速度交换']]) {
      await go('index.html');
      await Promise.all([
        page.waitForURL(/techniques.html/),
        page.locator('.route-card').nth(index).click()
      ]);
      assert.equal(await page.locator('#detail-title').innerText(), title);
      assert(await page.locator('.condition-box').isVisible());
      await Promise.all([
        page.waitForURL(/questions\.html/),
        page.locator('.related-link').first().click()
      ]);
      assert.equal(await page.locator('#detail-title').innerText(), question);
      assert.equal(await page.locator('.answer').getAttribute('open'), null);
      await page.getByText('我已尝试，展开解析', { exact: true }).click();
      assert(await page.locator('.answer .pre').isVisible());
      assert(await page.evaluate(() => {const b=document.querySelector('.dialog-body');return b.scrollWidth<=b.clientWidth+1;}));
      if (screenshotDir && index === 0) await page.screenshot({ path: path.join(screenshotDir, '手机例题解析.png') });
      await Promise.all([
        page.waitForURL(/techniques\.html/),
        page.locator('.related-link').first().click()
      ]);
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

