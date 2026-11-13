"""Scope, asset integrity, font coverage and numerical/browser evidence checks."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
from PIL import Image
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parent;SITE=ROOT/'site';WORK=ROOT/'work/neural-12'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf8'))
before=read(WORK/'before/release-manifest.json')
modified=['ai/survival-202608/deck.js','ai/survival-202608/slides.json','ai/survival-202608/index.html','ai/survival/player.js','ai/survival/teacher/index.html','ai/survival/student/index.html','ai/survival/student/slides.json']
added=['ai/survival-202608/'+x for x in ['neural.js','neural.css','neural-model.js','neural-weights.js','assets/neural-sans-v1.woff2','assets/neural-kai-v1.woff2','assets/neural-preview-v1.webp']]
for rel,m in before['files'].items():
 if rel not in modified:assert sha(SITE/rel)==m['sha256'],'Unrelated change: '+rel
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 a=read(WORK/'before'/rel);b=read(SITE/rel)
 assert {k:v for k,v in a.items() if k!='slides'}=={k:v for k,v in b.items() if k!='slides'}
 assert len(a['slides'])==len(b['slides'])==62
 for x,y in zip(a['slides'],b['slides']):
  if x['n']!=12:assert x==y,f'Unrelated page: {rel} #{x["n"]}'
  else:
   assert x['svg']==y['svg'] and x['text']==y['text'],'Original art/text changed'
   assert y['interactive']=='neural';assert y['thumb'].endswith('neural-preview-v1.webp')
   assert set(k for k in set(x)|set(y) if x.get(k)!=y.get(k))<= {'interactive','thumb','studentTask'}
 assert 32 not in [s['n'] for s in b['slides']]
for rel in ['ai/survival-202608/index.html','ai/survival/teacher/index.html','ai/survival/student/index.html']:
 h=(SITE/rel).read_text(encoding='utf8');assert 'neural.css?v=20261111-nn1' in h
 assert '20261111-nn1' in h
for rel in ['ai/survival-202608/deck.js','ai/survival/player.js']:
 code=(SITE/rel).read_text(encoding='utf8');assert "slide.interactive==='neural'" in code;assert '.neural-lab,.nn-return' in code
subprocess.run(['node','--check',str(SITE/'ai/survival-202608/neural.js')],check=True)
subprocess.run(['node','--check',str(SITE/'ai/survival/player.js')],check=True)
result=subprocess.run(['node',str(ROOT/'test_neural.mjs')],capture_output=True,text=True,check=True)
numeric=json.loads(result.stdout);(WORK/'numerical-verification.json').write_text(json.dumps(numeric,indent=2),encoding='utf8')
cjk=lambda c:0x3000<=c<=0x9fff or 0xf900<=c<=0xfaff or 0xff00<=c<=0xffef
font=TTFont(SITE/'ai/survival-202608/assets/neural-kai-v1.woff2').getBestCmap()
corpus=''.join((SITE/'ai/survival-202608'/p).read_text(encoding='utf8') for p in ['neural.js','neural.css'])
assert {ord(c) for c in corpus if cjk(ord(c))}<=font.keys()
studentfont=TTFont(SITE/'ai/survival/student/assets/student-kai-v1.woff2').getBestCmap()
task=next(s for s in read(SITE/'ai/survival/student/slides.json')['slides'] if s['n']==12)['studentTask']
assert {ord(c) for c in task if cjk(ord(c))}<=(font.keys()|studentfont.keys())
with Image.open(SITE/'ai/survival-202608/assets/neural-preview-v1.webp') as im:assert im.size==(320,180);im.verify()
browser=read(WORK/'browser-verification.json')
assert browser['animationEnd']['phase']=='5' and browser['animationEnd']['running']=='false'
assert browser['noisy']['noise']=='70%' and '49.2%' in browser['noisy']['outcome']
assert browser['mobile']['width']==browser['mobile']['documentWidth']==390
assert browser['keyboard']=={'phase':'2','page':'PDF 12'}
assert browser['dispose']['neuralCount']==0 and not browser['console']
assert all(box['h']==box['sh'] and box['w']==box['sw'] for p in browser['phaseFit'] for box in p['boxes'])
files={rel:{'sha256':sha(SITE/rel),'bytes':(SITE/rel).stat().st_size} for rel in added+modified}
report={'modified_files':modified,'added_files':added,'protected_existing_files':len(before['files'])-len(modified),'changed_pdf_pages':[12],'original_art_preserved':True,'hidden_page_32_omitted':True,'numeric':numeric,'new_asset_bytes':sum(files[r]['bytes'] for r in added),'files':files}
(WORK/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k not in ['files','numeric','modified_files','added_files']}))
