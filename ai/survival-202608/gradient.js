import {bi,setBi,INK,PURPLE} from './bilingual.js?v=20261112-bi4';
import {INITIAL,loss,gradient,update,norm,slice,sliceMinimum} from './gradient-math.js';

export function mountGradient(host,originalSVG){
  const root=document.createElement('section');root.className='gradient-lab';
  root.setAttribute('aria-label','高维梯度下降互动演示');
  root.innerHTML=`<div class="gl-frame">
    <header class="gl-header"><div><h1>${bi("At the bottom here—what about the other dimensions?","眼前已到谷底，别的维度呢？")}</h1><p>Gradient descent in 8 dimensions · 高维空间中的梯度下降</p></div><button class="gl-original">${bi("Original","查看原图",true)}</button></header>
    <div class="gl-body"><div class="gl-scene">
      <canvas width="1180" height="616" tabindex="0" aria-label="可旋转三维损失切片。拖动或使用方向键旋转；曲面仅显示两个参数，竖轴为损失。"></canvas>
      <div class="gl-view">${bi("View axes","观察方向",true)} <select class="gl-axis-a" aria-label="横轴参数"></select><span>×</span><select class="gl-axis-b" aria-label="纵轴参数"></select></div><span class="gl-rotate">${bi("Drag or use arrow keys","拖动旋转 · 方向键也可操作")}</span>
      <div class="gl-slice-label"><span>${bi("Two-parameter slice; six parameters fixed","双参数切片 · 其余 6 个参数固定在当前值")}</span><b>${bi("● Current point ◇ Slice minimum","● 当前参数　◇ 切片谷底")}</b></div>
    </div><aside class="gl-side"><h2>${bi("Each of 8 directions has a slope","8 个方向，都有自己的坡度")}</h2><p class="gl-explain">偏导 ∂L/∂wᵢ · 紫色为所见两维</p><div class="gl-bars"></div>
      <div class="gl-norms"><span>${bi("Visible gradient","所见两维梯度")} <b class="gl-visible-norm"></b></span><span>${bi("Full gradient","全部梯度")} <b class="gl-full-norm"></b></span></div>
      <div class="gl-loss-head"><span>${bi("Total loss L · step","总损失 L · 步数",true)} <span class="gl-count">0</span></span><strong class="gl-loss">20.750</strong></div>
      <svg class="gl-loss-chart" viewBox="0 0 278 35" role="img" aria-label="总损失随更新步数的变化，纵轴从零起"><path class="gl-chart-base" d="M1 34H277"/><path class="gl-history"/><circle class="gl-history-dot" r="2.5"/></svg>
    </aside></div>
    <div class="gl-insight" role="status" aria-live="polite"><strong></strong><span></span></div>
    <div class="gl-controls"><button class="gl-step gl-primary">${bi("Step →","走一步",true)}</button><button class="gl-auto">${bi("Run","连续下降",true)}</button><button class="gl-reset">${bi("Reset","重置起点",true)}</button>
      <label title="切换比较方式会重置起点"><select class="gl-mode" aria-label="更新方式（切换会重置起点）"><option value="all">Update all 8</option><option value="visible">Visible 2 only</option></select><span class="gl-mode-zh lang-zh">更新全部 8 维</span></label>
      <label class="gl-rate">${bi("Learning rate η","学习率",true)} <input type="range" min="0.05" max="0.80" step="0.05" value="0.25" aria-label="学习率"><output>0.25</output></label>
    </div><footer class="gl-footer"><span>${bi("An 8D convex teaching model. Real networks may have many parameters and nonconvex losses. The 3D view shows two parameters plus loss, not all eight dimensions.","这是 8 维凸函数的教学模型；真实网络可含海量参数与非凸损失。3D 显示的是「两个参数 + 损失」，不是把 8 维直接画成三维。")}</span><span class="gl-formula">w ← w − η∇L<br>L = ½Σwᵢ² + ¼Σ(wᵢ − wᵢ₊₁)²，w₉ = w₁</span></footer>
  </div>`;
  const original=document.createElement('div');original.className='gl-hidden';original.style.cssText='position:absolute;inset:0';original.innerHTML=originalSVG;
  const back=document.createElement('button');back.className='gl-return';setBi(back,'Back to interaction','返回互动',true);original.append(back);
  host.replaceChildren(root,original);
  const $=s=>root.querySelector(s),frame=$('.gl-frame'),canvas=$('canvas'),ctx=canvas.getContext('2d');
  let w=[...INITIAL],axes=[0,1],eta=.25,mode='all',count=0,history=[loss(w)],yaw=-.65,pitch=.56;
  let raf=0,auto=false,disposed=false,transition=null,lastStep=0,drag=null,range=3,zMax=60,barMax=6;
  const fmt=v=>Math.abs(v)<1e-10?'0.000':Math.abs(v)<.001?v.toExponential(2):v.toFixed(3);
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-paused');
  for(let i=0;i<8;i++){
    for(const select of [$('.gl-axis-a'),$('.gl-axis-b')]){const op=document.createElement('option');op.value=i;op.textContent='w'+(i+1);select.append(op);}
    const row=document.createElement('div');row.className='gl-row';row.innerHTML=`<span>w${i+1}</span><div class="gl-track"><i class="gl-bar"></i></div><span class="gl-value"></span>`;$('.gl-bars').append(row);
  }
  $('.gl-axis-b').value='1';
  const rows=[...root.querySelectorAll('.gl-row')];
  function resize(){frame.style.transform=`scale(${host.clientWidth/960})`;}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function project(x,y,z){
    const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);
    return [295+a*114/range,190+b*114/range*Math.sin(pitch)-z*100/zMax*Math.cos(pitch),b];
  }
  function line(points,color,width=1,dash=[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
  function draw(){
    if(disposed)return;
    ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,590,308);
    const [a,b]=axes,N=22,tiles=[];
    range=Math.max(range,Math.ceil(Math.max(...w.map(Math.abs))));
    const R=range,corners=[[-R,-R],[-R,R],[R,-R],[R,R]].map(([x,y])=>slice(w,a,b,x,y));
    zMax=Math.max(zMax,Math.ceil(Math.max(...corners,loss(w))/20)*20);
    // Axes and height scale remain fixed throughout optimization: true loss, no log/renormalization.
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){
      const x=-R+2*R*i/N,y=-R+2*R*j/N,d=2*R/N;
      const points=[[x,y],[x+d,y],[x+d,y+d],[x,y+d]].map(([u,v])=>{const z=slice(w,a,b,u,v);return {p:project(u,v,z),z};});
      tiles.push({points,depth:points.reduce((s,p)=>s+p.p[2],0)/4,z:points.reduce((s,p)=>s+p.z,0)/4});
    }
    const floor=[project(-R,-R,0),project(R,-R,0),project(R,R,0),project(-R,R,0)];
    ctx.beginPath();floor.forEach((p,i)=>i?ctx.lineTo(...p.slice(0,2)):ctx.moveTo(...p.slice(0,2)));ctx.closePath();ctx.fillStyle='#bed3e61c';ctx.fill();
    for(let k=-2;k<=2;k++){
      line([project(k,-R,0),project(k,R,0)],'#a9c4d73d');line([project(-R,k,0),project(R,k,0)],'#a9c4d73d');
    }
    tiles.sort((a,b)=>a.depth-b.depth);
    for(const tile of tiles){
      const t=Math.min(1,tile.z/zMax),hue=188+59*t;
      ctx.beginPath();tile.points.forEach(({p},i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      ctx.fillStyle=`hsla(${hue},38%,${79-18*t}%,.86)`;ctx.fill();ctx.strokeStyle='rgba(69,113,151,.17)';ctx.lineWidth=.55;ctx.stroke();
    }
    const base=project(-R,-R,0),xend=project(R*1.1,-R,0),yend=project(-R,R*1.1,0),zend=project(-R,-R,zMax);
    line([base,xend],'#5e829f',1.2);line([base,yend],'#5e829f',1.2);line([base,zend],'#5e829f',1.2);
    ctx.font='12px BiSans, BiKai, sans-serif';ctx.fillStyle=INK;
    ctx.fillText('w'+(a+1),xend[0]+4,xend[1]+3);ctx.fillText('w'+(b+1),yend[0]+6,yend[1]-4);ctx.fillText('L',zend[0]-11,zend[1]-5);
    ctx.font='10px BiSans, BiKai, sans-serif';
    for(const z of [0,zMax/3,zMax*2/3,zMax]){const p=project(-R,-R,z);line([[p[0]-3,p[1]],[p[0]+3,p[1]]],'#6485a0');ctx.fillText(String(Math.round(z)),p[0]-25,p[1]+3);}
    for(const value of [-R,0,R]){const p=project(value,-R,0),q=project(-R,value,0);ctx.fillText(String(value),p[0]-3,p[1]+14);if(value!==-R)ctx.fillText(String(value),q[0]-17,q[1]+3);}
    const min=sliceMinimum(w,a,b),mp=project(min[0],min[1],slice(w,a,b,...min)),p=project(w[a],w[b],loss(w));
    if(Math.abs(min[0])<=R&&Math.abs(min[1])<=R){line([[mp[0],mp[1]-6],[mp[0]+6,mp[1]],[mp[0],mp[1]+6],[mp[0]-6,mp[1]],[mp[0],mp[1]-6]],'#f7f8ff',2);}
    if(Math.abs(w[a])<=R&&Math.abs(w[b])<=R){
      line([project(w[a],w[b],0),p],'#a27e5488',1,[3,4]);
      ctx.beginPath();ctx.arc(p[0],p[1],10,0,Math.PI*2);ctx.fillStyle='#fff3ce60';ctx.fill();ctx.beginPath();ctx.arc(p[0],p[1],5,0,Math.PI*2);ctx.fillStyle='#e9a94c';ctx.fill();ctx.strokeStyle='#fffaf0';ctx.lineWidth=2;ctx.stroke();
    }else{ctx.fillStyle=INK;ctx.fillText('Point outside the view; see total loss',280,54);ctx.fillStyle=PURPLE;ctx.fillText('当前点超出固定视野 · 查看右侧损失',280,69);}
    const g=gradient(w);barMax=Math.max(barMax,Math.ceil(Math.max(...g.map(Math.abs))));const scale=barMax;
    rows.forEach((row,i)=>{row.dataset.selected=String(axes.includes(i));const bar=row.querySelector('i'),val=g[i]/scale*49;bar.style.left=(val<0?50+val:50)+'%';bar.style.width=Math.abs(val)+'%';row.querySelector('.gl-value').textContent=Math.abs(g[i])<1e-10?'0.00':Math.abs(g[i])<.01?g[i].toExponential(1):g[i].toFixed(2);row.title=`w${i+1} = ${fmt(w[i])}；偏导 = ${fmt(g[i])}`;});
    setBi($('.gl-explain'),`Partials ∂L/∂wᵢ · scale ±${barMax} · purple: visible axes`,`偏导 ∂L/∂wᵢ · 共同刻度 ±${barMax} · 紫色为所见两维`);
    $('.gl-visible-norm').textContent=fmt(norm(axes.map(i=>g[i])));$('.gl-full-norm').textContent=fmt(norm(g));$('.gl-loss').textContent=loss(w)<.001?fmt(loss(w)):loss(w).toFixed(4);$('.gl-count').textContent=count;
    const plotMax=Math.max(...history,1e-6),points=history.map((v,i)=>[2+i/Math.max(history.length-1,1)*272,33-v/plotMax*29]);
    $('.gl-history').setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '));const end=points.at(-1);$('.gl-history-dot').setAttribute('cx',end[0]);$('.gl-history-dot').setAttribute('cy',end[1]);$('.gl-loss-chart').setAttribute('aria-label',`总损失：从 ${fmt(history[0])} 到 ${fmt(history.at(-1))}，${count} 次更新。纵轴 0 至 ${fmt(plotMax)}。`);
  }
  const INSIGHT_EN={"步子太大，损失反而上升": "The step is too large; loss rises", "把学习率调小，再从起点比较。": "Lower the learning rate and compare from the same start.", "8 个方向的坡度都接近零": "All 8 slopes are nearly zero", "这个凸函数的唯一全局最小值为 L = 0。": "This convex function has a unique global minimum at L = 0.", "只走这两维，会停在这里": "Updating only these two dimensions stops here", "切换“更新全部 8 维”，寻找看不见的下降方向。": "Update all 8 dimensions to find hidden descent directions.", "二维看似到底，八维仍能下降": "The visible slice is at its minimum; 8D can still descend", "点“走一步”：前两个参数不动，总损失仍下降。": "Take one step: the first two parameters stay still while total loss falls.", "只沿所见方向走，其余参数固定": "Only visible parameters move; the others stay fixed", "切换观察方向，可以查看其他参数的坡度。": "Change the viewing axes to inspect other slopes.", "切片在变，八维损失函数始终相同": "The slice changes; the same 8D loss function remains", "其余参数在更新；换两个方向看同一个位置。": "Other parameters are updating. View the same point along another pair of axes."};
  function insight(){
    const g=gradient(w),full=norm(g),visible=norm(axes.map(i=>g[i]));let title,detail;
    if(history.length>1&&history.at(-1)>history.at(-2)+1e-6){title='步子太大，损失反而上升';detail='把学习率调小，再从起点比较。';}
    else if(full<.015){title='8 个方向的坡度都接近零';detail='这个凸函数的唯一全局最小值为 L = 0。';}
    else if(visible<.001&&mode==='visible'){title='只走这两维，会停在这里';detail='切换“更新全部 8 维”，寻找看不见的下降方向。';}
    else if(visible<.001){title='二维看似到底，八维仍能下降';detail='点“走一步”：前两个参数不动，总损失仍下降。';}
    else if(mode==='visible'){title='只沿所见方向走，其余参数固定';detail='切换观察方向，可以查看其他参数的坡度。';}
    else {title='切片在变，八维损失函数始终相同';detail='其余参数在更新；换两个方向看同一个位置。';}
    if(range>3||zMax>60)detail+=' 视野已扩大。';
    setBi($('.gl-insight strong'),INSIGHT_EN[title],title);setBi($('.gl-insight>span'),INSIGHT_EN[detail.replace(' 视野已扩大。','')]+(detail.includes('视野已扩大')?' The view has expanded.':''),detail);
  }
  function stop(){auto=false;setBi($('.gl-auto'),'Run','连续下降',true);}
  function finish(target){w=target;count++;history.push(loss(w));transition=null;draw();insight();if(norm(gradient(w))<.006||(mode==='visible'&&norm(axes.map(i=>gradient(w)[i]))<.006)||loss(w)>4*history[0]||count>=120)stop();}
  function step(){
    if(transition||disposed)return;
    const target=update(w,eta,mode==='visible'?axes:null);
    if(!target.every(Number.isFinite)){stop();return;}
    if(reduced()){finish(target);return;}
    transition={from:[...w],target,start:performance.now()};schedule();
  }
  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
  function tick(now){
    if(disposed||document.hidden)return;
    if(transition){const t=Math.min(1,(now-transition.start)/450),e=t*t*(3-2*t);w=transition.from.map((v,i)=>v+(transition.target[i]-v)*e);draw();if(t>=1){finish(transition.target);lastStep=now;}}
    else if(auto&&now-lastStep>=620){lastStep=now;step();}
    if(transition||auto)schedule();
  }
  function reset(){stop();transition=null;cancelAnimationFrame(raf);w=[...INITIAL];count=0;history=[loss(w)];range=3;zMax=60;barMax=6;draw();insight();}
  $('.gl-step').addEventListener('click',()=>{stop();step();});
  $('.gl-auto').addEventListener('click',()=>{auto=!auto;setBi($('.gl-auto'),auto?'Pause':'Run',auto?'暂停下降':'连续下降',true);lastStep=0;if(auto)schedule();});
  $('.gl-reset').addEventListener('click',reset);
  $('.gl-mode').addEventListener('change',e=>{mode=e.target.value;$('.gl-mode-zh').textContent=mode==='all'?'更新全部 8 维':'仅更新所见 2 维';reset();});
  $('.gl-rate input').addEventListener('input',e=>{stop();eta=Number(e.target.value);$('.gl-rate output').textContent=eta.toFixed(2);});
  for(const [idx,selector] of [[0,'.gl-axis-a'],[1,'.gl-axis-b']])$(selector).addEventListener('change',e=>{
    const selected=Number(e.target.value);if(selected===axes[1-idx])axes[1-idx]=axes[idx];axes[idx]=selected;
    $('.gl-axis-a').value=axes[0];$('.gl-axis-b').value=axes[1];draw();insight();
  });
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.009;pitch=Math.max(.22,Math.min(1.1,pitch+(e.clientY-drag.y)*.005));drag={x:e.clientX,y:e.clientY};draw();});
  for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();e.stopPropagation();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.1,pitch+.06);if(e.key==='ArrowDown')pitch=Math.max(.22,pitch-.06);draw();});
  const hide=()=>{if(document.hidden){stop();if(transition)finish(transition.target);cancelAnimationFrame(raf);}};
  document.addEventListener('visibilitychange',hide);
  $('.gl-original').addEventListener('click',()=>{stop();if(transition)finish(transition.target);root.classList.add('gl-hidden');original.classList.remove('gl-hidden');back.focus();});
  back.addEventListener('click',()=>{original.classList.add('gl-hidden');root.classList.remove('gl-hidden');$('.gl-original').focus();});
  document.fonts.ready.then(()=>{if(!disposed)draw();});draw();insight();
  return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',hide);};
}
