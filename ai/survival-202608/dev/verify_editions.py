"""Check the dual edition package, preserved source assets and publication scope."""
import collections, hashlib, json, re, subprocess, sys
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
from PIL import Image
sys.path.insert(0,'F:/codex_worktrees/cache/font-python')
from fontTools.ttLib import TTFont

ROOT=Path(__file__).resolve().parent
SITE=ROOT/'site'; HUB=SITE/'ai/survival'; WORK=ROOT/'work/student-edition'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf8'))
before=read(WORK/'before/release-manifest.json')
old=read(SITE/'ai/survival-202608/slides.json'); new=read(HUB/'student/slides.json')
expected=[n for n in range(1,64) if n!=32]
assert [s['n'] for s in old['slides']]==[s['n'] for s in new['slides']]==expected
assert new['edition']=='student'
for rel,meta in before['files'].items():
    if rel!='manifest.json':assert sha(SITE/rel)==meta['sha256'],f'Original file changed: {rel}'
assert sha(SITE/'index.html')=='0945f73922f4c18ad2b45d7180d5ccc1e76cc67cb3490c5f876b9a274c669a8f'

def asset(uri):
    path=unquote(urlsplit(uri).path)
    return SITE/path.removeprefix('/slides/') if path.startswith('/slides/') else SITE/'ai/survival-202608'/path

image_count=0
for a,b in zip(old['slides'],new['slides']):
    assert b['studentTask'].strip()
    images=lambda s:[e.attrib['href'] for e in ET.fromstring(s['svg']).iter() if e.tag.endswith('}image')]
    orig=collections.Counter(sha(asset(p)) for p in images(a))
    student=collections.Counter(sha(asset(p)) for p in images(b))
    assert orig==student, f'Artwork changed on PDF {a["n"]}'
    image_count+=sum(orig.values())
    for uri in images(b)+[b['thumb']]:assert asset(uri).is_file(),uri
    if a.get('video'):assert sha(asset(a['video']))==sha(asset(b['video']))
    if a.get('media'):
        assert sha(asset(a['media']['src']))==sha(asset(b['media']['src']))
    assert a.get('interactive')==b.get('interactive')

changed=read(WORK/'adaptation-review.json')['changed_pages']
assert len(changed)==29
for item in changed:
    p=HUB/'student/assets'/f'page-{item["pdf_page"]:02d}.webp'
    with Image.open(p) as im:assert im.size==(300,169);im.verify()
fonts={kind:TTFont(HUB/f'student/assets/student-{kind}-v1.woff2').getBestCmap() for kind in ['sans','kai']}
corpus=''.join(p.read_text(encoding='utf8') for p in HUB.rglob('*') if p.suffix in {'.json','.js','.css','.html'})
cjk={ord(c) for c in corpus if 0x3000<=ord(c)<=0x9fff or 0xf900<=ord(c)<=0xfaff or 0xff00<=ord(c)<=0xffef}
assert cjk<=fonts['kai'].keys(),''.join(chr(c) for c in cjk-fonts['kai'].keys())
assert not (set(fonts['sans'])&set(fonts['kai'])), 'Language subsets overlap'
for edition in ['teacher','student']:
    html=(HUB/edition/'index.html').read_text(encoding='utf8')
    assert f'data-edition="{edition}"' in html
    assert ('id="student-task-toggle"' in html)==(edition=='student')
    assert 'href="../"' in html
    for uri in re.findall(r'(?:src|href)="([^"]+)"',html):
        path=urlsplit(uri).path
        if not path or urlsplit(uri).scheme:continue
        target=SITE/path.removeprefix('/slides/') if path.startswith('/slides/') else HUB/edition/path
        assert target.exists(),str(target)
subprocess.run(['node','--check',str(HUB/'player.js')],check=True)
audit=read(WORK/'browser-text-audit.json')
assert len(audit)==29 and not any(p['overflow'] for p in audit)
card=next(c for c in read(SITE/'manifest.json')['decks'] if c['id']=='ai/survival-202608')
assert card['href']=='./ai/survival/'
newfiles={p.relative_to(SITE).as_posix():{'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(HUB.rglob('*')) if p.is_file()}
newfiles['manifest.json']={'sha256':sha(SITE/'manifest.json'),'bytes':(SITE/'manifest.json').stat().st_size}
report={'pages_per_edition':62,'adapted_pages':29,'tasks':62,'original_image_placements_preserved':image_count,'original_files_preserved':len(before['files'])-1,'hidden_page_32_omitted':True,'browser_text_fit_pages':29,'new_bytes':sum(m['bytes'] for m in newfiles.values()),'new_file_count':len(newfiles),'files':newfiles}
(WORK/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False))
