/* ============================================================
   第三节 · 血管生理（上半 P73–110）— 精修覆盖器
   核心叙事：Q = ΔP / R，R = 8ηL/πr⁴ —— 半径的四次方是全场主角
   英雄页：P77 血管树总览、P84-88 八类血管卡、P98 泊肃叶四次方、
          P104-107 血压形成三因素、P109 平均动脉压
   节色：静脉蓝 #3A5A78；阻力红 / 弹性橙 / 容量蓝 / 交换绿
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
  var C = { resist: '#d9534f', elast: '#f0a04b', capac: '#4d96ff', exch: '#6bcb77', vein: '#3a5a78', purple: '#9b72cf' };

  /* ============================================================ */

  /* P73 · 节封面 */
  O[73] = function (pageEl, data, api) {
    var cover = el(api, 'x-cover');
    var topics = (api.sec.topics || []).map(function (t) { return '<span style="border-color:rgba(58,90,120,.4);color:#3A5A78">' + api.esc(t.t) + '</span>'; }).join('');
    cover.innerHTML =
      '<div class="no" style="background:linear-gradient(120deg,#3A5A78,#7FA8C9);-webkit-background-clip:text;background-clip:text">03</div>' +
      '<h1>血管生理</h1>' +
      '<div class="en">Vascular Physiology · Q = ΔP / R</div>' +
      '<svg class="ecg" viewBox="0 0 520 70" preserveAspectRatio="none"><path style="stroke:#3A5A78" d="M0,40 L60,40 C90,10 120,10 150,40 C180,64 210,64 240,40 C270,16 300,16 330,40 C360,64 390,64 420,40 C450,16 480,16 520,40"/></svg>' +
      '<div class="toc">' + topics + '</div>';
    return { steps: [], static: [cover] };
  };

  /* P74 · 学习目标 */
  O[74] = function (pageEl, data, api) {
    var lines = plainText(data, 1).filter(function (s) { return /^\d\./.test(s); });
    var st = [titleBar(api, '学习目标', '学完本节后，能够——')];
    var kw = ['识别运用', '说明分析', '解释', '描述说明', '写出分析'];
    var cs = [C.elast, C.resist, C.capac, C.exch, C.purple];
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

  /* P75 · 血液分布 */
  O[75] = function (pageEl, data, api) {
    var st = [titleBar(api, '心血管系统的血液分布', '安静状态下，血在哪里？')];
    var box = picBox(api, picOf(data, 1), 340, 130, 600, 470, null);
    var c1 = el(api, 'x-card');
    abs(c1, 60, 200, 260, 200);
    c1.style.setProperty('--card-c', C.capac);
    c1.innerHTML = '<h4>静脉系统</h4><p style="font-size:26px;font-weight:700;color:#4d96ff">64%</p><p style="font-size:13px">容量血管 = 血液储存库</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 960, 200, 260, 200);
    c2.innerHTML = '<h4>读图任务</h4><p style="font-size:13px">找到动脉、毛细血管、静脉各自占比——为什么静脉被称为"容量血管"？</p>';
    return { steps: [[box], [c1, c2]], static: st };
  };

  /* P77 · 血管树总览（核心大图） */
  O[77] = function (pageEl, data, api) {
    var st = [titleBar(api, '血管树：压力 · 流速 · 总横截面积', '一图看懂体循环的"地形"')];
    var box = picBox(api, picOf(data, 0), 90, 130, 1100, 480, null);
    var c1 = el(api, 'x-card');
    abs(c1, 90, 622, 350, 80);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<p style="font-size:13px"><b>压力</b>：微动脉段降幅最陡 → 阻力所在</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 465, 622, 350, 80);
    c2.style.setProperty('--card-c', C.exch);
    c2.innerHTML = '<p style="font-size:13px"><b>流速</b>：毛细血管最慢 → 交换所需</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 840, 622, 350, 80);
    c3.style.setProperty('--card-c', C.capac);
    c3.innerHTML = '<p style="font-size:13px"><b>横截面积</b>：毛细血管最大 → 并联数量多</p>';
    return { steps: [[box], [c1, c2, c3]], static: st };
  };

  /* P78 · 大动脉：弹性贮器（Windkessel） */
  O[78] = function (pageEl, data, api) {
    var st = [titleBar(api, '1 · 动脉：弹性贮器', 'Windkessel —— 把间断射血变成连续血流')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 150, 640, 260);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.elast + '"><h4>心室收缩时</h4><p>主动脉压升高，大动脉被<b>扩张</b>，储存部分血液与<b>弹性能</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.capac + '"><h4>心室舒张时</h4><p>大动脉<b>弹性回缩</b>，维持舒张期血压，推动血液继续前进。</p></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 60, 430, 640, 120);
    c1.innerHTML = '<p>结构基础：管壁含多层<b>弹性纤维</b>，口径大、压力高、阻力小、弹性强——压力储存器（pressure reservoir）。</p>';
    var box = picBox(api, picOf(data, 2), 730, 150, 500, 440, '大动脉弹性贮器作用（右上图：主动脉瓣关闭后的弹性回缩）');
    return { steps: [[duo], [c1], [box]], static: st };
  };

  /* P84-88 · 功能性分类 8 类血管 */
  function vesselCards(api, items, startY) {
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 70, (startY || 150) + i * 118, 780, 108);
      card.style.setProperty('--card-c', it[3]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px;line-height:1.75">' + it[1] + (it[2] ? '<br><b style="color:' + it[3] + '">→ ' + it[2] + '</b>' : '') + '</p>';
      steps.push([card]);
    });
    return steps;
  }
  O[84] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）血管的功能性分类 ①②', '按功能而不是口径给血管命名')];
    var steps = vesselCards(api, [
      ['1 · 弹性贮器血管', '主动脉、肺动脉主干及最大分支；管壁坚厚、富含弹性纤维', '维持连续血流 · 减小血压波动', C.elast],
      ['2 · 分配血管', '弹性贮器血管之后到小动脉之前的中动脉', '把血液运输到各器官组织', C.capac]
    ], 170);
    return { steps: steps, static: st };
  };
  O[85] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）血管的功能性分类 ③④', '阻力从这里来')];
    var steps = vesselCards(api, [
      ['3 · 毛细血管前阻力血管', '小动脉和微动脉：管径细、阻力大、平滑肌丰富', '改变阻力 → 调节器官血流量；口径受神经体液调节', C.resist],
      ['4 · 毛细血管前括约肌', '环绕真毛细血管起始部的平滑肌', '控制毛细血管开放的数量', C.resist]
    ], 170);
    return { steps: steps, static: st };
  };
  O[86] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）血管的功能性分类 ⑤⑥', '交换的发生地')];
    var steps = vesselCards(api, [
      ['5 · 交换血管', '真毛细血管：单层内皮 + 薄层基膜，通透性高', '血液与组织液物质交换的主要场所', C.exch],
      ['6 · 毛细血管后阻力血管', '微静脉，管径较小', '改变毛细血管前/后阻力比值 → 影响滤过与体液分配', C.exch]
    ], 170);
    var box = picBox(api, picOf(data, 0), 880, 170, 340, 330, '动脉、毛细血管、静脉组织学比较');
    steps[0].push(box);
    return { steps: steps, static: st };
  };
  O[87] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）血管的功能性分类 ⑦', '容量血管 = 静脉')];
    var big = el(api, '');
    abs(big, 80, 170, 480, 260);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:76px;font-weight:700;color:#4d96ff;line-height:1">60–70%</div><p style="font-size:15px;line-height:1.9;margin-top:12px">循环血量中储存在静脉系统的比例——<br>静脉是名副其实的<b>血液储存库</b>。</p>';
    var steps = [[big]];
    var items = [
      ['结构特点', '数量多、管壁薄、口径大、可扩张性大、有静脉瓣；依次分大/腔/小/微静脉'],
      ['功能特点', '口径稍变 → 容积大变 → 明显影响回心血量（联想：硝酸甘油扩静脉降前负荷）']
    ];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 620, 170 + i * 130, 590, 118);
      card.style.setProperty('--card-c', C.capac);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13.5px">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };
  O[88] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）血管的功能性分类 ⑧', '短路血管')];
    var card = el(api, 'x-card');
    abs(card, 90, 180, 720, 200);
    card.style.setProperty('--card-c', C.purple);
    card.innerHTML = '<h4>8 · 短路血管（动-静脉吻合支）</h4><p style="line-height:2">血管床中小动脉与小静脉之间的<b>直接吻合支</b>。<br>→ 血液由微动脉经动静脉吻合直接流入微静脉；<b>与体温调节有关</b>（皮肤多见）。</p>';
    var recap = el(api, 'x-card');
    abs(recap, 90, 420, 1100, 190);
    recap.innerHTML = '<h4>八类一口气背下来</h4><p style="font-size:14px;line-height:2">弹性贮器 → 分配 → <b style="color:#d9534f">前阻力</b> → 前括约肌 → <b style="color:#6bcb77">交换</b> → 后阻力 → <b style="color:#4d96ff">容量</b> → 短路<br><span style="color:var(--ink-soft);font-size:12.5px">动脉侧管压力与分配，毛细血管管交换，静脉管容量——功能分类就是血流动力学的分工表。</span></p>';
    return { steps: [[card], [recap]], static: st };
  };

  /* P90 · NO 发现史（诺贝尔级故事） */
  O[90] = function (pageEl, data, api) {
    var st = [titleBar(api, '血管内皮舒张因子 —— NO', '从硝酸甘油到诺贝尔奖')];
    var tl = el(api, 'x-ap');
    abs(tl, 70, 150, 1140, 190);
    var svg = '<svg viewBox="0 0 640 140" preserveAspectRatio="none">' +
      '<line x1="40" y1="70" x2="600" y2="70" stroke="#3A5A78" stroke-width="2.4"/>' +
      [['1977', '慕拉德：硝酸甘油通过释放 NO 舒张血管', 90], ['1980', '佛契哥特：乙酰胆碱 → 内皮释放 EDRF', 320], ['1987', '路伊格纳洛：EDRF 就是 NO', 550]].map(function (n) {
        return '<circle cx="' + n[2] + '" cy="70" r="9" fill="#f0a04b" stroke="#fff" stroke-width="3"/>' +
          '<text x="' + n[2] + '" y="40" text-anchor="middle" font-size="17" font-weight="700" fill="#3A5A78">' + n[0] + '</text>' +
          '<text x="' + n[2] + '" y="104" text-anchor="middle" font-size="11.5" fill="#6b6560">' + n[1] + '</text>';
      }).join('') + '</svg>';
    tl.innerHTML = svg;
    var box = picBox(api, picOf(data, 3), 250, 360, 700, 300, '“三明治”血管灌流模型：内皮完整与否决定乙酰胆碱能否舒血管');
    return { steps: [[tl], [box]], static: st };
  };

  /* P91 · H2S 通路 */
  O[91] = function (pageEl, data, api) {
    var st = [titleBar(api, '血管内皮舒张因子 —— 硫化氢 H₂S', '继 NO、CO 之后的第三种气体信号分子')];
    var chain = el(api, 'x-card');
    abs(chain, 90, 190, 1100, 130);
    chain.style.setProperty('--card-c', C.exch);
    chain.innerHTML = '<h4>生成</h4><p>L-半胱氨酸 ──（胱硫醚-β-合成酶 / 胱硫醚-γ-裂解酶 / 巯基丙酮酸硫转移酶）──→ <b>H₂S</b>　<span style="color:var(--ink-soft);font-size:12.5px">三种酶分布于脑、心、肺、肝、肾、胃肠等</span></p>';
    var act = el(api, 'x-card');
    abs(act, 90, 350, 1100, 130);
    act.style.setProperty('--card-c', C.capac);
    act.innerHTML = '<h4>作用</h4><p>H₂S → ① 激活 <b>K<sub>ATP</sub> 通道</b>（平滑肌超极化）　② 增强 <b>eNOS 磷酸化</b>（放大 NO 通路）→ <b style="color:#4d96ff">血管舒张</b></p>';
    return { steps: [[chain], [act]], static: st };
  };

  /* P94 · 血流量与泊肃叶：公式登场 */
  O[94] = function (pageEl, data, api) {
    var st = [titleBar(api, '二、血流量、血流阻力和血压', '（一）血流量 Q 与血流速度')];
    var f1 = el(api, '');
    abs(f1, 120, 170, 1040, 150);
    f1.innerHTML = '<div style="text-align:center;font-family:Georgia,serif;font-size:44px;color:#3A5A78;background:rgba(255,253,249,.9);border:1px solid var(--line);border-radius:16px;padding:26px 0">Q = <span style="border-top:3px solid #3A5A78;padding-top:6px">ΔP</span><span style="margin:0 18px">/</span><span style="border-top:3px solid #3A5A78;padding-top:6px;margin-left:-58px"></span>R</div>';
    var c1 = el(api, 'x-card');
    abs(c1, 120, 360, 500, 180);
    c1.innerHTML = '<h4>血流量 Q</h4><p>单位时间流经血管某一横截面的血量（mL/min 或 L/min），又称<b>容积速度</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 360, 500, 180);
    c2.style.setProperty('--card-c', C.resist);
    c2.innerHTML = '<h4>类比欧姆定律</h4><p>I = U / R —— 血流动力学就是循环系统的"电路学"：压差驱动，阻力限制。</p>';
    return { steps: [[f1], [c1, c2]], static: st };
  };

  /* P96 · 层流与湍流：雷诺数 */
  O[96] = function (pageEl, data, api) {
    var st = [titleBar(api, '层流与湍流', '雷诺数 Re = ρDV / η —— 2000 是分界')];
    var f = el(api, '');
    abs(f, 70, 160, 560, 120);
    f.innerHTML = '<div style="text-align:center;font-family:Georgia,serif;font-size:34px;color:#3A5A78;background:rgba(255,253,249,.9);border:1px solid var(--line);border-radius:14px;padding:20px 0">Re = ρ·D·V / η</div>';
    var duo = el(api, 'x-duo');
    abs(duo, 70, 310, 560, 220);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.exch + '"><h4>Re &lt; 2000 · 层流</h4><p>液体各层平行流动、互不混杂——泊肃叶定律<b>适用</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.resist + '"><h4>Re &gt; 2000 · 湍流</h4><p>出现漩涡与混杂——泊肃叶定律<b>不再适用</b>；狭窄处血流加速易产生（杂音来源）。</p></div>';
    var box = picBox(api, picOf(data, 2), 670, 160, 550, 370, 'A. 血管中的层流；B. 血管中的湍流');
    return { steps: [[f], [duo], [box]], static: st };
  };

  /* P98 · 血流阻力：r 的四次方（本节最高点之一） */
  O[98] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 血流阻力：泊肃叶定律', 'R = 8ηL / πr⁴ —— 半径的四次方')];
    var f = el(api, '');
    abs(f, 70, 150, 1140, 110);
    f.innerHTML = '<div style="display:flex;justify-content:center;gap:60px;font-family:Georgia,serif;font-size:40px;color:#3A5A78;background:rgba(255,253,249,.9);border:1px solid var(--line);border-radius:14px;padding:18px 0"><span>Q = ΔP / R</span><span>R = 8ηL / πr⁴</span></div>';
    var demo = el(api, 'x-ap');
    abs(demo, 120, 290, 720, 330);
    var svg = '<svg viewBox="0 0 640 260" preserveAspectRatio="none">' +
      '<text x="160" y="40" text-anchor="middle" font-size="15" font-weight="700" fill="#3A5A78">血管半径 r</text>' +
      '<text x="480" y="40" text-anchor="middle" font-size="15" font-weight="700" fill="#d9534f">半径 ×2 → 阻力 ÷16</text>' +
      '<line x1="70" y1="130" x2="250" y2="130" stroke="#3A5A78" stroke-width="26" stroke-linecap="round" opacity="0.85"/>' +
      '<text x="160" y="180" text-anchor="middle" font-size="13" fill="#6b6560">R = 1（基准）</text>' +
      '<line x1="390" y1="130" x2="570" y2="130" stroke="#d9534f" stroke-width="52" stroke-linecap="round" opacity="0.85"/>' +
      '<text x="480" y="196" text-anchor="middle" font-size="13" fill="#6b6560">r 加倍 → R = 1/16</text>' +
      '<text x="320" y="240" text-anchor="middle" font-size="13.5" fill="#9e3a50" font-weight="700">微小管径变化 → 巨大阻力变化：机体调节血流量的杠杆</text></svg>';
    demo.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 880, 290, 340, 150);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>阻力从哪来</h4><p style="font-size:13px">外摩擦（L、r）+ 内摩擦（η）；<b>总外周阻力主要来自微动脉</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 880, 460, 340, 160);
    c2.innerHTML = '<h4>器官血流量的调节</h4><p style="font-size:13px">小动脉/微动脉口径变化是调节器官血流量与血液重新分配的<b>最主要因素</b>。</p>';
    return { steps: [[f], [demo], [c1, c2]], static: st };
  };

  /* P99 · 血压沿血管树的降幅 */
  O[99] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 血压：沿血管树逐级降落', '降幅 ∝ 阻力——微动脉段最陡')];
    var g = data.shapes[3];
    var box = el(api, '');
    abs(box, 150, 150, 980, 430);
    if (g && g.children) {
      g.children.forEach(function (ch) {
        if (ch.kind === 'pic') {
          var im = api.ce('img');
          im.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g)$/i, '.webp');
          im.style.cssText = 'width:100%;height:88%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff';
          box.appendChild(im);
        }
      });
      box.insertAdjacentHTML('beforeend', '<p style="font-size:12px;color:var(--ink-soft);text-align:center">正常人平卧位时不同血管的血压</p>');
    }
    var hl = el(api, 'x-card');
    abs(hl, 150, 600, 980, 80);
    hl.style.setProperty('--card-c', C.resist);
    hl.innerHTML = '<p style="font-size:13.5px"><b>读图：</b>曲线最陡的一段 = 阻力最大的一段 = <b>微动脉</b>——把 P98 的四次方和这里的降幅联系起来。</p>';
    return { steps: [[box], [hl]], static: st };
  };

  /* P100 · 血液黏滞度四因素 */
  O[100] = function (pageEl, data, api) {
    var st = [titleBar(api, '血液黏滞度 η 的影响因素', 'R = 8ηL/πr⁴ 中的 η')];
    var items = [
      ['血细胞比容', '比容越大 → 黏滞度越高（<b>最重要</b>）', C.resist],
      ['血流切率', '切率高、层流明显 → 黏滞度低；切率低 → 黏滞度高', C.capac],
      ['血管口径', '口径变小 → 黏滞度降低（Fåhræus-Lindqvist 效应）', C.exch],
      ['温度', '温度降低 → 黏滞度升高（手指冻僵的血流变慢）', C.purple]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 110 + (i % 2) * 560, 170 + Math.floor(i / 2) * 200, 520, 170);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + (i + 1) + ' · ' + it[0] + '</h4><p style="font-size:13.5px">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P102 · 血压的定义与单位 */
  O[102] = function (pageEl, data, api) {
    var st = [titleBar(api, '三、动脉血压与动脉脉搏 ·（一）动脉血压', '先定义，再测量')];
    var c1 = el(api, 'x-card');
    abs(c1, 70, 160, 560, 150);
    c1.innerHTML = '<h4>血压 BP</h4><p>血管内流动的血液对<b>血管侧壁</b>的压强（单位面积压力）；动脉血压一般指<b>主动脉压</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 70, 330, 560, 150);
    c2.style.setProperty('--card-c', C.capac);
    c2.innerHTML = '<h4>单位换算</h4><p style="line-height:2">动脉血压：<b>mmHg</b>（1 mmHg = 0.133 kPa）<br>静脉血压：<b>cmH₂O</b>　1 mmHg ≈ 1.33 cmH₂O</p>';
    var box = picBox(api, picOf(data, 1), 670, 160, 550, 400, '主动脉瓣关闭后，大动脉弹性回缩维持舒张压');
    return { steps: [[c1], [c2], [box]], static: st };
  };

  /* P104 · 动脉血压的形成：四要素全景 */
  O[104] = function (pageEl, data, api) {
    var st = [titleBar(api, '1 · 动脉血压的形成', '前提 + 动力 + 阻力 + 缓冲')];
    var box = picBox(api, picOf(data, 2), 300, 130, 700, 480, null);
    var tags = [
      ['① 血液充盈', '前提条件', C.capac, 40, 170],
      ['② 心脏射血', '必要条件（动力）', C.resist, 40, 320],
      ['③ 外周阻力', '把动能"憋"成压强能', C.elast, 1030, 170],
      ['④ 弹性贮器', '缓冲波动、维持舒张压', C.purple, 1030, 320]
    ];
    var steps = [[box]];
    tags.forEach(function (tg) {
      var card = el(api, 'x-card');
      abs(card, tg[3], tg[4], 210, 120);
      card.style.setProperty('--card-c', tg[2]);
      card.innerHTML = '<h4 style="font-size:14.5px">' + tg[0] + '</h4><p style="font-size:12px">' + tg[1] + '</p>';
      steps.push([card]);
    });
    var note = el(api, '');
    abs(note, 300, 622, 700, 40);
    note.innerHTML = '<p style="font-size:11.5px;color:var(--ink-soft);text-align:center">示意图由 AI 生成，部分解剖形态不完全准确——看图时自己找错（审图练习）</p>';
    steps.push([note]);
    return { steps: steps, static: st };
  };

  /* P105 · 血液充盈：平均充盈压 */
  O[105] = function (pageEl, data, api) {
    var st = [titleBar(api, '① 心血管系统血液充盈', '动脉血压形成的前提条件')];
    var big = el(api, '');
    abs(big, 80, 180, 480, 220);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:72px;font-weight:700;color:#4d96ff;line-height:1">≈7 <span style="font-size:26px">mmHg</span></div><p style="font-size:15px;margin-top:12px;line-height:1.9">循环系统平均充盈压——<br>反映<b>血量</b>与<b>循环系统容积</b>的相对关系。</p>';
    var c1 = el(api, 'x-card');
    abs(c1, 620, 190, 560, 170);
    c1.innerHTML = '<h4>想想两种极端</h4><p style="line-height:2">失血 → 充盈压↓ → 血压失去前提<br>输液过量/容量血管扩张不足 → 充盈压↑</p>';
    var box = picBox(api, picOf(data, 2), 960, 370, 240, 280, null);
    return { steps: [[big], [c1], [box]], static: st };
  };

  /* P106 · 心脏射血：动能与压强能 */
  O[106] = function (pageEl, data, api) {
    var st = [titleBar(api, '② 心脏射血', '必要条件：能量从哪来')];
    var g = data.shapes[0];
    var box = el(api, '');
    abs(box, 60, 140, 700, 440);
    if (g && g.children) {
      g.children.forEach(function (ch) {
        if (ch.kind === 'pic') {
          var im = api.ce('img');
          im.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g)$/i, '.webp');
          im.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff';
          box.appendChild(im);
        } else if (ch.kind === 'text') {
          var tx = el(api, 'obj text');
          tx.innerHTML = (ch.paras || []).map(function (p) { return '<p>' + p.runs.map(function (r) { return api.esc(r.t); }).join('') + '</p>'; }).join('');
          tx.style.cssText = 'position:absolute;left:' + (ch.l - 60) + 'px;top:' + (ch.t - 140) + 'px;width:' + ch.w + 'px;font-size:14px;line-height:1.8';
          box.appendChild(tx);
        }
      });
    }
    var c1 = el(api, 'x-card');
    abs(c1, 800, 170, 420, 150);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>动能</h4><p>推动血液向前流动（约占小部分）。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 800, 340, 420, 150);
    c2.style.setProperty('--card-c', C.elast);
    c2.innerHTML = '<h4>压强能（势能）</h4><p>扩张大动脉、形成对管壁的侧压——血压的主体。</p>';
    return { steps: [[box], [c1], [c2]], static: st };
  };

  /* P107 · 外周阻力 + 弹性贮器 */
  O[107] = function (pageEl, data, api) {
    var st = [titleBar(api, '③ 外周阻力 ＋ ④ 弹性贮器', '阻力"憋"出压力，弹性"存"住压力')];
    var duo = el(api, 'x-duo');
    abs(duo, 60, 170, 640, 260);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.resist + '"><h4>③ 外周阻力</h4><p>主要来自<b>小动脉和微动脉</b>。<br>没有阻力，射出的血会"一流而过"，形不成稳定的压力。</p></div>' +
      '<div class="col" style="--col-c:' + C.elast + '"><h4>④ 弹性贮器作用</h4><p>收缩射血：主动脉、大动脉扩张储能；<br>舒张期：弹性回缩 → <b>维持舒张压</b>、血流不间断。</p></div>';
    var box = picBox(api, picOf(data, 1), 740, 140, 480, 500, '动脉血压形成示意（AI 生成图，形态细节供审图练习）');
    return { steps: [[duo], [box]], static: st };
  };

  /* P108 · 血压测量：Korotkoff */
  O[108] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 动脉血压的测量', 'Korotkoff 音听诊法（间接法）')];
    var g = data.shapes[2];
    var box = el(api, '');
    abs(box, 220, 140, 720, 430);
    if (g && g.children) {
      g.children.forEach(function (ch) {
        if (ch.kind === 'pic') {
          var im = api.ce('img');
          im.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g)$/i, '.webp');
          im.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff';
          box.appendChild(im);
        }
      });
    }
    var s1 = el(api, 'x-card');
    abs(s1, 80, 590, 520, 90);
    s1.style.setProperty('--card-c', C.resist);
    s1.innerHTML = '<p style="font-size:13.5px">袖带减压到<b>第一次出现搏动音</b> = <b>收缩压</b>（血流冲开压迫 → 湍流发声）</p>';
    var s2 = el(api, 'x-card');
    abs(s2, 640, 590, 560, 90);
    s2.style.setProperty('--card-c', C.capac);
    s2.innerHTML = '<p style="font-size:13.5px">搏动音<b>消失</b> = <b>舒张压</b>（血流恢复层流，声音消失）</p>';
    return { steps: [[box], [s1], [s2]], static: st };
  };

  /* P109 · 正常值 + 平均动脉压 */
  O[109] = function (pageEl, data, api) {
    var st = [titleBar(api, '（1）动脉血压的正常值', '收缩压 · 舒张压 · 脉压 · 平均动脉压')];
    var box = picBox(api, picOf(data, 3), 120, 140, 1040, 330, '正常年轻人肱动脉压曲线');
    var f = el(api, '');
    abs(f, 220, 500, 840, 90);
    f.innerHTML = '<div style="text-align:center;font-family:Georgia,serif;font-size:26px;color:#3A5A78;background:rgba(255,253,249,.92);border:1px solid var(--line);border-radius:12px;padding:16px 0">平均动脉压 = 舒张压 + ⅓脉压 = ⅓收缩压 + ⅔舒张压</div>';
    var c1 = el(api, 'x-card');
    abs(c1, 220, 610, 840, 70);
    c1.innerHTML = '<p style="font-size:13px">一个心动周期中<b>舒张期更长</b>，所以平均值偏向舒张压（回到 P38 的时间轴）。</p>';
    return { steps: [[box], [f], [c1]], static: st };
  };

  /* P110 · 血压昼夜波动：双峰双谷 */
  O[110] = function (pageEl, data, api) {
    var st = [titleBar(api, '（2）血压的昼夜波动', '“双峰双谷”的日节律')];
    var g = data.shapes[3];
    var box = el(api, '');
    abs(box, 180, 150, 820, 380);
    if (g && g.children) {
      g.children.forEach(function (ch) {
        if (ch.kind === 'pic') {
          var im = api.ce('img');
          im.src = 'assets/img/' + ch.src.replace(/\.(png|jpe?g)$/i, '.webp');
          im.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff';
          box.appendChild(im);
        }
      });
    }
    var pts = [
      ['02–03 时', '全天最低', C.capac],
      ['06–10 时', '第一峰（晨起高峰 · 心血管事件高发）', C.resist],
      ['16–20 时', '第二峰', C.elast],
      ['20 时后', '缓慢下降', C.purple]
    ];
    var steps = [[box]];
    pts.forEach(function (p, i) {
      var card = el(api, 'x-card');
      abs(card, 180 + (i % 2) * 420, 545 + Math.floor(i / 2) * 82, 400, 72);
      card.style.setProperty('--card-c', p[2]);
      card.style.padding = '10px 16px';
      card.innerHTML = '<h4 style="font-size:13.5px;margin-bottom:2px">' + p[0] + '</h4><p style="font-size:12.5px">' + p[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };
})();
