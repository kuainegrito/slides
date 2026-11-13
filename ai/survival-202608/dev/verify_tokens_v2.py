import hashlib,json,re,subprocess,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v2';D=S/'ai/survival-202608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text(encoding='utf8'))['files']
expected={'ai/survival-202608/'+n for n in ['deck.js','index.html','slides.json','tokens.js','tokens-math.js','tokens.css']}|{'ai/survival/'+n for n in ['player.js','student/index.html','student/slides.json','teacher/index.html']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'}
expectednew={'ai/survival-202608/assets/'+n for n in ['tokens-kai-v2.woff2','tokens-sans-v2.woff2','tokens-preview-v2.webp']}
assert new==expectednew,(new,expectednew)
assert sha(S/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'
for folder in ['ai/survival-202608','ai/survival/student']:
 path=folder+'/slides.json';old=json.loads((W/'before/site'/path).read_text(encoding='utf8'));data=json.loads((S/path).read_text(encoding='utf8'))
 assert [s['n'] for s in data['slides']]==[i for i in range(1,64) if i!=32]
 for a,b in zip(old['slides'],data['slides']):
  if a['n']!=21:assert a==b,a['n'];continue
  assert a['svg']==b['svg'] and a['originalLinks']==b['originalLinks']
  assert b['interactive']=='tokens' and b['textExcerpt'] is False
  assert b['thumb'].endswith('tokens-preview-v2.webp')
  if folder.endswith('/student'):assert b['studentTaskEn'] and b['studentTask']
for rel in changed:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True,capture_output=True)
model=json.loads(subprocess.run(['node','test_tokens_v2.mjs'],cwd=R,capture_output=True,text=True,check=True).stdout)
regression=json.loads(subprocess.run(['node','test_interactions_20261113.mjs'],cwd=R,capture_output=True,text=True,check=True).stdout)
texts=''.join((D/p).read_text(encoding='utf-8-sig') for p in ['tokens.js','tokens-math.js','tokens.css'])
s=next(s for s in json.loads((S/'ai/survival/student/slides.json').read_text(encoding='utf8'))['slides'] if s['n']==21);texts+=s['text']+s['studentTask']
kai=set(TTFont(D/'assets/tokens-kai-v2.woff2').getBestCmap());sans=set(TTFont(D/'assets/tokens-sans-v2.woff2').getBestCmap())
assert {ord(c) for c in texts if '\u3400'<=c<='\u9fff'}<=kai
assert set(map(ord,'lumière léger dépenser ratón Français Español'))<=sans
assert set(TTFont(D/'assets/tokens-kai-v1.woff2').getBestCmap())<=kai
browser=json.loads((W/'browser-evidence.json').read_text())
assert browser['errors']==[] and browser['noSidebar'] and browser['pauseFrozen'] and browser['original']
assert browser['contextA']['progress']=='0.00000' and browser['contextB']['progress']=='1.00000' and browser['contextA']['vector']!=browser['contextB']['vector']
assert browser['manualFinal']['progress']=='1.00000'
assert int(browser['mouse']['labels'])>=40
assert all(w in browser['mouse']['words'].split('|') for w in ['cat','dog','cheese','keyboard','screen','FR · souris','ES · ratón'])
assert all(w in browser['flower']['words'].split('|') for w in ['petal','garden','seed','FR · fleur','ES · flor','FR · dépenser','ES · gastar'])
assert [int(t['route']) for t in browser['tour']]==[1,2,3,0]
for i,t in enumerate(browser['tour'],1):assert abs(float(t['elapsed'])-i*8000)<350
assert browser['mobile']['documentWidth']==browser['mobile']['width']==390
assert browser['fonts']['footerInside'] and browser['fonts']['enColor']=='rgb(63, 63, 70)' and browser['fonts']['zhColor']=='rgb(112, 48, 160)'
assert browser['orbit']['before']!=browser['orbit']['after'] and browser['keyboard']=='0.22000'
assert browser['globalPause']==browser['respectsGlobalPause']=='false'
assert int(browser['teacher']['labels'])>=40 and int(browser['legacy']['labels'])>=40
assert browser['p12']==browser['p13']==browser['p15']==1
for n in ['p21-desktop.png','p21-stage.png','p21-mobile.png','p21-mobile-controls.png']:assert (W/n).exists()
for path in ['ai/survival/student/index.html','ai/survival/teacher/index.html','ai/survival-202608/index.html']:
 txt=(S/path).read_text(encoding='utf8');assert 'tokens.css?v=20261113-tk2' in txt and 'descent.css?v=20261113-gd5' in txt
assert "import('/slides/ai/survival-202608/tokens.js?v=20261113-tk2')" in (S/'ai/survival/player.js').read_text(encoding='utf8')
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_pages':[21],'pages_per_edition':62,'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'new_bytes':sum(files[p]['bytes'] for p in new),'unchanged_source_images':True,'models':model,'previous_models':regression,'browser':browser,'files':files}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in result.items() if k not in ['browser','files','models','previous_models']},ensure_ascii=False))
