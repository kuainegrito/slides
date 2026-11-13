import {bi,setBi,svgBi} from './bilingual.js?v=20261112-bi4';
import {MODEL,forward,inputFor,contributions} from './neural-model.js?v=20261111-nn1';

const NS='http://www.w3.org/2000/svg';
const PHASES=['准备观察','① 编码输入','② 加权整合','③ 激活与传播','④ 比较输出','⑤ 形成判断'];
const BIO=[
 ['同一个符号，两种处理方式','左侧看生物通路与一个神经元；右侧看固定权重的数字教学网络。'],
 ['光信号 → 神经信号','视网膜处理光信号；节细胞的动作电位经视神经、外侧膝状体传向视觉皮层。'],
 ['多个突触输入汇聚','兴奋性与抑制性输入共同影响膜电位；时间、位置和细胞特性都会影响整合。'],
 ['整合后，在轴突起始段触发放电','达到阈值可产生动作电位。示意曲线展示“突触电位 → 放电”，不是实测记录。'],
 ['动作电位沿轴突传递','信号影响后续神经元，多个层级继续处理。一个神经元并不独自读懂整个符号。'],
 ['群体活动与经验支持辨认','形状信息在多级、分布式网络中被处理。人脑不在这里直接执行右侧的 Softmax。']
];
const PHASES_EN=['Ready','Encode input','Weighted integration','Activate and propagate','Compare scores','Form a judgment'];
const BIO_EN=[
 ['One symbol, two processing systems','Compare biological pathways and one neuron with a fixed-weight teaching network.'],
 ['Light signals become neural signals','The retina processes light. Ganglion-cell spikes travel via the optic nerve and LGN to visual cortex.'],
 ['Multiple synaptic inputs converge','Excitation and inhibition affect membrane potential; timing, location and cell properties shape integration.'],
 ['Integration can trigger a spike at the initial segment','Reaching threshold can generate an action potential. This potential trace is schematic, not a recording.'],
 ['Action potentials propagate along the axon','Signals influence downstream neurons and further processing. One neuron does not recognize the whole symbol.'],
 ['Population activity and experience support recognition','Multilevel distributed networks process shapes. The brain is not directly running the Softmax shown here.']
];
const SVG_EN={'视网膜':'Retina','视神经':'Optic nerve','外侧膝状体':'LGN','视觉皮层':'Visual cortex','后续网络':'Later networks','放大：一个神经元如何传递信号':'One neuron, closer view','兴奋性输入 +':'Excitatory +','抑制性输入 −':'Inhibitory −','树突':'Dendrites','细胞体':'Soma','起始段':'Initial segment','协同处理与辨认':'Population recognition','膜电位 · 阈值':'Potential / threshold','输入 35':'35 inputs','隐藏层 1':'Hidden layer 1','隐藏层 2':'Hidden layer 2','Softmax 概率':'Softmax probabilities','点击修改':'Click to edit','尚未归一化':'Not normalized','分数尚未归一化':'Raw scores','分层前向计算':'Layer-by-layer forward pass'};
const fmt=(v,n=2)=>Math.abs(v)<.00001?'0':v.toFixed(n);
const signed=v=>v<0?'−'+fmt(-v):'+'+fmt(v);
function svgEl(name,attrs={},parent){const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent?.append(e);return e;}
function label(parent,x,y,text,cls){const e=svgEl('text',{x,y,...(cls?{class:cls}:{})},parent);e.textContent=text;return e;}
function bioMarkup(){return `<svg class="nn-bio-svg" viewBox="0 0 374 208" aria-label="生物视觉通路与突触整合动画示意">
 <defs><radialGradient id="nn-soma"><stop stop-color="#fff3c2"/><stop offset=".6" stop-color="#f0ce7a"/><stop offset="1" stop-color="#dfb461"/></radialGradient></defs>
 <g class="nn-bio-muted" data-bio="1">
  <path class="nn-bio-link" data-flow="1" d="M54 28 C76 24 82 28 107 28 S157 28 180 28 S236 28 262 28"/>
  <path d="M14 28 Q33 4 54 28 Q33 50 14 28Z" fill="#f5fbfd" stroke="#739cba" stroke-width="1.3"/><circle cx="35" cy="28" r="9" fill="#a5c9d7" stroke="#5c8ba6"/><circle cx="35" cy="28" r="4.5" fill="#325a75"/>
  <ellipse cx="121" cy="28" rx="17" ry="13" fill="#e4e9f5" stroke="#8b91b9"/><path d="M112 20L129 20 M111 25L131 25 M111 30L131 30 M113 35L128 35" stroke="#9aa4bf"/>
  <path class="nn-cortex" d="M185 12 Q195 3 201 13 Q212 5 217 18 Q232 15 231 30 Q229 42 218 41 Q207 48 200 40 Q185 46 182 34 Q174 22 185 12Z"/><path d="M190 15 Q201 19 192 27 Q206 25 204 37 M215 16Q206 22 218 31" fill="none" stroke="#94b1c8"/>
  <ellipse cx="294" cy="28" rx="30" ry="17" fill="#eef3f8" stroke="#9eb7cb"/>
  <g fill="#7898b9"><circle cx="283" cy="22" r="3"/><circle cx="302" cy="18" r="3"/><circle cx="297" cy="34" r="3"/><circle cx="278" cy="34" r="3"/><circle cx="311" cy="29" r="3"/></g><path d="M283 22L302 18L297 34L278 34L283 22L311 29L297 34" fill="none" stroke="#b0c3d6"/>
  <text x="15" y="61" fill="#567893">视网膜</text><text x="68" y="19" font-size="8" fill="#8295a7">视神经</text><text x="99" y="61" fill="#567893">外侧膝状体</text><text x="184" y="61" fill="#567893">视觉皮层</text><text x="268" y="61" fill="#567893">后续网络</text>
 </g>
 <path d="M205 69L196 78" stroke="#b4c7d8" stroke-dasharray="2 2"/><text x="207" y="79" font-size="9" fill="#8095a7">放大：一个神经元如何传递信号</text>
 <g class="nn-bio-muted" data-bio="2">
  <path class="nn-syn nn-excite" data-flow="2" d="M24 90 C55 85 61 94 89 95 S143 98 173 121"/><path class="nn-syn nn-excite" data-flow="2" d="M24 110 C61 105 87 118 125 116 S156 120 176 132"/>
  <path class="nn-syn nn-inhibit" data-flow="2" d="M24 147 C69 150 93 128 123 140 S155 143 175 139"/>
  <g fill="#ebf6e9" stroke="#72a675"><circle cx="27" cy="90" r="6"/><circle cx="27" cy="110" r="6"/></g><g fill="#fae9ef" stroke="#c78194"><circle cx="27" cy="147" r="6"/></g>
  <text x="24" y="94" font-size="11" fill="#4b8b55">+</text><text x="24" y="114" font-size="11" fill="#4b8b55">+</text><text x="24" y="150" font-size="11" fill="#bc6b82">−</text>
  <path class="nn-syn nn-excite" d="M174 120L162 105L153 89M162 105L139 98M153 89L156 80M174 125L147 118L136 108M147 118L132 124M181 118L184 98L174 88M184 98L196 87"/>
  <path class="nn-syn nn-inhibit" d="M173 139L149 150L139 166M149 150L133 153M181 144L171 164L158 174M171 164L181 177"/>
  <circle cx="94" cy="96" r="3" fill="#78a976"/><circle cx="124" cy="116" r="3" fill="#78a976"/><circle cx="124" cy="140" r="3" fill="#c98194"/>
  <text x="45" y="86" font-size="10" fill="#5a9262">兴奋性输入 +</text><text x="45" y="164" font-size="10" fill="#b5687e">抑制性输入 −</text><text x="130" y="186" font-size="9" fill="#7b90a4">树突</text>
 </g>
 <path class="nn-axon nn-bio-muted" data-bio="4" data-flow="4" d="M202 132 C223 133 226 144 246 140 S277 112 301 130 L321 127"/>
 <path class="nn-syn nn-bio-muted" data-bio="4" d="M301 130L321 112 M306 131L330 139 M319 127L339 121" stroke="#c7a25b"/>
 <g class="nn-bio-muted" data-bio="3"><path d="M176 118Q185 108 193 120L204 130Q204 141 193 147Q180 148 174 139Q166 128 176 118Z" fill="url(#nn-soma)" stroke="#c3984a"/><circle cx="186" cy="131" r="6.5" fill="#d99745" stroke="#bd8547"/><ellipse class="nn-gate" cx="207" cy="133" rx="7" ry="3.7"/><text x="179" y="163" font-size="10" fill="#8d7549">细胞体</text><text x="215" y="165" font-size="9" fill="#8d7549">起始段</text></g>
 <g class="nn-bio-muted" data-bio="5"><path d="M326 93L348 105L337 120L354 141L329 149L322 128Z" fill="none" stroke="#b7a1cc"/><g fill="#9e86ba" stroke="#8b71a6"><circle cx="326" cy="93" r="4"/><circle cx="348" cy="105" r="4"/><circle cx="337" cy="120" r="5"/><circle cx="354" cy="141" r="4"/><circle cx="329" cy="149" r="4"/><circle cx="322" cy="128" r="4"/></g><text x="288" y="181" font-size="10" fill="#89729f">协同处理与辨认</text></g>
 <g data-bio="3" class="nn-bio-muted"><path d="M15 196H114" stroke="#c3d3de"/><path class="nn-threshold" d="M15 183H114"/><text x="17" y="177" font-size="8" fill="#8594a3">膜电位 · 阈值</text><path class="nn-membrane" d="M15 196L24 196Q28 185 33 190Q38 192 43 186Q48 177 52 182L57 187Q62 180 66 181L70 185L74 180L78 171L80 169L82 196L86 200L93 196L114 196"/></g>
 </svg>`;}

