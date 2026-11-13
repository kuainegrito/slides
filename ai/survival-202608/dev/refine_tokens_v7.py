from pathlib import Path
import hashlib,json,shutil
R=Path('.');B=R/'work/tokens-v7/before';B.mkdir(parents=True,exist_ok=False);shutil.copy2('work/release-manifest.json',B/'release-manifest.json')
for rel,m in json.loads((B/'release-manifest.json').read_text())['files'].items():
 p=R/'site'/rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==m['sha256']
 if p.suffix in ['.js','.css','.json','.html']:
  q=B/'site'/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
p=R/'site/ai/survival-202608/tokens.js';s=p.read_text();s=s.replace("from './tokens-math.js?v=20261113-tk6';","from './tokens-math.js?v=20261113-tk6';\nimport {cloudParticles,ambientParticles} from './tokens-particles.js?v=20261113-tk7';")
s=s.replace('[[0,c.color,.72],[.35,c.color,.34]','[[0,c.color,.24],[.35,c.color,.085]').replace("armGroup=make('g',{fill:'none'}),",'').replace('length:10},(_,j)','length:6},(_,j)')
a=s.index(' const arms=');b=s.index(' const bridges=',a)
s=s[:a]+''' // Particle density belongs to semantic regions; the surrounding field stays quiet.
 const stars=ambientParticles().map(p=>({...p,e:make('circle',{fill:'#8da9bc','data-ambient':'true'},dustGroup)}));
 const cloudDust=cloudParticles(DUST,CLUSTERS).map((p,i)=>({p,i,e:make('circle',{fill:p.highlight?'#f9fcff':CLUSTERS[p.cluster].color,'data-cloud-particle':p.cluster},dustGroup)}));
'''+s[b:]
a=s.index('  arms.forEach');b=s.index('  bridges.forEach',a)
s=s[:a]+'''  stars.forEach(({v,e,phase:p},i)=>{const q=world([v[0]+Math.sin(phase*.1+p)*.05,v[1],v[2]]);e.setAttribute('cx',q.x);e.setAttribute('cy',q.y);e.setAttribute('r',clamp(.45*q.scale,.25,.85));e.setAttribute('opacity',clamp(.11+q.z*.012,.04,.22));});
  cloudDust.forEach(({p,i,e})=>{const co=CLUSTERS[p.cluster].center,dx=p.vector[0]-co[0],dy=p.vector[1]-co[1],t=phase*.22;const v=p.vector.slice();v[0]=co[0]+dx*Math.cos(t)-dy*Math.sin(t);v[1]=co[1]+dx*Math.sin(t)+dy*Math.cos(t);v[2]+=.07*Math.sin(phase*.35+p.phase);const q=at(v,p.cluster);e.setAttribute('cx',q.x);e.setAttribute('cy',q.y);e.setAttribute('r',clamp(p.size*q.scale*clusterScale(p.cluster),.35,3.2));e.setAttribute('opacity',clamp(.56+q.z*.055+Math.sin(phase+p.phase)*.12,.22,.94)*focusWeights[p.cluster]);});
'''+s[b:]
s=s.replace("labels:String(wordElements.length),renderer:","labels:String(wordElements.length),cloudParticles:String(cloudDust.length),ambientParticles:String(stars.length),renderer:")
p.write_text(s,encoding='utf8')
for fn in ['site/ai/survival-202608/deck.js','site/ai/survival-202608/index.html','build_editions.py']:
 p=R/fn;p.write_text(p.read_text(encoding='utf8').replace('20261113-tk6','20261113-tk7'),encoding='utf8')
