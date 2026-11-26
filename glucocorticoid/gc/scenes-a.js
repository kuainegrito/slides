(() => {
  'use strict';
  const scene = window.gcScenes || (window.gcScenes = {});
  const C={white:'#f0f7fc',muted:'#aac5d5',blue:'#88e4f0',teal:'#7be6cf',coral:'#ffa98f',gold:'#ffd881',navy:'#0c263b',violet:'#c5aff3'};
  const text=(x,y,v,size=23,fill=C.white,anchor='middle',bold=550)=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+fill+'" text-anchor="'+anchor+'" font-weight="'+bold+'">'+v+'</text>';
  const line=(d,stroke,width=2,extra='')=>'<path d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
  const disc=(x,y,r,fill,extra='')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+extra+'/>';
  const flow=(d,type,rate,speed,color,radius=2.7,extra='')=>line(d,color,1.4,'stroke-opacity=".42" data-flow="'+type+'" data-rate="'+rate+'" data-speed="'+speed+'" data-color="'+color+'" data-radius="'+radius+'" '+extra);
  const organ=(url,x,y,w,h)=>'<image href="'+url+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet"/>';
  const pulse=(x,y,r,color,dur=3)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="2" opacity=".48"><animate attributeName="r" values="'+r+';'+(r+13)+'" dur="'+dur+'s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;0" dur="'+dur+'s" repeatCount="indefinite"/></circle>';
  const badge=(x,y,val,color)=>'<g>'+disc(x,y,7,color)+text(x+17,y+7,val,19,C.muted,'start',500)+'</g>';
  const nodeHalo=(x,y,rx,ry)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="url(#aHalo)" />';
  const defs='<defs><radialGradient id="aHalo"><stop stop-color="#52cadd" stop-opacity=".23"/><stop offset=".6" stop-color="#3296b0" stop-opacity=".1"/><stop offset="1" stop-color="#2b91af" stop-opacity="0"/></radialGradient><linearGradient id="aVessel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6f4250"/><stop offset=".13" stop-color="#381e31"/><stop offset=".48" stop-color="#682f40"/><stop offset=".89" stop-color="#371c2c"/><stop offset="1" stop-color="#925965"/></linearGradient><linearGradient id="aCyt" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#102f45"/><stop offset=".55" stop-color="#163e51"/><stop offset="1" stop-color="#0c273f"/></linearGradient><radialGradient id="aNucleus"><stop stop-color="#344663"/><stop offset=".82" stop-color="#233c53"/><stop offset="1" stop-color="#3a5c72"/></radialGradient><linearGradient id="aStrand"><stop stop-color="#ffcf86"/><stop offset=".5" stop-color="#ef9787"/><stop offset="1" stop-color="#d67e86"/></linearGradient></defs>';
  const svg=(alt,body)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 418" role="img" aria-label="'+alt+'" style="width:100%;height:100%;display:block;font-family:Microsoft YaHei,PingFang SC,sans-serif">'+defs+body+'</svg>';
  function conformer(x,y,scale){
    const data=window.cortisol;
    if(!data)return '';
    const frames=16;
    const at=(atom,t)=>{
      const [,a,b,c]=atom,theta=.48*Math.sin(Math.PI*2*t);
      return [x+scale*(a*Math.cos(theta)+c*Math.sin(theta)), y-scale*(b*.87-(c*Math.cos(theta)-a*Math.sin(theta))*.49)];
    };
    const values=(atom,axis)=>Array.from({length:frames+1},(_,i)=>at(atom,i/frames)[axis].toFixed(2)).join(';');
    const movement=(name,atom,axis)=>'<animate attributeName="'+name+'" values="'+values(atom,axis)+'" dur="11s" repeatCount="indefinite"/>';
    let out='<g aria-label="皮质醇分子三维构象，氧原子以珊瑚色表示">';
    data.bonds.forEach(([i,j])=>{
      const a=data.atoms[i],b=data.atoms[j],v=at(a,0),w=at(b,0);
      out+='<line x1="'+v[0]+'" y1="'+v[1]+'" x2="'+w[0]+'" y2="'+w[1]+'" stroke="#81aebd" stroke-width="2.4">'+movement('x1',a,0)+movement('y1',a,1)+movement('x2',b,0)+movement('y2',b,1)+'</line>';
    });
    data.atoms.forEach(a=>{const v=at(a,0);out+='<circle cx="'+v[0]+'" cy="'+v[1]+'" r="'+(a[0]===8?4.8:3.5)+'" fill="'+(a[0]===8?C.coral:'#9bcfda')+'">'+movement('cx',a,0)+movement('cy',a,1)+'</circle>';});
    return out+'</g>';
  }
  const cortisolShape=conformer(0,0,14);
  window.gcCortisolArt=(x,y,scale=1)=>'<g transform="translate('+x+' '+y+') scale('+scale+')">'+cortisolShape+'</g>';
  function kidneyArt(x=63,y=15,w=232,h=330,id='aKidney'){
    return '<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="193 21 282 508"><defs><clipPath id="'+id+'"><path d="M333 104 C339 88 360 74 380 62 C401 48 409 33 427 30 C442 29 445 53 450 77 Q468 128 459 155 C456 160 458 165 458 170 C464 205 451 236 424 257 C407 286 411 316 430 340 C451 369 452 397 444 438 C438 471 424 494 401 506 C379 516 351 521 331 511 C282 494 249 449 227 400 C206 352 205 303 216 248 C231 184 270 126 333 104 Z"/></clipPath></defs><image href="assets/kidney.png" width="720" height="540" clip-path="url(#'+id+')"/></svg>';
  }
  window.gcKidneyArt=kidneyArt;
  function cortexBands(active){
    let h='';
    const layers=[['#607777',68,104,'球状带'],['#694c43',104,219,'束状带'],['#584257',219,275,'网状带'],['#35485b',275,319,'髓质']];
    for(const [i,[color,y,bottom,name]] of layers.entries()){
      h+='<rect x="455" y="'+y+'" width="235" height="'+(bottom-y)+'" fill="'+color+'" stroke="#0f2738"/>';
      h+=text(714,(y+bottom)/2+8,name,23,i===1?C.gold:C.muted,'start',i===1?700:500);
    }
    for(let row=0;row<2;row++) for(let col=0;col<11;col++){
      const x=466+col*21.2+(row%2)*4, y=79+row*14+Math.sin(col*1.8)*2;
      h+=disc(x,y,5.3,'#a7a583','opacity=".90"')+disc(x+1,y-.4,2,'#625956');
    }
    for(let col=0;col<14;col++) for(let row=0;row<7;row++){
      const x=462+col*16.8+Math.sin(row*.38+col)*2.8, y=112+row*15.9;
      h+='<ellipse cx="'+x+'" cy="'+y+'" rx="6.9" ry="7.4" fill="'+(col%2?'#cb996e':'#d9ab76')+'" opacity=".95"/>'+disc(x+1,y-.5,2.2,'#765c56');
    }
    for(let col=0;col<11;col++) for(let row=0;row<3;row++){
      let x=466+col*21+Math.sin(col+row*2)*4,y=230+row*16+Math.sin(col)*3;
      h+=disc(x,y,6.7,'#a87f91')+disc(x,y,2.1,'#65546b');
    }
    for(let j=0;j<22;j++){
      let x=465+(j*37)%215,y=285+(j*17)%26;h+=disc(x,y,4.8,'#73859d')+disc(x,y,1.7,'#4d5c70');
    }
    h+='<rect x="454" y="103" width="237" height="117" stroke="'+C.gold+'" stroke-width="2" fill="none"/>';
    h+=line('M451 64 H692','#a2b2b8',5)+text(572,47,'皮质分带',23,C.white);
    if(active) h+=pulse(689,161,5,C.gold,2.9);
    return h;
  }
  scene[5]=step=>{
    let h=nodeHalo(183,163,208,175)+kidneyArt();
    h+=line('M233 54 L269 31 H334',C.gold,1.8)+text(338,37,'肾上腺',23,C.gold,'start');
    h+=line('M138 241 L95 271 H46',C.muted,1.3)+text(43,301,'肾',23,C.muted);
    h+=pulse(229,55,14,C.gold,3.6);
    if(step===0){
      h+=line('M309 160 C409 160 413 159 456 159','#396779',1.4,'stroke-dasharray="3 8"')+text(494,138,'外层为皮质',37,C.white,'start',700)+text(494,213,'中央为髓质',29,C.muted,'start',600);
      h+=text(494,277,'在肾上腺皮质中继续定位',23,C.blue,'start');
    }else{
      h+=line('M240 65 C324 40 382 60 448 72','#91bbc6',1.5,'stroke-dasharray="4 6"')+line('M247 74 C330 146 364 275 448 315','#63889a',1.2,'stroke-dasharray="4 6"')+cortexBands(step===2);
      if(step===1)h+=text(455,380,'束状带是皮质醇的主要来源',26,C.gold,'start',700);
      if(step===2){
        h+=flow('M790 160 C837 156 855 115 890 114','gc',4,52,C.gold)+text(893,58,'糖皮质激素（GC）',23,C.blue,'start',600);
        h+=text(904,128,'皮质醇',38,C.white,'start',700)+text(904,162,'又称氢化可的松',20,C.muted,'start')+window.gcCortisolArt(1001,219);
        h+=text(904,316,'皮质酮',27,C.muted,'start')+text(904,348,'也属 GC',19,C.muted,'start');
        h+=text(456,380,'人体以皮质醇为主',26,C.gold,'start',700);
      }
    }
    return svg('从肾上腺定位皮质束状带以及皮质醇',h);
  };
  function receptor(x,y,s=1,bound=false,showLigand=bound){
    const left=bound?'M-28 -25 C-40 -27 -47 -11 -37 1 C-30 11 -23 13 -19 25 C-10 33 1 28 4 14 C5 5 -2 2 -13 -3 C-25 -9 -11 -19 -19 -23 Z':'M-32 -30 C-48 -23 -48 -5 -38 4 C-28 10 -25 15 -20 26 C-11 35 2 27 2 15 C1 7 -5 2 -17 -3 C-27 -7 -19 -25 -26 -28 Z';
    return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="'+left+'" fill="#477e8c" stroke="#95d7d7" stroke-width="2"/><path d="M8 -28 C24 -42 42 -25 38 -10 C35 1 26 2 25 17 C25 31 5 36 2 21 C-1 7 14 1 17 -9 C21 -19 8 -16 8 -28 Z" fill="#345f7d" stroke="#8ebbd4" stroke-width="2"/>'+(showLigand?window.gcCortisolArt(-2,-12,.17):'')+'</g>';
  }
  function dna(x,y,w){
    let h='',a=[],b=[];
    for(let k=0;k<=w;k+=3){a.push((x+k)+','+(y+11*Math.sin(k*.092)).toFixed(1));b.push((x+k)+','+(y-11*Math.sin(k*.092)).toFixed(1));}
    for(let k=3;k<w;k+=8){const z=11*Math.sin(k*.092);h+=line('M'+(x+k)+' '+(y+z)+' V'+(y-z),'#73929a',1.6);}
    return h+'<polyline points="'+a.join(' ')+'" fill="none" stroke="#72cad5" stroke-width="2.8"/><polyline points="'+b.join(' ')+'" fill="none" stroke="#dea398" stroke-width="2.8"/>';
  }
  scene[6]=step=>{
    let h='<path d="M289 58 C405 36 867 38 1023 81 C1120 106 1140 226 1076 304 C1016 374 541 385 287 344 C307 263 311 151 289 58Z" fill="url(#aCyt)" stroke="#517d8a" stroke-width="2"/>';
    for(let n=0;n<27;n++){
      const y=60+n*10.7,x=288+17*Math.sin(n*Math.PI/26);
      h+=line('M'+(x-10)+' '+y+' l8 2 m-8 -2 l8 -2 M'+(x+10)+' '+y+' l-7 3 m7 -3 l-7 -2','#4e8493',1.7)+disc(x-12,y,3,'#8bd4d9')+disc(x+12,y,3,'#7ebbc9');
    }
    h+='<ellipse cx="852" cy="210" rx="174" ry="115" fill="url(#aNucleus)" stroke="#94acbf" stroke-width="3"/><ellipse cx="852" cy="210" rx="166" ry="108" stroke="#597d94" stroke-width="1" fill="none"/>'+dna(766,216,175);
    h+=text(147,72,'细胞外',24,C.muted)+text(495,73,'肝细胞胞质',25,C.blue)+text(861,143,'细胞核',24,C.muted);
    h+=text(296,396,'细胞膜',21,C.muted);
    const approach='M115 200 C233 178 337 225 417 207 S475 200 498.76 200.56';
    const entry='M501 214 C591 214 640 160 707 169 S779 191 816 197';
    const transcript='M823 224 C836 241 852 235 861 253 S882 259 891 272 S907 273 917 283';
    if(step===0){
      h+=text(149,154,'游离 GC',22,C.gold)+window.gcCortisolArt(115,200,.49);
      h+=receptor(501,214,1.12)+text(502,288,'胞质 GR',25,C.white);
    }else if(step===1){
      h+=line(approach,C.gold,1.6,'opacity=".28"')+
        '<g>'+receptor(501,214,1.12)+'<set attributeName="visibility" to="hidden" begin="3s" fill="freeze"/></g>'+
        '<g visibility="hidden">'+receptor(501,214,1.12,true,false)+'<set attributeName="visibility" to="visible" begin="3s" fill="freeze"/></g>';
      h+='<g id="gc-crossing"><animateMotion path="'+approach+'" dur="3s" fill="freeze"/>'+
        '<g><animateTransform attributeName="transform" type="scale" values=".49;.49;.1904" keyTimes="0;.72;1" dur="3s" fill="freeze"/>'+
        window.gcCortisolArt(0,0)+'</g></g>';
      h+='<g>'+text(502,288,'胞质 GR',25,C.white)+'<set attributeName="visibility" to="hidden" begin="3s" fill="freeze"/></g>'+
        '<g visibility="hidden">'+text(502,288,'GC–GR 复合物',25,C.gold)+'<set attributeName="visibility" to="visible" begin="3s" fill="freeze"/></g>';
    }else{
      h+=text(502,288,'GC–GR 复合物',25,C.gold)+line(entry,C.teal,1.6,'opacity=".38" stroke-dasharray="4 6"');
      h+='<g><animateMotion path="'+entry+'" dur="3s" fill="freeze"/><g><animateTransform attributeName="transform" type="scale" from="1.12" to=".57" dur="3s" fill="freeze"/>'+
        receptor(0,0,1,true)+'</g></g>';
      h+='<path d="'+transcript+'" fill="none" stroke="'+C.gold+'" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"><animate attributeName="stroke-dashoffset" from="1" to="0" begin="3s" dur="1.6s" fill="freeze"/></path>';
      h+=text(853,324,'靶基因转录调节',24,C.gold);
    }
    return svg('糖皮质激素入胞、结合胞质受体并调节核内转录',h);
  };
  function bloodChannel(x,y,w,h,mode){
    const q=y+h/2;let v='';
    v+='<defs><clipPath id="aBloodClip"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(h/2)+'"/></clipPath></defs><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(h/2)+'" fill="url(#aVessel)" stroke="#ad7784" stroke-width="2"/>';
    v+='<g clip-path="url(#aBloodClip)">';
    for(let i=0;i<6;i++){
      const lane=q+(i%3-1)*(h*.23),xx=x+(i+.1)*w/5;
      v+='<g transform="translate('+xx+' '+lane+')"><g><animateTransform attributeName="transform" type="translate" values="-'+(w+55)+' 0;0 0;'+(w+55)+' 0" begin="-'+(i*2.3)+'s" dur="24s" repeatCount="indefinite"/><ellipse transform="rotate('+(-19+i*8)+')" rx="19" ry="9" fill="#a75e65" stroke="#c07e80" stroke-width="1"/><ellipse rx="8" ry="3.5" fill="#793d4d"/></g></g>';
    }
    v+='</g>';
    v+=line('M'+(x+h*.5)+' '+(y+3)+' Q'+(x+w*.5)+' '+(y+1)+' '+(x+w-h*.52)+' '+(y+3),'#d79ca0',1.4,'opacity=".64"');
    v+=line('M'+(x+h*.58)+' '+(y+h-6)+' H'+(x+w-h*.6),'#c27b81',2,'opacity=".43"');
    v+='<path d="M'+(x+w-h*.53)+' '+(y+1)+' C'+(x+w-h*.12)+' '+(y+4)+' '+(x+w-h*.12)+' '+(y+h-5)+' '+(x+w-h*.53)+' '+(y+h-1)+'" fill="none" stroke="#de9690" stroke-width="1.8" opacity=".53"/>';
    const count=mode===2?21:mode===1?15:9;
    for(let k=0;k<count;k++){
      const xx=x+15+(k*37)%(w-30),yy=y+12+(k*19)%(h-24);
      v+='<circle cx="'+xx+'" cy="'+yy+'" r="'+(2.4+(k%3)*.55)+'" fill="'+C.blue+'" opacity=".8"><animateTransform attributeName="transform" type="translate" values="0 0;5 -2;7 1;0 0" dur="'+(2.6+(k%5)*.28)+'s" begin="-'+((k%6)*.41)+'s" repeatCount="indefinite"/></circle>';
    }
    return v;
  }
  window.gcBloodChannel = (...args) => defs + bloodChannel(...args);
  scene[7]=step=>{
    let h=nodeHalo(193,191,160,117)+nodeHalo(943,181,178,133);
    h+=organ('../shared/liver.png',46,95,257,173)+organ('../shared/muscle.png',836,96,270,170);
    h+=bloodChannel(463,161,237,71,step);
    h+=text(170,312,'肝脏',29)+text(583,300,step===2?'血糖 ↑':'血糖',29,step===2?C.coral:C.white)+text(977,312,'骨骼肌',29);
    const run=step?9:3,up=step===2?1.55:4;
    h+=flow('M292 197 C358 183 412 185 462 191','glucose',run,step?88:58,C.blue,3.2);
    h+=flow('M700 199 C748 210 788 199 844 188','glucose',up,step===2?33:62,C.blue,3);
    h+=text(374,152,step?'肝糖输出 ↑':'肝供糖',23,step?C.blue:C.muted)+text(767,152,step===2?'摄糖 ↓':'组织摄糖',23,step===2?C.coral:C.muted);
    if(step===0)h+=text(179,361,'肝糖原分解 · 糖异生',22,C.muted);
    if(step>=1)h+=text(178,361,'糖异生增强',24,C.blue);
    if(step===2)h+=text(960,361,'胰岛素敏感性下降',23,C.coral);
    return svg('肝糖输出和骨骼肌对胰岛素的摄糖反应',h);
  };
  function triacyl(x,y,scale){
    let h=line('M0 -43 V43',C.teal,5);
    [-40,0,40].forEach((yy,j)=>{
      h+=disc(0,yy,6,C.teal)+line('M6 '+yy+' H22 l13 -8 13 8 13 -8 13 8 13 -8 13 8 13 -8 13 8',C.gold,3.2);
    });
    return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+h+'</g>';
  }
  scene[8]=step=>{
    if(step===2){
      const photo='<defs><clipPath id="aPhoto"><rect x="123" y="7" width="238" height="399" rx="6"/></clipPath></defs><image href="assets/now.jpg" x="123" y="7" width="238" height="399" preserveAspectRatio="xMidYMid slice" clip-path="url(#aPhoto)"/>';
      let h=photo+text(490,62,'长期 GC 过多',26,C.gold,'start',650);
      const lines=[[119,'面容变圆'],[211,'躯干脂肪更易积聚'],[298,'四肢相对显细']];
      for(const [idx,[yy,caption]] of lines.entries()){
        h+=line('M360 '+yy+' C405 '+yy+' 426 '+yy+' 462 '+yy,'#638594',1.6)+disc(463,yy,3.8,C.coral)+text(488,yy+8,caption,28,C.white,'start');
      }
      h+=text(490,379,'向心性肥胖',33,C.coral,'start',700)+pulse(463,211,6,C.coral);
      return svg('长期糖皮质激素过多与脂肪重新分布',h);
    }
    let h=nodeHalo(153,204,151,125)+organ('assets/fat.png',30,115,238,177)+text(144,343,'脂肪组织',28);
    h+=triacyl(307,204,.76)+text(344,308,'甘油三酯',24,C.white);
    h+=flow('M406 198 C452 194 465 155 515 142','glycerol',2.7,56,C.teal,2.8)+flow('M406 210 C455 215 463 262 515 277','fat',3.5,55,C.gold,3);
    h+=text(559,146,'甘油',27,C.teal)+text(565,283,'脂肪酸',27,C.gold);
    h+=organ('../shared/liver.png',860,21,165,114)+organ('../shared/muscle.png',860,231,166,111);
    h+=text(1045,129,'肝脏',24,C.white)+text(1057,336,'骨骼肌',24,C.white);
    if(step===1){
      h+=flow('M611 132 C698 122 747 88 856 87','glycerol',5.2,72,C.teal,3.1);
      h+=flow('M618 280 C701 288 750 300 856 298','fat',6.2,68,C.gold,3.3);
      h+=text(741,82,'进入糖异生',23,C.teal)+text(730,350,'氧化供能',23,C.gold);
    }else{
      h+=line('M620 130 C710 118 756 91 842 88','#527182',1.5,'stroke-dasharray="3 9"')+line('M628 279 C707 287 757 298 846 297','#527182',1.5,'stroke-dasharray="3 9"');
      h+=text(729,83,'去向？',23,C.muted)+text(728,351,'去向？',23,C.muted);
    }
    return svg('甘油三酯的分解及甘油、脂肪酸的代表性去向',h);
  };
  scene[9]=()=>{
    let h=nodeHalo(153,191,145,105)+nodeHalo(969,191,160,106);
    h+=organ('../shared/muscle.png',34,86,259,169)+organ('../shared/liver.png',872,81,245,173);
    h+=text(159,300,'骨骼肌',28)+text(985,300,'肝脏',28);
    const aa=['#d2a2d9','#e6a89b','#bca4e8','#e7b2d0'];
    h+=text(313,132,'肌蛋白',23,C.muted)+text(437,261,'短肽',22,C.muted);
    h+=bloodChannel(511,163,186,64,0)+text(602,298,'血液',25,C.white);
    h+=line('M480 195 Q590 187 699 196 T875 189',C.violet,1.4,'opacity=".35" stroke-dasharray="4 7"');
    // The same residues stay visible as the chain splits into peptides and free amino acids.
    const residues=Array.from({length:10},(_,i)=>({x:253+14*i,y:194+18*Math.sin(i*.72)}));
    for(let f=0;f<3;f++){
      const start=[0,3,7][f],end=[3,7,10][f],dx=[72,94,90][f],dy=[-21,1,26][f];
      if(f<2){
        const a=residues[end-1],b=residues[end];
        h+=line('M'+a.x+' '+a.y+'L'+b.x+' '+b.y,'#d8abd6',4).replace('/>','><animate attributeName="opacity" from="1" to="0" begin="1s" dur=".25s" fill="freeze"/></path>');
      }
      h+='<g class="peptide"><animateTransform attributeName="transform" type="translate" from="0 0" to="'+dx+' '+dy+'" begin="1.25s" dur="1.25s" fill="freeze"/>';
      const points=residues.slice(start,end).map(p=>p.x+','+p.y).join(' ');
      h+='<polyline points="'+points+'" fill="none" stroke="#cf9dcb" stroke-width="4"><animate attributeName="opacity" from="1" to="0" begin="3.05s" dur=".3s" fill="freeze"/></polyline>';
      for(let i=start;i<end;i++){
        const {x,y}=residues[i],toLiver=i%3===0;
        const tx=(toLiver?895+(i%4)*11:533+(i%6)*25)-dx,ty=188+(i%3-1)*12+(toLiver?(i%4)*4:0)-dy;
        const path='M'+x+' '+y+' C'+(x+32)+' '+(y+(i%3-1)*27)+' '+(tx-57)+' '+(ty+7)+' '+tx+' '+ty;
        h+='<g class="free-aa"><animateMotion path="'+path+'" begin="'+(3.35+(i%4)*.19)+'s" dur="'+(toLiver?3.7:2.6)+'s" fill="freeze"/><g transform="translate('+x+' '+y+')"><set attributeName="display" to="none" begin="'+(3.35+(i%4)*.19)+'s"/>'+disc(0,0,6.3,aa[i%4])+'</g><g display="none"><set attributeName="display" to="inline" begin="'+(3.35+(i%4)*.19)+'s"/>'+disc(0,0,6.3,aa[i%4])+'</g></g>';
      }
      h+='</g>';
    }
    h+=text(611,126,'氨基酸',26,C.violet)+text(786,148,'部分入肝',21,C.violet);
    h+=text(154,355,'蛋白质分解 ↑　合成 ↓',23,C.coral)+text(982,355,'参与糖异生',24,C.teal);
    return svg('骨骼肌蛋白分解与氨基酸入肝',h);
  };
})();
