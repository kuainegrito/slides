// Living miniature outcomes: each has an internal process, an assembly field and orbiting light.
export function buildResult(parent,tools,kind,x,y,color){
  const {make,path}=tools;
  const group=make('g',{'data-result':kind,transform:`translate(${x} ${y})`},parent);
  make('circle',{r:73,fill:'url(#as-halo)'},group);
  make('ellipse',{cy:46,rx:62,ry:16,fill:color,opacity:.07},group);
  const orbits=make('g',{'data-effect':'result-orbits'},group);
  [0,1].forEach(i=>make('ellipse',{rx:66,ry:39+i*14,fill:'none',stroke:color,'stroke-width':1,'stroke-dasharray':i?'3 12':'24 10 3 10',opacity:.55,transform:`rotate(${i?35:-30})`},orbits));
  const rings=Array.from({length:2},()=>make('ellipse',{rx:60,ry:40,fill:'none',stroke:color,'stroke-width':1.4},group));
  const art=make('g',{'data-effect':'result-process'},group),actions=[];
  const p=(d,c=color,w=2,g=art)=>path(d,c,w,g);
  const circle=(cx,cy,r,fill='none',g=art)=>make('circle',{cx,cy,r,fill,stroke:color,'stroke-width':1.6},g);
  const rect=(x,y,width,height,attrs={},g=art)=>make('rect',{x,y,width,height,rx:3,fill:'#f6fcff',stroke:color,'stroke-width':1.5,...attrs},g);
  if(kind==='article'){
    [-1,1].forEach((dir,i)=>{const sheet=rect(-27,-38,54,76,{opacity:.3+i*.12});actions.push(t=>sheet.setAttribute('transform',`translate(${dir*(7+Math.sin(t*.8)*3)} ${-i*5}) rotate(${dir*9})`));});
    rect(-26,-37,52,76,{fill:'#fafdff'});p('M-17 -25 H16',color,4);
    const lines=Array.from({length:7},(_,i)=>{const n=p(`M-17 ${-12+i*6} H${i%3===0?8:17}`,color,1.8);n.setAttribute('pathLength','1');n.setAttribute('stroke-dasharray','1');return n;});
    const tip=circle(0,0,2.5,color);actions.push(t=>{const q=(t*.38)%7;lines.forEach((n,i)=>n.setAttribute('stroke-dashoffset',i<q?Math.max(0,1-(q-i)*2):.85));tip.setAttribute('cx',-17+(q%1)*34);tip.setAttribute('cy',-12+Math.floor(q)*6);});
  }else if(kind==='translation'){
    const globe=make('g',{},art);circle(0,0,29,'#e5f2f7',globe);p('M-29 0 H29 M-25 -14 Q0 -4 25 -14 M-25 14 Q0 4 25 14',color,1,globe);
    const meridians=[0,1,2].map(()=>make('ellipse',{rx:12,ry:29,fill:'none',stroke:color,'stroke-width':1},globe));
    const bubbles=[rect(-48,-35,31,23,{fill:'#fbf8ff'}),rect(18,15,31,23,{fill:'#f1fbff'})];p('M-41 -27 h17 M-41 -20 h11 M25 23 h16 M25 30 h10',color,2);
    const dots=Array.from({length:12},()=>circle(0,0,2,color));actions.push(t=>{meridians.forEach((n,i)=>n.setAttribute('rx',Math.max(1,Math.abs(Math.cos(t*.7+i*Math.PI/3))*29)));dots.forEach((n,i)=>{const a=t+i*Math.PI/6;n.setAttribute('cx',Math.cos(a)*51);n.setAttribute('cy',Math.sin(a)*25);n.setAttribute('opacity',.35+.65*(1+Math.sin(a))/2);});bubbles.forEach((n,i)=>n.setAttribute('opacity',.75+.25*Math.sin(t+i*2)**2));});
  }else if(kind==='logic'){
    const nodes=[[-40,-23],[-35,25],[0,-4],[35,-29],[40,24],[0,43]],edges=[[0,2],[1,2],[2,3],[2,4],[4,5],[1,5]];
    edges.forEach(([a,b])=>p(`M${nodes[a]} Q0 0 ${nodes[b]}`,color,1.5));nodes.forEach(([cx,cy],i)=>{circle(cx,cy,i===2?12:8,'#f5fbff');if(i===2)p('M-5 -4 l4 4 l7 -9',color,2);});
    const pulses=edges.map(()=>circle(0,0,3,'#fff'));actions.push(t=>pulses.forEach((n,i)=>{const u=(t*.5+i*.19)%1,a=nodes[edges[i][0]],b=nodes[edges[i][1]];n.setAttribute('cx',(1-u)**2*a[0]+u*u*b[0]);n.setAttribute('cy',(1-u)**2*a[1]+u*u*b[1]);n.setAttribute('r',2+Math.sin(u*Math.PI)*1.5);}));
  }else if(kind==='legal'){
    rect(-34,-39,68,81,{opacity:.38,fill:'#faf7ff'});[-27,-19,24,31].forEach(y=>p(`M-25 ${y} H25`,color,1));
    p('M0 -25 V30 M-20 31 H20',color,2.5);circle(0,-26,3,color);
    const beam=make('g',{},art);p('M-32 -15 Q0 -22 32 -15',color,2.2,beam);[-23,23].forEach(a=>p(`M${a} -16 l-12 27 h24 Z`,color,1.6,beam));actions.push(t=>beam.setAttribute('transform',`rotate(${Math.sin(t*1.2)*8} 0 -22)`));
    const sweep=rect(-34,-39,68,5,{stroke:'none',fill:color,opacity:.13});actions.push(t=>sweep.setAttribute('y',-37+(t*19)%74));
  }else if(kind==='terminal'){
    rect(-45,-34,90,62,{fill:'#193c57'});p('M-51 34 H51 L44 28 H-44 Z',color,2);p('M-35 -20 l9 7 l-9 7', '#80ddeb',2);
    const rows=Array.from({length:5},(_,i)=>rect(i===0?-18:-34,-15+i*8,36+i%3*10,2,{fill:i%2?'#ad91d3':'#7dd0df',stroke:'none'}));
    const sweep=rect(-43,-30,86,3,{fill:'#84e0ed',stroke:'none',opacity:.25});actions.push(t=>{rows.forEach((n,i)=>n.setAttribute('width',(i===0?35:60)*(.25+.75*((t*.5+i*.27)%1))));sweep.setAttribute('y',-31+(t*19)%57);});
    const arc=p('M-51 11 A53 40 0 0 1 47 -29','#8c78c0',2);arc.setAttribute('pathLength','1');arc.setAttribute('stroke-dasharray','.13 .87');actions.push(t=>arc.setAttribute('stroke-dashoffset',-t*.3));
  }else if(kind==='data'){
    const grid=make('g',{transform:'translate(0 22) scale(1 .6) rotate(-30)'},art);for(let i=-40;i<=40;i+=20){p(`M${i} -40 V40`,color,.6,grid);p(`M-40 ${i} H40`,color,.6,grid);}
    const bars=Array.from({length:5},(_,i)=>rect(-37+i*16,0,10,30,{fill:color,opacity:.35+i*.12}));
    const line=p('', '#667fd2',2.5),points=Array.from({length:5},()=>circle(0,0,3,'#fff'));
    actions.push(t=>{let d='';bars.forEach((n,i)=>{const h=22+i*5+Math.sin(t*1.3-i*.7)*11,y=29-h;n.setAttribute('y',y);n.setAttribute('height',h);d+=`${i?'L':'M'}${-32+i*16} ${y-8} `;points[i].setAttribute('cx',-32+i*16);points[i].setAttribute('cy',y-8);});line.setAttribute('d',d);});
  }else if(kind==='home'){
    p('M-46 -1 L0 -37 L46 -1 M-34 -10 V34 H34 V-10',color,2.3);rect(-9,10,18,24);const windows=[rect(-25,-4,13,14,{fill:'#e2bd72'}),rect(12,-4,13,14,{fill:'#e2bd72'})];
    const wireless=Array.from({length:3},(_,i)=>{const n=p(`M${-10-i*8} ${-44-i*5} Q0 ${-55-i*8} ${10+i*8} ${-44-i*5}`,color,1.8);return n;});
    const devices=[[-47,24],[48,20],[0,-45]].map(([a,b])=>circle(a,b,4,'#fff'));const pulses=devices.map(()=>circle(0,0,2,color));
    actions.push(t=>{windows.forEach((n,i)=>n.setAttribute('opacity',.35+.65*(1+Math.sin(t*1.6+i))/2));wireless.forEach((n,i)=>n.setAttribute('opacity',.15+.8*(1+Math.sin(t*2-i))/2));pulses.forEach((n,i)=>{const u=(t*.55+i/3)%1,dx=[-47,48,0][i],dy=[24,20,-45][i];n.setAttribute('cx',dx*u);n.setAttribute('cy',dy*u);});});
  }else if(kind==='game'){
    rect(-31,-43,62,83,{fill:'#203c5b',rx:9});rect(-25,-33,50,53,{fill:'#e1f3f9',stroke:'none'});
    const bricks=Array.from({length:12},(_,i)=>rect(-21+(i%4)*11,-27+Math.floor(i/4)*7,9,4,{fill:i%2?'#9b81bd':'#599fb7',stroke:'none',rx:1}));
    const ball=circle(0,0,3,'#ad71bd'),paddle=rect(-11,12,22,3,{fill:color,stroke:'none'});circle(0,31,4,'none');
    const burst=make('g',{},art);for(let i=0;i<6;i++){const a=i*Math.PI/3;p(`M${Math.cos(a)*4} ${Math.sin(a)*4} L${Math.cos(a)*11} ${Math.sin(a)*11}`,'#c78fbe',1.4,burst);}
    actions.push(t=>{ball.setAttribute('cx',Math.sin(t*1.8)*19);ball.setAttribute('cy',-4+Math.sin(t*2.7)*13);paddle.setAttribute('x',-11+Math.sin(t*1.8+.4)*13);bricks.forEach((n,i)=>n.setAttribute('opacity',((t*.6+i*.17)%2)<.32?.15:1));burst.setAttribute('transform',`translate(33 -28) rotate(${t*35}) scale(${.65+Math.sin(t*2)**2*.35})`);});
  }
  const dust=Array.from({length:28},(_,i)=>make('circle',{r:i%6===0?2.5:1.2,fill:i%6===0?'#fff':color,stroke:color,'stroke-width':.5},group));
  return {tick(t,progress=1){
    art.setAttribute('transform',`scale(${.65+.35*progress}) rotate(${(1-progress)*-15})`);actions.forEach(fn=>fn(t));orbits.setAttribute('transform',`rotate(${t*11})`);
    rings.forEach((n,i)=>{const q=(t*.3+i*.5)%1;n.setAttribute('transform',`scale(${.7+q*.65})`);n.setAttribute('opacity',(1-q)*.33*progress);});
    dust.forEach((n,i)=>{const a=t*(i%2?.4:-.28)+i*2.399,depth=Math.sin(a),r=58+(1-progress)*32+(i%4)*3;n.setAttribute('cx',Math.cos(a)*r);n.setAttribute('cy',Math.sin(a)*r*.66);n.setAttribute('opacity',(.3+.6*(depth+1)/2)*progress);});
  }};
}
