from pathlib import Path
import subprocess,hashlib,base64,datetime,json
root=Path(__file__).resolve().parents[1]
rel='其他课件/教学创新大赛讲座总结/index.html'
new=(root/rel).read_bytes();tag=b'<script defer src="/scripts/visit-log.js?v=20261116-coverage2"></script>\n'
assert new.count(tag)==1
old=new.replace(tag,b'');release='/root/releases/slides-lecture-tracking-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
code='''from pathlib import Path
import hashlib,base64,json,shutil
root=Path('/var/www/slides');p=root/REL;new=base64.b64decode(DATA);old=base64.b64decode(OLD)
assert p.read_bytes().replace(b'\\r\\n',b'\\n')==old.replace(b'\\r\\n',b'\\n'),'live differs'
protected={str(f.relative_to(root)):hashlib.sha256(f.read_bytes()).hexdigest() for f in root.rglob('*') if f.is_file() and f!=p}
r=Path(RELEASE);r.mkdir(parents=True);shutil.copy2(p,r/'before.html');tmp=p.with_name('.index-tracking.tmp');tmp.write_bytes(new);tmp.chmod(0o644);tmp.replace(p)
assert p.read_bytes()==new
assert all(hashlib.sha256((root/f).read_bytes()).hexdigest()==h for f,h in protected.items())
print(json.dumps({'release':str(r),'file':REL,'sha256':hashlib.sha256(new).hexdigest(),'protected':len(protected)}))
'''
prefix='REL='+repr(rel)+'\nDATA='+repr(base64.b64encode(new).decode())+'\nOLD='+repr(base64.b64encode(old).decode())+'\nRELEASE='+repr(release)+'\n'
r=subprocess.run(['ssh','-o','BatchMode=yes','root@124.220.84.73','python3 -'],input=prefix+code,text=True,encoding='utf8',capture_output=True,check=True)
out=root.parent/'runs/stats-lecture-20261116';out.mkdir(parents=True,exist_ok=True);(out/'deployment.json').write_text(r.stdout,encoding='utf8');print(r.stdout.encode('ascii','backslashreplace').decode())
