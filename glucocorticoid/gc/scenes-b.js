/* Realtime teaching figures for glucocorticoid action, regulation and targeted delivery. */
(() => {
  'use strict';
  const scenes = window.gcScenes || (window.gcScenes = {});
  const C = { white:'#f0f7fc', muted:'#b6ccda', soft:'#7094ab', cyan:'#74deef', teal:'#49b8be', gold:'#ffda70', coral:'#ffa98f', red:'#d75f68', violet:'#cab7ff' };
  const path=(d,stroke='none',width=1,fill='none',more='')=>
    '<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round" '+more+'/>';
  const text=(x,y,s,size=24,color=C.white,anchor='start',weight=600)=>
    '<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+color+'" text-anchor="'+anchor+'">'+s+'</text>';
  const circle=(x,y,r,fill,stroke='none',sw=1)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
  const ellipse=(x,y,rx,ry,fill,stroke='none',sw=1)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
  const use=(name,x,y,scale=1,rot=0)=>'<use href="#b-'+name+'" transform="translate('+x+' '+y+') rotate('+rot+') scale('+scale+')"/>';
  const anim=(attr,values,dur,repeat='indefinite',extra='')=>'<animate attributeName="'+attr+'" values="'+values+'" dur="'+dur+'s" repeatCount="'+repeat+'" fill="freeze" '+extra+'/>';
  const transform=(name,values,dur,count='indefinite')=>'<animateTransform attributeName="transform" type="'+name+'" values="'+values+'" dur="'+dur+'s" repeatCount="'+count+'" fill="freeze"/>';
  const flow=(d,type,color,rate=4,speed=64,r=2.8,width=1.8)=>path(d,color,width,'none','stroke-opacity=".56" data-flow="'+type+'" data-color="'+color+'" data-rate="'+rate+'" data-speed="'+speed+'" data-radius="'+r+'"');
  const arrow=(d,color=C.teal)=>path(d,color,2.5,'none','marker-end="url(#b-arrow)"');
  function spriteOnPath(name,d,dur,offset,scale=1){
    const timing=' dur="'+dur+'s" begin="-'+offset+'s" repeatCount="indefinite"';
    return '<g><animateMotion '+timing+' path="'+d+'" rotate="auto"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.09;.91;1" '+timing+'/>'+use(name,0,0,scale)+'</g>';
  }
  const halo=(x,y,rx,ry)=>ellipse(x,y,rx,ry,'url(#b-aura)');
  const grad=(id,stops,radial=false)=>'<'+(radial?'radialGradient':'linearGradient')+' id="b-'+id+'" '+(radial?'cx="38%" cy="30%" r="82%"':'x1="0%" y1="0%" x2="14%" y2="100%"')+'>'+stops.map(([v,c,o])=>'<stop offset="'+v+'%" stop-color="'+c+'" stop-opacity="'+(o??1)+'"/>').join('')+'</'+(radial?'radialGradient':'linearGradient')+'>';
  function cortisolModel(){
    return '<g id="b-hormone">'+window.gcCortisolArt(0,0,.62)+'</g>';
  }
  function defs(){
    return '<defs><radialGradient id="b-aura"><stop stop-color="#26788c" stop-opacity=".36"/><stop offset=".66" stop-color="#26788c" stop-opacity=".12"/><stop offset="1" stop-color="#26788c" stop-opacity="0"/></radialGradient>'+
    grad('tissue',[[0,'#ab586f'],[30,'#6a3857'],[65,'#61324c'],[100,'#292c49']])+grad('blood',[[0,'#392237'],[45,'#65283e'],[100,'#342139']])+
    
    grad('wb',[[0,'#fff1f6'],[56,'#cdadc8'],[100,'#857aa8']],true)+grad('cell',[[0,'#337183'],[44,'#205266'],[100,'#14354e']],true)+
    grad('nucleus',[[0,'#796f9c'],[52,'#4d537e'],[100,'#303b60']],true)+
    grad('gold',[[0,'#ffe9a6'],[45,'#f0ab60'],[100,'#af6354']],true)+grad('brain-paint',[[0,'#e9bba6'],[49,'#c48c85'],[100,'#7d556d']],true)+
    '<marker id="b-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L9 5L0 10" fill="none" stroke="#74deef" stroke-width="1.6"/></marker>'+
    '<g id="b-rbc">'+ellipse(0,0,13,7.4,'url(#b-rbc-paint)')+ '</g>'+
    '<radialGradient id="b-rbc-paint" cx=".43" cy=".34" r=".78"><stop stop-color="#963e52"/><stop offset=".4" stop-color="#aa4958"/><stop offset=".66" stop-color="#ec7b78"/><stop offset="1" stop-color="#9f4152"/></radialGradient>'+
    '<g id="b-neut">'+circle(0,0,24,'url(#b-wb)','#e3c5db',1.6)+Array.from({length:22},(_,i)=>circle(Math.cos(i*2.39)*(5+i%15),Math.sin(i*2.39)*(5+i%15),1.2,'#947ca1')).join('')+path('M-13 0Q-19-15-7-13Q-1-12-2-5Q2-4 5-8Q10-16 16-8Q21 0 11 5Q7 6 4 8Q3 18-6 16Q-15 15-11 6Q-8 2-13 0Z','none',1,'#705686')+'</g>'+
    '<g id="b-y">'+path('M0 22V0L-16 -18 M0 0L16 -18','#327eae',10)+path('M0 20V0L-16 -18 M0 0L16 -18',C.cyan,5)+circle(-6,5,3.8,C.gold)+circle(7,9,3.6,C.gold)+'</g>'+
    '<g id="b-gr">'+path('M-15 -10Q-22 0-16 12Q-7 23 8 15L17 7L8-1Q3 8-4 2Q-8-2-4-9Z','#7be0eb',2,'#25687a')+'</g>'+
    '<g id="b-brain"><title>下丘脑局部剖面，紫色区域位于脑底、垂体柄上方</title><svg x="-68" y="-66" width="136" height="124" viewBox="285 47 134 119">'+
      '<defs><clipPath id="b-hyp-outline"><path d="M286 48H417V84Q409 97 403 100Q399 119 386 121L375 126L363 137L353 148L346 155L338 148L331 145L316 156L305 162Q295 164 297 153L306 134L315 96Q316 76 300 61Z"/></clipPath></defs>'+
      '<image href="assets/hypothalamus-pituitary.webp" width="450" height="279" clip-path="url(#b-hyp-outline)"/></svg></g>'+
    '<g id="b-pit"><title>垂体局部放大，粉红色前叶为腺垂体，后方浅橙色为神经垂体</title><svg x="-55" y="-64" width="110" height="121" viewBox="280 143 80 95">'+
      '<defs><clipPath id="b-pit-outline"><path d="M342 145Q349 146 345 159L336 185Q335 189 342 192Q357 198 353 213Q350 228 338 230L329 228Q319 236 304 234Q285 232 284 219Q282 202 294 195Q301 191 314 190Q321 187 325 177L336 151Z"/></clipPath></defs>'+
      '<image href="assets/hypothalamus-pituitary.webp" width="450" height="279" clip-path="url(#b-pit-outline)"/></svg></g>'+
    '<g id="b-adrenal">'+window.gcKidneyArt(-52,-76,104,145,'b-axis-kidney')+'</g>'+
    cortisolModel()+
    '</defs>';
  }
  window.gcAnatomySymbols = defs;
  function svg(label,body){
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1160 418" role="img" aria-label="'+label+'" font-family="Microsoft YaHei, PingFang SC, sans-serif">'+defs()+body+'</svg>';
  }
  const rect=(x,y,w,h,fill,stroke='none',radius=0)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+radius+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  function vesselRibbon(x,y,w,h) {
    const wall=13;
    let g=rect(x,y,w,h,'url(#b-blood)','none',6);
    for(const side of [0,1]) {
      const lineY=y+(side?h:0),dy=side?1:-1,edge=lineY+dy*wall;
      g+=path('M'+x+' '+lineY+'Q'+(x+w*.5)+' '+(lineY+dy*3)+' '+(x+w)+' '+lineY+'L'+(x+w)+' '+edge+'Q'+(x+w*.5)+' '+(edge+dy*5)+' '+x+' '+edge+'Z','#cb8595',1,'url(#b-tissue)');
      for(let i=0;i<8;i++)g+=ellipse(x+(i+.5)*w/8,edge-dy*6,9,2.8,'#e2a1a6');
    }
    return g;
  }
  function circulating(x,y,w,h){
    let out='';
    for(let i=0;i<3;i++){
      const yy=y+h*(.24+.24*i);
      const d='M'+(x+17)+' '+yy+'C'+(x+w*.35)+' '+(yy+12)+' '+(x+w*.65)+' '+(yy-9)+' '+(x+w-16)+' '+yy;
      for(let k=0;k<3;k++)out+=spriteOnPath('rbc',d,7+i*.7,k*2.7+i,.86+i*.13);
    }
    return out;
  }
  function ring(cx,cy,r,active) {
    let smooth='';
    for(let i=0;i<38;i++){
      const a=i*Math.PI/19;const radi=r*.82;
      smooth+='<g transform="translate('+(Math.cos(a)*radi).toFixed(2)+' '+(Math.sin(a)*radi).toFixed(2)+') rotate('+(i*360/38+90)+')">'+ellipse(0,0,9,2.2,i%2?'#d79399':'#b7788a')+'</g>';
    }
    const aperture=active?r*.39:r*.63;
    return '<g transform="translate('+cx+' '+cy+')">'+circle(0,0,r+5,'#442d48','#78475a',2)+circle(0,0,r,'url(#b-tissue)','#bf8191',1)+smooth+
    '<circle r="'+aperture+'" fill="url(#b-blood)" stroke="#efb3ae" stroke-width="3">'+
    (active?anim('r',r*.63+';'+r*.39,1.5,1):'')+'</circle>'+
    [[-13,1,1],[13,-11,.65],[10,15,.76],[-20,-17,.49]].map(([x,y,s])=>use('rbc',x,y,s)).join('')+'</g>';
  }
  window.gcVesselCrossSection = active => defs() + ring(0,0,76,active);
  function lateralBrain(){
    return '<svg x="855" y="97" width="220" height="177" viewBox="6 4 406 302" aria-label="人脑外侧面标本照片">'+
      '<defs><clipPath id="brain-photo-outline"><path d="M17 210 Q13 174 29 140 Q37 118 57 96 Q84 60 125 43 Q158 23 204 22 Q241 13 262 15 Q306 18 340 44 Q362 62 375 97 Q394 135 392 177 Q412 196 403 227 Q401 251 383 265 Q356 276 318 270 Q292 277 271 287 Q235 301 205 296 Q175 296 153 278 L150 263 Q125 281 87 275 Q44 273 28 251 Q18 236 17 210 Z"/></clipPath></defs>'+
      '<image href="assets/human-brain-lateral.jpg" x="0" y="0" width="430" height="322.5" clip-path="url(#brain-photo-outline)"/></svg>';
  }
  scenes[10]=(k)=>{
    if(k===0){
      const liver='<image href="../shared/liver.png" x="365" y="102" width="246" height="166" preserveAspectRatio="xMidYMid meet"/>';
      return svg('应激时内分泌应答与能量供应',halo(624,192,446,197)+
        text(43,52,'创伤等应激刺激',24,C.coral)+text(43,108,'交感神经',30)+text(43,144,'首先出现的快速反应',18,C.muted)+
        path('M47 171H272','#3b6477',1)+text(43,227,'应激后',30)+text(43,264,'皮质醇分泌增加',19,C.gold)+
        flow('M219 220C281 218 316 189 376 189','gc',C.gold,4,60,3)+liver+
        text(490,305,'肝糖输出',26,C.white,'middle')+
        flow('M601 182C692 154 762 157 860 171','glucose',C.gold,7,66,3.2)+
        text(730,126,'葡萄糖',20,C.gold,'middle')+lateralBrain()+
        text(962,305,'脑等重要器官',25,C.white,'middle')+
        '<a href="https://commons.wikimedia.org/wiki/File:Brain_autopsy_lateral_view.jpg" target="_blank" rel="noopener"><title>Jensflorian，CC BY-SA 4.0，已遮罩背景。点击查看原图和许可。</title>'+text(962,334,'标本照片 · Jensflorian · CC BY-SA 4.0',13,C.muted,'middle')+'</a>'+
        text(579,382,'应激期间持续供能',21,C.cyan,'middle'));
    }
    const active=k===2;
    return svg('儿茶酚胺和小动脉平滑肌的允许作用',halo(565,203,498,190)+
      text(42,52,'同样的缩血管刺激',24,C.coral)+text(42,91,'比较小动脉对儿茶酚胺的反应',20,C.muted)+
      use('hormone',98,193,.83)+text(99,260,'GC',24,C.gold,'middle')+
      flow('M154 181C216 160 253 170 304 188','gc',C.gold,3,48,2.5)+
      ring(423,204,92,false)+text(423,338,'刺激到达前',25,C.white,'middle')+
      flow('M554 203C620 192 672 192 740 201','signal',C.cyan,active?6:3,62,3)+
      text(644,150,'儿茶酚胺',21,C.cyan,'middle')+
      ring(871,204,92,active)+text(870,338,active?'平滑肌收缩，管腔变小':'预测管腔的变化',25,active?C.gold:C.white,'middle')+
      text(578,390,active?'GC 维持血管对儿茶酚胺的反应性':'需要足够的血管反应来维持灌注压',21,C.muted,'middle'));
  };
  function organRail(k){
    const names=['血液','微循环','胃腺','肾单位'];
    return path('M54 74V345','#335669',1.5)+names.map((n,i)=>{
      const y=86+i*81,act=i===k;
      return (act?circle(54,y,16,'#143e50','#32747f',1):'')+circle(54,y,act?5.8:3.6,act?C.cyan:'#687e8c')+text(82,y+9,n,act?25:21,act?C.cyan:C.muted);
    }).join('')+path('M214 37V382','#2c5365',1);
  }
  function neutrophils() {
    return text(252,49,'中性粒细胞重新分布',26)+text(255,91,'血管壁旁的边缘池',19,C.muted)+
      vesselRibbon(260,137,590,164)+circulating(260,137,590,164)+use('neut',317,158,.62)+
      spriteOnPath('neut','M380 161C421 158 459 175 505 191S651 235 765 216',7.8,1,.88)+
      use('neut',786,271,.65)+text(602,347,'循环池',21,C.cyan,'middle')+
      text(898,160,'血中计数',24)+text(898,205,'中性粒细胞 ↑',21,C.cyan)+
      text(898,249,'淋巴细胞 ↓',19,C.muted)+text(898,282,'嗜酸性粒细胞 ↓',19,C.muted);
  }
  function permeability() {
    const cap=(y,gap,rate)=>{
      let out=rect(280,y,485,69,'url(#b-blood)','none',4)+circulating(280,y,485,66);
      out+=path('M280 '+y+'H765','#d99ba3',5);
      const edge=y+67;
      const edges= [[280,393],[393+gap,532],[532+gap,651],[651+gap,765]];
      edges.forEach(([a,b])=>{out+=path('M'+a+' '+edge+'Q'+((a+b)/2)+' '+(edge+15)+' '+b+' '+edge+'L'+b+' '+(edge+12)+'Q'+((a+b)/2)+' '+(edge+23)+' '+a+' '+(edge+12)+'Z','#c58d96',1,'url(#b-tissue)')+
        ellipse((a+b)/2,edge+13,9,2.5,'#dba0a5');});
      for(const x of (rate>1?[397,536,655]:[536])){
        const d='M'+x+' '+(edge-18)+'Q'+(x+3)+' '+(edge+8)+' '+(x+14)+' '+(edge+43);
        out+=flow(d,'signal',C.gold,rate,33,rate>1?2.9:2.1,1);
      }return out;
    };
    return text(252,49,'炎症时微血管通透性升高',26)+cap(88,13,2.5)+cap(263,4,.65)+
      text(804,129,'炎症时',23,C.coral)+text(804,163,'液体、蛋白渗出增加',19,C.muted)+
      text(804,300,'GC 作用后',23,C.cyan)+text(804,335,'通透性升高得到缓解',19,C.muted);
  }
  function gastric() {
    let tissue='';
    const wall=(x,side)=>{
      const out=[];
      for(let j=0;j<3;j++){
        const y=116+j*64;const outer=x+side*(76-j*3);
        const outline='M'+x+' '+y+'Q'+(x+side*42)+' '+(y-16)+' '+outer+' '+(y+5)+'Q'+(outer+side*4)+' '+(y+43)+' '+(outer-side*10)+' '+(y+60)+'Q'+(x+side*29)+' '+(y+67)+' '+x+' '+(y+56)+'Q'+(x+side*9)+' '+(y+26)+' '+x+' '+y+'Z';
        out.push(path(outline,side<0?'#d49394':'#85a8d0',1.4,side<0?'url(#b-tissue)':'url(#b-cell)'),ellipse(x+side*45,y+28,9.7,7.6,'#615273','#bc9cb4',1));
        if(side>0){for(let v=0;v<5;v++)out.push(circle(x+9+v*4,y+10+(v%3)*6,2.9,C.cyan));}
        else {for(let v=0;v<4;v++)out.push(path('M'+(x-18-v*7)+' '+(y+9+v*8)+'q-7 4 0 8','#efa4a2',1.2));}
      }return out.join('');
    };
    tissue=wall(546,-1)+wall(661,1);
    return text(252,49,'壁细胞与主细胞分泌',26)+halo(611,224,206,176)+tissue+
     text(605,91,'腺腔',21,C.white,'middle')+
     flow('M531 163Q557 150 579 144','ion',C.coral,4,39,2.8)+
     flow('M681 237Q652 220 628 204','signal',C.cyan,3,38,3.3)+
     path('M595 299Q599 220 602 135',C.muted,1.4,'none','stroke-dasharray="4 6"')+
     text(270,163,'壁细胞',24,C.coral)+text(270,201,'分泌 H⁺',19,C.muted)+
     text(824,209,'主细胞',24,C.cyan)+text(824,246,'分泌胃蛋白酶原',19,C.muted)+
     text(659,387,'两类分泌均可增加',21,C.white,'middle');
  }
  function renal() {
    const top='M430 126Q469 112 500 126Q538 108 575 125Q613 109 654 124Q695 109 740 124Q778 110 815 124';
    let cells=path('M428 129Q475 110 505 126Q539 108 575 126Q618 110 655 125Q695 111 738 125Q778 110 816 124L816 290Q737 307 656 291Q573 305 503 291Q456 300 428 290Z','#57a8b0',2,'url(#b-cell)');
    [504,578,655,738].forEach((x,i)=>{cells+=path('M'+x+' 127Q'+(x+9)+' 186 '+(x-4)+' 219T'+(x+1)+' 291','#6196a2',1)+ellipse(x-36,248-i%2*8,15,11,'#655880','#9e8aa4',1.4)});
    return text(250,47,'集合管排钾',26)+text(260,92,'皮质醇显著过多',21,C.gold)+
      text(838,94,'管腔',22,C.cyan)+text(837,294,'间质',20,C.muted)+
      path(top,'#83d7ce',2)+cells+
      flow('M600 340Q584 310 561 277','gc',C.gold,2.8,46,3)+
      text(550,376,'局部灭活能力被超过',19,C.muted,'middle')+
      text(666,189,'MR 效应增强',22,C.gold,'middle')+
      flow('M693 222Q705 183 701 157Q697 133 705 94','ion',C.cyan,4.3,53,3.4)+
      text(730,91,'K⁺',24,C.cyan)+path('M693 132v-13M709 131v-13',C.gold,3)+
      text(859,166,'排钾 ↑',26,C.cyan)+text(859,206,'血钾可下降',20,C.muted)+
      text(270,264,'主细胞',20,C.white)+path('M340 258L425 240','#6d92a1',1.3);
  }
  scenes[11]=(k)=>svg(['中性粒细胞在边缘池与循环池间重新分布','微血管通透性与渗出','胃腺分泌','集合管钾离子进入管腔'][k],
    organRail(k)+[neutrophils,permeability,gastric,renal][k]());

  function chromatin(x,y,w) {
    let a='',b='',rungs='';
    for(let i=0;i<=70;i++){
      const xx=x+w*i/70,yy=Math.sin(i/70*Math.PI*4)*13;
      a+=(i?'L':'M')+xx.toFixed(1)+' '+(y+yy).toFixed(1);
      b+=(i?'L':'M')+xx.toFixed(1)+' '+(y-yy).toFixed(1);
      if(i%3===0)rungs+=path('M'+xx.toFixed(1)+' '+(y+yy).toFixed(1)+'V'+(y-yy).toFixed(1),'#8299be',1.5);
    }
    return rungs+path(a,C.cyan,2.4)+path(b,C.violet,2.4);
  }
  scenes[12]=()=>svg('GC通过胞内受体调节基因表达，炎症反应减轻',
    halo(376,211,352,181)+
    path('M72 192C79 100 165 66 286 84C363 77 488 53 567 124C638 177 640 294 557 324C467 368 373 314 284 336C151 362 59 293 72 192Z','#5c9eaa',2,'url(#b-cell)')+
    text(95,61,'炎症细胞',25)+ellipse(452,207,128,83,'url(#b-nucleus)','#a19ac2',2)+
    use('gr',222,211,1.02)+text(210,263,'胞内 GR',20,C.cyan,'middle')+
    use('hormone',47,153,.62)+flow('M63 150Q118 156 200 196','gc',C.gold,3.7,56,3.3)+text(42,126,'GC',22,C.gold)+
    flow('M248 206Q300 177 336 191','signal',C.cyan,3.1,49,2.7)+
    chromatin(375,206,154)+text(448,270,'调节基因表达',19,C.white,'middle')+
    path('M655 86V326','#36596b',1)+
    text(712,108,'炎症局部',22,C.coral)+text(712,149,'炎症介质与细胞反应减弱',28,C.white)+
    text(712,211,'全身用药',22,C.cyan)+text(712,252,'结合病情、剂量及疗程',26,C.white)+
    text(712,322,'随访血糖、肌力及内源性分泌',19,C.muted));
  scenes[13]=(k)=>{
    const fb=k===1;
    const x=[149,430,723,1023],y=191;
    const nodeTitles=['下丘脑','腺垂体','肾上腺皮质','皮质醇'];
    const ranges=[[235,351],[491,648],[786,937]];
    let g=halo(595,193,556,155);
    g+=use('brain',x[0],y-6,1.00)+use('pit',x[1],y,.91)+use('adrenal',x[2],y,.96)+use('hormone',x[3],y,1.36);
    g+=text(x[0],315,'脑底 · 紫色区域',17,C.muted,'middle')+text(x[1],315,'前叶 · 粉红色区域',17,C.muted,'middle')+text(x[2],315,'肾上腺位于肾上极',17,C.muted,'middle');
    nodeTitles.forEach((n,i)=>g+=text(x[i],286,n,26,i===3?C.gold:C.white,'middle'));
    ranges.forEach(([a,b],i)=>{
      const d='M'+a+' '+y+'H'+b;
      g+=flow(d,['signal','signal','gc'][i],i===2?C.gold:C.cyan,3.5,55,3,2.2);
      g+=path('M'+(b-9)+' '+(y-5)+'L'+b+' '+y+'L'+(b-9)+' '+(y+5),i===2?C.gold:C.cyan,2);
      g+=text((a+b)/2,y-20,['CRH','ACTH','分泌'][i],21,i===2?C.gold:C.cyan,'middle');
    });
    if(fb){
      g+=flow('M1018 305V350Q1018 364 1004 364H168Q151 364 151 346V330','signal',C.coral,3.3,118,2.5,2.2);
      g+=flow('M969 364H447Q430 364 430 348V330','signal',C.coral,2.2,118,2.4,1.5);
      g+=path('M139 328h24M418 328h24',C.coral,4)+text(735,399,'长反馈抑制 CRH、ACTH 分泌',21,C.coral,'middle');
      g+=flow('M430 124V88Q430 76 417 76H159Q149 76 149 87V114','signal',C.violet,1.3,70,2.2,1.4)+
        path('M140 115h18',C.violet,3)+text(287,58,'短反馈',19,C.violet,'middle');
    }else{
      g+=text(53,67,'应激刺激',22,C.coral)+arrow('M113 83Q124 101 139 119')+
        text(582,367,'末端皮质醇升高后，信号将返回哪两处？',22,C.muted,'middle');
    }
    return svg('下丘脑－腺垂体－肾上腺皮质轴和负反馈',g);
  };

  function vesicle(cx,cy,r) {
    let membrane=circle(cx,cy,r,'#26445a','#7fa9b9',3)+circle(cx,cy,r-5,'none','#547788',1);
    for(let i=0;i<24;i++){
      const a=i*2*Math.PI/24;
      membrane+=circle(cx+(r-2)*Math.cos(a),cy+(r-2)*Math.sin(a),2.3,'#9dbbc6');
    }
    return membrane;
  }
  function adcCell(k){
    const active=k===1;
    let out=halo(614,220,525,163)+
      path('M37 157H277C298 157 301 173 308 183C328 210 356 211 377 181C386 168 389 157 412 157H1124V338Q1014 367 861 347Q661 328 485 351Q245 382 37 340Z','#498b9a',2,'url(#b-cell)');
    const membrane='M37 157H277C298 157 301 173 308 183C328 210 356 211 377 181C386 168 389 157 412 157H1124';
    out+=path(membrane,'#57808f',11)+path(membrane,'#95c9d0',4,'none','stroke-dasharray="1 6"');
    out+=text(47,56,'细胞外',18,C.muted)+text(49,326,'细胞质',18,C.muted);
    out+=path('M193 174V141L184 129M193 141L204 128',C.coral,5)+circle(184,128,4,C.coral)+circle(205,126,4,C.coral);
    out+=text(188,235,'跨膜 TNF',22,C.coral,'middle')+path('M193 209V177','#578493',1.3);
    if(!active){
      out+='<g>'+transform('translate','184 76;190 99;190 99',2.7,1)+use('y',0,0,1.15,180)+'</g>'+
      text(246,76,'抗体',21,C.cyan)+text(246,106,'GR 调节剂载荷',18,C.gold)+
      path('M356 249C402 260 436 263 477 256','#688597',1.6,'none','stroke-dasharray="5 7"');
    }else{
      out+=use('y',192,104,1.08,180)+use('y',340,174,.73,165)+
        text(345,88,'内吞',20,C.cyan,'middle')+arrow('M342 103V137')+
        '<g opacity=".88"><animateMotion dur="4s" path="M350 192Q390 233 476 252" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.85;.85;0" keyTimes="0;.12;.72;1" dur="4s" repeatCount="indefinite"/>'+circle(0,0,14,'#254e63','#87c3cc',2)+use('y',0,1,.32,140)+'</g>'+
        vesicle(495,257,45)+use('y',495,250,.7,43)+
        text(496,337,'内吞途径',20,C.white,'middle')+
        flow('M536 254C578 237 606 221 645 218','gc',C.gold,3.3,48,3.1)+
        text(620,298,'释放载荷',19,C.gold,'middle')+
        path('M700 216C796 202 808 227 854 223','#679ba8',2,'none','stroke-dasharray="3 6"');
    }
    out+=use('gr',686,219,1.04)+text(689,179,'GR',20,C.cyan,'middle')+
      ellipse(977,242,103,65,'url(#b-nucleus)','#a49dc5',2)+chromatin(922,242,109)+
      text(977,340,'细胞核',19,C.muted,'middle');
    out+=text(585,392,active?'胞内释放使调节剂得以接近 GR':'偶联物识别表达跨膜 TNF 的细胞',21,C.white,'middle');
    return out;
  }
  function evidence(){
    const mouse=path('M-71 10Q-56-19-28-22Q3-46 38-7Q60-1 71 14L51 23L22 24Q11 33-7 34Q-41 38-71 23Z','#9eafc0',2,'#637b8d')+
       circle(36,-8,9,'#8998a5','#c4a9ad')+circle(53,6,2.5,'#101d2b')+path('M-67 16C-100 26-110 4-121 13','#ab8e9f',3);
    const person=circle(0,-19,14,'#73b1b9','#c2e7e9',1.3)+path('M-36 29Q-32 1-13 0Q-5 8 4 6Q18-2 23 6Q34 14 36 29Z','#8ac5cd',2,'#427482');
    return halo(312,176,228,142)+halo(890,172,241,160)+
      text(289,65,'小鼠炎症模型',25,C.white,'middle')+text(874,65,'健康志愿者',25,C.white,'middle')+
      '<g transform="translate(292 158)">'+mouse+'</g><g transform="translate(873 148) scale(1.25)">'+person+'</g>'+
      path('M565 61V338','#355a71',1)+text(295,244,'皮肤炎症和关节炎模型',21,C.muted,'middle')+
      text(295,288,'观察到抗炎效果',25,C.cyan,'middle')+
      text(875,225,'单次给药 · 预计治疗剂量',20,C.muted,'middle')+
      text(875,274,'未观察到血清皮质醇受抑',23,C.gold,'middle')+
      '<g opacity=".85">'+anim('opacity','.45;.95;.45',6)+'<path d="M183 323H408M772 323H978" stroke="#79c6cf" stroke-width="2"/></g>'+
      text(580,385,'长期疗效及安全性仍需进一步研究',20,C.muted,'middle');
  }
  scenes[16]=(k)=>svg(k===2?'动物模型与人体单次给药的两种证据':'抗体偶联受体调节剂的靶向递送',k===2?evidence():adcCell(k));
})();



