/* ============================================================
   第一节 · 心脏的电生理学及生理特性 — 精修覆盖器
   注册 window.DECK_OVERRIDES[页码] = fn(el, data, api)
   约定：返回 {steps:[[el..]..], static:[el..]} 交给引擎步进；
   返回 null 表示覆盖器已全自控。
   设计：水彩底 + 心红/静脉蓝，0-4期离子流是核心叙事线。
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

  /* 相位配色（全节统一） */
  var PHASE_C = ['#d9534f', '#f0a04b', '#4d96ff', '#6bcb77', '#9b72cf'];

  /* ---------- 心室肌 AP 曲线 SVG ---------- */
  function ventricularAP(api, l, t, w, h, opts) {
    opts = opts || {};
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    /* 坐标映射：mV ∈ [+40,-100] → y ∈ [26,214]；x ∈ [0,600] */
    function Y(mv) { return 26 + (40 - mv) * (188 / 140); }
    var path = 'M30,' + Y(-90) +
      ' L86,' + Y(-90) +                       /* 静息 */
      ' L118,' + Y(30) +                       /* 0期 快速去极 */
      ' L146,' + Y(4) +                        /* 1期 瞬时复极 */
      ' C170,' + Y(-2) + ' 200,' + Y(-4) + ' 240,' + Y(-2) +
      ' L352,' + Y(-6) +                       /* 2期 平台 */
      ' C392,' + Y(-22) + ' 432,' + Y(-68) + ' 462,' + Y(-90) +  /* 3期 单调加速复极（对标 app：起缓后陡，IK1 正反馈） */
      ' L580,' + Y(-90);                       /* 4期 */
    var bands = [[86, 118], [118, 146], [146, 352], [352, 462], [462, 580]];
    var labels = opts.labels !== false;
    var svg = '<svg viewBox="0 0 600 300" preserveAspectRatio="none">';
    for (var g = 30; g <= 580; g += 55) svg += '<line class="axis" x1="' + g + '" y1="20" x2="' + g + '" y2="232" stroke-width="0.4" opacity="0.25"/>';
    svg += '<line class="axis" x1="30" y1="' + Y(0) + '" x2="580" y2="' + Y(0) + '" stroke-dasharray="5 4"/>';
    svg += '<line class="axis" x1="30" y1="' + Y(-90) + '" x2="580" y2="' + Y(-90) + '"/>';
    svg += '<text class="mv" x="4" y="' + (Y(0) + 4) + '">0</text>';
    svg += '<text class="mv" x="4" y="' + (Y(-90) + 4) + '">-90</text>';
    svg += '<text class="mv" x="4" y="' + (Y(30) + 4) + '">+30</text>';
    bands.forEach(function (b, i) {
      if (opts.bandOnly !== undefined && i !== opts.bandOnly) return;
      svg += '<rect class="phase-band band' + i + '" x="' + b[0] + '" y="20" width="' + (b[1] - b[0]) + '" height="212" fill="' + PHASE_C[i] + '"/>';
    });
    svg += '<path class="curve" d="' + path + '"/>';
    if (labels) {
      var lx = [100, 132, 246, 406, 520];
      for (var i = 0; i < 5; i++) {
        svg += '<text class="phase-label" x="' + lx[i] + '" y="252" text-anchor="middle" fill="' + PHASE_C[i] + '">' + i + '期</text>';
      }
    }
    svg += '<text class="mv" x="30" y="272">膜电位 / mV → 时间</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 窦房结 AP 曲线 SVG ---------- */
  function saNodeAP(api, l, t, w, h) {
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    function Y(mv) { return 20 + (20 - mv) * (200 / 120); }   /* mV ∈ [+20,-100] → y∈[20,220] */
    var d = 'M40,' + Y(-70) +
      ' C90,' + Y(-64) + ' 130,' + Y(-50) + ' 175,' + Y(-40) +  /* 4期 自动去极 → 阈电位-40 */
      ' C205,' + Y(-30) + ' 225,' + Y(-15) + ' 245,' + Y(10) +  /* 0期 慢 Ca 内流 */
      ' C285,' + Y(-30) + ' 330,' + Y(-60) + ' 375,' + Y(-70) + /* 3期 复极 */
      ' C430,' + Y(-64) + ' 470,' + Y(-50) + ' 515,' + Y(-40) +
      ' C545,' + Y(-30) + ' 565,' + Y(-15) + ' 585,' + Y(10);
    var svg = '<svg viewBox="0 0 620 260" preserveAspectRatio="none">';
    svg += '<line class="axis" x1="40" y1="' + Y(-40) + '" x2="600" y2="' + Y(-40) + '" stroke-dasharray="5 4"/>';
    svg += '<text class="mv" x="6" y="' + (Y(-40) + 4) + '">阈电位-40</text>';
    svg += '<text class="mv" x="6" y="' + (Y(-70) + 4) + '">-70</text>';
    svg += '<rect class="phase-band band4" x="40" y="16" width="135" height="222" fill="' + PHASE_C[4] + '"/>';
    svg += '<rect class="phase-band band0" x="175" y="16" width="70" height="222" fill="' + PHASE_C[0] + '"/>';
    svg += '<rect class="phase-band band3" x="245" y="16" width="130" height="222" fill="' + PHASE_C[3] + '"/>';
    svg += '<path class="curve" d="' + d + '"/>';
    svg += '<text class="phase-label" x="107" y="248" text-anchor="middle" fill="' + PHASE_C[4] + '">4期 自动去极化</text>';
    svg += '<text class="phase-label" x="210" y="248" text-anchor="middle" fill="' + PHASE_C[0] + '">0期</text>';
    svg += '<text class="phase-label" x="310" y="248" text-anchor="middle" fill="' + PHASE_C[3] + '">3期</text>';
    svg += '</svg>';
    box.innerHTML = svg;
    return box;
  }

  /* ---------- 不应期图（P19-21 共用，高亮不同带） ---------- */
  function refractoryAP(api, l, t, w, h, hl) {
    /* hl: 0=ERP 1=RRP 2=SNP */
    var box = el(api, 'x-ap');
    abs(box, l, t, w, h);
    function Y(mv) { return 26 + (40 - mv) * (188 / 140); }
    var path = 'M30,' + Y(-90) + ' L86,' + Y(-90) + ' L118,' + Y(30) +
      ' L146,' + Y(4) + ' L240,' + Y(-2) + ' L352,' + Y(-6) +
      ' C392,' + Y(-22) + ' 432,' + Y(-68) + ' 462,' + Y(-90) + ' L580,' + Y(-90);
    /* 复极 3 期上 -55 / -60 / -80 / -90 对应的近似 x */
    function Xof(mv) { /* 3期段近似线性 x: 352(-6)→462(-90) */
      return 352 + ((-6 - mv) / 84) * (462 - 352);
    }
    var bands = [
      { x0: 86, x1: Xof(-60), c: '#d9534f', name: '有效不应期 ERP', desc: '任何刺激均不能引起兴奋' },
      { x0: Xof(-60), x1: Xof(-80), c: '#f0a04b', name: '相对不应期 RRP', desc: '阈上刺激可引起兴奋（低于正常）' },
      { x0: Xof(-80), x1: 480, c: '#6bcb77', name: '超常期 SNP', desc: '阈下刺激即可引起兴奋' }
    ];
    var svg = '<svg viewBox="0 0 600 300" preserveAspectRatio="none">';
    svg += '<line class="axis" x1="30" y1="' + Y(0) + '" x2="580" y2="' + Y(0) + '" stroke-dasharray="5 4"/>';
    [ -55, -60, -80 ].forEach(function (mv) {
      svg += '<line class="axis" x1="30" y1="' + Y(mv) + '" x2="580" y2="' + Y(mv) + '" stroke-dasharray="2 4" opacity="0.5"/>';
      svg += '<text class="mv" x="2" y="' + (Y(mv) + 4) + '">' + mv + '</text>';
    });
    bands.forEach(function (b, i) {
      svg += '<rect class="segband" x="' + b.x0 + '" y="20" width="' + (b.x1 - b.x0) + '" height="212" fill="' + b.c + '"' + (i === hl ? ' opacity="0.3"' : '') + '/>';
      svg += '<text class="phase-label" x="' + ((b.x0 + b.x1) / 2) + '" y="252" text-anchor="middle" fill="' + b.c + '"' + (i === hl ? ' font-size="15"' : ' opacity="0.55"') + '>' + b.name.split(' ')[0] + '</text>';
    });
    svg += '<path class="curve" d="' + path + '"/>';
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

  /* P5 · 扫码 → 网页版直达 */
  O[5] = function (pageEl, data, api) {
    var qrImg = null, qrImg2 = null;
    data.shapes.forEach(function (sh) {
      if (sh.type === 'pic' && sh.src) { if (!qrImg) qrImg = sh.src; else qrImg2 = sh.src; }
    });
    var box = el(api, 'x-qr');
    box.innerHTML =
      '<div class="qrbox">' +
      (qrImg ? '<img src="assets/img/' + qrImg + '" alt="动作电位互动系统二维码">' : '') +
      '<div class="cap">PPT 原版二维码 · 手机扫码可用</div></div>' +
      '<div class="arrow">⟶</div>' +
      '<div class="web"><h3>网页版 · 免扫码</h3>' +
      '<p>这张幻灯片在 PPT 里只能展示二维码；网页课件的下一页<b>直接内嵌了「动作电位互动教学系统」</b>。</p>' +
      '<p>按 <b>→</b> 进入，调一调细胞外 Na⁺ 浓度，看动作电位 0 期如何变化。</p>' +
      '<span class="go">下一页开始互动 →</span></div>';
    return { steps: [], static: [box] };
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

  /* P8 · 两类心肌细胞：双栏对比 + 原图 */
  O[8] = function (pageEl, data, api) {
    var st = [titleBar(api, '一、心肌细胞的生物电现象', '心脏由两类心肌细胞构成')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 150, 700, 330);
    duo.innerHTML =
      '<div class="col" style="--col-c:#d9534f"><h4>工作心肌细胞</h4><div class="en">WORKING CARDIAC MYOCYTE</div>' +
      '<ul><li>构成心房和心室壁的普通心肌细胞</li><li>有收缩性，<b>无自动节律性</b></li><li>执行泵血功能</li></ul></div>' +
      '<div class="col" style="--col-c:#4d96ff"><h4>自律心肌细胞</h4><div class="en">AUTORHYTHMIC CELL</div>' +
      '<ul><li>窦房结、房室交界、房室束、浦肯野纤维</li><li>能自发产生兴奋：<b>自动节律性</b></li><li>无收缩性，是心脏兴奋的起源</li></ul></div>';
    var note = el(api, 'x-card');
    abs(note, 70, 500, 1150, 130);
    note.innerHTML = '<p>' + api.esc(plainText(data, 3).join('')) + '</p>';
    /* 原图（右侧 group 展开的三张 AP 图） */
    var pics = [];
    var g = data.shapes[2];
    if (g && g.children) {
      var picBox = el(api, '');
      abs(picBox, 790, 150, 420, 320);
      g.children.forEach(function (ch) {
        if (ch.kind === 'pic') {
          var im = api.ce('img');
          im.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g)$/i, '.webp');
          im.style.cssText = 'position:absolute;left:' + (ch.l - 790) + 'px;top:' + (ch.t - 150) + 'px;width:' + ch.w + 'px;height:' + ch.h + 'px;object-fit:contain;';
          picBox.appendChild(im);
        }
      });
      pics.push(picBox);
    }
    return { steps: [[duo], pics, [note]], static: st };
  };

  /* P10 · 心室肌动作电位：0-4期 分相位点亮（本课核心页） */
  O[10] = function (pageEl, data, api) {
    var st = [titleBar(api, '（2）心室肌细胞动作电位', '分为 0、1、2、3、4 期 · 复极复杂 · 持续时间长 · 升降支不对称')];
    var ap = ventricularAP(api, 60, 140, 720, 460, {});
    var intro = el(api, 'x-card');
    abs(intro, 820, 150, 410, 118);
    intro.innerHTML = '<h4>三大特点</h4><p>① 复极过程复杂 ② 持续时间长——<b>2 期平台期</b>是心室肌 AP 的标志 ③ 升降支不对称</p>';
    var descs = [
      ['0期 · 快速去极化', 'Na⁺ 快速内流（I_Na），-90 → +30 mV', '#d9534f'],
      ['1期 · 瞬时复极', '瞬时外向电流 I_to（K⁺ 外流）', '#f0a04b'],
      ['2期 · 平台期', 'Ca²⁺ 内流（I_Ca-L）与 K⁺ 外流（I_K）平衡——<b>心室肌特有</b>', '#4d96ff'],
      ['3期 · 快速复极', 'K⁺ 外流增强（I_K、I_K1）→ 回到 -90 mV', '#6bcb77'],
      ['4期 · 静息期', '钠钾泵、钠钙交换体、钙泵恢复离子分布', '#9b72cf']
    ];
    var steps = [[ap, intro]];
    descs.forEach(function (dd, i) {
      var band = el(api, '');
      band.innerHTML = '<div style="position:absolute;left:60px;top:' + (140 + i * 92) + 'px;width:720px;height:86px;border-radius:10px;background:' + dd[2] + '22;border:1.5px solid ' + dd[2] + ';pointer-events:none;"></div>';
      var card = el(api, 'x-card');
      abs(card, 820, 292 + i * 74, 410, 68);
      card.style.setProperty('--card-c', dd[2]);
      card.style.padding = '10px 16px';
      card.innerHTML = '<h4 style="margin-bottom:2px;font-size:14px">' + dd[0] + '</h4><p style="font-size:12px;line-height:1.5">' + dd[1] + '</p>';
      steps.push([band, card]);
    });
    return { steps: steps, static: st };
  };

  /* P11 · 各期离子流：表格化（沿用 PPT 4 步动画） */
  O[11] = function (pageEl, data, api) {
    var st = [titleBar(api, '心室肌细胞动作电位各期主要离子流', '把 0–4 期与通道电流对号入座')];
    var ap = ventricularAP(api, 640, 120, 580, 330, { labels: true });
    var rows = [
      ['0期', 'Na⁺ 内流', 'I_Na（快钠通道）', '#d9534f'],
      ['1期', '瞬时外向电流', 'I_to（K⁺ 外流）', '#f0a04b'],
      ['2期', 'Ca²⁺ 内流 ＋ K⁺ 外流', 'I_Ca-L ＋ I_K', '#4d96ff'],
      ['3期', 'K⁺ 外流', 'I_K ＋ I_K1', '#6bcb77'],
      ['4期', '主动转运恢复', '钠钾泵 · 钠钙交换体 · 钙泵', '#9b72cf']
    ];
    var tbl = api.ce('table', 'x-table');
    tbl.innerHTML = '<tr><th style="width:70px">期</th><th>主要离子流</th><th>通道 / 载体</th></tr>' +
      rows.map(function (r) {
        return '<tr><td style="color:' + r[3] + '">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>';
      }).join('');
    var tw = el(api, '');
    abs(tw, 60, 130, 540, 340);
    tw.appendChild(tbl);
    /* 5 步：表格整体 + 每行高亮（简化为：表格一步、AP图一步、结论一步） */
    var note = el(api, 'x-card');
    abs(note, 60, 500, 1160, 120);
    note.innerHTML = '<p><b>记忆钩：</b>0 升 1 降 2 平台，3 回 4 复原。平台期的 Ca²⁺ 内流同时是<b>兴奋-收缩耦联</b>的触发信号——下一节泵血功能的电学起点。</p>';
    return { steps: [[tw], [ap], [note]], static: st };
  };

  /* P16 · 窦房结 P 细胞机制：SVG + 4期三机制卡 */
  O[16] = function (pageEl, data, api) {
    var st = [titleBar(api, '窦房结 P 细胞的跨膜电位及其形成机制', '0期·3期·4期 —— 没有 1、2 期')];
    var ap = saNodeAP(api, 620, 120, 610, 330);
    var c0 = el(api, 'x-card');
    abs(c0, 60, 140, 520, 130);
    c0.style.setProperty('--card-c', '#d9534f');
    c0.innerHTML = '<h4>0期 · 去极化</h4><p>膜上 L 型钙通道开放，<b>Ca²⁺ 内流（I_Ca-L）</b>——速度慢、幅度低，故称「慢反应细胞」</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 60, 285, 520, 120);
    c3.style.setProperty('--card-c', '#6bcb77');
    c3.innerHTML = '<h4>3期 · 复极化</h4><p>钙通道逐渐失活，K⁺ 通道激活，<b>K⁺ 外流（I_K）</b>使膜复极至最大复极电位 -70 mV</p>';
    var c4 = el(api, 'x-card');
    abs(c4, 60, 420, 1170, 190);
    c4.style.setProperty('--card-c', '#9b72cf');
    c4.innerHTML = '<h4>4期 · 自动去极化（自律性的来源）——三种电流接力</h4>' +
      '<p>① <b>I_K 衰减</b>：K⁺ 外流进行性减弱（最重要）<br>② <b>I_f 起搏电流</b>：进行性增强的内向电流（主要为 Na⁺）<br>③ <b>T 型钙通道</b>：后期开放，Ca²⁺ 内流把膜电位推过阈值</p>';
    return { steps: [[ap], [c0], [c3], [c4]], static: st };
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
