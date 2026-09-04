/**
 * ============================================================
 * 个人主页 · 主逻辑
 * Markdown 文章加载 / 邮箱复制 / 实时时钟 / 滚动交互
 * 纯原生 JS，无任何依赖
 * ============================================================
 */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var loadedArticles = []; // 从 articles/*.md 加载后的有序文章列表（含 slug）

  /* ============================================================
     1. 填充站点配置（个人档案 + 标题）
     ============================================================ */
  function fillConfig() {
    var av = document.getElementById("profileAvatar");
    if (av) {
      if (CFG.avatarImage) {
        av.innerHTML = '<img src="' + CFG.avatarImage + '" alt="头像">';
      } else {
        av.textContent = CFG.avatarText;
      }
    }

    setText("profileName", CFG.author || CFG.siteName);
    setText("profileRole", CFG.role || "");

    var githubIco = '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
    var orcidIco = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#A6CE39"/><text x="12" y="12.5" text-anchor="middle" dominant-baseline="central" font-family="Georgia, \'Times New Roman\', serif" font-style="italic" font-weight="700" font-size="11.5" fill="#ffffff">iD</text></svg>';
    var mailIco = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';

    var items = [];
    if (CFG.github) items.push('<a class="profile-link" href="' + CFG.github + '" target="_blank" rel="noopener" aria-label="GitHub">' + githubIco + '</a>');
    if (CFG.orcid) items.push('<a class="profile-link" href="' + CFG.orcid + '" target="_blank" rel="noopener" aria-label="ORCID">' + orcidIco + '</a>');
    if (CFG.email) items.push('<button type="button" class="profile-link profile-copy" data-copy-email="' + CFG.email + '" aria-label="复制邮箱">' + mailIco + '</button>');

    var box = document.getElementById("profileLinks");
    if (box && items.length) {
      box.innerHTML = items.join("");

      var copyBtn = box.querySelector(".profile-copy");
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          copyEmail(copyBtn.getAttribute("data-copy-email"));
        });
      }
    }

    document.title = CFG.siteName || "个人主页";
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text != null) el.textContent = text;
  }

  /* ---------- 邮箱复制 + Toast 提示 ---------- */
  var toastEl = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(msg) {
    var t = ensureToast();
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove("show");
    }, 1900);
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyEmail(text) {
    var done = function (ok) {
      showToast(ok ? "✓ 邮箱已复制到剪贴板" : "复制失败，请手动复制");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { done(true); },
        function () { done(legacyCopy(text)); }
      );
    } else {
      done(legacyCopy(text));
    }
  }

  /* ============================================================
     2. Markdown 文章加载（articles/*.md + articles/list.json）
     ============================================================ */
  function parseValue(val) {
    val = (val || "").trim();
    if (val.charAt(0) === "[" && val.charAt(val.length - 1) === "]") {
      var inner = val.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(",").map(function (s) {
        return s.trim().replace(/^["']|["']$/g, "");
      });
    }
    if ((val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
        (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")) {
      return val.slice(1, -1);
    }
    return val;
  }

  function parseFrontMatter(md) {
    var meta = {};
    var body = md;
    var m = md.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
    if (m) {
      m[1].split(/\r?\n/).forEach(function (line) {
        var idx = line.indexOf(":");
        if (idx === -1) return;
        var key = line.slice(0, idx).trim();
        meta[key] = parseValue(line.slice(idx + 1));
      });
      body = m[2].trim();
    }
    return { meta: meta, body: body };
  }

  function markdownExcerpt(md, maxLen) {
    maxLen = maxLen || 120;
    var text = md
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[#>*`~\-_|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > maxLen) {
      text = text.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
    }
    return text;
  }

  function articleFromMarkdown(name, md) {
    var parsed = parseFrontMatter(md);
    var meta = parsed.meta;
    var body = parsed.body;

    return {
      slug: name.replace(/\.md$/i, ""),
      title: meta.title || name.replace(/\.md$/i, ""),
      cat: meta.category || meta.cat || "",
      date: meta.date || "",
      emoji: meta.emoji || "📄",
      colors: (meta.colors && meta.colors.length === 2) ? meta.colors : ["#4f6ef7", "#2b3f8f"],
      thumb: meta.thumb || meta.cover || meta.image || "",
      excerpt: meta.excerpt || markdownExcerpt(body),
      tags: meta.tags || [],
      href: meta.href || "#"
    };
  }

  function listFromGithub() {
    // 部署在 GitHub Pages 时：用 GitHub API 自动列出 articles/ 目录，新增 .md 无需改 list.json
    return fetch("https://api.github.com/repos/" + CFG.githubRepo + "/contents/articles")
      .then(function (r) {
        if (!r.ok) throw new Error("github api failed");
        return r.json();
      })
      .then(function (items) {
        return items
          .filter(function (it) { return /\.md$/i.test(it.name); })
          .map(function (it) { return it.name; });
      });
  }

  function loadArticles() {
    var namesPromise;
    if (CFG.githubRepo) {
      // 配置了 githubRepo：优先走 GitHub API；失败（如离线/本地）则回退 list.json
      namesPromise = listFromGithub().catch(function () {
        return fetch("articles/list.json", { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("list.json not found");
            return r.json();
          });
      });
    } else {
      namesPromise = fetch("articles/list.json", { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("list.json not found");
          return r.json();
        });
    }

    return namesPromise.then(function (names) {
      return Promise.all(names.map(function (name) {
        return fetch("articles/" + name, { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("file not found");
            return r.text();
          })
          .then(function (md) { return articleFromMarkdown(name, md); })
          .catch(function () { return null; });
      })).then(function (list) {
        return list.filter(Boolean).sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        });
      });
    });
  }

  /* ============================================================
     3. 渲染文章卡片
     ============================================================ */
  function renderArticles(list) {
    var grid = document.getElementById("articleGrid");
    if (!grid) return;

    list = (list || []).slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    if (!list.length) {
      grid.innerHTML = '<p class="section-sub" style="grid-column:1/-1">暂无文章</p>';
      observeReveals();
      return;
    }

    grid.innerHTML = list.map(function (a, i) {
      var colors = (a.colors && a.colors.length === 2 ? a.colors : ["#4f6ef7", "#2b3f8f"]).join(", ");
      var href = a.slug ? ("#/article/" + a.slug) : (a.href || "#");
      var coverInner = a.thumb
        ? '<img src="' + a.thumb + '" alt="' + a.title + '">'
        : '<span>' + a.emoji + '</span>';
      var coverCls = "card-cover" + (a.thumb ? " has-img" : "");

      return (
        '<article class="article-card reveal" style="transition-delay:' + (i % 3) * 0.08 + 's">' +
        '  <header class="card-meta">' +
        '    <span class="card-cat">' + a.cat + "</span>" +
        '    <span class="card-date">' + formatDate(a.date) + "</span>" +
        "  </header>" +
        '  <div class="card-top">' +
        '    <h3 class="card-title"><a href="' + href + '">' + a.title + "</a></h3>" +
        '    <a class="' + coverCls + '" href="' + href + '" style="background:linear-gradient(135deg,' + colors + ')">' + coverInner + "</a>" +
        "  </div>" +
        '  <p class="card-excerpt">' + a.excerpt + "</p>" +
        "</article>"
      );
    }).join("");

    // 点击卡片任意位置进入详情
    grid.querySelectorAll(".article-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var link = card.querySelector(".card-title a");
        if (link && link.getAttribute("href").indexOf("#/article/") === 0) {
          location.hash = link.getAttribute("href");
        }
      });
    });

    observeReveals();
  }

  function formatDate(str) {
    if (!str) return "";
    var d = new Date(str + "T00:00:00");
    if (isNaN(d.getTime())) return str;
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* ============================================================
     4. Markdown 渲染（轻量）
     ============================================================ */
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inlineMd(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async">');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }

  /* ---------- GFM 表格辅助 ---------- */

  // 拆分表格行单元格（支持 \| 转义），忽略行首/行尾的装饰性 |
  function splitTableRow(line) {
    var s = line.trim();
    if (s.charAt(0) === "|") s = s.slice(1);
    if (s.charAt(s.length - 1) === "|") s = s.slice(0, -1);
    var cells = [], buf = "";
    for (var k = 0; k < s.length; k++) {
      var ch = s.charAt(k);
      if (ch === "\\" && s.charAt(k + 1) === "|") { buf += "|"; k++; }
      else if (ch === "|") { cells.push(buf.trim()); buf = ""; }
      else buf += ch;
    }
    cells.push(buf.trim());
    return cells;
  }

  // 分隔行（表头下方）：由 | --- | :--- | ---: | :---: | 之类单元格组成
  function isDelimiterRow(line) {
    var s = line.trim();
    if (!s) return false;
    if (s.charAt(0) === "|") s = s.slice(1);
    if (s.charAt(s.length - 1) === "|") s = s.slice(0, -1);
    if (!s) return false;
    return s.split("|").every(function (cell) {
      return /^:?\s*-{1,}\s*:?$/.test(cell.trim());
    });
  }

  function alignStyle(align) {
    return align ? " style=\"text-align:" + align + "\"" : "";
  }

  function renderMarkdown(md) {
    var lines = md.split(/\r?\n/);
    var out = [];
    var i = 0;
    var list = null;
    var inCode = false, codeBuf = [];

    function closeList() { if (list) { out.push("</" + list + ">"); list = null; } }

    while (i < lines.length) {
      var line = lines[i];

      if (/^```/.test(line.trim())) {
        closeList();
        if (!inCode) { inCode = true; codeBuf = []; }
        else { out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>"); inCode = false; }
        i++;
        continue;
      }
      if (inCode) { codeBuf.push(line); i++; continue; }

      var t = line.trim();
      if (t === "") { closeList(); i++; continue; }

      var h = t.match(/^(#{1,6})\s+(.*)$/);
      if (h) { closeList(); out.push("<h" + h[1].length + ">" + inlineMd(h[2]) + "</h" + h[1].length + ">"); i++; continue; }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { closeList(); out.push("<hr>"); i++; continue; }

      // GFM 表格：表头行下方紧跟分隔行（| --- | :---: | 等）时按表格解析
      if (t.indexOf("|") !== -1 && i + 1 < lines.length && isDelimiterRow(lines[i + 1])) {
        closeList();
        var headerCells = splitTableRow(t);
        var aligns = splitTableRow(lines[i + 1]).map(function (cell) {
          var c = cell.trim();
          if (c.charAt(0) === ":" && c.charAt(c.length - 1) === ":") return "center";
          if (c.charAt(c.length - 1) === ":") return "right";
          if (c.charAt(0) === ":") return "left";
          return "";
        });
        i += 2;
        var th = ["<div class=\"table-wrap\"><table><thead><tr>"];
        for (var hj = 0; hj < headerCells.length; hj++) {
          th.push("<th scope=\"col\"" + alignStyle(aligns[hj]) + ">" + inlineMd(headerCells[hj]) + "</th>");
        }
        th.push("</tr></thead><tbody>");
        while (i < lines.length && lines[i].trim() !== "" && lines[i].indexOf("|") !== -1) {
          var rowCells = splitTableRow(lines[i]);
          th.push("<tr>");
          for (var rj = 0; rj < headerCells.length; rj++) {
            th.push("<td" + alignStyle(aligns[rj]) + ">" + inlineMd(rowCells[rj] == null ? "" : rowCells[rj]) + "</td>");
          }
          th.push("</tr>");
          i++;
        }
        th.push("</tbody></table></div>");
        out.push(th.join(""));
        continue;
      }

      if (t.charAt(0) === ">") {
        closeList();
        var q = [];
        while (i < lines.length && lines[i].trim().charAt(0) === ">") { q.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
        out.push("<blockquote>" + renderMarkdown(q.join("\n")) + "</blockquote>");
        continue;
      }

      if (/^[-*+]\s+/.test(t)) {
        if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; }
        out.push("<li>" + inlineMd(t.replace(/^[-*+]\s+/, "")) + "</li>");
        i++;
        continue;
      }

      if (/^\d+[.)]\s+/.test(t)) {
        if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; }
        out.push("<li>" + inlineMd(t.replace(/^\d+[.)]\s+/, "")) + "</li>");
        i++;
        continue;
      }

      closeList();
      var para = [];
      while (i < lines.length && lines[i].trim() !== "" &&
             !/^(#{1,6}\s|```|>|[-*+]\s|\d+[.)]\s)/.test(lines[i].trim()) &&
             !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) {
        para.push(lines[i].trim());
        i++;
      }
      out.push("<p>" + inlineMd(para.join(" ")) + "</p>");
    }
    closeList();
    if (inCode) out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
    return out.join("\n");
  }

  /* ============================================================
     5. 文章详情（hash 路由：#/article/<slug>）
     ============================================================ */
  function currentRoute() {
    var m = location.hash.match(/^#\/article\/(.+)$/);
    return m ? { type: "article", slug: decodeURIComponent(m[1]) } : { type: "list" };
  }

  function showList() {
    document.getElementById("clock").hidden = false;
    document.getElementById("profileSection").hidden = false;
    document.getElementById("articles").hidden = false;
    document.getElementById("articleView").hidden = true;
  }

  function showArticle(slug) {
    fetch("articles/" + slug + ".md", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("not found"); return r.text(); })
      .then(function (md) {
        var parsed = parseFrontMatter(md);
        var meta = parsed.meta;
        var body = parsed.body;

        setText("avTitle", meta.title || slug);
        setText("avCat", meta.category || meta.cat || "");
        setText("avDate", formatDate(meta.date));

        // 详情页顶部不再单独放封面横幅；正文里的图片照常在正文显示
        var avBody = document.getElementById("avBody");
        avBody.innerHTML = renderMarkdown(body);

        // 使用 KaTeX 渲染正文中的 LaTeX 公式（$...$ 与 $$...$$）
        // window.katexRender 由 index.html 内联加载器提供（多 CDN 自动回退，未就绪时排队等待）
        if (typeof window.katexRender === "function") {
          window.katexRender(avBody);
        }

        var idx = -1;
        for (var k = 0; k < loadedArticles.length; k++) {
          if (loadedArticles[k].slug === slug) { idx = k; break; }
        }
        var prev = idx > 0 ? loadedArticles[idx - 1] : null;
        var next = idx >= 0 && idx < loadedArticles.length - 1 ? loadedArticles[idx + 1] : null;
        renderPager(prev, next);

        document.getElementById("clock").hidden = true;
        document.getElementById("profileSection").hidden = true;
        document.getElementById("articles").hidden = true;
        document.getElementById("articleView").hidden = false;
        window.scrollTo(0, 0);
      })
      .catch(function () {
        location.hash = "#/";
      });
  }

  function renderPager(prev, next) {
    var pager = document.getElementById("articlePager");
    if (!pager) return;

    var prevHtml = prev
      ? '<a class="pager-item pager-prev" href="#/article/' + prev.slug + '"><span class="pager-label">← 上一篇</span><span class="pager-title">' + prev.title + "</span></a>"
      : '<span class="pager-item pager-prev pager-empty">没有上一篇</span>';

    var nextHtml = next
      ? '<a class="pager-item pager-next" href="#/article/' + next.slug + '"><span class="pager-label">下一篇 →</span><span class="pager-title">' + next.title + "</span></a>"
      : '<span class="pager-item pager-next pager-empty">没有下一篇</span>';

    pager.innerHTML = prevHtml + nextHtml;
  }

  function handleRoute() {
    var route = currentRoute();
    if (route.type === "article") showArticle(route.slug);
    else showList();
  }

  /* ============================================================
     4. 滚动交互（回到顶部 / 显现动画）
     ============================================================ */
  var revealObserver = null;

  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function initScroll() {
    var backTop = document.getElementById("backTop");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (backTop) backTop.classList.toggle("show", y > 480);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    observeReveals();
  }

  /* ============================================================
     6. 实时时钟
     ============================================================ */
  var WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function updateClock() {
    var t = document.getElementById("clockTime");
    var d = document.getElementById("clockDate");
    if (!t || !d) return;
    var now = new Date();
    t.textContent = pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds());
    d.textContent = now.getFullYear() + " 年 " + (now.getMonth() + 1) + " 月 " + now.getDate() + " 日 星期" + WEEKDAY[now.getDay()];
  }

  /* ============================================================
     启动
     ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    fillConfig();
    initScroll();
    updateClock();
    setInterval(updateClock, 1000);

    // 从 articles/*.md 读取文章；读取失败或为空则显示"暂无文章"提示
    loadArticles()
      .then(function (list) {
        loadedArticles = list && list.length ? list : [];
        setArticleCount(loadedArticles.length);
        renderArticles(loadedArticles);
      })
      .catch(function () {
        setArticleCount(0);
        renderArticles([]);
      })
      .then(function () {
        handleRoute();
      });

    window.addEventListener("hashchange", handleRoute);
  });

  function setArticleCount(n) {
    var el = document.getElementById("articleCount");
    if (el) el.textContent = n;
  }
})();
