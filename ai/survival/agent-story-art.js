const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const stride=(t,start,end)=>smooth((t-start)/.22)*smooth((end-t)/.22);
export function storyArt(svg){
 const NS='http://www.w3.org/2000/svg';
 const make=(tag,a={},p=svg)=>{const n=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));p.append(n);return n;};
 const path=(d,c='#57758b',w=2,p=svg,fill='none')=>make('path',{d,stroke:c,'stroke-width':w,fill,'stroke-linecap':'round','stroke-linejoin':'round'},p);
 const rect=(x,y,width,height,fill,p=svg,extra={})=>make('rect',{x,y,width,height,rx:6,fill,...extra},p);
 const text=(x,y,s,size=18,p=svg,zh=false,c='#3f3f46')=>{const n=make('text',{x,y,'font-size':size,fill:zh?'#7030a0':c,...(zh?{class:'zh'}:{})},p);n.textContent=s;return n;};
 const circle=(cx,cy,r,fill,p=svg)=>make('circle',{cx,cy,r,fill},p);
 function person(parent){
  const g=make('g',{'data-story-part':'mum'},parent);make('ellipse',{cx:0,cy:5,rx:34,ry:8,fill:'#6b7298',opacity:.15},g);
  // The artwork is drawn facing right. Mirror it before a leftward step.
  const body=make('g',{},g);
  const farLeg=path('M-10 -57 L-11 -6','#455a78',11,body),nearLeg=path('M11 -57 L12 -6','#64748c',11,body);
  const farArm=path('M-19 -118 L-31 -70','#dcb59d',11,body);
  path('M-17 -124 Q0 -134 18 -123 L29 -56 Q0 -41 -29 -56 Z','#8670aa',2,body,'#9d84b9');
  path('M-14 -111 L-22 -65 Q0 -56 22 -65 L14 -111 Z','#ecdfef',1,body,'#f3e9f1');
  const arm=path('M18 -118 L31 -72','#e6c0a7',11,body);
  make('ellipse',{cx:0,cy:-154,rx:28,ry:33,fill:'#415570'},body);
  const face=make('g',{},body);circle(0,-151,21,'#f0cfb4',face);
  path('M-23 -159 Q-10 -190 24 -158','#415570',7,face);circle(-8,-153,2,'#425064',face);circle(8,-153,2,'#425064',face);path('M-6 -142 Q0 -137 7 -143','#a06d70',1.8,face);
  const profile=make('g',{'data-story-part':'walking-profile'},body);
  path('M-2 -169 Q11 -176 20 -163 Q23 -157 24 -151 L30 -146 L24 -143 Q22 -132 13 -130 Q0 -129 -5 -140 Q-12 -152 -2 -169Z','#f0cfb4',1,profile,'#f0cfb4');
  path('M-8 -159 Q5 -177 20 -163','#415570',6,profile);circle(17,-153,2,'#425064',profile);path('M18 -139 Q22 -138 24 -140','#a06d70',1.8,profile);
  const bag=make('g',{'data-story-part':'shopping-bag'},body);rect(28,-59,37,43,'#c7a379',bag);path('M35 -59 V-69 Q47 -82 58 -69 V-59','#9a7b5c',3,bag);const bagContents=make('g',{},bag);circle(40,-58,9,'#b9c88c',bagContents);circle(53,-55,9,'#cf8674',bagContents);
  const phone=make('g',{},body);rect(30,-128,22,36,'#344c6a',phone);rect(33,-124,16,25,'#d6f1f4',phone);circle(41,-103,2,'#8e80bb',phone);
  return {g,bag,bagContents,phone,arm,pose(x,y,t,{walk=0,reach=0,carry=false,usePhone=false,direction=1}={}){
   const cadence=t*7,swing=Math.sin(cadence)*walk*17;
   g.setAttribute('transform',`translate(${x} ${y+Math.abs(Math.sin(cadence))*walk*2}) scale(1.5)`);
   g.dataset.facing=walk>0?(direction<0?'left':'right'):'front';
   body.setAttribute('transform',`scale(${direction} 1) skewX(${-walk*2})`);
   face.setAttribute('opacity',1-walk);profile.setAttribute('opacity',walk);
   nearLeg.setAttribute('d',`M11 -57 L${12+swing} ${-6-Math.max(0,Math.cos(cadence))*walk*7}`);
   farLeg.setAttribute('d',`M-10 -57 L${-11-swing} ${-6-Math.max(0,-Math.cos(cadence))*walk*7}`);
   farArm.setAttribute('d',`M-19 -118 L${-31+swing*.6} -70`);
   arm.setAttribute('d',`M18 -118 Q${28+reach*18} ${-94-reach*20} ${31+reach*43-(carry||usePhone?0:swing*.55)} ${usePhone?-116:-72-reach*40}`);
   bag.setAttribute('opacity',carry?1:0);phone.setAttribute('opacity',usePhone?1:0);
  }};
 }
 function room(parent){
  rect(0,0,1080,370,'#eef0ed',parent);rect(0,370,1080,75,'#d9caba',parent);for(let x=0;x<1080;x+=90)path(`M${x} 370 l-30 75`,'#c6b8aa',1,parent);
  rect(55,45,230,150,'#c3dce5',parent,{stroke:'#9eb8c6','stroke-width':8});path('M170 48 V193 M58 119 H282','#f4f7f8',6,parent);path('M65 168 Q120 122 175 171 T275 165','#b1c6bc',2,parent,'#b1c6bc');
  rect(350,230,430,25,'#b2bec2',parent);rect(362,255,405,115,'#e1d8cf',parent);[370,500,630].forEach(x=>{rect(x,265,118,92,'#efe8df',parent,{stroke:'#c6baad'});rect(x+45,275,25,4,'#9d9e9c',parent);});
  rect(553,206,82,22,'#4f6270',parent);make('ellipse',{cx:594,cy:205,rx:36,ry:9,fill:'#7b8992'},parent);path('M630 205 h40','#506371',7,parent);
  const fridge=make('g',{'data-story-part':'fridge'},parent);rect(815,70,160,300,'#9db5c2',fridge);rect(825,81,140,278,'#e1f0f2',fridge);[160,235,300].forEach(y=>path(`M829 ${y} H960`,'#acc8cf',4,fridge));
  const eggs=make('g',{},fridge);for(let i=0;i<3;i++)make('ellipse',{cx:852+i*21,cy:220,rx:8,ry:12,fill:'#f5e6cc'},eggs);
  const veg=make('g',{'data-story-part':'fridge-vegetables'},fridge);[0,1,2].forEach(i=>{circle(851+i*34,287,12,i%2?'#c8d694':'#cc8c78',veg);path(`M${851+i*34} 276 l4 -7`,'#82a078',3,veg);});
  const door=make('g',{'data-story-part':'fridge-door'},fridge);rect(815,70,160,300,'#d9e5e9',door,{stroke:'#a2b8c5','stroke-width':2});path('M815 171 H975','#a2b8c5',2,door);path('M838 105 V144 M838 202 V245','#8099aa',6,door);
  // Door is hinged at the right edge; scaling projects its opening into the room.
  return {door,veg,open(value){door.setAttribute('transform',`translate(975 0) scale(${1-value*.9} 1) translate(-975 0)`);}};
 }
 function market(parent){
  rect(0,0,1080,370,'#eef0e8',parent);rect(0,370,1080,75,'#d9d3c5',parent);rect(165,128,670,220,'#e7d8bb',parent);rect(150,83,700,55,'#91b6a2',parent);
  for(let i=0;i<10;i++)rect(150+i*70,83,35,55,'#f5e8cb',parent,{rx:0});text(392,65,'Fresh produce / 蔬菜摊',25,parent);
  rect(180,267,620,103,'#b99d77',parent);[205,395,585].forEach(x=>{rect(x,194,165,76,'#c9b38e',parent);for(let i=0;i<12;i++)circle(x+18+i%6*25,211+Math.floor(i/6)*25,11,x===395?'#a7be84':x===205?'#d38a74':'#dfb565',parent);});
  rect(720,155,54,95,'#4d6574',parent);rect(725,161,44,55,'#cce9de',parent);text(732,185,'PAY',12,parent);path('M735 199 h23 M735 207 h14','#649b91',2,parent);
 }
 return {make,path,rect,text,circle,person,room,market,smooth};
}

