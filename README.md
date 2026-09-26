# 开窍物理

初高中物理方法与例题的静态学习网站。保留米黄、朱红与宋体风格，无运行时依赖或构建步骤。

当前收录 81 个方法和 53 道学习示例。81 个方法已全部完成逐条审校（四批审校记录见下文），当前没有“待审校”方法；53 道学习示例按来源分层：37 道“本站教学示例”，6 道“高考真题 · 维护者确认”，1 道“高考真题 · 与维护者题库一致”，2 道“高考真题改编 · 据维护者题库整理”，7 道中考标签题仍为“出处待核对”；目前没有一道附官方原卷链接。这些状态会同时显示在页面上并由自动检查约束。

## 使用

直接用现代浏览器打开 `index.html`。也可以将网页及其脚本、样式一起部署到现有 GitHub Pages 根目录。无需启动本地服务。

## 内容维护

- `data.js`：大招详解、目录、章节映射、知识模块与学习示例，是下游资料生成脚本的唯一内容数据源。新增详解须提供 `chapter`、`reviewStatus`、`conditions`、`example` 和 `summary`，并在对应学段的目录中加入名称。
- 每道例题使用稳定的 `id`；`techniques` 填写对应的公开大招名称，`knowledgeModule` 必须与知识模块标题一致。未配套详解时使用空数组，页面会引导复习知识模块。
- 页面上的详解、例题与知识模块数量均按数据生成。
- 历史题目的年份、试卷标签保留在 `source.originalLabel` 中作为待核对线索，不作为已验证出处对外显示。本站新增例题使用 `source.status: teaching-example`。
- 肖像仍使用原有图片地址；加载失败时显示文字与图形占位。建议后续把原始肖像作为仓库内的静态资源保存。

## 页面

- `index.html` / `home.js`：首页和初高中入门路线。
- `techniques.html` / `techniques.js`：按学段、关键词、公开状态筛选，查看条件与推导。
- `questions.html` / `questions.js`：独立尝试、折叠解析、返回对应方法或知识模块。
- `learning.js`：统计、稳定链接、详情内容与原生对话框。
- `shared.js`：导航、主题及公共交互；`style.css`：公共样式与响应式布局。

链接示例：`questions.html?g=junior&question=melting-ice`。打开后直接展示对应题目，关闭后恢复列表；刷新保留当前详情。

## 检查

安装开发依赖后，可用 Node.js 检查数据与本地资源链接：

```sh
npm install
npm test
```

完整浏览器检查需要已安装 Playwright 和对应浏览器；不启动网页服务：

```sh
npm run test:browser
```

检查涵盖四页七种宽度、两条入门学习路线、搜索空状态、目录提示、主题保持、全部例题关联链接，以及下述来源与移动端回归。

第一轮内容调整与待办参见 `CONTENT_REVIEW.md`。
## PR #1 后续检查

本次补丁把 PR #1 的内容修订和移动端检查迁移到当前 `main` 的扩充数据，保留 81 个方法、53 道示例与原有学习流程。来源状态规则见 [SOURCE_POLICY.md](SOURCE_POLICY.md)。

运行 `node tests/run.cjs` 执行数据、链接和来源策略检查。运行 `node tests/run.cjs --browser` 额外执行页面与移动阅读回归；需要已安装 Playwright 及对应浏览器。无需启动服务，测试直接打开本地 HTML。

可通过 `PLAYWRIGHT_MODULE` 指向已有 Playwright 包，通过 `BROWSER_PATH` 指定浏览器可执行文件；`BROWSER_ENGINE` 支持 `chromium`（默认）、`webkit`、`firefox`。切换引擎时清除不匹配的 `BROWSER_PATH`。可设置 `SCREENSHOT_DIR` 输出截图。缺少引擎、启动失败或断言失败均返回非零退出码，不视为通过。

新增浏览器检查包括四页七种宽度、320/390 像素竖屏与 568×320 横屏下全部题目和方法详情、触控关闭、关闭按钮尺寸与可见性、焦点恢复、导航断点切换，以及缺少原生 dialog、旧版 MediaQueryList 和存储不可用的模拟环境。模拟降级不等于 iOS Safari 真机或 WebKit 验证；本轮实际运行环境和结果见交付报告。

## 内容审校记录

- `CONTENT_REVIEW_BATCH1.md`：61 个草稿方法的风险排序与第一批 10 条审校记录（2026-09-25）。
- `CONTENT_REVIEW_BATCH2.md`：第二批 16 个中风险方法（排序表第 11–26 条）的审校记录，15 条转已审校、1 条保持草稿（2026-09-25）。
- `CONTENT_REVIEW_BATCH3.md`：第三批 35 个低风险方法（排序表第 27–61 条）的审校记录，全部补写适用条件后转已审校（2026-09-25）。
- `CONTENT_REVIEW_BATCH4.md`：最后 3 个草稿方法的独立复核、改名（高阶等效复合场法 → 重力—电场等效场法，伏安法测电阻误差速判 → 伏安法测电阻系统误差分析并移到高中/恒定电流，正则角动量极值法 → 磁场弦轨迹极值法）与转已审校记录（2026-09-25）。
- `SOURCE_VERIFICATION.md`：历史题目的官方原卷核对流程；`SOURCE_VERIFICATION_BATCH1.md`（官方来源证据调查）、`SOURCE_VERIFICATION_BATCH2.md`（维护者题库核对）。
