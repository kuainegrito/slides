from pathlib import Path
import json,hashlib,shutil
B=Path('work/tokens-v6/before');B.mkdir(parents=True,exist_ok=False);shutil.copy2('work/release-manifest.json',B/'release-manifest.json')
for rel,m in json.loads((B/'release-manifest.json').read_text())['files'].items():
 p=Path('site')/rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==m['sha256']
 if p.suffix in ['.js','.css','.json','.html']:
  q=B/'site'/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
p=Path('site/ai/survival-202608/tokens-math.js');s=p.read_text();start=s.index('export const TOUR_MS=');end=s.index('export function contextVector',start)
s=s[:start]+'''export const SOURCE_HOLD_MS=3000,TRAVEL_MS=6000,DESTINATION_HOLD_MS=5000;
export const TOUR_MS=SOURCE_HOLD_MS+TRAVEL_MS+DESTINATION_HOLD_MS;
export const smoother=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
export function tourState(elapsed){const time=Math.max(0,elapsed),local=time%TOUR_MS,t=(local-SOURCE_HOLD_MS)/TRAVEL_MS;return {route:Math.floor(time/TOUR_MS)%CASES.length,local,progress:smoother(t),phase:t<=0?'source':t>=1?'arrival':'travel'};}
'''+s[end:];p.write_text(s,encoding='utf8')
p=Path('site/ai/survival-202608/tokens.js');s=p.read_text();s=s.replace('TOUR_MS,tourState','TOUR_MS,SOURCE_HOLD_MS,TRAVEL_MS,smoother,tourState').replace('tokens-math.js?v=20261113-tk5','tokens-math.js?v=20261113-tk6');s=s.replace('cosmicTime=0,flowTime=0','cosmicTime=0,viewTime=0,flowTime=0').replace('Pause · 8s','Pause · 14s').replace('Play · 8s','Play · 14s');s=s.replace('/1300','/2000').replace('+1300','+2000').replace('e=t*t*(3-2*t)','e=smoother(t)');s=s.replace('Math.sin(cosmicTime*.00018)','Math.sin(viewTime*.00018)')
s=s.replace('const at=v=>world(project(v,angle));', '''const clusterScale=k=>1+.22*clamp((focusWeights[k]-.23)/.77,0,1);
 const expanded=(v,k)=>k===undefined?v:v.map((x,d)=>CLUSTERS[k].center[d]+(x-CLUSTERS[k].center[d])*clusterScale(k));
 const at=(v,k)=>world(project(expanded(v,k),angle));''')
s=s.replace("const hazeGroup=make('g'),armGroup=make('g',{fill:'none'}),dustGroup=make('g'),bridgeGroup=make('g',{fill:'none'}),wordGroup=make('g'),sparkGroup=make('g');", "const hazeGroup=make('g'),armGroup=make('g',{fill:'none'}),dustGroup=make('g'),bridgeGroup=make('g',{fill:'none'}),sparkGroup=make('g'),wordGroup=make('g');")
s=s.replace("halos:[0,1].map", "rings:[0,1].map(()=>make('circle',{fill:'none',stroke:'#fff3c2','stroke-width':2.2},sparkGroup)),halos:[0,1].map")
s=s.replace('project(NODES[c.a].vector,angle),b=project(NODES[c.b].vector,angle)','project(expanded(NODES[c.a].vector,NODES[c.a].cluster),angle),b=project(expanded(NODES[c.b].vector,NODES[c.b].cluster),angle)')
s=s.replace('p=at(v),r=(j?72:125)*p.scale','p=at(v,k),r=(j?72:125)*p.scale*clusterScale(k)').replace('const q=at(v);','const q=at(v,p.cluster);').replace('p.size*q.scale,.3,3.5','p.size*q.scale*clusterScale(p.cluster),.3,4.2')
s=s.replace("b.halos.forEach((e,j)=>", "b.rings.forEach((e,j)=>{const p=world(curve(CASES[i],j));e.setAttribute('cx',p.x);e.setAttribute('cy',p.y);e.setAttribute('r',11*p.scale);e.setAttribute('opacity',i===route?(j?.55+.45*progress:1-.35*progress):0);});b.halos.forEach((e,j)=>")
s=s.replace('(26+12*(j?progress:1-progress))','(34+18*(j?progress:1-progress))').replace('p:at(v)}','p:at(v,w.cluster)}').replace('clamp(p.scale,.5,1.85)','clamp(p.scale*clusterScale(cluster),.5,2.15)')
s=s.replace('camera:JSON.stringify(camera),focusWeights:JSON.stringify(focusWeights)','camera:JSON.stringify(camera),focusWeights:JSON.stringify(focusWeights),clusterScales:JSON.stringify(CLUSTERS.map((_,k)=>clusterScale(k))),viewTime:String(viewTime),tourPhase:progress===0?\'source\':progress===1?\'arrival\':\'travel\'')
s=s.replace('if(orbit){yaw+=Math.min(dt,70)*.000075;cosmicTime+=Math.min(dt,70);}', 'if(orbit){cosmicTime+=Math.min(dt,70);if(!running||(progress>0&&progress<1)){yaw+=Math.min(dt,70)*.000035;viewTime+=Math.min(dt,70);}}')
s=s.replace('/1400','/TRAVEL_MS').replace('function chooseContext(i){pause();elapsed=route*TOUR_MS+(i?6000:0);','function chooseContext(i){pause(true);elapsed=route*TOUR_MS+(i?SOURCE_HOLD_MS+TRAVEL_MS:0);')
# Calculate focus weights before the camera goal so displayed endpoints and camera agree during the case transition.
a=s.index(' function updateCamera(');b=s.index(' function world(',a)
s=s[:a]+''' function updateCamera(now){const c=CASES[route],t=cameraTween?clamp((now-cameraTween.start)/2000,0,1):1,e=smoother(t);focusWeights=CLUSTERS.map((_,k)=>{const target=[NODES[c.a].cluster,NODES[c.b].cluster].includes(k)?1:.23;return cameraTween?cameraTween.weights[k]+(target-cameraTween.weights[k])*e:target;});const goal=curve(c,progress).map(v=>v*.55);camera=goal.map((v,i)=>cameraTween?cameraTween.from[i]+(v-cameraTween.from[i])*e:v);if(t===1)cameraTween=null;}
'''+s[b:];p.write_text(s,encoding='utf8')
for fn in ['site/ai/survival-202608/deck.js','site/ai/survival-202608/index.html','build_editions.py']:
 p=Path(fn);p.write_text(p.read_text(encoding='utf8').replace('20261113-tk5','20261113-tk6'),encoding='utf8')
