/* P11: native SVG reconstruction. The 8-second timeline and 3.2M counter are
   an illustrative digitization metaphor, NOT a historical measurement. */
export const DIGITAL_DURATION=8;
export function growthAt(seconds){const t=Math.max(0,Math.min(DIGITAL_DURATION,seconds));const p=t/DIGITAL_DURATION;return {time:t,progress:p,count:Math.round(3200000*(Math.exp(4.2*p)-1)/(Math.exp(4.2)-1)),done:t>=DIGITAL_DURATION};}
export function mountDigitalGrowth(content){
 if(!content.querySelector('image[href$="b02db6386e8a4a4a.webp"]'))return null;
 const svg=content.querySelector(':scope > svg'),ns='http://www.w3.org/2000/svg';
 const make=(tag,attrs={},parent=svg)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;};
 svg.replaceChildren();svg.classList.add('digital-growth');svg.setAttribute('role','img');svg.setAttribute('aria-label','The explosive growth of data / 数据的爆炸性增长。八秒数字化示意，数量不是历史统计。');
 const title=make('title');title.textContent='The explosive growth of data / 数据的爆炸性增长';
 const desc=make('desc');desc.textContent='Books, newspapers and discs become online messages, images, music, learning and video. A blue-violet curve rises to an illustrative 3,200,000 content items. This is a visual metaphor, not measured historical data.';
 const defs=make('defs');defs.innerHTML=`
 <linearGradient id="dg-line"><stop stop-color="#65bddb"/><stop offset=".45" stop-color="#6583ee"/><stop offset="1" stop-color="#8c43df"/></linearGradient>
 <linearGradient id="dg-tile" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#cce5f4"/></linearGradient>
 <radialGradient id="dg-cloud"><stop stop-color="#adccf2" stop-opacity=".36"/><stop offset="1" stop-color="#a2c4ee" stop-opacity="0"/></radialGradient>
 <linearGradient id="dg-area" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#80bde9" stop-opacity=".02"/><stop offset="1" stop-color="#a09aed" stop-opacity=".19"/></linearGradient>
 <symbol id="dg-book" viewBox="0 0 48 48"><path d="M5 9Q14 5 24 11Q34 5 43 9V38Q33 34 24 40Q14 34 5 38Z" fill="#f5e9d9"/><path d="M24 11V40M10 15L19 16M10 21L19 22M29 16L38 15M29 22L38 21"/></symbol>
 <symbol id="dg-paper" viewBox="0 0 48 48"><path d="M9 5H37V42H9Z" fill="#fff"/><path d="M14 11H32M14 17H32M14 23H22M26 23H32M14 29H22M26 29H32M14 35H32"/></symbol>
 <symbol id="dg-disc" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#e9def1"/><circle cx="24" cy="24" r="5" fill="#f6fbfe"/><path d="M12 13L18 19M30 30L36 36M13 34L18 29"/></symbol>
 <symbol id="dg-computer" viewBox="0 0 48 48"><path d="M5 5H43V32H5Z" fill="#cee9f3"/><path d="M10 10H38V27H10Z" fill="#537fa9"/><path d="M20 33V38H28V33M3 39H45V43H3Z" fill="#e7e0d7"/></symbol>
 <symbol id="dg-browser" viewBox="0 0 48 48"><rect x="3" y="6" width="42" height="36" rx="3" fill="#fff"/><path d="M4 15H44M9 10H10M15 10H16"/><circle cx="24" cy="28" r="9" fill="#badfee"/><path d="M15 28H33M24 19Q16 28 24 37Q32 28 24 19Z"/></symbol>
 <symbol id="dg-mail" viewBox="0 0 48 48"><rect x="3" y="9" width="42" height="30" rx="2" fill="#fdfcf9"/><path d="M4 10L24 27L44 10M4 38L18 24M44 38L30 24"/></symbol>
 <symbol id="dg-photo" viewBox="0 0 48 48"><rect x="3" y="6" width="42" height="36" rx="3" fill="#bcddee"/><circle cx="33" cy="16" r="5" fill="#f4c872" stroke="none"/><path d="M4 37L16 23L27 34L34 27L44 38" fill="#69b7b5"/></symbol>
 <symbol id="dg-music" viewBox="0 0 48 48"><path d="M19 33V9L39 5V30M19 15L39 11" fill="none" stroke-width="3"/><ellipse cx="12" cy="35" rx="7" ry="5" fill="#8697df"/><ellipse cx="32" cy="32" rx="7" ry="5" fill="#aa8be0"/></symbol>
 <symbol id="dg-video" viewBox="0 0 48 48"><rect x="3" y="7" width="42" height="34" rx="4" fill="#647fc3"/><path d="M20 15L32 24L20 32Z" fill="#fff" stroke="none"/><path d="M8 36H40" stroke="#d7e9ff"/></symbol>
 <symbol id="dg-chat" viewBox="0 0 48 48"><path d="M4 6H43V33H21L12 41V33H4Z" fill="#80ccc5"/><circle cx="13" cy="20" r="2" fill="#fff" stroke="none"/><circle cx="24" cy="20" r="2" fill="#fff" stroke="none"/><circle cx="35" cy="20" r="2" fill="#fff" stroke="none"/></symbol>
 <symbol id="dg-phone" viewBox="0 0 48 48"><rect x="12" y="3" width="24" height="42" rx="5" fill="#c6b5ee"/><path d="M16 9H32V35H16Z" fill="#eee9ff"/><path d="M21 39H27M21 20L28 24L21 28Z" fill="#8b6bd3"/></symbol>
 <symbol id="dg-cloud-icon" viewBox="0 0 48 48"><path d="M12 37C0 37 1 20 12 19C10 3 34 1 35 16C49 15 51 37 36 37Z" fill="#e2f0fc"/><path d="M24 14V32M17 24L24 32L31 24"/></symbol>
 <symbol id="dg-mic" viewBox="0 0 48 48"><rect x="17" y="4" width="14" height="26" rx="7" fill="#ae8ad7"/><path d="M11 23C11 42 37 42 37 23M24 37V44M17 44H31"/></symbol>
 <symbol id="dg-learning" viewBox="0 0 48 48"><path d="M3 18L24 8L45 18L24 28Z" fill="#6f9ec7"/><path d="M12 23V34Q24 42 36 34V23M43 19V35" fill="#b8d7ec"/></symbol>
 <symbol id="dg-meeting" viewBox="0 0 48 48"><rect x="3" y="5" width="42" height="38" rx="3" fill="#c8e1f5"/><path d="M24 6V42M4 24H44"/><g fill="#7598bf"><circle cx="13" cy="14" r="4"/><circle cx="34" cy="14" r="4"/><circle cx="13" cy="32" r="4"/><circle cx="34" cy="32" r="4"/></g><path d="M7 22Q13 16 19 22M28 22Q34 16 40 22M7 40Q13 34 19 40M28 40Q34 34 40 40"/></symbol>`;
 const text=(value,x,y,size=16,color='#3f3f46',parent=svg,anchor='start')=>{const e=make('text',{x,y,'font-size':size,fill:color,'text-anchor':anchor,'font-family':'BiSans,BiKai,sans-serif'},parent);e.textContent=value;return e;};
 text('The explosive growth of data',42,51,33);text('数据的爆炸性增长',42,93,34,'#7030a0');
 make('ellipse',{cx:800,cy:270,rx:228,ry:230,fill:'url(#dg-cloud)'});
 const binary=make('g',{'class':'dg-binary',opacity:0,'aria-hidden':'true'});
 for(let i=0;i<64;i++){const x=616+(i*71%310),y=173+(i*43%241);text(i%3===0?'101':'01',x,y,8+(i%3)*2,i%2?'#6a9ebf':'#a18bc8',binary);}
 const axis=make('g',{fill:'none',stroke:'#57779d','stroke-width':1.6});make('path',{d:'M43 162V432H919'},axis);make('path',{d:'M39 169L43 160L47 169M911 428L921 432L911 436'},axis);
 text('Data content',55,167,15);text('数据量',55,186,16,'#7030a0');
 const years=[['1990s',112],['2000s',290],['2010s',475],['2020s',655],['Now',866]];
 for(const [label,x] of years){make('path',{d:`M${x} 428V437`,stroke:'#57779d','stroke-width':1.4});text(label,x,454,14,'#3f3f46',svg,'middle');}
 text('Few online contents',109,262,13,'#3f3f46');text('Mostly offline',109,280,13);text('在线内容少，多以线下为主',109,299,15,'#7030a0');
 const d='M78 407 C330 405 643 369 804 196';
 make('path',{d:d+'L804 432H78Z',fill:'url(#dg-area)'});
 const path=make('path',{d,fill:'none',stroke:'url(#dg-line)','stroke-width':7,'stroke-linecap':'round','class':'dg-growth-curve'});const length=path.getTotalLength();path.style.strokeDasharray=String(length);
 const tip=make('path',{d:'M-12 -7L9 0L-12 7L-8 0Z',fill:'#8747d8','class':'dg-growth-tip'});
 const iconData=[
 ['book',75,395,0],['paper',119,392,.2],['disc',164,394,.4],['computer',218,385,.65],
 ['browser',297,355,1.55],['mail',347,326,1.95],['music',392,301,2.35],['photo',352,398,2.7],
 ['music',423,385,3.05],['book',479,367,3.35],['video',535,393,3.65],['photo',552,322,4.0],
 ['paper',614,268,4.35],['learning',676,291,4.55],['phone',647,357,4.8],['mic',710,361,5.0],
 ['meeting',778,358,5.2],['video',749,252,5.4],['chat',858,212,5.55],['music',835,279,5.75],
 ['phone',909,274,5.95],['cloud-icon',902,345,6.15],['photo',838,397,6.35],['learning',913,404,6.55]
 ];
 const icons=iconData.map(([type,x,y,start],i)=>{const g=make('g',{'class':'dg-icon','data-start':start,opacity:0});make('rect',{x:-23,y:-23,width:46,height:46,rx:9,fill:'url(#dg-tile)',stroke:'#abc4db','stroke-width':.8},g);make('use',{href:'#dg-'+type,x:-20,y:-20,width:40,height:40,fill:'none',stroke:i<4?'#768593':'#51799f','stroke-width':1.5,'stroke-linejoin':'round','stroke-linecap':'round'},g);return {g,x,y,start};});
 const streams=make('g',{'class':'dg-digit-streams','aria-hidden':'true'});
 const digits=Array.from({length:52},(_,i)=>{const dot=text(i%2?'1':'0',0,0,8+(i%3),'#678ad2',streams);return {dot,source:icons[i%icons.length],offset:(i*.173)%1};});
 const countGroup=make('g',{'class':'dg-counter'});text('Millions of contents',807,95,17,'#3f3f46',countGroup,'middle');text('海量内容',807,118,21,'#7030a0',countGroup,'middle');const counter=text('0',807,154,35,'#7030a0',countGroup,'middle');counter.setAttribute('class','dg-number');counter.setAttribute('font-variant-numeric','tabular-nums');text('Illustrative count · 数量示意',807,174,11,'#6e7290',countGroup,'middle');
 const footer=make('g');make('circle',{cx:200,cy:492,r:22,fill:'#d2e7f4',stroke:'#8eb7d7'},footer);make('path',{d:'M193 480Q183 480 186 492Q182 503 195 503M204 480Q216 480 213 492Q218 504 204 504M199 476V508M188 488L197 492M209 486L201 495',fill:'none',stroke:'#648ab4','stroke-width':2},footer);
 text('More data → more learning opportunities for AI',238,488,20);text('更多数据 → AI 拥有更多学习机会',238,515,23,'#7030a0');
 const controls=document.createElement('div');controls.className='dg-controls';controls.innerHTML='<button class="dg-replay" type="button" aria-label="Replay eight-second animation / 重播八秒动画">↻ Replay / 重播</button>';
 const style=document.createElement('style');style.textContent='.dg-controls{position:absolute;right:12px;top:10px;z-index:10}.dg-controls button{min-height:30px;border:1px solid #9cb9d1;border-radius:6px;padding:4px 9px;background:#f3f8fbe8;color:#3f3f46;font:12px BiSans,BiKai,sans-serif;cursor:pointer}.dg-controls button:focus-visible{outline:2px solid #7030a0;outline-offset:3px}@media(max-width:640px){.dg-controls{right:5px;top:3px}.dg-controls button{font-size:10px;min-height:28px;padding:2px 5px}}';
 content.append(style,controls);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let time=(reduced.matches||document.documentElement.classList.contains('motion-paused'))?8:0,last=0,raf=0,disposed=false;
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function render(){const state=growthAt(time),p=state.progress;svg.dataset.time=time.toFixed(3);svg.dataset.complete=String(state.done);counter.textContent=state.count.toLocaleString('en-US');path.style.strokeDashoffset=String(length*(1-p));
  const at=path.getPointAtLength(length*p),before=path.getPointAtLength(Math.max(0,length*p-1));tip.setAttribute('transform',`translate(${at.x} ${at.y}) rotate(${Math.atan2(at.y-before.y,at.x-before.x)*180/Math.PI})`);tip.setAttribute('opacity',String(ease(p*5)));
  binary.setAttribute('opacity',String(.19*ease((time-3)/4)));
  for(const icon of icons){const show=ease((time-icon.start)/.85);icon.g.setAttribute('opacity',String(show));icon.g.setAttribute('transform',`translate(${icon.x} ${icon.y+(1-show)*14}) scale(${.78+.22*show})`);}
  for(const {dot,source,offset} of digits){const a=(time*.5+offset)%1,active=time>source.start+.7&&!state.done;const x=source.x+(802-source.x)*a,y=source.y+(203-source.y)*a-35*Math.sin(a*Math.PI);dot.setAttribute('x',x);dot.setAttribute('y',y);dot.setAttribute('opacity',active?String(Math.sin(a*Math.PI)*.62):'0');}
 }
 function blocked(){return document.hidden||document.documentElement.classList.contains('motion-paused')||reduced.matches;}
 function tick(now){raf=0;if(disposed||blocked()||time>=8)return;if(last)time=Math.min(8,time+(now-last)/1000);last=now;render();if(time<8)raf=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(reduced.matches)time=8;render();svg.dataset.paused=String(blocked());if(!blocked()&&time<8)raf=requestAnimationFrame(tick);}
 function replay(e){e.stopPropagation();time=(reduced.matches||document.documentElement.classList.contains('motion-paused'))?8:0;sync();}
 controls.addEventListener('click',replay);controls.addEventListener('keydown',e=>e.stopPropagation());controls.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});controls.addEventListener('touchend',e=>e.stopPropagation(),{passive:true});
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
 return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);controls.remove();style.remove();};
}
