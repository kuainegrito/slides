/* ============================================================
   血液循环 · 课件渲染引擎 v0.2
   v0.2 新增：分步显现引擎（PPT 动画顺序 + 无动画页自动合成顺序）、
   group 递归渲染、节精修覆盖器 API、律动入场动效。
   数据来源：data/slides.json + data/sections.json
   ============================================================ */
(function () {
  'use strict';

  var BASE_W = 1280, BASE_H = 720;

  var Deck = {
    sections: null, slides: null, sec: null,
    pages: [], cur: 0,
    overrides: {},       // 页码 -> fn(el, data, api) -> {steps:[[el..]], static:[el..]} | null
  };

  /* ---------- 工具 ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function ce(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function getQuery(n) {
    var m = location.search.match(new RegExp('[?&]' + n + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* ---------- 文本渲染 ---------- */
  function renderParas(paras) {
    var html = '';
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i], line = '';
      for (var j = 0; j < p.runs.length; j++) {
        var r = p.runs[j], style = '';
        if (r.fs) style += 'font-size:' + (r.fs * BASE_W / 960 * 0.72) + 'px;';
        if (r.b) style += 'font-weight:600;';
        if (r.c) style += 'color:#' + r.c + ';';
        line += '<span style="' + style + '">' + esc(r.t) + '</span>';
      }
      var indent = p.lvl ? ' style="padding-left:' + (p.lvl * 18) + 'px"' : '';
      html += '<p' + indent + '>' + line + '</p>';
    }
    return html;
  }

  /* ---------- 单个形状 → 元素 ---------- */
  function shapeEl(sh) {
    var el;
    if (sh.type === 'text') {
      el = ce('div', 'obj text', renderParas(sh.paras));
    } else if (sh.type === 'pic' && sh.src) {
      el = ce('div', 'obj pic');
      var img = ce('img');
      img.loading = 'lazy';
      img.src = 'assets/img/' + sh.src;
      img.alt = sh.alt || '';
      el.appendChild(img);
    } else if (sh.type === 'table' && sh.rows) {
      el = ce('div', 'obj text');
      var t = ce('table');
      sh.rows.forEach(function (row) {
        var tr = ce('tr');
        row.forEach(function (c) { tr.appendChild(ce('td', null, esc(c))); });
        t.appendChild(tr);
      });
      el.appendChild(t);
    } else if (sh.type === 'group' && sh.children && sh.children.length) {
      el = ce('div', 'obj group');
      renderGroupChildren(el, sh.children);
    } else if (sh.type === 'group' && sh.text && sh.text.length) {
      el = ce('div', 'obj group-note', esc(sh.text.join(' / ')));
    } else {
      return null;
    }
    el.style.left = sh.l + 'px';
    el.style.top = sh.t + 'px';
    el.style.width = sh.w + 'px';
    el.style.height = sh.h + 'px';
    return el;
  }

  function renderGroupChildren(container, children) {
    children.forEach(function (ch) {
      var el;
      if (ch.kind === 'text') {
        el = ce('div', 'obj text', renderParas(ch.paras || []));
      } else if (ch.kind === 'pic' && ch.src) {
        el = ce('div', 'obj pic');
        var img = ce('img');
        img.loading = 'lazy';
        img.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g|gif|bmp)$/i, '.webp');
        el.appendChild(img);
      } else if (ch.kind === 'group' && ch.children) {
        el = ce('div', 'obj group');
        renderGroupChildren(el, ch.children);
      } else {
        return;
      }
      // 子坐标已是 1280 坐标系的绝对值 → 转相对父容器
      el.style.position = 'absolute';
      el.style.left = (ch.l - parseFloat(container.style.left || 0)) + 'px';
      el.style.top = (ch.t - parseFloat(container.style.top || 0)) + 'px';
      el.style.width = ch.w + 'px';
      el.style.height = ch.h + 'px';
      container.appendChild(el);
    });
  }

  /* ---------- 分步计算 ----------
     有 anim：steps 来自 PPT 点击序列；static 恒显。
     无 anim：合成——标题区（顶<100 的文本）恒显，其余按阅读顺序
              （纵向中心→横向）逐个/成带为一步。 */
  function computeSteps(data) {
    var n = data.shapes.length;
    if (data.anim && data.anim.steps && data.anim.steps.length) {
      return { steps: data.anim.steps.slice(), staticIdx: data.anim.static || [] };
    }
    var staticIdx = [], order = [];
    for (var i = 0; i < n; i++) {
      var sh = data.shapes[i];
      var isTitle = sh.type === 'text' && sh.t < 100 && sh.h < 90;
      if (isTitle) staticIdx.push(i);
      else order.push(i);
    }
    order.sort(function (a, b) {
      var A = data.shapes[a], B = data.shapes[b];
      var ca = A.t + A.h / 2, cb = B.t + B.h / 2;
      return (Math.abs(ca - cb) > 40) ? (ca - cb) : (A.l - B.l);
    });
    // 纵向中心差 <40px 的相邻形状并为一步（同一横带）
    var steps = [], band = [], lastC = null;
    order.forEach(function (i) {
      var sh = data.shapes[i], c = sh.t + sh.h / 2;
      if (lastC !== null && Math.abs(c - lastC) > 40) { steps.push(band); band = []; }
      band.push(i); lastC = c;
    });
    if (band.length) steps.push(band);
    return { steps: steps, staticIdx: staticIdx };
  }

  /* ---------- 单页渲染 ---------- */
  function renderSlide(n) {
    var data = Deck.slides[n - 1];
    var page = ce('div', 'slide-page');
    page.dataset.n = n;

    /* 覆盖器优先：约定返回 {steps:[[el..]..], static:[el..]} 由引擎接管步进 */
    if (Deck.overrides[n]) {
      var api = { ce: ce, esc: esc, data: data, sec: Deck.sec, BASE_W: BASE_W, BASE_H: BASE_H };
      var ret = Deck.overrides[n](page, data, api);
      if (ret && ret.steps) {
        ret.static && ret.static.forEach(function (el) { el.dataset.step = -1; page.appendChild(el); });
        ret.steps.forEach(function (els, si) {
          els.forEach(function (el) { el.dataset.step = si; page.appendChild(el); });
        });
        page._totalSteps = ret.steps.length;
        page._revealed = 0;
        return page;
      }
      // 覆盖器全自控（不分步）
      page.classList.add('no-steps');
      return page;
    }

    if (!data) { page.appendChild(ce('div', 'loading', '第 ' + n + ' 页 · 待提取')); return page; }

    var plan = computeSteps(data);
    var els = new Array(data.shapes.length);
    for (var i = 0; i < data.shapes.length; i++) {
      els[i] = shapeEl(data.shapes[i]);
    }
    // 标题样式
    plan.staticIdx.forEach(function (si) {
      var el = els[si];
      if (el) { el.dataset.step = -1; page.appendChild(el); }
    });
    plan.steps.forEach(function (band, si) {
      band.forEach(function (shIdx, k) {
        var el = els[shIdx];
        if (!el) return;
        el.dataset.step = si;
        el.style.transitionDelay = (k * 90) + 'ms';
        page.appendChild(el);
      });
    });
    // 未被纳入的（空文本等已返回 null）
    page._totalSteps = plan.steps.length;
    page._revealed = 0;
    return page;
  }

  /* ---------- App 嵌入页 ---------- */
  function renderAppSlide(app) {
    var page = ce('div', 'app-slide');
    var head = ce('div', 'app-head');
    head.appendChild(ce('span', 'badge', '互动工具'));
    head.appendChild(ce('b', null, esc(app.name)));
    if (app.note) head.appendChild(ce('span', null, esc(app.note)));
    var a = ce('a', null, '新窗口打开 ↗');
    a.href = app.url; a.target = '_blank'; a.rel = 'noopener';
    head.appendChild(a);
    page.appendChild(head);
    if (app.guide && app.guide.length) {
      var g = ce('div', 'app-guide');
      app.guide.forEach(function (s, i) {
        var chip = ce('div', 'app-guide-chip');
        chip.appendChild(ce('i', null, String(i + 1)));
        chip.appendChild(ce('span', null, esc(s)));
        g.appendChild(chip);
      });
      page.appendChild(g);
    }
    var iframe = ce('iframe');
    iframe.dataset.src = app.url;
    iframe.setAttribute('allow', 'autoplay; fullscreen; clipboard-write');
    page.appendChild(iframe);
    page._appIframe = iframe;
    /* 二维码先行：PPT 里的扫码页在网页版变成 app 页的第一步——
       先让学生扫码把工具装进口袋，按 → 再在大屏展开 app */
    if (app.qrImages && app.qrImages.length) {
      iframe.dataset.step = 0;
      var cover = ce('div', 'qr-cover');
      cover.dataset.step = 0;
      var inner = '<div class="qr-title">先扫码 · 把模拟器装进自己手机</div><div class="qr-row">';
      app.qrImages.forEach(function (q) {
        inner += '<figure><img src="' + esc(q.src) + '" alt="二维码"><figcaption>' + esc(q.label || '') + '</figcaption></figure>';
      });
      inner += '</div><div class="qr-hint">课上跟大屏一起操作 · 课后用自己的手机复现</div>' +
        '<div class="qr-go">按 <b>→</b> 或点击这里，在大屏打开</div>';
      cover.innerHTML = inner;
      cover.onclick = function () { var b = stageEl && stageEl.querySelector('.flip.next'); if (b) b.click(); };
      page.appendChild(cover);
      page._totalSteps = 1;
      page._revealed = 0;
    }
    return page;
  }

  /* ---------- 页面序列 ---------- */
  function buildPages() {
    var sec = Deck.sec, pages = [], appMap = {};
    (sec.apps || []).forEach(function (a) { appMap[a.at] = a; });
    for (var n = sec.range[0]; n <= sec.range[1]; n++) {
      pages.push({ type: 'slide', n: n });
      if (appMap[n]) pages.push({ type: 'app', app: appMap[n], n: n });
    }
    Deck.pages = pages;
  }

  /* ---------- 舞台装配 ---------- */
  var stageEl, pageEls = [];
  function assemble() {
    stageEl = $('#stage');
    stageEl.innerHTML = '';
    pageEls = [];
    Deck.pages.forEach(function (p) {
      var el = p.type === 'app' ? renderAppSlide(p.app) : renderSlide(p.n);
      stageEl.appendChild(el);
      pageEls.push(el);
    });
    var prev = ce('div', 'flip prev'), next = ce('div', 'flip next');
    prev.title = '上一页 / 上一步'; next.title = '下一步 / 下一页';
    prev.onclick = function () { back(); };
    next.onclick = function () { forward(); };
    stageEl.appendChild(prev); stageEl.appendChild(next);
    fitStage();
  }

  function fitStage() {
    var wrap = $('.stage-wrap');
    var scale = Math.min(wrap.clientWidth - 30, wrap.clientHeight - 20) / BASE_H;
    scale = Math.min(scale, (wrap.clientWidth - 30) / BASE_W);
    stageEl.style.transform = 'scale(' + Math.max(scale, 0.2) + ')';
  }

  /* ---------- 步进核心 ---------- */
  function applySteps(pageEl) {
    var rev = pageEl._revealed || 0;
    var kids = pageEl.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.dataset && el.dataset.step !== undefined) {
        var s = +el.dataset.step;
        el.classList.toggle('on', s === -1 || s < rev);
      }
    }
    updateStepBadge();
  }

  function updateStepBadge() {
    var el = pageEls[Deck.cur];
    var badge = $('#stepBadge');
    if (!badge) return;
    if (el && el._totalSteps > 0) {
      badge.textContent = '步 ' + Math.min(el._revealed + 1, el._totalSteps) + '/' + el._totalSteps;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  function pulse() {
    stageEl.classList.remove('beat');
    void stageEl.offsetWidth;   /* 重触发动画 */
    stageEl.classList.add('beat');
  }

  function forward() {
    var el = pageEls[Deck.cur];
    if (el && el._totalSteps > 0 && (el._revealed || 0) < el._totalSteps) {
      el._revealed++;
      applySteps(el);
      pulse();
      return;
    }
    go(Deck.cur + 1);
  }

  function back() {
    var el = pageEls[Deck.cur];
    if (el && el._totalSteps > 0 && (el._revealed || 0) > 0) {
      el._revealed--;
      applySteps(el);
      return;
    }
    go(Deck.cur - 1);
  }

  /* ---------- 翻页 ---------- */
  function go(idx, pushHash) {
    if (idx < 0 || idx >= Deck.pages.length) return;
    var oldEl = pageEls[Deck.cur];
    if (oldEl && oldEl._appIframe && idx !== Deck.cur) {
      oldEl._appIframe.src = 'about:blank';
    }
    Deck.cur = idx;
    pageEls.forEach(function (el, i) { el.classList.toggle('current', i === idx); });
    var p = Deck.pages[idx];
    var el = pageEls[idx];
    if (el._appIframe && (!el._appIframe.src || el._appIframe.src.indexOf('about:blank') === 0)) {
      el._appIframe.src = el._appIframe.dataset.src;
    }
    applySteps(el);
    $('#pageNo').textContent = (idx + 1);
    $('.progress i').style.width = ((idx + 1) / Deck.pages.length * 100) + '%';
    updateNotes(p);
    highlightTopic(p);
    if (pushHash !== false) {
      var h = p.type === 'app' ? '#app-' + p.n : '#s' + p.n;
      history.replaceState(null, '', h);
    }
  }

  function highlightTopic(p) {
    if (!p || p.type !== 'slide') return;
    var n = p.n, topics = Deck.sec.topics || [], activeIdx = -1;
    for (var i = 0; i < topics.length; i++) if (n >= topics[i].at) activeIdx = i;
    document.querySelectorAll('.topic').forEach(function (el, i) {
      el.classList.toggle('active', i === activeIdx);
    });
  }

  /* ---------- 讲稿（清理计时残留行） ---------- */
  function cleanNotes(t) {
    return t.split('\n')
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l && !/^\d+\s*[''′″`]*$/.test(l); })
      .join('\n');
  }
  function updateNotes(p) {
    var panel = $('#notesBody');
    if (!panel) return;
    if (p.type === 'app') { panel.textContent = '【互动工具】' + p.app.name + '\n' + (p.app.note || ''); return; }
    var d = Deck.slides[p.n - 1];
    panel.textContent = (d && d.notes) ? cleanNotes(d.notes) : '（本页无讲稿备注）';
  }

  /* ---------- 侧栏 ---------- */
  function buildSidebar() {
    var sec = Deck.sec, sb = $('#sidebar');
    sb.innerHTML = '';
    sb.appendChild(ce('div', 'sec-no', sec.no));
    sb.appendChild(ce('div', 'sec-title', esc(sec.title)));
    sb.appendChild(ce('div', 'sec-en', esc(sec.en || '')));
    (sec.topics || []).forEach(function (tp) {
      var b = ce('button', 'topic');
      b.appendChild(ce('span', 'dot'));
      b.appendChild(ce('span', null, esc(tp.t)));
      b.onclick = function () { jumpToSlide(tp.at); };
      sb.appendChild(b);
    });
    var nav = ce('div', 'nav-other');
    Deck.sections.sections.forEach(function (s) {
      if (s.id === sec.id) return;
      var a = ce('a', null, s.no + ' · ' + esc(s.short));
      a.href = 'deck.html?sec=' + s.id;
      nav.appendChild(a);
    });
    var home = ce('a', null, '⌂ 返回封面目录');
    home.href = 'index.html';
    nav.appendChild(home);
    sb.appendChild(nav);
  }

  function jumpToSlide(n) {
    for (var i = 0; i < Deck.pages.length; i++) {
      if (Deck.pages[i].n === n && Deck.pages[i].type === 'slide') { go(i); return; }
    }
  }

  /* ---------- 总览 ---------- */
  function buildOverview() {
    var ov = $('#overview'), grid = $('.overview .grid');
    grid.innerHTML = '';
    Deck.pages.forEach(function (p, i) {
      var th;
      if (p.type === 'app') {
        th = ce('div', 'thumb app-thumb', '⚡ ' + esc(p.app.name));
      } else {
        var d = Deck.slides[p.n - 1], txt = '';
        if (d) {
          for (var k = 0; k < d.shapes.length && !txt; k++) {
            var sh = d.shapes[k];
            if (sh.type === 'text' && sh.paras && sh.paras[0] && sh.paras[0].runs[0]) {
              txt = sh.paras.map(function (pp) { return pp.runs.map(function (r) { return r.t; }).join(''); }).join(' ').slice(0, 60);
            }
          }
        }
        th = ce('div', 'thumb');
        th.appendChild(ce('div', 't', esc(txt || '（第 ' + p.n + ' 页）')));
        th.appendChild(ce('div', 'no', String(p.n)));
      }
      th.onclick = function () { toggleOverview(false); go(i); };
      grid.appendChild(th);
    });
  }
  function toggleOverview(open) {
    var ov = $('#overview');
    ov.classList.toggle('open', open);
    if (open) {
      buildOverview();
      var thumbs = ov.querySelectorAll('.thumb');
      if (thumbs[Deck.cur]) { thumbs[Deck.cur].classList.add('current'); thumbs[Deck.cur].scrollIntoView({ block: 'center' }); }
    }
  }

  /* ---------- 快捷键 ---------- */
  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowLeft': case 'PageUp': back(); break;
        case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); forward(); break;
        case 'Home': go(0); break;
        case 'End': go(Deck.pages.length - 1); break;
        case 'f': case 'F':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
          break;
        case 'o': case 'O': case 'Escape': toggleOverview(!$('#overview').classList.contains('open')); break;
        case 'n': case 'N': $('#notesPanel').classList.toggle('open'); break;
        case 'm': case 'M': $('#sidebar').classList.toggle('hidden'); fitStage(); break;
      }
      if ($('#overview').classList.contains('open') && e.key === 'Escape') toggleOverview(false);
    });
    window.addEventListener('resize', fitStage);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    var secId = getQuery('sec') || 'sec1';
    Promise.all([
      fetch('data/sections.json').then(function (r) { return r.json(); }),
      fetch('data/slides.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      Deck.sections = res[0];
      Deck.slides = res[1];
      var sec = null;
      Deck.sections.sections.forEach(function (s) { if (s.id === secId) sec = s; });
      if (!sec) sec = Deck.sections.sections[0];
      Deck.sec = sec;
      document.documentElement.style.setProperty('--sec-color', sec.color || '#c2546a');
      $('#crumbSec').innerHTML = '<b>' + esc(sec.no + ' ' + sec.title) + '</b>';
      document.title = sec.title + ' · 血液循环';

      if (window.DECK_OVERRIDES) Deck.overrides = window.DECK_OVERRIDES;

      buildPages();
      $('#pageTotal').textContent = Deck.pages.length;
      buildSidebar();
      assemble();
      bindKeys();

      var start = 0, h = location.hash;
      if (h) {
        var m = h.match(/#s(\d+)/);
        if (m) {
          for (var i = 0; i < Deck.pages.length; i++) {
            if (Deck.pages[i].n === +m[1] && Deck.pages[i].type === 'slide') { start = i; break; }
          }
        } else {
          var ma = h.match(/#app-(\d+)/);
          if (ma) {
            for (var j = 0; j < Deck.pages.length; j++) {
              if (Deck.pages[j].n === +ma[1] && Deck.pages[j].type === 'app') { start = j; break; }
            }
          }
        }
      }
      go(start, false);
    }).catch(function (err) {
      $('#stage').innerHTML = '<div class="loading">数据加载失败：' + esc(err.message) + '</div>';
    });
  }

  window.Deck = Deck;
  document.addEventListener('DOMContentLoaded', boot);
})();
