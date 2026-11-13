import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;D=R/'site/ai/survival-202608';report=[]
text=''.join((D/n).read_text(encoding='utf-8-sig') for n in ['tokens.js','tokens-math.js','tokens.css'])
s=next(s for s in json.loads((R/'site/ai/survival/student/slides.json').read_text(encoding='utf8'))['slides'] if s['n']==21);text+=s['text']+s['studentTask']+s['studentTaskEn']
for name,source in [('kai','simkai.ttf'),('sans','SansSerifCollection.ttf')]:
 f=TTFont('C:/Windows/Fonts/'+source,recalcTimestamp=False);chars=set(map(ord,text))
 if name=='kai':chars|=set(TTFont(D/'assets/tokens-kai-v2.woff2').getBestCmap())
 else:chars|=set(range(32,127))
 chars&=set(f.getBestCmap());opt=subset.Options();opt.flavor='woff2';ss=subset.Subsetter(options=opt);ss.populate(unicodes=chars);ss.subset(f);f.flavor='woff2';out=D/'assets'/('tokens-'+name+'-v5.woff2');f.save(out);report.append({'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source':source})
(R/'work/tokens-v5/fonts.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
