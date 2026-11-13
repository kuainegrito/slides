import assert from 'node:assert/strict';
import {POOLS,foreignNeighbors} from './site/ai/survival-202608/tokens-languages.js';
assert.equal(POOLS.length,12);
for(let k=0;k<12;k++){const out=foreignNeighbors(k,19);assert.equal(out.length,3);assert.equal(new Set(out.map(x=>x[0])).size,3);assert.deepEqual(out,foreignNeighbors(k,19));assert.ok(out.every(p=>POOLS[k].some(q=>p[0]===q[0]&&p[1]===q[1])));}
assert.ok(new Set(Array.from({length:100},(_,i)=>JSON.stringify(foreignNeighbors(7,i)))).size>1);
assert.ok(POOLS[7].some(([word,tag])=>word==='maçã'&&tag==='葡Pt'));
assert.ok(POOLS.flat().every(([w,t])=>w&&/^[\u4e00-\u9fff][A-Z][a-z]$/.test(t)));
console.log(JSON.stringify({pools:12,neighborsPerCloud:3,reproducibleWithinScene:true,variesAcrossSeeds:true,tags:true}));