export function mountNeural(host,originalSVG){
 const root=document.createElement('section');root.className='neural-lab';root.setAttribute('aria-label','神经传导与人工神经网络前向传播互动');
 root.innerHTML=`<div class="nn-frame">
  <header class="nn-header"><div><h1>${bi("How does a symbol become a decision?","看见一个字，怎样变成一个判断？")}</h1><p>Biological signaling × Neural network forward propagation</p></div><button class="nn-original">${bi("Original","查看原图",true)}</button></header>
  <div class="nn-inputs"><svg class="nn-mini" viewBox="0 0 25 35" aria-label="当前输入数字"></svg><div class="nn-input-label">${bi("One visual input","同一份视觉输入")}<small>${bi("Digit example · 5 × 7 pixels","数字示例 · 5 × 7 像素",true)}</small></div><label>${bi("Digit","数字",true)} <select class="nn-digit" aria-label="输入数字">${[8,6,9,0,1,2,3,4,5,7].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></label><label class="nn-noise">${bi("Noise","噪声",true)} <input type="range" min="0" max="1" step="0.05" value="0" aria-label="输入噪声"><output>0%</output></label><span class="nn-tip">${bi("Click pixels to edit the input","点击右侧像素也能修改输入")}</span></div>
  <nav class="nn-steps" aria-label="传播步骤">${PHASES.slice(1).map((p,i)=>`<button data-phase="${i+1}">${bi(PHASES_EN[i+1],p,true)}</button>`).join('')}</nav>
  <div class="nn-body"><section class="nn-panel nn-bio"><div class="nn-panel-head"><h2>${bi("Biological nervous system","生物神经系统",true)}</h2><small>${bi("Pathway and synaptic integration","通路与突触整合示意",true)}</small></div>${bioMarkup()}<div class="nn-panel-note"><span>${bi("Green: excitation · red: inhibition · gold: spikes","绿色：兴奋　红色：抑制　金色：放电传递")}</span></div></section>
  <section class="nn-panel nn-ai"><div class="nn-panel-head"><h2>${bi("Artificial neural network","人工神经网络",true)}</h2><small>${bi("35 → 8 → 6 → 10 · Fixed weights","35 → 8 → 6 → 10 · 固定权重",true)}</small></div><svg class="nn-network" viewBox="0 0 534 208" aria-label="可点击节点的三层计算网络和十类输出概率"></svg><div class="nn-panel-note"><span>${bi("Blue-green: positive · pink: negative · click a node","蓝绿：正权重　玫红：负权重 · 点击节点查看计算")}</span><span>${bi("Hidden layers: ReLU","隐藏层：ReLU")}</span></div></section></div>
  <div class="nn-explainer"><div class="nn-caption" aria-live="polite"><strong></strong><p></p></div><div class="nn-calculation"><strong></strong><p></p></div></div>
  <div class="nn-controls"><button class="nn-play" aria-pressed="false">${bi("▶ Play","播放全过程",true)}</button><button class="nn-step">${bi("Next step →","下一步",true)}</button><button class="nn-reset">${bi("↺ Reset","重置",true)}</button><label>${bi("Speed","速度",true)} <select class="nn-speed" aria-label="动画速度"><option value="1">1×</option><option value="0.6">0.6×</option><option value="1.6">1.6×</option></select></label><output class="nn-outcome" aria-live="polite">${bi("Waiting for propagation","等待前向传播",true)}</output></div>
  <footer class="nn-footer"><span>${bi("Synthetic teaching digits; model probabilities are not accuracy. Fixed-weight inference, not training.","右侧为合成数字教学网络；概率是模型输出，不代表正确率。演示推理，不更新权重。")}</span><span><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6672514/" target="_blank" rel="noopener noreferrer">${bi("Neuroscience","神经传导依据")}</a> · <a href="https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html" target="_blank" rel="noopener noreferrer">${bi("NN reference","NN 计算说明")}</a></span></footer>
 </div>`;
 const original=document.createElement('div');original.className='nn-hidden';original.style.cssText='position:absolute;inset:0';original.innerHTML=originalSVG;
 const back=document.createElement('button');back.className='nn-return';setBi(back,'Back to animation','返回动画',true);original.append(back);host.replaceChildren(root,original);
 const $=s=>root.querySelector(s),frame=$('.nn-frame'),network=$('.nn-network');
 let digit=8,noise=0,input=inputFor(8),result=forward(input),phase=0,progress=0,running=false,disposed=false,raf=0,lastTime=0,speed=1,selected={layer:0,node:0},custom=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-paused');
 const nodeEls=[],wireEls=[],pixelEls=[],probEls=[],particles=[];
 const positions=[Array.from({length:35},(_,i)=>[23+i%5*9,43+Math.floor(i/5)*18]),Array.from({length:8},(_,i)=>[139,28+i*21]),Array.from({length:6},(_,i)=>[237,40+i*25]),Array.from({length:10},(_,i)=>[350,22+i*17.5])];
 const wireGroup=svgEl('g',{},network),nodeGroup=svgEl('g',{},network),particleGroup=svgEl('g',{},network);
 for(let layer=0;layer<3;layer++)for(let j=0;j<positions[layer+1].length;j++)for(let i=0;i<positions[layer].length;i++){
  const [x,y]=positions[layer][i],[tx,ty]=positions[layer+1][j],w=MODEL.weights[layer][j][i];
  const path=svgEl('path',{d:`M${x} ${y} C${x+35} ${y} ${tx-35} ${ty} ${tx} ${ty}`,class:'nn-wire','data-sign':w<0?'negative':'positive'},wireGroup);
  wireEls.push({el:path,layer,i,j,w});
  // A small subset of traveling dots keeps all connections readable.
  if(i===j%positions[layer].length||i===(j*3+2)%positions[layer].length){const dot=svgEl('circle',{r:2.1,class:'nn-dot',fill:w<0?'#c87d98':'#4aabba'},particleGroup);dot.style.fill=w<0?'#c87d98':'#4aabba';particles.push({el:dot,path,phase:layer+2,offset:(j*.13+i*.07)%1});}
 }
 for(let i=0;i<35;i++){
  const [x,y]=positions[0][i];const pixel=svgEl('rect',{x:x-3.7,y:y-7,width:7.4,height:14,rx:1,class:'nn-pixel',tabindex:0,role:'button','aria-label':`切换像素 ${i+1}`},nodeGroup);
  const edit=()=>{input[i]=input[i]>.5?0:1;custom=true;changed(false);};pixel.addEventListener('click',edit);pixel.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();edit();}});pixelEls.push(pixel);
  svgEl('rect',{x:i%5*5,y:Math.floor(i/5)*5,width:4.4,height:4.4,rx:.6},$('.nn-mini'));
 }
 for(let layer=0;layer<3;layer++)for(let j=0;j<positions[layer+1].length;j++){
  const [x,y]=positions[layer+1][j];const g=svgEl('g',{class:'nn-node-group',tabindex:0,role:'button','aria-label':layer<2?`隐藏层 ${layer+1} 节点 ${j+1} 的计算`:`数字 ${j} 的输出计算`},nodeGroup);
  const circle=svgEl('circle',{cx:x,cy:y,r:layer<2?10:6.5,class:'nn-node'},g);const value=label(g,x,y,'·','nn-node-value');
  const select=()=>{stop();selected={layer,node:j};setPhase(layer+2,1);};g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();select();}});
  nodeEls.push({el:g,circle,value,layer,j});
 }
 label(network,40,14,'输入 35','nn-layer-name');label(network,139,14,'隐藏层 1','nn-layer-name');label(network,237,14,'隐藏层 2','nn-layer-name');label(network,326,10,'logits','nn-layer-name');label(network,451,10,'Softmax 概率','nn-layer-name');
 label(network,40,187,'点击修改','nn-layer-name');
 for(let j=0;j<10;j++){
  const y=22+j*17.5,g=svgEl('g',{class:'nn-prob-row'},network);
  label(g,366,y+3.5,String(j),'nn-prob-label');const logit=label(g,335,y+3.1,'—','nn-logit-value');
  svgEl('rect',{x:383,y:y-4,width:83,height:8,rx:3,fill:'#dfe8f0'},g);
  const bar=svgEl('rect',{x:383,y:y-4,width:0,height:8,rx:3,class:'nn-prob-bar'},g),value=label(g,473,y+3.5,'—','nn-prob-label');probEls.push({el:g,bar,value,logit});
 }
 const normalize=label(network,399,199,'尚未归一化','nn-legend');
 for(const path of root.querySelectorAll('[data-flow]')){
  const svg=path.closest('svg'),dot=svgEl('circle',{r:2.8,class:'nn-dot nn-bio-dot'},svg);particles.push({el:dot,path,phase:Number(path.dataset.flow),offset:0});
 }
 for(const p of particles){p.length=p.path.getTotalLength();}
 for(const t of root.querySelectorAll('.nn-bio-svg text,.nn-network text')){
  const zh=t.textContent;if(SVG_EN[zh]){if(t.classList.contains('nn-layer-name')&&Number(t.getAttribute('y'))<20)t.setAttribute('y','9');svgBi(t,SVG_EN[zh],zh,{enSize:6.8,zhSize:8.4,gap:0});}
 }
 const membrane=$('.nn-membrane'),membraneLength=membrane.getTotalLength();membrane.style.strokeDasharray=String(membraneLength);
 function resize(){frame.style.transform=`scale(${host.clientWidth/960})`;}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function paintInput(){
  input.forEach((x,i)=>{const c=Math.round(248-x*202);pixelEls[i].setAttribute('fill',`rgb(${c},${Math.min(252,c+12)},${Math.min(255,c+24)})`);pixelEls[i].setAttribute('aria-pressed',String(x>.5));pixelEls[i].setAttribute('aria-label',`切换像素 ${i+1}，值 ${x.toFixed(2)}`);$('.nn-mini').children[i].setAttribute('fill',`rgba(38,65,92,${.05+x*.95})`);});
  $('.nn-mini').setAttribute('aria-label',`${custom?'已编辑的':'合成教学'}数字 ${digit}，噪声 ${Math.round(noise*100)}%`);
 }
 function mathText(){
  const target=$('.nn-calculation strong'),detail=$('.nn-calculation p');
  if(phase===0){setBi(target,'One forward pass; weights stay fixed','一次前向传播，权重保持不变');setBi(detail,'Watch the input become ten scores, then ten normalized class probabilities.','点击播放，观察输入怎样变成十个分数，再归一化为十类概率。');return;}
  if(phase===1){setBi(target,'Input: 35 intensity values x ∈ [0, 1]','输入：35 个亮度值 x ∈ [0, 1]');setBi(detail,`Pixel sum: ${input.reduce((a,b)=>a+b,0).toFixed(2)}. Every first-layer node receives the same input with its own weights and bias.`,`当前像素总和 ${input.reduce((a,b)=>a+b,0).toFixed(2)}。同一输入送到所有第一层节点，各节点使用不同的权重与偏置。`);return;}
  if(phase===5){const k=result.prediction,m=Math.max(...result.logits),sum=result.logits.reduce((s,z)=>s+Math.exp(z-m),0);setBi(target,`P(${k}) = exp(z${k} − m) / Σ exp(zⱼ − m) = ${(result.probabilities[k]*100).toFixed(2)}%`,`数字 ${k} 的模型概率：${(result.probabilities[k]*100).toFixed(2)}%`);setBi(detail,`m = ${fmt(m)}; denominator = ${fmt(sum,4)}; ΣP = 1.0000. High confidence can still be wrong.`,`m = max(z) = ${fmt(m)}；分母 = ${fmt(sum,4)}；十类概率和 = 1.0000。概率高，仍可能判断错误。`);return;}
  const layer=Math.min(selected.layer,phase-2),node=layer===selected.layer?selected.node:0,c=contributions(result,layer,node),name=layer<2?`h${layer+1} 的第 ${node+1} 个节点`:`输出 ${node}`;
  setBi(target,layer<2?`Layer ${layer+1}, node ${node+1}: z = Σwx + b = ${fmt(c.z)} → ReLU = ${fmt(c.a)}`:`Output ${node}: z = Σwh + b = ${fmt(c.z)} (not a probability)`,layer<2?`${name}：z = Σwx + b = ${fmt(c.z)} → ReLU(z) = ${fmt(c.a)}`:`${name}：z = Σwh + b = ${fmt(c.z)}（尚不是概率）`);
  const terms=[...c.terms].sort((a,b)=>Math.abs(b.product)-Math.abs(a.product)).slice(0,2),rest=c.terms.reduce((s,t)=>s+t.product,0)-terms.reduce((s,t)=>s+t.product,0);
  const enTerms=terms.map(t=>`(${fmt(t.x)} × ${fmt(t.w)})`).join(" + ")+` ${signed(rest)} (other ${c.terms.length-2} terms) ${signed(c.b)} (bias). Rounded values.`;setBi(detail,enTerms,`${terms.map(t=>`(${fmt(t.x)} × ${fmt(t.w)})`).join(' + ')} ${signed(rest)}（其余 ${c.terms.length-2} 项） ${signed(c.b)}（偏置）。显示值已四舍五入。`);
 }
 function render(){
  root.dataset.phase=String(phase);root.dataset.running=String(running);
  for(const b of root.querySelectorAll('[data-phase]')){const n=Number(b.dataset.phase);b.dataset.done=String(phase>=n);if(n===phase)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
  for(const g of root.querySelectorAll('[data-bio]'))g.classList.toggle('nn-bio-lit',Number(g.dataset.bio)<=phase);
  const values=[result.a1,result.a2,result.logits];
  for(const node of nodeEls){const active=phase>=node.layer+2,v=values[node.layer][node.j];node.el.dataset.selected=String(selected.layer===node.layer&&selected.node===node.j);node.circle.setAttribute('fill',active?(node.layer===2?'#e9ddf4':`rgba(110,156,184,${.12+Math.min(Math.max(v,0)/4,1)*.68})`):'#f5f9fc');node.value.textContent=active?(node.layer<2?fmt(v,1):String(node.j)):'·';node.el.setAttribute('aria-label',node.layer<2?`隐藏层 ${node.layer+1} 节点 ${node.j+1}，激活值 ${active?fmt(v,4):'尚未计算'}`:`数字 ${node.j} 输出，logit ${active?fmt(v,4):'尚未计算'}`);}
  for(const wire of wireEls){wire.el.classList.toggle('nn-wire-active',phase>=wire.layer+2);wire.el.classList.toggle('nn-wire-selected',phase>=wire.layer+2&&selected.layer===wire.layer&&selected.node===wire.j);}
  for(let j=0;j<10;j++){const p=probEls[j];p.logit.textContent=phase>=4?fmt(result.logits[j],1):'—';p.value.textContent=phase>=5?(result.probabilities[j]*100).toFixed(1)+'%':'—';p.bar.setAttribute('width',phase>=5?83*result.probabilities[j]:0);p.el.dataset.winner=String(phase>=5&&result.prediction===j);}
  if(phase===5)normalize.textContent='Σ P = 1.0000';else svgBi(normalize,phase===4?'Raw scores':'Layer-by-layer forward pass',phase===4?'分数尚未归一化':'分层前向计算',{enSize:6.8,zhSize:8,gap:0});
  setBi($('.nn-caption strong'),BIO_EN[phase][0],BIO[phase][0]);setBi($('.nn-caption p'),BIO_EN[phase][1],BIO[phase][1]);
  setBi($('.nn-outcome'),phase===5?`Model: ${result.prediction} · ${(result.probabilities[result.prediction]*100).toFixed(1)}%`:PHASES_EN[phase],phase===5?`模型判断：${result.prediction} · ${(result.probabilities[result.prediction]*100).toFixed(1)}%`:PHASES[phase],true);
  $('.nn-step').disabled=phase===5;mathText();animatePaths();
 }
 function animatePaths(){
  for(const p of particles){const active=phase===p.phase&&running&&!reduced();p.el.style.opacity=active?'.95':'0';if(active){const t=(progress*2+p.offset)%1,point=p.path.getPointAtLength(t*p.length);p.el.setAttribute('cx',point.x);p.el.setAttribute('cy',point.y);}}
  membrane.style.strokeDashoffset=String(membraneLength*(phase<3?1:phase===3?1-progress:0));
  $('.nn-gate').classList.toggle('nn-firing',phase===3&&progress>.55&&progress<.95||phase===4&&running);
 }
 function updatePlay(){root.dataset.running=String(running);setBi($('.nn-play'),running?'Ⅱ Pause':phase===5?'↻ Replay':phase===0?'▶ Play':'▶ Resume',running?'暂停动画':phase===5?'再播放一次':phase===0?'播放全过程':'继续播放',true);$('.nn-play').setAttribute('aria-pressed',String(running));}
 function stop(){running=false;cancelAnimationFrame(raf);raf=0;updatePlay();animatePaths();}
 function setPhase(n,p=0){phase=n;progress=p;lastTime=0;if(n>=2&&n<=4&&selected.layer!==n-2)selected={layer:n-2,node:0};render();updatePlay();}
 function tick(now){
  if(disposed||!running||document.hidden)return;
  if(reduced()){stop();return;}
  const dt=lastTime?Math.min(100,now-lastTime):0;lastTime=now;progress+=dt*speed/(phase===0?800:3300);
  if(progress>=1){if(phase===5){progress=1;stop();render();return;}setPhase(phase+1,0);}
  else animatePaths();
  raf=requestAnimationFrame(tick);
 }
 function play(){
  if(running){stop();return;}
  if(reduced()){setPhase(phase===5?1:phase+1,1);return;}
  if(phase===5)setPhase(0,0);else if(progress>=1){setPhase(Math.min(5,phase+1),0);}
  running=true;lastTime=0;updatePlay();raf=requestAnimationFrame(tick);
 }
 function changed(replaceInput=true){
  stop();if(replaceInput){input=inputFor(digit,noise);custom=false;}result=forward(input);selected={layer:0,node:0};paintInput();setPhase(0,0);
 }
 $('.nn-digit').addEventListener('change',e=>{digit=Number(e.target.value);changed();});
 $('.nn-noise input').addEventListener('input',e=>{noise=Number(e.target.value);$('.nn-noise output').textContent=Math.round(noise*100)+'%';changed();});
 $('.nn-speed').addEventListener('change',e=>{speed=Number(e.target.value);});
 $('.nn-play').addEventListener('click',play);
 $('.nn-step').addEventListener('click',()=>{stop();setPhase(Math.min(5,phase+1),1);});
 $('.nn-reset').addEventListener('click',()=>{noise=0;$('.nn-noise input').value='0';$('.nn-noise output').textContent='0%';changed();});
 for(const b of root.querySelectorAll('[data-phase]'))b.addEventListener('click',()=>{stop();setPhase(Number(b.dataset.phase),1);});
 $('.nn-original').addEventListener('click',()=>{stop();root.classList.add('nn-hidden');original.classList.remove('nn-hidden');back.focus();});
 back.addEventListener('click',()=>{original.classList.add('nn-hidden');root.classList.remove('nn-hidden');$('.nn-original').focus();resize();});
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 const motion=()=>{if(reduced())stop();};const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');motionQuery.addEventListener('change',motion);
 const motionObserver=new MutationObserver(motion);motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 paintInput();render();if(!reduced()&&!document.hidden)play();
 return()=>{disposed=true;stop();observer.disconnect();motionObserver.disconnect();document.removeEventListener('visibilitychange',hidden);motionQuery.removeEventListener('change',motion);};
}
