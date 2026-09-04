---
title: 用 Obsidian 更新本站
category: 站点
date: 2026-09-03
tags:
  - Obsidian
thumb: assets/obsidian.svg
excerpt: 本站的每篇文章就是一个 Markdown 文件。在 Obsidian 里写好保存，Git 插件自动推送到 GitHub，GitHub Actions 构建后由 Pages 发布。
---

纯静态主页：没有后台、没有数据库，**文章就是 Markdown 文件**。
![](assets/obsidian.svg)

*图 1：从 Obsidian 写作到 GitHub Pages 上线的完整流程*

## 一、整体思路：文章即文件，保存即发布

本站的代码结构刻意保持极简，内容与展示彻底分离：

- `index.html` 只负责页面骨架，基本不用改；
- `js/config.js` 存放站点信息（称呼、头像、社交链接等）；
- `articles/*.md` 是**唯一的内容源**——每一篇 `.md` 就是一篇文章；
- `.github/workflows/pages.yml` 是发布脚本：一旦 `main` 分支收到推送，就自动把整个仓库构建并发布为网站。

Obsidian 在这里的角色是**Markdown 编辑器**：配合 Git 插件做到「保存即推送」，写文章时完全感觉不到 git 的存在。其实不用 Obsidian 也一样——手动改 `.md` 后 `git push`，机制完全相同。

## 二、Obsidian 准备

1. 打开 Obsidian → **Open folder as vault**，选择本仓库下的 `articles/` 文件夹（本身就是一个配好的库；`.obsidian` 配置已被 `.gitignore` 忽略，不会污染仓库）。
2. 设置 → 第三方插件 → 关闭安全模式 → 浏览，搜索安装 **Git**。
3. 在该插件设置里把 *Auto commit-and-sync interval (minutes)* 填上适合的时间间隔，此后每次 `Ctrl+S` 保存，插件都会自动 commit 并 push。

> 提示：Git 只是在仓库里执行 git 命令，所以仓库需先完成首次 `git remote add origin` 并推送过；本机也要有 GitHub 的登录凭证。第一次手动推成功后，之后才谈得上全自动。

## 三、文章

每篇文章的 `.md` 顶部是一段用 `---` 包裹的 **front matter**（元信息），下方是正文。本站识别的字段如下。

```markdown
---
title: 用 Obsidian 更新本站
category: 站点
date: 2026-09-03
tags: [Obsidian, GitHub Pages]
thumb: assets/小封面图.png
emoji: 🎨
colors: ["#4f6ef7", "#2b3f8f"]
excerpt: 本站的每篇文章就是一个 Markdown 文件。在 Obsidian 里写好保存，Obsidian Git 插件自动推送到 GitHub，GitHub Actions 构建后由 Pages 发布。
---

正文从这里开始，支持 Markdown 语法。
```

- `title`（必填）：文章标题，显示在卡片与详情页顶部；
- `category`（推荐）：显示在卡片左上角的分类小标签；
- `date`（推荐）：写成 `YYYY-MM-DD`，文章按它从新到旧排序；
- `tags`：标签数组，供归档检索用；
- `thumb`（可选）：卡片右上角的小封面缩略图（相对站点根目录，约 4:3 小图）；不填则卡片显示默认 emoji＋渐变占位；
- `emoji`（可选）：无 thumb 时的图标；
- `colors`（可选）：无 thumb 时的渐变底色；
- `excerpt`：卡片摘要（可省，不写就自动截取正文开头 120 字左右）。

> **务必保持元信息为单行「键: 值」。** 本站用极简解析器读取 front matter；如果改用 Obsidian 的“属性面板”把 `tags` 编辑成列表型，Obsidian 会存成多行 `- 条目` 的 YAML，本站将读不到标签。稳妥做法：元信息在**源码模式**下照上面模板手写，正文再用所见即所得编辑。

## 四、正文

本站自带一个轻量 Markdown 渲染器，以下写法都会正常显示：

- 标题：`#` 到 `######`（正文建议从 `##` 用起）；
- 段落、**加粗**、*斜体*、`行内代码`；
- 有序 / 无序列表（单层；暂不支持嵌套列表与任务清单 `- [ ]`）；
- 引用块（行首 `>`）、分隔线（`---`）、围栏代码块；
- 图片与链接：语法与标准 Markdown 一致，写法示例见第五节代码块；
- LaTeX 数学公式：行内用 `$...$`，独立成行用 `$$...$$`（由 KaTeX 渲染，见下方说明）；

> Obsidian 自带不少“库内”语法——双链 `[[笔记名]]`、嵌入 `![[附件.png]]`、提示块 `> [!note] 提示`、Mermaid 图表——它们依赖 Obsidian 本地解析，**本站不会渲染**。想让它们出现在网站上，请改写为标准 Markdown：双链改普通链接、图表改贴图片。
>
> **数学公式例外：** 标准 LaTeX 公式（行内 `$...$`、独立成行 `$$...$$`）本站会用 KaTeX 正常渲染，直接写即可；仅 Obsidian 特有的那类“库内语法”仍不被本站渲染。

## 五、图片

正文里的图片 `![]()` 照常在正文显示，详情页顶部不会被截走当横幅。**卡片右上角那个小封面**想用图片，就在 front matter 里填 `thumb` 字段（可选）：

```markdown
thumb: assets/小图.png    # 卡片右上角小封面，约 4:3（可选）
![](assets/正文插图.png)    # 正文里照常插图
```

- 图片路径一律按**站点根目录**解析，而不是按文章所在目录解析，也不是按 Obsidian 库根解析；
- 不填 `thumb` 时，卡片右上角显示默认 emoji＋渐变占位。

> 小坑：本站的 Obsidian 库开在 `articles/` 下，库内看不到仓库根的 `assets/`。若在 Obsidian 里直接拖入图片，附件会被存进 `articles/` 目录，此时正文路径要从站点根目录换算着写——例如图片在 `articles/` 下，正文就写 `articles/图片名.png`，图片随 `.md` 一起提交即可正常显示。嫌麻烦的话，也可以把 Obsidian 库改成整个仓库根目录，附件统一放进 `assets/`。

## 六、实操

1. 在 `articles/` 下新建 `xxx.md`，照第三节的模板填好元信息、写好正文；
2. `Ctrl+S` 保存——Git 自动 commit + push（没开自动备份的话，就 `Ctrl+P` 执行 `Obsidian Git: Push`）；
3. 等 GitHub Actions 把 `pages.yml` 跑完，刷新本站即可看到新文章；
4. 想改就再编辑一次再保存；想下线就删掉 `.md`。历史版本都在 git 里，随时可回退。

想发布前先在本地看看效果，就在仓库根目录起一个静态服务器：

```bash
python -m http.server 8080
```

然后浏览器打开 [http://127.0.0.1:8080](http://127.0.0.1:8080)。注意通过 http 访问——直接双击 `index.html` 用 `file://` 打开时浏览器不允许读取本地 Markdown，文章列表会是空的。

## 七、小结

配置好之后，日常维护就是**在 Obsidian 里写 Markdown 并按保存**，其余全部自动化。

本站源码托管在 [GitHub](https://github.com/xdhf/xdhf.github.io)。
