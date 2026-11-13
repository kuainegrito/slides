import hashlib,json,re,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;D=R/'site/ai/survival-202608';report=[]
for name in ['descent','tokens']:
 text=''.join((D/(name+ext)).read_text(encoding='utf8') for ext in ['.js','-math.js','.css'])
 data=json.loads((R/'site/ai/survival/student/slides.json').read_text(encoding='utf8'))
 text+=''.join(slide['text']+slide.get('studentTask','') for slide in data['slides'] if slide['n']==(13 if name=='descent' else 21))
 chars={ord(c) for c in text if ord(c)>127}
 f=TTFont('C:/Windows/Fonts/simkai.ttf',recalcTimestamp=False);chars &= set(f.getBestCmap())
 opt=subset.Options();opt.flavor='woff2';s=subset.Subsetter(options=opt);s.populate(unicodes=chars);s.subset(f);f.flavor='woff2'
 out=D/'assets'/(name+'-kai-v1.woff2');f.save(out);report.append({'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source':'C:/Windows/Fonts/simkai.ttf'})
f=TTFont('C:/Windows/Fonts/SansSerifCollection.ttf',recalcTimestamp=False)
opt=subset.Options();opt.flavor='woff2';s=subset.Subsetter(options=opt);s.populate(unicodes=[0x394,0x2032]);s.subset(f);f.flavor='woff2'
out=D/'assets/interaction-sans-v1.woff2';f.save(out);report.append({'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source':'C:/Windows/Fonts/SansSerifCollection.ttf'})
(R/'work/descent-13/fonts.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
