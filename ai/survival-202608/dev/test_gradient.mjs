import assert from 'node:assert/strict';
import {INITIAL,loss,gradient,update,slice,sliceMinimum,norm} from './site/ai/survival-202608/gradient-math.js';
const near=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
near(loss(INITIAL),20.75);
near(norm(gradient(INITIAL)),10.6618478698582);
assert.deepEqual(update(INITIAL,.25,[0,1]),[...INITIAL]);
let w=[...INITIAL];
for(const expected of [2.3725,.5069384765625,.16878982543945312,.06722190380096435]){w=update(w,.25);near(loss(w),expected);}
for(let k=4;k<30;k++)w=update(w,.25);
assert.ok(loss(w)<1.1e-10);
w=[...INITIAL];for(const expected of [32.6324,60.2268,114.31278656]){w=update(w,.8);near(loss(w),expected,1e-7);}
let maxError=0;
for(const state of [INITIAL,[.8,-.3,1.4,-1.7,.2,2.2,-.6,.9]]){
 const g=gradient(state),eps=1e-6;
 for(let i=0;i<8;i++){
  const a=[...state],b=[...state];a[i]+=eps;b[i]-=eps;
  const error=Math.abs(g[i]-(loss(a)-loss(b))/(2*eps));maxError=Math.max(maxError,error);assert.ok(error<1e-6);
 }
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){
  near(slice(state,i,j,state[i],state[j]),loss(state));
  const m=sliceMinimum(state,i,j),at=[...state];at[i]=m[0];at[j]=m[1];near(gradient(at)[i],0);near(gradient(at)[j],0);
  const restricted=update(state,.25,[i,j]);for(let k=0;k<8;k++)if(k!==i&&k!==j)near(restricted[k],state[k]);
 }
}
console.log(JSON.stringify({passed:true,maxGradientError:maxError,pairsVerified:56,defaultConverges:true,largeStepDiverges:true,hiddenDirectionCounterexample:true}));
