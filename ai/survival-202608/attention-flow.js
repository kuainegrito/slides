/* P17: decorative flow traced over the unchanged attention infographic.
   Particle density/speed are visual cues, not measured attention weights.
   Coordinates follow the 1440 x 810 source image; all text stays in the art. */
export function mountAttentionFlow(content){
 const art=content.querySelector('image[href$="ab41955d60000b53.webp"]');
 const svg=art?.closest('svg');if(!svg)return null;
 const ns='http://www.w3.org/2000/svg';
 const layer=document.createElementNS(ns,'g');
 layer.setAttribute('class','attention-flow');layer.setAttribute('aria-hidden','true');
 layer.setAttribute('pointer-events','none');
 layer.setAttribute('transform','translate(.255 0) scale(.6663125 .666666667)');
 layer.innerHTML=`<defs>
 <linearGradient id="af-cyan"><stop stop-color="#1ea4dc"/><stop offset=".5" stop-color="#b6ffff"/><stop offset="1" stop-color="#2d8cdc"/></linearGradient>
 <linearGradient id="af-violet"><stop stop-color="#9b55ce"/><stop offset=".55" stop-color="#f4d3ff"/><stop offset="1" stop-color="#6864d9"/></linearGradient>
 <linearGradient id="af-mint"><stop stop-color="#219c9b"/><stop offset=".5" stop-color="#c6fff0"/><stop offset="1" stop-color="#7b65dc"/></linearGradient>
 <radialGradient id="af-halo"><stop stop-color="#a4f5ff" stop-opacity=".62"/><stop offset=".28" stop-color="#74dfff" stop-opacity=".28"/><stop offset="1" stop-color="#60bff5" stop-opacity="0"/></radialGradient>
 </defs>`;
 const make=(tag,attrs,parent=layer)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;};
 function flow(d,color,{count=2,duration=5,width=1.5,strength=.6,offset=0}={}){
  const g=make('g',{'class':'af-stream'});
  make('path',{d,fill:'none',stroke:`url(#af-${color})`,'stroke-width':width+4,opacity:.10,'stroke-linecap':'round'},g);
  make('path',{d,fill:'none',stroke:`url(#af-${color})`,'stroke-width':width,opacity:strength,'stroke-linecap':'round'},g);
  for(let j=0;j<count;j++){
   const dot=make('g',{'class':'af-particle'},g);
   make('circle',{r:4.2,fill:color==='violet'?'#bb73ef':'#67dfff',opacity:.24},dot);
   make('circle',{r:1.65,fill:color==='violet'?'#9954cf':'#239bcd',opacity:.96},dot);
   make('circle',{r:.7,fill:'#fff'},dot);
   make('animateMotion',{dur:duration+'s',begin:-(offset+j*duration/count)+'s',repeatCount:'indefinite',path:d,calcMode:'paced'},dot);
  }
 }
 // Sequential information is squeezed through a narrow neck, then fans out.
 for(let i=0;i<5;i++){
  const y=336+i*33;
  flow(`M65 ${y} C130 ${y} 164 399 201 403 C221 406 234 404 247 401 C272 ${y} 300 ${y} 333 ${y}`,'cyan',{count:2,duration:7+i*.27,width:.85,strength:.30,offset:i*.66});
 }
 flow('M382 407 L425 407','cyan',{count:2,duration:2.2,width:2.2});
 // The query connects to the displayed tokens. The existing strongest example
 // (it -> animal) gets a violet emphasis; the printed values are untouched.
 const targets=[468,514,560,604,645,688,738,815,848,882];
 targets.forEach((x,i)=>{
  const strong=x===514;
  const depth=strong?74:Math.min(68,24+Math.abs(x-784)*.13);
  flow(`M784 449 C${784+(x>784?10:-10)} ${449+depth} ${x} ${449+depth} ${x} 449`,strong?'violet':'cyan',{count:strong?4:1,duration:strong?4.5:6+i*.12,width:strong?2.2:1,strength:strong?.78:.42,offset:i*.43});
 });
 for(const [x,y,r,color] of [[784,432,15,'#9a5dd1'],[514,432,18,'#9451c5']]){
  const ring=make('rect',{x:x-r,y:y-12,width:2*r,height:24,rx:5,fill:'none',stroke:color,'stroke-width':1.4,opacity:.65});
  make('animate',{attributeName:'opacity',values:'.3;.85;.3',dur:'5s',repeatCount:'indefinite'},ring);
 }
 flow('M553 569 L579 569','mint',{count:2,duration:2.7,width:2.2});
 flow('M674 569 L693 569','violet',{count:2,duration:2.7,width:2.2,offset:1.3});
 flow('M919 418 L948 418','cyan',{count:2,duration:2.3,width:2.4});
 // Transformer hub: thin orbiting light, followed by parallel outward rays.
 make('circle',{cx:1166,cy:413,r:101,fill:'url(#af-halo)',opacity:.58});
 for(let i=0;i<3;i++){
  const ring=make('circle',{cx:1166,cy:413,r:67+i*5,fill:'none',stroke:i===1?'#d9ffff':'#50b5ef','stroke-width':i===1?1.25:.7,opacity:.5,'stroke-dasharray':i===1?'28 12 3 22':'4 11'});
  make('animateTransform',{attributeName:'transform',type:'rotate',from:`${i*120} 1166 413`,to:`${i*120+(i===1?-360:360)} 1166 413`,dur:(34+i*11)+'s',repeatCount:'indefinite'},ring);
 }
 const rays=[
  'M1128 339 C1113 316 1097 291 1090 284',
  'M1220 352 C1232 320 1243 295 1247 286',
  'M1247 404 C1272 393 1300 387 1318 386',
  'M1237 461 C1258 475 1280 491 1295 496',
  'M1237 455 C1281 511 1235 546 1181 558',
  'M1094 460 C1075 477 1062 490 1051 495',
  'M1084 393 C1066 386 1042 380 1017 380'
 ];
 rays.forEach((d,i)=>flow(d,'cyan',{count:3,duration:4+i*.16,width:1.3,strength:.50,offset:i*.41}));
 // A slow helix of sparks follows the existing stack edges, not its labels.
 for(let i=0;i<3;i++)flow(`M1124 ${386+i*18} L1167 ${408+i*18} L1208 ${384+i*18}`,'cyan',{count:2,duration:3.6+i*.25,width:1,strength:.4,offset:i*.7});
 svg.append(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{
  const paused=document.hidden||reduced.matches||document.documentElement.classList.contains('motion-paused');
  layer.dataset.paused=String(paused);
  if(paused)svg.pauseAnimations();else svg.unpauseAnimations();
 };
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
 return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);layer.remove();};
}
