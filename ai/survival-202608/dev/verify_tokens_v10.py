import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v10';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','tokens.css','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/tokens-languages.js'}|{'ai/survival-202608/assets/'+n for n in ['tokens-preview-v10.webp','tokens-kai-v10.woff2','tokens-sans-v10.woff2']}
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));b=json.loads((S/rel).read_text(encoding='utf8'))
 for x,y in zip(a['slides'],b['slides']):
  if x['n']==21:
   assert x['svg']==y['svg'] and x['originalLinks']==y['originalLinks']
   for key in ['thumb','text','studentTask','studentTaskEn']:x.pop(key,None);y.pop(key,None)
  assert x==y
models={}
for test in ['test_tokens_languages.mjs','test_tokens_v9.mjs']:models[test]=json.loads(subprocess.run(['node',test],check=True,capture_output=True,text=True).stdout)
for rel in changed|new:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True)
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[]
expectedBadges=['(中Zh)','(英En)','(英En)','(中Zh)','(法Fr)','(英En)','(西Es)','(乌Ur)']
assert b['badges']==b['teacherBadges']==b['mobile']['badges']==expectedBadges
assert b['mobile']['width']==b['mobile']['scrollWidth']==390
assert b['layout']['footerInside'] and all(x['scroll']<=x['height']+1 for x in b['layout']['cards'])
assert len(b['foreign'])>=40
import re
assert all(re.search(r' \([\u4e00-\u9fff][A-Z][a-z]\)$',s) for s in b['foreign'])
sys_path='F:/codex_worktrees/cache/font-python'
import sys
sys.path.insert(0,sys_path)
from fontTools.ttLib import TTFont
D=S/'ai/survival-202608';src=(D/'tokens-math.js').read_text(encoding='utf8');needed={ord(c) for c in src if '\u0600'<=c<='\u06ff'}
text=(D/'tokens-languages.js').read_text(encoding='utf8')+(D/'tokens.js').read_text(encoding='utf8')
kai=set(TTFont(D/'assets/tokens-kai-v10.woff2').getBestCmap());sans=set(TTFont(D/'assets/tokens-sans-v10.woff2').getBestCmap())
assert {ord(c) for c in text if '\u3400'<=c<='\u9fff'}<=kai
assert set(map(ord,'maçã água amanhã santé saúde'))<=sans
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'models':models,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
