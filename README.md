# 开窍物理

初高中物理方法与例题的静态学习网站。保留米黄、朱红与宋体风格，无运行时依赖或构建步骤。

## 使用

直接用现代浏览器打开 `index.html`。也可以将网页及其脚本、样式一起部署到现有 GitHub Pages 根目录。无需启动本地服务。

## 内容维护

- `data.js`：大招详解、目录、知识模块与学习示例。新增详解须提供 `conditions`、`example` 和 `summary`，并在对应学段的目录中加入名称。
- 每道例题使用稳定的 `id`；`techniques` 填写对应的公开大招名称，`knowledgeModule` 必须与知识模块标题一致。未配套详解时使用空数组，页面会引导复习知识模块。
- 页面上的详解、例题与知识模块数量均按数据生成。
- 现有题目按学习示例展示。原文件的年份、试卷标签保留在数据中作为待核对线索，不作为已验证出处对外显示。
- 肖像仍使用原有图片地址；加载失败时显示文字与图形占位。建议后续把原始肖像作为仓库内的静态资源保存。

## 页面

- `index.html` / `home.js`：首页和初高中入门路线。
- `techniques.html` / `techniques.js`：按学段、关键词、公开状态筛选，查看条件与推导。
- `questions.html` / `questions.js`：独立尝试、折叠解析、返回对应方法或知识模块。
- `learning.js`：统计、稳定链接、详情内容与原生对话框。
- `shared.js`：导航、主题及公共交互；`style.css`：公共样式与响应式布局。

链接示例：`questions.html?g=junior&question=melting-ice`。打开后直接展示对应题目，关闭后恢复列表；刷新保留当前详情。

## 检查

仅需 Node.js 即可检查数据与本地资源链接：

```sh
node tests/check.cjs
```

完整浏览器检查需要已安装 Playwright 和 Microsoft Edge；不启动网页服务：

```sh
node tests/check.cjs --browser
```

可通过 `PLAYWRIGHT_MODULE` 指定已有 Playwright 模块路径，通过 `BROWSER_PATH` 指定浏览器路径，通过 `SCREENSHOT_DIR` 保存检查截图。检查涵盖四页、五种宽度、两条入门学习路线、搜索空状态、目录提示、原生弹窗、主题保持及全部例题的关联链接。

第一轮内容调整与待办参见 `CONTENT_REVIEW.md`。
