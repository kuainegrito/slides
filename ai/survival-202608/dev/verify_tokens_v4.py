import hashlib,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/tokens-v4'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text())['files']
expected={'ai/survival-202608/'+n for n in ['tokens.js','deck.js','index.html','slides.json']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,m in before.items() if sha(S/p)!=m['sha256']};assert changed==expected,(changed,expected)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'};assert new=={'ai/survival-202608/assets/tokens-preview-v4.webp'}
assert sha(S/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'
for rel in ['ai/survival-202608/slides.json','ai/survival/student/slides.json']:
 old=json.loads((W/'before/site'/rel).read_text(encoding='utf8'));data=json.loads((S/rel).read_text(encoding='utf8'))
 for a,b in zip(old['slides'],data['slides']):
  if a['n']==21:
   a['thumb']=a['thumb'].replace('v3.webp','v4.webp')
   for key in ['title','titleEn','text']:a[key]=a[key].replace('A Universe of Tokens','A Galaxy of Tokens').replace('A universe of tokens','A Galaxy of Tokens')
  assert a==b
for p in changed:
 if p.endswith('.js'):subprocess.run(['node','--check',str(S/p)],check=True)
model=json.loads(subprocess.run(['node','test_tokens_v2.mjs'],capture_output=True,text=True,check=True).stdout)
b=json.loads((W/'browser-evidence.json').read_text())
assert b['errors']==[] and b['first']['renderer']=='svg'
assert b['first']['yaw']!=b['second']['yaw'] and float(b['second']['cosmicTime'])>float(b['first']['cosmicTime'])
assert b['teacher']['orbit']=='true' and 'A Galaxy of Tokens' in b['legacyTitle']
assert b['manual']['progress']=='1.00000' and b['original']
assert b['globalPause']['orbit']==b['globalPause']['running']=='false'
assert b['mobile']['width']==b['mobile']['scrollWidth']==390
assert b['optics']['stars']==4804 and b['optics']['blur']==1
assert b['optics']['title'].startswith('A Galaxy of Tokens')
assert b['autoplay']['route']=='1' and float(b['autoplay']['elapsed'])>=8000
assert b['flowAfter']!=b['optics']['flows'][0]['offset']
source=(S/'ai/survival-202608/tokens.js').read_text();assert 'h(context)' not in source and "function arrow(" not in source and 'getContext(' not in source and 'radialGradient' in source
files={p:{'sha256':sha(S/p),'bytes':(S/p).stat().st_size} for p in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
result={'changed_files':len(changed),'new_files':len(new),'protected_files':len(before)-len(changed),'files':files,'model':model,'browser':b}
(W/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:result[k] for k in ['changed_files','new_files','protected_files']})
