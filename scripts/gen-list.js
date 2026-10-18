/**
 * 自动生成 articles/list.json
 * 扫描 articles/*.md（不区分大小写），按文件名排序后写入 list.json。
 *
 * 设计目标：让「新增/删除/重命名 .md 文章」无需手动维护 list.json。
 * 在 GitHub Actions 部署前运行，确保线上清单永远与实际 .md 文件一致；
 * 本地预览时也可手动运行：node scripts/gen-list.js
 *
 * 用法：
 *   node scripts/gen-list.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

// 仓库根目录 = 本脚本所在目录的上一级
const root = path.resolve(__dirname, "..");
const articlesDir = path.join(root, "articles");
const listPath = path.join(articlesDir, "list.json");

function main() {
  if (!fs.existsSync(articlesDir)) {
    console.error("未找到 articles 目录：" + articlesDir);
    process.exit(1);
  }

  // 列出所有 .md 文件（不区分大小写），只取文件名
  const names = fs
    .readdirSync(articlesDir)
    .filter((f) => /\.md$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  const json = JSON.stringify(names, null, 2) + "\n";
  fs.writeFileSync(listPath, json, "utf8");

  console.log("已生成 " + listPath + "，共 " + names.length + " 篇：");
  names.forEach((n) => console.log("  - " + n));
}

main();