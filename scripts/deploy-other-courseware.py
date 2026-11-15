from pathlib import Path
from urllib.request import build_opener, ProxyHandler, Request, HTTPRedirectHandler
from urllib.error import HTTPError
from urllib.parse import urlencode, quote, urljoin, urlsplit, urlunsplit
import datetime
import hashlib
import json
import os
import secrets
import subprocess
import tarfile

ROOT = Path(r"F:\codex_worktrees\projects\slides\master")
WORK = Path(os.environ.get("OTHER_DEPLOY_WORK", r"D:\Nutstore\0A_TransMed\比赛\tmp\yaofei_video_summary\work\site_deploy"))
WORK.mkdir(parents=True, exist_ok=True)
HOST = "root@124.220.84.73"
COURSE = "其他课件/教学创新大赛讲座总结"
PASSWORD = os.environ.get("COURSE_PASSWORD", "")
assert PASSWORD, "COURSE_PASSWORD is required only in the process environment"
sha = lambda data: hashlib.sha256(data).hexdigest()
file_sha = lambda path: sha(path.read_bytes())

course_files = [f"{COURSE}/index.html", f"{COURSE}/姚飞教创赛_备赛流程图.png", f"{COURSE}/姚飞教创赛_备赛流程图.svg"]
course_files += [p.relative_to(ROOT).as_posix() for p in sorted((ROOT / COURSE / "幻灯片").glob("*.jpg"))]
course_files += [p.relative_to(ROOT).as_posix() for p in sorted((ROOT / COURSE / "重点片段").glob("*.mp4"))]
new_static = course_files + ["生理学课件/index.html", "公开课/index.html", "其他课件/index.html", "open_class/index.html"]
assert len(course_files) == 23 and len(new_static) == 27
assert not (ROOT / COURSE / "401.html").exists()
payload = {rel: (ROOT / rel).read_bytes() for rel in new_static}

