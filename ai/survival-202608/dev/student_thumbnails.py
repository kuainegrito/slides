import json,re,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent
work=ROOT/'work/student-edition'
data=json.loads((ROOT/'site/ai/survival/student/slides.json').read_text(encoding='utf8'))
changed={s['pdf_page'] for s in json.loads((work/'adaptation-review.json').read_text(encoding='utf8'))['changed_pages']}
assets={data['background']}
for s in data['slides']:
    if s['n'] in changed:assets.update(re.findall(r'href="([^"]+\.webp)"',s['svg']))
cache=work/'png-assets';cache.mkdir(exist_ok=True)
for asset in assets:
    path=ROOT/'site'/asset.removeprefix('/slides/')
    Image.open(path).save(cache/(path.name+'.png'))
subprocess.run(['node','render_student.cjs'],cwd=ROOT,check=True)
imgs=sorted((work/'renders').glob('*.png'));font=ImageFont.truetype('C:/Windows/Fonts/Arial.ttf',16)
for start in range(0,len(imgs),12):
    batch=imgs[start:start+12];sheet=Image.new('RGB',(1200,3*193),'#e4e9ee');draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(batch):
        im=Image.open(p).convert('RGB');im.thumbnail((300,169));x=(i%4)*300;y=(i//4)*193
        sheet.paste(im,(x,y+23));draw.text((x+6,y+3),p.stem,font=font,fill='#243e56')
        im.save(ROOT/'site/ai/survival/student/assets'/(p.stem+'.webp'),'WEBP',quality=78,method=6)
    sheet.save(work/f'contact-{start:02d}.jpg',quality=94)
print('Rendered original pixels and current student text for all changed pages')
