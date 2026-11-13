import hashlib, json, re
from pathlib import Path
from PIL import Image
from xml.etree import ElementTree as E

ROOT=Path(__file__).resolve().parent
deck=ROOT/'site/ai/survival-202608'
data=json.loads((deck/'slides.json').read_text(encoding='utf8'))
pages=[s['n'] for s in data['slides']]
assert pages==[n for n in range(1,64) if n!=32],pages
assets=set()
text_count=0
for slide in data['slides']:
    svg=E.fromstring(slide['svg'])
    for image in svg.findall('.//{http://www.w3.org/2000/svg}image'):
        src=image.get('href'); assert src.startswith('assets/') and '..' not in src
        assets.add(src)
        with Image.open(deck/src) as im:im.verify()
    texts=svg.findall('.//{http://www.w3.org/2000/svg}text')
    text_count+=len(texts)
    if slide['n'] in [6,8,9]:assert len(texts)>=30
    assert (deck/slide['thumb']).exists()
    if slide.get('video'):
        assert slide['n']==1 and slide['video']=='assets/cover-wave-v1.mp4'
        assert (deck/slide['video']).is_file()
    if slide.get('media'):
        assert slide['n']==7 and slide['media']['src']=='assets/lecun-demo-v1.mp4'
        assert (deck/slide['media']['src']).is_file()
    if slide.get('interactive'):assert slide['n']==15 and slide['interactive']=='gradient'
    assert all(t.get('font-family')=='DeckSans, DeckKai, sans-serif' for t in texts)
assert all(s['n']!=32 for s in data['slides'])
assert len(data['chapters'])==6
assert not list(deck.rglob('*.pdf')) and not list(deck.rglob('*.pptx'))
assert 'localhost' not in (deck/'index.html').read_text(encoding='utf8')
manifest=json.loads((ROOT/'site/manifest.json').read_text(encoding='utf8'))
assert len([d for d in manifest['decks'] if d['id']=='ai/survival-202608'])==1
files={str(p.relative_to(ROOT/'site')).replace('\\','/'):{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in deck.rglob('*') if p.is_file()}
mp=ROOT/'site/manifest.json'
files['manifest.json']={'sha256':hashlib.sha256(mp.read_bytes()).hexdigest(),'bytes':mp.stat().st_size}
first=data['slides'][0];second=data['slides'][1]
initial_assets={data['background']}|set(re.findall('assets/[a-f0-9]+.webp',first['svg']+second['svg']))
initial=sum((deck/a).stat().st_size for a in initial_assets)+sum((deck/n).stat().st_size for n in ['index.html','deck.css','gradient.css','deck.js','slides.json','assets/course-sans-v2.woff2','assets/course-kai-v2.woff2'])
if first.get('video'):initial+=(deck/first['video']).stat().st_size
report={'pages':len(pages),'source_pages':pages,'native_text_spans':text_count,'masked_pages':sorted({int(re.search(r'PDF (\d+)',x['label']).group(1)) for x in json.loads((ROOT/'work/conversion-report.json').read_text(encoding='utf8'))['masked_assets']}),'delivery_bytes':sum(v['bytes'] for v in files.values()),'initial_bytes_upper_bound':initial,'files':files}
(ROOT/'work/release-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False,indent=2))
