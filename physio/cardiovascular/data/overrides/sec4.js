/* ============================================================
   第四节 · 心血管活动的调节（P150–171）— 精修覆盖器
   核心叙事：短期靠神经（压力感受性反射 = 缓冲神经），
            长期靠体液与肾（RAAS / 血管升压素 / 压力性利尿）
   英雄页：P153/155 心交感 vs 心迷走双侧对照、P157 三类纤维表、
          P160 反射弧、P161 双向反射效应（+homeostasis 失血场景）
   节色：调节绿 #4E7A5A；交感红 / 迷走绿 / 体液橙 / RAAS 紫
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
  function picOf(data, idx) {
    var sh = data.shapes[idx];
    return (sh && sh.type === 'pic') ? 'assets/img/' + sh.src : null;
  }
  function picBox(api, src, l, t, w, h, cap) {
    var box = el(api, '');
    abs(box, l, t, w, h);
    box.innerHTML = '<img src="' + src + '" style="width:100%;height:' + (cap ? '82%' : '100%') + ';object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff">' +
      (cap ? '<p style="font-size:12px;color:var(--ink-soft);text-align:center;margin-top:6px">' + cap + '</p>' : '');
    return box;
  }
  var C = { sym: '#d9534f', vag: '#4E7A5A', hum: '#f0a04b', raas: '#9b72cf', vol: '#4d96ff', teal: '#3a8a7a' };

  /* ============================================================ */

  /* P150 · 节封面 */
  O[150] = function (pageEl, data, api) {
    var cover = el(api, 'x-cover');
    var topics = (api.sec.topics || []).map(function (t) { return '<span style="border-color:rgba(78,122,90,.4);color:#4E7A5A">' + api.esc(t.t) + '</span>'; }).join('');
    cover.innerHTML =
      '<div class="no" style="background:linear-gradient(120deg,#4E7A5A,#8FBC8F);-webkit-background-clip:text;background-clip:text">04</div>' +
      '<h1>心血管活动的调节</h1>' +
      '<div class="en">Cardiovascular Regulation · 短期靠神经，长期靠体液与肾</div>' +
      '<svg class="ecg" viewBox="0 0 520 70" preserveAspectRatio="none"><path style="stroke:#4E7A5A" d="M0,40 L40,40 C55,20 70,20 85,40 L115,40 C130,58 145,58 160,40 L200,40 C215,22 230,22 245,40 L275,40 C290,56 305,56 320,40 L360,40 C375,24 390,24 405,40 L435,40 C450,55 465,55 480,40 L520,40"/></svg>' +
      '<div class="toc">' + topics + '</div>';
    return { steps: [], static: [cover] };
  };

  /* P151 · 学习目标 */
  O[151] = function (pageEl, data, api) {
    var st = [titleBar(api, '学习目标', '学完本节后，能够——')];
    var lines = [
      '描述心血管中枢与自主神经支配，联系递质和受体解释心脏及血管的反应',
      '完整描述压力感受性反射弧，分析血压升降时各环节的变化及其负反馈意义',
      '比较肾上腺素与去甲肾上腺素的作用，结合受体分布解释血压和心率变化',
      '说明 RAAS、血管升压素与心房钠尿肽对血容量和血压的调节',
      '概述化学感受性反射、内皮活性物质和局部自身调节，区分短期与长期调节'
    ];
    var kw = ['描述·解释', '描述·分析', '比较·解释', '说明', '概述·区分'];
    var cs = [C.sym, C.vag, C.hum, C.raas, C.vol];
    var steps = [];
    lines.forEach(function (s, i) {
      var card = el(api, 'x-card');
      abs(card, 96, 150 + i * 102, 1090);
      card.style.setProperty('--card-c', cs[i]);
      card.innerHTML = '<span class="tag">目标 ' + (i + 1) + ' · ' + kw[i] + '</span><p>' + s + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P152 · 神经支配总图 */
  O[152] = function (pageEl, data, api) {
    var st = [titleBar(api, '一、神经调节 ·（一）心血管的神经支配', '先看全局：自主神经如何布防心脏与血管')];
    var box = picBox(api, picOf(data, 0), 240, 140, 800, 470, null);
    var c1 = el(api, 'x-card');
    abs(c1, 240, 622, 800, 70);
    c1.style.setProperty('--card-c', C.vag);
    c1.innerHTML = '<p style="font-size:13px">读图任务：找到<b>心交感神经</b>（脊髓 T1～5 发出）与<b>心迷走神经</b>（延髓发出）——一快一慢两根"缰绳"。</p>';
    return { steps: [[box], [c1]], static: st };
  };

  /* P153/155 共用：心神经对照卡 */
  function heartNerve(api, cfg) {
    var nodes = [];
    /* 头部：起源→支配 */
    var head = el(api, 'x-card');
    abs(head, 60, 150, 700, 120);
    head.style.setProperty('--card-c', cfg.color);
    head.innerHTML = '<h4>' + cfg.name + '</h4><p style="font-size:13px;line-height:1.9"><b>起源</b>：' + cfg.origin + '<br><b>支配</b>：' + cfg.innerv + '</p>';
    nodes.push([head]);
    /* 递质-受体-机制链 */
    var mech = el(api, '');
    abs(mech, 60, 295, 700, 130);
    mech.innerHTML = '<div style="display:flex;align-items:center;gap:10px;height:100%">' + cfg.chain.map(function (n, i) {
      var isHot = i === 0;
      return '<div style="flex:1;text-align:center;background:rgba(255,253,249,.92);border:1.5px solid ' + (isHot ? cfg.color : 'var(--line)') + ';border-radius:12px;padding:14px 6px;font-size:13px;line-height:1.5;font-weight:' + (isHot ? 700 : 500) + '">' + n + '</div>';
    }).join('<div style="font-size:18px;color:var(--ink-soft)">→</div>') + '</div>';
    nodes.push([mech]);
    /* 三效应徽章 */
    var eff = el(api, '');
    abs(eff, 60, 450, 700, 120);
    eff.innerHTML = '<div style="display:flex;gap:16px;height:100%">' + cfg.effects.map(function (e) {
      return '<div style="flex:1;background:rgba(255,253,249,.92);border:1px solid var(--line);border-top:4px solid ' + cfg.color + ';border-radius:12px;padding:12px;text-align:center"><p style="font-size:12.5px;color:var(--ink-soft)">' + e[0] + '</p><p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:' + cfg.color + ';margin-top:4px">' + e[1] + '</p></div>';
    }).join('') + '</div>';
    nodes.push([eff]);
    return nodes;
  }

  /* P153 · 心交感神经 */
  O[153] = function (pageEl, data, api) {
    var st = [titleBar(api, '1 · 心脏的神经支配 ①', '心交感神经 —— 加速踏板')];
    var nodes = heartNerve(api, {
      name: '心交感神经', color: C.sym,
      origin: '脊髓 T1～5 中间外侧柱',
      innerv: '窦房结、房室交界、房室束、心房肌、<b>心室肌</b>（全心）',
      chain: ['去甲肾上腺素<br>+<br><b>β₁ 受体</b>', 'G<sub>s</sub> 蛋白<br>AC 活化', 'cAMP ↑<br>PKA 活化', '膜对 Ca²⁺<br>通透性增强'],
      effects: [['正性变时 · 心率', '↑'], ['正性变力 · 收缩力', '↑'], ['正性变传导 · 房室传导', '↑']]
    });
    var box = picBox(api, picOf(data, 3), 800, 160, 420, 400, '心交感神经及其作用');
    nodes.push([box]);
    return { steps: nodes, static: st };
  };

  /* P155 · 心迷走神经 */
  O[155] = function (pageEl, data, api) {
    var st = [titleBar(api, '1 · 心脏的神经支配 ②', '心迷走神经 —— 制动刹车')];
    var nodes = heartNerve(api, {
      name: '心迷走神经', color: C.vag,
      origin: '延髓迷走神经背核和疑核',
      innerv: '窦房结、心房肌、房室交界、房室束及其分支（<b>心室肌很少</b>）',
      chain: ['乙酰胆碱<br>+<br><b>M 受体</b>', 'G<sub>i</sub> 蛋白<br>AC 抑制', 'cAMP ↓<br>Ca²⁺ 内流减少', 'I<sub>K-ACh</sub> 激活<br>K⁺ 外流增多'],
      effects: [['负性变时 · 心率', '↓'], ['负性变力 · 收缩力', '↓'], ['负性变传导 · 房室传导', '↓']]
    });
    var vs = el(api, 'x-card');
    abs(vs, 800, 500, 420, 100);
    vs.style.setProperty('--card-c', C.vag);
    vs.innerHTML = '<p style="font-size:12.5px;line-height:1.8"><b>双侧对照：</b>交感支配<b>全心</b>、迷走以<b>心房</b>为主；安静时<b>迷走占优势</b>（迷走紧张）——所以切断迷走，心率明显加快。</p>';
    nodes.push([vs]);
    var box = picBox(api, picOf(data, 2), 800, 160, 420, 320, null);
    nodes.splice(1, 0, [box]);
    return { steps: nodes, static: st };
  };

  /* P156 · 交感缩血管神经纤维 */
  O[156] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 血管的神经支配 ①', '交感缩血管神经纤维 —— 外周阻力的总开关')];
    var c1 = el(api, 'x-card');
    abs(c1, 70, 160, 560, 150);
    c1.style.setProperty('--card-c', C.sym);
    c1.innerHTML = '<h4>基本配置</h4><p style="font-size:13px;line-height:1.9">节前神经元：<b>脊髓胸腰段中间外侧柱</b>；节后递质：<b>去甲肾上腺素</b>。<br>支配<b>几乎所有血管</b>，不同部位密度不同（皮肤 &gt; 骨骼肌/内脏 &gt; 心脑）。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 70, 330, 560, 130);
    c2.innerHTML = '<h4>受体谱</h4><p style="line-height:2">血管平滑肌 <b>α 受体</b>（结合能力<b>强</b> → 收缩为主）＋ <b>β₂ 受体</b>（结合能力弱 → 舒张被掩盖）。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 70, 480, 560, 130);
    c3.style.setProperty('--card-c', C.hum);
    c3.innerHTML = '<h4>缩血管紧张 vasomotor tone</h4><p style="font-size:13px;line-height:1.9">平时就有持续性低频放电，维持血管基础张力：<br><b>紧张增强 → 血管收缩；紧张减弱 → 血管舒张</b>——调节只需调"音量"。</p>';
    var box = picBox(api, picOf(data, 2), 680, 160, 540, 450, '交感缩血管纤维的支配与作用');
    return { steps: [[c1], [c2], [box], [c3]], static: st };
  };

  /* P157 · 支配血管的神经纤维比较（表重绘） */
  O[157] = function (pageEl, data, api) {
    var st = [titleBar(api, '② 交感舒血管　③ 副交感舒血管', '三类血管神经纤维一表对照')];
    var rows = [
      ['起源', '胸腰段脊髓中间外侧柱', '大脑皮层运动区下行', '脑干副交感核、骶髓 S2～4'],
      ['神经支配', '几乎所有血管（密度不一）', '骨骼肌血管', '脑膜、消化腺、外生殖器的血管'],
      ['末梢递质', '去甲肾上腺素', '乙酰胆碱', '乙酰胆碱'],
      ['受体', 'α（强）、β₂（弱）', 'M 受体', 'M 受体'],
      ['效应', '血管收缩', '血管舒张', '血管舒张'],
      ['生理意义', '有紧张性活动；调节血流阻力、血流量和血压', '与情绪、运动开始时骨骼肌血流增加有关', '只调节局部血流量，对血压影响小']
    ];
    var hot = ['', '', '', '', '', ''];
    var html = '<table class="x-table"><thead><tr><th>项目</th><th style="background:linear-gradient(90deg,#d9534f,#b03a32)">交感缩血管纤维</th><th>交感舒血管纤维</th><th>副交感舒血管纤维</th></tr></thead><tbody>';
    rows.forEach(function (r, ri) {
      html += '<tr' + (ri === 5 ? ' style="background:rgba(78,122,90,.08)"' : '') + '><td>' + r[0] + '</td><td style="font-size:12.5px">' + r[1] + '</td><td style="font-size:12.5px">' + r[2] + '</td><td style="font-size:12.5px">' + r[3] + '</td></tr>';
    });
    html += '</tbody></table>';
    var tb = el(api, '');
    abs(tb, 70, 150, 1140, 420);
    tb.innerHTML = html;
    var note = el(api, 'x-card');
    abs(note, 70, 596, 1140, 70);
    note.style.setProperty('--card-c', C.sym);
    note.innerHTML = '<p style="font-size:13px">全身血管张力 = <b>交感缩血管纤维一家独大</b>（有紧张性、管血压）；两类舒血管纤维只管局部、特殊场合。</p>';
    return { steps: [[tb], [note]], static: st };
  };

  /* P158 · 心血管中枢 */
  O[158] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）心血管中枢', '延髓是基本中枢')];
    var c0 = el(api, 'x-card');
    abs(c0, 60, 150, 620, 110);
    c0.innerHTML = '<h4>脊髓</h4><p style="font-size:13px;line-height:1.85">中枢调控的<b>最后传出通路</b>；能完成某些原始心血管反射、维持一定血管张力——但不能进行精细整合。</p>';
    var items = [
      ['孤束核', '心血管感受器传入纤维的<b>接替站</b>（信息入口）', C.vol],
      ['迷走神经背核和疑核', '调节心迷走神经活动（迷走紧张的来源）', C.vag],
      ['延髓头端腹外侧区 RVLM', '兴奋时 → <b>交感紧张增强</b>', C.sym],
      ['延髓尾端腹外侧区 CVLM', '兴奋时 → 抑制 RVLM → <b>交感紧张减弱</b>', C.teal]
    ];
    var steps = [[c0]];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 60 + (i % 2) * 320, 285 + Math.floor(i / 2) * 155, 300, 140);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4 style="font-size:14.5px">' + it[0] + '</h4><p style="font-size:12.5px;line-height:1.8">' + it[1] + '</p>';
      steps.push([card]);
    });
    var box = picBox(api, picOf(data, 5), 720, 150, 500, 470, '延髓调控心血管活动的重要核团');
    return { steps: steps.concat([[box]]), static: st };
  };

  /* P159 · 压力感受器 */
  O[159] = function (pageEl, data, api) {
    var st = [titleBar(api, '（三）心血管反射 · 1 颈动脉窦和主动脉弓压力感受性反射', '又叫减压反射 / 稳压反射')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 620, 180);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.sym + '"><h4>颈动脉窦</h4><p>颈内动脉起始部的膨大区——感受器的"哨所"之一。</p></div>' +
      '<div class="col" style="--col-c:' + C.vol + '"><h4>主动脉弓</h4><p>主动脉弓血管外膜下的感觉神经末梢。</p></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 70, 370, 620, 130);
    c1.style.setProperty('--card-c', C.hum);
    c1.innerHTML = '<h4>感受器的本质</h4><p style="line-height:2">血管<b>外膜下的感觉神经末梢</b>——是<b>牵张感受器</b>：血压越高、血管壁被拉得越开，放电越多。<br><span style="font-size:12.5px;color:var(--ink-soft)">它测的不是"压力数字"，而是"血管壁被撑开的程度"。</span></p>';
    var box = picBox(api, picOf(data, 2), 730, 150, 500, 460, '颈动脉窦区与主动脉弓区的压力感受器与化学感受器');
    return { steps: [[duo], [box], [c1]], static: st };
  };

  /* P160 · 传入神经及中枢联系（反射弧重绘） */
  O[160] = function (pageEl, data, api) {
    var st = [titleBar(api, '（2）传入神经及其中枢联系', '两条传入路，一个总枢纽')];
    var svg = '<svg viewBox="0 0 700 360" preserveAspectRatio="none">';
    svg += '<defs><marker id="aG4" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#4E7A5A"/></marker></defs>';
    function node(x, y, w, txt, color, fs) {
      return '<rect x="' + (x - w / 2) + '" y="' + (y - 26) + '" width="' + w + '" height="52" rx="12" fill="rgba(255,253,249,.95)" stroke="' + color + '" stroke-width="1.6"/>' +
        '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="' + (fs || 12.5) + '" font-weight="700" fill="' + color + '">' + txt + '</text>';
    }
    svg += node(120, 60, 150, '颈动脉窦', C.sym);
    svg += node(120, 160, 170, '窦神经 → 舌咽神经', '#8a4a44', 11.5);
    svg += node(560, 60, 150, '主动脉弓', C.vol);
    svg += node(560, 160, 190, '迷走神经（减压神经）', '#3a5a78', 11.5);
    svg += '<line x1="120" y1="86" x2="120" y2="134" stroke="#8a4a44" stroke-width="2.4" marker-end="url(#aG4)"/>';
    svg += '<line x1="560" y1="86" x2="560" y2="134" stroke="#3a5a78" stroke-width="2.4" marker-end="url(#aG4)"/>';
    svg += node(340, 240, 170, '延髓孤束核', C.vag);
    svg += '<path d="M170,175 C240,200 280,210 290,214" stroke="#8a4a44" stroke-width="2.4" fill="none" marker-end="url(#aG4)"/>';
    svg += '<path d="M510,175 C440,200 400,210 390,214" stroke="#3a5a78" stroke-width="2.4" fill="none" marker-end="url(#aG4)"/>';
    svg += node(180, 320, 240, 'CVLM ⊣ RVLM → 交感紧张↓', C.sym, 11.5);
    svg += node(520, 320, 230, '迷走背核/疑核 → 迷走紧张↑', C.vag, 11.5);
    svg += '<line x1="310" y1="266" x2="220" y2="294" stroke="' + C.sym + '" stroke-width="2.4" marker-end="url(#aG4)"/>';
    svg += '<line x1="370" y1="266" x2="480" y2="294" stroke="' + C.vag + '" stroke-width="2.4" marker-end="url(#aG4)"/>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 50, 150, 760, 400);
    dia.innerHTML = svg;
    var box = picBox(api, picOf(data, 1), 840, 160, 390, 330, '传入神经及其中枢联系示意（教材原图）');
    var note = el(api, 'x-card');
    abs(note, 840, 510, 390, 100);
    note.innerHTML = '<p style="font-size:12.5px;line-height:1.8">孤束核是<b>总枢纽</b>：一路经 CVLM 抑制 RVLM（松交感），一路激活背核疑核（紧迷走）。</p>';
    return { steps: [[dia], [box], [note]], static: st };
  };

  /* P161 · 反射效应（双向负反馈 · 本节最高点） */
  O[161] = function (pageEl, data, api) {
    var st = [titleBar(api, '（3）反射效应', '血压一偏，全弧联动纠偏')];
    function chain(y, trig, trigC, mid, eff, res, resC) {
      var nodes = [trig, '窦弓感受器' + mid[0], '传入冲动' + mid[1], mid[2], eff, res];
      var cols = [trigC, '#8a4a44', '#8a4a44', C.vag, C.hum, resC];
      var row = el(api, '');
      abs(row, 40, y, 1200, 130);
      row.innerHTML = '<div style="display:flex;align-items:center;gap:8px;height:100%">' + nodes.map(function (n, i) {
        var hot = i === 0 || i === nodes.length - 1;
        return '<div style="flex:1;text-align:center;background:rgba(255,253,249,.94);border:' + (hot ? '2px' : '1.5px') + ' solid ' + cols[i] + ';border-radius:12px;padding:14px 4px;font-size:' + (hot ? 14.5 : 12) + 'px;font-weight:' + (hot ? 700 : 500) + ';color:' + cols[i] + ';line-height:1.5">' + n + '</div>';
      }).join('<div style="font-size:16px;color:var(--ink-soft)">→</div>') + '</div>';
      return row;
    }
    var up = chain(160, '动脉血压<br><b>↑</b>', C.sym, ['牵拉兴奋↑', '↑', '心迷走紧张↑<br>心交感/缩血管紧张↓'], '心率↓ 收缩力↓<br>外周血管舒张', '血压回降<br><b>↓</b>', C.vag);
    var dn = chain(330, '动脉血压<br><b>↓</b>', C.vol, ['牵拉兴奋↓', '↓', '心迷走紧张↓<br>心交感/缩血管紧张↑'], '心率↑ 收缩力↑<br>外周血管收缩', '血压回升<br><b>↑</b>', C.sym);
    var note = el(api, 'x-card');
    abs(note, 40, 500, 1200, 100);
    note.style.setProperty('--card-c', C.vag);
    note.innerHTML = '<h4>负反馈</h4><p style="font-size:13.5px;line-height:1.9">血压升 → 反射把它拉下来；血压降 → 反射把它托回去。<b>效应总是与刺激相反</b>——典型的负反馈调节。下面在模拟器里亲手"失血"一次，看这条弧几秒之内上线抢救血压（失血场景）。</p>';
    return { steps: [[up], [dn], [note]], static: st };
  };

  /* P162 · 功能曲线与生理意义 */
  O[162] = function (pageEl, data, api) {
    var st = [titleBar(api, '（4）功能曲线　（5）生理意义', '"缓冲神经"的定量画像')];
    var box = picBox(api, picOf(data, 3), 90, 150, 640, 400, '正常人和高血压患者的压力感受性反射功能曲线');
    var items = [
      ['负反馈调节', '窦内压 ≈ 平均动脉压时最敏感——平时就在工作点上', C.vag, 150],
      ['快速', '在<b>短时间</b>内调节动脉血压（秒级）', C.hum, 285],
      ['缓冲神经', '维持动脉血压<b>相对稳定</b>，缓冲急骤波动', C.sym, 420]
    ];
    var steps = [[box]];
    items.forEach(function (it) {
      var card = el(api, 'x-card');
      abs(card, 790, it[3], 430, 120);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px;line-height:1.8">' + it[1] + '</p>';
      steps.push([card]);
    });
    var note = el(api, 'x-card');
    abs(note, 90, 575, 1130, 70);
    note.innerHTML = '<p style="font-size:13px">高血压患者曲线<b>右移</b>＝<b>重调定 resetting</b>：感受器适应了高压，在高水平上继续缓冲——这也解释了为什么急性降压要谨慎。</p>';
    steps.push([note]);
    return { steps: steps, static: st };
  };

  /* P163 · 化学感受性反射 */
  O[163] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 颈动脉体和主动脉体化学感受性反射', '平时管呼吸，危急时保血压')];
    var box = picBox(api, picOf(data, 1), 90, 150, 560, 400, '颈动脉体和主动脉体化学感受性反射');
    var c1 = el(api, 'x-card');
    abs(c1, 700, 160, 520, 130);
    c1.style.setProperty('--card-c', C.vol);
    c1.innerHTML = '<h4>适宜刺激</h4><p style="line-height:2">血液 <b>PO₂ ↓、PCO₂ ↑、H⁺ ↑</b>——低氧、窒息、失血、酸中毒时集体报警。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 700, 310, 520, 150);
    c2.style.setProperty('--card-c', C.hum);
    c2.innerHTML = '<h4>效应</h4><p style="font-size:13px;line-height:1.9">主要是<b>呼吸加深加快</b>（平时几乎不影响血压）；<br>低氧/失血/酸中毒等危急时：心率↑、心输出量↑、外周阻力↑ → <b>血压↑</b>，内脏骨骼肌血管收缩、<b>血流重新分配，优先保心脑</b>。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 700, 480, 520, 110);
    c3.style.setProperty('--card-c', C.vag);
    c3.innerHTML = '<h4>与压力感受器分工</h4><p style="font-size:12.5px;line-height:1.8">压力感受器 = 日常稳压；化学感受器 = <b>应急兜底</b>（缺血缺氧时才对循环发话）。</p>';
    return { steps: [[box], [c1], [c2], [c3]], static: st };
  };

  /* P164 · 肾素-血管紧张素系统构成 */
  O[164] = function (pageEl, data, api) {
    var st = [titleBar(api, '二、体液调节 ·（一）肾素-血管紧张素系统', 'RAAS —— 血压与容量的长期抓手')];
    var svg = '<svg viewBox="0 0 720 180" preserveAspectRatio="none">';
    svg += '<defs><marker id="aR4" markerWidth="9" markerHeight="9" refX="4" refY="4" orient="auto"><path d="M0,0 L9,4 L0,8 Z" fill="#9b72cf"/></marker></defs>';
    function nd(x, txt, sub, color, w) {
      return '<rect x="' + (x - w / 2) + '" y="52" width="' + w + '" height="66" rx="12" fill="rgba(255,253,249,.95)" stroke="' + color + '" stroke-width="1.8"/>' +
        '<text x="' + x + '" y="80" text-anchor="middle" font-size="13.5" font-weight="700" fill="' + color + '">' + txt + '</text>' +
        '<text x="' + x + '" y="100" text-anchor="middle" font-size="10.5" fill="#6b6560">' + sub + '</text>';
    }
    svg += nd(80, '血管紧张素原', '肝合成 · 14肽', '#8a8a85', 130);
    svg += nd(245, '血管紧张素Ⅰ', '10肽 · 活性弱', C.vol, 130);
    svg += nd(415, '血管紧张素Ⅱ', '8肽 · 主角', C.raas, 130);
    svg += nd(590, '血管紧张素Ⅲ', '7肽 · 促醛固酮', C.hum, 140);
    svg += '<line x1="148" y1="85" x2="176" y2="85" stroke="' + C.raas + '" stroke-width="2.4" marker-end="url(#aR4)"/>' +
      '<text x="162" y="70" text-anchor="middle" font-size="11" font-weight="700" fill="#d9534f">肾素</text>';
    svg += '<line x1="313" y1="85" x2="346" y2="85" stroke="' + C.raas + '" stroke-width="2.4" marker-end="url(#aR4)"/>' +
      '<text x="330" y="70" text-anchor="middle" font-size="11" font-weight="700" fill="#d9534f">ACE</text>';
    svg += '<line x1="483" y1="85" x2="516" y2="85" stroke="' + C.raas + '" stroke-width="2.4" marker-end="url(#aR4)"/>' +
      '<text x="500" y="70" text-anchor="middle" font-size="11" font-weight="700" fill="#d9534f">氨基肽酶</text>';
    svg += '<text x="360" y="160" text-anchor="middle" font-size="11.5" fill="#6b6560">肾素（球旁细胞释放）是整个级联的<b>限速酶</b>；ACE 主要在肺血管内皮；另有 ACE2 → Ang(1-7) 对抗支路</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 50, 150, 780, 240);
    dia.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 50, 415, 780, 110);
    c1.style.setProperty('--card-c', C.raas);
    c1.innerHTML = '<h4>肾素何时释放？</h4><p style="font-size:13px;line-height:1.9">① 肾血流量减少（失血、低血压）② 流经致密斑的 Na⁺ 减少 ③ 交感兴奋（β 受体）——<b>三个信号全是"血量/血压告急"</b>。</p>';
    var box = picBox(api, picOf(data, 2), 870, 150, 360, 400, 'RAAS 成员及转换过程（教材原图）');
    return { steps: [[dia], [c1], [box]], static: st };
  };

  /* P165 · Ang Ⅱ 的生理作用 */
  O[165] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 血管紧张素Ⅱ的生理作用', '升压 + 扩容，双管齐下')];
    var items = [
      ['① 收缩血管', '收缩全身<b>微动脉</b> → 外周阻力↑；收缩静脉 → 回心血量↑（升压最强效的内源性物质之一）', C.sym],
      ['② 促醛固酮释放', '作用于肾上腺皮质球状带 → <b>保钠保水排钾</b> → 细胞外液量↑（RAAS 名字的"A"）', C.hum],
      ['③ 中枢作用', '增强交感缩血管紧张；促进<b>血管升压素</b>释放；引起<b>渴觉</b> → 饮水↑', C.raas],
      ['④ 促交感末梢释放 NE', '放大神经调节——体液与神经在这里合流', C.vol]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 70 + (i % 2) * 420, 160 + Math.floor(i / 2) * 200, 400, 180);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px;line-height:1.9">' + it[1] + '</p>';
      steps.push([card]);
    });
    var box = picBox(api, picOf(data, 2), 930, 160, 300, 380, '血管紧张素Ⅱ的生理作用');
    steps.push([box]);
    return { steps: steps, static: st };
  };

  /* P166 · 肾上腺素 vs 去甲肾上腺素（对照） */
  O[166] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）肾上腺素和去甲肾上腺素', '同是儿茶酚胺，分工大不同')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 150, 760, 330);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.sym + '"><h4>肾上腺素 E —— "强心药"</h4>' +
      '<p style="font-size:12.5px;line-height:1.9">受体：<b>α ＋ β₁ ＋ β₂</b> 都能结合<br>· β₁ → 心脏正性效应（CO↑）<br>· α → 皮肤、肾、胃肠血管收缩<br>· β₂ → 骨骼肌、肝血管<b>舒张</b><br>→ 总外周阻力变化不大，<b>收缩压升高为主</b></p></div>' +
      '<div class="col" style="--col-c:' + C.vol + '"><h4>去甲肾上腺素 NE —— "升压药"</h4>' +
      '<p style="font-size:12.5px;line-height:1.9">受体：主要 <b>α ＋ β₁</b>（β₂ 很弱）<br>· α → <b>外周血管广泛收缩</b> → 阻力↑↑<br>· 血压明显升高（舒张压也升）<br>· 心脏 β₁ 正性效应被掩盖：BP↑ → 压力感受性反射 → <b>反射性心率减慢</b></p></div>';
    var key = el(api, 'x-card');
    abs(key, 60, 510, 760, 90);
    key.style.setProperty('--card-c', C.raas);
    key.innerHTML = '<p style="font-size:13.5px;line-height:1.8"><b>受体分布解释一切：</b>骨骼肌血管有 β₂ → E 让它舒张、NE 不能；所以临床 E 用于<b>强心</b>（抢救心跳骤停），NE 用于<b>升压</b>（纠正休克低血压）。</p>';
    var box = picBox(api, picOf(data, 2), 860, 150, 370, 450, '家兔静脉注射 E / NE 后的动脉血压变化');
    return { steps: [[duo], [box], [key]], static: st };
  };

  /* P167 · 血管升压素 */
  O[167] = function (pageEl, data, api) {
    var st = [titleBar(api, '（三）血管升压素 VP', '又叫抗利尿激素 ADH —— 一个激素两副面孔')];
    var chain = el(api, '');
    abs(chain, 90, 165, 1100, 100);
    chain.innerHTML = '<div style="display:flex;align-items:center;gap:12px;height:100%">' +
      ['合成：下丘脑<br><b>视上核、室旁核</b>', '运输+储存+释放：<br><b>神经垂体</b>', '作用于肾与血管<br>调水、调压'].map(function (n, i) {
        return '<div style="flex:1;text-align:center;background:rgba(255,253,249,.92);border:1.5px solid ' + C.vol + ';border-radius:12px;padding:16px 8px;font-size:13.5px;line-height:1.6">' + n + '</div>';
      }).join('<div style="font-size:18px;color:var(--ink-soft)">→</div>') + '</div>';
    var duo = el(api, 'x-duo');
    abs(duo, 90, 300, 1100, 220);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.vol + '"><h4>生理浓度 · V₂ 受体</h4><p>作用于肾集合管上皮 → <b>促进水的重吸收</b> → 尿量↓（抗利尿）。<br>维持<b>细胞外液量恒定</b>与动脉血压稳定。</p></div>' +
      '<div class="col" style="--col-c:' + C.sym + '"><h4>浓度明显升高 · V₁ 受体</h4><p>作用于血管平滑肌 → <b>血管收缩，血压升高</b>。<br>失血、休克时大量释放，参与应急升压。</p></div>';
    var note = el(api, 'x-card');
    abs(note, 90, 550, 1100, 70);
    note.innerHTML = '<p style="font-size:13px">释放调节：血浆晶体渗透压↑ 或 <b>血容量↓</b>（容量感受器）→ VP 释放↑——又一次指向"容量"这个长期变量。</p>';
    return { steps: [[chain], [duo], [note]], static: st };
  };

  /* P168 · 血管内皮生成的血管活性物质 */
  O[168] = function (pageEl, data, api) {
    var st = [titleBar(api, '（四）血管内皮生成的血管活性物质', '回到 P90 的 NO —— 内皮是内分泌器官')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 155, 1140, 330);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.vag + '"><h4>舒血管物质</h4>' +
      '<p style="font-size:12.5px;line-height:1.95"><b>① 一氧化氮 NO</b>：NOS（eNOS/nNOS/iNOS）催化生成 → 激活平滑肌 sGC → <b>cGMP↑ → 胞质 Ca²⁺↓</b> → 舒张；还抑制血小板黏附、抑制平滑肌增殖。<br><b>② 前列环素 PGI₂</b>：舒张血管 + 抑制血小板聚集。<br><b>③ 内皮超极化因子 EDHF</b>：开放钙依赖钾通道 → 平滑肌超极化 → 舒张。</p></div>' +
      '<div class="col" style="--col-c:' + C.sym + '"><h4>缩血管物质</h4>' +
      '<p style="font-size:12.5px;line-height:1.95"><b>内皮素 ET</b>：与血管平滑肌 <b>ET 受体</b>结合 → 强烈而持久的血管收缩。<br>半衰期长、作用持久——可能参与血压的<b>长期</b>调节。</p></div>';
    var note = el(api, 'x-card');
    abs(note, 70, 520, 1140, 80);
    note.style.setProperty('--card-c', C.hum);
    note.innerHTML = '<p style="font-size:13px">舒/缩两手都在内皮：所以<b>内皮功能障碍</b>（高血压、糖尿病、动脉粥样硬化）是血管疾病的共同上游——回顾 P90 的诺贝尔奖故事。</p>';
    return { steps: [[duo], [note]], static: st };
  };

  /* P169 · 心房利尿钠肽 ANP */
  O[169] = function (pageEl, data, api) {
    var st = [titleBar(api, '（五）心血管活性多肽 · 心房利尿钠肽 ANP', 'RAAS 的"反对派"')];
    var banner = el(api, 'x-card');
    abs(banner, 90, 150, 1100, 80);
    banner.style.setProperty('--card-c', C.vag);
    banner.innerHTML = '<p style="font-size:14px;line-height:1.8">心房受<b>血容量扩张的牵张</b> → 心房肌释放 ANP → 总路线：<b>利钠、利尿、舒血管、降压</b>。</p>';
    var items = [
      ['利钠和利尿', '增加肾小球滤过率；抑制近端小管和集合管对钠的重吸收；<b>抑制肾素、醛固酮和血管升压素</b>的生成释放', C.vol],
      ['心血管作用', '舒张血管、降低血压；搏出量↓、心率↓；对抗 RAS、ET 和去甲肾上腺素等缩血管物质', C.vag],
      ['调节细胞增殖', '抑制血管内皮细胞、平滑肌细胞和心肌成纤维细胞的增殖（抗重构）', C.raas]
    ];
    var steps = [[banner]];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90 + i * 380, 270, 360, 240);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + it[0] + '</h4><p style="font-size:13px;line-height:2">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P170 · 自身调节 */
  O[170] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、自身调节', '不要神经不要激素，血管自己管自己')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 165, 1140, 300);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.hum + '"><h4>（一）代谢性自身调节 · 局部代谢产物学说</h4>' +
      '<p style="font-size:13px;line-height:2">血流量取决于器官的<b>代谢水平</b>：代谢↑ → CO₂、乳酸、H⁺ 等产物↑、O₂↓ → <b>后微动脉和毛细血管前括约肌舒张</b> → 局部血流量↑。<br><span style="color:var(--ink-soft);font-size:12px">呼应 P138 血管舒缩活动——同一条负反馈。</span></p></div>' +
      '<div class="col" style="--col-c:' + C.vol + '"><h4>（二）肌源性自身调节 · 肌源学说</h4>' +
      '<p style="font-size:13px;line-height:2">血管平滑肌<b>受牵张时收缩活动增强</b>：灌注压突然升高 → 毛细血管前阻力血管肌源性收缩 → 阻力↑ → <b>血流量保持相对稳定</b>（肾、脑尤为明显）。</p></div>';
    var note = el(api, 'x-card');
    abs(note, 70, 500, 1140, 90);
    note.style.setProperty('--card-c', C.vag);
    note.innerHTML = '<p style="font-size:13.5px;line-height:1.9">意义：神经体液调节"缺席"或变化平缓时，器官靠自身调节稳住自己的血流——<b>血压 70～180 mmHg 波动时，脑和肾的血流量几乎不变</b>。</p>';
    return { steps: [[duo], [note]], static: st };
  };

  /* P171 · 动脉血压的长期调节 */
  O[171] = function (pageEl, data, api) {
    var st = [titleBar(api, '四、动脉血压的长期调节', '短期看神经，长期看肾')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 155, 620, 200);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.hum + '"><h4>短期调节 · 秒～分</h4><p><b>神经反射</b>为主：压力感受性反射、化学感受性反射——快但会"适应"（重调定）。</p></div>' +
      '<div class="col" style="--col-c:' + C.vol + '"><h4>长期调节 · 小时～月</h4><p><b>肾-体液控制</b>：肾通过调节细胞外液量（排钠排水）控制血压；RAAS 与血管升压素是执行臂。</p></div>';
    var key = el(api, 'x-card');
    abs(key, 60, 385, 620, 150);
    key.style.setProperty('--card-c', C.raas);
    key.innerHTML = '<h4>核心机制：压力性利尿</h4><p style="font-size:13.5px;line-height:2">血压↑ → 肾排水排钠↑ → 细胞外液量↓ → 血压回落；血压↓ 则相反。<br><b>任何慢性高血压的持续存在，都必须有肾排钠排水能力的"配合"</b>——所以利尿剂是降压基石药。</p>';
    var box = picBox(api, picOf(data, 1), 720, 150, 510, 470, '动脉血压长期调节的主要机制');
    return { steps: [[duo], [key], [box]], static: st };
  };
})();
