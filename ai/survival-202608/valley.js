import {bi} from './bilingual.js?v=20261112-bi4';
// Three hidden parameter directions represented by interleaved translucent
// landscapes. Screen depth is a teaching projection, not literal 4D geometry.
const STOPS=[[275,112],[498,158],[370,204],[635,247]];
const COLORS=['#83e7e2','#c4afff','#8ef3bc'];
const CAPTIONS=[
 ['Lowest in the visible slice. Three directions remain hidden.','眼前切面已到最低；还有三个方向藏在视野之外。'],
 ['A deeper valley appears behind the first slice.','第一层透视：原来，眼前谷底背后还有下坡。'],
 ['That bottom is only another slice. Look through it.','第二层透视：刚到的谷底，下面竟然还有山谷。'],
 ['Another hidden direction leads to an even lower valley.','第三层透视：再展开一个方向，仍能找到更低处。']
];
const smooth=t=>t*t*t*(t*(t*6-15)+10),clamp=t=>Math.max(0,Math.min(1,t));
// A single source of truth for automatic playback and semantic state.
export function storyAt(seconds){
 const time=((seconds%40)+40)%40;
 if(time<3)return {state:0,reveal:0,travel:0,phase:'hold'};
 const cycle=Math.min(2,Math.floor((time-3)/11)),local=time-3-cycle*11;
 return {state:cycle+1,reveal:cycle+smooth(clamp(local/4)),travel:cycle+smooth(clamp((local-5)/4)),phase:local<4?'reveal':local<5?'hold':local<9?'descend':'hold'};
}
export function mountGradient(host,originalSVG){
 const root=document.createElement('section');root.className='gradient-lab hv-lab';
 root.innerHTML=`<div class="hv-frame"><header><h1>${bi('Beyond each valley, another hidden depth','每一层谷底，背后还有更深处')}</h1><button class="hv-original">${bi('Original','原图')}</button></header><div class="hv-scene"><canvas aria-label="三个隐藏参数方向依次透视展开，每一层谷底之下还有更低的山谷。"></canvas><div class="hv-badge"></div><div class="hv-caption" aria-live="polite"></div></div><div class="hv-steps">${[['0 · Visible slice','眼前切面'],['1 · First depth','第一层深处'],['2 · Deeper still','第二层更低'],['3 · Beyond again','第三层谷底']].map((x,i)=>`<button data-step="${i}">${bi(...x)}</button>`).join('')}</div><div class="hv-controls"><button class="hv-play"></button><label>${bi('See through the layers','逐层透视')}<input aria-label="逐层透视" type="range" min="0" max="300" value="0"></label><button class="hv-reset">${bi('Replay','重新播放')}</button></div><footer>${bi('High-dimensional analogy: translucent layers reveal extra parameter directions, not physical underground levels. Lower points shown here are not a proof of a global minimum.','高维透视类比：透明层显露额外参数方向，并非地下楼层；眼前更低的点，也不代表已证明是全局最低点。')}</footer></div>`;
 const original=document.createElement('div');original.className='hv-original-view';original.hidden=true;original.innerHTML=originalSVG;
 const back=document.createElement('button');back.className='gl-return';back.innerHTML=bi('Back to the valley','返回山谷');original.append(back);host.replaceChildren(root,original);
 const $=s=>root.querySelector(s),canvas=$('canvas'),ctx=canvas.getContext('2d'),frame=$('.hv-frame');
 const mq=matchMedia('(prefers-reduced-motion: reduce)');
 let state=0,reveal=0,travel=0,phase='hold',raf=0,last=null,elapsed=0,playing=true,tween=null,disposed=false,uiKey='',manual=false;
 const blocked=()=>document.hidden||!original.hidden||mq.matches||document.documentElement.classList.contains('motion-paused');
 function center(layer,t){const a=STOPS[layer],b=STOPS[layer+1],bend=[-23,35,-28][layer];return [a[0]+(b[0]-a[0])*t+bend*Math.sin(Math.PI*t),a[1]+(b[1]-a[1])*t+9*Math.sin(Math.PI*t)];}
 function point(layer,x,t){let c=center(layer,t),twist=Math.sin(t*Math.PI)*[.38,-.5,.3][layer];return [c[0]+x*(53+6*Math.sin(t*4+layer)),c[1]+x*twist*15-x*x*(13+3*Math.sin(t*5+layer))-1.2*x**4];}
 function path(ps,color,width=1,fill=false){ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(fill){ctx.closePath();ctx.fillStyle=color;ctx.fill();}else{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}}
 function label(en,zh,p){ctx.save();if(host.clientWidth<640){ctx.translate(...p);ctx.scale(912/canvas.getBoundingClientRect().width*.76,320/canvas.getBoundingClientRect().height*.76);p=[0,0];}ctx.font='12px BiSans,sans-serif';let w=Math.max(ctx.measureText(en).width,zh.length*13)+18;ctx.fillStyle='#f4faffeb';ctx.beginPath();ctx.roundRect(p[0]-w/2,p[1]-16,w,39,7);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(en,p[0],p[1]-2);ctx.font='13px BiKai,KaiTi,serif';ctx.fillStyle='#7030a0';ctx.fillText(zh,p[0],p[1]+15);ctx.restore();}
 function orb(p,color,r=4){const g=ctx.createRadialGradient(...p,0,...p,20);g.addColorStop(0,color+'b0');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(p[0]-20,p[1]-20,40,40);ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();}
 // Precompute all terrain geometry. Earlier surfaces become translucent as the
 // next parameter direction appears, so the deeper surfaces remain visible.
 const meshes=Array.from({length:3},(_,k)=>{const a=[];for(let j=0;j<30;j++)for(let i=0;i<30;i++){let x=-2+i*4/30,t=j/30,d=4/30,e=1/30;let ps=[[x,t],[x+d,t],[x+d,t+e],[x,t+e]].map(([u,v])=>point(k,u,v));a.push({ps,t,x,depth:t+x*.01});}return a.sort((a,b)=>a.depth-b.depth);});
 const routes=Array.from({length:3},(_,k)=>Array.from({length:81},(_,i)=>center(k,i/80)));
 function draw(){
  ctx.setTransform(canvas.width/912,0,0,canvas.height/320,0,0);ctx.clearRect(0,0,912,320);let sky=ctx.createLinearGradient(0,0,0,320);sky.addColorStop(0,'#d9e7f2');sky.addColorStop(.5,'#eff4f7');sky.addColorStop(1,'#cbdcde');ctx.fillStyle=sky;ctx.fillRect(0,0,912,320);
  for(let k=0;k<3;k++){let ps=[[0,180]];for(let x=0;x<=912;x+=12)ps.push([x,63+k*28+22*Math.sin(x*.016+k)+13*Math.sin(x*.041+k*3)]);ps.push([912,320],[0,320]);path(ps,['#aec5d443','#9ab8c43a','#88a8b333'][k],1,true);}
  // Render the deepest layer first; translucent upper shells show its valley.
  for(let k=2;k>=0;k--){const amount=clamp(reveal-k);if(amount<=0)continue;const next=clamp(reveal-k-1),alpha=amount*(1-next*.68);
   for(const tile of meshes[k]){ctx.globalAlpha=alpha;let light=52-tile.x*8+Math.sin(tile.t*8+k)*3;path(tile.ps,`hsl(${[194,257,164][k]} 29% ${light}%)`,1,true);path([...tile.ps,tile.ps[0]],'#ddf9ff3b',.45);}
  }ctx.globalAlpha=1;
  // Permanent amber slice, with no person or parameter dashboard.
  const first=Array.from({length:81},(_,i)=>point(0,-2+i*.05,0));path([...first,[first.at(-1)[0],first.at(-1)[1]+13],[first[0][0],first[0][1]+13]],'#53849855',1,true);ctx.shadowBlur=8;ctx.shadowColor='#ffdda2';path(first,'#ffe1a0',2.8);ctx.shadowBlur=0;
  for(let k=0;k<3;k++){const amount=clamp(reveal-k);if(amount<=0)continue;ctx.globalAlpha=amount;
   // Ghost contours and endpoint slices convey distinct folded parameter views.
   for(const t of [.25,.5,.75,1])path(Array.from({length:51},(_,i)=>point(k,-2+i*.08,t)),COLORS[k]+'78',.8);
   ctx.shadowBlur=8;ctx.shadowColor=COLORS[k];path(routes[k],COLORS[k],2.7);ctx.shadowBlur=0;
   const end=STOPS[k+1];orb(end,COLORS[k]);ctx.globalAlpha=1;
  }
  orb(STOPS[0],'#ffc665');
  // Label only the current and last revealed minima to keep narrow screens clear.
  const level=Math.ceil(reveal-.001),names=[['Visible bottom','眼前谷底'],['Lower point A','更低点 A'],['Lower point B','更低点 B'],['Deeper point C','更深点 C']];
  if(level===0)label(...names[0],[STOPS[0][0]-68,STOPS[0][1]+34]);
  else{let previous=Math.max(0,level-1);label(...names[previous],[STOPS[previous][0]-72,STOPS[previous][1]+25]);let end=STOPS[level];label(...names[level],[end[0]+88,end[1]-12]);}
  const layer=Math.min(2,Math.floor(travel)),pos=center(layer,travel>=3?1:travel-layer);orb(pos,'#fff4c8',6);
  if(reveal<3){let k=Math.floor(reveal),amount=1-(reveal-k),p=STOPS[k+1];ctx.globalAlpha=amount*.9;let g=ctx.createRadialGradient(p[0]+80,p[1]-20,5,p[0]+80,p[1]-20,130);g.addColorStop(0,'#edf3f9e8');g.addColorStop(1,'#edf3f900');ctx.fillStyle=g;ctx.fillRect(p[0]-60,p[1]-140,290,260);ctx.globalAlpha=1;
   if(reveal===0)label('More directions, still hidden','还有未显露的方向',[660,123]);
  }
  root.dataset.state=state;root.dataset.reveal=reveal.toFixed(3);root.dataset.travel=travel.toFixed(3);root.dataset.playing=String(playing);root.dataset.phase=phase;root.dataset.elapsed=elapsed.toFixed(3);
 }
 function resize(){frame.style.transform=host.clientWidth<640?'':`scale(${host.clientWidth/960})`;let box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));draw();}
 function ui(){let key=state+':'+playing+':'+phase;if(uiKey!==key){uiKey=key;$('.hv-caption').innerHTML=bi(...CAPTIONS[state]);$('.hv-badge').innerHTML=bi(`Hidden directions · ${state} / 3`,`已显露隐藏方向 · ${state} / 3`);root.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.step===state)));$('.hv-play').innerHTML=bi(playing?'Pause auto':'Resume auto',playing?'暂停自动播放':'继续自动播放');}$('input').value=Math.round(reveal*100);}
 function schedule(){if(!raf&&!disposed&&!blocked()&&(playing||tween))raf=requestAnimationFrame(tick);}
 function tick(now){raf=0;const dt=last===null?0:(now-last)/1000;last=now;
  if(tween){tween.t+=dt;let t=smooth(Math.min(1,tween.t/1.8));reveal=tween.r+(tween.to-tween.r)*t;travel=tween.p+(tween.to-tween.p)*t;if(tween.t>=1.8)tween=null;}
  if(playing){elapsed+=dt;({state,reveal,travel,phase}=storyAt(elapsed));}ui();draw();schedule();
 }
 function choose(n){playing=false;manual=true;state=n;phase='hold';if(blocked()){reveal=n;travel=n;tween=null;}else tween={r:reveal,p:travel,to:n,t:0};last=null;ui();draw();schedule();}
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>choose(+b.dataset.step));
 $('.hv-reset').onclick=()=>{elapsed=0;state=0;reveal=0;travel=0;playing=true;manual=false;tween=null;last=null;ui();draw();schedule();};
 $('input').oninput=e=>{playing=false;manual=true;tween=null;travel=0;reveal=+e.target.value/100;state=Math.ceil(reveal);phase='reveal';ui();draw();};
 $('.hv-play').onclick=()=>{if(mq.matches){choose((state+1)%4);return;}playing=!playing;tween=null;if(playing&&manual){elapsed=0;manual=false;}last=null;ui();draw();schedule();};
 function sync(){cancelAnimationFrame(raf);raf=0;last=null;schedule();}
 $('.hv-original').onclick=()=>{root.hidden=true;original.hidden=false;sync();};back.onclick=()=>{original.hidden=true;root.hidden=false;resize();sync();};
 const ro=new ResizeObserver(resize);ro.observe(host);const mo=new MutationObserver(sync);mo.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);mq.addEventListener('change',sync);
 ui();resize();schedule();document.fonts.ready.then(()=>{if(!disposed)draw();});
 return ()=>{disposed=true;cancelAnimationFrame(raf);ro.disconnect();mo.disconnect();document.removeEventListener('visibilitychange',sync);mq.removeEventListener('change',sync);};
}