(() => {
  'use strict';
  const scenes = window.gcScenes || (window.gcScenes = {});
  const white='#f0f7fc',cyan='#74deef',coral='#ffa98f',gold='#ffda75',muted='#b4ccd9',line='#3b6174',blue='#8fbafa';
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const T=(x,y,v,size=23,fill=white,weight=500,anchor='start')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escape(v)}</text>`;
  const P=(d,stroke=line,w=2,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const rect=(x,y,w,h,r=0,fill='none',stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  const C=(x,y,r,fill,stroke='none',w=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
  const I=(file,x,y,w,h,fit='meet')=>`<image href="${file}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid ${fit}"/>`;
  const glow=(x,y,rx,ry,kind='cold')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#c-${kind})"/>`;
  const pulse=(x,y,r,color=cyan)=>`<circle cx="${x}" cy="${y}" r="${r}" stroke="${color}" fill="none" stroke-width="1.4"><animate attributeName="r" values="${r};${r+9}" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".65;0" dur="3.4s" repeatCount="indefinite"/></circle>`;
  const flow=(d,kind,color=cyan,rate=2,speed=62)=>P(d,color,1.7,`data-flow="${kind}" data-rate="${rate}" data-speed="${speed}" data-radius="2.3" data-color="${color}"`);
  const reveal=(m,begin=0)=>`<g>${m}<animate attributeName="opacity" values="0;1" begin="${begin}s" dur=".68s" fill="freeze"/></g>`;
  const defs=`<defs><radialGradient id="c-cold"><stop stop-color="#28778e" stop-opacity=".40"/><stop offset="1" stop-color="#12445c" stop-opacity="0"/></radialGradient><radialGradient id="c-warm"><stop stop-color="#ad7550" stop-opacity=".22"/><stop offset="1" stop-color="#33546b" stop-opacity="0"/></radialGradient><linearGradient id="c-lit" x2="1" y2=".8"><stop stop-color="#284f65"/><stop offset=".55" stop-color="#153447"/><stop offset="1" stop-color="#0d263a"/></linearGradient><linearGradient id="c-vol" x2="1" y2="0"><stop stop-color="#6dd4e7" stop-opacity=".6"/><stop offset=".45" stop-color="#dff7ff" stop-opacity=".25"/><stop offset="1" stop-color="#40889b" stop-opacity=".3"/></linearGradient></defs>`;
  const S=(label,content)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 418" role="img" aria-label="${escape(label)}" style="display:block;width:100%;height:100%;overflow:hidden;font-family:'Microsoft YaHei','PingFang SC',sans-serif">${defs}${content}</svg>`;
  scenes[4] = () => {
    const symbols=window.gcAnatomySymbols();
    const prior=symbols+window.gcKidneyArt(23,51,115,142,'prep-kidney')+
      '<use href="#b-hormone" transform="translate(84 274) scale(.95)"/>'+
      T(34,43,'线上平台 · 课前预习',29,cyan,690)+
      T(155,116,'肾上腺皮质分带',27,white,650)+T(155,158,'辨认肾上腺皮质的三层结构',21,muted)+
      T(155,266,'合成与转运',27,white,650)+T(155,307,'类固醇激素的来源与去向',21,muted)+T(155,346,'皮质醇与胞内受体的结合',21,muted);
    const lesson=T(624,43,'课堂学习 · 回到病例',29,cyan,690)+
      I('../shared/liver.png',618,83,102,77)+I('../shared/muscle.png',647,131,69,46)+
      T(746,116,'从代谢解释体征',27,white,650)+T(746,158,'糖、脂肪与蛋白质代谢',21,muted)+
      T(746,266,'从分泌调节读懂化验',27,white,650)+T(746,307,'分泌调节与负反馈',21,muted)+
      '<use href="#b-brain" transform="translate(638 244) scale(.24)"/><use href="#b-pit" transform="translate(668 272) scale(.21)"/>' + window.gcKidneyArt(678,276,53,56,'prep-axis-kidney')+
      flow('M643 251 Q648 265 658 268','signal',cyan,1,15)+flow('M676 274 Q687 287 707 282','signal',cyan,1,15);
    return S('从线上平台预习的分带与合成，过渡到代谢作用及分泌调节',prior+P('M566 30V365',line,1)+
      flow('M495 196H606','signal',cyan,1,30)+P('M598 191L606 196L598 201',cyan,2)+lesson);
  };
  scenes[3] = () => {
    const objectives = [
      ['知识目标', cyan, '利用糖皮质激素的代谢调节机制，', '像医生一样解释糖皮质激素异常时的体征的原因。'],
      ['能力目标', coral, '能够运用GC的双重性', '分析“应激与疾病”的关系，培养临床推理能力。'],
      ['素质目标', gold, '树立“稳态与失衡”的辩证思维；', '感悟医生“慎用激素”背后的科学伦理与人文关怀。']
    ];
    // Each miniature reads independently. Motion stays in the drawing, away from the text.
    const symbol=(name,x,y,k)=>'<use href="#b-'+name+'" transform="translate('+x+' '+y+') scale('+k+')"/>';
    // A single bright packet passes each relay, then cortisol feeds back upstream.
    function relay(path,color,phase,feedback=false){
      const clock=' dur="5.4s" begin="-'+(5.4-phase)+'s" repeatCount="indefinite"';
      return P(path,color,1.8,feedback?'stroke-dasharray="3 4" opacity=".65"':'opacity=".65"')+
        '<g class="axis-packet"><animateMotion path="'+path+'" keyPoints="0;1;1" keyTimes="0;.31;1" calcMode="linear"'+clock+'/>'+
        '<animate attributeName="opacity" values=".95;1;.95;0;0" keyTimes="0;.12;.28;.31;1"'+clock+'/>'+
        '<circle r="7" fill="'+color+'" opacity=".24"/>'+C(0,0,4.3,color)+C(0,0,2.1,'#fffcef')+'</g>';
    }
    const axisIcon=window.gcAnatomySymbols()+
      symbol('brain',23,18,.36)+symbol('pit',75,47,.31)+symbol('adrenal',127,68,.34)+symbol('hormone',154,98,.49)+
      relay('M26 27 Q39 47 63 47',cyan,0)+
      relay('M85 48 Q98 39 114 48',cyan,1.25)+
      relay('M132 48 Q156 58 154 85',coral,2.5)+
      relay('M139 99 C88 117 21 96 19 39',gold,3.8,true)+P('M13 39L25 38',gold,2.3);
    const glucoseIcon=symbol('hormone',17,18,.53)+I('../shared/liver.png',36,13,85,68)+
      flow('M30 19 Q41 21 54 35','signal',coral,.8,15)+
      '<path d="M85 80 Q115 86 151 66 L153 77 Q118 98 85 91Z" fill="#643d4b" stroke="#ad787c" stroke-width="1.4"/>'+
      flow('M78 56 Q85 74 97 83 T150 73','glucose',cyan,1.5,20);
    const ethicsIcon =
      P('M77 29V79 M59 86 Q64 81 77 79 Q90 81 96 86Z','#c9b789',3)+
      '<g><animateTransform attributeName="transform" type="rotate" values="0 77 27;3 77 27;0 77 27;-3 77 27;0 77 27" dur="6s" calcMode="spline" keyTimes="0;.25;.5;.75;1" keySplines=".33 0 .67 1;.33 0 .67 1;.33 0 .67 1;.33 0 .67 1" repeatCount="indefinite"/>'+
      P('M24 37L77 27 131 37',gold,2.7)+C(77,27,4.5,'#0f293a',gold,2)+
      P('M27 38L10 65H44Z M128 38L111 65H145Z','#b5c7c7',1.45)+
      '<path d="M9 65 Q27 84 45 65Z M110 65 Q128 84 146 65Z" fill="#355363" stroke="#d0c49f" stroke-width="1.8"/>'+
      '<path d="M27 62 C23 59 18 56 20 51 Q23 47 27 52 Q31 47 35 51 C37 56 31 60 27 62Z" fill="#f1a28c"/>'+
      '<g transform="translate(128 56) rotate(-32)"><rect x="-8" y="-3.4" width="16" height="6.8" rx="3.4" fill="#73b9bf" stroke="#bcf2ef"/><path d="M0 -3V3" stroke="#255366"/></g>'+
      '<circle r="1.7" fill="#ffe7a6"><animateMotion path="M25 37L77 27L129 37" dur="6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.7;.7;0" dur="6s" repeatCount="indefinite"/></circle></g>';
    const icons = [axisIcon, glucoseIcon, ethicsIcon];
    let art = '';
    objectives.forEach(([heading, color, line1, line2],i) => {
      const y=69+i*139;
      art += '<g transform="translate(0 '+y+')">';
      if(i) art += P('M15 -68H1144','#315163',1);
      art += glow(94,0,85,54,i===0?'cold':'warm');
      art += '<g transform="translate(20 -50)">'+icons[i]+'</g>';
      art += T(199,11,heading,33,color,700) + P('M349 -35V34','#496879',1.1);
      art += T(380,-6,line1,31,white,500) + T(380,36,line2,31,white,500);
      art += '</g>';
    });
    return S(objectives.map(([title,,first,second])=>title+'，'+first+second).join(' '),art);
  };

  scenes[14] = step => {
    let a=I('assets/now.jpg',35,18,294,381,'slice')+rect(35,18,294,381,0,'none',line)+
      T(368,56,'从小帅的变化出发',25,cyan,650);
    const yy=[130,241,353];
    a+=P('M385 111 V364',line,2);
    const pts = step===0 ?
      [['腰腹增粗','脂肪发生了怎样的变化？'],['上楼费力','近端肌无力怎样形成？']] :
      [['脂肪重新分布','腰腹脂肪堆积，四肢相对细。'],['肌蛋白分解增加','近端肌力下降，起立、上楼费力。'],['其他线索','皮肤变薄、易瘀斑，骨形成减少。']];
    pts.forEach(([t,d],i)=>{
      a+=C(385,yy[i]-12,5,i===0?coral:cyan)+pulse(385,yy[i]-12,7,i===0?coral:cyan)+
        T(414,yy[i],t,28,white,670)+T(414,yy[i]+35,d,24,muted);
    });
    if(step===0)a+=T(412,349,'还想追问哪些症状或用药经历？',23,gold);
    return S('从脂肪分布与近端肌无力回顾小帅的体征',a);
  };

  const labs=[
    ['血清皮质醇','895.2','nmol/L','133.0–537.0','↑'],
    ['ACTH','18.5','pmol/L','1.6–13.9','↑'],
    ['空腹血糖','8.1','mmol/L','3.9–6.1','↑'],
    ['血钾','3.1','mmol/L','3.5–5.3','↓'],
    ['甘油三酯','3.90','mmol/L','< 1.70','↑']
  ];
  function labTable(){
    let tab=T(34,49,'小帅的化验单',26,cyan,650)+T(228,96,'检测结果',20,muted)+T(450,96,'参考区间',20,muted)+P('M34 108H600',line);
    labs.forEach(([name,value,units,ref,arrow],i)=>{
      const y=145+i*52;
      if(i<2)tab+=rect(33,y-27,567,42,3,'#1e4254');
      tab+=T(48,y,name,23,white,550)+T(218,y,value+' '+units,22,i<2?gold:white,650)+T(398,y,arrow,24,i===3?cyan:coral,700)+T(449,y,ref,21,muted)+P(`M34 ${y+17}H600`,line,.9);
    });
    return tab;
  }
  scenes[15] = step => {
    const tab=labTable();
    if(step===1){
      const a=tab+T(659,53,'垂体 MRI',26,cyan,650)+
        reveal(I('assets/mri.jpg',649,72,470,257))+T(650,358,'垂体左后缘可疑病灶，约 8 mm。',23,white,600)+
        T(650,393,'病灶的分泌功能仍需内分泌检查判断。',21,muted);
      return S('ACTH 依赖性高皮质醇血症的评估与小帅的 MRI',a);
    }
    const right=T(651,58,'用负反馈做预测',25,cyan,650)+
      T(651,137,'如果是肾上腺自主分泌……',26,white,600)+
      flow('M665 168 C718 168 726 216 791 216 H850','signal',cyan,2)+
      T(869,224,'ACTH 应降低',24,cyan,650)+
      T(651,300,'实际读数',21,muted)+T(651,343,'ACTH ↑　皮质醇 ↑',31,gold,700)+
      T(651,384,'异常信号可能来自哪一层？',23,white);
    return S('血清皮质醇、ACTH、血糖、血钾和甘油三酯与参考范围',tab+right);
  };


  function axisBox(y,label){
    return rect(829,y-27,179,53,25,'#15364a','#427181')+T(918,y+9,label,24,white,650,'middle');
  }
  scenes[17] = step => {
    const metabolism=step>=1, regulation=step>=2;
    let a=T(28,50,'物质代谢与应激',26,cyan,660);
    a+=glow(144,170,130,102)+glow(412,176,135,97,'warm')+
      I('../shared/liver.png',18,87,158,108)+I('../shared/muscle.png',410,90,146,105)+
      window.gcBloodChannel(183,146,202,55,metabolism?2:0)+
      T(284,123,'血糖',21,cyan,600,'middle')+
      flow('M145 153Q164 151 185 169','glucose',cyan,metabolism?8:3,metabolism?63:42)+
      flow('M384 176Q406 179 431 164','glucose',cyan,metabolism?1.2:3,42)+
      T(121,248,metabolism?'肝糖输出 ↑':'肝糖输出 ？',26,metabolism?gold:white,650,'middle')+
      T(443,248,metabolism?'肌肉摄糖 ↓':'肌肉摄糖 ？',26,metabolism?coral:white,650,'middle')+
      T(289,303,metabolism?'血糖有升高趋势':'血糖会怎样改变？',28,white,650,'middle')+
      '<g transform="translate(89 361) scale(.43)">'+window.gcVesselCrossSection(metabolism)+'</g>'+
      T(146,353,metabolism?'GC 维持血管对儿茶酚胺的反应性':'应激时，允许作用发生在哪里？',21,cyan,600)+
      (metabolism?T(146,386,'小动脉收缩有助于维持血压',19,muted,500):'');
    a+=T(620,50,'HPA 轴与负反馈',26,cyan,660)+P('M585 60V390',line);
    const ax=[97,190,282];
    a+=axisBox(ax[0],'下丘脑')+axisBox(ax[1],'腺垂体')+axisBox(ax[2],'肾上腺皮质');
    a+=T(918,371,'皮质醇',26,gold,660,'middle');
    if(!regulation){
      a+=P('M918 125V160 M918 218V252 M918 310V337',line,1.8,'stroke-dasharray="4 6"')+
        P('M857 358H738V102',line,2,'stroke-dasharray="6 8"')+T(720,252,'返回哪里？',21,muted,550,'end');
      return S('糖皮质激素作用和分泌调节小结',a);
    }
    for(let i=0;i<2;i++){
      let d=`M918 ${ax[i]+27}V${ax[i+1]-30}`;
      a+=flow(d,'signal',gold,2,48)+P(`M912 ${ax[i+1]-38}l6 8 6 -8`,gold,2)+T(947,ax[i]+55,i===0?'CRH':'ACTH',19,gold,650);
    }
    a+=flow('M918 310V337','gc',gold,2,46);
    a+=P('M866 358H734V97H821 M734 190H821',coral,2.4)+
        P('M821 88V106 M821 181V199',coral,3.5)+Array.from('反馈抑制',(ch,i)=>T(710,209+i*34,ch,21,coral,650,'middle')).join('');
    return S('糖皮质激素作用和分泌调节小结',a);
  };

  function profile(x,y,invert,accent){
    // Two stylized speakers share a conversation, with the face oriented toward its listener.
    const s=invert?-1:1;
    return `<g transform="translate(${x} ${y}) scale(${s} 1)">`+
      glow(0,-10,114,120,invert?'warm':'cold')+
      `<path d="M-69 94Q-60 65 -28 51L-23 23Q-41 4 -39 -24Q-38 -75 3 -78Q39 -82 49 -49L50 -30L61 -11L49 -8L47 10Q43 28 23 32L24 51Q24 62 52 75L64 94Z" fill="url(#c-lit)" stroke="${accent}" stroke-width="2.8"/>`+
      P('M24 -31 Q33 -35 41 -30 M42 -7 Q49 -9 52 -8 M-21 44 Q-13 58 -3 61',accent,2)+
      C(34,-30,2.7,accent)+'</g>';
  }
  scenes[18] = () => S('一名患者与一名医生用机制讨论 GC 的疗效和不良反应',
    profile(165,134,false,cyan)+profile(994,134,true,coral)+
    T(155,271,'患者',26,cyan,650,'middle')+T(1000,271,'医生',26,coral,650,'middle')+
    T(582,106,'为什么要用 GC？',31,white,670,'middle')+
    flow('M251 137 C378 139 452 149 569 149 S765 136 904 137','signal',cyan,2,65)+
    T(582,213,'怎样解释获益和不良反应？',28,white,650,'middle')+
    flow('M901 241 C785 239 691 248 578 253 S375 239 255 242','signal',coral,2,64)+
    P('M84 304H1076',line,1)+T(580,351,'一项临床用途　　·　　一种不良反应　　·　　一幅证据图',25,gold,600,'middle')+
    T(580,391,'5–6 人一组，下次课用一次医患对话讲清两条机制。',21,muted,500,'middle'));

  function book(x,y){
    return `<g transform="translate(${x} ${y})">`+P('M0 3 Q-20 -7 -40 -3v50Q-17 44 0 54Q19 43 40 47V-3Q18 -9 0 3V54',cyan,2.4)+P('M-33 7q15 -1 26 5m-25 5q14 -1 25 5m14 -10q11 -6 26 -6m-26 16q12 -6 26 -6',line,1.5)+'</g>';
  }
  scenes[19] = () => {
    const mid=flow('M301 64C330 64 342 113 363 153 S390 221 415 221','signal',cyan,1,60);
    const ref=(y,num,title,meta,href)=>`<a href="${href}" target="_blank" rel="noopener">`+T(439,y,num,18,cyan,700)+T(497,y,title,26,white,630)+T(497,y+34,meta,19,muted)+P(`M498 ${y+51}H1109`,line,1)+'</a>';
    return S('线上平台图谱、教材与两篇原始研究',glow(167,149,150,130)+
      I('assets/qr.jpg',57,85,202,202)+T(158,334,'线上平台课程入口',23,cyan,650,'middle')+
      mid+book(382,63)+T(439,67,'教材',18,cyan,700)+T(497,67,'《生理学》内分泌篇',27,white,650)+T(497,102,'第十一章　肾上腺皮质激素',20,muted)+P('M498 119H1109',line,1)+
      ref(177,'研究','人体皮质醇过多与胰岛素敏感性','Rizza 等 · J Clin Endocrinol Metab · 1982 · PMID 7033265','https://pubmed.ncbi.nlm.nih.gov/7033265/')+
      ref(287,'研究','GC 受体调节剂的靶向递送','McPherson 等 · Sci Transl Med · 2024 · PMID 38507467','https://pubmed.ncbi.nlm.nih.gov/38507467/'));
  };

  // Read directly from the recorded HomeoXNet intervention. Columns are simulated
  // hours, blood glucose (mmol/L), endogenous insulin effect (baseline = 1), K (mmol/L).
  scenes[20] = () => '<iframe title="HomeoXNet 皮质醇实时演算" id="homeoxnet-full" sandbox="allow-scripts" src="homeoxnet/network-offline.html?mode=full&amp;lang=zh"></iframe>';
})();
