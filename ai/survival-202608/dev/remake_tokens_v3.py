from pathlib import Path
p=Path('site/ai/survival-202608/tokens.js');s=p.read_text();s=s.replace('<canvas tabindex="0"','<svg class="tk-galaxy" tabindex="0"').replace('</canvas>','</svg>').replace(' <b>h(context)</b>','').replace("canvas=$('canvas'),ctx=canvas.getContext('2d')","canvas=$('.tk-galaxy')")
s=s.replace('orbit=false,raf=0','orbit=false,cosmicTime=0,raf=0')
a=s.index(' function glow(');b=s.index(' function tick(',a)
renderer=r'''
 const NS='http://www.w3.org/2000/svg';
 const make=(tag,attrs={},parent=canvas)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;};
 const defs=make('defs');
 CLUSTERS.forEach((c,k)=>{const g=make('radialGradient',{id:'tk-cloud-'+k},defs);[[0,c.color,.5],[.35,c.color,.22],[1,c.color,0]].forEach(([offset,color,opacity])=>make('stop',{offset,'stop-color':color,'stop-opacity':opacity},g));});
 const glowGradient=make('radialGradient',{id:'tk-star'},defs);[[0,'#fffef1',1],[.12,'#fff9d8',1],[.35,'#dba45b',.6],[1,'#dba45b',0]].forEach(([offset,color,opacity])=>make('stop',{offset,'stop-color':color,'stop-opacity':opacity},glowGradient));
 const hazeGroup=make('g'),armGroup=make('g',{fill:'none'}),dustGroup=make('g'),bridgeGroup=make('g',{fill:'none'}),wordGroup=make('g'),sparkGroup=make('g');
 const haze=CLUSTERS.flatMap((c,k)=>Array.from({length:7},(_,j)=>({k,j,e:make('ellipse',{fill:'url(#tk-cloud-'+k+')'},hazeGroup)})));
 const arms=Array.from({length:32},(_,i)=>make('path',{stroke:CLUSTERS[i%6].color,'stroke-width':i%4===0?1.1:.5,opacity:i%4===0?.28:.13},armGroup));
 const stars=Array.from({length:1800},(_,i)=>{const r=.15+Math.sqrt((i*.61803398875)%1)*5.1,t=i*2.399963+(i%4)*Math.PI/2,z=Math.sin(i*71.1)*.32;return {v:[r*Math.cos(t+r*.85),Math.sin(t+r*.85)*r*.42,z+Math.sin(t)*r*.22],phase:i*.83,e:make('circle',{fill:i%7===0?'#ffffff':CLUSTERS[i%6].color},dustGroup)};});
 const cloudDust=DUST.map((p,i)=>({p,i,e:make('circle',{fill:CLUSTERS[p.cluster].color},dustGroup)}));
 const bridges=CASES.map((c,i)=>({e:make('path',{stroke:CLUSTERS[i+1].color,'stroke-linecap':'round'},bridgeGroup),glow:make('path',{stroke:'#d4ae71','stroke-width':7,opacity:.12},bridgeGroup),sparks:Array.from({length:6},()=>make('circle',{fill:'url(#tk-star)'},sparkGroup))}));
 let wordElements=[];
 function buildWords(){wordGroup.replaceChildren();wordElements=[];const c=CASES[route];
  const add=(en,zh,vector,major=false,phase=0)=>{const g=make('g',{},wordGroup),e=make('text',{'text-anchor':'middle','paint-order':'stroke',stroke:'#eef5fc','stroke-width':major?3:1.7,'stroke-opacity':major?.9:.45,'stroke-linejoin':'round'},g);const a=make('tspan',{fill:INK,'font-family':'TokensSans','font-size':major?18:10},e);a.textContent=en; if(zh){const b=make('tspan',{fill:PURPLE,'font-family':'TokensKai',dx:5,'font-size':major?20:12},e);b.textContent=zh;}wordElements.push({g,vector,major,phase,en});};
  CLUSTERS.forEach((cl,k)=>{const id=[4,10,20,route===2?26:29,32,44][k],n=NODES[id];add(n.en,n.zh,n.vector,true,k);const words=k===3&&route===2?[['spring','春天'],['leaf','叶片'],['seed','种子'],['bloom','开花'],['garden','花园'],['petal','花瓣']]:NEIGHBORS[k];words.forEach(([en,zh],j)=>{const t=j*2.39996,rad=.65+(j%3)*.3,v=cl.center.map((v,d)=>v+(d===0?Math.cos(t)*rad:d===1?Math.sin(t)*rad:d===2?Math.sin(t*2)*.9:Math.sin(j+d)*.15));add(en,zh,v,false,j+k);});});
  [c.a,c.b].forEach((id,i)=>{const n=NODES[id],t=c.contexts[i];if(!wordElements.some(w=>w.en===n.en&&w.vector===n.vector))add(n.en,n.zh,n.vector,true,i);for(const [j,str] of ['FR · '+t.fr,'ES · '+t.es].entries()){const v=n.vector.map((v,d)=>v+(d===0?(j?-.7:.7):d===1?-.6:d===2?j*.5:0));add(str,'',v,false,3+i+j);}});
 }
 const curve=(c,t)=>{const a=project(NODES[c.a].vector,angle),b=project(NODES[c.b].vector,angle),bend=Math.sin(t*Math.PI);return a.map((v,d)=>v+(b[d]-v)*t+bend*(d===0?.3:d===1?1.8:2.8));};
 const path=points=>points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ');
 let lastRoute=-1;
 function draw(){if(disposed||!W||!H)return;if(lastRoute!==route){buildWords();lastRoute=route;}const c=CASES[route],v=contextVector(route,progress),phase=cosmicTime*.00022;
  haze.forEach(({k,j,e})=>{const v=CLUSTERS[k].center.map((x,d)=>x+(j?Math.sin(j*7+d*2+phase*.3)*.6:0)),p=at(v),r=(j?60:110)*p.scale; e.setAttribute('cx',p.x);e.setAttribute('cy',p.y);e.setAttribute('rx',r*(W/918));e.setAttribute('ry',r*.65);});
  arms.forEach((e,i)=>{const points=Array.from({length:70},(_,j)=>{const t=j/69*5.5+.12,r=t*.86,a=t*1.1+(i%4)*Math.PI/2+Math.floor(i/4)*.025+phase*.11;return world([Math.cos(a)*r,Math.sin(a)*r*.42,Math.sin(a)*r*.22+Math.sin(i)*.12]);});e.setAttribute('d',path(points));});
  stars.forEach(({v,e,phase:p},i)=>{const t=phase*.12,co=Math.cos(t),si=Math.sin(t),q=world([v[0]*co-v[1]*si,v[0]*si*.35+v[1]*co,v[2]+Math.sin(phase+p)*.06]);e.setAttribute('cx',q.x);e.setAttribute('cy',q.y);e.setAttribute('r',clamp((i%9===0?1.4:.55)*q.scale,.3,2.8));e.setAttribute('opacity',clamp(.3+q.z*.055+Math.sin(phase*2+p)*.18,.08,.85));});
  cloudDust.forEach(({p,i,e})=>{const co=CLUSTERS[p.cluster].center,dx=p.vector[0]-co[0],dy=p.vector[1]-co[1],t=phase*.25;const v=p.vector.slice();v[0]=co[0]+dx*Math.cos(t)-dy*Math.sin(t);v[1]=co[1]+dx*Math.sin(t)+dy*Math.cos(t);const q=at(v);e.setAttribute('cx',q.x);e.setAttribute('cy',q.y);e.setAttribute('r',clamp(p.size*q.scale*.8,.3,2.5));e.setAttribute('opacity',clamp(.45+q.z*.05+Math.sin(phase+p.phase)*.15,.12,.85));});
  bridges.forEach((b,i)=>{const d=path(Array.from({length:61},(_,j)=>world(curve(CASES[i],j/60))));b.e.setAttribute('d',d);b.e.setAttribute('stroke-width',i===route?1.7:.7);b.e.setAttribute('opacity',i===route?.8:.22);b.glow.setAttribute('d',d);b.glow.setAttribute('opacity',i===route?.16:.025);b.sparks.forEach((e,j)=>{const t=(i===route?progress:phase*.08+i*.2)+j*.025,p=world(curve(CASES[i],((t%1)+1)%1));e.setAttribute('cx',p.x);e.setAttribute('cy',p.y);e.setAttribute('r',(j===0?15:9-j)*p.scale);e.setAttribute('opacity',i===route?(1-j*.12):.22);});});
  const words=wordElements.map(w=>{const v=w.vector.map((x,d)=>x+(w.major?0:Math.sin(phase*.5+w.phase+d)*.11));return {...w,p:at(v)};}).sort((a,b)=>a.p.z-b.p.z);
  words.forEach(({g,p,major})=>{g.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) scale(${clamp(p.scale,.6,1.5).toFixed(3)})`);g.setAttribute('opacity',major?.95:clamp(.48+p.z*.065,.18,.8));wordGroup.append(g);});
  root.querySelectorAll('[data-context]').forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===(progress<.5?0:1)));button.style.setProperty('--strength',i?progress:1-progress);});
  const local=elapsed%TOUR_MS;$('.tk-countdown').textContent=running?Math.ceil((TOUR_MS-local)/1000)+'s':'Ⅱ';root.querySelectorAll('[data-route] i').forEach((bar,i)=>bar.style.width=(i===route?local/TOUR_MS*100:0)+'%');
  Object.assign(root.dataset,{route:String(route),progress:progress.toFixed(5),elapsed:elapsed.toFixed(1),vector:JSON.stringify(v),projection:angle.toFixed(5),yaw:yaw.toFixed(5),zoom:String(zoom),labels:String(wordElements.length),renderer:'svg',orbit:String(orbit),cosmicTime:String(cosmicTime)});
 }
'''
s=s[:a]+renderer+s[b:];s=s.replace('if(orbit)yaw+=Math.min(dt,70)*.000035;','if(orbit){yaw+=Math.min(dt,70)*.00006;cosmicTime+=Math.min(dt,70);}')
s=s.replace('canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);',"canvas.setAttribute('viewBox',`0 0 ${W} ${H}`);")
s=s.replace('function chooseRoute(i){pause(true);','function chooseRoute(i){pause();').replace('explain();running=!reduced();buttons();','explain();running=!reduced();orbit=!reduced();buttons();')
p.write_text(s,encoding='utf8')
p=Path('site/ai/survival-202608/tokens.css');s=p.read_text(encoding='utf-8-sig').replace('.tk-space canvas','.tk-space svg');s+='\n.tk-galaxy{isolation:isolate}.tk-galaxy text{pointer-events:none;user-select:none}.tk-focus{opacity:.7}\n';p.write_text(s,encoding='utf8')
for file in ['site/ai/survival-202608/deck.js','site/ai/survival-202608/index.html','build_editions.py']:
 p=Path(file);s=p.read_text(encoding='utf8').replace('20261113-tk2','20261113-tk3');p.write_text(s,encoding='utf8')
