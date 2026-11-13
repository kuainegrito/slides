// One-dimensional convex teaching example; all plotted values use this model.
export const TARGET=1, INITIAL=-3;
export const loss=w=>.5*(w-TARGET)**2;
export const slope=w=>w-TARGET;
export const update=(w,eta)=>w-eta*slope(w);
export function regime(eta){return eta<1?'direct':eta===1?'exact':eta<2?'oscillate':eta===2?'cycle':'diverge';}
export function limits(w,next){const radius=Math.max(5,Math.abs(w-TARGET)*1.14,Math.abs(next-TARGET)*1.14);return {left:TARGET-radius,right:TARGET+radius,top:.5*radius**2*1.13,expanded:radius>5.001};}
