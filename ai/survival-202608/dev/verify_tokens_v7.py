import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v7';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/tokens-particles.js','ai/survival-202608/assets/tokens-preview-v7.webp'}
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));b=json.loads((S/rel).read_text(encoding='utf8'))
 for x,y in zip(a['slides'],b['slides']):
  if x['n']==21:x['thumb']=x['thumb'].replace('v6.webp','v7.webp')
  assert x==y
models={}
for test in ['test_tokens_particles.mjs','test_tokens_v6.mjs']:models[test]=json.loads(subprocess.run(['node',test],check=True,capture_output=True,text=True).stdout)
for rel in changed|new:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True)
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[] and b['scene']['grains']==5130 and b['scene']['ambient']==420 and b['scene']['ambientOpacity']<=.22
assert b['source']['progress']=='0.00000' and b['destination']['progress']=='1.00000' and b['source']['camera']!=b['destination']['camera']
assert b['teacher']['cloudParticles']=='5130' and b['teacher']['ambientParticles']=='420'
assert b['mobile']['width']==b['mobile']['scrollWidth']==390
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'models':models,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
