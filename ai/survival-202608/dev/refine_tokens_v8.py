from pathlib import Path
import json,hashlib,shutil
B=Path('work/tokens-v8/before');B.mkdir(parents=True,exist_ok=False);shutil.copy2('work/release-manifest.json',B/'release-manifest.json')
for rel,m in json.loads((B/'release-manifest.json').read_text())['files'].items():
 p=Path('site')/rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==m['sha256']
 if p.suffix in ['.js','.css','.json','.html']:
  q=B/'site'/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
p=Path('site/ai/survival-202608/tokens-math.js');s=p.read_text();at=s.index('\n];');s=s[:at].rstrip()+",\n"+""" {en:'Past & memory',zh:'过去与记忆',color:'#8d9cc3',center:[-2.7,2.5,-1.8,.4,-2.1,2.9,-.5,1.8],words:[['kal','昨天'],['memory','记忆'],['history','历史'],['finished','完成'],['before','之前'],['remember','回想'],['past','过去'],['yesterday','昨天']]},
 {en:'Future & possibility',zh:'未来与可能',color:'#63b7ae',center:[2.9,2.2,2.3,-.7,1.9,-2.4,1.3,-1.6],words:[['kal','明天'],['plan','计划'],['hope','希望'],['tomorrow','明天'],['later','以后'],['next','下一个'],['will','将要'],['future','未来']]}
"""+s[at:];at=s.index('\n];',s.index('export const CASES'));s=s[:at].rstrip()+",\n"+""" {en:'kal · کل',zh:'昨天／明天',a:72,b:80,pun:'ہم کل کا کام کل کریں گے۔',punZh:'我们把 kal 的工作留到 kal 做：昨天的工作明天做／明天的工作明天做。',roman:'Ham kal kā kām kal kareṅge.',contexts:[{en:'The exam was yesterday',zh:'考试在昨天',fr:'hier',es:'ayer',ur:'کل',urSentence:'کل امتحان تھا۔',urNeighbors:['یاد','ماضی','گزرا']},{en:'The exam will be tomorrow',zh:'考试将在明天',fr:'demain',es:'mañana',ur:'کل',urSentence:'کل امتحان ہو گا۔',urNeighbors:['منصوبہ','مستقبل','امید']}]}
"""+s[at:];at=s.index('\n];',s.index('export const NEIGHBORS'));s=s[:at].rstrip()+",\n"+""" [['memory','记忆'],['history','历史'],['finished','完成'],['before','之前'],['remember','回想'],['past','过去']],
 [['plan','计划'],['hope','希望'],['tomorrow','明天'],['later','以后'],['next','下一个'],['will','将要']]
"""+s[at:];p.write_text(s,encoding='utf8')
p=Path('site/ai/survival-202608/tokens.js');s=p.read_text().replace('tokens-math.js?v=20261113-tk6','tokens-math.js?v=20261113-tk8').replace('8000','12000');s=s.replace('route===5?57:56,64][k]','route===5?57:56,64,72,80][k]');s=s.replace("a.textContent=en; if(zh)", "if(/[\\u0600-\\u06ff]/.test(en)){a.setAttribute('font-family','TokensUrdu');a.setAttribute('font-size',major?24:17);a.setAttribute('direction','rtl');a.setAttribute('unicode-bidi','isolate');a.setAttribute('lang','ur');}a.textContent=en; if(zh)")
s=s.replace("for(const [j,str] of ['FR · '+t.fr,'ES · '+t.es].entries())", "for(const [j,str] of ['FR · '+t.fr,'ES · '+t.es,...(t.ur?[t.ur,...t.urNeighbors]:[])].entries())")
s=s.replace("d===0?(j?-.7:.7):d===1?-.6:d===2?j*.5:0", "d===0?Math.cos(j*1.8)*.9:d===1?-.5-Math.floor(j/2)*.35:d===2?Math.sin(j)*.5:0")
s=s.replace("if(!wordElements.some", "if(!wordElements.some")
# A soft interstitial veil under the existing grains; no blur/filter on thousands of particles.
s=s.replace('[[0,c.color,.24],[.35,c.color,.085]','[[0,c.color,.30],[.35,c.color,.105]')
s=s.replace("const hazeGroup=make('g'),dustGroup", "const hazeGroup=make('g'),veilGroup=make('g',{'data-mist':'true'}),dustGroup")
s=s.replace(' const stars=ambientParticles()', " const veils=CLUSTERS.map((c,k)=>({k,e:make('ellipse',{fill:'url(#tk-cloud-'+k+')'},veilGroup)}));\n const stars=ambientParticles()")
s=s.replace('  stars.forEach', "  veils.forEach(({k,e})=>{const v=CLUSTERS[k].center.map((x,d)=>x+Math.sin(phase*.19+k+d)*.12),p=at(v,k);e.setAttribute('cx',p.x);e.setAttribute('cy',p.y);e.setAttribute('rx',115*p.scale*clusterScale(k)*(W/918));e.setAttribute('ry',46*p.scale*clusterScale(k));e.setAttribute('opacity',.22*focusWeights[k]);});\n  stars.forEach")
p.write_text(s,encoding='utf8')
p=Path('site/ai/survival-202608/tokens.css');s=p.read_text();s+="\n@font-face{font-family:TokensUrdu;src:url('assets/tokens-urdu-v8.woff2') format('woff2');font-display:swap}.tk-tour [data-route=\"6\"] .lang-en{font-family:TokensSans,TokensUrdu,sans-serif}\n";s=s.replace('tokens-kai-v5.woff2','tokens-kai-v8.woff2').replace('tokens-sans-v5.woff2','tokens-sans-v8.woff2');p.write_text(s,encoding='utf8')
for fn in ['site/ai/survival-202608/deck.js','site/ai/survival-202608/index.html','build_editions.py']:
 p=Path(fn);p.write_text(p.read_text(encoding='utf8').replace('20261113-tk7','20261113-tk8'),encoding='utf8')
