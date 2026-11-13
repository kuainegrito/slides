import {MODEL} from './neural-weights.js?v=20261111-nn1';
export {MODEL};
export const relu=v=>Math.max(0,v);
export function softmax(logits){const m=Math.max(...logits),e=logits.map(z=>Math.exp(z-m)),sum=e.reduce((a,b)=>a+b,0);return e.map(v=>v/sum);}
export function layer(input,weights,bias){return weights.map((row,j)=>row.reduce((sum,w,i)=>sum+w*input[i],bias[j]));}
export function forward(input){
 if(input.length!==35||input.some(x=>!Number.isFinite(x)))throw new Error('Expected 35 finite pixels');
 const z1=layer(input,MODEL.weights[0],MODEL.biases[0]),a1=z1.map(relu);
 const z2=layer(a1,MODEL.weights[1],MODEL.biases[1]),a2=z2.map(relu);
 const logits=layer(a2,MODEL.weights[2],MODEL.biases[2]),probabilities=softmax(logits);
 return {input:[...input],z1,a1,z2,a2,logits,probabilities,prediction:probabilities.indexOf(Math.max(...probabilities))};
}
// The same deterministic interference field makes slider comparisons reproducible.
export function inputFor(digit,noise=0){
 if(!MODEL.templates[digit]||noise<0||noise>1)throw new Error('Invalid input');
 let state=712;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 return MODEL.templates[digit].map(v=>v*(1-noise)+random()*noise);
}
export function contributions(result,layerIndex,node){
 const input=layerIndex===0?result.input:layerIndex===1?result.a1:result.a2;
 const w=MODEL.weights[layerIndex][node],b=MODEL.biases[layerIndex][node];
 const terms=input.map((x,i)=>({i,x,w:w[i],product:x*w[i]}));
 const z=terms.reduce((s,t)=>s+t.product,b);
 return {terms,b,z,a:layerIndex<2?relu(z):z};
}
