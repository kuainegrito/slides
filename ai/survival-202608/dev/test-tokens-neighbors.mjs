import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../tokens-neighbors.js',import.meta.url),'utf8');
const {semanticNeighbors,semanticLayout,internationalNeighbors,SEMANTIC_NEIGHBOR_LEGEND}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let checks=0;
for(let route=0;route<8;route++)for(let cluster=0;cluster<12;cluster++){
 const rows=semanticNeighbors(cluster,route);assert.equal(rows.length,48);assert.deepEqual(rows,semanticNeighbors(cluster,route));
 for(const lang of ['en','zh','es','pt']){const words=rows.filter(r=>r.lang===lang);assert.equal(words.length,12);assert.equal(new Set(words.map(r=>r.text)).size,12);}
 for(const tier of [.9,.55,.25])assert.equal(rows.filter(r=>r.relatedness===tier).length,16);
 for(let i=0;i<48;i+=4)assert.deepEqual(rows.slice(i,i+4).map(r=>r.lang),['en','zh','es','pt']);
 for(const r of rows){assert(r.text.trim());assert(!/[\uFFFD?]/u.test(r.text));assert.deepEqual(Object.keys(r),['text','lang','relatedness']);}
 const original=rows[0].text;rows[0].text='mutation';assert.equal(semanticNeighbors(cluster,route)[0].text,original);checks++;
}
const words=(c,r)=>semanticNeighbors(c,r).filter(w=>w.lang==='en').map(w=>w.text);
assert.equal(words(0,3)[0],'ice');assert.equal(words(2,3)[0],'mirror');assert.equal(words(2,0)[0],'computer');
assert.equal(words(3,2)[0],'flower');assert.equal(words(1,2)[0],'spend money');
assert.equal(words(3,5)[0],'llama');assert.equal(words(4,5)[0],'flame');
assert(words(7,4).includes('date fruit'));assert(!source.includes('avocado'));assert(!source.includes('guacamole'));
assert(!words(0,0).includes('savings bank'));assert(!words(1,0).includes('river bank'));
assert(semanticNeighbors(7,4).some(w=>w.text==='dátil'));assert(semanticNeighbors(7,4).some(w=>w.text==='tâmara'));
assert(semanticNeighbors(4,5).some(w=>w.lang==='pt'&&w.text==='chama'));
assert(semanticNeighbors(3,5).some(w=>w.lang==='pt'&&w.text==='lhama'));
assert.deepEqual(semanticNeighbors(-1),[]);assert.deepEqual(semanticNeighbors(12),[]);
assert.equal(Object.keys(SEMANTIC_NEIGHBOR_LEGEND).length,4);
console.log(JSON.stringify({checks,conceptsPerVariant:12,labelsPerCluster:48,tiers:3,deterministic:true,routeSensesVerified:true,accentsVerified:true}));

const anchor=[-3.4,1.8,.8,2.5,-1.2,.5,-2.8,1.7];
let layouts=0;
for(let route=0;route<8;route++)for(let cluster=0;cluster<12;cluster++){
 const rows=semanticNeighbors(cluster,route);
 rows.forEach((word,index)=>{
  const value=semanticLayout(word,index,cluster,anchor);
  assert.equal(value.vector.length,8);assert(value.vector.every(Number.isFinite));
  assert(Math.abs(Math.hypot(...value.vector.map((v,d)=>v-anchor[d]))-value.radius)<1e-12);
  assert.deepEqual(value,semanticLayout(word,index,cluster,anchor));
  assert.equal(value.radius,.36+(1-word.relatedness)*1.55);
  assert.equal(value.size,(word.lang==='zh'?9.4:8.2)+2.4*word.relatedness);layouts++;
 });
 for(const lang of ['en','zh','es','pt']){
  const tiers=[.9,.55,.25].map(relatedness=>semanticLayout({lang,relatedness},7,cluster,anchor));
  assert(tiers[0].size>tiers[1].size&&tiers[1].size>tiers[2].size);
  assert(tiers[0].radius<tiers[1].radius&&tiers[1].radius<tiers[2].radius);
 }
}
assert.deepEqual(anchor,[-3.4,1.8,.8,2.5,-1.2,.5,-2.8,1.7]);
console.log(JSON.stringify({layouts,distanceMatchesRadius:true,nearToFarSizeDecreases:true,finiteDeterministicVectors:true}));

let internationalChecks=0;
const scripts={zh:/[\u3400-\u9fff]/u,ar:/[\u0600-\u06ff]/u,ko:/[\uac00-\ud7af]/u,ja:/[\u3040-\u30ff\u3400-\u9fff]/u,ru:/[\u0400-\u04ff]/u};
for(let route=0;route<8;route++)for(let cluster=0;cluster<12;cluster++){
 const extra=internationalNeighbors(cluster,route),base=semanticNeighbors(cluster,route);
 assert.equal(extra.length,16);assert.deepEqual(extra,internationalNeighbors(cluster,route));
 assert.equal(extra.filter(w=>w.lang==='zh').length,8);
 for(const lang of ['ar','ko','ja','ru'])assert.equal(extra.filter(w=>w.lang===lang).length,2);
 for(const word of extra){assert(word.text.trim());assert(scripts[word.lang].test(word.text));assert(!/[\uFFFD?]/u.test(word.text));assert([.9,.55,.25].includes(word.relatedness));assert.deepEqual(Object.keys(word),['text','lang','relatedness']);}
 const zh=[...base,...extra].filter(w=>w.lang==='zh').map(w=>w.text);assert.equal(new Set(zh).size,20,'duplicate Chinese: '+cluster+'/'+route);
 for(const lang of ['ar','ko','ja','ru']){const words=extra.filter(w=>w.lang===lang);assert.equal(new Set(words.map(w=>w.text)).size,2);}
 const first=extra[0].text;extra[0].text='mutation';assert.equal(internationalNeighbors(cluster,route)[0].text,first);internationalChecks++;
}
const includes=(c,r,word)=>internationalNeighbors(c,r).some(w=>w.text===word);
assert(includes(1,2,'شراء'));assert(includes(0,3,'얼음'));assert(includes(2,3,'зеркало'));assert(includes(3,2,'花びら'));
assert(includes(3,5,'لاما'));assert(includes(4,5,'لهب'));assert(includes(7,4,'финики'));assert(includes(1,0,'банк'));assert(includes(0,0,'река'));
assert.deepEqual(internationalNeighbors(-1),[]);assert.deepEqual(internationalNeighbors(12),[]);
console.log(JSON.stringify({internationalChecks,extraLabels:16,extraChinese:8,foreignLanguages:4,scriptsVerified:true,noChineseDuplicates:true,sensesVerified:true}));
