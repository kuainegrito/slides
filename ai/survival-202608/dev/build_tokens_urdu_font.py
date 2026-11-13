import sys,json,urllib.request
from pathlib import Path
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools import subset
from fontTools.ttLib import TTFont
R=Path('.');D=R/'site/ai/survival-202608';s=(D/'tokens-math.js').read_text(encoding='utf8');f=TTFont('C:/Windows/Fonts/NotoNaskhArabic-Regular.ttf',recalcTimestamp=False);chars={ord(c) for c in s if '\u0600'<=c<='\u06ff'}|{32};assert chars<=set(f.getBestCmap());o=subset.Options();o.flavor='woff2';sub=subset.Subsetter(options=o);sub.populate(unicodes=chars);sub.subset(f);f.flavor='woff2';f.save(D/'assets/tokens-urdu-v8.woff2')
license=urllib.request.urlopen('https://raw.githubusercontent.com/google/fonts/main/ofl/notonaskharabic/OFL.txt',timeout=20).read();assert b'SIL OPEN FONT LICENSE' in license;(D/'assets/tokens-urdu-OFL.txt').write_bytes(license)
print('Urdu glyphs:',len(chars),'bytes:',(D/'assets/tokens-urdu-v8.woff2').stat().st_size)
