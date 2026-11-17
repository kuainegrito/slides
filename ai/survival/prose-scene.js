import {buildResult} from './scene-results.js?v=20261117-scenes2';
// Choreographed illustration: no model calls or user text collection.
export function buildProse(svg,{make,path,text,label,stream,converge,flowTick},edition){
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
  converge(365,290,'#55b5d0',1);converge(719,310,'#a279c4',9);
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
  specs.forEach(([en,zh,x,y,c],i)=>{
    const route=i%2===0?`M690 310 C745 310,${x-110} ${y},${x-40} ${y}`:`M690 310 C748 310 718 133 818 133 C1010 133 1058 133 1058 190 L1058 ${y-30} Q1058 ${y} ${x+43} ${y}`;
    stream(route,c,10+i*2,18);
    const g=make('g',{'data-output':i});
    const result=buildResult(g,{make,path},['article','translation','logic','legal'][i],x,y,c);
    label(x-58,y+79,en,zh,g,14);outputs.push({g,result});
  });
  // Multiple story threads stay visibly open: longer fiction needs continuity and judgement.
  const threads=make('g',{'data-art':'fiction'});for(let i=0;i<3;i++)path(`M57 505 C114 ${481+i*12},190 ${535-i*17},255 505`,'#9b83b2',1,threads).setAttribute('stroke-dasharray','3 5');text(58,538,'Long fiction: keep the threads coherent',11,threads,'#6b627b');
  text(390,549,'Illustration · Drafts need human review / 示意动画 · 事实、逻辑与专业文本需人工核验',11,svg,'#68788b');
  return {tick(t){flowTick(t);tokens.forEach((g,i)=>g.setAttribute('opacity',.2+.8*fade(t,i*.8)));draft.setAttribute('opacity',.3+.7*fade(t,4));rows.forEach((g,i)=>{g.setAttribute('opacity',fade(t,5+i*.45,.9));g.setAttribute('transform',`translate(${431*(1-fade(t,5+i*.45,.9))} 0) scale(${fade(t,5+i*.45,.9)} 1)`);});const row=t<11?Math.min(11,Math.max(0,(t-5)/.45)):((t-11)*1.4)%12;pen.setAttribute('transform',`translate(${450+Math.min(170,((t*.8)%1)*170)} ${219+Math.floor(row)*18})`);pen.setAttribute('opacity',fade(t,4)*.85);orbit.setAttribute('transform',`rotate(${Math.sin(t*.15)*7} 537 306)`);outputs.forEach(({g,result},i)=>{const progress=fade(t,10+i*2);g.setAttribute('opacity',progress);result.tick(t,progress);});threads.setAttribute('opacity',.2+.8*fade(t,19));}};
}
