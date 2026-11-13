import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MODEL,forward,inputFor,softmax,contributions} from './site/ai/survival-202608/neural-model.js';
const reference=JSON.parse(fs.readFileSync(new URL('./work/neural-12/model-reference.json',import.meta.url)));
const before=JSON.stringify(MODEL);let maxError=0;
for(let d=0;d<10;d++){
 const r=forward(inputFor(d));assert.equal(r.prediction,d);
 for(let j=0;j<10;j++){const error=Math.abs(r.probabilities[j]-reference.clean_template_probabilities[d][j]);maxError=Math.max(maxError,error);assert.ok(error<1e-7);}
 for(let layer=0;layer<3;layer++)for(let j=0;j<MODEL.weights[layer].length;j++){
  const c=contributions(r,layer,j),expected=[r.z1,r.z2,r.logits][layer][j];assert.ok(Math.abs(c.z-expected)<1e-10);
  if(layer<2)assert.equal(c.a,Math.max(0,c.z));
 }
 for(const n of [0,.25,.5,.75,1]){const f=forward(inputFor(d,n));assert.ok(f.probabilities.every(p=>Number.isFinite(p)&&p>=0&&p<=1));assert.ok(Math.abs(f.probabilities.reduce((a,b)=>a+b,0)-1)<1e-12);}
}
assert.deepEqual(inputFor(8,1),inputFor(6,1));
assert.notDeepEqual(forward(inputFor(8)).probabilities,forward(inputFor(8,.7)).probabilities);
const shifted=softmax([10001,10002,10003]),normal=softmax([1,2,3]);shifted.forEach((x,i)=>assert.ok(Math.abs(x-normal[i])<1e-12));
assert.deepEqual(softmax([0,0,0,0]),[.25,.25,.25,.25]);
assert.throws(()=>forward([1,2]));assert.throws(()=>forward(Array(35).fill(NaN)));
assert.equal(JSON.stringify(MODEL),before);
console.log(JSON.stringify({templates:10,noise_cases:50,all_node_sums_verified:true,softmax_stability:true,weights_unchanged:true,max_reference_error:maxError,clean8:forward(inputFor(8)).probabilities,noise8:forward(inputFor(8,.7)).probabilities}));
