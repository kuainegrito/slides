import assert from 'node:assert/strict';
import {loss,slope,update,INITIAL,limits} from './site/ai/survival-202608/descent-math.js';
import {NODES,BRIDGES,basis,project,rotate,distance,dot} from './site/ai/survival-202608/tokens-math.js';
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
near(loss(INITIAL),8);near(loss(update(INITIAL,.25)),4.5);near(loss(update(INITIAL,1.3)),.72);near(loss(update(INITIAL,2.1)),9.68);
for(const w of [-9,-3,.2,1,4,10]){
 const h=1e-5;near(slope(w),(loss(w+h)-loss(w-h))/(2*h),1e-7);
 for(const eta of [.05,.25,1,1.3,2,2.2]){const n=update(w,eta);near(loss(n),loss(w)*(1-eta)**2);const r=limits(w,n);assert.ok(n>r.left&&n<r.right&&loss(n)<r.top);}
}
let w=INITIAL;for(let i=0;i<20;i++)w=update(w,.25);assert.ok(loss(w)<.0001);
for(const eta of [1.3,2,2.1]){const n=update(INITIAL,eta);assert.ok(n>1);assert.equal(Math.sign(loss(n)-loss(INITIAL)),eta<2?-1:eta===2?0:1);}
assert.equal(NODES.length,48);assert.ok(NODES.every(n=>n.vector.length===8&&n.vector.every(Number.isFinite)));
for(const angle of [0,.2,.75,1.1,1.35]){
 const q=basis(angle);q.forEach((a,i)=>q.forEach((b,j)=>near(dot(a,b),i===j?1:0)));
 for(const b of BRIDGES){const a=NODES[b.a].vector,z=NODES[b.b].vector,pa=project(a,angle),pz=project(z,angle);assert.ok(distance(pa,pz)<=distance(a,z)+1e-9);near(distance(rotate(pa,.5,.7),rotate(pz,.5,.7)),distance(pa,pz));}
}
const b=BRIDGES[0],a=NODES[b.a].vector,z=NODES[b.b].vector;assert.ok(Math.abs(distance(project(a,0),project(z,0))-distance(project(a,1.35),project(z,1.35)))>1);
console.log(JSON.stringify({gradient_regimes:true,analytical_derivative:true,plot_bounds:true,projection_rows_orthonormal:true,rotations_preserve_3d_distance:true,synthetic_nodes:NODES.length,bridges:BRIDGES.length,bank8D:distance(a,z),bank3D_A:distance(project(a,0),project(z,0)),bank3D_C:distance(project(a,1.35),project(z,1.35))}));
