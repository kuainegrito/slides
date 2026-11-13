import json,hashlib,shutil
from pathlib import Path
R=Path('.');B=R/'work/tokens-v4/before';B.mkdir(parents=True,exist_ok=False);shutil.copy2('work/release-manifest.json',B/'release-manifest.json');m=json.loads((B/'release-manifest.json').read_text())
for rel,v in m['files'].items():
 p=R/'site'/rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==v['sha256']
 if p.suffix in ['.js','.css','.json','.html']:
  q=B/'site'/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
p=Path('site/ai/survival-202608/tokens.js');s=p.read_text();s=s.replace('A Universe of Tokens','A Galaxy of Tokens');s=s.replace('cosmicTime=0,raf=0','cosmicTime=0,flowTime=0,raf=0');s=s.replace("root.dataset.running=String(running);","root.dataset.running=String(running);root.dataset.orbit=String(orbit);")
s=s.replace('rotate(v,yaw,pitch+Math.sin(cosmicTime*.00013)*.16),perspective=20/(20-z)','rotate([v[0],v[1],v[2]*1.45],yaw,pitch+Math.sin(cosmicTime*.00018)*.28),perspective=12/(12-z)');s=s.replace('W/10.5:W/10.2','W/12.5:W/12.1').replace('H/9.8','H/10.8');s=s.replace('[[0,c.color,.5],[.35,c.color,.22]','[[0,c.color,.72],[.35,c.color,.34]');s=s.replace('length:7},(_,j)','length:10},(_,j)').replace('length:1800','length:3600').replace('Math.sin(i*71.1)*.14','Math.sin(i*71.1)*.23').replace('z=Math.sin(i*71.1)*.32','z=Math.sin(i*71.1)*.65');s=s.replace('phase:i*.83','phase:i*.83');s=s.replace("'stroke-width':7,opacity:.12","'stroke-width':19,opacity:.12");s=s.replace("sparks:Array.from({length:6}","ribbon:make('path',{stroke:'#f6dfa5','stroke-width':6,'stroke-linecap':'round',pathLength:100},bridgeGroup),flow:make('path',{stroke:'#fffef3','stroke-width':2.8,'stroke-linecap':'round',pathLength:100,'stroke-dasharray':'2 5'},bridgeGroup),halos:[0,1].map(()=>make('circle',{fill:'url(#tk-star)'},sparkGroup)),sparks:Array.from({length:14}")
s=s.replace('(j?60:110)','(j?72:125)').replace('r*.65','r*.8');s=s.replace("clamp(.3+q.z*.055+Math.sin(phase*2+p)*.18,.08,.85)","clamp(.42+q.z*.085+Math.sin(phase*2+p)*.15,.08,.95)");s=s.replace('p.size*q.scale*.8,.3,2.5','p.size*q.scale,.3,3.5');s=s.replace("i===route?1.7:.7","i===route?2.8:.6").replace("i===route?.16:.025","i===route?.32:.025")
marker="b.sparks.forEach((e,j)=>"
insert="""b.ribbon.setAttribute('d',d);b.ribbon.setAttribute('opacity',i===route?.65:0);b.ribbon.setAttribute('stroke-dasharray',`${Math.max(1,progress*100)} 100`);b.flow.setAttribute('d',d);b.flow.setAttribute('opacity',i===route?.95:0);b.flow.setAttribute('stroke-dashoffset',(-flowTime*.018).toFixed(2));b.halos.forEach((e,j)=>{const p=world(curve(CASES[i],j));e.setAttribute('cx',p.x);e.setAttribute('cy',p.y);e.setAttribute('r',(26+12*(j?progress:1-progress))*p.scale);e.setAttribute('opacity',i===route?(j?.2+.8*progress:1-.7*progress):0);});"""
s=s.replace(marker,insert+marker).replace("(j===0?15:9-j)*p.scale","(j===0?23:Math.max(4,14-j*.65))*p.scale").replace('(1-j*.12)','(1-j*.06)');s=s.replace('clamp(p.scale,.6,1.5)','clamp(p.scale,.5,1.85)').replace('major?.95:clamp(.48+p.z*.065,.18,.8)','major?clamp(.8+p.z*.045,.45,1):clamp(.5+p.z*.08,.12,.9)');s=s.replace('cosmicTime:String(cosmicTime)','cosmicTime:String(cosmicTime),flowTime:String(flowTime)')
s=s.replace('const dt=last?now-last:0;last=now;','const dt=last?now-last:0;if(last&&dt<32){raf=requestAnimationFrame(tick);return;}last=now;if(running||orbit||contextTween)flowTime+=dt;');s=s.replace('*.00006','*.00014');s=s.replace('cancelAnimationFrame(raf);});','cancelAnimationFrame(raf);draw();});')
p.write_text(s,encoding='utf8')
for file in ['site/ai/survival-202608/deck.js','site/ai/survival-202608/index.html','build_editions.py']:
 p=Path(file);p.write_text(p.read_text(encoding='utf8').replace('20261113-tk3','20261113-tk4'),encoding='utf8')
for file in ['refine_interactive_20261113.py','bilingual_metadata.py']:
 p=Path(file);s=p.read_text(encoding='utf8').replace('A Universe of Tokens','A Galaxy of Tokens').replace('A universe of tokens','A Galaxy of Tokens').replace('-preview-v3.webp','-preview-v4.webp');p.write_text(s,encoding='utf8')
for file in ['site/ai/survival-202608/slides.json','site/ai/survival/student/slides.json']:
 p=Path(file);d=json.loads(p.read_text(encoding='utf8'));s=next(s for s in d['slides'] if s['n']==21)
 for k in ['title','titleEn','text']:s[k]=s[k].replace('A universe of tokens','A Galaxy of Tokens').replace('A Universe of Tokens','A Galaxy of Tokens')
 s['thumb']=s['thumb'].replace('-v3.webp','-v4.webp');p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf8')
