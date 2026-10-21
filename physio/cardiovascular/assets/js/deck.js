/* ============================================================
   血液循环 · 课件骨架渲染引擎
   数据来源：data/slides.json（PPT 逐页提取）+ data/sections.json（章节定义）
   渲染策略：绝对定位还原 PPT 版面（1280×720 坐标系），后续精修通过
   data/overrides/secN.js 注册自定义渲染器覆盖单页。
   ============================================================ */
(function () {
  'use strict';

  var BASE_W = 1280, BASE_H = 720;

  var Deck = {
    sections: null,   // sections.json
    slides: null,     // slides.json 数组，下标 = 页码-1
    sec: null,        // 当前节对象
    pages: [],        // 当前节的页面序列：[{type:'slide',n:页码} | {type:'app',app:...}]
    cur: 0,           // 当前页面在 pages 中的下标
    overrides: {},    // 页码 -> function(container, slideData)
  };

  /* ---------- 工具 ---------- */
  function $(sel, el) { return (el || document).querySelector(sel); }
  function ce(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function getQuery(name) {
    var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* ---------- 文本形状渲染 ---------- */
  function renderParas(paras) {
    var html = '';
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i], line = '';
      var maxFs = 0;
      for (var j = 0; j < p.runs.length; j++) {
        var r = p.runs[j];
        var style = '';
        if (r.fs) { style += 'font-size:' + (r.fs * BASE_W / 960 * 0.72) + 'px;'; if (r.fs > maxFs) maxFs = r.fs; }
        if (r.b) style += 'font-weight:600;';
        if (r.c) style += 'color:#' + r.c + ';';
        line += '<span style="' + style + '">' + esc(r.t) + '</span>';
      }
      var indent = p.lvl ? ' style="padding-left:' + (p.lvl * 18) + 'px"' : '';
      html += '<p' + indent + '>' + line + '</p>';
    }
    return html;
  }

  /* ---------- 单页渲染 ---------- */
  function renderSlide(n) {
    var data = Deck.slides[n - 1];
    var page = ce('div', 'slide-page');
    page.dataset.n = n;

    // 精修覆盖器优先
    if (Deck.overrides[n]) {
      Deck.overrides[n](page, data);
      return page;
    }

    if (!data) { page.appendChild(ce('div', 'loading', '第 ' + n + ' 页 · 待提取')); return page; }

    for (var i = 0; i < data.shapes.length; i++) {
      var sh = data.shapes[i], el;
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
      } else if (sh.type === 'group' && sh.text && sh.text.length) {
        el = ce('div', 'obj group-note', esc(sh.text.join(' / ')));
      } else {
        continue;
      }
      el.style.left = sh.l + 'px';
      el.style.top = sh.t + 'px';
      el.style.width = sh.w + 'px';
      el.style.height = sh.h + 'px';
      page.appendChild(el);
    }
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
    var iframe = ce('iframe');
    iframe.dataset.src = app.url;   // 懒加载：进入该页时才赋 src
    iframe.setAttribute('allow', 'autoplay; fullscreen; clipboard-write');
    page.appendChild(iframe);
    page._appIframe = iframe;
    return page;
  }

  /* ---------- 构建当前节页面序列 ---------- */
  function buildPages() {
    var sec = Deck.sec, pages = [];
    var appMap = {};
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
    // 翻页热区
    var prev = ce('div', 'flip prev'), next = ce('div', 'flip next');
    prev.title = '上一页'; next.title = '下一页';
    prev.onclick = function () { go(Deck.cur - 1); };
    next.onclick = function () { go(Deck.cur + 1); };
    stageEl.appendChild(prev); stageEl.appendChild(next);
    fitStage();
  }

  function fitStage() {
    var wrap = $('.stage-wrap');
    var scale = Math.min(wrap.clientWidth - 30, wrap.clientHeight - 20) / BASE_H;
    scale = Math.min(scale, (wrap.clientWidth - 30) / BASE_W);
    stageEl.style.transform = 'scale(' + Math.max(scale, 0.2) + ')';
  }

  /* ---------- 导航 ---------- */
  function go(idx, pushHash) {
    if (idx < 0 || idx >= Deck.pages.length) return;
    // 离开 App 页时卸载 iframe 省内存
    var oldEl = pageEls[Deck.cur];
    if (oldEl && oldEl._appIframe && idx !== Deck.cur) {
      oldEl._appIframe.src = 'about:blank';
    }
    Deck.cur = idx;
    pageEls.forEach(function (el, i) { el.classList.toggle('current', i === idx); });
    var p = Deck.pages[idx];
    // 进入 App 页时懒加载
    var el = pageEls[idx];
    if (el._appIframe && (!el._appIframe.src || el._appIframe.src.indexOf('about:blank') === 0)) {
      el._appIframe.src = el._appIframe.dataset.src;
    }
    // 顶栏与进度
    $('#pageNo').textContent = (idx + 1);
    $('.progress i').style.width = ((idx + 1) / Deck.pages.length * 100) + '%';
    // 讲稿
    updateNotes(p);
    // 侧栏高亮
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

  /* ---------- 讲稿 ---------- */
  function updateNotes(p) {
    var panel = $('#notesBody');
    if (!panel) return;
    if (p.type === 'app') { panel.textContent = '【互动工具】' + p.app.name + '\n' + (p.app.note || ''); return; }
    var d = Deck.slides[p.n - 1];
    panel.textContent = (d && d.notes) ? d.notes : '（本页无讲稿备注）';
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
        case 'ArrowLeft': case 'PageUp': go(Deck.cur - 1); break;
        case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); go(Deck.cur + 1); break;
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
      $('#pageTotal').textContent = '?';
      document.title = sec.title + ' · 血液循环';

      // 注册精修覆盖器（存在时）
      if (window.DECK_OVERRIDES) Deck.overrides = window.DECK_OVERRIDES;

      buildPages();
      $('#pageTotal').textContent = Deck.pages.length;
      buildSidebar();
      assemble();
      bindKeys();

      // hash 定位
      var start = 0, h = location.hash;
      if (h) {
        var m = h.match(/#s(\d+)/);
        if (m) {
          for (var i = 0; i < Deck.pages.length; i++) {
            if (Deck.pages[i].n === +m[1] && Deck.pages[i].type === 'slide') { start = i; break; }
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
