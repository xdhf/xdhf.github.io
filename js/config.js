/**
 * ============================================================
 * 站点配置
 * 修改这里的文字后，整个页面会自动更新。
 * ============================================================
 */
window.SITE_CONFIG = {
  /* ---------- 站点名称与作者 ---------- */
  siteName: "~dhf: index",        // 站点名（用于浏览器标题等）
  author: "H.F. Deng",          // 称呼（显示在个人档案区）
  avatarText: "D",            // 头像占位文字（建议取昵称首字）
  avatarImage: "assets/avatar.jpg",  // 头像图片（相对站点根目录；留空则显示上面 avatarText 的首字）
  role: "AI for Science",    // 身份 / 角色（显示在名字下方）
  githubRepo: "xdhf/xdhf.github.io", // GitHub 用户名/仓库名。文章列表优先读取 articles/list.json（同源、稳定）；仅当 list.json 缺失时，才用 GitHub API 自动列出 articles/*.md 作为回退

  /* ---------- 个人档案链接（头像右侧） ---------- */
  github: "https://github.com/xdhf",                 // GitHub 主页地址
  orcid: "https://orcid.org/0009-0008-7428-3281",       // ORCID 主页地址
  email: "201905472@qq.com"                              // 邮箱地址（仅填地址，自动转为 mailto）
};
