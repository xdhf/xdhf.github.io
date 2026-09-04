# 个人主页

纯 HTML / CSS / JS 实现，**无任何框架**（字体、图标、封面全部本地实现），
正文支持 LaTeX 数学公式，由 **KaTeX** 渲染（通过多 CDN 自动回退加载，是本站**唯一的外部依赖**）。
可离线打开，也可直接部署到任意静态托管平台。

## 功能

- **全页背景图**：背景图作为整页背景（固定 + 自适应裁切），叠加深色蒙层
- **个人档案区**：顶部毛玻璃卡片，头像 + 称呼 + 身份 + GitHub / ORCID / 邮箱图标链接（邮箱点击复制），右侧实时时钟（含"已更新文章 N 篇"）
- **毛玻璃透明卡片**：文章卡片为透明玻璃设计（`backdrop-filter` 模糊），照片透出
- **文章卡片流**：3 列响应式毛玻璃卡片，横向布局（标题在左 + 封面小图在右上 + 顶部分类/日期），摘要 + 封面小图（`thumb` 字段可用图片，缺省 emoji＋渐变）
- 滚动显现动画、回到顶部按钮，移动端自适应

> 页面结构极简：头部（头像 + 名字 + 身份 + 社交链接 + 实时时钟）+ 「文章 / 卡片流」主体。

## 目录

```
个人主页/
├── index.html        # 页面骨架（头部 + 文章卡片流 + 详情）
├── favicon.svg       # 站点图标
├── assets/
│   ├── bg-vangogh.jpg    # 全页背景图
│   └── avatar.jpg        # 头像
├── articles/         # 文章（Markdown，主数据源）
│   ├── list.json     # 文章清单（配置 githubRepo 后不再需要维护）
│   └── *.md          # 每篇文章一个文件（front matter + 正文）
├── css/
│   └── style.css     # 全部样式（变量 + 玻璃卡片）
├── js/
│   ├── config.js     # 站点配置（名称、称呼、头像、社交链接）
│   └── main.js       # Markdown 加载 / 渲染 / 时钟 / 交互
└── README.md
```

## 如何修改

主要改两处 + 文章目录：

### 1. `js/config.js` —— 站点信息

| 字段 | 说明 |
| --- | --- |
| `siteName` | 站点名称（浏览器标题） |
| `author` | 称呼（显示在顶部档案区） |
| `avatarText` | 头像占位文字（无头像图片时显示） |
| `avatarImage` | 头像图片路径（相对站点根目录） |
| `role` | 身份 / 角色（显示在称呼下方） |
| `github` / `orcid` / `email` | 档案区三个链接：GitHub、ORCID 点击跳转；邮箱点击复制到剪贴板（仅填地址） |
| `githubRepo` | 如 `"用户名/仓库名"`；填上并部署到 GitHub Pages 后，新增文章无需改 `list.json`（自动列出），留空则用 `articles/list.json` |

### 2. `articles/*.md` —— 文章（Markdown）

每篇文章一个 `.md` 文件，顶部是 `front matter`（元信息），下方是正文：

```markdown
---
title: 文章标题
category: 分类
date: 2025-11-20
tags: [设计, 配色]
thumb: images/thumb.jpg
excerpt: 可选的摘要（不写则自动取正文开头）
---

这里是正文，支持 Markdown 语法。
```

- **新增文章**：把新的 `.md` 放进 `articles/`，并把文件名追加到 `articles/list.json`（数组顺序即展示顺序）。
- **修改/删除文章**：直接编辑或删除对应 `.md`，再同步 `list.json`。
- 字段说明：`title` 标题、`category` 分类、`date` 日期、`tags` 标签、`thumb` **卡片右上角小封面缩略图**（可选，相对站点根目录；不填则卡片用默认 emoji＋渐变）、`excerpt` 摘要（可省）、`href` 链接（可省）。

### 文章详情页

点击任意文章卡片即可进入详情页：顶部不单独放封面横幅，直接显示标题与正文；正文里的图片 `![]()` 原样显示。卡片右上角的小封面用 front matter 的 `thumb` 字段（可选）。支持返回、Markdown 常用语法（标题、列表、引用、代码块、图片、链接、加粗/斜体等），以及 **LaTeX 数学公式**（`$...$` 行内、`$$...$$` 独立成行，由 KaTeX 渲染）。

