from pathlib import Path
import json,hashlib,subprocess
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v11';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files'];changed={p for p,m in before.items() if sha(S/p)!=m['sha256']}
expected={'ai/survival-202608/'+n for n in ['tokens.js','tokens.css','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']};assert changed==expected
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/tokens-preview-v11.webp'}
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));b=json.loads((S/rel).read_text(encoding='utf8'))
 for x,y in zip(a['slides'],b['slides']):
  if x['n']==21:x['thumb']=x['thumb'].replace('v10.webp','v11.webp')
  assert x==y
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[] and 'A Galaxy of Tokens | 词元的语义星云' in b['studentTitle']
for name in ['desktop','mobile']:
 v=b[name];assert max(v['enTop'],v['zhTop'])<min(v['enBottom'],v['zhBottom']) and v['text']=='A Galaxy of Tokens | 词元的语义星云'
assert b['mobile']['width']==b['mobile']['scrollWidth']==390
assert b['play']['running']==b['play']['orbit']=='true' and b['pause']['running']==b['pause']['orbit']=='false'
for p in changed:
 if p.endswith('.js'):subprocess.run(['node','--check',str(S/p)],check=True)
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
(W/'verification.json').write_text(json.dumps({'files':files,'browser':b,'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed)},ensure_ascii=False,indent=2),encoding='utf8');print('Title/playback checks passed')