head_manifest = json.loads(subprocess.check_output(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=12", "root@124.220.84.73", "cat", "/var/www/slides/manifest.json"], encoding="utf-8"))
working_manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
head_manifest["updated_at"] = "2026-11-15"
head_manifest["categories"] = working_manifest["categories"]
other_deck = next(x for x in working_manifest["decks"] if x["id"] == "other/teaching-innovation")
head_manifest["decks"] = [x for x in head_manifest["decks"] if x["id"] != other_deck["id"]] + [other_deck]
payload["manifest.json"] = (json.dumps(head_manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
(WORK / "owned-manifest.json").write_bytes(payload["manifest.json"])

if os.environ.get("VERIFY_ONLY") == "1":
    saved_plan = json.loads((WORK / "plan.json").read_text(encoding="utf-8"))
    report = json.loads(subprocess.check_output([
        "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=12", HOST,
        "cat", saved_plan["release"] + "/report.json"
    ], encoding="utf-8"))
    report["public"] = []
    source = Path(__file__).read_text(encoding="utf-8")
    exec(source[source.rindex("class NoRedirect"):])
    raise SystemExit

release = "/root/releases/slides-other-courseware-" + datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
ssh_base = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=12", HOST]
baseline_code = r'''
from pathlib import Path
import hashlib,json,socket
b=Path('/var/www/slides')
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files={str(p.relative_to(b)):h(p) for p in b.rglob('*') if p.is_file()}
targets=COURSE_FILES
conf=Path('/etc/nginx/snippets/slides-locations.conf')
s=socket.socket();s.settimeout(2);port=s.connect_ex(('127.0.0.1',3097));s.close()
print(json.dumps({'files':files,'root_index':h(b/'index.html'),'slides_conf':h(conf),'existing_targets':[r for r in targets if (b/r).exists()],'auth_conflicts':[str(p) for p in [Path('/etc/nginx/snippets/slides-course-auth.conf'),Path('/opt/slides-course-auth'),Path('/etc/systemd/system/slides-course-auth.service'),Path('/etc/kuaiyu-site/slides-course-auth.env')] if p.exists()],'port_3097_open':port==0}))
'''
code = "COURSE_FILES=" + repr(new_static) + "\n" + baseline_code
res = subprocess.run(ssh_base + ["python3 -"], input=code, encoding="utf-8", capture_output=True)
if res.returncode:
    raise RuntimeError(res.stderr)
baseline = json.loads(res.stdout)
assert not baseline["existing_targets"], baseline["existing_targets"]
assert not baseline["auth_conflicts"], baseline["auth_conflicts"]
assert not baseline["port_3097_open"], "Port 3097 already in use"
(WORK / "live-before.json").write_text(json.dumps(baseline, ensure_ascii=False, indent=2), encoding="utf-8")

plan = {
    "release": release,
    "before": baseline,
    "files": {rel: sha(data) for rel, data in payload.items()},
    "new_static": new_static,
}
archive = WORK / "payload.tgz"
with tarfile.open(archive, "w:gz") as tar:
    for rel, data in payload.items():
        source = WORK / "payload-source" / rel
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(data)
        tar.add(source, arcname="site/" + rel, recursive=False)
    for name in ["slides-course-auth.conf", "slides-course-auth.service", "slides-course-auth-server.py"]:
        tar.add(ROOT / "scripts" / name, arcname="deploy/" + name, recursive=False)
    plan_path = WORK / "plan.json"
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")
    tar.add(plan_path, arcname="plan.json", recursive=False)
subprocess.run(ssh_base + ["mkdir", "-p", release], check=True)
subprocess.run(["scp", "-q", str(archive), HOST + ":" + release + "/payload.tgz"], check=True)

remote_code = r"""
from pathlib import Path
import hashlib,json,tarfile,shutil,os,subprocess,time,urllib.request
r=Path(RELEASE);b=Path('/var/www/slides')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
with tarfile.open(r/'payload.tgz') as t:
 for m in t.getmembers():assert m.isfile() and not m.name.startswith('/') and '..' not in Path(m.name).parts
 t.extractall(r/'payload',filter='data')
p=json.loads((r/'payload/plan.json').read_text(encoding='utf8'))
current={str(f.relative_to(b)):sha(f) for f in b.rglob('*') if f.is_file()}
assert current==p['before']['files'],'Live file drift detected before installation'
assert sha(b/'index.html')==p['before']['root_index']
conf=Path('/etc/nginx/snippets/slides-locations.conf');assert sha(conf)==p['before']['slides_conf']
for rel in p['new_static']:assert not (b/rel).exists(),'New target appeared: '+rel
changed=list(p['files'])+['index.html']
for rel in ['index.html','manifest.json']:
 dest=r/'backup'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(b/rel,dest)
shutil.copy2(conf,r/'backup/slides-locations.conf')
index=(b/'index.html').read_text(encoding='utf-8')
assert index.count('render(m.decks || []);')==1
index=index.replace('render(m.decks || []);','render(m.categories || m.decks || []);',1)
index_bytes=index.encode('utf-8')
new_files=list(p['new_static'])
started=False
try:
 for rel,data in list(p['files'].items())+[('index.html',index_bytes)]:
  target=b/rel;target.parent.mkdir(parents=True,exist_ok=True)
  source=r/'payload/site'/rel if rel!='index.html' else None
  tmp=target.with_name('.'+target.name+'.other-pending')
  tmp.write_bytes(source.read_bytes() if source else data);tmp.chmod(0o644);os.replace(tmp,target)
 snippet=Path('/etc/nginx/snippets/slides-course-auth.conf')
 shutil.copyfile(r/'payload/deploy/slides-course-auth.conf',snippet);snippet.chmod(0o644)
 include='include /etc/nginx/snippets/slides-course-auth.conf;'
 text=conf.read_text(encoding='utf-8');assert include not in text
 marker='location /slides/ {';assert text.count(marker)==1
 conf.write_text(text.replace(marker,include+'\n\n'+marker,1),encoding='utf-8');conf.chmod(0o644)
 auth_dir=Path('/opt/slides-course-auth');auth_dir.mkdir(parents=True)
 shutil.copyfile(r/'payload/deploy/slides-course-auth-server.py',auth_dir/'server.py');(auth_dir/'server.py').chmod(0o644)
 env=Path('/etc/kuaiyu-site/slides-course-auth.env')
 env.write_text('COURSE_PASSWORD_SHA256='+PASSWORD_HASH+'\nCOURSE_COOKIE_SECRET='+COOKIE_SECRET+'\n',encoding='utf-8');env.chmod(0o600)
 unit=Path('/etc/systemd/system/slides-course-auth.service')
 shutil.copyfile(r/'payload/deploy/slides-course-auth.service',unit);unit.chmod(0o644)
 subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True)
 subprocess.run(['systemctl','enable','slides-course-auth'],check=True,capture_output=True)
 subprocess.run(['systemctl','start','slides-course-auth'],check=True,capture_output=True);started=True
 for _ in range(30):
  try:
   with urllib.request.urlopen('http://127.0.0.1:3097/health',timeout=1) as response:
    if response.status==200 and response.read()==b'ok':break
  except Exception:time.sleep(.2)
 else:raise RuntimeError('Authentication service health check failed')
 subprocess.run(['nginx','-t'],check=True,capture_output=True)
 subprocess.run(['systemctl','reload','nginx'],check=True,capture_output=True)
 after={rel:sha(b/rel) for rel in changed}
 for rel,h in p['files'].items():assert after[rel]==h,rel
 for rel,h in p['before']['files'].items():
  if rel not in changed:assert sha(b/rel)==h,'Protected file changed: '+rel
 report={'release':str(r),'changed':changed,'new_files':new_files,'after':after,'protected_files':len(p['before']['files'])-2,'auth_service':'slides-course-auth.service','nginx_reloaded':True,'rollback':str(r/'rollback.py')}
 rollback='''from pathlib import Path
import json,os,shutil,subprocess
r=Path(%r);b=Path('/var/www/slides');p=json.loads((r/'payload/plan.json').read_text(encoding='utf8'))
for rel in ['index.html','manifest.json']:shutil.copyfile(r/'backup'/rel,b/rel)
shutil.copyfile(r/'backup/slides-locations.conf','/etc/nginx/snippets/slides-locations.conf')
for rel in p['new_static']:
 target=b/rel
 if target.exists():
  dest=r/'rolled-back'/rel;dest.parent.mkdir(parents=True,exist_ok=True);os.replace(target,dest)
subprocess.run(['systemctl','disable','--now','slides-course-auth'],check=False,capture_output=True)
for name in ['/etc/nginx/snippets/slides-course-auth.conf','/etc/systemd/system/slides-course-auth.service','/etc/kuaiyu-site/slides-course-auth.env','/opt/slides-course-auth/server.py']:
 path=Path(name)
 if path.exists():os.replace(path,r/('rolled-back-'+path.name))
subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True)
subprocess.run(['nginx','-t'],check=True,capture_output=True)
subprocess.run(['systemctl','reload','nginx'],check=True,capture_output=True)
''' % str(r)
 (r/'rollback.py').write_text(rollback,encoding='utf-8')
 (r/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False))
except Exception:
 for rel in ['index.html','manifest.json']:
  if (r/'backup'/rel).exists():shutil.copyfile(r/'backup'/rel,b/rel)
 if (r/'backup/slides-locations.conf').exists():shutil.copyfile(r/'backup/slides-locations.conf',conf)
 for rel in new_files:
  target=b/rel
  if target.exists():os.replace(target,r/('failed-'+Path(rel).name))
 if started:subprocess.run(['systemctl','disable','--now','slides-course-auth'],check=False,capture_output=True)
 for name in ['/etc/nginx/snippets/slides-course-auth.conf','/etc/systemd/system/slides-course-auth.service','/etc/kuaiyu-site/slides-course-auth.env','/opt/slides-course-auth/server.py']:
  path=Path(name)
  if path.exists():os.replace(path,r/('failed-'+path.name))
 subprocess.run(['systemctl','daemon-reload'],check=False,capture_output=True)
 subprocess.run(['nginx','-t'],check=False,capture_output=True)
 subprocess.run(['systemctl','reload','nginx'],check=False,capture_output=True)
 raise
"""
secret_code = "RELEASE=" + repr(release) + "\nPASSWORD_HASH=" + repr(sha(PASSWORD.encode("utf-8"))) + "\nCOOKIE_SECRET=" + repr(secrets.token_hex(32)) + "\n" + remote_code
res = subprocess.run(ssh_base + ["python3 -"], input=secret_code, encoding="utf-8", capture_output=True)
if res.returncode:
    raise RuntimeError(res.stderr)
report = json.loads(res.stdout)
report["public"] = []

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

opener = build_opener(ProxyHandler({}), NoRedirect)
base = "https://www.kuaiyu.site/slides/"
course_url = base + quote(COURSE, safe="/") + "/"

def fetch(url, method="GET", data=None, cookie=None):
    parts = urlsplit(url)
    url = urlunsplit((parts.scheme, parts.netloc, quote(parts.path, safe="/%"), quote(parts.query, safe="=&%"), ""))
    req = Request(url, method=method, data=data, headers={"User-Agent": "SlidesCourseDeploymentCheck/1.0"})
    if cookie:
        req.add_header("Cookie", cookie)
    if data is not None:
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        response = opener.open(req, timeout=45)
        return response.status, dict(response.headers), response.read()
    except HTTPError as e:
        return e.code, dict(e.headers), e.read()

status, headers, _ = fetch(course_url)
assert status == 302, status
login_url = urljoin(course_url, headers["Location"])
status, _, body = fetch(login_url)
assert status == 200 and "yukuai@gmc.edu.cn" in body.decode("utf-8") and "只需密码，无需用户名" in body.decode("utf-8")
report["public"].append({"check": "unauthenticated-course-and-login-hint", "passed": True})
status, headers, _ = fetch(course_url + quote("幻灯片/01_大主题小切口.jpg", safe="/"))
assert status == 302
report["public"].append({"check": "unauthenticated-media-redirected", "passed": True})
form = urlencode({"next": "/slides/" + COURSE + "/", "password": "incorrect-test-password"}).encode()
status, _, body = fetch(login_url, "POST", form)
assert status == 401 and "密码不正确" in body.decode("utf-8")
report["public"].append({"check": "wrong-password-rejected", "passed": True})
form = urlencode({"next": "/slides/" + COURSE + "/", "password": PASSWORD}).encode()
status, headers, _ = fetch(login_url, "POST", form)
assert status == 303 and "Set-Cookie" in headers
cookie = headers["Set-Cookie"].split(";", 1)[0]
assert PASSWORD not in headers["Set-Cookie"]
report["public"].append({"check": "correct-password-and-cookie", "passed": True})
for rel in course_files:
    status, _, body = fetch(base + quote(rel, safe="/"), cookie=cookie)
    assert status == 200, (rel, status)
    assert sha(body) == sha(payload[rel]), rel
report["public"].append({"check": "all-protected-files-authenticated-hash", "count": len(course_files), "passed": True})
for rel in ["index.html", "manifest.json", "生理学课件/index.html", "公开课/index.html", "其他课件/index.html", "open_class/index.html"]:
    status, _, body = fetch(base + quote(rel, safe="/"))
    assert status == 200, (rel, status)
    if rel == "open_class/index.html":
        assert "公开课" in body.decode("utf-8"), rel
    elif rel != "index.html":
        assert sha(body) == sha(payload[rel]), rel
    else:
        assert b"render(m.categories || m.decks || []);" in body
report["public"].append({"check": "public-categories-and-manifest", "passed": True})
status, headers, _ = fetch("https://kuaiyu.site/slides/")
assert status == 301 and headers["Location"] == "https://www.kuaiyu.site/slides/"
report["public"].append({"check": "apex-to-www-canonical", "passed": True})
report["browser_test_time_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
(WORK / "deployment.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"release": report["release"], "changed": len(report["changed"]), "protected_files": report["protected_files"], "public": report["public"], "rollback": report["rollback"]}, ensure_ascii=False, indent=2))
