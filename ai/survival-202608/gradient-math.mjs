// Eight-dimensional, strictly convex teaching example; indices wrap in a ring.
export const INITIAL = Object.freeze([-.4,.4,2,-1.2,1.4,-1.6,1.3,-2]);
export function loss(w){return w.reduce((s,v,i)=>s+.5*v*v+.25*(v-w[(i+1)%8])**2,0);}
export function gradient(w){return w.map((v,i)=>2*v-.5*w[(i+7)%8]-.5*w[(i+1)%8]);}
export function update(w,eta,axes=null){const g=gradient(w);return w.map((v,i)=>v-(axes&&!axes.includes(i)?0:eta*g[i]));}
export const norm=v=>Math.hypot(...v);
export function slice(w,a,b,x,y){const copy=[...w];copy[a]=x;copy[b]=y;return loss(copy);}
export function sliceMinimum(w,a,b){
  const zero=[...w];zero[a]=0;zero[b]=0;const g=gradient(zero);
  const c=(Math.abs(a-b)===1||Math.abs(a-b)===7)?-.5:0,det=4-c*c;
  return [(-2*g[a]+c*g[b])/det,(c*g[a]-2*g[b])/det];
}
