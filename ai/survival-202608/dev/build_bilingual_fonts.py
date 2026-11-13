import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parent;D=R/'site/ai/survival-202608'
chars={ord(c) for p in (R/'site').rglob('*') if p.suffix in {'.js','.css','.json','.html'} for c in p.read_text(encoding='utf8')}|set(range(32,127))
cjk=lambda c:0x3000<=c<=0x9fff or 0xf900<=c<=0xfaff or 0xff00<=c<=0xffef
report=[]
for name,path,selection in [('sans','C:/Windows/Fonts/SansSerifCollection.ttf',{c for c in chars if not cjk(c)}),('kai','C:/Windows/Fonts/simkai.ttf',{c for c in chars if cjk(c)})]:
 f=TTFont(path,recalcTimestamp=False);cmap=f.getBestCmap();assert not any(cjk(c) for c in selection-set(cmap))
 opt=subset.Options();opt.flavor='woff2';opt.name_IDs=['*'];opt.name_legacy=True;opt.name_languages=['*'];s=subset.Subsetter(options=opt);s.populate(unicodes=selection&set(cmap));s.subset(f);f.flavor='woff2'
 out=D/'assets'/f'bilingual-{name}-v1.woff2';f.save(out);report.append({'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'source':path})
(R/'work/bilingual-v1/fonts.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
