import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parent;D=ROOT/'site/ai/survival-202608'
chars={ord(c) for c in (D/'neural.js').read_text(encoding='utf8')+(D/'neural.css').read_text(encoding='utf8')}|set(range(32,127))
cjk=lambda c:0x3000<=c<=0x9fff or 0xf900<=c<=0xfaff or 0xff00<=c<=0xffef
report=[]
for kind,path,selection in [('sans','C:/Windows/Fonts/SansSerifCollection.ttf',{c for c in chars if not cjk(c)}),('kai','C:/Windows/Fonts/simkai.ttf',{c for c in chars if cjk(c)})]:
 f=TTFont(path,recalcTimestamp=False);cmap=f.getBestCmap();missing=selection-set(cmap);assert not any(cjk(c) for c in missing)
 options=subset.Options();options.flavor='woff2';options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*']
 s=subset.Subsetter(options=options);s.populate(unicodes=selection&set(cmap));s.subset(f);f.flavor='woff2'
 out=D/'assets'/f'neural-{kind}-v1.woff2';f.save(out)
 report.append({'file':out.name,'source':path,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'missing_symbols':[chr(c) for c in missing]})
(ROOT/'work/neural-12/fonts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
