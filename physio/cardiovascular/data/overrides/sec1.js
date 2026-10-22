/* ============================================================
   第一节 · 心脏的电生理学及生理特性 — 精修覆盖器
   注册 window.DECK_OVERRIDES[页码] = fn(el, data, api)
   约定：返回 {steps:[[el..]..], static:[el..]} 交给引擎步进；
   返回 null 表示覆盖器已全自控。
   设计：水彩底 + 心红/静脉蓝，0-4期离子流是核心叙事线。
   2026-10-22 重构：AP 曲线全部改用 cardiac_cycle app 的官方采样
   （data/ap_samples.js，800ms 周期、每 2ms 一点），真实时轴；
   P10 后接 cardiac_cycle 互动页，P11 后接 action_potential 互动页
   （app 页第一步=扫码封面，见 deck.js renderAppSlide）。
   ============================================================ */
(function () {
  'use strict';
  var O = window.DECK_OVERRIDES = window.DECK_OVERRIDES || {};

  /* ---------- 小工具 ---------- */
  function el(api, cls, html) { return api.ce('div', 'x-el ' + cls, html); }
  function abs(elm, l, t, w, h) {
    elm.style.position = 'absolute';
    elm.style.left = l + 'px'; elm.style.top = t + 'px';
    if (w != null) elm.style.width = w + 'px';
    if (h != null) elm.style.height = h + 'px';
    return elm;
  }
  function titleBar(api, title, sub) {
    var t = el(api, 'x-title');
    t.innerHTML = '<div class="bar"></div><h2>' + api.esc(title) + '</h2>' +
      (sub ? '<span class="sub">' + api.esc(sub) + '</span>' : '') + '<i class="sweep"></i>';
    return t;
  }
  function plainText(data, idx) {
    var sh = data.shapes[idx];
    if (!sh || !sh.paras) return [];
    return sh.paras.map(function (p) { return p.runs.map(function (r) { return r.t; }).join('').trim(); }).filter(Boolean);
  }
  function delay(els, base) {
    els.forEach(function (e, i) { e.style.transitionDelay = ((base || 0) + i * 90) + 'ms'; });
    return els;
  }

  /* 相位配色（全节统一）；离子流配色与 action_potential app 一致 */
  var PHASE_C = ['#d9534f', '#f0a04b', '#4d96ff', '#6bcb77', '#9b72cf'];
  var ION_C = { Na: '#2f7fd6', to: '#f0a94c', CaL: '#22a06b', K: '#e0801f', K1: '#c26a10' };

  /* AP 官方采样：AP_VENT / AP_SAN（每 2ms 一点，0–800ms；VENT t=0 为 0 期起点，SAN t=0 为阈电位穿越） */
  var AP_VENT = window.AP_VENT, AP_SAN = window.AP_SAN;
  function apPath(samples, X, Y) {
    var d = '';
    for (var i = 0; i < samples.length; i++) d += (i ? 'L' : 'M') + X(i * 2).toFixed(1) + ',' + Y(samples[i]).toFixed(1);
    return d;
  }

  /* ---------- 心室肌 AP（真实时轴 0–800ms）+ 离子流副图 + 0/1期放大窗 ----------
     opts: { ionPanel: 画离子流副图, zoom: 画 0–40ms 放大窗, phaseLabels: 期别标注 } */
  function ventricularAP(api, l, t, w, h, opts) {
    opts = opts || {};
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    /* 主图区：x∈[44,596] ↔ 0–800ms；y∈[18,208] ↔ +40..-100mV */
    var X0 = 44, X1 = 596, Y0 = 18, Y1 = 208;
    function X(ms) { return X0 + ms / 800 * (X1 - X0); }
    function Y(mv) { return Y0 + (40 - mv) / 140 * (Y1 - Y0); }
    var phases = [[0, 2], [2, 12], [12, 180], [180, 300], [300, 800]];
    var svg = '<svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet">';
    /* 网格与时间刻度 */
    for (var g = 0; g <= 800; g += 100) {
      svg += '<line class="axis" x1="' + X(g) + '" y1="' + Y0 + '" x2="' + X(g) + '" y2="' + Y1 + '" stroke-width="0.4" opacity="0.25"/>' +
        '<text class="mv" x="' + X(g) + '" y="' + (Y1 + 14) + '" text-anchor="middle" font-size="9.5">' + g + '</text>';
    }
    svg += '<text class="mv" x="' + ((X0 + X1) / 2) + '" y="' + (Y1 + 27) + '" text-anchor="middle" font-size="10">时间 / ms</text>';
    svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(0) + '" x2="' + X1 + '" y2="' + Y(0) + '" stroke-dasharray="5 4"/>';
    svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(-90) + '" x2="' + X1 + '" y2="' + Y(-90) + '"/>';
    svg += '<text class="mv" x="4" y="' + (Y(0) + 3) + '">0</text>';
    svg += '<text class="mv" x="4" y="' + (Y(-90) + 3) + '">-90</text>';
    svg += '<text class="mv" x="4" y="' + (Y(30) + 3) + '">+30</text>';
    svg += '<text class="mv" x="8" y="' + (Y0 - 4) + '" font-size="10">mV</text>';
    /* 期别色带（真实时长：0期 2ms 细如发丝——这本身就是考点） */
    phases.forEach(function (p, i) {
      var bw = Math.max(X(p[1]) - X(p[0]), 1.6);
      svg += '<rect class="phase-band band' + i + '" x="' + X(p[0]) + '" y="' + Y0 + '" width="' + bw + '" height="' + (Y1 - Y0) + '" fill="' + PHASE_C[i] + '"/>';
    });
    /* 主峰 */
    svg += '<path class="curve" d="' + apPath(AP_VENT, X, Y) + '"/>';
    /* 平台期标注 */
    svg += '<text class="mv" x="' + X(105) + '" y="' + (Y(0) - 8) + '" text-anchor="middle" font-size="11" fill="' + PHASE_C[2] + '" font-weight="700">平台期 ≈ 0 mV · 约 150 ms</text>';
    svg += '<text class="mv" x="' + X(340) + '" y="' + (Y(-90) - 8) + '" font-size="10" fill="' + PHASE_C[4] + '">4期 · 稳定于 -90 mV（钠钾泵 × 钠钙交换维持）</text>';
    if (opts.phaseLabels !== false) {
      var lx = [1, 7, 96, 240, 550];
      for (var i = 0; i < 5; i++) {
        svg += '<text class="phase-label" x="' + X(lx[i]) + '" y="' + (Y1 + 40) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + PHASE_C[i] + '">' + i + '期</text>';
      }
    }
    /* 0–40ms 放大窗（0期+1期在真实时轴上太窄，放大镜呈现） */
    if (opts.zoom) {
      var zx0 = 470, zx1 = 622, zy0 = 26, zy1 = 108;   /* 窗内：x ↔ 0–40ms，y ↔ +40..-100 */
      function ZX(ms) { return zx0 + ms / 40 * (zx1 - zx0); }
      function ZY(mv) { return zy0 + (40 - mv) / 140 * (zy1 - zy0); }
      var zd = '';
      for (var j = 0; j <= 20; j++) zd += (j ? 'L' : 'M') + ZX(j * 2).toFixed(1) + ',' + ZY(AP_VENT[j]).toFixed(1);
      svg += '<rect x="' + zx0 + '" y="' + zy0 + '" width="' + (zx1 - zx0) + '" height="' + (zy1 - zy0) + '" rx="8" fill="#fff" stroke="var(--line)" stroke-width="1"/>' +
        '<line x1="' + zx0 + '" y1="' + ZY(0) + '" x2="' + zx1 + '" y2="' + ZY(0) + '" stroke-dasharray="3 3" stroke="#999" stroke-width="0.6"/>' +
        '<path d="' + zd + '" fill="none" stroke="var(--heart-deep)" stroke-width="2"/>' +
        '<circle cx="' + ZX(2) + '" cy="' + ZY(30) + '" r="2.6" fill="' + PHASE_C[0] + '"/>' +
        '<circle cx="' + ZX(12) + '" cy="' + ZY(0) + '" r="2.6" fill="' + PHASE_C[1] + '"/>' +
        '<text x="' + ((zx0 + zx1) / 2) + '" y="' + (zy0 - 6) + '" text-anchor="middle" font-size="9.5" fill="var(--ink-soft)">0–40 ms 放大</text>' +
        '<text x="' + ZX(2) + '" y="' + (ZY(30) - 6) + '" text-anchor="middle" font-size="9" fill="' + PHASE_C[0] + '">0期 +30</text>' +
        '<text x="' + ZX(13) + '" y="' + (ZY(0) + 12) + '" text-anchor="middle" font-size="9" fill="' + PHASE_C[1] + '">1期 切迹</text>';
    }
    /* 离子流副图（与主图同一时轴，对标教材「膜通透性」下板） */
    if (opts.ionPanel) {
      var iy0 = 232, ib = 288;  /* 副图顶线与基线 */
      svg += '<line class="axis" x1="' + X0 + '" y1="' + ib + '" x2="' + X1 + '" y2="' + ib + '" stroke-width="0.8"/>';
      /* I_Na：0–6ms 尖峰 */
      svg += '<path d="M' + X(0) + ',' + ib + ' L' + X(1) + ',' + (ib - 46) + ' L' + X(4) + ',' + ib + ' Z" fill="' + ION_C.Na + '" opacity="0.85"/>';
      /* I_to：2–16ms 小丘 */
      svg += '<path d="M' + X(2) + ',' + ib + ' Q' + X(8) + ',' + (ib - 22) + ' ' + X(16) + ',' + ib + ' Z" fill="' + ION_C.to + '" opacity="0.8"/>';
      /* I_Ca-L：4–180ms 平台丘 */
      svg += '<path d="M' + X(4) + ',' + ib + ' Q' + X(14) + ',' + (ib - 34) + ' ' + X(40) + ',' + (ib - 32) + ' L' + X(150) + ',' + (ib - 30) + ' Q' + X(175) + ',' + (ib - 26) + ' ' + X(190) + ',' + ib + ' Z" fill="' + ION_C.CaL + '" opacity="0.75"/>';
      /* I_K：160–320ms 复极峰 */
      svg += '<path d="M' + X(150) + ',' + ib + ' Q' + X(190) + ',' + (ib - 20) + ' ' + X(230) + ',' + (ib - 34) + ' Q' + X(280) + ',' + (ib - 30) + ' ' + X(320) + ',' + ib + ' Z" fill="' + ION_C.K + '" opacity="0.75"/>';
      /* I_K1：4期稳定外流（细带） */
      svg += '<path d="M' + X(310) + ',' + ib + ' L' + X(790) + ',' + ib + ' L' + X(790) + ',' + (ib - 8) + ' L' + X(310) + ',' + (ib - 8) + ' Z" fill="' + ION_C.K1 + '" opacity="0.55"/>';
      svg += '<text class="mv" x="8" y="' + (iy0 + 10) + '" font-size="10">相对膜通透性</text>';
      var leg = [['I_Na', ION_C.Na, 60], ['I_to', ION_C.to, 120], ['I_Ca-L', ION_C.CaL, 260], ['I_K', ION_C.K, 470], ['I_K1（4期）', ION_C.K1, 620]];
      leg.forEach(function (L) {
        svg += '<rect x="' + X(L[2] - 24) + '" y="' + (ib - 58) + '" width="8" height="8" rx="2" fill="' + L[1] + '"/>' +
          '<text x="' + X(L[2] - 14) + '" y="' + (ib - 50) + '" font-size="9.5" fill="var(--ink)">' + L[0] + '</text>';
      });
    }
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 窦房结 P 细胞 AP（真实时轴 0–800ms，MDP −60，峰 +8） ---------- */
  function saNodeAP(api, l, t, w, h) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    var X0 = 56, X1 = 616, Y0 = 20, Y1 = 216;   /* y ↔ +20..-80 */
    function X(ms) { return X0 + ms / 800 * (X1 - X0); }
    function Y(mv) { return Y0 + (20 - mv) / 100 * (Y1 - Y0); }
    var svg = '<svg viewBox="0 0 660 268" preserveAspectRatio="xMidYMid meet">';
    for (var g = 0; g <= 800; g += 100) {
      svg += '<line class="axis" x1="' + X(g) + '" y1="' + Y0 + '" x2="' + X(g) + '" y2="' + Y1 + '" stroke-width="0.4" opacity="0.25"/>' +
        '<text class="mv" x="' + X(g) + '" y="' + (Y1 + 14) + '" text-anchor="middle" font-size="9.5">' + g + '</text>';
    }
    svg += '<text class="mv" x="' + ((X0 + X1) / 2) + '" y="' + (Y1 + 27) + '" text-anchor="middle" font-size="10">时间 / ms</text>';
    svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(0) + '" x2="' + X1 + '" y2="' + Y(0) + '" stroke-dasharray="5 4"/>';
    svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(-40) + '" x2="' + X1 + '" y2="' + Y(-40) + '" stroke-dasharray="5 4" stroke="' + PHASE_C[0] + '"/>';
    svg += '<text class="mv" x="4" y="' + (Y(-40) + 3) + '" fill="' + PHASE_C[0] + '">阈电位 -40</text>';
    svg += '<text class="mv" x="4" y="' + (Y(0) + 3) + '">0</text>';
    svg += '<text class="mv" x="4" y="' + (Y(-60) + 3) + '">-60</text>';
    svg += '<text class="mv" x="8" y="' + (Y0 - 4) + '" font-size="10">mV</text>';
    /* 期别色带：0期 0–20 / 3期 20–160 / 4期 160–800 */
    svg += '<rect class="phase-band band0" x="' + X(0) + '" y="' + Y0 + '" width="' + Math.max(X(20) - X(0), 2) + '" height="' + (Y1 - Y0) + '" fill="' + PHASE_C[0] + '"/>';
    svg += '<rect class="phase-band band3" x="' + X(20) + '" y="' + Y0 + '" width="' + (X(160) - X(20)) + '" height="' + (Y1 - Y0) + '" fill="' + PHASE_C[3] + '"/>';
    svg += '<rect class="phase-band band4" x="' + X(160) + '" y="' + Y0 + '" width="' + (X(800) - X(160)) + '" height="' + (Y1 - Y0) + '" fill="' + PHASE_C[4] + '"/>';
    svg += '<path class="curve" d="' + apPath(AP_SAN, X, Y) + '"/>';
    /* 峰值与 MDP 标注 */
    svg += '<circle cx="' + X(16) + '" cy="' + Y(8) + '" r="3" fill="' + PHASE_C[0] + '"/>' +
      '<text class="mv" x="' + X(30) + '" y="' + (Y(8) - 2) + '" font-size="10.5" fill="' + PHASE_C[0] + '">峰 ≈ +8（幅度仅 ~70 mV）</text>';
    svg += '<circle cx="' + X(160) + '" cy="' + Y(-60) + '" r="3" fill="' + PHASE_C[4] + '"/>' +
      '<text class="mv" x="' + X(168) + '" y="' + (Y(-60) + 16) + '" font-size="10.5" fill="' + PHASE_C[4] + '">最大复极电位 MDP = −60 mV</text>';
    /* 4期离子机制沿坡标注 */
    svg += '<text class="mv" x="' + X(300) + '" y="' + (Y(-58) - 6) + '" font-size="10.5" fill="var(--ink)">① I_K 衰减（最重要）</text>';
    svg += '<text class="mv" x="' + X(480) + '" y="' + (Y(-50) - 6) + '" font-size="10.5" fill="var(--ink)">② I_f 内流增强</text>';
    svg += '<text class="mv" x="' + X(660) + '" y="' + (Y(-44) - 8) + '" font-size="10.5" fill="var(--ink)">③ I_Ca-T 推过阈值</text>';
    /* 期别标签 */
    svg += '<text class="phase-label" x="' + X(10) + '" y="' + (Y1 + 40) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + PHASE_C[0] + '">0期</text>';
    svg += '<text class="phase-label" x="' + X(90) + '" y="' + (Y1 + 40) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + PHASE_C[3] + '">3期</text>';
    svg += '<text class="phase-label" x="' + X(480) + '" y="' + (Y1 + 40) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + PHASE_C[4] + '">4期 自动去极化</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 不应期图（P19-21 共用，高亮不同带） ----------
     hl: 0=ERP 1=RRP 2=SNP；分界点由官方采样中 3 期的真实穿越时刻求得 */
  function refractoryAP(api, l, t, w, h, hl) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    var X0 = 44, X1 = 596, Y0 = 18, Y1 = 208;
    function X(ms) { return X0 + ms / 800 * (X1 - X0); }
    function Y(mv) { return Y0 + (40 - mv) / 140 * (Y1 - Y0); }
    /* 3 期段（180–300ms）内首次穿越某电位的时刻 */
    function tCross(mv) {
      for (var i = 90; i < AP_VENT.length; i++) if (AP_VENT[i] <= mv) return i * 2;
      return 300;
    }
    var t60 = tCross(-60), t80 = tCross(-80), tEnd = 300;
    var bands = [
      { x0: 0, x1: t60, c: '#d9534f', name: '有效不应期 ERP', desc: '任何刺激均不能引起兴奋' },
      { x0: t60, x1: t80, c: '#f0a04b', name: '相对不应期 RRP', desc: '阈上刺激可引起兴奋（低于正常）' },
      { x0: t80, x1: 330, c: '#6bcb77', name: '超常期 SNP', desc: '阈下刺激即可引起兴奋' }
    ];
    var svg = '<svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet">';
    svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(0) + '" x2="' + X1 + '" y2="' + Y(0) + '" stroke-dasharray="5 4"/>';
    [-60, -80].forEach(function (mv) {
      svg += '<line class="axis" x1="' + X0 + '" y1="' + Y(mv) + '" x2="' + X1 + '" y2="' + Y(mv) + '" stroke-dasharray="2 4" opacity="0.5"/>';
      svg += '<text class="mv" x="4" y="' + (Y(mv) + 3) + '">' + mv + '</text>';
    });
    bands.forEach(function (b, i) {
      svg += '<rect class="segband" x="' + X(b.x0) + '" y="' + Y0 + '" width="' + (X(b.x1) - X(b.x0)) + '" height="' + (Y1 - Y0) + '" fill="' + b.c + '"' + (i === hl ? ' opacity="0.3"' : '') + '/>';
      svg += '<text class="phase-label" x="' + X((b.x0 + b.x1) / 2) + '" y="252" text-anchor="middle" fill="' + b.c + '"' + (i === hl ? ' font-size="15"' : ' opacity="0.55"') + '>' + b.name.split(' ')[0] + '</text>';
    });
    svg += '<path class="curve" d="' + apPath(AP_VENT, X, Y) + '"/>';
    svg += '<text class="mv" x="' + X(400) + '" y="' + (Y1 + 27) + '" font-size="10" fill="var(--ink-soft)">与官方模拟器同一组数据：ERP 一直拖到复极 −60 mV（约 ' + t60 + ' ms）</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 心电波形 SVG（P30） ---------- */
  function ecgWave(api, l, t, w, h) {
    var box = el(api, 'x-ecg');
    abs(box, l, t, w, h);
    var base = 160;
    var d = 'M20,' + base + ' L70,' + base +
      ' C85,' + (base - 46) + ' 105,' + (base - 46) + ' 120,' + base +     /* P */
      ' L165,' + base +
      ' L175,' + (base + 14) + ' L192,' + (base - 132) + ' L208,' + (base + 26) + ' L222,' + base +  /* QRS */
      ' L285,' + base +
      ' C310,' + (base - 58) + ' 345,' + (base - 58) + ' 372,' + base +    /* T */
      ' L580,' + base;
    var svg = '<svg viewBox="0 0 600 240" preserveAspectRatio="none"><g class="grid">';
    for (var x = 20; x <= 580; x += 28) svg += '<line x1="' + x + '" y1="10" x2="' + x + '" y2="220"/>';
    for (var y = 20; y <= 220; y += 28) svg += '<line x1="20" y1="' + y + '" x2="580" y2="' + y + '"/>';
    svg += '</g>';
    svg += '<rect class="segband" x="70" y="10" width="50" height="210" fill="#6bcb77"/>';
    svg += '<rect class="segband" x="165" y="10" width="57" height="210" fill="#d9534f"/>';
    svg += '<rect class="segband" x="222" y="10" width="63" height="210" fill="#4d96ff"/>';
    svg += '<rect class="segband" x="285" y="10" width="87" height="210" fill="#f0a04b"/>';
    svg += '<path class="wave" d="' + d + '"/>';
    svg += '<text class="wlabel" x="95" y="105" text-anchor="middle">P</text>';
    svg += '<text class="wlabel" x="193" y="20" text-anchor="middle">R</text>';
    svg += '<text class="wlabel" x="172" y="190" text-anchor="middle">Q</text>';
    svg += '<text class="wlabel" x="212" y="205" text-anchor="middle">S</text>';
    svg += '<text class="wlabel" x="328" y="92" text-anchor="middle">T</text>';
    svg += '<text class="wdesc" x="120" y="230">P波·心房除极</text>';
    svg += '<text class="wdesc" x="230" y="230">QRS·心室除极　ST·平台期　T波·心室复极</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ============================================================
     各页覆盖器
     ============================================================ */

  /* P2 · 节封面 */
  O[2] = function (pageEl, data, api) {
    var cover = el(api, 'x-cover');
    var topics = (api.sec.topics || []).map(function (t) { return '<span>' + api.esc(t.t) + '</span>'; }).join('');
    cover.innerHTML =
      '<div class="no">01</div>' +
      '<h1>心脏的电生理学及生理特性</h1>' +
      '<div class="en">Cardiac Electrophysiology & Properties</div>' +
      '<svg class="ecg" viewBox="0 0 520 70" preserveAspectRatio="none"><path d="M0,40 L80,40 L100,40 L112,22 L124,58 L136,40 L190,40 L205,40 L218,6 L234,66 L248,40 L310,40 L325,40 L338,6 L354,66 L368,40 L430,40 L445,40 L458,6 L474,66 L488,40 L520,40"/></svg>' +
      '<div class="toc">' + topics + '</div>';
    cover.querySelectorAll('*').forEach && 0;
    return { steps: [], static: [cover] };
  };

  /* P4 · 知识回顾：5 题卡（沿用 PPT 的 5 步动画节奏） */
  O[4] = function (pageEl, data, api) {
    var qs = plainText(data, 0);
    var st = [titleBar(api, '知识回顾 · 先回想，再进入心脏', '《第二章 细胞的基本功能》')];
    var steps = [];
    qs.forEach(function (q, i) {
      var card = el(api, 'x-q');
      abs(card, 100, 158 + i * 104, 1080);
      card.innerHTML = '<div class="q"><i>' + (i + 1) + '</i><p>' + api.esc(q) + '</p></div>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P5 · 官方海报整幅呈现（海报自带双二维码）+ 网页版引导卡 */
  O[5] = function (pageEl, data, api) {
    var poster = el(api, 'x-poster');
    poster.innerHTML = '<img src="assets/img/b49f09ba88b9.webp" alt="动作电位互动教学系统海报" style="width:100%;height:100%;object-fit:cover;border-radius:0;">';
    poster.style.cssText += 'position:absolute;inset:0;';
    var go = el(api, 'x-card');
    abs(go, 872, 606, 356, 88);
    go.style.cssText += 'background:rgba(255,253,249,.95);box-shadow:0 16px 40px -14px rgba(80,40,50,.4);';
    go.innerHTML = '<h4 style="font-size:14px">网页版课件 · 免扫码</h4><p style="font-size:12.5px;line-height:1.6">海报上的系统<b>已内嵌在本课件里</b>——按 <b>→</b> 直接打开，先调细胞外 Na⁺ 看 0 期变化。</p>';
    return { steps: [[go]], static: [poster] };
  };

  /* P7 · 学习目标：5 张目标卡 */
  O[7] = function (pageEl, data, api) {
    var lines = plainText(data, 1).filter(function (s) { return /^\d\./.test(s); });
    var st = [titleBar(api, '学习目标', '学完本节后，能够——')];
    var kw = ['比较', '解释', '解释', '描述', '识别'];
    var steps = [];
    lines.forEach(function (s, i) {
      var card = el(api, 'x-card');
      abs(card, 96, 168 + i * 100, 1090);
      card.style.setProperty('--card-c', PHASE_C[i % 5]);
      card.innerHTML = '<span class="tag">目标 ' + (i + 1) + ' · ' + kw[i] + '</span><p>' + api.esc(s.replace(/^\d\.\s*/, '')) + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P8 · 两类心肌细胞：双栏对比 + 图5-14 教材原图（正确图、正确位置） */
  O[8] = function (pageEl, data, api) {
    var st = [titleBar(api, '一、心肌细胞的生物电现象', '心脏由两类心肌细胞构成')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 140, 640, 300);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>工作心肌细胞</h4><div class="en">WORKING CARDIAC MYOCYTE</div>' +
      '<ul><li>构成心房和心室壁的普通心肌细胞</li><li>有收缩性，<b>无自动节律性</b></li><li>执行泵血功能</li></ul></div>' +
      '<div class="col" style="--col-c:#4d96ff"><h4>自律心肌细胞</h4><div class="en">AUTORHYTHMIC CELL</div>' +
      '<ul><li>窦房结、房室交界、房室束、浦肯野纤维</li><li>能自发产生兴奋：<b>自动节律性</b></li><li>无收缩性，是心脏兴奋的起源</li></ul></div>';
    /* 图5-14：从教材扫描页裁剪出的干净图（传导系统 + 七条跨膜电位波形） */
    var fig = el(api, 'x-card');
    abs(fig, 730, 130, 500, 460);
    fig.style.padding = '12px';
    fig.innerHTML = '<img src="assets/img/fig5_14_conduction_ap.webp" alt="图5-14 心脏不同部位心肌细胞的跨膜电位" style="width:100%;height:88%;object-fit:contain;background:#fff;border-radius:8px;">' +
      '<p style="font-size:12px;color:var(--ink-soft);text-align:center;margin-top:6px">图 5-14 · 心脏不同部位心肌细胞的跨膜电位（教材原图）</p>';
    var note = el(api, 'x-card');
    abs(note, 60, 460, 640, 200);
    note.style.setProperty('--card-c', '#9b72cf');
    note.innerHTML = '<h4>为什么波形各不相同？</h4><p style="font-size:13px;line-height:1.85">' + api.esc(plainText(data, 3).join('')) + '</p>' +
      '<p style="font-size:12.5px;margin-top:8px;color:var(--heart-deep)"><b>右图七条波形</b>：从上往下依次是窦房结→心房肌→房室结→希氏束→束支→浦肯野→心室肌——越靠下，4 期越平（自律性越低）。</p>';
    return { steps: [[duo], [fig], [note]], static: st };
  };

  /* P10 · 心室肌动作电位：官方采样真实时轴 + 离子流副图 + 0/1期放大窗（本课核心页）
     下一页自动接 cardiac_cycle 互动页（先扫码封面） */
  O[10] = function (pageEl, data, api) {
    var st = [titleBar(api, '（2）心室肌细胞动作电位', '与互动模拟器同一组官方数据 · 真实时间轴 0–800 ms')];
    var ap = ventricularAP(api, 36, 118, 800, 470, { ionPanel: true, zoom: true });
    var intro = el(api, 'x-card');
    abs(intro, 866, 128, 380, 106);
    intro.innerHTML = '<h4>三大特点</h4><p style="font-size:12.5px;line-height:1.65">① 复极过程复杂 ② 持续时间长——<b>2 期平台期</b>是心室肌 AP 的标志 ③ 升降支不对称</p>';
    var descs = [
      ['0期 · 快速去极化', '快 Na⁺ 通道开放，Na⁺ 内流（I_Na）：−90 → <b>+30 mV</b>，仅 <b>1–2 ms</b>（放大窗里那一点）', PHASE_C[0]],
      ['1期 · 瞬时复极', '瞬时外向电流 I_to（K⁺ 外流）：+30 → 0 mV 的小切迹，约 10 ms', PHASE_C[1]],
      ['2期 · 平台期', 'Ca²⁺ 内流（I_Ca-L）≈ K⁺ 外流（I_K）：电位停在 <b>0 mV 附近约 150 ms</b>', PHASE_C[2]],
      ['3期 · 快速复极', 'Ca²⁺ 通道失活，I_K / I_K1 外流增强：先慢后快回到 −90 mV，约 120 ms', PHASE_C[3]],
      ['4期 · 静息期', 'I_K1 把膜电位稳在 −90 mV；钠钾泵、钠钙交换体恢复离子分布', PHASE_C[4]]
    ];
    var steps = [[ap], [intro]];
    descs.forEach(function (dd, i) {
      var card = el(api, 'x-card');
      abs(card, 866, 246 + i * 76, 380, 70);
      card.style.setProperty('--card-c', dd[2]);
      card.style.padding = '9px 14px';
      card.innerHTML = '<h4 style="margin-bottom:2px;font-size:13.5px">' + dd[0] + '</h4><p style="font-size:11.5px;line-height:1.5">' + dd[1] + '</p>';
      steps.push([card]);
    });
    var teaser = el(api, 'x-card');
    abs(teaser, 36, 612, 800, 72);
    teaser.style.setProperty('--card-c', '#C2546A');
    teaser.innerHTML = '<p style="font-size:13px;line-height:1.7">📱 <b>下一页互动：</b>扫码打开「3D 心动周期模拟器」→ 滚到「五类细胞」找到这条心室肌曲线，看看别的细胞长什么样。</p>';
    steps.push([teaser]);
    return { steps: steps, static: st };
  };

  /* P11 · 各期离子流：教材原图（心室肌电位模式+离子流）回主位 + 分步对号入座卡
     下一页自动接 action_potential 互动页（先扫码封面，双码：公网/校园网） */
  O[11] = function (pageEl, data, api) {
    var st = [titleBar(api, '心室肌细胞动作电位各期主要离子流', '教材原图对照 · 把 0–4 期与通道电流对号入座')];
    /* 教材原图：c8ff1709dd79（心室肌电位模式·上 + 相对膜通透性·下），放回原 PPT 的右侧位置 */
    var fig = el(api, 'x-card');
    abs(fig, 716, 108, 424, 560);
    fig.style.padding = '10px';
    fig.innerHTML = '<img src="assets/img/c8ff1709dd79.webp" alt="心室肌电位模式及对应离子流" style="width:100%;height:92%;object-fit:contain;background:#fff;border-radius:8px;">' +
      '<p style="font-size:11.5px;color:var(--ink-soft);text-align:center;margin-top:4px">心室肌电位模式（上）及对应的离子流向（下）· 教材原图</p>';
    var rows = [
      ['0期', 'Na⁺ 内流', 'I_Na（快钠通道）', PHASE_C[0]],
      ['1期', '瞬时外向电流', 'I_to（K⁺ 外流）', PHASE_C[1]],
      ['2期', 'Ca²⁺ 内流 ＋ K⁺ 外流', 'I_Ca-L ＋ I_K', PHASE_C[2]],
      ['3期', 'K⁺ 外流', 'I_K ＋ I_K1', PHASE_C[3]],
      ['4期', '主动转运恢复', '钠钾泵 · 钠钙交换体 · 钙泵', PHASE_C[4]]
    ];
    var steps = [];
    rows.forEach(function (r, i) {
      var card = el(api, 'x-card');
      abs(card, 60, 128 + i * 84, 620, 74);
      card.style.setProperty('--card-c', r[3]);
      card.style.padding = '10px 18px';
      card.innerHTML = '<h4 style="font-size:15px;display:inline-block;min-width:52px;color:' + r[3] + '">' + r[0] + '</h4>' +
        '<b style="font-size:14.5px">' + r[1] + '</b>' +
        '<p style="font-size:12.5px;color:var(--ink-soft);margin-top:3px">' + r[2] + '</p>';
      steps.push([card]);
    });
    var note = el(api, 'x-card');
    abs(note, 60, 556, 620, 108);
    note.innerHTML = '<p style="font-size:13px;line-height:1.8"><b>记忆钩：</b>0 升 1 降 2 平台，3 回 4 复原。平台期的 Ca²⁺ 内流同时是<b>兴奋-收缩耦联</b>的触发信号——下一节泵血功能的电学起点。<br>📱 下一页：扫码后在「动作电位互动系统」里亲手堵/放通道，验证这张表。</p>';
    steps.push([note]);
    return { steps: steps.concat(), static: st.concat([fig]) };
  };

  /* P16 · 窦房结 P 细胞：官方采样曲线 + 教材原理原图 + 三机制卡 */
  O[16] = function (pageEl, data, api) {
    var st = [titleBar(api, '窦房结 P 细胞的跨膜电位及其形成机制', '0期·3期·4期 —— 没有 1、2 期，也没有真正的静息电位')];
    var ap = saNodeAP(api, 596, 108, 660, 330);
    var c0 = el(api, 'x-card');
    abs(c0, 60, 128, 500, 108);
    c0.style.setProperty('--card-c', PHASE_C[0]);
    c0.innerHTML = '<h4>0期 · 去极化</h4><p style="font-size:12.5px;line-height:1.6">膜上 L 型钙通道开放，<b>Ca²⁺ 内流（I_Ca-L）</b>——速度慢、峰值仅 ≈+8 mV，故称「慢反应细胞」</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 60, 248, 500, 100);
    c3.style.setProperty('--card-c', PHASE_C[3]);
    c3.innerHTML = '<h4>3期 · 复极化</h4><p style="font-size:12.5px;line-height:1.6">钙通道逐渐失活，K⁺ 通道激活，<b>K⁺ 外流（I_K）</b>使膜复极至最大复极电位 −60 mV</p>';
    var c4 = el(api, 'x-card');
    abs(c4, 60, 360, 500, 190);
    c4.style.setProperty('--card-c', PHASE_C[4]);
    c4.innerHTML = '<h4>4期 · 自动去极化（自律性的来源）——三种电流接力</h4>' +
      '<p style="font-size:12.5px;line-height:1.8">① <b>I_K 衰减</b>：K⁺ 外流进行性减弱（最重要）<br>② <b>I_f 起搏电流</b>：进行性增强的内向电流（主要为 Na⁺）<br>③ <b>T 型钙通道</b>：后期开放，Ca²⁺ 内流把膜电位推过阈值</p>';
    /* 教材原理原图（PPT 本页右上那张） */
    var fig = el(api, 'x-card');
    abs(fig, 620, 470, 440, 200);
    fig.style.padding = '8px';
    fig.innerHTML = '<img src="assets/img/2e10e28e8bfc.webp" alt="窦房结P细胞4期自动去极化原理示意图" style="width:100%;height:82%;object-fit:contain;background:#fff;border-radius:8px;">' +
      '<p style="font-size:11px;color:var(--ink-soft);text-align:center">教材原图 · 4期自动去极化发生原理</p>';
    /* PPT 本页印有动作电位模拟器双二维码 → 网页版已在 P11 后内嵌 */
    var qr = el(api, 'x-card');
    abs(qr, 1080, 470, 170, 200);
    qr.style.padding = '10px';
    qr.innerHTML = '<img src="assets/img/6d3e21967988.webp" alt="动作电位模拟器二维码" style="width:100%;border-radius:8px;background:#fff;padding:6px;">' +
      '<p style="font-size:11px;color:var(--ink-soft);text-align:center;margin-top:6px;line-height:1.5">课后扫码<br>亲手刺激窦房结</p>';
    return { steps: [[ap], [c0], [c3], [c4], [fig, qr]], static: st };
  };

  /* P19-21 · 兴奋性周期：同一张图，三页依次点亮 ERP/RRP/SNP */
  function refractoryPage(hl, heading, bodyParas, causeLabel) {
    return function (pageEl, data, api) {
      var st = [titleBar(api, heading, '一次兴奋过程中兴奋性的周期性变化')];
      var ap = refractoryAP(api, 470, 130, 760, 420, hl);
      var paras = plainText(data, 0);
      var card = el(api, 'x-card');
      abs(card, 60, 140, 390, 480);
      var names = ['有效不应期', '相对不应期', '超常期'];
      var colors = ['#d9534f', '#f0a04b', '#6bcb77'];
      card.style.setProperty('--card-c', colors[hl]);
      card.innerHTML = '<h4>' + names[hl] + '</h4><p style="font-size:13px">' +
        api.esc(paras.slice(1).join('\n')).replace(/\n/g, '<br>') + '</p>';
      return { steps: [[ap], [card]], static: st };
    };
  }
  O[19] = refractoryPage(0, '（1）有效不应期 ERP');
  O[20] = refractoryPage(1, '（2）相对不应期 RRP');
  O[21] = refractoryPage(2, '（3）超常期 SNP');

  /* P22 · 期前收缩与代偿间歇 */
  O[22] = function (pageEl, data, api) {
    var st = [titleBar(api, '期前收缩与代偿间歇', '兴奋性周期变化的临床回响')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 150, 640, 200);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>期前收缩（早搏）</h4><p>在有效不应期之后，心肌受到人工或<b>异位起搏点</b>的激动而产生的收缩。</p></div>' +
      '<div class="col" style="--col-c:#4d96ff"><h4>代偿间歇</h4><p>期前收缩后一段较长的心室舒张期——窦性兴奋落在期前收缩的<b>有效不应期</b>上，被"浪费"了一次。</p></div>';
    var pic = data.shapes[2];
    var box = el(api, '');
    abs(box, 740, 130, 500, 560);
    if (pic && pic.src) {
      box.innerHTML = '<img src="assets/img/' + pic.src + '" style="width:100%;height:78%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff">' +
        '<p style="font-size:12.5px;color:var(--ink-soft);line-height:1.7;margin-top:8px">曲线1～3：刺激落在有效不应期内，无反应；曲线4～6：落在不应期之后 → 期前收缩 + 代偿间歇</p>';
    }
    return { steps: [[duo], [box]], static: st };
  };

  /* P30 · 体表心电图：手绘 ECG + 波段标注 */
  O[30] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、体表心电图', '整个心脏兴奋过程的综合电变化')];
    var wave = ecgWave(api, 90, 150, 1100, 380);
    var legend = el(api, 'x-legend');
    abs(legend, 130, 560, 1000);
    legend.innerHTML = [
      ['P波', '心房除极', '#6bcb77'], ['QRS波群', '心室除极', '#d9534f'],
      ['ST段', '心室平台期（等电位）', '#4d96ff'], ['T波', '心室复极', '#f0a04b']
    ].map(function (x) {
      return '<span class="item"><span class="sw" style="background:' + x[2] + '"></span><b>' + x[0] + '</b> ' + x[1] + '</span>';
    }).join('');
    return { steps: [[wave], [legend]], static: st };
  };

  /* P31 / P32 · 心电波段逐条：定义列表卡 */
  function ecgDefs(heading, items) {
    return function (pageEl, data, api) {
      var st = [titleBar(api, heading, '正常心电图的波段与意义')];
      var steps = [];
      items.forEach(function (it, i) {
        var card = el(api, 'x-card');
        abs(card, 90, 150 + i * 108, 1100);
        card.style.setProperty('--card-c', it[2]);
        card.innerHTML = '<h4>' + it[0] + '</h4><p>' + api.esc(it[1]) + '</p>';
        steps.push([card]);
      });
      return { steps: steps, static: st };
    };
  }
  O[31] = ecgDefs('心电图各波段（上）', [
    ['1 · P波', '心房的激动。小而圆钝，时限 0.08～0.11 s，高度不超过 0.25 mV。', '#6bcb77'],
    ['2 · PR间期', 'P波起点到 QRS 起点，0.12～0.20 s——反映房室延搁的时间。', '#9b72cf'],
    ['3 · QRS波群', '心室除极。短时程、高幅度、波形尖锐；正常 0.06～0.10 s。', '#d9534f'],
    ['4 · QT间期', 'QRS 起点到 T波终点，代表心室除极与复极的全过程。', '#4d96ff']
  ]);
  O[32] = ecgDefs('心电图各波段（下）', [
    ['5 · ST段', 'QRS 终点到 T波起点。各部位心室肌均处于除极状态，电位差很小，正常应在等电位线上；压低或抬高提示心肌缺血或损伤。', '#4d96ff'],
    ['6 · T波', '心室复极化。持续时间较长、波幅较低；主波方向应与 QRS 主波一致。', '#f0a04b'],
    ['临床联想', 'ST 段抬高 → 急性心肌梗死；QT 延长 → 尖端扭转型室速风险（见下页长QT综合征）。', '#d9534f']
  ]);

  /* P33 · 异常心电图对比 */
  O[33] = function (pageEl, data, api) {
    var st = [titleBar(api, '从正常到异常：两种典型心电图', '看图说话——波段哪里变了？')];
    var pics = [];
    data.shapes.forEach(function (sh) { if (sh.type === 'pic') pics.push(sh); });
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 1140, 470);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>心房颤动</h4>' +
      (pics[0] ? '<img src="assets/img/' + pics[0].src + '" style="width:100%;height:300px;object-fit:contain;background:#fff;border-radius:8px">' : '') +
      '<p style="margin-top:10px">P波消失，代之以 f 波；RR 间期绝对不规则</p></div>' +
      '<div class="col" style="--col-c:#4d96ff"><h4>长QT综合征</h4>' +
      (pics[1] ? '<img src="assets/img/' + pics[1].src + '" style="width:100%;height:300px;object-fit:contain;background:#fff;border-radius:8px">' : '') +
      '<p style="margin-top:10px">QT 间期延长——复极延迟，警惕尖端扭转型室速</p></div>';
    return { steps: [[duo]], static: st };
  };
})();