> 文章完全以 `articles/` 目录下的 Markdown 文件为准：删除某篇的 `.md` 并从 `list.json`（若用）移除该文件名，即从站点消失。文章不依赖 `file://` 之外的任何兜底数据源。

> **卡片小封面提示**：卡片右上角的小缩略图使用 `object-fit: cover` 居中裁剪（**不会拉伸变形**）。建议提供约 4:3 的小图；不填 `thumb` 字段时显示默认 emoji＋渐变占位。


### 3.（可选）更换背景图 / 调整玻璃透明度

- **更换背景图**：把新图片存为 `assets/bg-vangogh.jpg`（或修改 `css/style.css` 中 `body` 的 `background-image` 的 `url()`）。
- **调整照片清晰度与可读性**：蒙层透明度由 `css/style.css` 顶部的 `--overlay-top / --overlay-mid / --overlay-bottom` 控制；数值越小，照片越清晰。
- **调整卡片透明/模糊度**：改 `--glass`（卡片底色）、`--glass-border`（描边）；模糊强度改 `.article-card` 等处的 `backdrop-filter: blur(16px)`。

## 用 Obsidian 写作并发布到 GitHub Pages

把本仓库文件夹用 Obsidian 打开当作笔记库，写完文章保存 → Obsidian Git 插件自动 commit + push → GitHub Pages 自动重新发布。全程无需改代码、无需手动上传。

### 1. 推送仓库并开启 GitHub Pages

```bash
cd 个人主页
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

然后在 GitHub 仓库：**Settings → Pages → Source 选择 "GitHub Actions"**。
仓库已自带 `.github/workflows/pages.yml`，之后每次 push 到 `main` 都会自动构建发布。

### 2. 用 Obsidian 编辑文章

1. Obsidian → "Open folder as vault" → 选择本仓库文件夹；
2. 在 `articles/` 里**直接新建/编辑 `.md`**（front matter 格式见上）；
3. 正文图片放进仓库目录（如 `assets/`）即可；卡片小封面在 front matter 里用 `thumb` 写相对路径（可选）；
4. 想本地预览：仓库目录里运行本地服务器（见下节）即可。

### 3. 保存即推送（Obsidian Git 插件）

1. Obsidian → 设置 → 第三方插件 → 关闭安全模式 → 浏览 → 安装 **"Git"**；
2. 该插件设置里开启自动备份；
3. 之后每次保存（或在 Obsidian 中执行 `Ctrl+P → Obsidian Git: Push`），改动自动推到 GitHub → Pages 自动更新。

### 4. 新增文章无需改 `list.json`

在 `js/config.js` 填好 `githubRepo`（如 `"heiiiiiii/my-site"`，即 用户名/仓库名）并部署后，
页面会通过 GitHub API 自动列出 `articles/` 目录——**新增/删除 `.md` 直接生效**，不用再维护 `articles/list.json`。
`list.json` 仅在本地预览/未配置 `githubRepo` 时作为回退。

## 本地预览

任选其一：

```bash
# Python
python -m http.server 8080

# Node（npx 一次性）
npx serve .

# 或直接用 VS Code 的 Live Server 插件
```

然后浏览器访问 <http://127.0.0.1:8080>。

> 说明：Markdown 文章需要通过 HTTP 服务器访问才能读取（`file://` 直接双击打开时无法读取，文章列表会为空）。

## 部署

静态站点，直接部署即可：

- **GitHub Pages**：推送到 GitHub 后，Settings → Pages → Source 选 "**GitHub Actions**"（仓库已带 `.github/workflows/pages.yml`，每次 push 自动发布）；或 Source 选 "Deploy from a branch" → `main` / root 也可
- **Vercel / Netlify / Cloudflare Pages**：导入仓库，构建命令留空，输出目录为根目录

## 浏览器兼容

推荐使用 Chromium 系最新版 / Safari 17+ / Firefox 最新版。
滚动显现动画使用 IntersectionObserver，低版本浏览器仅影响入场动画（不影响内容阅读）。
