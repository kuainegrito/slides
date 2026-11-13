"""Rebuild bilingual labels without changing either numerical model."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent;D=ROOT/'site/ai/survival-202608';B=ROOT/'work/bilingual-v1/before/site/ai/survival-202608'
s=(B/'neural.js').read_text(encoding='utf8')
s="import {bi,setBi,svgBi} from './bilingual.js?v=20261112-bi1';\n"+s
s=s.replace('const fmt=', '''const PHASES_EN=['Ready','Encode input','Weighted integration','Activate and propagate','Compare scores','Form a judgment'];
const BIO_EN=[
 ['One symbol, two processing systems','Compare biological pathways and one neuron with a fixed-weight teaching network.'],
 ['Light signals become neural signals','The retina processes light. Ganglion-cell spikes travel via the optic nerve and LGN to visual cortex.'],
 ['Multiple synaptic inputs converge','Excitation and inhibition affect membrane potential; timing, location and cell properties shape integration.'],
 ['Integration can trigger a spike at the initial segment','Reaching threshold can generate an action potential. This potential trace is schematic, not a recording.'],
 ['Action potentials propagate along the axon','Signals influence downstream neurons and further processing. One neuron does not recognize the whole symbol.'],
 ['Population activity and experience support recognition','Multilevel distributed networks process shapes. The brain is not directly running the Softmax shown here.']
];
const SVG_EN={'视网膜':'Retina','视神经':'Optic nerve','外侧膝状体':'LGN','视觉皮层':'Visual cortex','后续网络':'Later networks','放大：一个神经元如何传递信号':'One neuron, closer view','兴奋性输入 +':'Excitatory +','抑制性输入 −':'Inhibitory −','树突':'Dendrites','细胞体':'Soma','起始段':'Initial segment','协同处理与辨认':'Population recognition','膜电位 · 阈值':'Potential / threshold','输入 35':'35 inputs','隐藏层 1':'Hidden layer 1','隐藏层 2':'Hidden layer 2','Softmax 概率':'Softmax probabilities','点击修改':'Click to edit','尚未归一化':'Not normalized','分数尚未归一化':'Raw scores','分层前向计算':'Layer-by-layer forward pass'};
const fmt=''' )
s=s.replace('<h1>看见一个字，怎样变成一个判断？</h1>','<h1>${bi("How does a symbol become a decision?","看见一个字，怎样变成一个判断？")}</h1>')
replacements={
 '<button class="nn-original">查看原图</button>':'<button class="nn-original">${bi("Original","查看原图",true)}</button>',
 '同一份视觉输入<small>以原图中的手写数字为例 · 5 × 7 像素</small>':'${bi("One visual input","同一份视觉输入")}<small>${bi("Digit example · 5 × 7 pixels","数字示例 · 5 × 7 像素",true)}</small>',
 '<label>数字 <select':'<label>${bi("Digit","数字",true)} <select',
 '<label class="nn-noise">噪声 ':'<label class="nn-noise">${bi("Noise","噪声",true)} ',
 '>点击右侧像素也能修改输入</span>':'>${bi("Click pixels to edit the input","点击右侧像素也能修改输入")}</span>',
 '${p}</button>':'${bi(PHASES_EN[i+1],p,true)}</button>',
 '<h2>生物神经系统</h2><small>通路与突触整合示意</small>':'<h2>${bi("Biological nervous system","生物神经系统",true)}</h2><small>${bi("Pathway and synaptic integration","通路与突触整合示意",true)}</small>',
 '<span>绿色：兴奋　红色：抑制　金色：放电传递</span>':'<span>${bi("Green: excitation · red: inhibition · gold: spikes","绿色：兴奋　红色：抑制　金色：放电传递")}</span>',
 '<h2>人工神经网络</h2><small>35 → 8 → 6 → 10 · 固定权重</small>':'<h2>${bi("Artificial neural network","人工神经网络",true)}</h2><small>${bi("35 → 8 → 6 → 10 · Fixed weights","35 → 8 → 6 → 10 · 固定权重",true)}</small>',
 '<span>蓝绿：正权重　玫红：负权重 · 点击节点查看计算</span><span>隐藏层：ReLU</span>':'<span>${bi("Blue-green: positive · pink: negative · click a node","蓝绿：正权重　玫红：负权重 · 点击节点查看计算")}</span><span>${bi("Hidden layers: ReLU","隐藏层：ReLU")}</span>',
 '>▶ 播放全过程</button>':'>${bi("▶ Play","播放全过程",true)}</button>',
 '>下一步 →</button>':'>${bi("Next step →","下一步",true)}</button>',
 '>↺ 重置</button>':'>${bi("↺ Reset","重置",true)}</button>',
 '<label>速度 <select':'<label>${bi("Speed","速度",true)} <select',
 '<option value="0.6">慢速</option>':'<option value="0.6">0.6×</option>',
 '<option value="1.6">快进</option>':'<option value="1.6">1.6×</option>',
 '>等待前向传播</output>':'>${bi("Waiting for propagation","等待前向传播",true)}</output>',
 '<span>右侧为合成数字教学网络；概率是模型输出，不代表正确率。演示推理，不更新权重。</span>':'<span>${bi("Synthetic teaching digits; model probabilities are not accuracy. Fixed-weight inference, not training.","右侧为合成数字教学网络；概率是模型输出，不代表正确率。演示推理，不更新权重。")}</span>',
 '>神经传导依据</a>':'>${bi("Neuroscience","神经传导依据")}</a>',
 '>NN 计算说明</a>':'>${bi("NN reference","NN 计算说明")}</a>'}
for a,b in replacements.items():assert a in s,a;s=s.replace(a,b)
s=s.replace("back.textContent='返回动画'","setBi(back,'Back to animation','返回动画',true)")
s=s.replace("const membrane=$('.nn-membrane')",'''for(const t of root.querySelectorAll('.nn-bio-svg text,.nn-network text')){
  const zh=t.textContent;if(SVG_EN[zh]){if(t.classList.contains('nn-layer-name')&&Number(t.getAttribute('y'))<20)t.setAttribute('y','9');svgBi(t,SVG_EN[zh],zh,{enSize:6.8,zhSize:8.4,gap:0});}
 }
 const membrane=$('.nn-membrane')''')
s=s.replace("target.textContent='一次前向传播，权重保持不变';detail.textContent='点击播放，观察输入怎样变成十个分数，再归一化为十类概率。'","setBi(target,'One forward pass; weights stay fixed','一次前向传播，权重保持不变');setBi(detail,'Watch the input become ten scores, then ten normalized class probabilities.','点击播放，观察输入怎样变成十个分数，再归一化为十类概率。')")
s=s.replace("target.textContent='输入：35 个亮度值 x ∈ [0, 1]';detail.textContent=`当前像素总和 ${input.reduce((a,b)=>a+b,0).toFixed(2)}。同一输入送到所有第一层节点，各节点使用不同的权重与偏置。`", "setBi(target,'Input: 35 intensity values x ∈ [0, 1]','输入：35 个亮度值 x ∈ [0, 1]');setBi(detail,`Pixel sum: ${input.reduce((a,b)=>a+b,0).toFixed(2)}. Every first-layer node receives the same input with its own weights and bias.`,`当前像素总和 ${input.reduce((a,b)=>a+b,0).toFixed(2)}。同一输入送到所有第一层节点，各节点使用不同的权重与偏置。`)")
s=s.replace("target.textContent=`P(${k}) = exp(z${k} − m) / Σ exp(zⱼ − m) = ${(result.probabilities[k]*100).toFixed(2)}%`;detail.textContent=`m = max(z) = ${fmt(m)}；分母 = ${fmt(sum,4)}；十类概率和 = ${result.probabilities.reduce((a,b)=>a+b,0).toFixed(4)}。概率高，仍可能判断错误。`", "setBi(target,`P(${k}) = exp(z${k} − m) / Σ exp(zⱼ − m) = ${(result.probabilities[k]*100).toFixed(2)}%`,`数字 ${k} 的模型概率：${(result.probabilities[k]*100).toFixed(2)}%`);setBi(detail,`m = ${fmt(m)}; denominator = ${fmt(sum,4)}; ΣP = 1.0000. High confidence can still be wrong.`,`m = max(z) = ${fmt(m)}；分母 = ${fmt(sum,4)}；十类概率和 = 1.0000。概率高，仍可能判断错误。`)")
s=s.replace("target.textContent=layer<2?", "setBi(target,layer<2?`Layer ${layer+1}, node ${node+1}: z = Σwx + b = ${fmt(c.z)} → ReLU = ${fmt(c.a)}`:`Output ${node}: z = Σwh + b = ${fmt(c.z)} (not a probability)`,layer<2?")
s=s.replace('（尚不是概率）`;','（尚不是概率）`);')
s=s.replace('detail.textContent=`${terms.map', 'const enTerms=terms.map(t=>`(${fmt(t.x)} × ${fmt(t.w)})`).join(" + ")+` ${signed(rest)} (other ${c.terms.length-2} terms) ${signed(c.b)} (bias). Rounded values.`;setBi(detail,enTerms,`${terms.map')
s=s.replace('显示值已四舍五入。`;','显示值已四舍五入。`);')
s=s.replace("normalize.textContent=phase===5?'Σ P = 1.0000':phase===4?'分数尚未归一化':'分层前向计算';", "if(phase===5)normalize.textContent='Σ P = 1.0000';else svgBi(normalize,phase===4?'Raw scores':'Layer-by-layer forward pass',phase===4?'分数尚未归一化':'分层前向计算',{enSize:6.8,zhSize:8,gap:0});")
s=s.replace("$('.nn-caption strong').textContent=BIO[phase][0];$('.nn-caption p').textContent=BIO[phase][1];", "setBi($('.nn-caption strong'),BIO_EN[phase][0],BIO[phase][0]);setBi($('.nn-caption p'),BIO_EN[phase][1],BIO[phase][1]);")
s=s.replace("$('.nn-outcome').textContent=phase===5?`模型判断：${result.prediction} · ${(result.probabilities[result.prediction]*100).toFixed(1)}%`:PHASES[phase];", "setBi($('.nn-outcome'),phase===5?`Model: ${result.prediction} · ${(result.probabilities[result.prediction]*100).toFixed(1)}%`:PHASES_EN[phase],phase===5?`模型判断：${result.prediction} · ${(result.probabilities[result.prediction]*100).toFixed(1)}%`:PHASES[phase],true);")
s=s.replace("$('.nn-play').textContent=running?'Ⅱ 暂停动画':phase===5?'↻ 再播放一次':phase===0?'▶ 播放全过程':'▶ 继续播放';", "setBi($('.nn-play'),running?'Ⅱ Pause':phase===5?'↻ Replay':phase===0?'▶ Play':'▶ Resume',running?'暂停动画':phase===5?'再播放一次':phase===0?'播放全过程':'继续播放',true);")
(D/'neural.js').write_text(s,encoding='utf8')

s=(B/'gradient.js').read_text(encoding='utf8');s="import {bi,setBi,INK,PURPLE} from './bilingual.js?v=20261112-bi1';\n"+s
replacements={
 '<h1>眼前已到谷底，别的维度呢？</h1>':'<h1>${bi("At the bottom here—what about the other dimensions?","眼前已到谷底，别的维度呢？")}</h1>',
 '<button class="gl-original">查看原图</button>':'<button class="gl-original">${bi("Original","查看原图",true)}</button>',
 '<div class="gl-view">观察方向 ':'<div class="gl-view">${bi("View axes","观察方向",true)} ',
 '>拖动旋转 · 方向键也可操作</span>':'>${bi("Drag or use arrow keys","拖动旋转 · 方向键也可操作")}</span>',
 '<span>双参数切片 · 其余 6 个参数固定在当前值</span>':'<span>${bi("Two-parameter slice; six parameters fixed","双参数切片 · 其余 6 个参数固定在当前值")}</span>',
 '<b>● 当前参数　◇ 切片谷底</b>':'<b>${bi("● Current point ◇ Slice minimum","● 当前参数　◇ 切片谷底")}</b>',
 '<h2>8 个方向，都有自己的坡度</h2>':'<h2>${bi("Each of 8 directions has a slope","8 个方向，都有自己的坡度")}</h2>',
 '<span>所见两维梯度 <b':'<span>${bi("Visible gradient","所见两维梯度")} <b',
 '<span>全部梯度 <b':'<span>${bi("Full gradient","全部梯度")} <b',
 '<span>总损失 L · 第 <span class="gl-count">0</span> 步</span>':'<span>${bi("Total loss L · step","总损失 L · 步数",true)} <span class="gl-count">0</span></span>',
 '>走一步 →</button>':'>${bi("Step →","走一步",true)}</button>',
 '>连续下降</button>':'>${bi("Run","连续下降",true)}</button>',
 '>重置起点</button>':'>${bi("Reset","重置起点",true)}</button>',
 '<option value="all">更新全部 8 维</option><option value="visible">仅更新所见 2 维</option></select></label>':'<option value="all">Update all 8</option><option value="visible">Visible 2 only</option></select><span class="gl-mode-zh lang-zh">更新全部 8 维</span></label>',
 '<label class="gl-rate">学习率 η ':'<label class="gl-rate">${bi("Learning rate η","学习率",true)} ',
 '<span>这是 8 维凸函数的教学模型；真实网络可含海量参数与非凸损失。<br>3D 显示的是「两个参数 + 损失」，不是把 8 维直接画成三维。</span>':'<span>${bi("An 8D convex teaching model. Real networks may have many parameters and nonconvex losses. The 3D view shows two parameters plus loss, not all eight dimensions.","这是 8 维凸函数的教学模型；真实网络可含海量参数与非凸损失。3D 显示的是「两个参数 + 损失」，不是把 8 维直接画成三维。")}</span>'}
for a,b in replacements.items():assert a in s,a;s=s.replace(a,b)
s=s.replace("back.textContent='返回互动'","setBi(back,'Back to interaction','返回互动',true)")
s=s.replace("ctx.fillStyle='#915b4c';ctx.fillText('当前点超出固定视野 · 查看右侧损失',280,64);", "ctx.fillStyle=INK;ctx.fillText('Point outside the view; see total loss',280,54);ctx.fillStyle=PURPLE;ctx.fillText('当前点超出固定视野 · 查看右侧损失',280,69);")
s=s.replace("$('.gl-explain').textContent=`偏导 ∂L/∂wᵢ · 共同刻度 ±${barMax} · 紫色为所见两维`;", "setBi($('.gl-explain'),`Partials ∂L/∂wᵢ · scale ±${barMax} · purple: visible axes`,`偏导 ∂L/∂wᵢ · 共同刻度 ±${barMax} · 紫色为所见两维`);")
en={
'步子太大，损失反而上升':'The step is too large; loss rises','把学习率调小，再从起点比较。':'Lower the learning rate and compare from the same start.',
'8 个方向的坡度都接近零':'All 8 slopes are nearly zero','这个凸函数的唯一全局最小值为 L = 0。':'This convex function has a unique global minimum at L = 0.',
'只走这两维，会停在这里':'Updating only these two dimensions stops here','切换“更新全部 8 维”，寻找看不见的下降方向。':'Update all 8 dimensions to find hidden descent directions.',
'二维看似到底，八维仍能下降':'The visible slice is at its minimum; 8D can still descend','点“走一步”：前两个参数不动，总损失仍下降。':'Take one step: the first two parameters stay still while total loss falls.',
'只沿所见方向走，其余参数固定':'Only visible parameters move; the others stay fixed','切换观察方向，可以查看其他参数的坡度。':'Change the viewing axes to inspect other slopes.',
'切片在变，八维损失函数始终相同':'The slice changes; the same 8D loss function remains','其余参数在更新；换两个方向看同一个位置。':'Other parameters are updating. View the same point along another pair of axes.'}
s=s.replace("function insight(){", "const INSIGHT_EN="+repr(en).replace("'",'"')+";\n  function insight(){")
s=s.replace("$('.gl-insight strong').textContent=title;$('.gl-insight span').textContent=detail;", "setBi($('.gl-insight strong'),INSIGHT_EN[title],title);setBi($('.gl-insight>span'),INSIGHT_EN[detail.replace(' 视野已扩大。','')]+(detail.includes('视野已扩大')?' The view has expanded.':''),detail);")
s=s.replace("$('.gl-auto').textContent='连续下降'","setBi($('.gl-auto'),'Run','连续下降',true)")
s=s.replace("$('.gl-auto').textContent=auto?'暂停下降':'连续下降'", "setBi($('.gl-auto'),auto?'Pause':'Run',auto?'暂停下降':'连续下降',true)")
s=s.replace("mode=e.target.value;reset();", "mode=e.target.value;$('.gl-mode-zh').textContent=mode==='all'?'更新全部 8 维':'仅更新所见 2 维';reset();")
(D/'gradient.js').write_text(s,encoding='utf8')
print('Rebuilt bilingual neural/gradient interfaces')
