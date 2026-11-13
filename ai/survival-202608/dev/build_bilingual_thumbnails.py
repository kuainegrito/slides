"""Create WebP previews from verified renders; reuse identical artwork."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
SHARED='ai/survival-202608'
def apply_refs(data):
 student=data.get('edition')=='student'
 for slide in data['slides']:
  n=slide['n'];name=f'bilingual-page-{n:02d}-v1.webp'
  local=ROOT/'site/ai/survival/student/assets'/name
  common=ROOT/'site'/SHARED/'assets'/name
  if student and local.exists():slide['thumb']='/slides/ai/survival/student/assets/'+name
  elif common.exists():slide['thumb']=('/slides/'+SHARED+'/' if student else '')+'assets/'+name
 return data
def build():
 work=ROOT/'work/bilingual-v1';created=[]
 def save(source,target):
  image=Image.open(source).convert('RGB');image.thumbnail((320,180),Image.Resampling.LANCZOS)
  image.save(target,format='WEBP',quality=78,method=6);created.append(target.relative_to(ROOT/'site').as_posix())
 for edition in ['teacher','student']:
  for png in sorted((work/'renders'/edition).glob('page-*.png')):
   n=int(png.stem.split('-')[1]);name=f'bilingual-page-{n:02d}-v1.webp'
   base=ROOT/'site'/(SHARED if edition=='teacher' else 'ai/survival/student')/'assets'
   other=work/'renders/teacher'/png.name
   if edition=='student' and other.exists() and other.read_bytes()==png.read_bytes():continue
   save(png,base/name)
 for n,name in [(12,'neural-stage'),(15,'gradient-stage')]:save(work/(name+'.png'),ROOT/'site'/SHARED/'assets'/f'bilingual-page-{n:02d}-v1.webp')
 for folder in [SHARED,'ai/survival/student']:
  p=ROOT/'site'/folder/'slides.json';data=json.loads(p.read_text(encoding='utf8'));p.write_text(json.dumps(apply_refs(data),ensure_ascii=False,separators=(',',':')),encoding='utf8')
 (work/'thumbnails.json').write_text(json.dumps(created,indent=2),encoding='utf8')
 print(json.dumps({'previews':len(created),'bytes':sum((ROOT/'site'/p).stat().st_size for p in created)}))
if __name__=='__main__':build()
