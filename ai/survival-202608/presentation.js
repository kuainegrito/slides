let steps=[],shown=0,first=false,last=false;
export function prepareSteps(content,isFirst=false,isLast=false){
 first=isFirst;last=isLast;
 steps=[];shown=0;
 const svg=content.querySelector(':scope > svg');if(!svg)return;
 const y=e=>parseFloat(e.getAttribute('y')||e.querySelector('text')?.getAttribute('y')||'0');
 const children=[...svg.children];
 const bullets=children.filter(e=>e.tagName.toLowerCase()==='text'&&/^[•●▪‣]$/.test(e.textContent.trim()));
 if(bullets.length){
  bullets.sort((a,b)=>y(a)-y(b));
  for(let i=0;i<bullets.length;i++){
   const start=y(bullets[i]),end=i+1<bullets.length?y(bullets[i+1]):540;
   const group=children.filter(e=>e.tagName.toLowerCase()==='text'&&y(e)>=start-.5&&y(e)<end-.5);
   if(group.length)steps.push(group);
  }
 }else{
  const pairs=children.filter(e=>e.classList.contains('bi-pair')&&e.querySelector('text')?.getAttribute('text-anchor')!=='middle'&&y(e)>100&&y(e)<460);
  if(pairs.length>=3)steps=pairs.map(e=>{const group=[e];let prev=e.previousElementSibling;while(prev&&(prev.tagName.toLowerCase()==='circle'||(prev.tagName.toLowerCase()==='text'&&/^\d+[.)]?$/.test(prev.textContent.trim())))){group.unshift(prev);prev=prev.previousElementSibling;}return group;});
 }
 for(const group of steps)for(const e of group){e.style.visibility='hidden';e.setAttribute('aria-hidden','true');}
 sync();
}
function sync(){const next=document.getElementById('next');if(next)next.disabled=last&&shown===steps.length;const prev=document.getElementById('prev');if(prev)prev.disabled=first&&shown===0;}
export function revealNext(){if(shown>=steps.length)return false;for(const e of steps[shown++]){e.style.visibility='visible';e.removeAttribute('aria-hidden');}sync();return true;}
export function hidePrevious(){if(!shown)return false;for(const e of steps[--shown]){e.style.visibility='hidden';e.setAttribute('aria-hidden','true');}sync();return true;}
export function installPresentation(){
 const stage=document.getElementById('stage'),nav=document.createElement('nav');nav.className='slide-navigation';nav.setAttribute('aria-label','Slide navigation / 幻灯片翻页');
 nav.append(document.getElementById('prev'),document.getElementById('next'));stage.append(nav);
 const css=document.createElement('style');css.textContent=`
 .slide-navigation{position:absolute;right:8px;bottom:6px;z-index:30;display:flex;gap:4px}
 .slide-navigation button{width:32px;height:26px;border:1px solid #73849a44;border-radius:5px;background:#e7f1f7cc;color:#3f3f46;cursor:pointer;font:18px sans-serif;padding:0}
 .slide-navigation button:disabled{opacity:.25;cursor:default}
 #viewport:fullscreen{width:100vw;height:100dvh;max-height:none;min-height:0;background:#000;display:flex;align-items:center;justify-content:center}
 #viewport:fullscreen #stage{width:min(100vw,calc(100dvh * 16 / 9));max-width:none;aspect-ratio:16/9;border-radius:0;box-shadow:none}
 `;document.head.append(css);
}
