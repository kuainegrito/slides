/* P14: hand-traced visible route segments in the original 1440 × 810 artwork.
   Keep the photograph, its labels, arrows and the foreground hiker intact. */
export function mountRouteLight(content){
 if(!content.querySelector('image[href$="2f005ac06d470112.webp"]'))return null;
 const svg=content.querySelector(':scope > svg');if(!svg)return null;
 const ns='http://www.w3.org/2000/svg';
 const layer=document.createElementNS(ns,'g');
 layer.setAttribute('class','route-light');layer.setAttribute('aria-hidden','true');
 layer.setAttribute('pointer-events','none');layer.setAttribute('transform','scale(.666666667)');
 const routes=[
  ['M213 169 C235 203 262 220 285 229 S327 231 338 266 S377 284 414 295','ice'],
  ['M213 169 C243 226 286 245 319 274 C331 299 352 327 344 344 C331 367 285 356 259 378','ice'],
  ['M259 378 C278 406 291 418 317 429 C310 450 333 461 352 470','ice'],
  ['M526 331 C574 319 614 308 655 300','ice'],
  ['M545 390 C594 406 639 408 651 442 C660 462 635 477 655 497 C673 518 701 536 723 560 C744 583 744 588 723 595 C700 604 699 626 722 646','gold'],
  ['M575 586 C614 605 666 625 722 646','gold'],
  ['M738 232 C759 241 781 249 772 271 C760 300 778 319 819 331 C862 340 880 349 869 367 C852 390 883 393 837 408 C817 416 785 415 789 432 C790 444 823 442 809 458 C793 474 735 476 742 494 C747 515 806 522 797 540 C782 565 764 581 765 602','gold'],
  ['M1099 278 C1079 302 1044 301 1008 308 C968 312 938 328 927 342 C917 354 952 350 928 378 C925 405 880 414 851 420','ice'],
  ['M1192 312 C1232 323 1270 333 1266 352 C1262 372 1240 369 1244 388 C1253 415 1356 416 1352 443 C1339 473 1261 498 1211 505 C1119 508 1041 492 993 481','ice'],
  ['M993 481 C968 476 956 515 928 513 C900 513 877 527 867 539 C840 562 823 573 797 588 C776 600 785 634 764 642 L741 646','gold']
 ];
 layer.innerHTML=`<defs>
 <linearGradient id="rl-ice"><stop stop-color="#24b8e8"/><stop offset=".48" stop-color="#c7fbff"/><stop offset="1" stop-color="#64eed8"/></linearGradient>
 <linearGradient id="rl-gold"><stop stop-color="#ffb74e"/><stop offset=".5" stop-color="#fff3b6"/><stop offset="1" stop-color="#6af5c1"/></linearGradient>
 <filter id="rl-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
 <radialGradient id="rl-node"><stop stop-color="#ddffcf" stop-opacity=".8"/><stop offset="1" stop-color="#65ffb5" stop-opacity="0"/></radialGradient>
 <radialGradient id="rl-local"><stop stop-color="#ffd7a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffb65d" stop-opacity="0"/></radialGradient>
 </defs>`;
 routes.forEach(([d,color],i)=>{
  const group=document.createElementNS(ns,'g');
  group.innerHTML=`<path d="${d}" fill="none" stroke="#071e32" stroke-width="7" opacity=".34" stroke-linecap="round"/>
   <path d="${d}" fill="none" stroke="url(#rl-${color})" stroke-width="8" opacity=".62" filter="url(#rl-glow)"/>
   <path d="${d}" fill="none" stroke="url(#rl-${color})" stroke-width="2.2" opacity=".95" stroke-linecap="round"/>
   <path d="${d}" fill="none" stroke="#fffef1" stroke-width=".75" opacity=".72"/>`;
  for(let j=0;j<2;j++){
   const dot=document.createElementNS(ns,'g');
   dot.innerHTML=`<circle r="7" fill="${color==='gold'?'#ffe39a':'#88f4ff'}" opacity=".8" filter="url(#rl-glow)"/><circle r="2.1" fill="#fffef5"/>
    <animateMotion dur="${6+i*.47}s" begin="${-(i*.61+j*(6+i*.47)/2)}s" repeatCount="indefinite" path="${d}" calcMode="paced"/>`;
   group.append(dot);
  }
  layer.append(group);
 });
 for(const [x,y,goal] of [[213,169,false],[259,378,false],[655,300,false],[1099,278,false],[993,481,false],[722,646,true]]){
  const g=document.createElementNS(ns,'g');g.innerHTML=`<circle cx="${x}" cy="${y}" r="${goal?27:17}" fill="url(#${goal?'rl-node':'rl-local'})"/><circle cx="${x}" cy="${y}" r="${goal?10:8}" fill="none" stroke="${goal?'#b0ffd3':'#fff2b9'}" stroke-width="1.4" opacity=".9"/>`;layer.append(g);
 }
 svg.append(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{if(document.hidden||reduced.matches||document.documentElement.classList.contains('motion-paused'))svg.pauseAnimations();else svg.unpauseAnimations();};
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
 return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);layer.remove();};
}
