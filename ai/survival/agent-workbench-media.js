// Real recordings; the slide clock owns playback, seeking and disposal.
export function createWorkbenchMedia(svg, make) {
 const ns='http://www.w3.org/1999/xhtml', foreign=make('foreignObject',{x:54,y:180,width:672,height:302,'data-studio-media':''});
 const frame=document.createElementNS(ns,'div');frame.style.cssText='position:relative;width:100%;height:100%;overflow:hidden;perspective:900px;background:#0b1728;border-radius:5px';foreign.append(frame);
 let playing=false,disposed=false,clock=0,lastClock=null;
 const movies=['cycling','heart'].map(name=>{
  const pane=document.createElementNS(ns,'div');pane.style.cssText='position:absolute;overflow:hidden;background:#091321;border:1px solid #82b7cb55;box-sizing:border-box;transform-origin:50% 50%';
  const video=document.createElementNS(ns,'video');video.dataset.capture=name;video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.playbackRate=1.2;
  video.setAttribute('aria-label',name==='cycling'?'Cycling gameplay recording / 骑行游戏真实录屏':'CardiacCycle 3D recording / 心脏真实录屏');
  video.src=new URL(`./agent-media/${name}-v1.mp4`,import.meta.url).href;video.poster=new URL(`./agent-media/${name}-v1.webp`,import.meta.url).href;video.style.cssText='width:100%;height:100%;object-fit:contain;display:block';
  const note=document.createElementNS(ns,'div');note.textContent='Recording unavailable; still frame / 录屏不可用，显示静态截图';note.style.cssText='display:none;position:absolute;bottom:8px;left:8px;color:#fff;background:#652c3b;padding:5px;font:12px sans-serif';pane.append(video,note);frame.append(pane);
  video.addEventListener('error',()=>{if(!disposed){note.style.display='block';svg.dataset.mediaError='true';}});
  video.addEventListener('loadedmetadata',()=>{if(!disposed){video.currentTime=clock%video.duration;if(playing)video.play().catch(()=>{});}});
  return {pane,video};
 });
 const lerp=(a,b,p)=>a+(b-a)*p,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function layout(step,film){
  if(step===1)return [[414,23,238,132,1,0],[414,164,238,132,1,0]];
  if(step===2)return [[13,48,310,202,1,-7],[347,38,310,202,1,7]];
  if(step===3)return [[20,63,292,165,1,0],[355,63,292,165,1,0]];
  if(step>=4){const h=step===4?218:288,fade=smooth((film-3.6)/.7),split=smooth((film-7.6)/.7);return [[0,47*split,lerp(672,332,split),lerp(h,h-88,split),film<7.6?1-fade:split,0],[340*split,47*split,lerp(672,332,split),lerp(h,h-88,split),fade,0]];}
  return [[12,47,315,200,1,0],[345,47,315,200,1,0]];
 }
 return {
  tick(t,{step,local,filmTime,previousStep,transition,repair}){
   const mediaClock=step>=4?filmTime:t;clock=mediaClock;const target=layout(step,filmTime),from=layout(previousStep,filmTime);
   movies.forEach(({pane,video},i)=>{const v=target[i].map((n,k)=>lerp(from[i][k],n,transition));pane.style.left=v[0]+'px';pane.style.top=v[1]+'px';pane.style.width=v[2]+'px';pane.style.height=v[3]+'px';pane.style.opacity=v[4];pane.style.transform=`rotateY(${v[5]}deg) rotateZ(${v[5]*.16}deg)`;pane.style.clipPath=step===2?`inset(0 ${100*(1-smooth((local-.4-i*.55)/2.6))}% 0 0)`:'none';if(video.readyState&&(lastClock===null||Math.abs(mediaClock-lastClock)>.45))video.currentTime=mediaClock%video.duration;});
   frame.style.background=step===1||step===2||step===3?'transparent':'#0b1728';foreign.dataset.mode=step>=4?(filmTime<3.6?'cycling':filmTime<7.6?'heart':'split'):'sources';foreign.dataset.repair=String(repair);lastClock=mediaClock;
  },
  setPlaying(value){if(playing===value)return;playing=value;for(const {video} of movies)if(value)video.play().catch(()=>{});else video.pause();},
  dispose(){disposed=true;playing=false;for(const {video} of movies){video.pause();video.removeAttribute('src');video.load();}foreign.remove();}
 };
}
