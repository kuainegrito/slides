import hashlib,json,subprocess,sys,math
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v5';D=S/'ai/survival-202608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','tokens-math.js','tokens.css','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/'+n for n in ['tokens-preview-v5.webp','tokens-kai-v5.woff2','tokens-sans-v5.woff2']}
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
model=json.loads(subprocess.run(['node','test_tokens_v5.mjs'],capture_output=True,text=True,check=True).stdout)
kai=set(TTFont(D/'assets/tokens-kai-v5.woff2').getBestCmap());sans=set(TTFont(D/'assets/tokens-sans-v5.woff2').getBestCmap())
assert {ord(c) for c in texts if '\u3400'<=c<='\u9fff'}<=kai
assert set(map(ord,'dátil rendez-vous avocat mangé datte aguacate'))<=sans
assert set(TTFont(D/'assets/tokens-kai-v2.woff2').getBestCmap())<=kai
b=json.loads((W/'browser-evidence.json').read_text());assert b['errors']==[]
assert b['layout']['sentences']==0 and b['layout']['scene']>=369 and b['layout']['footerBottom']<=b['layout']['frameBottom']
assert b['mobile']['width']==b['mobile']['scrollWidth']==390 and b['mobile']['cases']==6
assert 'date' in b['legacy'] and 'avocat' in b['legacy']
for key,pair in [('dateA',[6,7]),('dateB',[6,7]),('avocatA',[7,8]),('avocatB',[7,8])]:
 state=b[key];w=json.loads(state['focusWeights']);assert len(w)==9
 for i,v in enumerate(w):assert abs(v-(1 if i in pair else .23))<1e-8
 v=json.loads(state['vector']);goal=[.55*(math.cos(.15)*v[0]+math.sin(.15)*v[6]),.55*(math.cos(.15)*v[1]+math.sin(.15)*v[7]),.55*v[2]]
 assert max(abs(x-y) for x,y in zip(goal,json.loads(state['camera'])))<1e-8
assert b['dateA']['camera']!=b['dateB']['camera'] and b['avocatA']['camera']!=b['avocatB']['camera']
assert b['avocatA']['camera']==b['avocatReturn']['camera']
assert [x['route'] for x in b['tour']]==['5','0']
assert b['paused']['camera']==b['pausedAfter']['camera'] and b['paused']['running']==b['paused']['orbit']=='false'
source=(D/'tokens.js').read_text();assert '<div class="tk-contexts"' not in source and 'h(context)' not in source
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'model':model,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
