/* ============================================================
   第三节 · 血管生理（P73–149 全节）— 精修覆盖器
   核心叙事：Q = ΔP / R，R = 8ηL/πr⁴ —— 半径的四次方是全场主角
   上半英雄页：P77 血管树总览、P84-88 八类血管卡、P98 泊肃叶四次方、
              P104-107 血压形成三因素、P109 平均动脉压
   下半英雄页：P118 影响因素总结表、P122 脉搏波、P125 CVP 标尺、
              P132 微循环模式图、P140 体液分布、P142 Starling 演算
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

  /* ============================================================
     下半 P111–149：血压波动→高血压→影响因素→脉搏→静脉→微循环→组织液→淋巴
     ============================================================ */

  /* P111 · 血压昼夜波动的意义 */
  O[111] = function (pageEl, data, api) {
    var st = [titleBar(api, '血压昼夜波动的意义', '节律存在是常态，节律消失是警报')];
    var box = picBox(api, picOf(data, 2), 60, 150, 640, 430, '血压昼夜波动（双峰双谷，回顾 P110）');
    var c1 = el(api, 'x-card');
    abs(c1, 740, 170, 480, 160);
    c1.innerHTML = '<h4>波动是普遍规律</h4><p>昼夜波动正常存在；但<b>大幅度剧烈波动</b>对心脏、血管不利。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 740, 360, 480, 200);
    c2.style.setProperty('--card-c', C.resist);
    c2.innerHTML = '<h4>节律消失 = 危险信号</h4><p style="line-height:1.9">重度高血压、心/脑/肾器质性损害者：<b>波动幅度降低或消失</b>。<br>夜间血压持续升高、节律消失 → 加重心脏负担 → <b>左心室肥大</b>。</p>';
    return { steps: [[box], [c1], [c2]], static: st };
  };

  /* P112 · 高血压与高血压前期 */
  O[112] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 高血压与高血压前期', '最常见的心血管疾病')];
    var def = el(api, 'x-card');
    abs(def, 90, 160, 1100, 130);
    def.innerHTML = '<h4>定义</h4><p style="line-height:1.9">以<b>体循环动脉压增高</b>为主要表现的临床综合征；长期高血压是多种心血管疾病的重要危险因素，最终引起<b>心、脑、肾等靶器官损害</b>。</p>';
    var duo = el(api, 'x-duo');
    abs(duo, 90, 320, 1100, 240);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.resist + '"><h4>原发性高血压 · ≈90%</h4><p>病因尚未完全阐明；占所有高血压的 90% 左右——需要长期管理。</p></div>' +
      '<div class="col" style="--col-c:' + C.exch + '"><h4>继发性高血压</h4><p>病因明确（肾病、内分泌病等）；<b>去除或控制病因后可被治愈或明显缓解</b>——诊断时先想"能不能找到因"。</p></div>';
    return { steps: [[def], [duo]], static: st };
  };

  /* P113 · 血压的分类和定义（表格重绘） */
  O[113] = function (pageEl, data, api) {
    var st = [titleBar(api, '血压的分类和定义', '收缩压 / 舒张压（mmHg）')];
    var rows = [
      ['正常血压', '＜120', '和', '＜80', ''],
      ['正常高值', '120～139', '和/或', '80～89', C.elast],
      ['高血压', '≥140', '和/或', '≥90', C.resist],
      ['1 级（轻度）', '140～159', '和/或', '90～99', ''],
      ['2 级（中度）', '160～179', '和/或', '100～109', ''],
      ['3 级（重度）', '≥180', '和/或', '≥110', ''],
      ['单纯收缩期高血压', '≥140', '和', '＜90', C.capac]
    ];
    var html = '<table class="x-table"><thead><tr><th>分类</th><th>收缩压</th><th></th><th>舒张压</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr' + (r[4] ? ' style="background:rgba(240,160,75,.10)"' : '') + '><td>' + r[0] + '</td><td style="text-align:center">' + r[1] + '</td><td style="text-align:center;color:var(--ink-soft)">' + r[2] + '</td><td style="text-align:center">' + r[3] + '</td></tr>';
    });
    html += '</tbody></table>';
    var tb = el(api, '');
    abs(tb, 150, 150, 980, 420);
    tb.innerHTML = html;
    var note = el(api, 'x-card');
    abs(note, 150, 596, 980, 70);
    note.style.setProperty('--card-c', C.resist);
    note.innerHTML = '<p style="font-size:13.5px"><b>分级原则：</b>收缩压和舒张压分属不同级别时，<b>以较高的级别为准</b>。</p>';
    return { steps: [[tb], [note]], static: st };
  };

  /* P114 · 低血压 */
  O[114] = function (pageEl, data, api) {
    var st = [titleBar(api, '低血压', '高血压伤身，低血压报病')];
    var big = el(api, '');
    abs(big, 90, 180, 460, 240);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:64px;font-weight:700;color:#4d96ff;line-height:1.1">&lt; 90/60 <span style="font-size:24px">mmHg</span></div><p style="font-size:14.5px;margin-top:14px;line-height:1.9">成年人上肢动脉血压低于 12/8 kPa（90/60 mmHg）一般即为低血压<br><span style="color:var(--ink-soft);font-size:12.5px">（目前尚无统一标准）</span></p>';
    var c1 = el(api, 'x-card');
    abs(c1, 620, 190, 580, 190);
    c1.style.setProperty('--card-c', C.elast);
    c1.innerHTML = '<h4>临床视角</h4><p style="line-height:2">高血压 → 主动损害心、脑、肾等重要脏器；<br>低血压 → 常是<b>机体脏器病变或损伤的结果</b>。<br><b>临床诊断应重视低血压的症状表现。</b></p>';
    return { steps: [[big], [c1]], static: st };
  };

  /* P115 · 影响动脉血压的因素（五因素导览） */
  O[115] = function (pageEl, data, api) {
    var st = [titleBar(api, '4 · 影响动脉血压的因素', '五个因素 —— 谁影响收缩压，谁影响舒张压？')];
    var items = [
      ['① 心脏每搏输出量', '主要影响收缩压', C.resist],
      ['② 心率', '主要影响舒张压', C.elast],
      ['③ 外周阻力', '舒张压的高低主要反映它', C.resist],
      ['④ 大动脉弹性贮器作用', '减弱 → 脉压增大（老年）', C.purple],
      ['⑤ 循环血量与血管容量的匹配', '失血时最先塌陷的前提', C.capac]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 120, 155 + i * 104, 1040, 92);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px">→ ' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P116/117 共用：箭头三元组行 */
  function factorRow(api, y, name, mech, sArrow, dArrow, pArrow, tag, color) {
    var row = el(api, '');
    abs(row, 70, y, 1140, 140);
    var arrow = function (a, big) {
      return '<span style="font-family:Georgia,serif;font-weight:700;font-size:' + (big ? 30 : 20) + 'px;color:' + (a.indexOf('↓') >= 0 ? '#4d96ff' : '#d9534f') + '">' + a + '</span>';
    };
    row.innerHTML =
      '<div style="display:flex;gap:18px;align-items:stretch;height:100%">' +
      '<div style="flex:0 0 300px;background:rgba(255,253,249,.92);border:1px solid var(--line);border-left:5px solid ' + color + ';border-radius:12px;padding:14px 18px"><h4 style="font-size:16px;color:var(--heart-deep)">' + name + '</h4><p style="font-size:12px;color:var(--ink-soft);margin-top:4px;line-height:1.6">' + mech + '</p></div>' +
      [['收缩压', sArrow], ['舒张压', dArrow], ['脉压', pArrow]].map(function (pr) {
        return '<div style="flex:1;background:rgba(255,253,249,.92);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center"><p style="font-size:12.5px;color:var(--ink-soft)">' + pr[0] + '</p><p style="margin-top:6px">' + arrow(pr[1], pr[1].length > 1) + '</p></div>';
      }).join('') +
      '<div style="flex:0 0 240px;display:flex;align-items:center;background:rgba(217,83,79,.07);border:1px dashed ' + color + ';border-radius:12px;padding:10px 14px;font-size:12.5px;line-height:1.7"><b>' + tag + '</b></div>' +
      '</div>';
    return row;
  }

  /* P116 · ① 每搏输出量 ② 心率 */
  O[116] = function (pageEl, data, api) {
    var st = [titleBar(api, '① 每搏输出量　② 心率', '↑↑ = 影响大，↑ = 影响小')];
    var r1 = factorRow(api, 170, '① 心脏每搏输出量 ↑', '搏出量↑ → 收缩期射入主动脉的血↑ → 收缩压明显升高；舒张期血液流出，舒张压升幅小', '↑↑', '↑', '↑', '每搏输出量的变化主要影响<b>收缩压</b>', C.resist);
    var r2 = factorRow(api, 350, '② 心率 ↑', '心率↑ → 舒张期缩短 → 流到外周的血减少 → 舒张期末主动脉内存血↑ → 舒张压明显升高', '↑', '↑↑', '↓', '心率的变化主要影响<b>舒张压</b>', C.elast);
    var note = el(api, 'x-card');
    abs(note, 70, 540, 1140, 70);
    note.innerHTML = '<p style="font-size:12.5px">记忆锚点：<b>收缩压看心脏（搏出量），舒张压看外周（阻力与心率）</b>——心率过快或过慢，血压最终都将下降。</p>';
    return { steps: [[r1], [r2], [note]], static: st };
  };

  /* P117 · ③ 外周阻力 ④ 弹性贮器 ⑤ 血量/容量 */
  O[117] = function (pageEl, data, api) {
    var st = [titleBar(api, '③ 外周阻力　④ 弹性贮器　⑤ 血量与容量', '舒张压是外周阻力的"晴雨表"')];
    var r1 = factorRow(api, 160, '③ 外周阻力 ↑', '阻力↑ → 舒张期血液流向外周减慢 → 舒张期末存血↑ → 舒张压明显↑', '↑', '↑↑', '↓', '<b>舒张压的高低主要反映外周阻力的大小</b>', C.resist);
    var r2 = factorRow(api, 330, '④ 大动脉弹性贮器作用 ↓', '老年人动脉硬化、顺应性↓ → 收缩期缓冲↓（收缩压↑）、舒张期回缩维持↓（舒张压↓）', '↑', '↓', '↑', '典型表现：<b>脉压增大</b>（老年单纯收缩期高血压）', C.purple);
    var r3 = factorRow(api, 500, '⑤ 循环血量 ↓ / 血管容量 ↑', '大失血：循环血量减少、容量不变 → 体循环平均充盈压↓ → 血压↓', '↓', '↓', '—', '血压形成的<b>前提条件</b>塌陷', C.capac);
    return { steps: [[r1], [r2], [r3]], static: st };
  };

  /* P118 · 影响因素总结表（复习锚点） */
  O[118] = function (pageEl, data, api) {
    var st = [titleBar(api, '影响动脉血压的因素 · 总结', '一张表背完整节（箭头粗细 = 影响大小）')];
    var up = '<b style="color:#d9534f">↑</b>', upup = '<b style="color:#d9534f;font-size:17px">↑↑</b>',
        dn = '<b style="color:#4d96ff">↓</b>';
    var rows = [
      ['每搏输出量 ↑', upup, up, '增大', '主要影响收缩压'],
      ['心率 ↑', up, upup, '减小', '主要影响舒张压'],
      ['外周阻力 ↑', up, upup, '减小', '舒张压反映外周阻力'],
      ['弹性贮器作用 ↓（老年）', up, dn, '增大', '脉压增大'],
      ['循环血量 ↓（失血）', dn, dn, '—', '前提条件塌陷']
    ];
    var html = '<table class="x-table"><thead><tr><th>因素变化</th><th>收缩压</th><th>舒张压</th><th>脉压</th><th>一句话考点</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td>' + r[0] + '</td><td style="text-align:center">' + r[1] + '</td><td style="text-align:center">' + r[2] + '</td><td style="text-align:center">' + r[3] + '</td><td style="font-size:12.5px">' + r[4] + '</td></tr>';
    });
    html += '</tbody></table>';
    var tb = el(api, '');
    abs(tb, 110, 160, 1060, 400);
    tb.innerHTML = html;
    var note = el(api, 'x-card');
    abs(note, 110, 590, 1060, 80);
    note.innerHTML = '<p style="font-size:13px">临床上高血压/低血压往往<b>不是单一因素</b>，而是各因素相互作用的综合结果（见下页）。</p>';
    return { steps: [[tb], [note]], static: st };
  };

  /* P119 · 综上所述：三大基本因素 */
  O[119] = function (pageEl, data, api) {
    var st = [titleBar(api, '综上所述：血压形成的三大基本因素', '异常时先鉴别，再处置')];
    var chain = el(api, '');
    abs(chain, 90, 190, 1100, 180);
    chain.innerHTML = '<div style="display:flex;align-items:center;gap:14px;height:100%">' +
      [['循环血量', '前提', C.capac], ['心脏射血功能', '动力', C.resist], ['外周阻力', '"憋"住压力', C.elast]].map(function (it) {
        return '<div style="flex:1;background:rgba(255,253,249,.92);border:1px solid var(--line);border-top:5px solid ' + it[2] + ';border-radius:14px;padding:22px;text-align:center"><h4 style="font-size:19px">' + it[0] + '</h4><p style="font-size:13px;color:var(--ink-soft);margin-top:6px">' + it[1] + '</p></div>';
      }).join('<div style="font-size:26px;color:var(--ink-soft)">＋</div>') +
      '<div style="font-size:26px;color:var(--heart-deep)">＝</div>' +
      '<div style="flex:0 0 200px;background:linear-gradient(135deg,#3A5A78,#7FA8C9);border-radius:14px;padding:22px;text-align:center;color:#fff"><h4 style="font-size:19px">动脉血压</h4><p style="font-size:12.5px;opacity:.85;margin-top:6px">+ 弹性贮器缓冲波动</p></div></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 90, 420, 1100, 130);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>临床思维</h4><p style="line-height:1.9">血压异常达到需要处置的程度时：<b>先鉴别是哪些因素出了问题</b>（容量？心脏？阻力？），再施以针对性处理——而不是见到数字就下药。</p>';
    return { steps: [[chain], [c1]], static: st };
  };

  /* P121 · 动脉脉搏（定义） */
  O[121] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）动脉脉搏', '压力波动 → 管壁搏动')];
    var def = el(api, 'x-card');
    abs(def, 70, 170, 460, 180);
    def.innerHTML = '<h4>定义</h4><p style="line-height:2">每个心动周期中，动脉内<b>压力发生周期性波动</b>，引起动脉管壁发生<b>搏动</b>——这就是动脉脉搏（诊脉摸的就是它）。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 70, 380, 460, 150);
    c2.style.setProperty('--card-c', C.elast);
    c2.innerHTML = '<h4>脉搏 = 血压波的影子</h4><p style="font-size:13px;line-height:1.9">波形反映射血速度、阻力与瓣膜关闭——先认识正常波形，再看病理变形。</p>';
    var box = picBox(api, picOf(data, 3), 570, 150, 640, 460, '正常及病理情况下的动脉脉搏图');
    return { steps: [[def], [box], [c2]], static: st };
  };

  /* P122 · 动脉脉搏的波形（手绘 SVG · 英雄页） */
  O[122] = function (pageEl, data, api) {
    var st = [titleBar(api, '1 · 动脉脉搏的波形', '上升支 · 下降支 · 降中峡与降中波')];
    var svg = '<svg viewBox="0 0 640 300" preserveAspectRatio="none">';
    for (var g = 40; g <= 600; g += 56) svg += '<line class="axis" x1="' + g + '" y1="30" x2="' + g + '" y2="240" stroke-width="0.4" opacity="0.22"/>';
    svg += '<rect class="phase-band" x="60" y="30" width="80" height="210" fill="' + C.resist + '"/>' +
      '<rect class="phase-band" x="140" y="30" width="300" height="210" fill="' + C.capac + '"/>';
    svg += '<path class="curve" d="M40,220 L60,220 C80,215 95,80 125,66 C140,60 150,85 162,110 C176,138 190,152 206,162 L222,172 C232,152 250,146 262,156 C280,170 310,205 350,214 C370,218 400,220 430,220 L600,220" style="stroke:#3A5A78"/>';
    svg += '<circle cx="222" cy="172" r="5" fill="#d9534f"/>' +
      '<text x="222" y="205" text-anchor="middle" font-size="12.5" font-weight="700" fill="#d9534f">降中峡</text>' +
      '<circle cx="256" cy="153" r="5" fill="#f0a04b"/>' +
      '<text x="292" y="130" text-anchor="middle" font-size="12.5" font-weight="700" fill="#f0a04b">降中波</text>' +
      '<line x1="280" y1="134" x2="262" y2="148" stroke="#f0a04b" stroke-width="1.2"/>';
    svg += '<text x="95" y="50" text-anchor="middle" font-size="14" font-weight="700" fill="#d9534f">上升支</text>' +
      '<text x="390" y="120" text-anchor="middle" font-size="14" font-weight="700" fill="#4d96ff">下降支</text>';
    svg += '<text x="40" y="262" font-size="12" fill="#6b6560">动脉压力 / 时间 →（一个心动周期）</text>';
    svg += '</svg>';
    var wave = el(api, 'x-ap');
    abs(wave, 70, 150, 760, 400);
    wave.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 870, 160, 350, 190);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>上升支</h4><p style="font-size:12.5px;line-height:1.85">心室<b>快速射血期</b>血管壁被扩张形成。<br>阻力大、心输出量小、射血慢 → <b>斜率小、幅度低</b>；反之则斜率大、幅度高。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 870, 370, 350, 240);
    c2.style.setProperty('--card-c', C.capac);
    c2.innerHTML = '<h4>下降支</h4><p style="font-size:12.5px;line-height:1.85"><b>前段</b>：射血后期，血压渐降。<br><b>降中峡</b>：舒张开始、主动脉瓣关闭瞬间，血液向心室反流、受阻于瓣膜 → 折返波 → 切迹后的<b>降中波</b>。<br><b>后段</b>：舒张期血压继续下降。</p>';
    return { steps: [[wave], [c1], [c2]], static: st };
  };

  /* P123 · 脉搏波传播速度 */
  O[123] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 脉搏波的传播速度', '比血流速度快得多 —— 传的是"波"，不是"血"')];
    var svg = '<svg viewBox="0 0 640 220" preserveAspectRatio="none">';
    for (var g = 0; g <= 35; g += 5) {
      var gx = 150 + g * 13;
      svg += '<line x1="' + gx + '" y1="20" x2="' + gx + '" y2="180" stroke="#999" stroke-width="0.4" opacity="0.3"/>' +
        '<text x="' + gx + '" y="200" text-anchor="middle" font-size="10.5" fill="#6b6560">' + g + '</text>';
    }
    svg += [['主动脉', 3, 5, '#3A5A78', 45], ['大动脉', 7, 10, '#f0a04b', 100], ['小动脉', 15, 35, '#d9534f', 155]].map(function (b) {
      var x1 = 150 + b[1] * 13, w = (b[2] - b[1]) * 13;
      return '<text x="135" y="' + (b[4] + 5) + '" text-anchor="end" font-size="13" font-weight="700" fill="#3A5A78">' + b[0] + '</text>' +
        '<rect x="' + x1 + '" y="' + (b[4] - 13) + '" width="' + w + '" height="26" rx="13" fill="' + b[3] + '" opacity="0.85"/>' +
        '<text x="' + (x1 + w + 10) + '" y="' + (b[4] + 5) + '" font-size="12.5" fill="#6b6560">' + b[1] + '～' + b[2] + ' m/s</text>';
    }).join('');
    svg += '<text x="150" y="218" font-size="11" fill="#6b6560">传播速度（m/s）</text></svg>';
    var bars = el(api, 'x-ap');
    abs(bars, 70, 150, 780, 300);
    bars.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 70, 480, 780, 110);
    c1.innerHTML = '<h4>规律：越到外周越快</h4><p style="font-size:13px;line-height:1.9">管壁<b>顺应性越大，传播越慢</b>——主动脉弹性最好、最慢；小动脉壁硬、最快。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 890, 150, 330, 180);
    c2.style.setProperty('--card-c', C.resist);
    c2.innerHTML = '<h4>临床：PWV</h4><p style="font-size:12.5px;line-height:1.9">老年人主动脉顺应性减小，脉搏波传导速度可增快至约 <b>10 m/s</b>——<b>脉搏波速度（PWV）是评估动脉硬化的指标</b>。</p>';
    return { steps: [[bars], [c1], [c2]], static: st };
  };

  /* P124 · 静脉血压：中心静脉压 vs 外周静脉压 */
  O[124] = function (pageEl, data, api) {
    var st = [titleBar(api, '四、静脉血压和静脉回心血量', '1 · 静脉血压')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 660, 210);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.capac + '"><h4>中心静脉压 CVP</h4><p>右心房和胸腔内大静脉的血压；<b>右心房血压最低，接近于零</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.vein + '"><h4>外周静脉压</h4><p>各器官静脉的血压——足背静脉、颈静脉都属此类。</p></div>';
    var bal = el(api, 'x-card');
    abs(bal, 70, 410, 660, 150);
    bal.style.setProperty('--card-c', C.elast);
    bal.innerHTML = '<h4>CVP 由什么决定？—— 一进一出的平衡</h4><p style="line-height:2">心脏射血能力愈强（出得快）→ CVP 愈<b>低</b>；<br>静脉回流速度加快（进得快）→ CVP <b>升高</b>。</p>';
    return { steps: [[duo], [bal]], static: st };
  };

  /* P125 · CVP 临床标尺（英雄页） */
  O[125] = function (pageEl, data, api) {
    var st = [titleBar(api, '中心静脉压的临床意义', '控制补液速度和补液量的指标')];
    function ry(cm) { return 400 - cm * 17; }
    var svg = '<svg viewBox="0 0 340 440" preserveAspectRatio="none">';
    var zones = [
      [0, 4, '#4d96ff', '＜4：血容量不足'],
      [4, 10, '#6bcb77', '4～10：正常范围'],
      [10, 15, '#f0a04b', '＞10：警惕心功能不全'],
      [15, 22, '#d9534f', '＞15～20：心衰·肺水肿']
    ];
    zones.forEach(function (z) {
      svg += '<rect x="110" y="' + ry(z[1]) + '" width="70" height="' + (ry(z[0]) - ry(z[1])) + '" fill="' + z[2] + '" opacity="0.8"/>' +
        '<text x="195" y="' + ((ry(z[0]) + ry(z[1])) / 2 + 4) + '" font-size="11.5" font-weight="700" fill="' + z[2] + '">' + z[3] + '</text>';
    });
    [0, 4, 10, 15, 20].forEach(function (v) {
      svg += '<line x1="100" y1="' + ry(v) + '" x2="110" y2="' + ry(v) + '" stroke="#333" stroke-width="1"/>' +
        '<text x="94" y="' + (ry(v) + 4) + '" text-anchor="end" font-size="12" fill="#333">' + v + '</text>';
    });
    svg += '<text x="145" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#3A5A78">CVP / cmH₂O</text>';
    svg += '</svg>';
    var ruler = el(api, 'x-ap');
    abs(ruler, 90, 140, 560, 470);
    ruler.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 700, 170, 520, 130);
    c1.style.setProperty('--card-c', C.capac);
    c1.innerHTML = '<h4>CVP 偏低</h4><p>输液量不足（有效血容量不够）→ <b>可快速补液或补血浆</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 700, 320, 520, 130);
    c2.style.setProperty('--card-c', C.resist);
    c2.innerHTML = '<h4>CVP 偏高</h4><p>输液过快 / 心脏射血功能不全 → <b>减慢补液、强心</b>。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 700, 470, 520, 100);
    c3.innerHTML = '<p style="font-size:13px;line-height:1.8"><b>补液试验的逻辑：</b>CVP 低 + 血压低 → 补液；CVP 高 + 血压低 → 强心而非补液。</p>';
    return { steps: [[ruler], [c1], [c2], [c3]], static: st };
  };

  /* P127 · 重力对静脉压的影响 */
  O[127] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 重力对静脉压的影响', '静脉壁薄 —— 重力对静脉的影响远大于动脉')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 700, 200);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.capac + '"><h4>平卧</h4><p>身体各部位静水压<b>大致相同</b>——重力不起作用。</p></div>' +
      '<div class="col" style="--col-c:' + C.resist + '"><h4>直立</h4><p>足部血管血压比卧位<b>高</b>（脚下多了一截血柱）；心脏水平以上则比平卧时<b>低</b>。</p></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 70, 400, 700, 130);
    c1.style.setProperty('--card-c', C.elast);
    c1.innerHTML = '<h4>跨壁压</h4><p style="line-height:2">= 血液对管壁的压力 − 血管外组织对管壁的压力。<br>一定的跨壁压是保持血管<b>充盈扩张</b>的必要条件；静脉壁薄，充盈程度受跨壁压影响大。</p>';
    var steps = [[duo], [c1]];
    var g = data.shapes[3];
    var picSrc = null;
    if (g && g.children) {
      g.children.forEach(function (ch) { if (ch.kind === 'pic' && !picSrc) picSrc = ch.src; });
    }
    if (picSrc) {
      var box = el(api, '');
      abs(box, 810, 170, 400, 380);
      box.innerHTML = '<img src="assets/img/' + picSrc.replace(/\.(png|jpe?g)$/i, '.webp') + '" style="width:100%;height:88%;object-fit:contain;border-radius:12px;border:1px solid var(--line);background:#fff"><p style="font-size:12px;color:var(--ink-soft);text-align:center;margin-top:6px">直立体位对静脉血压的影响</p>';
      steps.push([box]);
    }
    return { steps: steps, static: st };
  };

  /* P128 · 静脉回心血量：阻力小 + 五因素导览 */
  O[128] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 静脉回心血量', '阻力很小，回流靠"泵"')];
    var big = el(api, '');
    abs(big, 80, 180, 440, 220);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:70px;font-weight:700;color:#4d96ff;line-height:1">15%</div><p style="font-size:14.5px;margin-top:12px;line-height:1.9">静脉系统血压仅下降 15 mmHg，<br>静脉阻力只占体循环总阻力的 <b>15%</b>——<br>回流的关键不在阻力，而在下面的五个因素。</p>';
    var items = ['体循环平均充盈压', '心肌收缩力', '骨骼肌的挤压作用（肌肉泵）', '体位改变', '呼吸运动（呼吸泵）'];
    var steps = [[big]];
    items.forEach(function (t, i) {
      var card = el(api, 'x-card');
      abs(card, 600, 150 + i * 92, 620, 80);
      card.style.setProperty('--card-c', [C.capac, C.resist, C.exch, C.elast, C.purple][i]);
      card.innerHTML = '<p style="font-size:15px;font-weight:700">' + (i + 1) + ' · ' + t + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P129 · 四个因素的机制链 */
  O[129] = function (pageEl, data, api) {
    var st = [titleBar(api, '影响静脉回心血量的因素 ①–④', '每条链都要能从"因"推到"果"')];
    var items = [
      ['体循环平均充盈压', '血液充盈↑ → 静脉回流↑', C.capac],
      ['心肌收缩力', '收缩力↑ → 射血量↑ → 心舒期室内压↓（抽吸力↑）→ 静脉回流↑', C.resist],
      ['体位改变', '卧位→立位 → 低垂部分容纳血液↑ → 静脉回流↓', C.elast],
      ['骨骼肌的挤压作用（肌肉泵）', '下肢肌肉运动 → 挤压静脉 + 静脉瓣防倒流 → 静脉回流↑（持续站立不动则↓）', C.exch]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90 + (i % 2) * 570, 170 + Math.floor(i / 2) * 210, 530, 180);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:14px;line-height:2">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P130 · 呼吸泵 */
  O[130] = function (pageEl, data, api) {
    var st = [titleBar(api, '⑤ 呼吸运动（呼吸泵）', '吸气 = 给胸腔静脉"打气"')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 170, 620, 220);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.exch + '"><h4>吸气时</h4><p>胸膜腔负压↑ → 胸腔内大静脉和右心房扩张 → 压力↓ → <b>静脉回流↑</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.capac + '"><h4>呼气时</h4><p>胸膜腔负压↓ → 静脉回流相应<b>减少</b>——呼吸周期成了静脉回流的"泵"。</p></div>';
    var box = picBox(api, picOf(data, 3), 740, 150, 480, 460, '呼吸运动对体循环和肺循环的影响');
    var note = el(api, 'x-card');
    abs(note, 70, 430, 620, 110);
    note.innerHTML = '<p style="font-size:13px;line-height:1.9">注意区分：对<b>体循环</b>，吸气使回流↑；对<b>肺循环</b>，吸气时肺血管扩张、容纳血液↑，回到左心的血量短暂↓——看原图两条曲线的相位差。</p>';
    return { steps: [[duo], [box], [note]], static: st };
  };

  /* P131 · 静脉回心血量因素总结表 */
  O[131] = function (pageEl, data, api) {
    var st = [titleBar(api, '影响静脉回心血量的因素 · 总结', '变化 → 回心血量 → 机制')];
    var up = '<b style="color:#d9534f">↑</b>', dn = '<b style="color:#4d96ff">↓</b>';
    var rows = [
      ['体循环平均充盈压 ↑', up, '外周静脉压与中心静脉压差 ↑'],
      ['心肌收缩力 ↑', up, '心舒期抽吸力 ↑'],
      ['体位：卧位→直立', dn, '低垂部位静脉扩张、血液淤滞'],
      ['骨骼肌节律性舒缩', up, '肌肉泵 + 静脉瓣（持续收缩则 ↓）'],
      ['呼吸：胸内负压 ↑', up, '腔静脉扩张（呼气时 ↓）']
    ];
    var html = '<table class="x-table"><thead><tr><th>因素变化</th><th>回心血量</th><th>作用机制</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td>' + r[0] + '</td><td style="text-align:center">' + r[1] + '</td><td style="font-size:13px">' + r[2] + '</td></tr>';
    });
    html += '</tbody></table>';
    var tb = el(api, '');
    abs(tb, 130, 170, 1020, 380);
    tb.innerHTML = html;
    return { steps: [[tb]], static: st };
  };

  /* P132 · 微循环的组成（手绘 SVG · 本节英雄页） */
  O[132] = function (pageEl, data, api) {
    var st = [titleBar(api, '五、微循环 · 1 组成', '微动脉 ↔ 微静脉之间 —— 物质交换的直接场所')];
    var svg = '<svg viewBox="0 0 800 380" preserveAspectRatio="none">';
    svg += '<defs><linearGradient id="capg" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#d9534f"/><stop offset="1" stop-color="#3a5a78"/></linearGradient></defs>';
    svg += '<rect x="190" y="26" width="480" height="140" rx="18" fill="none" stroke="#6bcb77" stroke-width="1.2" stroke-dasharray="6 5" opacity="0.7"/>' +
      '<text x="200" y="20" font-size="11.5" fill="#6bcb77" font-weight="700">组织间隙 · 物质交换场所</text>';
    svg += '<path d="M30,190 L110,190" stroke="#d9534f" stroke-width="12" stroke-linecap="round" fill="none"/>' +
      '<text x="34" y="172" font-size="13" font-weight="700" fill="#d9534f">微动脉</text>';
    svg += '<path d="M110,190 C140,170 150,120 176,102" stroke="#d9534f" stroke-width="5" fill="none"/>' +
      '<path d="M110,190 L176,190" stroke="#d9534f" stroke-width="5" fill="none"/>' +
      '<text x="100" y="225" font-size="12.5" font-weight="700" fill="#d9534f">后微动脉</text>';
    svg += '<circle cx="176" cy="102" r="7" fill="#9e3a50"/>' +
      '<text x="176" y="82" text-anchor="middle" font-size="11.5" font-weight="700" fill="#9e3a50">毛细血管前括约肌</text>';
    svg += '<path d="M184,96 C240,60 300,120 360,84 C420,50 480,110 560,86 C590,78 640,92 672,100" stroke="url(#capg)" stroke-width="3" fill="none"/>' +
      '<path d="M186,104 C250,130 310,80 380,112 C450,140 540,90 672,116" stroke="url(#capg)" stroke-width="3" fill="none"/>' +
      '<path d="M182,90 C230,44 320,62 400,46 C480,32 580,60 670,88" stroke="url(#capg)" stroke-width="3" fill="none"/>' +
      '<text x="400" y="152" text-anchor="middle" font-size="12.5" font-weight="700" fill="#b06030">真毛细血管（迂回通路 · 交换）</text>';
    svg += '<path d="M176,190 C300,182 480,182 672,178" stroke="#f0a04b" stroke-width="3.5" fill="none"/>' +
      '<text x="330" y="212" text-anchor="middle" font-size="12.5" font-weight="700" fill="#f0a04b">通血毛细血管（直捷通路）</text>';
    svg += '<path d="M110,190 C150,290 300,312 420,302 C520,294 620,280 672,244" stroke="#9b72cf" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<text x="320" y="335" text-anchor="middle" font-size="12.5" font-weight="700" fill="#9b72cf">动-静脉吻合支（短路 · 体温调节）</text>';
    svg += '<path d="M678,92 L678,250" stroke="#3a5a78" stroke-width="8" stroke-linecap="round" fill="none"/>' +
      '<path d="M678,175 L768,175" stroke="#3a5a78" stroke-width="14" stroke-linecap="round" fill="none"/>' +
      '<text x="700" y="158" font-size="13" font-weight="700" fill="#3a5a78">微静脉</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 40, 135, 900, 440);
    dia.innerHTML = svg;
    var chips = el(api, 'x-legend');
    abs(chips, 60, 596, 900);
    var parts = ['微动脉', '后微动脉', '毛细血管前括约肌', '真毛细血管', '通血毛细血管', '动-静脉吻合支', '微静脉'];
    var pcol = ['#d9534f', '#d9534f', '#9e3a50', '#b06030', '#f0a04b', '#9b72cf', '#3a5a78'];
    chips.innerHTML = parts.map(function (p, i) {
      return '<span class="item"><span class="sw" style="background:' + pcol[i] + '"></span>' + p + '</span>';
    }).join('');
    var box = picBox(api, picOf(data, 3), 960, 150, 270, 300, '教材模式图');
    var def = el(api, 'x-card');
    abs(def, 960, 480, 270, 130);
    def.innerHTML = '<p style="font-size:12.5px;line-height:1.8">微循环 = <b>微动脉与微静脉之间</b>的血液循环，是机体与外界进行物质和气体交换的直接场所。</p>';
    return { steps: [[dia], [chips], [box], [def]], static: st };
  };

  /* P133 · 毛细血管壁的结构 */
  O[133] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 毛细血管壁的结构和通透性', '为交换而生的"超薄"设计')];
    var big = el(api, '');
    abs(big, 70, 180, 380, 180);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:64px;font-weight:700;color:#6bcb77;line-height:1">≈0.5 <span style="font-size:24px">μm</span></div><p style="font-size:14px;margin-top:10px">毛细血管壁总厚度——<br>只为一层内皮细胞 + 基底膜。</p>';
    var cards = [
      ['无平滑肌、无弹性纤维', '单层内皮细胞构成，外包基底膜；细胞核处稍厚', C.exch, 180],
      ['内皮细胞间有细微缝隙', '缝隙内充满水的通道 = 沟通毛细血管内外的通道（非脂溶性物质走这里）', C.capac, 345],
      ['内皮细胞有吞饮功能', '大分子物质靠吞饮小泡转运（见 P139）', C.purple, 510]
    ];
    var steps = [[big]];
    cards.forEach(function (c) {
      var card = el(api, 'x-card');
      abs(card, 500, c[3], 420, 140);
      card.style.setProperty('--card-c', c[2]);
      card.innerHTML = '<h4>' + c[0] + '</h4><p style="font-size:12.5px;line-height:1.8">' + c[1] + '</p>';
      steps.push([card]);
    });
    var box = picBox(api, picOf(data, 2), 950, 180, 280, 380, '毛细血管壁电镜结构');
    steps.push([box]);
    return { steps: steps, static: st };
  };

  /* P134 · 数量与交换面积 */
  O[134] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 毛细血管的数量和交换面积', '数量换面积，面积换时间')];
    var big = el(api, '');
    abs(big, 70, 170, 560, 240);
    big.innerHTML = '<div style="display:flex;gap:40px">' +
      '<div><div style="font-family:Georgia,serif;font-size:56px;font-weight:700;color:#6bcb77;line-height:1">400 <span style="font-size:22px">亿根</span></div><p style="font-size:13px;margin-top:8px">全身毛细血管总数</p></div>' +
      '<div><div style="font-family:Georgia,serif;font-size:56px;font-weight:700;color:#4d96ff;line-height:1">≈1000 <span style="font-size:22px">m²</span></div><p style="font-size:13px;margin-top:8px">总有效交换面积<br>（含可交换的微静脉）</p></div></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 70, 450, 560, 140);
    c1.innerHTML = '<h4>血流动力学特点</h4><p style="line-height:2">横截面积最大 → <b>流速最慢</b>（回顾 P77 血管树）→ 留出充足的交换时间；<br>开放数量受<b>血管舒缩活动</b>调节（见 P138）。</p>';
    var box = picBox(api, picOf(data, 2), 700, 170, 520, 420, '血管舒缩活动：毛细血管交替开放');
    return { steps: [[big], [c1], [box]], static: st };
  };

  /* P135 · 迂回通路（营养通路） */
  O[135] = function (pageEl, data, api) {
    var st = [titleBar(api, '2 · 微循环的血流通路 ①', '迂回通路 = 营养通路')];
    var chain = el(api, '');
    abs(chain, 60, 180, 1160, 110);
    var nodes = ['微动脉', '后微动脉', '毛细血管前括约肌', '真毛细血管', '微静脉'];
    chain.innerHTML = '<div style="display:flex;align-items:center;gap:8px;height:100%">' + nodes.map(function (n, i) {
      var hot = i === 3;
      return '<div style="flex:1;text-align:center;background:rgba(255,253,249,.92);border:1.5px solid ' + (hot ? '#6bcb77' : 'var(--line)') + ';border-radius:12px;padding:18px 6px;font-size:' + (hot ? 17 : 14) + 'px;font-weight:' + (hot ? 700 : 500) + ';color:' + (hot ? '#3d8a48' : 'var(--ink)') + '">' + n + '</div>';
    }).join('<div style="font-size:20px;color:var(--ink-soft)">→</div>') + '</div>';
    var c1 = el(api, 'x-card');
    abs(c1, 60, 330, 1160, 150);
    c1.style.setProperty('--card-c', C.exch);
    c1.innerHTML = '<h4>为什么叫"营养通路"</h4><p style="line-height:2">真毛细血管<b>多且迂曲、管壁很薄、通透性大、血流缓慢</b>——<br>是血液和组织液之间进行<b>物质交换的主要场所</b>。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 60, 510, 1160, 90);
    c2.innerHTML = '<p style="font-size:13px">对照 P132 模式图：走<b>上面那条弯弯曲曲的路</b>（经前括约肌进真毛细血管网）。</p>';
    return { steps: [[chain], [c1], [c2]], static: st };
  };

  /* P136 · 直捷通路 & 动静脉短路 */
  O[136] = function (pageEl, data, api) {
    var st = [titleBar(api, '② 直捷通路　③ 动静脉短路', '一条赶时间，一条管体温')];
    var duo = el(api, 'x-duo');
    abs(duo, 70, 160, 1140, 250);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.elast + '"><h4>② 直捷通路</h4><p style="font-family:Georgia,serif;font-size:13.5px;margin-bottom:8px">微动脉 → 后微动脉 → 通血毛细血管 → 微静脉</p><p>通路短直、血流快，使血液<b>迅速进入静脉</b>回心；<b>骨骼肌中多见</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.purple + '"><h4>③ 动静脉短路（非营养通路）</h4><p style="font-family:Georgia,serif;font-size:13.5px;margin-bottom:8px">微动脉 → 动-静脉吻合支 → 微静脉</p><p>血液不经过毛细血管网，<b>不参与物质交换</b>；皮肤多见，<b>参与体温调节</b>。</p></div>';
    var c1 = el(api, 'x-card');
    abs(c1, 70, 450, 1140, 120);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>联系临床 · "暖休克"</h4><p style="line-height:1.9">感染或中毒性休克时动静脉短路<b>大量开放</b>：血液绕过毛细血管直接回静脉——患者虽处于休克状态，<b>皮肤温度却较温暖</b>，此即"暖休克"。</p>';
    return { steps: [[duo], [c1]], static: st };
  };

  /* P137 · 微循环的血流动力学 */
  O[137] = function (pageEl, data, api) {
    var st = [titleBar(api, '3 · 微循环的血流动力学', '还是 Q = ΔP / R —— 回到 P94')];
    var c1 = el(api, 'x-card');
    abs(c1, 80, 170, 520, 170);
    c1.innerHTML = '<h4>血流量</h4><p style="line-height:2">与微动脉-微静脉之间的<b>血压差成正比</b>，与微循环<b>总阻力成反比</b>。<br><span style="color:var(--ink-soft);font-size:12.5px">Q = ΔP / R 在微循环照样成立。</span></p>';
    var c2 = el(api, 'x-card');
    abs(c2, 660, 170, 540, 170);
    c2.style.setProperty('--card-c', C.resist);
    c2.innerHTML = '<h4>毛细血管血压由谁决定</h4><p style="line-height:2">取决于<b>毛细血管前阻力 / 后阻力的比值</b>：<br>比值↑（前括约肌收缩）→ 毛细血管血压↓ → 滤过↓；<br>比值↓ → 血压↑ → 滤过↑（为 P142 埋下伏笔）。</p>';
    var c3 = el(api, 'x-card');
    abs(c3, 80, 380, 1120, 130);
    c3.style.setProperty('--card-c', C.exch);
    c3.innerHTML = '<h4>血流阻力大、速度慢 = 设计优点</h4><p style="line-height:2">血流速度缓慢<b>有利于血液与组织液在毛细血管进行物质交换</b>——微循环的"慢"与 P77 血管树的横截面积最大是同一枚硬币的两面。</p>';
    return { steps: [[c1], [c2], [c3]], static: st };
  };

  /* P138 · 血管舒缩活动 */
  O[138] = function (pageEl, data, api) {
    var st = [titleBar(api, '毛细血管交替性收缩和舒张', '血管舒缩活动 vasomotion')];
    var big = el(api, '');
    abs(big, 90, 190, 440, 220);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:66px;font-weight:700;color:#f0a04b;line-height:1">5～10 <span style="font-size:24px">次/分</span></div><p style="font-size:14.5px;margin-top:14px;line-height:1.9">后微动脉与毛细血管前括约肌<br>交替性收缩、舒张的频率——<br>毛细血管轮流"上班"。</p>';
    var c1 = el(api, 'x-card');
    abs(c1, 620, 200, 580, 170);
    c1.style.setProperty('--card-c', C.exch);
    c1.innerHTML = '<h4>由代谢驱动</h4><p style="line-height:2">血管舒缩活动主要与<b>局部组织的代谢活动</b>有关：代谢↑ → 代谢产物积聚 → 平滑肌舒张 → 血流↑ → 代谢产物被带走 → 又收缩。</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 620, 400, 580, 110);
    c2.innerHTML = '<p style="font-size:13.5px">结果：<b>微循环的血流量和组织的代谢活动水平相适应</b>——闭环负反馈。</p>';
    return { steps: [[big], [c1], [c2]], static: st };
  };

  /* P139 · 微循环物质交换方式 */
  O[139] = function (pageEl, data, api) {
    var st = [titleBar(api, '4 · 微循环物质交换方式', '扩散是主角')];
    var items = [
      ['① 扩散（最重要）', '脂溶性物质（O₂、CO₂）直接透过内皮；<br>非脂溶性物质（Na⁺、Cl⁻、葡萄糖）经内皮缝隙。<br><span style="font-size:12px;color:var(--ink-soft)">速率 ∝ 浓度差 × 通透性 × 有效交换面积，∝ 1/壁厚（扩散距离）</span>', C.exch],
      ['② 滤过和重吸收', '由有效滤过压驱动——<b>在组织液的生成中起重要作用</b>（马上讲，P141）。', C.capac],
      ['③ 吞饮', '内皮细胞吞饮小泡转运——<b>大分子物质</b>走这条路。', C.purple]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90, 165 + i * 150, 1100, 135);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13.5px;line-height:1.9">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P140 · 组织液：体液分布定位（SVG 分解条） */
  O[140] = function (pageEl, data, api) {
    var st = [titleBar(api, '六、组织液', '先定位：组织液在体液里的哪一格？')];
    var svg = '<svg viewBox="0 0 620 260" preserveAspectRatio="none">';
    svg += '<text x="40" y="34" font-size="13" font-weight="700" fill="#3A5A78">体液 = 体重的 60%</text>';
    svg += '<rect x="40" y="50" width="360" height="64" fill="#4d96ff" opacity="0.85"/>' +
      '<rect x="400" y="50" width="180" height="64" fill="#6bcb77" opacity="0.85"/>' +
      '<text x="220" y="86" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">细胞内液 40%</text>' +
      '<text x="490" y="86" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">细胞外液 20%</text>';
    svg += '<line x1="400" y1="114" x2="400" y2="150" stroke="#6bcb77" stroke-width="1.5"/>' +
      '<line x1="580" y1="114" x2="580" y2="150" stroke="#6bcb77" stroke-width="1.5"/>' +
      '<line x1="400" y1="150" x2="580" y2="150" stroke="#6bcb77" stroke-width="1.5"/>';
    svg += '<rect x="400" y="162" width="45" height="52" fill="#d9534f" opacity="0.9"/>' +
      '<rect x="445" y="162" width="135" height="52" fill="#f0a04b" opacity="0.9"/>' +
      '<text x="422" y="192" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">血浆 5%</text>' +
      '<text x="512" y="192" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff">组织液等 ≈15%</text>';
    svg += '<text x="40" y="245" font-size="12" fill="#6b6560">组织液是细胞外液中最大的一格——细胞直接生活的"内环境"，本节主角。</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 120, 160, 860, 360);
    dia.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 120, 545, 860, 80);
    c1.style.setProperty('--card-c', C.elast);
    c1.innerHTML = '<p style="font-size:13.5px">细胞 ⇄ 组织液 ⇄ 血浆：物质交换必须经过组织液这一<b>中转站</b>——它的生成与回流平衡决定内环境稳定。</p>';
    return { steps: [[dia], [c1]], static: st };
  };

  /* P141 · 组织液的生成：有效滤过压公式 */
  O[141] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）组织液的生成', '四个力的较量：有效滤过压 EFP')];
    var f = el(api, '');
    abs(f, 60, 155, 760, 120);
    f.innerHTML = '<div style="text-align:center;font-family:Georgia,serif;font-size:24px;color:#3A5A78;background:rgba(255,253,249,.92);border:1px solid var(--line);border-radius:14px;padding:22px 10px;line-height:1.6">EFP =（<span style="color:#d9534f">毛细血管血压</span>＋<span style="color:#f0a04b">组织液胶体渗透压</span>）−（<span style="color:#4d96ff">血浆胶体渗透压</span>＋<span style="color:#6bcb77">组织液静水压</span>）</div>';
    var legend = el(api, 'x-legend');
    abs(legend, 80, 292, 720);
    legend.innerHTML =
      '<span class="item"><span class="sw" style="background:#d9534f"></span>促进滤过（出）</span>' +
      '<span class="item"><span class="sw" style="background:#f0a04b"></span>促进滤过（出）</span>' +
      '<span class="item"><span class="sw" style="background:#4d96ff"></span>促进重吸收（回）</span>' +
      '<span class="item"><span class="sw" style="background:#6bcb77"></span>促进重吸收（回）</span>';
    var box = picBox(api, picOf(data, 2), 850, 150, 380, 420, '组织液生成与回流示意（mmHg）');
    var note = el(api, 'x-card');
    abs(note, 60, 350, 760, 110);
    note.innerHTML = '<p style="font-size:13.5px;line-height:2"><b>EFP &gt; 0 → 滤过（组织液生成）；EFP &lt; 0 → 重吸收（组织液回流）。</b><br>同一根毛细血管，动脉端和静脉端的"力量对比"不同——下页算给你看。</p>';
    return { steps: [[f], [legend], [note], [box]], static: st };
  };

  /* P142 · EFP 数值演算（英雄页） */
  O[142] = function (pageEl, data, api) {
    var st = [titleBar(api, '有效滤过压 · 数值演算', '动脉端滤过，静脉端重吸收')];
    var svg = '<svg viewBox="0 0 640 240" preserveAspectRatio="none">';
    svg += '<defs><linearGradient id="capg2" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#d9534f"/><stop offset="1" stop-color="#3a5a78"/></linearGradient>' +
      '<marker id="arG" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#6bcb77"/></marker>' +
      '<marker id="arB" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#4d96ff"/></marker></defs>';
    svg += '<path d="M60,120 L580,120" stroke="url(#capg2)" stroke-width="16" stroke-linecap="round" fill="none"/>';
    svg += '<text x="60" y="88" text-anchor="middle" font-size="12.5" font-weight="700" fill="#d9534f">动脉端 30</text>' +
      '<text x="580" y="88" text-anchor="middle" font-size="12.5" font-weight="700" fill="#3a5a78">静脉端 12</text>';
    [150, 230, 300].forEach(function (x) {
      svg += '<line x1="' + x + '" y1="106" x2="' + x + '" y2="58" stroke="#6bcb77" stroke-width="3" marker-end="url(#arG)"/>';
    });
    [400, 480].forEach(function (x) {
      svg += '<line x1="' + x + '" y1="58" x2="' + x + '" y2="106" stroke="#4d96ff" stroke-width="3" marker-end="url(#arB)"/>';
    });
    svg += '<text x="225" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="#6bcb77">滤过（组织液生成）</text>' +
      '<text x="445" y="40" text-anchor="middle" font-size="12" font-weight="700" fill="#4d96ff">重吸收（回流）</text>';
    svg += '<text x="320" y="165" text-anchor="middle" font-size="11.5" fill="#6b6560">毛细血管血压沿程下降 30 → 12 mmHg（血浆胶体渗透压 25、组织液胶体渗透压 15、组织液静水压 10 基本不变）</text>';
    svg += '<text x="320" y="200" text-anchor="middle" font-size="12" fill="#6b6560">生成 &gt; 回流，多余部分经毛细淋巴管回流（见 P146）</text>';
    svg += '</svg>';
    var dia = el(api, 'x-ap');
    abs(dia, 80, 150, 800, 300);
    dia.innerHTML = svg;
    var c1 = el(api, 'x-card');
    abs(c1, 920, 160, 330, 150);
    c1.style.setProperty('--card-c', C.exch);
    c1.innerHTML = '<h4>动脉端</h4><p style="font-family:Georgia,serif;font-size:15px;line-height:1.8">EFP =(30+15)−(25+10)<br>= <b style="color:#6bcb77;font-size:20px">+10 mmHg</b> → 滤过</p>';
    var c2 = el(api, 'x-card');
    abs(c2, 920, 330, 330, 150);
    c2.style.setProperty('--card-c', C.capac);
    c2.innerHTML = '<h4>静脉端</h4><p style="font-family:Georgia,serif;font-size:15px;line-height:1.8">EFP =(12+15)−(25+10)<br>= <b style="color:#4d96ff;font-size:20px">−8 mmHg</b> → 重吸收</p>';
    var note = el(api, 'x-card');
    abs(note, 80, 500, 800, 80);
    note.innerHTML = '<p style="font-size:13px">整根毛细血管看：<b>生成略大于回流</b>——差额去哪了？淋巴系统（P146 揭晓）。</p>';
    return { steps: [[dia], [c1], [c2], [note]], static: st };
  };

  /* P143 · 滤过方程 V = Kf × EFP */
  O[143] = function (pageEl, data, api) {
    var st = [titleBar(api, '滤过方程', 'EFP 决定方向，Kf 决定效率')];
    var f = el(api, '');
    abs(f, 120, 190, 1040, 120);
    f.innerHTML = '<div style="text-align:center;font-family:Georgia,serif;font-size:34px;color:#3A5A78;background:rgba(255,253,249,.92);border:1px solid var(--line);border-radius:14px;padding:24px 0">V = K<sub>f</sub> × EFP</div>';
    var duo = el(api, 'x-duo');
    abs(duo, 120, 350, 1040, 200);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.capac + '"><h4>V</h4><p>单位时间内通过毛细血管壁<b>滤过的液体量</b>。</p></div>' +
      '<div class="col" style="--col-c:' + C.exch + '"><h4>K<sub>f</sub> · 滤过系数</h4><p>取决于毛细血管壁的<b>通透性</b>和<b>有效交换面积</b>——同样 EFP 下，Kf 越大滤过越多。</p></div>';
    return { steps: [[f], [duo]], static: st };
  };

  /* P144 · 术语页：EFP */
  O[144] = function (pageEl, data, api) {
    var st = [titleBar(api, '术语卡片', '把这四个字母记住')];
    var card = el(api, 'x-card');
    abs(card, 240, 220, 800, 240);
    card.style.setProperty('--card-c', C.vein);
    card.innerHTML = '<div style="text-align:center;padding:20px 0">' +
      '<div style="font-family:Georgia,serif;font-size:54px;font-weight:700;color:#3A5A78">EFP</div>' +
      '<p style="font-size:18px;margin-top:14px"><b>Effective Filtration Pressure</b></p>' +
      '<p style="font-size:16px;color:var(--ink-soft);margin-top:6px">有效滤过压</p></div>';
    return { steps: [[card]], static: st };
  };

  /* P145 · 影响组织液形成的因素 */
  O[145] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）影响组织液形成的因素', '每一个失衡都是一种水肿')];
    var items = [
      ['1 · 毛细血管有效流体静压 ↑', '静脉回流受阻（心衰、静脉血栓）→ 毛细血管血压↑ → 生成↑', C.resist],
      ['2 · 有效胶体渗透压 ↓', '血浆蛋白减少（营养不良、肾病综合征丢蛋白）→ 重吸收↓ → 水肿', C.capac],
      ['3 · 毛细血管壁通透性 ↑', '炎症、过敏 → 蛋白漏出到组织液 → 局部水肿', C.elast],
      ['4 · 淋巴回流受阻', '淋巴管堵塞 → 含蛋白液体积聚（P149 淋巴水肿）', C.purple]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90 + (i % 2) * 570, 165 + Math.floor(i / 2) * 205, 530, 175);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13.5px;line-height:1.95">' + it[1] + '</p>';
      steps.push([card]);
    });
    return { steps: steps, static: st };
  };

  /* P146 · 淋巴液的生成和回流 */
  O[146] = function (pageEl, data, api) {
    var st = [titleBar(api, '七、淋巴液的生成和回流', '组织液回流的"辅助系统"')];
    var big = el(api, '');
    abs(big, 70, 180, 480, 220);
    big.innerHTML = '<div style="font-family:Georgia,serif;font-size:64px;font-weight:700;color:#6bcb77;line-height:1">≈120 <span style="font-size:24px">mL/h</span></div><p style="font-size:14.5px;margin-top:14px;line-height:1.9">正常成人安静状态下每小时<br>进入血液循环的淋巴液量。</p>';
    var c1 = el(api, 'x-card');
    abs(c1, 70, 430, 480, 130);
    c1.innerHTML = '<p style="font-size:13.5px;line-height:2">组织液生成 &gt; 毛细血管重吸收的那部分差额（P142），<br>由毛细淋巴管收集 → 淋巴管 → <b>最终回流入静脉血</b>。</p>';
    var box = picBox(api, picOf(data, 4), 620, 150, 600, 460, '人体淋巴系统示意图');
    return { steps: [[big], [box], [c1]], static: st };
  };

  /* P147 · 淋巴的生理功能 */
  O[147] = function (pageEl, data, api) {
    var st = [titleBar(api, '（一）淋巴液生成和回流的生理功能', '三条：回收 · 清除 · 平衡')];
    var items = [
      ['1 · 回收蛋白质、吸收营养物质', '组织液中的蛋白质只能靠淋巴带回血液；肠道吸收的脂肪经淋巴（乳糜）入血', C.exch],
      ['2 · 清除异物', '清除组织中的红细胞、细菌、异物等（淋巴结过滤）', C.resist],
      ['3 · 平衡组织液', '调节组织液的生成和吸收平衡——"溢流阀"', C.capac]
    ];
    var steps = [];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 70, 165 + i * 150, 620, 135);
      card.style.setProperty('--card-c', it[2]);
      card.innerHTML = '<h4>' + it[0] + '</h4><p style="font-size:13px;line-height:1.9">' + it[1] + '</p>';
      steps.push([card]);
    });
    var box = picBox(api, picOf(data, 3), 740, 170, 480, 400, '毛细淋巴管盲端：内皮细胞叠瓦状排列，只允许进不允许出');
    steps.push([box]);
    return { steps: steps, static: st };
  };

  /* P148 · 影响淋巴液生成和回流的因素 */
  O[148] = function (pageEl, data, api) {
    var st = [titleBar(api, '（二）影响淋巴液生成和回流的因素', '动力 = 组织液与淋巴液之间的压力差')];
    var c0 = el(api, 'x-card');
    abs(c0, 90, 155, 1100, 90);
    c0.style.setProperty('--card-c', C.exch);
    c0.innerHTML = '<p style="font-size:14px;line-height:1.8"><b>凡是能增加组织液压力的因素，都能增加淋巴液的生成</b>——所以下面的每一条都在 P145 见过：</p>';
    var items = [
      ['毛细血管血压 ↑', C.resist],
      ['血浆胶体渗透压 ↓', C.capac],
      ['毛细血管壁通透性 ↑', C.elast],
      ['组织液胶体渗透压 ↑', C.purple]
    ];
    var steps = [[c0]];
    items.forEach(function (it, i) {
      var card = el(api, 'x-card');
      abs(card, 90 + i * 285, 290, 265, 130);
      card.style.setProperty('--card-c', it[1]);
      card.innerHTML = '<p style="font-size:14.5px;font-weight:700;text-align:center;line-height:1.7">' + it[0] + '</p>';
      steps.push([card]);
    });
    var arrow = el(api, '');
    abs(arrow, 90, 460, 1100, 80);
    arrow.innerHTML = '<div style="text-align:center;font-size:22px;color:var(--ink-soft)">↓ ↓ ↓ ↓</div><p style="text-align:center;font-size:17px;font-weight:700;color:#6bcb77;margin-top:6px">淋巴液生成 ↑</p>';
    steps.push([arrow]);
    return { steps: steps, static: st };
  };

  /* P149 · 联系临床：淋巴水肿 */
  O[149] = function (pageEl, data, api) {
    var st = [titleBar(api, '联系临床 · 淋巴水肿', '当"溢流阀"被堵死')];
    var c1 = el(api, 'x-card');
    abs(c1, 80, 170, 1120, 150);
    c1.style.setProperty('--card-c', C.resist);
    c1.innerHTML = '<h4>丝虫病 → 淋巴水肿</h4><p style="line-height:2">丝虫病患者的淋巴管被堵塞 → 淋巴回流受阻 → <b>含蛋白质的淋巴液在组织间隙积聚</b> → 淋巴水肿（典型如"象皮肿"）。</p>';
    var duo = el(api, 'x-duo');
    abs(duo, 80, 350, 1120, 220);
    duo.innerHTML =
      '<div class="col" style="--col-c:' + C.capac + '"><h4>原发性淋巴水肿</h4><p><b>先天性 / 早发性</b>：淋巴管发育不全、发育低下或增生等遗传因素。</p></div>' +
      '<div class="col" style="--col-c:' + C.elast + '"><h4>继发性淋巴水肿</h4><p><b>感染性</b>（寄生虫、细菌、真菌）· <b>损伤性</b>（手术、放疗）· <b>恶性肿瘤</b> · 妊娠、全身性疾病等。</p></div>';
    var note = el(api, 'x-card');
    abs(note, 80, 596, 1120, 70);
    note.innerHTML = '<p style="font-size:13px">本节链条回顾：毛细血管滤过 → 组织液 → 毛细淋巴管 → 淋巴回流 → 静脉血——<b>任何一环堵了都是水肿</b>。第三节完。</p>';
    return { steps: [[c1], [duo], [note]], static: st };
  };
})();
