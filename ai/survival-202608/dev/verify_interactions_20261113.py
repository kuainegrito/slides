"""Verify the scoped P13/P21 release against its published baseline."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/descent-13';D=S/'ai/survival-202608'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text(encoding='utf8'))['files']
expected={'ai/survival-202608/'+n for n in ['deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','student/index.html','student/slides.json','teacher/index.html']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'}
expectednew={'ai/survival-202608/'+p for p in ['descent.js','descent-math.js','descent.css','tokens.js','tokens-math.js','tokens.css','assets/descent-kai-v1.woff2','assets/tokens-kai-v1.woff2','assets/interaction-sans-v1.woff2','assets/descent-preview-v1.webp','assets/tokens-preview-v1.webp']}
assert new==expectednew,(new,expectednew)
assert sha(S/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'
for folder in ['ai/survival-202608','ai/survival/student']:
 path=folder+'/slides.json';old=json.loads((W/'before/site'/path).read_text(encoding='utf8'));data=json.loads((S/path).read_text(encoding='utf8'))
 assert [s['n'] for s in data['slides']]==[i for i in range(1,64) if i!=32]
 for a,b in zip(old['slides'],data['slides']):
  if a['n'] not in [13,21]:assert a==b,a['n'];continue
  assert a['svg']==b['svg'] and a['originalLinks']==b['originalLinks']
  assert b['interactive']==('descent' if b['n']==13 else 'tokens') and b['textExcerpt'] is False
  assert b['thumb'].endswith(b['interactive']+'-preview-v1.webp')
  if folder.endswith('/student'):assert b['studentTaskEn'] and b['studentTask']
for rel in changed|new:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True,capture_output=True)
report=subprocess.run(['node','test_interactions_20261113.mjs'],cwd=R,capture_output=True,text=True,check=True)
model=json.loads(report.stdout)
# Every new Chinese caption and task has KaiTi glyph coverage; mathematical Latin additions use the original Sans Serif Collection.
union=set()
for name in ['bilingual-kai-v1','descent-kai-v1','tokens-kai-v1']:union.update(TTFont(D/'assets'/(name+'.woff2')).getBestCmap())
texts=''.join((D/p).read_text(encoding='utf8') for p in ['descent.js','tokens.js','tokens-math.js'])
data=json.loads((S/'ai/survival/student/slides.json').read_text(encoding='utf8'));texts+=''.join(s['text']+s['studentTask'] for s in data['slides'] if s['n'] in [13,21])
assert {ord(c) for c in texts if '\u3400'<=c<='\u9fff'}<=union
assert {0x394,0x2032}<=set(TTFont(D/'assets/interaction-sans-v1.woff2').getBestCmap())
browser=json.loads((W/'browser-evidence.json').read_text())
assert browser['errors']==[]
assert int(browser['autoplay']['count'])>0 and browser['autoplay']['running']=='true'
for name,value in [('normal',4.5),('overshoot',.72),('large',9.68)]:assert abs(float(browser[name]['loss'])-value)<1e-9
assert browser['exactMinimum']['loss']=='0' and browser['loop']=='0' and browser['pauseFrozen']
assert browser['resumed']['count']=='1' and browser['resumed']['loss']=='4.5'
assert browser['projectionC']=={'eight':'10.05','three':'0.77'}
assert browser['teacher13']=='4.500' and browser['teacher21']['words']==48 and browser['teacherProjection']=='10.05'
assert browser['drag']['before']!=browser['drag']['after'] and browser['tokenAutoplay']['before']!=browser['tokenAutoplay']['after']
assert browser['neighbor12'] and browser['neighbor15']=='20.7500' and browser['motionOff']=='false' and browser['respectedMotionOff']
assert browser['gradientOriginal'] and browser['original']
for n in [13,21]:assert browser['mobile'+str(n)]['documentWidth']==390
for name in ['p13-desktop.png','p13-mobile.png','p21-desktop.png','p21-mobile.png']:assert (W/name).exists()
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_pages':[13,21],'pages_per_edition':62,'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'new_bytes':sum(files[p]['bytes'] for p in new),'unchanged_source_images':True,'models':model,'browser':browser,'files':files}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in result.items() if k not in ['browser','files','models']},ensure_ascii=False))
