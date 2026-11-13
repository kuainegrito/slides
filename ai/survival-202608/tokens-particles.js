// Decorative particles only. Authored cloud grains do not add learned word vectors.
const fract=x=>x-Math.floor(x);
const noise=i=>fract(Math.sin(i*127.1+311.7)*43758.5453123);
export function cloudParticles(dust,clusters){
 return dust.flatMap((p,i)=>Array.from({length:3},(_,j)=>{
  const center=clusters[p.cluster].center;
  return {cluster:p.cluster,vector:p.vector.map((v,d)=>center[d]+(v-center[d])*(.87+j*.12)+(noise(i*31+j*11+d*7)-.5)*.3),size:.45+noise(i*17+j*59)*1.05,phase:p.phase+j*2.1,highlight:(i*3+j)%17===0};
 }));
}
export function ambientParticles(){return Array.from({length:420},(_,i)=>({v:[(noise(i*7)-.5)*11,(noise(i*7+1)-.5)*5.5,(noise(i*7+2)-.5)*7],phase:noise(i*7+3)*Math.PI*2}));}
