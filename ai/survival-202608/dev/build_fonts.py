"""Subset the user's exact Windows fonts for the characters in this course."""
import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parent
DECK=ROOT/'site/ai/survival-202608'
def build_fonts():
    texts=''.join(p.read_text(encoding='utf8') for p in DECK.rglob('*') if p.suffix in {'.json','.js','.html','.css'})
    chars={ord(c) for c in texts}|set(range(32,127))|set(map(ord,'θ∇η−←→×²₁₂₃₄₅₆₇₈₉₀…≤≥≈∞'))
    cjk=lambda c:0x3000<=c<=0x9fff or 0xf900<=c<=0xfaff or 0xff00<=c<=0xffef
    report=[]
    for name,source,selection in [('course-sans-v2','C:/Windows/Fonts/SansSerifCollection.ttf',{c for c in chars if not cjk(c)}),('course-kai-v2','C:/Windows/Fonts/simkai.ttf',{c for c in chars if cjk(c)})]:
        font=TTFont(source,recalcTimestamp=False);cmap=font.getBestCmap();missing=sorted(selection-set(cmap))
        # Missing UI/math symbols use the browser's generic sans font; never CJK.
        assert not any(cjk(c) for c in missing),missing
        options=subset.Options();options.flavor='woff2';options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*']
        sub=subset.Subsetter(options=options);sub.populate(unicodes=selection&set(cmap));sub.subset(font)
        font.flavor='woff2';target=DECK/'assets'/f'{name}.woff2';font.save(target)
        check=TTFont(target)
        assert selection&set(cmap)<=set(check.getBestCmap())
        report.append({'file':target.name,'source':source,'glyphs':len(check.getBestCmap()),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'missing_symbols':[chr(c) for c in missing if c>=32]})
    (ROOT/'work/refinement-02/fonts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':build_fonts()
