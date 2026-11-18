// Original-pixel cutouts over an image-edited clean plate from the first frame.
// One Next starts the chase; the following Next advances after the flooded beach holds.
const WAVE_GAP=44;
export const COVER_DURATION=3;
export function createCoverEscape(content,onChange){
 const art=content.querySelector('svg image');if(!art)return null;
 const href=art.getAttribute('href'),clean='/slides/open_class/ai_survival-202608/assets/cover-clean-flood-v1.webp';
 const NS='http://www.w3.org/2000/svg';
 const points=[
 '62,501 77,475 118,477 144,498 146,531 133,551 172,559 195,595 185,611 162,589 157,594 172,634 202,656 215,680 201,695 184,678 148,656 126,648 94,701 55,721 31,727 26,712 44,693 63,698 82,663 97,641 82,608 67,599 48,609 28,591 30,576 48,567 59,579 72,566 79,548 62,532',
 '213,504 232,482 268,475 295,488 315,495 306,515 285,526 286,545 312,550 330,566 350,590 344,603 328,594 314,576 308,600 317,625 343,647 351,630 366,626 375,647 358,660 331,665 298,644 282,646 266,678 263,700 243,705 225,696 228,681 244,683 252,645 257,620 238,585 223,573 211,581 199,568 203,554 216,551 229,558 237,548 219,534',
 '396,504 406,490 441,485 464,498 471,521 463,543 451,552 475,562 494,574 508,598 506,611 492,608 482,590 470,586 477,617 497,638 508,624 521,632 520,648 501,662 471,644 451,634 430,652 423,679 401,688 388,682 389,668 405,671 411,641 418,622 403,598 389,589 380,574 386,560 398,562 401,579 414,573 414,555 398,540',
 '531,538 542,520 566,510 598,521 616,535 614,560 598,583 610,596 637,579 658,584 678,608 691,625 680,638 665,621 650,614 635,621 641,666 666,697 695,703 708,728 696,747 682,741 677,722 648,723 617,698 600,706 570,749 558,774 536,794 511,789 506,780 528,756 541,764 560,727 571,696 568,670 540,654 517,676 502,687 489,677 493,664 507,659 521,642 540,606 551,590 534,578 524,558',
 '818,520 839,501 869,499 891,508 909,527 928,523 929,538 907,557 884,558 887,574 909,588 930,610 932,625 919,634 908,624 899,608 895,633 909,662 928,655 943,667 945,682 925,693 903,688 877,663 854,675 836,702 816,718 797,716 785,702 790,688 806,699 819,677 828,644 831,618 817,600 808,593 799,606 788,590 789,576 802,567 816,580 828,573 830,557 813,545',
 '989,531 998,510 1025,502 1054,512 1067,532 1067,553 1051,577 1070,582 1090,580 1108,602 1125,625 1117,638 1101,635 1084,614 1073,615 1073,643 1090,674 1108,677 1125,694 1129,717 1113,731 1099,717 1098,703 1067,702 1047,674 1025,688 1012,714 1004,739 979,741 964,731 969,715 989,719 995,686 1007,658 995,634 976,628 957,609 950,591 963,581 978,586 977,599 995,601 1008,582 995,570 983,553',
 '1165,549 1187,530 1213,524 1242,540 1254,560 1258,589 1245,607 1257,624 1268,644 1270,675 1284,700 1297,707 1300,725 1285,739 1270,721 1242,721 1214,706 1193,733 1170,754 1145,755 1128,741 1134,729 1153,738 1174,712 1178,688 1151,673 1155,649 1138,647 1125,635 1130,617 1142,613 1157,628 1176,617 1188,609 1172,594 1159,575'
 ];
 const back=[['258,416 292,420 306,468 279,478 254,464',275,454],['303,430 331,432 337,470 312,477',318,458],['326,425 358,425 362,476 337,484',344,460],['355,417 415,420 438,484 404,521 355,519 341,502',391,476],['438,427 468,425 471,473 442,481',452,457],['465,414 501,416 520,471 491,490 465,472',488,456],['518,420 545,426 548,461 522,466',535,449],['544,432 587,430 609,491 584,513 548,502',577,474],['607,431 634,437 630,466 603,470',619,453],['624,442 671,446 694,504 698,544 680,560 650,550 624,523',657,504],['689,448 718,449 729,495 724,519 696,526 681,510',707,488],['745,455 785,454 795,501 791,548 766,552 738,542 725,529',770,507]];
 const fronts=points.map((p,i)=>[p,[113,285,450,605,866,1041,1213][i],[601,590,589,653,614,624,645][i]]);
 const actors=[...back,...fronts];
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1440 810');svg.classList.add('cover-escape');svg.setAttribute('aria-hidden','true');
 svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;visibility:hidden;overflow:hidden';
 const el=(name,attrs,parent=svg)=>{const e=document.createElementNS(NS,name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;};
 const defs=el('defs',{});
 el('image',{href:clean,x:0,y:0,width:1440,height:810,preserveAspectRatio:'none','data-clean-plate':'true'});
 const ai=el('text',{x:405,y:196,'text-anchor':'middle','font-size':78,'font-family':'BiKaiAI,BiKai,KaiTi,serif',fill:'#7030a0',class:'ai-zh','data-cover-title-ai':'true'});ai.textContent='AI';
 // All runners use their original image pixels, not regenerated people.
 const groups=actors.map(([p,x,y],i)=>{const clip=el('clipPath',{id:'escape-person-'+i},defs);el('polygon',{points:p},clip);const group=el('g',{'data-runner':i});el('image',{href,x:0,y:0,width:1440,height:810,preserveAspectRatio:'none','clip-path':`url(#escape-person-${i})`},group);const outline=p.split(' ').map(point=>point.split(',').map(Number));return {group,x,y,outline,delay:i<back.length?(i%4)*.015:.025+(i-back.length)*.015,front:i>=back.length};});
 const caseClip=el('clipPath',{id:'escape-case'},defs);el('polygon',{points:'665,622 693,616 704,622 718,621 736,674 690,696 663,662'},caseClip);
 const briefcase=el('g',{'data-flying-case':'true'});el('image',{href,x:0,y:0,width:1440,height:810,preserveAspectRatio:'none','clip-path':'url(#escape-case)'},briefcase);
 // The beach mask follows the original shoreline. At the end every sand area
 // is covered, while the heading, skyline and upper palm trees remain visible.
 const beach=el('clipPath',{id:'escape-beach'},defs);el('path',{d:'M0 474 Q135 475 220 451 Q340 419 520 429 Q650 434 790 474 Q1050 548 1440 686 V810 H0Z'},beach);
 const water=el('g',{'clip-path':'url(#escape-beach)','data-binary-flood':'true',opacity:0});
 const frontClip=el('clipPath',{id:'escape-flood-front'},defs);const frontMask=el('path',{d:''},frontClip);
 const filled=el('g',{'clip-path':'url(#escape-flood-front)'},water);
 el('image',{href:'/slides/open_class/ai_survival-202608/assets/cover-flood-v1.webp',x:0,y:0,width:1440,height:810,preserveAspectRatio:'none','data-flood-plate':'true'},filled);
 const foam=[];for(let j=0;j<4;j++)foam.push(el('path',{fill:'none',stroke:j%2?'#53b7dc':'#effaff','stroke-width':j===0?9:2.6,opacity:j===0?.82:.65,'stroke-linecap':'round'},water));
 content.append(svg);content.classList.add('cover-rebuilt');
 let started=false,running=false,ready=false,failed=false,disposed=false,raf=0,last=0,elapsed=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=v=>Math.max(0,Math.min(1,v));
 function render(){const t=elapsed;svg.dataset.time=t.toFixed(3);svg.dataset.started=String(started);svg.dataset.finished=String(started&&t>=COVER_DURATION);
  let trailingEdge=-Infinity;
  for(const a of groups){const u=Math.max(0,t-a.delay),run=Math.max(0,u-.12),p=clamp(run/1.30),dx=-1900*Math.pow(p,1.18)+(u<.12?Math.sin(u*55)*3:0),bounce=run>0&&p<1?-Math.abs(Math.sin(run*26))*(a.front?15:6):0,angle=run>0&&p<1?-7+Math.sin(run*26)*4:0;
   const radians=angle*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians);
   for(const [x,y] of a.outline)trailingEdge=Math.max(trailingEdge,a.x+dx+(x-a.x)*cos-(y-a.y)*sin);
   a.group.setAttribute('transform',`translate(${dx} ${bounce+p*(a.front?40:7)}) rotate(${angle} ${a.x} ${a.y})`);
  }
  const q=clamp((t-.19)/1.25);briefcase.setAttribute('transform',`translate(${-1900*q} ${-150*Math.sin(Math.PI*q)+40*q}) rotate(${-650*q} 700 654)`);
  // All control points bow to the water side of the leading edge, so the
  // foam cannot overtake the rightmost point of a runner's transformed outline.
  const lead=trailingEdge+WAVE_GAP;
  const flood=t>0?clamp((1440-lead)/1440):0;
  svg.dataset.flood=flood.toFixed(3);
  svg.dataset.waveLead=lead.toFixed(2);
  svg.dataset.runnerRear=trailingEdge.toFixed(2);
  water.setAttribute('opacity',clamp(t/.18).toFixed(3));
  const edge=x=>`M${x+42} 380 C${x+86} 460 ${x} 475 ${x} 550 S${x+85} 687 ${x+8} 842`;
  frontMask.setAttribute('d',edge(lead)+'L1470 842V380Z');
  foam.forEach((f,j)=>f.setAttribute('d',edge(lead+j*11)));
 }
 const paused=()=>document.hidden||document.documentElement.classList.contains('motion-paused');
 function finish(){elapsed=COVER_DURATION;running=false;cancelAnimationFrame(raf);raf=0;render();onChange();}
 function frame(now){raf=0;if(!running||!ready||paused())return;if(last)elapsed=Math.min(COVER_DURATION,elapsed+(now-last)/1000);last=now;render();if(elapsed>=COVER_DURATION){running=false;onChange();}else raf=requestAnimationFrame(frame);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(running&&reduced.matches){finish();return;}if(running&&ready&&!paused())raf=requestAnimationFrame(frame);}
 const image=new Image(),floodImage=new Image();let loaded=0;
 const assetReady=()=>{if(disposed||++loaded<2)return;ready=true;svg.dataset.ready='true';svg.style.visibility='visible';art.style.visibility='hidden';render();sync();};
 const assetFailed=()=>{if(disposed)return;failed=true;running=false;onChange();console.error('Cover background failed to load; original cover preserved.');};
 image.onload=assetReady;floodImage.onload=assetReady;image.onerror=assetFailed;floodImage.onerror=assetFailed;
 image.src=clean;floodImage.src='/slides/open_class/ai_survival-202608/assets/cover-flood-v1.webp';
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 render();
 function reset(){cancelAnimationFrame(raf);raf=0;started=false;running=false;elapsed=0;last=0;render();onChange();}
 return {get started(){return started},get running(){return running},play(){started=true;if(failed){onChange();return;}running=true;elapsed=0;last=0;render();onChange();if(reduced.matches||document.documentElement.classList.contains('motion-paused')){finish();return;}sync();},reset,dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);image.onload=null;image.onerror=null;floodImage.onload=null;floodImage.onerror=null;svg.remove();art.style.visibility='';content.classList.remove('cover-rebuilt');}};
}
