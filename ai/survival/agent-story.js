import {buildDomesticStory,storyArt} from './agent-story-art.js?v=20261117-story1';
import {buildWorkbench,nextWorkbenchTime} from './agent-workbench.js?v=20261118-colors1';
export function mountAgentStory(host,slide,edition){
 const kind=slide.interactive.slice(6),root=document.createElement('section');root.className='agent-lab agent-story';root.dataset.kind=kind;host.append(root);
 root.innerHTML=`<svg viewBox="0 0 1080 580" role="img" aria-label="${slide.title}"></svg><div class="agent-original" hidden></div><nav class="agent-controls"><button data-action="pause">Pause / 暂停</button><button data-action="replay">Replay / 重播</button><button data-action="next">Next scene / 下一幕</button>${kind==='care'?'<button data-action="approve">模拟确认采购</button><button data-action="stock">模拟：库存足够</button>':kind==='weather'?'<button data-action="failure">演示工具失败</button><button data-action="retry">模拟重试成功</button>':'<button data-action="failure">Show error / 演示错误</button><button data-action="retry">Repair / 修复复查</button><button data-action="film">Play film / 播放成片</button><a href="../agent-media/SOURCES.md" target="_blank" rel="noopener">Sources / 素材来源</a>'}${slide.originalSvg?'<button data-action="original">原 Agent 图 / Original</button>':''}</nav>`;
 const svg=root.querySelector('svg'),{text}=storyArt(svg);text(34,43,slide.titleEn,26);text(34,81,slide.titleZh,29,svg,true);
 const art=kind==='workbench'?buildWorkbench(svg,edition):buildDomesticStory(svg,kind);
 if(kind!=='workbench')text(38,574,'连续生活类比 · 所有采购和天气均为模拟；实际 Agent 需已连接、获授权的工具。',11,svg,false,'#64768b');
 else {text(35,565,'Real app recordings + HTML composition; Word, Blender, PPTX and FFmpeg operations are workflow demonstrations.',9,svg,false,'#64768b');text(35,578,'真实应用录屏 + HTML 编排；Word、Blender、PPTX 与 FFmpeg 操作为过程演示。',9,svg,false,'#64768b');}
 let elapsed=0,paused=false,approved=false,stockFull=false,failed=false,repaired=false,original=false,disposed=false,last=null,raf=0,repairAt=null;
 const panel=root.querySelector('.agent-original');if(slide.originalSvg)panel.innerHTML=slide.originalSvg;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),off=()=>document.documentElement.classList.contains('motion-paused')||(reduce.matches&&!document.documentElement.classList.contains('motion-playing'));
 if(off()){elapsed=kind==='care'?12:kind==='workbench'?37:24;paused=true;}
 const waiting=()=>kind==='care'&&elapsed>=12&&!approved&&!stockFull;
 function render(){const start=performance.now();const scene=art.tick(elapsed,{approved,stockFull,failed});if(kind==='workbench')repaired=!!scene?.repaired;root.dataset.elapsed=elapsed.toFixed(3);root.dataset.approved=String(approved);root.dataset.stockFull=String(stockFull);root.dataset.failed=String(failed||!!scene?.failed);root.dataset.waiting=String(waiting());root.dataset.repaired=String(repaired);root.querySelector('[data-action=pause]').textContent=paused?'Play / 播放':'Pause / 暂停';if(kind==='care'){root.querySelector('[data-action=approve]').disabled=!waiting();root.querySelector('[data-action=stock]').textContent=stockFull?'模拟：缺菜':'模拟：库存足够';}root.sceneRenderMs=performance.now()-start;}
 const running=()=>!disposed&&!paused&&!original&&!document.hidden&&!off()&&!waiting()&&!failed;
 function tick(now){raf=0;if(!running()){last=null;art.setPlaying?.(false);return;}if(last!==null)elapsed+=(now-last)*1.2/1000;if(kind==='care'&&!approved&&!stockFull)elapsed=Math.min(elapsed,12);last=now;render();if(running())raf=requestAnimationFrame(tick);}
 function schedule(){cancelAnimationFrame(raf);last=null;art.setPlaying?.(running());raf=running()?requestAnimationFrame(tick):0;}
 function click(e){const a=e.target.closest('button')?.dataset.action;if(!a)return;
  if(a==='pause')paused=!paused;
  if(a==='replay'){elapsed=0;paused=false;approved=false;stockFull=false;failed=false;repaired=false;repairAt=null;original=false;panel.hidden=true;}
  if(a==='next'){elapsed=kind==='workbench'?nextWorkbenchTime(elapsed):Math.min(30,elapsed+3);if(kind==='care'&&!approved&&!stockFull)elapsed=Math.min(elapsed,12);paused=true;}
  if(a==='approve'&&waiting()){approved=true;elapsed=12;paused=false;}
  if(a==='stock'){stockFull=!stockFull;approved=false;elapsed=3;paused=false;}
  if(a==='failure'){failed=true;repaired=false;repairAt=null;elapsed=kind==='workbench'?28.8:6;}
  if(a==='retry'){failed=false;paused=false;if(kind==='workbench'){elapsed=30;repairAt=30;}else elapsed=6;}
  if(a==='film'&&kind==='workbench'){elapsed=35;failed=false;repaired=true;paused=false;}
  if(a==='original'){original=!original;panel.hidden=!original;}
  render();schedule();
 }
 root.querySelector('nav').addEventListener('click',click);const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',schedule);reduce.addEventListener('change',schedule);render();schedule();
 return()=>{disposed=true;cancelAnimationFrame(raf);art.dispose?.();observer.disconnect();document.removeEventListener('visibilitychange',schedule);reduce.removeEventListener('change',schedule);root.querySelector('nav').removeEventListener('click',click);root.remove();};
}
