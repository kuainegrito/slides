import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parent
HUB=ROOT/'site/ai/survival'
corpus=''.join(p.read_text(encoding='utf8') for tree in [HUB,ROOT/'site/ai/survival-202608'] for p in tree.rglob('*') if p.suffix in {'.json','.js','.html','.css'})
chars={ord(c) for c in corpus}|set(range(32,127))
cjk=lambda c:0x3000<=c<=0x9fff or 0xf900<=c<=0xfaff or 0xff00<=c<=0xffef
report=[]
for kind,path,selected in [('sans','C:/Windows/Fonts/SansSerifCollection.ttf',{c for c in chars if not cjk(c)}),('kai','C:/Windows/Fonts/simkai.ttf',{c for c in chars if cjk(c)})]:
    f=TTFont(path,recalcTimestamp=False);cmap=f.getBestCmap();missing=selected-set(cmap)
    assert not any(cjk(c) for c in missing)
    opts=subset.Options();opts.flavor='woff2';opts.name_IDs=['*'];opts.name_legacy=True;opts.name_languages=['*']
    sub=subset.Subsetter(options=opts);sub.populate(unicodes=selected&set(cmap));sub.subset(f);f.flavor='woff2'
    out=HUB/'student/assets'/f'student-{kind}-v1.woff2';f.save(out)
    report.append({'file':out.name,'source':path,'glyphs':len(TTFont(out).getBestCmap()),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
(ROOT/'work/student-edition/font-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report))
