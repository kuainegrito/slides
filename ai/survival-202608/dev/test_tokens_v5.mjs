import assert from 'node:assert/strict';
import {CASES,NODES,TOUR_MS,tourState,contextVector,distance,project,rotate} from './site/ai/survival-202608/tokens-math.js';
assert.equal(TOUR_MS,8000);
for(let i=0;i<12;i++){
 const start=tourState(i*8000),end=tourState(i*8000+7999);assert.equal(start.route,i%CASES.length);assert.equal(end.route,i%CASES.length);assert.equal(start.progress,0);assert.equal(end.progress,1);
 assert.equal(tourState(i*8000+2000).progress,0);assert.equal(tourState(i*8000+5500).progress,1);
 assert.ok(Math.abs(tourState(i*8000+3750).progress-.5)<1e-12);
}
for(let r=0;r<CASES.length;r++){
 const c=CASES[r],a=NODES[c.a].vector,b=NODES[c.b].vector;assert.deepEqual(contextVector(r,0),a);assert.ok(distance(contextVector(r,1),b)<1e-12);
 const d=distance(a,b);assert.ok(d>5);
 for(const t of [0,.1,.25,.5,.75,.9,1]){const v=contextVector(r,t);assert.ok(v.every(Number.isFinite));assert.ok(Math.abs(distance(a,v)-d*t)<1e-10);const p=project(v,.75);assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(distance(rotate(project(a,.75),.8,.5),rotate(p,.8,.5))-distance(project(a,.75),p))<1e-10);}
}
assert.equal(CASES[3].contexts[0].fr,CASES[3].contexts[1].fr);assert.equal(CASES[3].contexts[0].es,CASES[3].contexts[1].es);
console.log(JSON.stringify({casePeriodMs:TOUR_MS,cases:CASES.length,timelineBoundaries:true,contextVectorEndpoints:true,interpolation:true,rotationInvariant:true}));

assert.equal(CASES.length,6);assert.equal(NODES[CASES[4].a].zh,"约会");assert.equal(NODES[CASES[4].b].zh,"椰枣");assert.equal(NODES[CASES[5].a].zh,"律师");assert.equal(NODES[CASES[5].b].zh,"牛油果");
