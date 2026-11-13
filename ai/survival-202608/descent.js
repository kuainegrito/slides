import {bi,setBi,svgBi,INK,PURPLE} from './bilingual.js?v=20261112-bi4';
import {INITIAL,TARGET,loss,slope,update,regime,limits} from './descent-math.js?v=20261113-gd5';
const NS='http://www.w3.org/2000/svg';
const fmt=n=>Math.abs(n)<.0005?'0.000':n.toFixed(3);
export function mountDescent(host,originalSVG){
 const root=document.createElement('section');root.className='descent-lab';root.setAttribute('aria-label','Gradient descent / 梯度下降互动');
 root.innerHTML=`<div class="gd-frame"><header class="gd-head"><h1>${bi('Gradient descent: learn by taking a step','梯度下降：沿着坡度，一步步学习')}</h1><button class="gd-original">${bi('Original','查看原图',true)}</button></header>
 <div class="gd-main"><div class="gd-plot"><svg viewBox="0 0 594 296" role="img" tabindex="0" aria-label="Loss curve / 损失曲线：横轴参数，纵轴损失"><defs><linearGradient id="gd-fill" x2="0" y2="1"><stop stop-color="#92bfdc" stop-opacity=".27"/><stop offset="1" stop-color="#bfd8ec" stop-opacity=".03"/></linearGradient><filter id="gd-glow"><feGaussianBlur stdDeviation="4"/></filter><marker id="gd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#c19450"/></marker><clipPath id="gd-clip"><rect x="57" y="22" width="516" height="219"/></clipPath></defs><g class="gd-grid"></g><g clip-path="url(#gd-clip)"><path class="gd-area" fill="url(#gd-fill)"/><path class="gd-curve" fill="none" stroke="#679bbb" stroke-width="3"/><path class="gd-trail" fill="none" stroke="#8972aa" stroke-width="1.4" stroke-dasharray="3 4"/><g class="gd-dots"></g><path class="gd-tangent" fill="none" stroke="#c99b58" stroke-width="2" stroke-dasharray="5 4"/><path class="gd-vector" fill="none" stroke="#be9356" stroke-width="2" marker-end="url(#gd-arrow)"/><circle class="gd-glow" r="13" fill="#c99542" opacity=".4" filter="url(#gd-glow)"/><circle class="gd-point" r="6" fill="#d9a24e" stroke="#fffdf4" stroke-width="2"/></g><circle class="gd-min" r="4" fill="#8860ae"/><text x="12" y="13" class="gd-y-label"></text><text x="456" y="270" class="gd-x-label"></text><text x="315" y="216" text-anchor="middle" class="gd-min-label"></text></svg><span class="gd-axis-hint">${bi('Gold: current point · dashed: proposed update','金色：当前点 · 虚线：下一步提议')}</span><span class="gd-scaling"></span></div>
 <aside class="gd-side"><div class="gd-equation">w′ = w − η · g<small>L(w) = ½(w − 1)² &nbsp; · &nbsp; g = w − 1</small></div><div class="gd-stats"><div class="gd-stat">${bi('Parameter w','当前参数')}<strong class="gd-w"></strong></div><div class="gd-stat">${bi('Loss L','当前损失')}<strong class="gd-loss"></strong></div><div class="gd-stat">${bi('Slope g','当前位置的坡度')}<strong class="gd-slope"></strong></div><div class="gd-stat">${bi('Change Δw = −ηg','参数改变量')}<strong class="gd-change"></strong></div></div><div class="gd-calculation">${bi('The next update','下一步怎么算')}<span class="gd-numeric"></span></div><div class="gd-progress"><span>${bi('Completed updates','已完成更新',true)}</span><b class="gd-step-count">0</b></div><svg class="gd-mini" viewBox="0 0 280 25" aria-label="Loss history / 损失历史"><path/><circle r="2.5"/></svg></aside></div>
 <div class="gd-story" role="status"><strong></strong><span></span></div>
 <div class="gd-controls"><button class="gd-play" aria-pressed="true"></button><button class="gd-step">${bi('Step →','走一步',true)}</button><button class="gd-reset">${bi('Reset','重置',true)}</button><label class="gd-loop"><input type="checkbox" checked aria-label="Loop / 循环演示">${bi('Loop','循环',true)}</label><label class="gd-rate">${bi('Learning rate η','步长系数',true)}<input type="range" min="0.05" max="2.20" step="0.05" value="0.25" aria-label="Learning rate / 步长系数"><output>0.25</output></label></div>
 <div class="gd-presets"><span>${bi('Compare from the same start','从同一起点比较')}</span>${[[.1,'Small steps','小步前进'],[.25,'Balanced','平稳下降'],[1.3,'Overshoot','跨越后收敛'],[2.1,'Too large','步长过大']].map(([v,en,zh])=>`<button data-rate="${v}" aria-pressed="${v===.25}">${bi(en+' '+v,zh,true)}</button>`).join('')}</div>
 <footer class="gd-footer">${bi('A one-parameter teaching model. η sets the scale; the actual change is −ηg. Real networks update many weights, and their loss need not be convex.','单参数教学模型。步长系数 η 与坡度共同决定改变量 −ηg；真实网络更新大量权重，损失函数也未必为凸函数。')}</footer></div>`;
 const original=document.createElement('div');original.className='gd-hidden';original.style.cssText='position:absolute;inset:0';original.innerHTML=originalSVG;
 const back=document.createElement('button');back.className='gd-return';setBi(back,'Back to animation','返回动画',true);original.append(back);host.replaceChildren(root,original);
 const $=s=>root.querySelector(s);svgBi($('.gd-y-label'),'Loss L','损失',{enSize:10,zhSize:12});svgBi($('.gd-x-label'),'Parameter w','参数',{enSize:10,zhSize:12});svgBi($('.gd-min-label'),'Minimum','最小值',{enSize:9,zhSize:11});
 let w=INITIAL,eta=.25,count=0,history=[INITIAL],running=false,raf=0,transition=null,waitUntil=0,disposed=false,terminal='',phase=-1;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-paused');
 const observer=new ResizeObserver(()=>{$('.gd-frame').style.transform=innerWidth>640?`scale(${root.clientWidth/960})`:'';});observer.observe(root);
 function story(en,zh,detail,cn){setBi($('.gd-story strong'),en,zh);setBi($('.gd-story>span'),detail,cn);}
 function describe(p){
  if(terminal==='converged'){story('Close to the minimum','已接近最小值','The slope is near zero, so the proposed update is tiny.','坡度接近零，因此下一次参数改变量也很小。');return;}
  if(terminal==='diverged'){story('The steps are making loss grow','步子太大，损失不断上升','Compare a smaller η from the same start. This run has stopped.','从同一起点比较更小的 η。本轮演示已停止。');return;}
  if(terminal==='limit'){story('No convergence in this run','本轮尚未收敛','Reset and compare another learning rate.','重置后换一个步长系数，再比较下降过程。');return;}
  if(p===0)story('1 · Read the local slope','① 先看当前位置的坡度',slope(w)<0?'A negative slope means the loss falls toward the right.':'A positive slope means the loss falls toward the left.',slope(w)<0?'坡度为负，向右走才能沿局部下降方向前进。':'坡度为正，向左走才能沿局部下降方向前进。');
  else if(p===1)story('2 · Scale the update','② 用步长系数计算改变量','Multiply the negative slope by η; preview the next parameter.','用负坡度乘以 η，得到参数改变量，并预览下一步。');
  else if(p===2)story('3 · Update and measure again','③ 更新参数，再计算损失','The moving point illustrates one discrete parameter update.','点的移动用于演示一次离散的参数更新。');
  else {const r=regime(eta);const texts={direct:['Small enough to descend directly','步长合适，直接向低处靠近','As the curve flattens, the same η produces smaller changes.','越接近谷底，坡度越小；同样的 η 也会带来更小的改变量。'],exact:['One step reaches this minimum','此例中一步即可到达最小值','This special quadratic has its exact one-step solution at η = 1.','只针对本页这个二次函数，η = 1 恰好一步到达最小值。'],oscillate:['Cross the minimum, then converge','跨过谷底，来回振荡后收敛','In this example, 1 < η < 2 overshoots but still reduces loss.','在本例中，1 < η < 2 会越过谷底，但损失仍逐步下降。'],cycle:['Same loss, back and forth','来回跳动，损失不降','At η = 2, this example alternates between two equal-loss points.','本例中 η = 2 时，参数在两个损失相同的位置间来回跳动。'],diverge:['Too large: loss will rise','步长过大，损失将上升','In this example η > 2 moves farther from the minimum.','在本例中，η > 2 会让参数离谷底越来越远。']};story(...texts[r]);}
 }
 function draw(progress=0){
  const next=update(w,eta),lim=limits(w,next),left=57,right=574,top=24,bottom=238;
  const px=x=>left+(x-lim.left)/(lim.right-lim.left)*(right-left),py=y=>bottom-y/lim.top*(bottom-top);
  let d='';for(let i=0;i<=180;i++){const x=lim.left+i/180*(lim.right-lim.left);d+=(i?'L':'M')+px(x).toFixed(2)+' '+py(loss(x)).toFixed(2);}
  $('.gd-curve').setAttribute('d',d);$('.gd-area').setAttribute('d',d+`L${right} ${bottom}H${left}Z`);
  const grid=[];for(let i=0;i<=4;i++){const v=i*lim.top/4,y=py(v);grid.push(`<path d="M${left} ${y}H${right}" stroke="#bfd1df" stroke-opacity=".5"/><text x="49" y="${y+3}" text-anchor="end" font-size="9">${v.toFixed(v<10?1:0)}</text>`);}for(let i=0;i<=4;i++){const v=lim.left+i*(lim.right-lim.left)/4,x=px(v);grid.push(`<text x="${x}" y="253" text-anchor="middle" font-size="9">${v.toFixed(1)}</text>`);}$('.gd-grid').innerHTML=grid.join('');
  const pts=history.slice(-40);$('.gd-trail').setAttribute('d',pts.map((x,i)=>(i?'L':'M')+px(x)+' '+py(loss(x))).join(' '));$('.gd-dots').innerHTML=pts.map(x=>`<circle cx="${px(x)}" cy="${py(loss(x))}" r="3" fill="#9a86b6" opacity=".6"/>`).join('');
  const point=w+(next-w)*progress,x=px(point),y=py(loss(point));for(const cls of ['.gd-point','.gd-glow']){$(cls).setAttribute('cx',x);$(cls).setAttribute('cy',y);}
  const dx=(lim.right-lim.left)*.08;$('.gd-tangent').setAttribute('d',`M${px(w-dx)} ${py(loss(w)-slope(w)*dx)}L${px(w+dx)} ${py(loss(w)+slope(w)*dx)}`);
  $('.gd-vector').setAttribute('d',`M${px(w)} ${py(loss(w))}L${px(next)} ${py(loss(next))}`);$('.gd-vector').style.opacity=phase>=1?'.7':'.15';
  $('.gd-min').setAttribute('cx',px(TARGET));$('.gd-min').setAttribute('cy',py(0));$('.gd-min-label').style.opacity=Math.abs(px(w)-px(TARGET))<24?'.4':'1';
  for(const [sel,value] of [['.gd-w',w],['.gd-loss',loss(w)],['.gd-slope',slope(w)],['.gd-change',next-w]])$(sel).textContent=fmt(value);
  $('.gd-numeric').textContent=`${fmt(w)} − ${eta.toFixed(2)} × (${fmt(slope(w))}) = ${fmt(next)}`;$('.gd-step-count').textContent=count;root.dataset.count=count;root.dataset.w=w;root.dataset.loss=loss(w);root.dataset.phase=phase;
  if(lim.expanded)setBi($('.gd-scaling'),'Axes expanded','坐标范围已扩大');else $('.gd-scaling').textContent='';
  const max=Math.max(...history.map(loss),.01),points=history.map((x,i)=>[2+i/Math.max(1,history.length-1)*275,23-loss(x)/max*20]);$('.gd-mini path').setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(''));const last=points.at(-1);$('.gd-mini circle').setAttribute('cx',last[0]);$('.gd-mini circle').setAttribute('cy',last[1]);
 }
 function buttons(){const active=running||!!transition&&!transition.paused;setBi($('.gd-play'),active?'Ⅱ Pause':terminal?'↻ Replay':'▶ Play',active?'暂停':terminal?'重新播放':'播放',true);$('.gd-play').setAttribute('aria-pressed',String(active));root.dataset.running=active;root.dataset.autoplay=running;$('.gd-step').disabled=!!terminal;$('.gd-rate output').textContent=eta.toFixed(2);root.querySelectorAll('[data-rate]').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(+b.dataset.rate-eta)<.001)));}
 function halt(){running=false;cancelAnimationFrame(raf);transition=null;phase=-1;buttons();draw();describe(-1);}
 function reset(){halt();w=INITIAL;count=0;history=[w];terminal='';phase=-1;waitUntil=0;buttons();draw();describe(-1);}
 function commit(){w=update(w,eta);count++;history.push(w);transition=null;phase=-1;
  terminal=Math.abs(slope(w))<.035?'converged':loss(w)>loss(INITIAL)*8?'diverged':count>=50?'limit':'';
  draw();describe(-1);buttons();waitUntil=performance.now()+(terminal?2500:550);
  if(terminal&&(!$('.gd-loop input').checked||terminal!=='converged')){running=false;buttons();}
 }
 function begin(){transition={started:performance.now(),elapsed:0,paused:false};phase=0;describe(0);draw();buttons();}
 function tick(now){if(disposed||document.hidden)return;
  if(transition&&!transition.paused){const elapsed=now-transition.started;transition.elapsed=elapsed;const total=reduced()?900:2100,p=elapsed<650?0:elapsed<1250?1:2;
   if(p!==phase){phase=p;describe(p);}draw(reduced()?0:Math.max(0,Math.min(1,(elapsed-1250)/850)));
   if(elapsed>=total)commit();
  }else if(running&&now>=waitUntil){if(terminal){reset();running=true;buttons();}begin();}
  if(running||(transition&&!transition.paused))raf=requestAnimationFrame(tick);
 }
 function pause(){running=false;cancelAnimationFrame(raf);if(transition){transition.elapsed=performance.now()-transition.started;transition.paused=true;}buttons();}
 function play(){if(running||(transition&&!transition.paused)){pause();return;}if(terminal)reset();if(transition?.paused){transition.started=performance.now()-transition.elapsed;transition.paused=false;}running=true;buttons();waitUntil=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
 $('.gd-play').addEventListener('click',play);$('.gd-step').addEventListener('click',()=>{halt();if(!terminal){begin();raf=requestAnimationFrame(tick);}});$('.gd-reset').addEventListener('click',reset);
 $('.gd-rate input').addEventListener('input',e=>{halt();eta=+e.target.value;terminal='';buttons();draw();describe(-1);});
 root.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>{reset();eta=+b.dataset.rate;$('.gd-rate input').value=eta;buttons();draw();describe(-1);}));
 $('.gd-original').addEventListener('click',()=>{halt();root.classList.add('gd-hidden');original.classList.remove('gd-hidden');back.focus();});back.addEventListener('click',()=>{original.classList.add('gd-hidden');root.classList.remove('gd-hidden');$('.gd-original').focus();});
 $('.gd-loop input').addEventListener('change',()=>{if(terminal&&!$('.gd-loop input').checked)halt();});
 const motionObserver=new MutationObserver(()=>{if(reduced())halt();});motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 const hide=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hide);
 draw();describe(-1);buttons();if(!reduced()){running=true;waitUntil=performance.now()+900;buttons();raf=requestAnimationFrame(tick);}
 return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();motionObserver.disconnect();document.removeEventListener('visibilitychange',hide);};
}
