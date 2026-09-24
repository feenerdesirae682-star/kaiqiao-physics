# 开窍物理 · 大招体系站

乔凯老师「开窍物理法」的公开教研站：初高中物理 80 个大招 + 真题示范 + 26 个核心模块知识图谱。纯静态页面，无构建步骤。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页：教学法介绍、数据、学员反馈 |
| `techniques.html` | 百大大招库：7 个分类 80 个大招，每个可点开看「核心痛点 / 母题推演 / 秒杀总结 / 耗时对比」 |
| `questions.html` | 真题示范：按 26 个模块分类的中高考真题与大招对应解析 |
| `about.html` | 名师档案 |

## 数据

所有内容都在 `data.js` 的 `window.KAIQIAO` 里，改数据不用动页面：

- `techDetail`：大招详解，键是大招名。字段 `tagline` / `explanation` / `example` / `summary` / `time.before` / `time.after`
- `seniorCategories` / `juniorCategories`：大招分类与顺序，`items` 里的名字必须在 `techDetail` 有对应条目，否则页面显示「未编」
- `questions`：真题，字段 `grade` / `year` / `province` / `module` / `topic` / `content` / `analysis`
- `modules`：26 个模块的知识点图谱
- `testimonials`：学员反馈

新增一个大招：在对应 `categories.items` 加名字，在 `techDetail` 加同名条目。

## 本地预览

```bash
python -m http.server 8000
# 打开 http://127.0.0.1:8000/
```

直接双击 `index.html` 也能看，但 Google Fonts 需要联网。

## 部署

`.github/workflows/pages.yml` 在推送到 `main` 后自动发布到 GitHub Pages。第一次运行会自动开启仓库的 Pages 功能，地址在仓库 Settings → Pages 里看。

## 校验数据完整性

```bash
node -e "
const fs=require('fs'); const w={}; new Function('window',fs.readFileSync('data.js','utf8'))(w);
const K=w.KAIQIAO; const names=[...K.seniorCategories,...K.juniorCategories].flatMap(c=>c.items);
console.log('大招', names.length, '已编', names.filter(n=>K.techDetail[n]).length, '真题', K.questions.length);"
```
