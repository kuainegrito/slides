/* ============================================================
   第二节 · 心脏的泵血功能 — 精修覆盖器
   核心叙事：一个心动周期 = 电学终点的机械展开
   英雄页：P42/43 压力-容积环分步绘制、P38 心动周期时间轴、
          P51 射血分数仪表、P55 Frank-Starling 曲线、P63 心率-CO 曲线
   四相配色：充盈绿 / 等容收缩橙 / 射血红 / 等容舒张蓝
   ============================================================ */
(function () {
  'use strict';
  var O = window.DECK_OVERRIDES = window.DECK_OVERRIDES || {};

  function el(api, cls, html) { return api.ce('div', 'x-el ' + cls, html); }
  function abs(e, l, t, w, h) {
    e.style.position = 'absolute';
    e.style.left = l + 'px'; e.style.top = t + 'px';
    if (w != null) e.style.width = w + 'px';
    if (h != null) e.style.height = h + 'px';
    return e;
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
  function picOf(data, idx, fit) {
    var sh = data.shapes[idx];
    if (!sh || sh.type !== 'pic') return null;
    return 'assets/img/' + sh.src;
  }

  /* 四相配色 */
  var PH = { fill: '#6bcb77', isoC: '#f0a04b', eject: '#d9534f', isoR: '#4d96ff' };

  /* ---------- 压力-容积环 SVG ----------
     坐标：容积 0–140 mL → x 60–340；压力 0–130 mmHg → y 300–40
     环：充盈(绿)→等容收缩(橙)→射血(红)→等容舒张(蓝) */
  function pvLoop(api, l, t, w, h, opts) {
    opts = opts || {};
    var box = el(api, 'x-ap x-pv');
    abs(box, l, t, w, h);
    function X(v) { return 60 + v * 2; }
    function Y(p) { return 300 - p * 2; }
    var segs = [
      { name: '心室充盈', c: PH.fill, d: 'M' + X(40) + ',' + Y(8) + ' C' + X(62) + ',' + Y(4) + ' ' + X(100) + ',' + Y(4) + ' ' + X(120) + ',' + Y(10), lbl: [X(80), Y(0) + 18], anc: 'middle' },
      { name: '等容收缩', c: PH.isoC, d: 'M' + X(120) + ',' + Y(10) + ' L' + X(120) + ',' + Y(80), lbl: [X(120) + 8, Y(45)], anc: 'start' },
      { name: '射血', c: PH.eject, d: 'M' + X(120) + ',' + Y(80) + ' C' + X(115) + ',' + Y(102) + ' ' + X(80) + ',' + Y(112) + ' ' + X(58) + ',' + Y(96) + ' C' + X(48) + ',' + Y(88) + ' ' + X(42) + ',' + Y(72) + ' ' + X(40) + ',' + Y(60), lbl: [X(72), Y(106) - 8], anc: 'middle' },
      { name: '等容舒张', c: PH.isoR, d: 'M' + X(40) + ',' + Y(60) + ' L' + X(40) + ',' + Y(8), lbl: [X(40) - 8, Y(35)], anc: 'end' }
    ];
    var svg = '<svg viewBox="0 0 400 340" preserveAspectRatio="none">';
    /* 网格与轴 */
    for (var v = 0; v <= 140; v += 20) {
      svg += '<line class="axis" x1="' + X(v) + '" y1="' + Y(0) + '" x2="' + X(v) + '" y2="' + Y(120) + '" opacity="0.18"/>';
      svg += '<text class="mv" x="' + X(v) + '" y="' + (Y(0) + 16) + '" text-anchor="middle">' + v + '</text>';
    }
    for (var p = 0; p <= 120; p += 20) {
      svg += '<line class="axis" x1="' + X(0) + '" y1="' + Y(p) + '" x2="' + X(140) + '" y2="' + Y(p) + '" opacity="0.18"/>';
      svg += '<text class="mv" x="' + (X(0) - 6) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
    }
    svg += '<text class="mv" x="200" y="332" text-anchor="middle" font-weight="700">心室容积 / mL</text>';
    svg += '<text class="mv" x="14" y="30" font-weight="700">心室内压 / mmHg</text>';
    if (opts.work) {
      /* 环内阴影 = 每搏功 */
      svg += '<path class="pv-work" d="' + segs.map(function (s) { return s.d; }).join(' ') + ' Z" fill="' + PH.eject + '" opacity="0.13"/>';
      svg += '<text class="phase-label" x="200" y="150" text-anchor="middle" fill="' + PH.eject + '">阴影 = 每搏功（净外部功）</text>';
    }
    segs.forEach(function (s, i) {
      var cls = 'pv-seg pv-seg' + i;
      svg += '<path class="' + cls + '" d="' + s.d + '" fill="none" stroke="' + s.c + '" stroke-width="4" stroke-linecap="round"/>';
      svg += '<text class="phase-label ' + cls + '-lbl" x="' + s.lbl[0] + '" y="' + s.lbl[1] + '" text-anchor="' + s.anc + '" fill="' + s.c + '">' + (i + 1) + ' ' + s.name + '</text>';
    });
    /* EDV/ESV/SV 标注 */
    if (opts.volMarks) {
      svg += '<line x1="' + X(40) + '" y1="' + Y(-6) + '" x2="' + X(40) + '" y2="' + Y(4) + '" stroke="#9b72cf" stroke-width="2"/>';
      svg += '<line x1="' + X(120) + '" y1="' + Y(-6) + '" x2="' + X(120) + '" y2="' + Y(4) + '" stroke="#9b72cf" stroke-width="2"/>';
      svg += '<text class="mv" x="' + X(40) + '" y="' + Y(-6) + '" text-anchor="middle" fill="#9b72cf" font-weight="700">ESV 40</text>';
      svg += '<text class="mv" x="' + X(120) + '" y="' + Y(-6) + '" text-anchor="middle" fill="#9b72cf" font-weight="700">EDV 120</text>';
      svg += '<path d="M' + (X(40) + 6) + ',' + (Y(-14) + 22) + ' L' + (X(120) - 6) + ',' + (Y(-14) + 22) + '" stroke="#9b72cf" stroke-width="1.6" marker-end="url(#pvArrow)" marker-start="url(#pvArrow)"/>';
      svg += '<text class="mv" x="' + X(80) + '" y="' + (Y(-14) + 40) + '" text-anchor="middle" fill="#9b72cf" font-weight="700">SV = EDV − ESV ≈ 80 mL</text>';
      svg += '<defs><marker id="pvArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#9b72cf"/></marker></defs>';
    }
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 心动周期时间轴（P38） ---------- */
  function cycleTimeline(api, l, t, w, h) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    /* 0.8s：房缩0.1 房舒0.7 / 室缩0.3 室舒0.5；全心舒张 0.4 */
    function X(s) { return 50 + s * (540 / 0.8); }
    var svg = '<svg viewBox="0 0 640 240" preserveAspectRatio="none">';
    for (var s = 0; s <= 0.8; s += 0.1) {
      svg += '<line class="axis" x1="' + X(s) + '" y1="30" x2="' + X(s) + '" y2="170" opacity="0.2"/>';
      svg += '<text class="mv" x="' + X(s) + '" y="188" text-anchor="middle">' + s.toFixed(1) + '</text>';
    }
    svg += '<text class="mv" x="50" y="206">时间 / s（心率 75 次/分 → 周期 0.8 s）</text>';
    /* 心房行 */
    svg += '<text class="phase-label" x="42" y="72" text-anchor="end" fill="' + PH.eject + '">心房</text>';
    svg += '<rect x="' + X(0) + '" y="52" width="' + (X(0.1) - X(0)) + '" height="26" rx="5" fill="' + PH.eject + '" opacity="0.85"/>';
    svg += '<rect x="' + X(0.1) + '" y="52" width="' + (X(0.8) - X(0.1)) + '" height="26" rx="5" fill="' + PH.eject + '" opacity="0.16"/>';
    svg += '<text class="mv" x="' + ((X(0) + X(0.1)) / 2) + '" y="69" text-anchor="middle" fill="#fff">缩0.1</text>';
    svg += '<text class="mv" x="' + ((X(0.1) + X(0.8)) / 2) + '" y="69" text-anchor="middle">舒张 0.7</text>';
    /* 心室行 */
    svg += '<text class="phase-label" x="42" y="132" text-anchor="end" fill="' + PH.isoC + '">心室</text>';
    svg += '<rect x="' + X(0.1) + '" y="112" width="' + (X(0.4) - X(0.1)) + '" height="26" rx="5" fill="' + PH.isoC + '" opacity="0.9"/>';
    svg += '<rect x="' + X(0) + '" y="112" width="' + (X(0.1) - X(0)) + '" height="26" rx="5" fill="' + PH.isoC + '" opacity="0.16"/>';
    svg += '<rect x="' + X(0.4) + '" y="112" width="' + (X(0.8) - X(0.4)) + '" height="26" rx="5" fill="' + PH.isoC + '" opacity="0.16"/>';
    svg += '<text class="mv" x="' + ((X(0.1) + X(0.4)) / 2) + '" y="129" text-anchor="middle" fill="#fff">收缩 0.3</text>';
    svg += '<text class="mv" x="' + ((X(0.4) + X(0.8)) / 2) + '" y="129" text-anchor="middle">舒张 0.5</text>';
    /* 全心舒张期 bracket */
    svg += '<path d="M' + X(0.4) + ',158 L' + X(0.4) + ',164 L' + X(0.8) + ',164 L' + X(0.8) + ',158" fill="none" stroke="#9b72cf" stroke-width="2"/>';
    svg += '<text class="phase-label" x="' + ((X(0.4) + X(0.8)) / 2) + '" y="182" text-anchor="middle" fill="#9b72cf">全心舒张期 0.4 s</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 射血分数仪表（P51） ---------- */
  function efGauge(api, l, t, w, h, pct, label) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    var r = 120, cx = 160, cy = 170;
    function polar(frac) {
      var a = Math.PI * (1 + frac);   /* 从左半圆扫到右 */
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }
    var s = polar(0), e = polar(pct / 100);
    var svg = '<svg viewBox="0 0 320 240">';
    svg += '<path d="M' + polar(0)[0] + ',' + polar(0)[1] + ' A' + r + ',' + r + ' 0 0 1 ' + polar(1)[0] + ',' + polar(1)[1] + '" fill="none" stroke="rgba(43,43,51,.1)" stroke-width="26" stroke-linecap="round"/>';
    svg += '<path d="M' + s[0] + ',' + s[1] + ' A' + r + ',' + r + ' 0 0 1 ' + e[0] + ',' + e[1] + '" fill="none" stroke="' + PH.eject + '" stroke-width="26" stroke-linecap="round"/>';
    svg += '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" font-size="46" font-weight="700" fill="' + PH.eject + '" font-family="Georgia,serif">' + label + '</text>';
    svg += '<text x="' + cx + '" y="' + (cy + 26) + '" text-anchor="middle" font-size="14" fill="#6b6560">EF = SV / EDV × 100%</text>';
    svg += '<text x="' + (cx - r) + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="11" fill="#6b6560">0%</text>';
    svg += '<text x="' + (cx + r) + '" y="' + (cy + 34) + '" text-anchor="middle" font-size="11" fill="#6b6560">100%</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- Frank-Starling 曲线（P55） ---------- */
  function starlingCurve(api, l, t, w, h) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    var svg = '<svg viewBox="0 0 560 340" preserveAspectRatio="none">';
    for (var x = 60; x <= 520; x += 46) svg += '<line class="axis" x1="' + x + '" y1="24" x2="' + x + '" y2="292" opacity="0.16"/>';
    for (var y = 40; y <= 292; y += 42) svg += '<line class="axis" x1="60" y1="' + y + '" x2="520" y2="' + y + '" opacity="0.16"/>';
    svg += '<text class="mv" x="290" y="322" text-anchor="middle" font-weight="700">前负荷（心室舒张末期容积 / 初长度）→</text>';
    svg += '<text class="mv" x="16" y="30" font-weight="700">收缩力 / 搏出量</text>';
    /* 骨骼肌：上升后下降 */
    svg += '<path d="M60,280 C150,180 210,110 280,86 C350,104 420,176 500,238" fill="none" stroke="#9aa5b1" stroke-width="3.4" stroke-dasharray="9 6" stroke-linecap="round"/>';
    svg += '<text class="phase-label" x="468" y="228" fill="#7c8794">骨骼肌（有下降支）</text>';
    /* 心肌：上升后平台 */
    svg += '<path d="M60,282 C150,170 220,92 300,74 C390,66 460,66 520,66" fill="none" stroke="' + PH.eject + '" stroke-width="4" stroke-linecap="round"/>';
    svg += '<text class="phase-label" x="416" y="52" fill="' + PH.eject + '">心肌（无下降支 · 平坦）</text>';
    svg += '<line x1="300" y1="292" x2="300" y2="74" stroke="#9b72cf" stroke-width="1.4" stroke-dasharray="4 4"/>';
    svg += '<text class="mv" x="300" y="306" text-anchor="middle" fill="#9b72cf">最适前负荷</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 心率-心输出量曲线（P63） ---------- */
  function hrCoCurve(api, l, t, w, h) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    var svg = '<svg viewBox="0 0 560 300" preserveAspectRatio="none">';
    svg += '<text class="mv" x="290" y="288" text-anchor="middle" font-weight="700">心率 / 次·min⁻¹ →</text>';
    svg += '<text class="mv" x="16" y="26" font-weight="700">心输出量</text>';
    for (var hr = 60; hr <= 220; hr += 40) {
      var x = 60 + (hr - 40) * (440 / 200);
      svg += '<line class="axis" x1="' + x + '" y1="30" x2="' + x + '" y2="252" opacity="0.16"/>';
      svg += '<text class="mv" x="' + x + '" y="268" text-anchor="middle">' + hr + '</text>';
    }
    /* 上升至170-180后下降 */
    function X(hr) { return 60 + (hr - 40) * (440 / 200); }
    svg += '<path d="M' + X(60) + ',220 C' + X(100) + ',150 ' + X(140) + ',88 ' + X(175) + ',70 C' + X(195) + ',72 ' + X(210) + ',96 ' + X(220) + ',150" fill="none" stroke="' + PH.isoC + '" stroke-width="4" stroke-linecap="round"/>';
    svg += '<rect x="' + X(160) + '" y="30" width="' + (X(190) - X(160)) + '" height="222" fill="' + PH.eject + '" opacity="0.08"/>';
    svg += '<text class="phase-label" x="' + X(175) + '" y="52" text-anchor="middle" fill="' + PH.eject + '">170–180</text>';
    svg += '<text class="mv" x="' + X(175) + '" y="120" text-anchor="middle" fill="' + PH.eject + '">超过此界 → 充盈不足</text>';
    svg += '<text class="mv" x="' + X(175) + '" y="138" text-anchor="middle" fill="' + PH.eject + '">SV↓ ≈ 正常一半 → CO 反降</text>';
    svg += '<circle cx="' + X(75) + '" cy="205" r="5" fill="#6bcb77"/>';
    svg += '<text class="mv" x="' + (X(75) + 10) + '" y="209">安静 ≈75 次/分</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ============================================================
     各页覆盖器
     ============================================================ */

  /* P34 · 节封面 */
  O[34] = function (pageEl, data, api) {
    var cover = el(api, 'x-cover');
    var topics = (api.sec.topics || []).map(function (t) { return '<span>' + api.esc(t.t) + '</span>'; }).join('');
    cover.innerHTML =
      '<div class="no">02</div>' +
      '<h1>心脏的泵血功能</h1>' +
      '<div class="en">The Pumping Function of the Heart</div>' +
      '<svg class="ecg" viewBox="0 0 520 70" preserveAspectRatio="none"><path d="M0,40 L80,40 L100,40 L112,22 L124,58 L136,40 L190,40 L205,40 L218,6 L234,66 L248,40 L310,40 L325,40 L338,6 L354,66 L368,40 L430,40 L445,40 L458,6 L474,66 L488,40 L520,40"/></svg>' +
      '<div class="toc">' + topics + '</div>';
    return { steps: [], static: [cover] };
  };

  /* P35 · QR → 3D 心动周期 */
  O[35] = function (pageEl, data, api) {
    var qr = null;
    data.shapes.forEach(function (sh) { if (sh.type === 'pic' && !qr) qr = sh.src; });
    var box = el(api, 'x-qr');
    box.innerHTML =
      '<div class="qrbox">' + (qr ? '<img src="assets/img/' + qr + '" alt="3D心动周期小程序码">' : '') +
      '<div class="cap">微信小程序「3D心动周期」· 扫码可用</div></div>' +
      '<div class="arrow">⟶</div>' +
      '<div class="web"><h3>网页版 · 免扫码</h3>' +
      '<p>下一页<b>直接内嵌「3D 心动周期模拟器」</b>：旋转三维心脏，看房室瓣与动脉瓣在一个周期里的开闭。</p>' +
      '<p>留意右下角的<b>压力-容积环</b>——它就是本节的地图。</p>' +
      '<span class="go">下一页开始互动 →</span></div>';
    return { steps: [], static: [box] };
  };

  /* P36 · 学习目标 */
  O[36] = function (pageEl, data, api) {
    var lines = plainText(data, 1).filter(function (s) { return /^\d\./.test(s); });
    var st = [titleBar(api, '学习目标', '学完本节后，能够——')];
    var kw = ['描述', '解释', '计算', '分析', '说明'];
    var cs = ['#6bcb77', '#f0a04b', '#d9534f', '#4d96ff', '#9b72cf'];
    var steps = [];
    lines.forEach(function (s, i) {
      var card = el(api, 'x-card');
      abs(card, 96, 168 + i * 100, 1090);
      card.style.setProperty('--card-c', cs[i % 5]);
      card.innerHTML = '<span class="tag">目标 ' + (i + 1) + ' · ' + kw[i] + '</span><p>' + api.esc(s.replace(/^\d\.\s*/, '')) + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P38 · 心动周期：概念 + 时间轴 */
  O[38] = function (pageEl, data, api) {
    var st = [titleBar(api, '一、心动周期中的机械变化', '一次收缩 + 一次舒张 = 一个心动周期')];
    var c1 = el(api, 'x-card');
    abs(c1, 70, 140, 500, 150);
    c1.style.setProperty('--card-c', '#6bcb77');
    c1.innerHTML = '<h4>概念与心率</h4><p>心房或心室一次收缩和舒张构成一个<b>机械活动周期</b>。<br>心率 75 次/min → 一个心动周期 <b>0.8 s</b>。</p>';
    var tl = cycleTimeline(api, 60, 310, 1160, 330);
    var c2 = el(api, 'x-card');
    abs(c2, 600, 140, 610, 150);
    c2.style.setProperty('--card-c', '#9b72cf');
    c2.innerHTML = '<h4>读轴要点</h4><p>① 心房先缩、心室后缩——房室延搁的机械意义<br>② <b>全心舒张期 0.4 s</b>：心脏的"休整窗口"，冠脉灌注主要靠舒张期</p>';
    return { steps: [[c1], [tl], [c2]], static: st };
  };

  /* P39 · 射血与充盈：保留瓣膜图 + 分相导读 */
  O[39] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）心室的射血和充盈过程', '收缩期 systole · 舒张期 diastole')];
    var intro = el(api, 'x-card');
    abs(intro, 60, 138, 1160, 74);
    intro.innerHTML = '<p>左心室的泵血 = 收缩期<b>射血相</b> + 舒张期<b>充盈相</b>；每个相再细分若干时期。下图中瓣膜（红=开 / 蓝=关）与血流方向是分期判断的依据。</p>';
    var pics = [];
    [3, 4].forEach(function (idx, k) {
      var src = picOf(data, idx);
      if (!src) return;
      var box = el(api, '');
      abs(box, 60 + k * 590, 226, 570, 400);
      box.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:contain;background:#fff;border:1px solid var(--line);border-radius:12px">';
      pics.push(box);
    });
    var cap = el(api, '');
    abs(cap, 60, 636, 1160, 40);
    cap.innerHTML = '<p style="font-size:13px;color:var(--ink-soft);text-align:center">心室收缩和舒张时心瓣膜、血流方向的变化（左：舒张充盈　右：收缩射血）</p>';
    return { steps: [[intro], pics, [cap]], static: st };
  };

  /* P42 · 压力-容积环（本节地图·分步绘制四相） */
  O[42] = function (pageEl, data, api) {
    var st = [titleBar(api, '压力-容积环：一个心动周期的地图', '横轴容积 · 纵轴压力 · 逆时针运行')];
    var pv = pvLoop(api, 60, 110, 700, 560, {});
    var descs = [
      ['① 心室充盈', '二尖瓣开放，血液流入，容积 40→120 mL，压力略升', PH.fill],
      ['② 等容收缩', '二尖瓣关闭，心室开始收缩但<b>容积不变</b>，压力急升', PH.isoC],
      ['③ 射血', '室内压超过主动脉压 → 半月瓣开 → 容积 120→40 mL', PH.eject],
      ['④ 等容舒张', '半月瓣关闭，心室舒张但容积不变，压力骤降', PH.isoR]
    ];
    var steps = [[pv]];
    descs.forEach(function (dd, i) {
      var card = el(api, 'x-card');
      abs(card, 800, 150 + i * 104, 420, 94);
      card.style.setProperty('--card-c', dd[2]);
      card.innerHTML = '<h4>' + dd[0] + '</h4><p style="font-size:13px">' + dd[1] + '</p>';
      steps.push([card]);
    });
    var note = el(api, 'x-card');
    abs(note, 800, 570, 420, 90);
    note.innerHTML = '<p style="font-size:13px"><b>读环口诀：</b>右缘=EDV，左缘=ESV，上缘=射血压，环宽=SV。</p>';
    steps.push([note]);
    return { steps: steps, static: st };
  };

  /* P43 · PV环·每搏功 + 容积标注 */
  O[43] = function (pageEl, data, api) {
    var st = [titleBar(api, '环的面积 = 每搏功', 'EDV / ESV / SV 在环上的位置')];
    var pv = pvLoop(api, 130, 100, 760, 580, { work: true, volMarks: true });
    var c1 = el(api, 'x-card');
    abs(c1, 920, 150, 300, 150);
    c1.style.setProperty('--card-c', '#d9534f');
    c1.innerHTML = '<h4>每搏功</h4><p style="font-size:13px">阴影面积 = 左心室一次收缩对外做的<b>净功</b>：把血液加压并推入主动脉。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 920, 320, 300, 160);
    c2.style.setProperty('--card-c', '#9b72cf');
    c2.innerHTML = '<h4>前后负荷在环上</h4><p style="font-size:13px">右下点 ≈ <b>前负荷</b>（EDV）<br>射血所对抗的压力 ≈ <b>后负荷</b>（动脉血压）——下一节调节就用这张环。</p>';
    return { steps: [[pv], [c1], [c2]], static: st };
  };

  /* P47 · 搏出量与心输出量 */
  O[47] = function (pageEl, data, api) {
    var st = [titleBar(api, '二、心脏泵血功能的指标 · 1 输出量', '先看一次搏出多少，再看一分钟泵多少')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 1140, 240);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>每搏输出量 SV</h4><div class="en">STROKE VOLUME</div>' +
      '<p style="font-size:15px;margin:6px 0"><b>SV = EDV − ESV</b></p>' +
      '<p>安静：EDV ≈ 100 mL，ESV ≈ 40 mL → <b>SV ≈ 60 mL</b>（左心室）</p></div>' +
      '<div class="col" style="--col-c:#4d96ff"><h4>每分输出量 CO</h4><div class="en">CARDIAC OUTPUT</div>' +
      '<p style="font-size:15px;margin:6px 0"><b>CO = SV × HR</b></p>' +
      '<p>一侧心室每分钟射出的血量——下一页展开。</p></div>';
    var pic = picOf(data, 3);
    var box = el(api, '');
    abs(box, 240, 420, 800, 260);
    if (pic) box.innerHTML = '<img src="' + pic + '" style="width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff">';
    return { steps: [[duo], [box]], static: st };
  };

  /* P48 · 心输出量：4.8L vs 35L */
  O[48] = function (pageEl, data, api) {
    var st = [titleBar(api, '心输出量 CO = SV × HR', '全身 5 L 血，每分钟被心脏完整推一圈')];
    var c1 = el(api, 'x-card');
    abs(c1, 80, 160, 540, 210);
    c1.style.setProperty('--card-c', '#6bcb77');
    c1.innerHTML = '<h4>安静成人</h4><p style="font-size:14px;line-height:2">HR ≈ 80 次/min × SV ≈ 60 mL<br>→ CO ≈ <b style="font-size:22px;color:#6bcb77">4.8 L/min</b>（4.5–6.0）<br>循环血量 ≈ 5 L → <b>每分钟循环 1 次</b></p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 160, 540, 210);
    c2.style.setProperty('--card-c', '#d9534f');
    c2.innerHTML = '<h4>训练的运动员 · 剧烈运动</h4><p style="font-size:14px;line-height:2">CO 可达 <b style="font-size:22px;color:#d9534f">35 L/min</b><br>= 全部血液每分钟循环 <b>7 次</b><br>→ 这就是"心力储备"的具象化</p>';
    var q = el(api, 'x-card');
    abs(q, 80, 410, 1120, 120);
    q.style.setProperty('--card-c', '#f0a04b');
    q.innerHTML = '<h4>思考 💭</h4><p>为什么运动员的静息心率普遍偏低？——提示：CO 不变时，SV 与 HR 是什么关系？（先写下你的推理，后面用心率-输出量曲线检验）</p>';
    return { steps: [[c1], [c2], [q]], static: st };
  };

  /* P51 · 射血分数仪表 */
  O[51] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 射血分数 EF', '搏出量占心室舒张末期容积的百分比')];
    var g1 = efGauge(api, 80, 170, 460, 380, 60, '55–65%');
    var g2 = efGauge(api, 720, 170, 460, 380, 40, '明显↓');
    var t1 = el(api, '');
    abs(t1, 80, 560, 460, 60);
    t1.innerHTML = '<p style="text-align:center;font-size:14px"><b style="color:#6bcb77">健康成人</b>：SV 较大，EF 55%–65%</p>';
    var t2 = el(api, '');
    abs(t2, 720, 560, 460, 90);
    t2.innerHTML = '<p style="text-align:center;font-size:14px"><b style="color:#d9534f">心衰代偿期</b>：心室扩张、EDV 加大，SV 尚可正常，<b>EF 明显减小</b>——SV 正常 ≠ 心功能正常</p>';
    return { steps: [[g1, t1], [g2, t2]], static: st };
  };

  /* P52 · 心脏做功量 */
  O[52] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 心脏做功量', '压强能（势能）+ 血流动能')];
    var c1 = el(api, 'x-card');
    abs(c1, 70, 150, 560, 200);
    c1.innerHTML = '<h4>为什么要看"做功"</h4><p>血液流动消耗的能量由心脏做功供给：转化为<b>压强能</b>与<b>动能</b>。用做功评价泵血功能比单看输出量<b>更全面</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 70, 370, 560, 170);
    c2.style.setProperty('--card-c', '#4d96ff');
    c2.innerHTML = '<h4>右心室 = 左心室的 1/6</h4><p>左右心室搏出量相等，但肺动脉平均压仅约主动脉的 <b>1/6</b> → 右室做功也只有左室的 1/6。</p>';
    var pic = picOf(data, 2);
    var box = el(api, '');
    abs(box, 670, 150, 550, 430);
    if (pic) box.innerHTML = '<img src="' + pic + '" style="width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff">';
    return { steps: [[c1], [c2], [box]], static: st };
  };

  /* P53 · 心输出量的调节：四因素地图 */
  O[53] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、心输出量的调节', 'CO = SV × HR —— 四个旋钮')];
    var hub = el(api, '');
    abs(hub, 470, 260, 340, 160);
    hub.innerHTML = '<div style="width:100%;height:100%;border-radius:20px;background:linear-gradient(135deg,var(--sec-color),#9e3a50);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 18px 40px -14px rgba(158,58,80,.5)"><div style="font-size:15px;opacity:.85;letter-spacing:.1em">心输出量</div><div style="font-family:Georgia,serif;font-size:30px;font-weight:700">CO = SV × HR</div></div>';
    var knobs = [
      ['前负荷', '异长自身调节<br>Frank-Starling 机制', '#6bcb77', 90, 150],
      ['心肌收缩能力', '等长自身调节<br>交感-β₁ 通路', '#d9534f', 900, 150],
      ['后负荷', '动脉血压<br>↑ → SV↓', '#4d96ff', 90, 480],
      ['心率', '<170 次/分：CO↑<br>过快：充盈↓ → CO↓', '#f0a04b', 900, 480]
    ];
    var steps = [[hub]];
    knobs.forEach(function (k) {
      var card = el(api, 'x-card');
      abs(card, k[3], k[4], 300, 130);
      card.style.setProperty('--card-c', k[2]);
      card.innerHTML = '<h4>' + k[0] + '</h4><p style="font-size:13px">' + k[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P55 · 前负荷与 Frank-Starling：心肌 vs 骨骼肌 */
  O[55] = function (pageEl, data, api) {
    var st = [titleBar(api, '（1）前负荷 · 异长自身调节', 'Frank-Starling 机制：心定律')];
    var c1 = el(api, 'x-card');
    abs(c1, 60, 140, 1160, 92);
    c1.innerHTML = '<p>前负荷 = 心室舒张末期压力。充盈越多 → EDV 越大、初长度越长 → 一定范围内<b>收缩力增强</b>（Frank-Starling）。</p>';
    var curve = starlingCurve(api, 420, 240, 800, 420);
    var c2 = el(api, 'x-card');
    abs(c2, 60, 250, 340, 300);
    c2.style.setProperty('--card-c', '#d9534f');
    c2.innerHTML = '<h4>心肌为何没有下降支？</h4><p style="font-size:13px;line-height:1.9">骨骼肌超过最适初长度后收缩力明显下降（有下降支）；<br>心肌达最适后曲线仅<b>变平坦</b>——<br>① 肌纤维螺旋排列<br>② 心包膜限制<br>③ 间质胶原 / titin 约束<br>→ 防止肌小节被过度拉长。</p>';
    return { steps: [[c1], [curve], [c2]], static: st };
  };

  /* P56 · EDV 由什么决定：链条卡 */
  O[56] = function (pageEl, data, api) {
    var st = [titleBar(api, 'EDV：凡影响充盈量的因素都经 Frank-Starling 改变 SV', '充盈量 = 静脉回心血量 + 射血后剩余血量')];
    var chain = [
      ['静脉回流速度', '取决于<b>外周静脉压 − 房室压</b>差<br>血量↑或房室压↓ → 回流↑ → 充盈↑ → SV↑', '#6bcb77'],
      ['剩余血量 · 双重影响', '回流不变时：剩余↑ → 总充盈↑ → SV↑<br>但剩余↑ → 室内压↑ → <b>回流受阻</b> → 总充盈不一定增', '#f0a04b'],
      ['回到 PV 环', '右缘右移 = 前负荷↑<br>环宽（SV）随之改变', '#9b72cf']
    ];
    var steps = [];
    chain.forEach(function (c, i) {
      var card = el(api, 'x-card');
      abs(card, 80 + i * 400, 200, 360, 260);
      card.style.setProperty('--card-c', c[2]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + c[0] + '</h4><p style="font-size:13.5px;line-height:1.95">' + c[1] + '</p>';
      var arrow = el(api, '');
      if (i < 2) {
        abs(arrow, 444 + i * 400, 310, 34, 40);
        arrow.innerHTML = '<div style="font-size:30px;color:var(--sec-color)">⟶</div>';
      }
      steps.push(arrow.innerHTML ? [card, arrow] : [card]);
    });
    var sum = el(api, 'x-card');
    abs(sum, 240, 520, 800, 110);
    sum.innerHTML = '<p style="font-size:14px"><b>一句话：</b>心脏能把回流的血全部泵出——回流多少，搏出多少，这就是"心的定律"。</p>';
    steps.push([sum]);
    return { steps: steps, static: st };
  };

  /* P58 · 心肌收缩能力（等长调节） */
  O[58] = function (pageEl, data, api) {
    var st = [titleBar(api, '（2）心肌收缩能力 · 等长自身调节', '与前负荷无关的"内在动力"')];
    var c1 = el(api, 'x-card');
    abs(c1, 60, 150, 540, 140);
    c1.innerHTML = '<h4>现象</h4><p>强体力劳动 / 锻炼时，代谢水平增高，<b>搏出量与搏功明显增加</b>——靠前负荷解释不了全部。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 60, 310, 540, 220);
    c2.style.setProperty('--card-c', '#d9534f');
    c2.innerHTML = '<h4>机制：交感-儿茶酚胺-β₁</h4><p style="line-height:1.9">交感神经末梢释放<b>去甲肾上腺素</b>，血浆<b>肾上腺素</b>也可作用于心肌细胞膜 <b>β₁ 受体</b> → 收缩能力（contractility）增强。<br>交感不仅支配传导系统，还支配整个心房和心室肌。</p>';
    var pic = picOf(data, 3);
    var box = el(api, '');
    abs(box, 640, 150, 580, 470);
    if (pic) box.innerHTML = '<img src="' + pic + '" style="width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff">';
    return { steps: [[c1], [c2], [box]], static: st };
  };

  /* P60 · 后负荷 */
  O[60] = function (pageEl, data, api) {
    var st = [titleBar(api, '（3）后负荷 · 动脉血压', '心室射血所面对的压力')];
    var chain = el(api, 'x-card');
    abs(chain, 70, 160, 1140, 210);
    chain.style.setProperty('--card-c', '#4d96ff');
    chain.innerHTML = '<h4>动脉血压升高的连锁反应</h4><p style="font-size:14.5px;line-height:2.1">' +
      '动脉压↑ → 等容收缩期室内压峰值↑、<b>等容收缩期延长</b>而射血期缩短<br>' +
      '→ 肌纤维缩短程度与速度↓ → 射血速度减慢 → <b>搏出量↓</b>；反之，动脉压↓ → SV↑</p>';
    var clin = el(api, 'x-card');
    abs(clin, 70, 400, 1140, 110);
    clin.style.setProperty('--card-c', '#6bcb77');
    clin.innerHTML = '<h4>临床反用</h4><p>血管扩张药降低动脉压 → SV↑，缓解心力衰竭——"减负荷治疗"的生理依据。</p>';
    var q = el(api, 'x-card');
    abs(q, 70, 530, 1140, 100);
    q.style.setProperty('--card-c', '#f0a04b');
    q.innerHTML = '<h4>思考 💭（药学衔接）</h4><p>可以从哪些角度设计降压药？——从 CO = SV × HR、外周阻力、血容量三条路各想一个靶点。</p>';
    return { steps: [[chain], [clin], [q]], static: st };
  };

  /* P63 · 心率的调节：CO-HR 曲线 */
  O[63] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 心率的调节', '神经、体液调节 · 平均 75 次/分（60–100 BPM）')];
    var curve = hrCoCurve(api, 120, 130, 1040, 400);
    var c1 = el(api, 'x-card');
    abs(c1, 120, 560, 500, 110);
    c1.style.setProperty('--card-c', '#6bcb77');
    c1.innerHTML = '<p><b>170 次/分以内：</b>心率↑ → CO↑（CO = SV × HR 的主场）</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 560, 500, 110);
    c2.style.setProperty('--card-c', '#d9534f');
    c2.innerHTML = '<p><b>超过 170–180：</b>充盈时间明显缩短 → SV 可降至正常一半 → <b>CO 反降</b></p>';
    return { steps: [[curve], [c1], [c2]], static: st };
  };

  /* P64 · 知识延伸：心率与寿命 */
  O[64] = function (pageEl, data, api) {
    var st = [titleBar(api, '知识延伸 · 心率与寿命', '跨物种的 10 亿次心跳')];
    var big = el(api, '');
    abs(big, 80, 150, 520, 300);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:88px;font-weight:700;background:linear-gradient(120deg,var(--sec-color),#9e3a50);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.05">10亿次</div>' +
      '<p style="font-size:15px;line-height:1.9;margin-top:14px">无论动物（或心脏）大小，哺乳动物心肌的最大容量约为 <b>10 亿次心跳</b>。<br>个体越大，心率越低；较高静息心率 → 过早死亡风险更高。</p>';
    var c1 = el(api, 'x-card');
    abs(c1, 660, 160, 540, 130);
    c1.style.setProperty('--card-c', '#f0a04b');
    c1.innerHTML = '<h4>批判性阅读</h4><p style="font-size:13px">这是<b>相关性</b>而非铁律因果——人类通过运动、药物可改写"预算花得快慢"。想想：哪些干预能减慢"心跳预算"的消耗？</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 310, 540, 150);
    c2.style.setProperty('--card-c', '#6bcb77');
    c2.innerHTML = '<h4>接下一页互动</h4><p style="font-size:13px">骑行模拟器：看自己的心率在运动中如何变化、运动后多快恢复——<b>心率恢复速度</b>本身就是心血管健康的指标。</p>';
    var ref = el(api, '');
    abs(ref, 80, 620, 1120, 50);
    ref.innerHTML = '<p style="font-size:11px;color:var(--ink-soft)">参考：Harvard Health Blog (2016) · NCD RNAday Blog (2021) —— 原课件 P64 附链接</p>';
    return { steps: [[big], [c1], [c2], [ref]], static: st };
  };

  /* P65 · 心力储备：安静 vs 运动 大对比 */
  O[65] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）心力储备', '心输出量可随代谢需要成倍增长')];
    var bar = el(api, 'x-ap');
    abs(bar, 120, 160, 1040, 380);
    var svg = '<svg viewBox="0 0 640 300" preserveAspectRatio="none">' +
      '<text class="mv" x="120" y="270" text-anchor="middle">安静</text>' +
      '<text class="mv" x="460" y="270" text-anchor="middle">强体力活动</text>' +
      '<rect x="60" y="215" width="120" height="35" rx="6" fill="#6bcb77"/>' +
      '<text class="phase-label" x="120" y="200" text-anchor="middle" fill="#6bcb77">≈5 L/min</text>' +
      '<rect x="340" y="30" width="240" height="220" rx="8" fill="' + PH.eject + '" opacity="0.9"/>' +
      '<text class="phase-label" x="460" y="20" text-anchor="middle" fill="' + PH.eject + '">25–30 L/min（5–6 倍）</text>' +
      '<text class="mv" x="460" y="145" text-anchor="middle" fill="#fff" font-size="15">HR 180–200 次/分</text>' +
      '<text class="mv" x="460" y="168" text-anchor="middle" fill="#fff" font-size="15">SV ≈150 mL</text>' +
      '<line class="axis" x1="30" y1="250" x2="610" y2="250"/>' +
      '<text class="mv" x="30" y="20" font-weight="700">心输出量</text></svg>';
    bar.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 120, 560, 1040, 100);
    c1.innerHTML = '<p><b>心力储备</b> = 最大输出量 − 日常输出量。平时 CO 不是最大，需要时成倍增长——储备来自<b>搏出量储备</b>与<b>心率储备</b>两条路（下页）。</p>';
    return { steps: [[bar], [c1]], static: st };
  };

  /* P66 · 搏出量储备 + 心率储备 */
  O[66] = function (pageEl, data, api) {
    var st = [titleBar(api, '储备从哪来', 'SV = EDV − ESV，两头都有余地')];
    var duo = el(api, 'x-duo');
    abs(duo, 90, 170, 1100, 300);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>1 · 搏出量储备</h4><div class="en">STROKE VOLUME RESERVE</div>' +
      '<ul><li><b>收缩期储备</b>：增强收缩 → ESV 更小（挤得更空）</li><li><b>舒张期储备</b>：充盈更多 → EDV 更大（装得更满）</li><li>收缩期储备潜力 ≫ 舒张期储备</li></ul></div>' +
      '<div class="col" style="--col-c:#f0a04b"><h4>2 · 心率储备</h4><div class="en">HEART RATE RESERVE</div>' +
      '<ul><li>安静 60–100 次/分</li><li>SV 不变时，HR 达 160–180 次/分 → CO 增至 <b>2–2.5 倍</b></li><li>超过上限反而降（回看上页曲线）</li></ul></div>';
    return { steps: [[duo]], static: st };
  };

  /* P67 · 前负荷四要点 */
  O[67] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、影响心输出量的因素 ·（一）前负荷', '心室收缩的前负荷')];
    var items = [
      ['心室肌的前负荷', '用心室舒张末期<b>容积</b>与<b>压力</b>表示'],
      ['异长自身调节', '初长度影响收缩力；心肌的长度-收缩关系有其特殊性（无下降支）'],
      ['影响前负荷的因素', '凡影响充盈量的因素 → 经异长调节改变 SV；充盈量 = 静脉回心血量 + 剩余血量'],
      ['心室顺应性', '心室壁变形的难易程度 = 单位压力差引起的容积改变']
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90, 160 + i * 122, 1100);
      card.style.setProperty('--card-c', ['#6bcb77', '#d9534f', '#4d96ff', '#9b72cf'][i]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + it[0] + '</h4><p>' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P68 · 药理联想：NO-cGMP 与静脉容量（药学拓展页） */
  O[68] = function (pageEl, data, api) {
    var st = [titleBar(api, '药理联想 · NO-cGMP 与静脉容量', '生理 → 药理 → 临床注意')];
    var c1 = el(api, 'x-card');
    abs(c1, 70, 150, 1140, 130);
    c1.style.setProperty('--card-c', '#6bcb77');
    c1.innerHTML = '<h4>生理 → 药理映射</h4><p>NO 激活鸟苷酸环化酶 → cGMP↑ → 血管平滑肌舒张。<br><b>硝酸甘油</b>经生物转化释放 NO 样活性，以<b>静脉扩张、降低前负荷</b>为主——正对本页 Frank-Starling。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 70, 300, 1140, 110);
    c2.style.setProperty('--card-c', '#f0a04b');
    c2.innerHTML = '<h4>药学关注 ⚠</h4><p>头痛、低血压、耐受；与 <b>PDE5 抑制剂</b>合用可致严重低血压——用药禁忌的经典案例。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 70, 430, 1140, 110);
    c3.style.setProperty('--card-c', '#4d96ff');
    c3.innerHTML = '<h4>课堂追问</h4><p>扩静脉（降前负荷）与扩动脉（降后负荷）对心衰患者各有何意义？回到 PV 环上指一指。</p>';
    return { steps: [[c1], [c2], [c3]], static: st };
  };
})();