export function buildDomesticStory(svg,kind){
 const a=storyArt(svg),{make,path,rect,text,circle,person,room,market,smooth}=a;
 const clipId='domestic-room-clip';const defs=make('defs');const clip=make('clipPath',{id:clipId},defs);rect(28,124,1024,388,'#fff',clip,{rx:14});
 const viewport=make('g',{'clip-path':`url(#${clipId})`,'data-story-part':'continuous-room'});
 const camera=make('g',{},viewport);const kitchen=make('g',{transform:'translate(28 124) scale(.95 .87)'},camera),objects=room(kitchen);
 const store=make('g',{transform:'translate(1108 124) scale(.95 .87)'},camera);market(store);
 const groceries=make('g',{'data-story-part':'groceries'},kitchen);[0,1,2].forEach(i=>circle(435+i*26,216,12,i%2?'#99b77b':'#ce8877',groceries));
 // Countertop props sit behind the character. In the phone scene the meal is
 // farther left so the query pose and the dish both remain visible.
 const plate=make('g',{'data-story-part':'meal'},kitchen);if(kind==='weather')plate.setAttribute('transform','translate(-40 0)');
 make('ellipse',{cx:460,cy:232,rx:59,ry:13,fill:'#d3e0e5',stroke:'#9eb3bd'},plate);make('ellipse',{cx:460,cy:228,rx:40,ry:12,fill:'#e3bd89'},plate);circle(445,222,9,'#8caf79',plate);circle(473,226,7,'#c97c70',plate);const steam=path('M443 212 q-9 -11 0 -22 M464 209 q-8 -10 0 -22','#a1b2b8',2,plate);
 const mum=person(kitchen),shopper=person(store);
 const tomato=circle(240,220,12,'#ce8877',store);tomato.dataset.storyPart='selected-tomato';
 const receipt=make('g',{'data-story-part':'receipt'},store);rect(692,213,78,78,'#fff9e9',receipt);[0,1,2].forEach(i=>path(`M703 ${232+i*13} h48`,'#8fa19e',2,receipt));
 const bubble=make('g',{'data-story-part':'speech'},svg);rect(48,145,300,68,'#ffffffed',bubble,{stroke:'#c5d6e3'});const words=text(66,174,'',18,bubble,true),small=text(66,198,'',12,bubble,false,'#62768c');
 const caption=text(38,545,'',21,svg,true);
 const phonePanel=make('g',{'data-story-part':'phone-screen'},svg);rect(628,153,200,280,'#304b68',phonePanel,{rx:18});rect(639,170,178,241,'#f3f9fb',phonePanel,{rx:8});text(659,201,'15:00 · 出门地点',16,phonePanel);const cloud=path('M669 254 Q655 232 678 225 Q694 200 716 223 Q744 220 747 253 Z','#7f9bb2',2,phonePanel,'#d3e3ee');
 const weatherLabel=text(659,285,'',21,phonePanel,true),weatherHint=text(659,315,'',14,phonePanel);const weatherRows=[];for(let i=0;i<4;i++)weatherRows.push(rect(658,342+i*13,125-i*17,5,'#b9cddd',phonePanel));
 const rain=make('g',{'data-story-part':'rain'},kitchen);const drops=Array.from({length:24},(_,i)=>path(`M${67+i%8*27} ${55+Math.floor(i/8)*35} l-5 14`,'#79a3be',1.5,rain));
 const umbrella=make('g',{'data-story-part':'umbrella'},kitchen);path('M-63 0 Q0 -83 63 0 Q40 -16 21 0 Q0 -15 -21 0 Q-42 -17 -63 0','#8e70aa',2,umbrella,'#aa91c2');path('M0 -39 V74 Q0 88 -12 81','#64738c',4,umbrella);
 const packed=make('g',{'data-story-part':'ready-bag'},kitchen);rect(735,291,46,65,'#a9b8c7',packed,{rx:12});path('M743 290 q15 -25 29 0','#859bac',4,packed);
 let stage='';
 return {tick(t,{approved=false,stockFull=false,failed=false}){
  phonePanel.setAttribute('opacity',0);rain.setAttribute('opacity',0);umbrella.setAttribute('opacity',0);packed.setAttribute('opacity',0);groceries.setAttribute('opacity',0);plate.setAttribute('opacity',0);receipt.setAttribute('opacity',0);
  objects.veg.setAttribute('opacity',stockFull?1:0);objects.open(0);tomato.setAttribute('opacity',0);shopper.g.setAttribute('opacity',0);mum.g.setAttribute('opacity',1);
  if(kind==='care'){
   const back=approved?smooth((t-17)/3):0,pan=stockFull?0:smooth((t-8)/2)*(1-back);camera.setAttribute('transform',`translate(${-1080*pan} 0)`);
   let x=300+440*smooth(t/3),walk=stride(t,0,3),reach=0,carry=false,direction=1;
   if(t<3){stage='walk';words.textContent='“我饿了。”';small.textContent='听到目标，先看看家里有什么。';caption.textContent='理解需求 → 走到冰箱，查看现有条件。';}
   else if(t<6){stage='inspect';objects.open(smooth((t-3)/1.2));reach=smooth((t-3)/1.2);words.textContent=stockFull?'鸡蛋、蔬菜都够。':'有鸡蛋，但没有番茄。';small.textContent='打开冰箱，依据观察更新计划。';caption.textContent='观察反馈：够用就直接准备，缺什么才补什么。';}
   else if(stockFull){stage=t<11?'prepare':'ready';x=740-230*smooth((t-6)/3);walk=stride(t,6,9);direction=t<9?-1:1;groceries.setAttribute('opacity',smooth((t-8)/2));plate.setAttribute('opacity',smooth((t-10)/2));words.textContent='食材齐全，跳过采购。';small.textContent='已有条件满足目标，就不多跑一趟。';caption.textContent='分支调整 → 准备用餐 → 检查是否满足需求。';}
   else if(t<8){stage='list';objects.open(1-smooth((t-6)));words.textContent='把番茄加入采购清单。';small.textContent='计划来自刚刚看到的结果。';caption.textContent='更新计划：只补缺少的食材。';}
   else if(!approved||t<17){stage=!approved&&t>=12?'approval':t<12?'market':'purchase';shopper.g.setAttribute('opacity',1);shopper.pose(350+230*smooth((t-10)/2),372,t,{walk:stride(t,10,12),reach:approved?.7:0,carry:true,usePhone:approved});shopper.bagContents.setAttribute('opacity',approved?smooth((t-14)/2):0);tomato.setAttribute('opacity',approved?1:0);tomato.setAttribute('cx',250+400*smooth((t-12)/2));tomato.setAttribute('cy',220+76*smooth((t-12)/2));receipt.setAttribute('opacity',approved?smooth((t-14)/2):0);words.textContent=!approved&&t>=12?'买这些菜，可以吗？':approved?'确认后付款、收好食材。':'到菜摊，挑选缺少的番茄。';small.textContent=!approved&&t>=12?'点击下方“模拟确认采购”继续。':'情节演示，不会产生真实订单。';caption.textContent=!approved&&t>=12?'确认关卡：涉及花钱，先等你点头。':'行动 → 核对清单、支付结果与拿到的食材。';}
   else{stage=t<20?'return':t<24?'prepare':'ready';reach=t>=22&&t<24?.7+.12*Math.sin(t*5):0;x=740-230*smooth((t-20)/2);walk=stride(t,20,22);direction=t<22?-1:1;carry=t<22;groceries.setAttribute('opacity',smooth((t-20)/2)*(1-smooth((t-22)/2)));plate.setAttribute('opacity',smooth((t-22)/2));words.textContent='回到厨房，食材齐了。';small.textContent='把结果与最初的目标核对。';caption.textContent='回家准备好一餐：目标 → 观察 → 行动 → 验收。';}
   mum.pose(x,372,t,{walk,reach,carry,direction,usePhone:!stockFull&&t>=6&&t<8});if(pan>.98)mum.g.setAttribute('opacity',0);
  }else{
   camera.setAttribute('transform','translate(0 0)');objects.open(0);objects.veg.setAttribute('opacity',1);plate.setAttribute('opacity',1);
   const pick=smooth((t-8)/3),leave=smooth((t-12)/6);mum.pose(370+180*smooth(t/2)+165*pick+390*leave,372,t,{walk:stride(t,0,2)+stride(t,8,11)+stride(t,12,18),usePhone:t>=2&&t<10});
   phonePanel.setAttribute('opacity',smooth((t-2)/1));weatherRows.forEach((n,i)=>n.setAttribute('opacity',t<6?.2+.6*Math.sin(t*2+i)**2:.65));
   if(t<2){stage='request';words.textContent='“下午我要出门。”';small.textContent='继续处理新的需求。';caption.textContent='先问清楚出门地点与时间。';}
   else if(failed){stage='failure';words.textContent='天气服务暂时没返回。';small.textContent='保留未知，重试或请人核查。';weatherLabel.textContent='暂不可用';weatherHint.textContent='点击模拟重试';caption.textContent='工具失败不是晴天：先停下来，不编造结果。';}
   else if(t<6){stage='query';words.textContent='拿起手机，查下午天气。';small.textContent='地点与时间一起传给工具。';weatherLabel.textContent='查询中…';weatherHint.textContent='课堂模拟';caption.textContent='调用天气工具 → 等待返回。';}
   else{stage=t<11?'umbrella':'leave';words.textContent=t<11?'下午有雨，把伞带上。':'带好雨伞，再出门。';small.textContent='用返回结果改变准备清单。';weatherLabel.textContent='下午有雨';weatherHint.textContent='模拟天气 · 非实况';caption.textContent='读反馈 → 拿伞、整理随身物品 → 检查准备完成。';rain.setAttribute('opacity',.7);packed.setAttribute('opacity',pick);packed.setAttribute('transform',`translate(${390*leave-95} 0)`);umbrella.setAttribute('opacity',pick);umbrella.setAttribute('transform',`translate(${750+390*leave} ${310-192*smooth((t-11)/2)}) scale(${.35+.65*smooth((t-11)/2)})`);phonePanel.setAttribute('opacity',1-smooth((t-11)/2));mum.arm.setAttribute('d',`M18 -118 Q28 -125 28 ${-72-70*smooth((t-11)/2)}`);}
  }
  steam.setAttribute('transform',`translate(0 ${-Math.sin(t*2)*3})`);drops.forEach((n,i)=>n.setAttribute('transform',`translate(0 ${(t*23+i*3)%26})`));
  svg.dataset.storyStage=stage;svg.dataset.doorOpen=objects.door.getAttribute('transform');
 }};
}
