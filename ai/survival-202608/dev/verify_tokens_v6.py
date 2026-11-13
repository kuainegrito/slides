import hashlib,json,subprocess,sys,math
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v6';D=S/'ai/survival-202608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','tokens-math.js','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/'+n for n in ['tokens-preview-v6.webp']}
assert sha(S/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'
texts=''.join((D/n).read_text(encoding='utf8') for n in ['tokens.js','tokens-math.js'])
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 old=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));data=json.loads((S/rel).read_text(encoding='utf8'));assert len(data['slides'])==62
 for a,b in zip(old['slides'],data['slides']):
  if a['n']==21:
   assert a['svg']==b['svg'] and a['originalLinks']==b['originalLinks'];assert 'J’ai mangé mon avocat.' in b['text'];texts+=b['text']+b.get('studentTask','')
   for k in ['text','thumb','studentTask','studentTaskEn']:a.pop(k,None);b.pop(k,None)
  assert a==b
for p in changed:
 if p.endswith('.js'):subprocess.run(['node','--check',str(S/p)],check=True)
model=json.loads(subprocess.run(['node','test_tokens_v6.mjs'],capture_output=True,text=True,check=True).stdout)
kai=set(TTFont(D/'assets/tokens-kai-v5.woff2').getBestCmap())|set(TTFont(D/'assets/bilingual-kai-v1.woff2').getBestCmap());sans=set(TTFont(D/'assets/tokens-sans-v5.woff2').getBestCmap())
assert {ord(c) for c in texts if '\u3400'<=c<='\u9fff'}<=kai
assert set(map(ord,'dátil rendez-vous avocat mangé datte aguacate'))<=sans
assert set(TTFont(D/'assets/tokens-kai-v2.woff2').getBestCmap())<=kai
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[]
assert b['mobile']['width']==b['mobile']['scrollWidth']==390 and b['mobile']['cases']==6
assert b['intro']['intro']=='true' and b['intro']['camera']=='[0,0,0]'
assert b['afterIntro']['intro']=='false' and b['afterIntro']['route']=='0' and 8000<=float(b['afterIntro']['introElapsed'])<8500
assert b['reentry']['intro']==b['studentIntro']==b['legacyIntro']=='true'
assert b['loop']['intro']=='false' and b['loop']['route']=='0'
assert b['arrivalStart']['camera']==b['arrivalLater']['camera'] and b['arrivalStart']['yaw']==b['arrivalLater']['yaw'] and b['arrivalStart']['viewTime']==b['arrivalLater']['viewTime']
assert float(b['arrivalLater']['elapsed'])-float(b['arrivalStart']['elapsed'])>=2500
assert b['source']['camera']!=b['destination']['camera'] and b['destination']['camera']==b['manualRest']['camera']
assert b['destination']['progress']=='1.00000' and 5000<b['manualMs']<8500
scales=json.loads(b['destination']['clusterScales']);assert scales==[1,1,1.22,1.22,1,1,1,1,1]
assert b['endpointRings']==12
assert len(b['mobileEndpoints'])==2
for p in b['mobileEndpoints']:assert 0<=p['left']<p['right']<=p['width']
source=(D/'tokens.js').read_text();assert '<div class="tk-contexts"' not in source and 'h(context)' not in source
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'model':model,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
