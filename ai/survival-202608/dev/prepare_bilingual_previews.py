import json,re,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parent;W=R/'work/bilingual-v1';(W/'png').mkdir(exist_ok=True)
for source in ['ai/survival-202608','ai/survival/student']:
 data=json.loads((R/'site'/source/'slides.json').read_text(encoding='utf8'));assets={data['background']}
 for s in data['slides']:
  if '<text' in s['svg']:assets.update(re.findall('href="([^"]+\\.webp)"',s['svg']))
 for a in assets:
  p=R/'site'/a.removeprefix('/slides/') if a.startswith('/slides/') else R/'site/ai/survival-202608'/a
  out=W/'png'/(p.name+'.png')
  if not out.exists():Image.open(p).save(out)
subprocess.run(['node','render_bilingual.cjs'],check=True,cwd=R)
font=ImageFont.truetype('C:/Windows/Fonts/Arial.ttf',16)
for edition in ['teacher','student']:
 files=sorted((W/'renders'/edition).glob('*.png'))
 for start in range(0,len(files),12):
  sheet=Image.new('RGB',(1200,579),'#e6e9ed');draw=ImageDraw.Draw(sheet)
  for i,p in enumerate(files[start:start+12]):
   im=Image.open(p).convert('RGB');im.thumbnail((300,169));x=i%4*300;y=i//4*193;sheet.paste(im,(x,y+23));draw.text((x+5,y+3),p.stem,font=font,fill='#39363f')
  sheet.save(W/f'{edition}-contact-{start:02d}.jpg',quality=94)
print('Prepared bilingual contact sheets')
