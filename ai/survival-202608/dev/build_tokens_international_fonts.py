from pathlib import Path
import sys,json,hashlib
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
r=Path(__file__).resolve().parents[1];w=r.parents[2]/'runs/tokens-zoom-20261115';data=json.loads((w/'language-text.json').read_text(encoding='utf8'));report=[]
for name,source,lang in [('kai','simkai.ttf','zh'),('sans','SansSerifCollection.ttf','en'),('arabic','arial.ttf','ar'),('korean','malgun.ttf','ko'),('japanese','YuGothM.ttc','ja'),('cyrillic','arial.ttf','ru')]:
 font=TTFont('C:/Windows/Fonts/'+source,fontNumber=0,recalcTimestamp=False);required=set(map(ord,''.join(data[lang])))|set(range(32,127))
 if name in ['kai','sans']:required|=set(TTFont(r/f'assets/tokens-{name}-v10.woff2').getBestCmap())
 if name=='kai':required|={ord(c) for filename in ['tokens.js','tokens-math.js'] for c in (r/filename).read_text(encoding='utf8') if '㐀'<=c<='鿿'}
 if name=='sans':required|=set(map(ord,''.join(data['es']+data['pt'])))
 assert required.issubset(font.getBestCmap()),(name,sorted(required-set(font.getBestCmap())))
 opt=subset.Options();opt.flavor='woff2';opt.layout_features=['*'];ss=subset.Subsetter(options=opt);ss.populate(unicodes=required);ss.subset(font);font.flavor='woff2';out=r/f'assets/tokens-{name}-v15.woff2';font.save(out);f=TTFont(out);assert required.issubset(f.getBestCmap());report.append({'file':out.name,'requiredGlyphs':len(required),'missing':0,'layoutTables':[k for k in ['GSUB','GPOS'] if k in f],'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
(w/'fonts.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
