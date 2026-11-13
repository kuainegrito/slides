import json,hashlib,shutil
from pathlib import Path
B=Path('work/tokens-v5/before');B.mkdir(parents=True,exist_ok=False);shutil.copy2('work/release-manifest.json',B/'release-manifest.json')
for rel,v in json.loads((B/'release-manifest.json').read_text())['files'].items():
 p=Path('site')/rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==v['sha256']
 if p.suffix in ['.js','.css','.json','.html']:
  q=B/'site'/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
p=Path('site/ai/survival-202608/tokens-math.js');s=p.read_text(encoding='utf8');at=s.index('\n];')
s=s[:at].rstrip()+",\n"+""" {en:'Romance & company',zh:'约会与陪伴',color:'#c77ca4',center:[-1,.3,3.3,1.6,-1.1,2.3,.8,-2.4],words:[['date','约会'],['romance','浪漫'],['dinner','晚餐'],['flowers','鲜花'],['love','爱'],['couple','情侣'],['candle','烛光'],['heart','心动']]},
 {en:'Fruit & food',zh:'水果与食物',color:'#9caa4c',center:[2.2,-.5,-3.2,-1.8,2.7,.3,-2,1.1],words:[['date','椰枣'],['avocat','牛油果'],['fruit','水果'],['palm','棕榈'],['sweet','甜'],['salad','沙拉'],['guacamole','牛油果酱'],['eat','吃']]},
 {en:'Law & justice',zh:'法律与正义',color:'#7d93c1',center:[-3,.3,-2.3,2.8,.9,-2.1,1.9,.4],words:[['avocat','律师'],['court','法庭'],['law','法律'],['justice','正义'],['defence','辩护'],['judge','法官'],['case','案件'],['rights','权利']]}
"""+s[at:]
at=s.index('\n];',s.index('export const CASES'))
s=s[:at].rstrip()+",\n"+""" {en:'date',zh:'约会／椰枣',a:48,b:56,pun:'I brought a date to dinner.',punZh:'我带了约会对象来吃晚餐。／我带了一颗椰枣来吃晚餐。',contexts:[{en:'A date at a candlelit dinner',zh:'烛光晚餐的约会对象',fr:'rendez-vous',es:'cita'},{en:'A sweet date from a palm',zh:'棕榈树上的甜椰枣',fr:'datte',es:'dátil'}]},
 {en:'avocat',zh:'律师／牛油果',a:64,b:57,pun:'J’ai mangé mon avocat.',punZh:'我吃了我的牛油果。／我把我的律师吃了。',contexts:[{en:'The lawyer speaks in court',zh:'律师在法庭上发言',fr:'avocat',es:'abogado'},{en:'Eat avocado in a salad',zh:'吃沙拉里的牛油果',fr:'avocat',es:'aguacate'}]}
"""+s[at:]
at=s.index('\n];',s.index('export const NEIGHBORS'));s=s[:at].rstrip()+",\n"+""" [['romance','浪漫'],['dinner','晚餐'],['flowers','鲜花'],['love','爱'],['candle','烛光'],['heart','心动']],
 [['fruit','水果'],['palm','棕榈'],['sweet','甜'],['salad','沙拉'],['guacamole','牛油果酱'],['eat','吃']],
 [['court','法庭'],['law','法律'],['justice','正义'],['defence','辩护'],['judge','法官'],['rights','权利']]
"""+s[at:];p.write_text(s,encoding='utf8')
