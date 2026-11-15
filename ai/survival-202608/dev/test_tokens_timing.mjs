import assert from 'node:assert/strict';
import {CASES,NODES,CLUSTERS,INTRO_MS,TOUR_ORDER,TOUR_MS,SOURCE_HOLD_MS,TRAVEL_MS,DESTINATION_HOLD_MS,tourState,smoother,contextVector,distance} from '../tokens-math.js';
assert.equal(TOUR_MS,8000);assert.equal(SOURCE_HOLD_MS,2000);assert.equal(TRAVEL_MS,4000);assert.equal(DESTINATION_HOLD_MS,2000);
for(let i=0;i<16;i++){
 for(const [local,progress,phase] of [[0,0,'source'],[1999,0,'source'],[2000,0,'source'],[4000,.5,'travel'],[6000,1,'arrival'],[7999,1,'arrival']]){const s=tourState(i*TOUR_MS+local);assert.equal(s.route,TOUR_ORDER[i%8]);assert.equal(s.progress,progress);assert.equal(s.phase,phase);}
}
assert.equal(smoother(-1),0);assert.equal(smoother(2),1);
let previous=0;for(let i=0;i<=1000;i++){const p=smoother(i/1000);assert.ok(p>=previous);previous=p;}
for(const end of [0,1]){const h=1e-4;assert.ok(Math.abs((smoother(end+h)-smoother(end-h))/(2*h))<1e-6);}
for(let r=0;r<CASES.length;r++){const c=CASES[r],a=NODES[c.a].vector,b=NODES[c.b].vector;assert.deepEqual(contextVector(r,0),a);assert.ok(distance(contextVector(r,1),b)<1e-10);}
console.log(JSON.stringify({cases:8,periodMs:TOUR_MS,sourceHoldMs:SOURCE_HOLD_MS,travelMs:TRAVEL_MS,arrivalHoldMs:DESTINATION_HOLD_MS,smoothEndpoints:true,monotonic:true}));

assert.equal(CASES[3].en,"glace");assert.equal(CASES[5].en,"llama");assert.equal(CASES[7].zh,"东西");

assert.equal(INTRO_MS,14000);assert.deepEqual(TOUR_ORDER,[7,0,1,2,3,4,5,6]);
