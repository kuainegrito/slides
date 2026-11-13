"""Release scope, source preservation, bilingual styles and browser evidence."""
import collections,hashlib,json,re,subprocess
from pathlib import Path
from xml.etree import ElementTree as E
R=Path(__file__).resolve().parent;S=R/'site';W=R/'work/bilingual-v1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((W/'before/release-manifest.json').read_text(encoding='utf8'))['files']
allowed={'ai/survival-202608/'+n for n in ['deck.js','gradient.js','index.html','slides.json','neural.js']}|{'ai/survival/'+n for n in ['player.js','teacher/index.html','student/index.html','student/slides.json']}
changed={p for p,v in before.items() if sha(S/p)!=v['sha256']}
assert changed==allowed,(changed-allowed,allowed-changed)
new={p.relative_to(S).as_posix() for p in S.rglob('*') if p.is_file()}-set(before)-{'index.html'}
expected=set(json.loads((W/'thumbnails.json').read_text()))|{'ai/survival-202608/'+p for p in ['bilingual.css','bilingual.js','assets/bilingual-sans-v1.woff2','assets/bilingual-kai-v1.woff2']}
assert new==expected,(new-expected,expected-new)
assert sha(S/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'
NS='{http://www.w3.org/2000/svg}';INK='#3f3f46';PURPLE='#7030a0';counts={}
def colors(t,inherit):
 fill=t.get('fill',inherit)
 if t.text:
  assert not re.search('[A-Za-z]',t.text) or fill==INK,(page,t.text,fill)
  assert not re.search('[\u3400-\u9fff]',t.text) or fill==PURPLE,(page,t.text,fill)
 for c in t:
  colors(c,fill)
  if c.tail:
   assert not re.search('[A-Za-z]',c.tail) or fill==INK,(page,c.tail,fill)
   assert not re.search('[\u3400-\u9fff]',c.tail) or fill==PURPLE,(page,c.tail,fill)
for edition,folder in [('teacher','ai/survival-202608'),('student','ai/survival/student')]:
 p=folder+'/slides.json';d=json.loads((S/p).read_text(encoding='utf8'));old=json.loads((W/'before/site'/p).read_text(encoding='utf8'))
 assert [s['n'] for s in d['slides']]==[s['n'] for s in old['slides']]==[i for i in range(1,64) if i!=32]
 oldslides={s['n']:s for s in old['slides']};native=0
 for s in d['slides']:
  page=(edition,s['n']);previous=oldslides[s['n']]
  root=E.fromstring(s['svg']);prior=E.fromstring(previous['svg'])
  for key in ['video','media','interactive']:assert s.get(key)==previous.get(key),(page,key)
  assert collections.Counter(el.get('href') for el in root.iter(NS+'image'))==collections.Counter(el.get('href') for el in prior.iter(NS+'image')),page
  assert s['titleEn'] and s['titleZh'] and s['bilingualStyle']=='en-first-v1'
  if edition=='student':assert s['studentTaskEn'] and s['studentTask']==previous['studentTask']
  thumb=s['thumb'];f=S/thumb.removeprefix('/slides/') if thumb.startswith('/slides/') else S/folder/thumb;assert f.exists(),thumb
  for t in root.iter(NS+'text'):
   native+=1;assert t.get('font-family')=='BiSans, BiKai, sans-serif',(page,t.attrib);colors(t,INK)
  for g in root.iter(NS+'g'):
   if g.get('class')=='bi-pair':
    langs=[t.get('data-lang') for t in g.iter(NS+'text')];assert langs[0]=='en' and langs[-1]=='zh' and langs==sorted(langs),page
 counts[edition]={'pages':len(d['slides']),'native_text_objects':native}
 evidence=json.loads((W/(edition+'-browser-bounds.json')).read_text())
 assert len(evidence)==62 and not any(e['overflow'] for e in evidence)
for rel in changed|new:
 if rel.endswith('.js'):subprocess.run(['node','--check',str(S/rel)],check=True,capture_output=True)
for name in ['student-p12.png','neural-stage.png','gradient-stage.png','student-p12-mobile.png']:assert (W/name).exists()
# Install resources first; versioned HTML entry points last.
manifest={rel:{'sha256':sha(S/rel),'bytes':(S/rel).stat().st_size} for rel in sorted(changed|new,key=lambda p:(p.endswith('.html'),p.endswith('.json'),p))}
report={'editions':counts,'changed':len(changed),'new':len(new),'protected':len(before)-len(changed),'new_bytes':sum(manifest[p]['bytes'] for p in new),'browser_bounds_pages':124,'original_art_and_media_unchanged':True,'files':manifest}
(W/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False))
