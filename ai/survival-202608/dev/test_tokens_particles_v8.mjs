import assert from 'node:assert/strict';
import {DUST,CLUSTERS} from './site/ai/survival-202608/tokens-math.js';
import {cloudParticles,ambientParticles} from './site/ai/survival-202608/tokens-particles.js';
const original=JSON.stringify(DUST),cloud=cloudParticles(DUST,CLUSTERS),ambient=ambientParticles();
assert.equal(JSON.stringify(DUST),original);assert.equal(cloud.length,6270);assert.equal(ambient.length,420);assert.deepEqual(cloud,cloudParticles(DUST,CLUSTERS));assert.deepEqual(ambient,ambientParticles());
for(let k=0;k<11;k++)assert.equal(cloud.filter(p=>p.cluster===k).length,570);
for(const p of cloud){assert.equal(p.vector.length,8);assert.ok(p.vector.every(Number.isFinite));assert.ok(p.size>=.45&&p.size<=1.5);assert.ok(Math.hypot(...p.vector.map((x,d)=>x-CLUSTERS[p.cluster].center[d]))<5);}
assert.ok(ambient.every(p=>p.v.every(Number.isFinite)));
console.log(JSON.stringify({cloudGrains:cloud.length,ambient:ambient.length,balancedClusters:11,deterministic:true,unchangedInput:true}));
