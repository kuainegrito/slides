import {createParticleField} from './scene-particles.js?v=20261117-scenes2';
const NS='http://www.w3.org/2000/svg';
export function mountAgentScene(host,slide,edition){
 const kind=slide.interactive.slice(6),teacher=edition==='teacher',root=document.createElement('section');root.className='agent-lab';root.dataset.kind=kind;host.append(root);
 root.innerHTML=`<svg viewBox="0 0 1080 580" role="img" aria-label="${slide.title}"><defs><radialGradient id="as-halo"><stop stop-color="#58cce1" stop-opacity=".4"/><stop offset="1" stop-color="#7c8ec9" stop-opacity="0"/></radialGradient></defs></svg><div class="agent-original" hidden></div><nav class="agent-controls"><button data-action="pause">暂停 / Pause</button><button data-action="replay">重播 / Replay</button><button data-action="next">下一步 / Next step</button>${kind==='bridge'?'<button data-action="reveal">揭晓：还缺什么？</button>':''}${kind==='care'?'<button data-action="approve">模拟确认采购</button><button data-action="stock">模拟：库存足够</button>':''}${kind==='weather'?'<button data-action="failure">演示工具失败</button><button data-action="retry">模拟重试成功</button>':''}${slide.originalSvg?'<button data-action="original">原 Agent 图 / Original</button>':''}</nav>`;
 const svg=root.querySelector('svg'),make=(tag,attrs={},parent=svg)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;},path=(d,c='#508faa',w=2,parent=svg)=>make('path',{d,fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},parent);
 const text=(x,y,s,size=17,parent=svg,zh=false,color='#3f3f46')=>{const n=make('text',{x,y,'font-size':size,fill:zh?'#7030a0':color,...(zh?{class:'zh'}:{})},parent);n.textContent=s;return n;};
 const label=(x,y,en,zh,parent=svg,size=17)=>{text(x,y,en,size,parent);text(x,y+25,zh,size+1,parent,true);};
 const fx=createParticleField(svg,make,path),motions=[];
 function icon(type,x,y,scale=1,parent=svg){
  const g=make('g',{transform:`translate(${x} ${y}) scale(${scale})`,'data-icon':type},parent),c='#548fac';make('circle',{r:51,fill:'#f6fbff',stroke:'#b5d3e2','stroke-width':1},g);
  const p=(d,color=c,w=2)=>path(d,color,w,g),circle=(cx,cy,r,fill=c)=>make('circle',{cx,cy,r,fill},g);
  if(type==='brain'){p('M-2 -28 C-23 -43 -37 -23 -31 -11 C-46 0 -33 24 -19 21 C-17 40 0 32 0 20 M2 -28 C23 -43 37 -23 31 -11 C46 0 33 24 19 21 C17 40 0 32 0 20 M0 -30 V28','#8864af',3);p('M-21 -20 Q-5 -21 -11 -5 M-29 5 Q-12 -7 -8 17 M21 -20 Q5 -21 11 -5 M29 5 Q12 -7 8 17','#8864af',2);for(let i=0;i<14;i++){const a=i*2.399,n=circle(Math.cos(a)*(15+i%3*5),Math.sin(a)*25,2,'#7c6bc0');motions.push(t=>n.setAttribute('opacity',.25+.7*Math.sin(t+i)**2));}}
  if(type==='mum'){make('ellipse',{cx:0,cy:-8,rx:30,ry:33,fill:'#425c7e'},g);circle(0,-9,22,'#efd1bc');p('M-22 -15 Q0 -40 23 -13','#425c7e',7);circle(-8,-10,2,'#3e485c');circle(8,-10,2,'#3e485c');p('M-6 1 Q0 7 7 0','#9e6b72',2);p('M-36 40 Q-30 16 0 17 Q30 16 36 40','#9274b5',18);p('M-14 22 L0 33 L14 22','#f3e8f7',3);}
  if(type==='fridge'){p('M-24 -38 H25 V39 H-24 Z M-24 -8 H25 M-14 -28 V-17 M-14 4 V18',c,3);const door=p('M25 -38 L40 -29 V43 L25 39',c,2);motions.push(t=>door.setAttribute('opacity',.3+.7*Math.sin(t)**2));circle(4,8,8,'#e2ae68');p('M2 -1 l4 -4','#679c83',2);p('M-4 27 H16','#b5cad8',3);}
  if(type==='cart'){p('M-35 -29 H-25 L-16 18 H25 L34 -17 H-22 M-14 -5 H24 M-10 7 H19',c,3);circle(-10,29,5);circle(22,29,5);circle(0,-24,9,'#94b789');p('M15 -28 V-13','#dfb26c',9);}
  if(type==='check'){p('M-23 -34 H13 L25 -22 V35 H-23 Z M13 -34 V-22 H25',c,2);p('M-15 0 l12 13 l23 -27','#57a597',5);}
  if(type==='plate'){make('ellipse',{cx:0,cy:6,rx:31,ry:21,fill:'#e0edf4',stroke:c,'stroke-width':2},g);make('ellipse',{cx:0,cy:6,rx:23,ry:14,fill:'#edce98'},g);circle(-9,3,7,'#85ad84');circle(10,8,5,'#c78b7f');p('M-40 -21 V27 M-44 -21 V-9 H-35 V-21 M40 -21 V27',c,2);const steam=p('M-12 -15 q-8 -10 0 -18 M5 -15 q-8 -10 0 -18','#a0becf',2);motions.push(t=>steam.setAttribute('transform',`translate(0 ${Math.sin(t*2)*3})`));}
  if(type==='plan'){p('M-25 -32 H25 V32 H-25 Z',c,2);for(let i=0;i<3;i++){p(`M-15 ${-17+i*17} l4 4 l7 -8`,'#9374b5',2);p(`M3 ${-17+i*17} H17`,c,2);}}
  if(type==='weather'){circle(15,-20,12,'#e7bc6e');p('M-32 8 Q-40 -8 -20 -11 Q-10 -32 11 -13 Q33 -16 34 7 Z',c,2);const drops=[];for(let i=0;i<5;i++)drops.push(p(`M${-22+i*11} 17 l-5 10`,'#6da6c5',2));motions.push(t=>drops.forEach((n,i)=>n.setAttribute('transform',`translate(0 ${(t*14+i*3)%9})`)));}
  if(type==='umbrella'){p('M-36 -3 Q0 -51 36 -3 Q25 -14 13 -3 Q0 -15 -13 -3 Q-25 -14 -36 -3 M0 -29 V26 Q0 39 -12 31','#8669ad',3);}
  if(type==='slides'){p('M-35 -27 H35 V20 H-35 Z M0 20 V38 M-15 38 H15',c,3);p('M-25 -15 H3 M-25 -5 H-2',c,2);p('M9 9 V-8 M20 9 V-18','#8d73b6',5);}
  if(type==='translate'){p('M-38 -28 H10 V4 H-13 l-13 12 V4 H-38 Z M1 -6 H38 V27 H24 l-4 9 V27 H1',c,2);text(-26,-6,'A',22,g);text(9,20,'文',19,g,true);}
  if(type==='web'){p('M-39 -30 H39 V30 H-39 Z M-39 -16 H39',c,2);p('M-20 -4 l-10 9 l10 9 M20 -4 l10 9 l-10 9 M7 -9 L-5 22','#9674b5',3);}
  return g;
 }
 text(34,43,slide.titleEn,26);text(34,80,slide.titleZh,30,svg,true);
 let shoppingFlows=[],directFlow=null,nodes=[],activeLabel,detail,subtitle,revealed=false,approved=false,stockFull=false,failed=false,elapsed=0,last=null,raf=0,disposed=false,paused=false,original=false;
 const foot=(s)=>text(35,558,s,11,svg,false,'#65788c');
 if(kind==='bridge'){
  label(36,123,'We can already make one useful output.','先把一个成果做好。',svg,16);
  [['slides','Slides','做 PPT'],['translate','Translation','翻译'],['web','A simple page','简单网页']].forEach(([type,en,zh],i)=>{icon(type,185+i*342,236,1.25);label(119+i*342,332,en,zh,svg,20);});
  text(100,422,'What is still missing when the task has many steps?',25);text(100,457,'AI 目前还缺啥？先说说你的看法。',28,svg,true);
  const answer=make('g',{'data-answer':'bridge'});label(100,504,'Plan → tools → feedback → check','计划 → 调工具 → 看反馈 → 检查结果',answer,21);nodes=[answer];
  foot('Discuss before revealing. A single translation may only need chat. / 先讨论再揭晓；单次翻译不必强行使用 Agent。');
 }else if(kind==='care'){
  label(36,123,'“I am hungry.”','“我饿了。”',svg,19);icon('mum',183,314,1.65);icon('brain',183,179,.58);fx.converge(300,314,'#8870b5',0);
  text(66,435,'Think + organise + act',18);text(70,465,'模型推理 ＋ 系统统筹执行',19,svg,true);
  const steps=[['plan',432,188,'Make a plan','计划吃什么'],['fridge',642,188,'Check inventory','查已提供的冰箱清单'],['cart',852,188,'Draft groceries','缺菜 → 列采购草稿'],['check',852,397,'Ask before paying','付款前请你确认'],['plate',642,397,'Check the outcome','核对用餐安排']];
  steps.forEach(([type,x,y,en,zh],i)=>{const routes=['M300 314 C360 314 338 188 390 188','M483 188 C520 173 560 203 591 188','M693 188 C730 174 770 201 801 188','M902 188 C965 188 965 397 902 397','M801 397 C758 381 727 413 693 397'];const line=fx.stream(routes[i],'#699cb8',i*3,9);if(i===2||i===3)shoppingFlows.push(line);const g=make('g',{'data-step':i});icon(type,x,y,1,g);label(x-78,y+72,en,zh,g,14);nodes.push(g);});
  directFlow=fx.stream('M642 239 C600 270 600 317 642 346','#73a796',9,10);fx.stream('M591 397 C480 480 350 435 300 314','#997cb8',15,12);
  activeLabel=text(390,516,'',19,svg,true);foot('生活类比：照料者不限性别。Agent 需已连接、获授权的工具；本页不会读冰箱、采购或做饭。');
 }else if(kind==='weather'){
  label(36,123,'“I am going out this afternoon.”','“下午我要出门。”先明确地点、时间，再查工具。',svg,18);
  const steps=[['plan',132,'Place + time','明确地点与时间'],['weather',400,'Weather tool','查天气（模拟）'],['brain',668,'Read the result','看反馈，改计划'],['umbrella',936,'Ready to leave','整理出门清单']];
  steps.forEach(([type,x,en,zh],i)=>{if(i)fx.stream(`M${x-210} 272 C${x-160} 250,${x-110} 292,${x-52} 272`,'#669db5',i*3,11);const g=make('g',{'data-step':i});icon(type,x,272,1.25,g);label(x-95,375,en,zh,g,16);nodes.push(g);});
  activeLabel=text(80,458,'',23,svg,true);detail=text(80,492,'',16);foot('Classroom simulation, not live weather. / 课堂模拟，不是真实天气；工具失败时保持“未知”，重试或请人核查。');
 }else{
  label(36,123,teacher?'Build a checked teaching package.':'Build a checked study package.',teacher?'目标：一份可试讲、可核验的教学包。':'目标：一份能自测、能独立解释的复习包。',svg,18);
  const steps=[['plan',144,'Give a clear goal','目标与验收'],['slides',410,'Use supplied sources','读材料、做课件'],['web',676,'Build + test','做练习页、运行检查'],['check',942,'Review + deliver','核验后交付']];
  steps.forEach(([type,x,en,zh],i)=>{if(i)fx.stream(`M${x-213} 268 C${x-159} 242,${x-110} 293,${x-53} 268`,'#8b7bb1',i*3,10);const g=make('g',{'data-step':i});icon(type,x,268,1.2,g);label(x-95,368,en,zh,g,16);nodes.push(g);});
  label(50,453,'You set the boundary. You judge the result.','你定边界，也负责验收。',svg,22);
  text(50,517,teacher?'检查来源、知识准确性与目标适配；正式发布或发送前由你确认。':'检查来源、运行结果与自己的理解；正式提交或发送前由你确认。',18,svg,true);
  foot('Next: see how a multi-tool project becomes an interactive simulator. / 下一步：看多工具协作怎样做出可交互模拟器。');
 }
 const panel=root.querySelector('.agent-original');if(slide.originalSvg)panel.innerHTML=slide.originalSvg;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),off=()=>document.documentElement.classList.contains('motion-paused')||(reduce.matches&&!document.documentElement.classList.contains('motion-playing'));
 if(off()){elapsed=kind==='care'?12:18;paused=true;}
 function render(){const began=performance.now();fx.flowTick(elapsed);motions.forEach(fn=>fn(elapsed));root.dataset.elapsed=elapsed.toFixed(3);root.dataset.approved=String(approved);root.dataset.stockFull=String(stockFull);root.dataset.failed=String(failed);
  if(kind==='bridge')nodes[0].setAttribute('opacity',revealed?1:0);
  else nodes.forEach((g,i)=>{g.setAttribute('opacity',elapsed>=i*3?1:.18);g.setAttribute('transform',`translate(0 ${elapsed>=i*3?Math.sin(elapsed+i)*2:0})`);});
  if(kind==='care'){const waiting=elapsed>=12&&!approved&&!stockFull;root.dataset.waiting=String(waiting);root.querySelector('[data-action=approve]').disabled=!waiting;root.querySelector('[data-action=stock]').textContent=stockFull?'模拟：缺菜':'模拟：库存足够';activeLabel.textContent=stockFull?'库存足够 → 使用现有食材，跳过采购。':waiting?'采购草稿准备好了：请你确认，再往下做。':approved?'模拟确认已收到 → 检查清单与用餐安排。':'先理解需求，再查已有条件，缺什么才补什么。';shoppingFlows.forEach(g=>g.style.display=stockFull?'none':'');directFlow.style.display=stockFull?'':'none';if(stockFull){nodes[2].setAttribute('opacity','.15');nodes[3].setAttribute('opacity','.15');}nodes[4].setAttribute('opacity',approved||(stockFull&&elapsed>=12)?1:.18);}

  if(kind==='weather'){activeLabel.textContent=elapsed<3?'先问清楚：在哪里、几点出门？':failed?'工具失败 ≠ 天气晴朗。先保留未知。':elapsed<6?'正在读取天气工具的返回结果（模拟）…':'模拟返回：下午有雨 → 带伞、调整出门安排。';detail.textContent=failed?'No forecast available. Retry or ask a person. / 不能编造天气；点击“模拟重试成功”继续。':'Read → interpret → update → check / 读取 → 判断 → 调整 → 检查';nodes[3].setAttribute('opacity',!failed&&elapsed>=9?1:.18);}
  root.querySelector('[data-action=pause]').textContent=paused?'播放 / Play':'暂停 / Pause';root.sceneRenderMs=performance.now()-began;
 }
 function running(){return !disposed&&!paused&&!original&&!document.hidden&&!off()&&!(kind==='care'&&elapsed>=12&&!approved&&!stockFull)&&!(kind==='weather'&&failed);}
 function tick(now){raf=0;if(!running()){last=null;return;}if(last!==null)elapsed+=(now-last)*1.2/1000;if(kind==='care'&&!approved&&!stockFull)elapsed=Math.min(elapsed,12);last=now;render();if(running())raf=requestAnimationFrame(tick);}
 function schedule(){cancelAnimationFrame(raf);last=null;raf=running()?requestAnimationFrame(tick):0;}
 const controls=root.querySelector('nav');function click(e){const a=e.target.closest('button')?.dataset.action;if(!a)return;if(a==='pause')paused=!paused;if(a==='replay'){elapsed=0;paused=false;approved=false;stockFull=false;failed=false;revealed=false;original=false;panel.hidden=true;}
  if(a==='next'){elapsed=Math.min(18,elapsed+3);if(kind==='care'&&!approved&&!stockFull)elapsed=Math.min(elapsed,12);paused=true;}
  if(a==='stock'){stockFull=!stockFull;approved=false;elapsed=6;paused=false;}
  if(a==='reveal')revealed=!revealed;if(a==='approve'&&elapsed>=12){approved=true;elapsed=15;paused=false;}
  if(a==='failure'){failed=true;elapsed=6;}if(a==='retry'){failed=false;elapsed=6;paused=false;}if(a==='original'){original=!original;panel.hidden=!original;}
  render();schedule();}
 controls.addEventListener('click',click);const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',schedule);reduce.addEventListener('change',schedule);render();schedule();
 return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',schedule);reduce.removeEventListener('change',schedule);controls.removeEventListener('click',click);root.remove();};
}
