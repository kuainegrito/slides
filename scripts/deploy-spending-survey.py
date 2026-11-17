"""Deploy only the reviewed opening/questionnaire files; never publish the dirty tree."""
from pathlib import Path
import subprocess,json,tarfile,datetime,hashlib
root=Path(__file__).resolve().parents[1];work=root.parent/'evidence/opening-spending-20261117/release';plan=json.loads((work/'plan.json').read_text())
assert json.loads((root.parent/'runs/opening-20261117/verification.json').read_text())['pass']
for f,h in plan['after'].items():assert hashlib.sha256((work/'payload'/f).read_bytes()).hexdigest()==h,f
release='/root/releases/slides-spending-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
with tarfile.open(work/'payload.tgz','w:gz') as archive:
 for f in plan['changed']:archive.add(work/'payload'/f,arcname=f,recursive=False)
 archive.add(work/'plan.json',arcname='plan.json')
subprocess.run(['ssh','-o','BatchMode=yes','root@124.220.84.73','mkdir -m 700 -p '+release],check=True)
subprocess.run(['scp','-q',str(work/'payload.tgz'),'root@124.220.84.73:'+release+'/payload.tgz'],check=True)
remote=r"""
from pathlib import Path
import json,hashlib,tarfile,shutil,os,subprocess,urllib.request,time,fcntl
lock=open('/run/kuaiyu-survey-release.lock','w');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
r=Path(RELEASE);sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
with tarfile.open(r/'payload.tgz') as archive:
 for m in archive.getmembers():assert m.isfile() and not m.name.startswith('/') and '..' not in Path(m.name).parts
 archive.extractall(r/'payload',filter='data')
p=json.loads((r/'payload/plan.json').read_text());changed=p['changed']
for f,h in p['before'].items():assert sha(Path(p['remote'][f]))==h,'Live drift: '+f
for f,h in p['after'].items():assert sha(r/'payload'/f)==h,'Payload drift: '+f
for name in ['server.cjs','email.cjs']:subprocess.run(['node','--check',str(r/'payload/server/ai-survey'/name)],check=True)
protected={str(f):sha(f) for f in Path('/var/www/slides').rglob('*') if f.is_file() and str(f) not in p['remote'].values()}
config=[Path('/etc/systemd/system/kuaiyu-ai-survey.service'),Path('/etc/nginx/snippets/ai-survey-locations.conf')];config_hash={str(f):sha(f) for f in config}
for f in changed:
 dest=r/'backup'/f;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p['remote'][f],dest)
data=Path('/var/lib/kuaiyu-ai-survey');snap=r/'data-before';snap.mkdir(mode=0o700)
existing={}
for f in data.glob('*.json'):
 shutil.copy2(f,snap/f.name);os.chmod(snap/f.name,0o600);existing[f.name]=sha(f)
(r/'existing-data-hashes.json').write_text(json.dumps(existing,indent=2))
rollback=r'''from pathlib import Path
import json,hashlib,shutil,os,subprocess
r=Path(RELEASE);p=json.loads((r/'payload/plan.json').read_text())
for f,h in p['after'].items():assert hashlib.sha256(Path(p['remote'][f]).read_bytes()).hexdigest()==h,'Later edits: '+f
for f in p['changed']:
 dest=Path(p['remote'][f]);temp=dest.with_name('.'+dest.name+'.rollback');shutil.copy2(r/'backup'/f,temp);os.replace(temp,dest)
subprocess.run(['systemctl','restart','kuaiyu-ai-survey'],check=True)
print('Prior files restored; aggregate data retained')
'''.replace('RELEASE',repr(str(r)))
(r/'rollback.py').write_text(rollback)
installed=[]
def install(f):
 dest=Path(p['remote'][f]);temp=dest.with_name('.'+dest.name+'.opening-pending');shutil.copy2(r/'payload'/f,temp);temp.chmod(0o644);os.replace(temp,dest);installed.append(f)
try:
 for f in changed:
  if f.startswith('server/'):install(f)
 subprocess.run(['systemctl','restart','kuaiyu-ai-survey'],check=True)
 for attempt in range(30):
  try:
   health=json.load(urllib.request.urlopen('http://127.0.0.1:3098/api/ai-survey/v1/health',timeout=2));assert health['ok'];break
  except Exception:
   if attempt==29:raise
   time.sleep(.2)
 for f in changed:
  if not f.startswith('server/'):install(f)
 for f,h in p['after'].items():assert sha(Path(p['remote'][f]))==h,f
 for f,h in protected.items():assert sha(Path(f))==h,'Protected file changed: '+f
 for f,h in config_hash.items():assert sha(Path(f))==h,'Config changed: '+f
except Exception:
 for f in installed:shutil.copy2(r/'backup'/f,p['remote'][f])
 subprocess.run(['systemctl','restart','kuaiyu-ai-survey'],check=True);raise
result={'release':str(r),'files':len(installed),'protectedStaticFiles':len(protected),'configsUnchanged':True,'service':subprocess.check_output(['systemctl','is-active','kuaiyu-ai-survey'],text=True).strip(),'existingDataFiles':len(existing),'existingDataUnchanged':all(sha(data/f)==h for f,h in existing.items()),'rollback':str(r/'rollback.py')}
(r/'deployment.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
"""
a=subprocess.run(['ssh','-o','BatchMode=yes','root@124.220.84.73','python3 -'],input='RELEASE='+repr(release)+'\n'+remote,text=True,capture_output=True)
if a.returncode:print(a.stderr);raise SystemExit(a.returncode)
(work/'deployment.json').write_text(a.stdout);print(a.stdout)
