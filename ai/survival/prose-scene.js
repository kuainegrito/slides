// Choreographed illustration: no model calls or user text collection.
export function buildProse(svg,{make,path,text,label,stream,flowTick},edition){
  const fade=(t,s,d=2)=>{const v=Math.max(0,Math.min(1,(t-s)/d));return v*v*(3-2*v);};
  label(34,44,'From prompt to prose','从提示到成文：让想法长出结构',svg,27);
  text(35,101,edition==='teacher'?'A teaching brief → a draft → a reviewed learning resource':'Your ideas → a draft → your checked, revised voice',13,svg,'#62778b');
  make('ellipse',{cx:535,cy:322,rx:235,ry:210,fill:'url(#as-halo)'});
  // Prompt fragments visibly enter the page rather than replacing the scene with labels.
  const input=make('g',{'data-art':'prompt'});
  make('rect',{x:54,y:161,width:225,height:300,rx:16,fill:'#c9dcea',opacity:.4,transform:'rotate(-4 160 310)'},input);
  make('rect',{x:49,y:151,width:225,height:300,rx:16,fill:'url(#as-paper)',stroke:'#aac6d9'},input);
  label(72,182,'The brief','你的提示',input,18);
  const tokens=[];
  ['Purpose / 目的','Audience / 对象','Evidence / 素材'].forEach((s,i)=>{const y=232+i*73,g=make('g',{},input);make('circle',{cx:90,cy:y,r:21,fill:['#d5edf6','#e7def5','#dceee9'][i]},g);if(i===0){make('circle',{cx:90,cy:y,r:11,fill:'none',stroke:'#368eab','stroke-width':2},g);path(`M90 ${y-16} V${y+16} M74 ${y} H106`,'#368eab',1.5,g);}else if(i===1){make('circle',{cx:90,cy:y-5,r:6,fill:'none',stroke:'#9570ae','stroke-width':2},g);path(`M79 ${y+12} Q90 ${y-1} 101 ${y+12}`,'#9570ae',2,g);}else{path(`M81 ${y-12} H98 V${y+13} H81 Z M85 ${y-5} H94 M85 ${y+1} H94 M85 ${y+7} H92`,'#478f80',2,g);}text(122,y+5,s,13,g);tokens.push(g);stream(`M260 ${y} C325 ${y},325 290,403 290`,['#46adc9','#9c71bd','#56a79c'][i],i*.9,17);});
  const orbit=make('g',{'data-art':'writing-orbits'});
  for(let i=0;i<3;i++)make('ellipse',{cx:537,cy:306,rx:177+i*9,ry:85+i*14,fill:'none',stroke:['#80b8d1','#ad93c9','#91bbc6'][i],'stroke-width':1,'stroke-dasharray':'2 12',transform:`rotate(${i*55+20} 537 306)`},orbit);
  const draft=make('g',{'data-art':'draft'});
  make('rect',{x:389,y:157,width:310,height:318,rx:18,fill:'#193650',stroke:'#749ebc'},draft);
  make('rect',{x:389,y:157,width:310,height:39,rx:18,fill:'#25465f'},draft);
  [0,1,2].forEach(i=>make('circle',{cx:409+i*15,cy:176,r:3.5,fill:['#e6a58d','#e6ce8b','#7bc4bd'][i]},draft));
  text(466,182,'A DRAFT TAKES SHAPE',11,draft,'#d1e7f6');
  const rows=[];
  for(let i=0;i<12;i++){const y=217+i*18;make('rect',{x:410,y,width:4,height:6,rx:2,fill:'#55738b'},draft);const g=make('g',{},draft);const widths=[92,153,188,123,174,160,83,192,146,181,124,73];make('rect',{x:431,y,width:widths[i],height:i===0||i===6?7:4,rx:2,fill:i===0||i===6?'#cb9cde':i%3===1?'#7bc8da':'#b8cedf'},g);rows.push(g);}
  const pen=make('g',{'data-art':'pen'},draft);path('M0 0 L20 -22 L27 -15 L7 7 Z','#c5f1ff',2,pen);path('M0 0 L-3 10 L7 7','#e7c5fd',2,pen);make('circle',{cx:0,cy:7,r:8,fill:'#6fe2ee',opacity:.2},pen);
  label(426,499,'Structure · revise · verify','结构 · 修改 · 核验',svg,14);
  const outputs=[];
  const specs=[['Article','文章',806,222,'#4d9db7'],['Translation','翻译',976,222,'#8b78b9'],['Logic','逻辑',806,405,'#528f9f'],['Legal draft','法律文本草稿',976,405,'#a47cad']];
  specs.forEach(([en,zh,x,y,c],i)=>{stream(`M690 310 C745 310,${x-90} ${y},${x} ${y}`,c,10+i*2,16);const g=make('g',{'data-output':i});make('circle',{cx:x,cy:y,r:54,fill:'#f6fbff',opacity:.8},g);make('circle',{cx:x,cy:y,r:57,fill:'none',stroke:c,'stroke-dasharray':'2 9',opacity:.5},g);
    if(i===0){path(`M${x-25} ${y-34} H${x+13} L${x+27} ${y-20} V${y+33} H${x-25} Z M${x+13} ${y-34} V${y-20} H${x+27}`,c,2,g);for(let k=0;k<5;k++)path(`M${x-15} ${y-11+k*8} H${x+16-(k%2)*9}`,c,k===0?3:1.5,g);}
    if(i===1){path(`M${x-39} ${y-27} H${x+8} V${y+3} H${x-16} L${x-27} ${y+14} V${y+3} H${x-39} Z M${x+3} ${y-9} H${x+38} V${y+24} H${x+28} V${y+34} L${x+18} ${y+24} H${x-5}`,c,2,g);make('ellipse',{cx:x-15,cy:y-12,rx:11,ry:9,fill:'none',stroke:c},g);path(`M${x-26} ${y-12} H${x-4} M${x-15} ${y-21} Q${x-24} ${y-12} ${x-15} ${y-3} Q${x-6} ${y-12} ${x-15} ${y-21}`,c,1,g);path(`M${x+8} ${y+5} H${x+28} M${x+8} ${y+12} H${x+22}`,c,2,g);}
    if(i===2){path(`M${x-30} ${y-23} L${x} ${y} L${x+30} ${y-23} M${x} ${y} V${y+31}`,c,2,g);[[-30,-23],[30,-23],[0,31]].forEach(([dx,dy])=>{make('circle',{cx:x+dx,cy:y+dy,r:11,fill:'#eef8fb',stroke:c,'stroke-width':2},g);path(`M${x+dx-5} ${y+dy} l3 4 l7 -8`,c,1.5,g);});make('circle',{cx:x,cy:y,r:7,fill:c},g);}
    if(i===3){path(`M${x} ${y-32} V${y+29} M${x-21} ${y+32} H${x+21} M${x-34} ${y-19} Q${x} ${y-30} ${x+34} ${y-19} M${x-26} ${y-20} l-12 29 h24 Z M${x+26} ${y-20} l-12 29 h24 Z`,c,2,g);make('circle',{cx:x,cy:y-34,r:4,fill:c},g);}
    label(x-58,y+79,en,zh,g,14);const ink=[...g.querySelectorAll('path')];const sparks=Array.from({length:9},(_,j)=>make('circle',{r:j%3===0?2.7:1.5,fill:c},g));outputs.push({g,x,y,sparks,ink});});
  // Multiple story threads stay visibly open: longer fiction needs continuity and judgement.
  const threads=make('g',{'data-art':'fiction'});for(let i=0;i<3;i++)path(`M57 505 C114 ${481+i*12},190 ${535-i*17},255 505`,'#9b83b2',1,threads).setAttribute('stroke-dasharray','3 5');text(58,538,'Long fiction: keep the threads coherent',11,threads,'#6b627b');
  text(390,549,'Illustration · Drafts need human review / 示意动画 · 事实、逻辑与专业文本需人工核验',11,svg,'#68788b');
  return {tick(t){flowTick(t);tokens.forEach((g,i)=>g.setAttribute('opacity',.2+.8*fade(t,i*.8)));draft.setAttribute('opacity',.3+.7*fade(t,4));rows.forEach((g,i)=>{g.setAttribute('opacity',fade(t,5+i*.45,.9));g.setAttribute('transform',`translate(${431*(1-fade(t,5+i*.45,.9))} 0) scale(${fade(t,5+i*.45,.9)} 1)`);});const row=Math.min(11,Math.max(0,(t-5)/.45));pen.setAttribute('transform',`translate(${450+Math.min(170,((t*.8)%1)*170)} ${219+Math.floor(row)*18})`);pen.setAttribute('opacity',fade(t,4)*(t<11?1:.45));orbit.setAttribute('transform',`rotate(${Math.sin(t*.15)*7} 537 306)`);outputs.forEach(({g,x,y,sparks,ink},i)=>{g.setAttribute('opacity',fade(t,10+i*2));ink.forEach((n,k)=>{n.setAttribute('opacity',.55+.45*(1+Math.sin(t*1.6-k*.7))/2);if(i===3)n.setAttribute('transform',`rotate(${Math.sin(t)*2} ${x} ${y-20})`);});sparks.forEach((n,j)=>{const a=t*.4+j*Math.PI*2/9;n.setAttribute('cx',x+Math.cos(a)*62);n.setAttribute('cy',y+Math.sin(a)*54);n.setAttribute('opacity',.35+.5*(1+Math.sin(t*2+j))/2);});});threads.setAttribute('opacity',.2+.8*fade(t,19));}};
}
