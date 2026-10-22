/* ============================================================
   第五节 · 器官循环（P172–180）＋ 总结与复习（P181–192）— 精修覆盖器
   核心叙事：每个器官的血流都服从"代谢需求"，但各有一张面孔——
            冠脉被心肌挤压（舒张期灌注）、肺泡低氧反而收缩（V/Q 匹配）、
            脑靠自身调节稳住（60–140 平台）
   英雄页：P175 冠脉血流双曲线、P178 低氧性肺血管收缩对比、P180 脑血流平台
   复习节：P181–187 要点 22 条可勾选清单、P188–190 三层目标、P191 折叠答案
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
  var C = { cor: '#b03a5b', lung: '#4d96ff', brain: '#7A5A8C', key: '#8C6D3F', green: '#4E7A5A', red: '#d9534f', orange: '#f0a04b' };

  /* ============================================================
     第五节 · 器官循环
     ============================================================ */

  /* P172 · 学习目标 */
  O[172] = function (pageEl, data, api) {
    var st = [titleBar(api, '学习目标', '学完本节后，能够——')];
    var lines = [
      '概述冠脉循环的解剖与生理特点，解释心肌收缩对冠脉血流的影响',
      '分析心肌代谢变化如何调节冠脉血流，说明供氧与耗氧相匹配的意义',
      '描述肺循环低压、低阻力的特点，解释低氧性肺血管收缩对通气与血流匹配的作用',
      '描述脑循环及血脑屏障的特点，解释脑血流自身调节与二氧化碳分压的影响',
      '比较冠脉、肺和脑循环的主要调节机制，预测局部缺氧时的血管反应'
    ];
    var kw = ['概述·解释', '分析·说明', '描述·解释', '描述·解释', '比较·预测'];
    var cs = [C.cor, C.cor, C.lung, C.brain, C.green];
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

  /* P173 · 节封面 */
  O[173] = function (pageEl, data, api) {
    var cover = el(api, 'x-cover');
    var topics = (api.sec.topics || []).map(function (t) { return '<span style="border-color:rgba(122,90,140,.4);color:#7A5A8C">' + api.esc(t.t) + '</span>'; }).join('');
    cover.innerHTML =
      '<div class="no" style="background:linear-gradient(120deg,#7A5A8C,#B393D3);-webkit-background-clip:text;background-clip:text">05</div>' +
      '<h1>器官循环</h1>' +
      '<div class="en">Organ Circulation · 同一套 Q=ΔP/R，三张不同的面孔</div>' +
      '<svg class="ecg" viewBox="0 0 520 70" preserveAspectRatio="none"><path style="stroke:#7A5A8C" d="M0,45 L50,45 C65,45 70,20 85,20 C100,20 105,45 120,45 L180,45 C195,45 200,52 215,52 C230,52 235,45 250,45 L310,45 C325,45 330,25 345,25 C360,25 365,45 380,45 L440,45 C455,45 460,38 475,38 C490,38 495,45 520,45"/></svg>' +
      '<div class="toc">' + topics + '</div>';
    return { steps: [], static: [cover] };
  };

  /* P174 · 冠脉循环解剖特点 */
  O[174] = function (pageEl, data, api) {
    var st = [titleBar(api, '一、冠脉循环 ·（一）解剖特点', '解剖决定命运：三条结构伏笔')];
    var items = [
      ['小分支垂直穿入心肌', '主干和大分支行走于心脏表面，小分支常以<b>垂直于心脏表面</b>的方向穿入心肌 → <b>心肌收缩时易受压迫</b>——下一页的血流曲线马上兑现这条伏笔', C.cor],
      ['毛细血管密度极高', '毛细血管数和心肌纤维数之比可达 <b>1∶1</b>——交换面积大，是"摄氧率高"的结构基础', C.orange],
      ['侧支吻合细小', '侧支互相吻合但均较细小、血流量很少 → 血管<b>突然堵塞来不及代偿</b>（心绞痛/心梗的解剖基础）；慢性狭窄时侧支可逐渐建立', C.brain]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90, 165 + i * 155, 1100, 140);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + it[0] + '</h4><p style="font-size:13.5px;line-height:1.95">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P175 · 冠脉循环生理特点（英雄页：主动脉压 × 左冠脉血流双曲线） */
  O[175] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）冠脉循环的生理特点', '心肌一收缩，冠脉就"断流"')];
    var svg = '<svg viewBox="0 0 640 320" preserveAspectRatio="none">';
    /* 时相带：收缩期红 / 舒张期蓝 */
    [[60, 160, '收缩期', C.red], [160, 340, '舒张期', C.lung], [340, 440, '收缩期', C.red], [440, 620, '舒张期', C.lung]].forEach(function (b) {
      svg += '<rect x="' + b[0] + '" y="20" width="' + (b[1] - b[0]) + '" height="280" fill="' + b[3] + '" opacity="0.08"/>' +
        '<text x="' + ((b[0] + b[1]) / 2) + '" y="312" text-anchor="middle" font-size="11.5" fill="' + b[3] + '" font-weight="700">' + b[2] + '</text>';
    });
    /* 主动脉压曲线（上） */
    svg += '<path d="M60,125 C70,122 82,62 105,55 C128,48 142,92 152,108 L158,116 C180,124 250,128 340,125 C350,122 362,62 385,55 C408,48 422,92 432,108 L438,116 C460,124 540,128 620,126" fill="none" stroke="' + C.red + '" stroke-width="2.6"/>';
    svg += '<text x="66" y="42" font-size="12.5" font-weight="700" fill="' + C.red + '">主动脉压</text>';
    /* 左冠脉血流曲线（下）：收缩期骤降、舒张期冲高 */
    svg += '<path d="M60,225 C72,222 80,268 96,272 C112,276 128,238 145,232 C165,224 180,188 210,182 C250,175 300,196 330,210 C350,214 360,262 380,268 C400,274 418,240 432,234 C452,226 470,192 500,186 C540,178 590,200 620,214" fill="none" stroke="' + C.brain + '" stroke-width="2.6"/>';
    svg += '<text x="66" y="172" font-size="12.5" font-weight="700" fill="' + C.brain + '">左冠状动脉血流量</text>';
    svg += '<circle cx="96" cy="272" r="4.5" fill="' + C.red + '"/>' +
      '<text x="150" y="292" text-anchor="middle" font-size="11" fill="' + C.red + '">心肌挤压 → 收缩期血流骤降</text>';
    svg += '<circle cx="210" cy="182" r="4.5" fill="' + C.lung + '"/>' +
      '<text x="255" y="168" text-anchor="middle" font-size="11" font-weight="700" fill="' + C.lung + '">舒张期 = 黄金灌注窗</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 50, 145, 780, 380);
    dia.innerHTML = svg;
    var items = [
      ['灌注压高、血流量大', '冠脉直接发自主动脉根部，舒张压就是灌注压', C.red, 150],
      ['摄氧率高、耗氧量大', '心肌动-静脉氧差大——储备不多，<b>增加供氧主要靠增加血流量</b>', C.orange, 280],
      ['周期性变化显著', '受心肌收缩挤压：<b>收缩期血流↓、舒张期血流↑</b>（左冠脉尤其明显）', C.brain, 410]
    ];
    var steps = [[dia]];
    items.forEach(function (it) {
      var card = el(api, 'x-card');
      abs(card, 870, it[3], 350, 115);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4 style="font-size:14px">' + it[0] + '</h4><p style="font-size:12.5px;line-height:1.8">' + it[1] + '</p>';
      steps.push([card]);
    });
    var note = el(api, 'x-card');
    abs(note, 50, 545, 780, 80);
    note.style.setProperty('--card-c', C.cor);
    note.innerHTML = '<p style="font-size:13px;line-height:1.8"><b>临床一句：</b>心动过速 → 舒张期缩短 → 冠脉灌注↓——所以快速心律失常对缺血的心脏格外危险。</p>';
    steps.push([note]);
    return { steps: steps, static: st };
  };

  /* P176 · 冠脉血流量的调节 */
  O[176] = function (pageEl, data, api) {
    var st = [titleBar(api, '（三）冠脉血流量的调节', '代谢说了算')];
    var items = [
      ['1 · 心肌代谢水平（主要）', '心肌代谢↑（如收缩加强）→ <b>腺苷</b>等代谢产物↑ → 冠脉舒张 → 血流↑。<b>耗氧与供氧精确匹配</b>。', C.cor],
      ['2 · 神经调节', '神经因素的影响<b>在很短时间内就被代谢改变所引起的血流变化所掩盖</b>——神经只是背景音。', C.brain],
      ['3 · 体液调节', '可改变心肌代谢水平的体液因素，其作用<b>由心肌代谢水平而定</b>——殊途同归到代谢。', C.orange]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 70, 160 + i * 140, 600, 125);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px;line-height:1.9">' + it[1] + '</p>';
      steps.push([card]);
    });
    var box = picBox(api, picOf(data, 2), 710, 160, 510, 430, '心肌代谢水平对冠脉血流的影响');
    steps.push([box]);
    return { steps: steps, static: st };
  };

  /* P177 · 肺循环生理特点 */
  O[177] = function (pageEl, data, api) {
    var st = [titleBar(api, '二、肺循环 ·（一）生理特点', '低压、低阻、低滤过——右心的"轻载回路"')];
    var items = [
      ['血流阻力小、血压低', '肺动脉平均压约 <b>13 mmHg</b>，仅约主动脉的 1/6——右心室做功远小于左心室', C.lung],
      ['血容量大、变化也大', '肺血管床是机体的<b>储血库</b>：体位改变、呼吸周期中肺血容量明显波动', C.brain],
      ['毛细血管有效滤过压低', '组织液生成少 → <b>肺泡保持干燥</b>；一旦肺毛细血管压过高（左心衰）→ 肺水肿', C.green]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90, 170 + i * 150, 1100, 135);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + it[0] + '</h4><p style="font-size:13.5px;line-height:1.9">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P178 · 肺循环调节：低氧性肺血管收缩（对比英雄页） */
  O[178] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）肺循环血流量的调节', '同一种低氧，相反的反应')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 155, 1160, 230);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.green + '"><h4>体循环 · 局部低氧</h4><p style="font-size:15px;line-height:2">组织 O₂↓、代谢产物↑<br>→ 局部血管<b>舒张</b> → 血流量↑<br><span style="font-size:12.5px;color:var(--ink-soft)">逻辑：多送血 = 多送氧（P138/P170）</span></p></div>' +
      '<div class="col" style="--col-c:' + C.lung + '"><h4>肺循环 · 肺泡气 O₂ 分压↓</h4><p style="font-size:15px;line-height:2">肺泡周围的<b>微动脉收缩</b>（低氧性肺血管收缩 HPV）<br>→ 血流改道去通气好的肺泡<br><span style="font-size:12.5px;color:var(--ink-soft)">逻辑：血流匹配通气，维持肺换气效率（V/Q 匹配）</span></p></div>';
    var note = el(api, 'x-card');
    abs(note, 60, 410, 1160, 80);
    note.style.setProperty('--card-c', C.orange);
    note.innerHTML = '<p style="font-size:13.5px">看似相反，实则统一：<b>都是让"氧的供需"重新对齐</b>——体循环调血流，肺循环调血流的去向。</p>';
    var c1 = el(api, 'x-card');
    abs(c1, 60, 515, 570, 110);
    c1.innerHTML = '<h4>神经调节</h4><p style="font-size:12.5px;line-height:1.85">整体交感兴奋 → 体循环血管收缩 → 部分血液被<b>挤入肺循环</b> → 肺血流量被动↑；刺激迷走神经的直接效应是肺血管舒张。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 650, 515, 570, 110);
    c2.innerHTML = '<h4>体液调节</h4><p style="font-size:12.5px;line-height:1.85">儿茶酚胺、血管紧张素Ⅱ、组胺等均可影响肺血管张力——但肺循环调节的主角是<b>肺泡气 O₂ 分压</b>。</p>';
    return { steps: [[duo], [note], [c1, c2]], static: st };
  };

  /* P179 · 脑循环生理特点 */
  O[179] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、脑循环 ·（一）生理特点', '颅内没有"余地"')];
    var big = el(api, '');
    abs(big, 80, 175, 430, 240);
    big.innerHTML = '<div style="display:flex;gap:34px">' +
      '<div><div style="font-family:Georgia,serif;font-size:52px;font-weight:700;color:#7A5A8C;line-height:1">15%</div><p style="font-size:13px;margin-top:8px">脑血流约占心输出量<br>（≈750 mL/min）</p></div>' +
      '<div><div style="font-family:Georgia,serif;font-size:52px;font-weight:700;color:#4d96ff;line-height:1">20%</div><p style="font-size:13px;margin-top:8px">脑耗氧占全身<br>（重量仅约 2% 的器官）</p></div></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 560, 175, 650, 110);
    c1.style.setProperty('--card-c', C.brain);
    c1.innerHTML = '<h4>血流量变化小</h4><p style="font-size:13px;line-height:1.9">颅腔是<b>刚性</b>的：脑组织 + 脑脊液 + 血液的容积几乎固定 → 血流量的缓冲空间很小。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 560, 310, 650, 150);
    c2.style.setProperty('--card-c', C.green);
    c2.innerHTML = '<h4>血-脑脊液屏障与血-脑屏障</h4><p style="font-size:13px;line-height:1.9">毛细血管内皮<b>紧密连接</b> + 基膜 + 星形胶质细胞足板 → 选择性通透：O₂/CO₂/脂溶性物质易过，多数离子和大分子受限——<b>保护脑内环境稳定</b>（也决定药物入脑难易）。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 80, 460, 430, 120);
    c3.innerHTML = '<p style="font-size:13px;line-height:1.9">高血流量 + 高耗氧 + 容积刚性 → 脑对缺血缺氧<b>极度敏感</b>（几秒意识丧失，数分钟不可逆损伤）。</p>';
    return { steps: [[big], [c1], [c2], [c3]], static: st };
  };

  /* P180 · 脑血流量调节（自身调节平台 SVG） */
  O[180] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）脑血流量的调节', '60～140 mmHg：一条著名的平台')];
    var svg = '<svg viewBox="0 0 480 250" preserveAspectRatio="none">';
    svg += '<rect x="170" y="30" width="160" height="160" fill="#4E7A5A" opacity="0.10"/>';
    /* 轴：x = MAP 0→60px, 200→430px；平台 y=88（60→170px, 140→330px） */
    svg += '<path d="M70,192 C100,150 130,94 170,90 L330,90 C360,92 392,112 424,148" fill="none" stroke="' + C.brain + '" stroke-width="3"/>';
    svg += '<line x1="170" y1="90" x2="170" y2="196" stroke="#4E7A5A" stroke-width="1" stroke-dasharray="4 4"/>' +
      '<line x1="330" y1="90" x2="330" y2="196" stroke="#4E7A5A" stroke-width="1" stroke-dasharray="4 4"/>' +
      '<text x="170" y="214" text-anchor="middle" font-size="12" font-weight="700" fill="#4E7A5A">60</text>' +
      '<text x="330" y="214" text-anchor="middle" font-size="12" font-weight="700" fill="#4E7A5A">140</text>' +
      '<text x="250" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E7A5A">自身调节保持血流量稳定</text>';
    svg += '<line x1="50" y1="196" x2="450" y2="196" stroke="#666" stroke-width="1.2"/>' +
      '<text x="250" y="238" text-anchor="middle" font-size="12" fill="#6b6560">平均动脉压 / mmHg</text>';
    svg += '<line x1="50" y1="196" x2="50" y2="20" stroke="#666" stroke-width="1.2"/>' +
      '<text x="20" y="30" font-size="11" fill="#6b6560" transform="rotate(-90 20 30)"></text>' +
      '<text x="12" y="110" font-size="11" fill="#6b6560" transform="rotate(-90 12 110)" text-anchor="middle">脑血流量</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 60, 150, 560, 300);
    dia.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 660, 155, 560, 120);
    c1.style.setProperty('--card-c', C.green);
    c1.innerHTML = '<h4>1 · 自身调节（主力）</h4><p style="font-size:13px;line-height:1.9">平均动脉压在 <b>60～140 mmHg</b> 范围内变动时，脑血流量保持相对稳定——肌源性机制（呼应 P170）。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 295, 560, 130);
    c2.style.setProperty('--card-c', C.brain);
    c2.innerHTML = '<h4>2 · CO₂ 分压与低氧</h4><p style="font-size:13px;line-height:1.9"><b>PCO₂↑ 和低氧直接舒张脑血管</b>，作用明显强于化学感受性反射引起的缩血管。<br><span style="font-size:12px;color:var(--ink-soft)">临床：过度换气 → PCO₂↓ → 脑血流↓ → 头晕。</span></p>';
    var c3 = el(api, 'x-card');
    abs(c3, 660, 445, 560, 90);
    c3.innerHTML = '<h4>3 · 神经调节</h4><p style="font-size:13px">对脑血流量<b>无明显改变</b>——脑把主动权握在自己手里。</p>';
    var note = el(api, 'x-card');
    abs(note, 60, 480, 560, 80);
    note.innerHTML = '<p style="font-size:12.5px;line-height:1.8">超出 60～140 范围：血压过低 → 脑缺血；过高 → 脑血流被动增加、脑水肿风险（高血压脑病）。</p>';
    return { steps: [[dia], [c1], [c2], [c3], [note]], static: st };
  };

  /* ============================================================
     总结与复习（P181–192）
     ============================================================ */

  /* P181–187 · 本章要点 22 条（可勾选清单） */
  function keyPoints(api, data) {
    var items = plainText(data, 0).filter(function (s) { return /^\d+\./.test(s); });
    var steps = [];
    var y = 150;
    items.forEach(function (s) {
      var num = s.match(/^(\d+)\./)[1];
      var txt = s.replace(/^\d+\.\s*/, '');
      var h = Math.max(64, 30 + Math.ceil(txt.length / 52) * 21);
      var lab = api.ce('label', 'x-el x-key');
      abs(lab, 70, y, 1140, h);
      lab.innerHTML = '<input type="checkbox"><span class="kn">' + num + '</span><span class="kt">' + api.esc(txt) + '</span>';
      steps.push([lab]);
      y += h + 14;
    });
    return steps;
  }
  var KP_TITLE = { 181: '要点 1～2 · 泵血与心功能', 182: '要点 3～6 · 心输出量调节与心肌电生理', 183: '要点 7～10 · 电生理特性与血压形成', 184: '要点 11～14 · 血压、CVP、微循环与组织液', 185: '要点 15～16 · 水肿与神经调节', 186: '要点 17～19 · 体液调节与长期调节', 187: '要点 20～22 · 器官循环' };
  [181, 182, 183, 184, 185, 186, 187].forEach(function (pg) {
    O[pg] = function (pageEl, data, api) {
      var st = [titleBar(api, '本章要点 · ' + (KP_TITLE[pg] || ''), '点卡片打勾，过完 22 条再上考场')];
      return { steps: keyPoints(api, data), static: st };
    };
  });

  /* P188–190 · 三层学习目标 */
  function mastery(api, data, level, color, slogan) {
    var st = [titleBar(api, '学习目标 · ' + level, slogan)];
    var banner = el(api, '');
    abs(banner, 90, 150, 1100, 80);
    banner.innerHTML = '<div style="display:flex;align-items:center;gap:18px;height:100%;background:linear-gradient(90deg,' + color + '22,' + color + '08);border:1.5px solid ' + color + ';border-radius:14px;padding:0 26px"><span style="font-size:30px;font-weight:700;color:' + color + ';font-family:Georgia,serif">' + level + '</span><span style="font-size:13px;color:var(--ink-soft)">' + slogan + '</span></div>';
    var groups = plainText(data, 0);
    var steps = [[banner]];
    var y = 260;
    groups.forEach(function (g) {
      var items = g.split(/；|;/).map(function (s) { return s.trim(); }).filter(Boolean);
      var h = 34 + items.length * 27 + 12;
      var card = el(api, 'x-card');
      abs(card, 90, y, 1100, h);
      card.style.setProperty('--card-c', color);
      card.innerHTML = items.map(function (it) { return '<p style="font-size:13.5px;line-height:1.9">· ' + api.esc(it) + '</p>'; }).join('');
      steps.push([card]);
      y += h + 18;
    });
    return { steps: steps, static: st };
  }
  O[188] = function (p, d, api) { return mastery(api, d, '掌握', C.red, '不仅要懂，还要能完整分析、解释和运用'); };
  O[189] = function (p, d, api) { return mastery(api, d, '熟悉', C.orange, '能复述机制，能解释常见现象'); };
  O[190] = function (p, d, api) { return mastery(api, d, '了解', C.lung, '知道概念，能认出、能对应'); };

  /* P191 · 简答题（折叠答案卡） */
  O[191] = function (pageEl, data, api) {
    var st = [titleBar(api, '第四章 · 简答题', '先自己默答，再展开对答案')];
    var hint = el(api, 'x-card');
    abs(hint, 90, 145, 1100, 64);
    hint.innerHTML = '<p style="font-size:13px">三题都是本章骨架：<b>血压形成 → 微循环 → 房室延搁</b>。建议合上书先口述一遍。</p>';
    var qas = [
      ['1 · 试述动脉血压形成的条件。',
       '① <b>心血管系统有足够的血液充盈</b>——前提（体循环平均充盈压 ≈7 mmHg，反映血量与血管容量的匹配）；<br>② <b>心脏射血</b>——必要条件（动力来源，动能+压强能）；<br>③ <b>外周阻力</b>——主要来自小动脉和微动脉，把动能"憋"成对管壁的压强；<br>④ <b>主动脉和大动脉的弹性贮器作用</b>——缓冲收缩压、维持舒张压、把间断射血变为连续血流。<br><span style="color:var(--ink-soft)">→ 回到 P104 的四要素全景图。</span>'],
      ['2 · 试述微循环的概念、血流通路及功能。',
       '<b>概念</b>：微动脉与微静脉之间的血液循环，是血液与组织液进行物质和气体交换的直接场所。<br><b>三条通路</b>：① <b>迂回通路</b>（微动脉→后微动脉→毛细血管前括约肌→真毛细血管→微静脉）：壁薄、血流慢、通透性大——<b>物质交换（营养通路）</b>；② <b>直捷通路</b>（经通血毛细血管）：骨骼肌多见，使血液<b>迅速回流</b>；③ <b>动-静脉短路</b>（经动-静脉吻合支）：非营养通路，参与<b>体温调节</b>。<br><span style="color:var(--ink-soft)">→ 对照 P132 手绘模式图复述一遍。</span>'],
      ['3 · 何为房-室延搁？其生理意义是什么？',
       '<b>概念</b>：兴奋在<b>房室交界</b>传导速度最慢（结区仅约 0.02 m/s），使兴奋从心房传到心室出现约 <b>0.1 s 的延迟</b>，称房-室延搁。<br><b>意义</b>：保证心房收缩结束后心室才开始收缩——心房先"助力充盈"，心室再射血，<b>两者不会重叠收缩</b>，有利于心室的充盈与射血。<br><span style="color:var(--ink-soft)">→ 回顾 P27 传导时间轴：窦房结 0.05m/s？不——最慢的是房室交界。</span>']
    ];
    var steps = [[hint]];
    qas.forEach(function (qa, i) {
      var d = api.ce('details', 'x-el x-qa');
      abs(d, 90, 235 + i * 135, 1100);
      d.innerHTML = '<summary>' + qa[0] + '</summary><div class="ans">' + qa[1] + '</div>';
      steps.push([d]);
    });
    return { steps: steps, static: st };
  };

  /* P192 · 章末页 */
  O[192] = function (pageEl, data, api) {
    var st = [];
    var cover = el(api, 'x-cover');
    cover.innerHTML =
      '<div class="no" style="background:linear-gradient(120deg,#8C6D3F,#C9A96A);-webkit-background-clip:text;background-clip:text">END</div>' +
      '<h1>第四章 · 血液循环 完</h1>' +
      '<div class="en">从一次心跳到整张循环网 —— Q = ΔP / R 贯穿始终</div>' +
      '<div class="toc"><span style="border-color:rgba(140,109,63,.4);color:#8C6D3F">按 O 回总览，可跳回任意一节</span></div>';
    var box = picBox(api, picOf(data, 0), 840, 180, 360, 380, null);
    return { steps: [[box]], static: [cover] };
  };
})();
