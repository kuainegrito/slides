// The tiny deterministic example is computed locally; no arbitrary code is executed.
export function conversionChecks(bug=false){
  const convert=bug?f=>f-32*5/9:f=>(f-32)*5/9;
  return [[32,0],[212,100],[-40,-40]].map(([input,expected])=>{const actual=convert(input);return {input,expected,actual,pass:Math.abs(actual-expected)<1e-9};});
}
export function buildCode(svg,{make,path,text,label,stream,flowTick},edition){
  const fade=(t,s,d=2)=>{const v=Math.max(0,Math.min(1,(t-s)/d));return v*v*(3-2*v);};
  label(34,44,'Code from conversation','对话成码：让想法变成可运行的工具',svg,27);
  text(35,101,edition==='teacher'?'Describe a teaching need. Build a small tool. Test it before class.':'Describe a small need. Build one function. Check it with examples.',13,svg,'#62778b');
  make('ellipse',{cx:527,cy:308,rx:235,ry:207,fill:'url(#as-halo)'});
  const conversation=make('g',{'data-art':'conversation'}),bubbles=[];
  [[60,157,194,103],[89,283,187,96],[60,404,209,76]].forEach(([x,y,w,h],i)=>{
    const g=make('g',{},conversation);path(`M${x+14} ${y} H${x+w-14} Q${x+w} ${y} ${x+w} ${y+14} V${y+h-14} Q${x+w} ${y+h} ${x+w-14} ${y+h} H${x+38} L${x+18} ${y+h+15} V${y+h} H${x+14} Q${x} ${y+h} ${x} ${y+h-14} V${y+14} Q${x} ${y} ${x+14} ${y}`,['#7fa8c3','#9e86bb','#7ba8aa'][i],1.5,g).setAttribute('fill',i===1?'#e9e2f4':'#f4fbff');
    if(i===0){make('circle',{cx:x+30,cy:y+28,r:10,fill:'#c4dce9'},g);path(`M${x+15} ${y+52} Q${x+30} ${y+30} ${x+45} ${y+52}`,'#6894b1',3,g);label(x+58,y+30,'A small need','一个小需求',g,14);text(x+18,y+82,'°F → °C',19,g,'#526f91');}
    if(i===1){label(x+18,y+28,'Input → output','输入 → 输出',g,14);path(`M${x+20} ${y+66} H${x+151} M${x+144} ${y+59} l7 7 l-7 7`,'#9476b3',2,g);make('circle',{cx:x+40,cy:y+66,r:7,fill:'#e9e2f4',stroke:'#9476b3'},g);make('rect',{x:x+116,y:y+58,width:16,height:16,rx:3,fill:'#d1c3e4'},g);}
    if(i===2){label(x+18,y+28,'Check a known case','给出可核验的例子',g,14);text(x+18,y+64,'32°F → 0°C',15,g,'#477d84');}
    bubbles.push(g);stream(`M${x+w} ${y+h/2} C330 ${y+h/2},329 282,383 282`,['#50aac7','#9d79ba','#59a69e'][i],i*1.2,16);
  });
  // A circuit halo and moving traces surround an actual, readable tiny function.
  const circuit=make('g',{'data-art':'circuit'});
  for(let i=0;i<9;i++){const y=177+i*34;path(`M356 ${y} h15 v${i%2?13:-13} h16 M694 ${y} h18 v${i%2?-13:13} h14`,'#93b8cd',1.2,circuit);[356,726].forEach(x=>make('circle',{cx:x,cy:y,r:2.8,fill:'#74abc4'},circuit));}
  const editor=make('g',{'data-art':'editor'});make('rect',{x:379,y:156,width:320,height:326,rx:16,fill:'#193650',stroke:'#7ea5bd'},editor);make('rect',{x:379,y:156,width:320,height:35,rx:16,fill:'#254760'},editor);
  [0,1,2].forEach(i=>make('circle',{cx:398+i*14,cy:174,r:3.4,fill:['#dba693','#d8c797','#8bbfb4'][i]},editor));text(465,180,'convert.js',12,editor,'#c4e1ef');
  const code=make('g',{'data-art':'code-lines','font-family':'Consolas, monospace'},editor);text(399,221,'01',11,code,'#627f98');text(426,221,'const toCelsius = f =>',17,code,'#d8b1ed');text(399,253,'02',11,code,'#627f98');const expression=text(426,253,'(f - 32) * 5 / 9;',17,code,'#88d2e4');text(426,281,'// test, then trust',12,code,'#7fa2ba');
  path('M397 299 H681','#375c76',1,editor);[[398,'INPUT'],[478,'EXPECTED'],[562,'RESULT']].forEach(([x,s])=>text(x,322,s,10,editor,'#aac9de'));
  const tests=Array.from({length:3},(_,i)=>{const y=351+i*37;const g=make('g',{'data-test':i},editor);text(398,y,['32°F','212°F','−40°F'][i],13,g,'#c5deec');text(478,y,['0°C','100°C','−40°C'][i],13,g,'#c5deec');const value=text(562,y,'',13,g,'#9cd2bd');const mark=path('','#91d0b4',2,g);return {g,value,mark,y};});
  const scan=make('rect',{x:387,y:200,width:304,height:2,fill:'#7bcee8',opacity:.6},editor);const testStatus=text(398,460,'',12,editor,'#a2d7c2');
  const outputs=[];
  [['IT tools','日常工具',805,220,'#519bb6'],['Data','数据分析',981,220,'#9678b6'],['Smart home','智能家居',805,411,'#5e9c9f'],['Apps & games','应用与游戏',981,411,'#a47bb7']].forEach(([en,zh,x,y,c],i)=>{
    stream(`M697 308 C747 308,${x-80} ${y},${x} ${y}`,c,11+i*1.5,17);const g=make('g',{'data-output':i});make('circle',{cx:x,cy:y,r:55,fill:'#f6fbff',opacity:.85},g);make('circle',{cx:x,cy:y,r:59,fill:'none',stroke:c,'stroke-dasharray':'2 9',opacity:.5},g);const moving=[];
    if(i===0){path(`M${x-34} ${y-24} H${x+28} V${y+15} H${x-34} Z M${x-41} ${y+24} H${x+36} L${x+28} ${y+15} M${x-34} ${y+15} L${x-41} ${y+24}`,c,2,g);path(`M${x-20} ${y-11} l9 7 l-9 7 M${x-4} ${y+3} H${x+12}`,c,2,g);moving.push(make('rect',{x:x-26,y:y+9,width:46,height:2,fill:c},g));}
    if(i===1){path(`M${x-34} ${y-29} V${y+29} H${x+36}`,c,2,g);[0,1,2,3].forEach(k=>moving.push(make('rect',{x:x-24+k*15,y:y-8-k*5,width:9,height:37+k*5,rx:2,fill:c,opacity:.5+k*.13},g)));path(`M${x-25} ${y+1} L${x-8} ${y-13} L${x+7} ${y-8} L${x+26} ${y-31}`,'#628fac',2,g);}
    if(i===2){path(`M${x-38} ${y-2} L${x} ${y-34} L${x+38} ${y-2} M${x-28} ${y-8} V${y+32} H${x+28} V${y-8} M${x-7} ${y+32} V${y+10} H${x+7} V${y+32}`,c,2,g);[-18,17].forEach(dx=>moving.push(make('rect',{x:x+dx-5,y:y-3,width:10,height:11,rx:1,fill:'#d8b96b'},g)));for(let k=0;k<2;k++)path(`M${x-13-k*6} ${y-43-k*5} Q${x} ${y-54-k*8} ${x+13+k*6} ${y-43-k*5}`,c,1.4,g);}
    if(i===3){path(`M${x-22} ${y-20} Q${x-42} ${y-17} ${x-39} ${y+19} Q${x-31} ${y+35} ${x-17} ${y+12} H${x+17} Q${x+31} ${y+35} ${x+39} ${y+19} Q${x+42} ${y-17} ${x+22} ${y-20} Z`,c,2,g);path(`M${x-28} ${y-3} H${x-10} M${x-19} ${y-12} V${y+6}`,c,3,g);[[18,-7],[27,2],[9,2],[18,11]].forEach(([dx,dy])=>moving.push(make('circle',{cx:x+dx,cy:y+dy,r:3.8,fill:c},g)));}
    label(x-59,y+82,en,zh,g,14);const sparks=Array.from({length:10},(_,j)=>make('circle',{r:j%4===0?2.6:1.5,fill:c},g));outputs.push({g,x,y,moving,sparks});
  });
  const feedback=make('g',{'data-art':'feedback'});path('M618 486 C580 536 320 541 234 486','#8f7caf',1.5,feedback).setAttribute('stroke-dasharray','4 7');const feedbackDot=make('circle',{r:4,fill:'#ad83c5'},feedback);label(351,525,'Test → revise → test again','测试 → 修改 → 再测试',feedback,13);
  text(34,561,'Animated workflow + a local unit-conversion example. No AI service is called. / 流程示意与本地换算示例，不调用 AI 服务。',10,svg,'#68788b');
  let lastVariant=-1;
  return {tick(t,variant){const bug=variant===1;flowTick(t);bubbles.forEach((g,i)=>g.setAttribute('opacity',.25+.75*fade(t,i*1.2)));editor.setAttribute('opacity',.3+.7*fade(t,4));code.setAttribute('opacity',fade(t,5));tests.forEach(({g},i)=>g.setAttribute('opacity',fade(t,8+i*.8)));scan.setAttribute('y',201+(t*29)%227);scan.setAttribute('opacity',.15+.25*Math.sin(t*2)**2);circuit.setAttribute('opacity',.4+.3*Math.sin(t)**2);
    if(lastVariant!==variant){lastVariant=variant;expression.textContent=bug?'f - 32 * 5 / 9;':'(f - 32) * 5 / 9;';expression.setAttribute('fill',bug?'#edb19f':'#88d2e4');const results=conversionChecks(bug);results.forEach((r,i)=>{const {g,value,mark,y}=tests[i];g.dataset.pass=String(r.pass);value.textContent=(Number.isInteger(r.actual)?r.actual:r.actual.toFixed(1))+'°C';value.setAttribute('fill',r.pass?'#a2d8be':'#edb19f');mark.setAttribute('stroke',r.pass?'#a2d8be':'#edb19f');mark.setAttribute('d',r.pass?`M650 ${y-5} l5 5 l10 -12`:`M650 ${y-12} l13 13 M663 ${y-12} l-13 13`);});testStatus.textContent=bug?'3 FAILED · missing parentheses':'3 PASSED · known examples';testStatus.setAttribute('fill',bug?'#edb19f':'#a2d8be');}
    outputs.forEach(({g,x,y,moving,sparks},i)=>{g.setAttribute('opacity',fade(t,11+i*1.5)*(bug?.35:1));moving.forEach((n,j)=>{n.setAttribute('opacity',.35+.6*(1+Math.sin(t*1.5+j))/2);if(i===1){const h=18+j*8+Math.sin(t+j)*7;n.setAttribute('y',y+29-h);n.setAttribute('height',h);}});sparks.forEach((n,j)=>{const a=t*.4+j*Math.PI/5;n.setAttribute('cx',x+Math.cos(a)*63);n.setAttribute('cy',y+Math.sin(a)*57);});});feedback.setAttribute('opacity',fade(t,17));const f=(t*.18)%1;feedbackDot.setAttribute('cx',618-384*f);feedbackDot.setAttribute('cy',486+Math.sin(f*Math.PI)*37);}};
}
