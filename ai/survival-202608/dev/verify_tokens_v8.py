import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v8';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','tokens-math.js','tokens.css','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/'+n for n in ['tokens-preview-v8.webp','tokens-kai-v8.woff2','tokens-sans-v8.woff2','tokens-urdu-v8.woff2','tokens-urdu-OFL.txt']}
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));b=json.loads((S/rel).read_text(encoding='utf8'))
 for x,y in zip(a['slides'],b['slides']):
  if x['n']==21:
   assert x['svg']==y['svg'] and x['originalLinks']==y['originalLinks']
   for key in ['thumb','text','studentTask','studentTaskEn']:x.pop(key,None);y.pop(key,None)
  assert x==y
models={}
for test in ['test_tokens_particles_v8.mjs','test_tokens_v8.mjs']:models[test]=json.loads(subprocess.run(['node',test],check=True,capture_output=True,text=True).stdout)
for rel in changed|new:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True)
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[]
assert 12000<=float(b['afterIntro']['introElapsed'])<13000 and b['afterIntro']['route']=='0'
assert b['source']['route']=='6' and b['destination']['progress']=='1.00000' and b['source']['camera']!=b['destination']['camera']
assert b['teacher']['cloudParticles']=='6270' and b['teacher']['ambientParticles']=='420'
assert b['mobile']['width']==b['mobile']['scrollWidth']==390 and b['mobile']['cases']==7
assert len(b['urdu'])==8 and all(x['direction']=='rtl' and x['font']=='TokensUrdu' and x['width']>0 for x in b['urdu'])
sys_path='F:/codex_worktrees/cache/font-python'
import sys
sys.path.insert(0,sys_path)
from fontTools.ttLib import TTFont
D=S/'ai/survival-202608';src=(D/'tokens-math.js').read_text(encoding='utf8');needed={ord(c) for c in src if '\u0600'<=c<='\u06ff'}
font=TTFont(D/'assets/tokens-urdu-v8.woff2');assert needed<=set(font.getBestCmap()) and 'GSUB' in font
assert b'SIL OPEN FONT LICENSE' in (D/'assets/tokens-urdu-OFL.txt').read_bytes()
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'models':models,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
