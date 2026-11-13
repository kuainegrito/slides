from pathlib import Path
import json,hashlib,subprocess
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v12';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files'];changed={p for p,m in before.items() if sha(S/p)!=m['sha256']}
expected={'ai/survival-202608/'+n for n in ['tokens.js','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']};assert changed==expected
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/tokens-preview-v12.webp'}
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));b=json.loads((S/rel).read_text(encoding='utf8'))
 for x,y in zip(a['slides'],b['slides']):
  if x['n']==21:x['thumb']=x['thumb'].replace('v11.webp','v12.webp')
  assert x==y
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[]
assert b['source']['camera']!=b['destination']['camera'] and b['destination']['progress']=='1.00000'
assert b['play']['running']==b['play']['orbit']=='true' and b['pause']['running']==b['pause']['orbit']=='false'
assert b['mobile']['width']==b['mobile']['scrollWidth']==390 and b['mobile']['dpr']<=1.26
assert int(b['mobile']['particleStride'])>=2 and b['teacher']['renderer']=='svg-canvas'
old=json.loads((W/'performance-before.json').read_text());newperf=json.loads((W/'performance-after.json').read_text())
assert int(newperf['nodes'])<int(old['nodes'])*.2
assert float(newperf['drawMs'])<float(old['drawMs'])*.3
assert float(newperf['interval'])<22 and float(b['mobileStable']['frameInterval'])<22
for p in changed:
 if p.endswith('.js'):subprocess.run(['node','--check',str(S/p)],check=True)
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
(W/'verification.json').write_text(json.dumps({'files':files,'browser':b,'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed)},ensure_ascii=False,indent=2),encoding='utf8');print('Title/playback checks passed')
