// Bounded SVG fields. Geometry is sampled once; every effect uses the scene clock.
export function createParticleField(svg,make,path){
  const flows=[],vortices=[];
  const fade=(t,s)=>{const x=Math.max(0,Math.min(1,(t-s)/2));return x*x*(3-2*x);};
  const point=(points,u)=>{const q=Math.max(0,Math.min(.99999,u))*160,k=Math.floor(q),f=q-k,a=points[k],b=points[k+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2],a[3]];};
  function stream(d,color,start,count=16){
    const layer=make('g',{'data-flow':start,'pointer-events':'none'});
    const ribbon=path(d,color,10,layer);ribbon.setAttribute('opacity','.07');
    const spine=path(d,color,1.2,layer);spine.setAttribute('opacity','.3');
    const len=spine.getTotalLength();const raw=Array.from({length:162},(_,i)=>{const p=spine.getPointAtLength(len*Math.min(1,i/160));return [p.x,p.y];});
    const points=raw.slice(0,161).map((p,i)=>{const a=raw[Math.max(0,i-1)],b=raw[i+1],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;return [...p,-dy/m,dx/m];});
    const trails=path('',color,1.4,layer);trails.setAttribute('opacity','.5');trails.dataset.effect='comet-trails';
    const nodes=Array.from({length:count*2},(_,i)=>({dot:make('circle',{r:i%5===0?3:1.6,fill:i%5===0?'#f7fdff':color,stroke:color,'stroke-width':i%5===0?1.2:0},layer),halo:i%5===0?make('circle',{r:7,fill:color,opacity:.12},layer):null}));
    flows.push({layer,spine,ribbon,points,trails,nodes,start});return layer;
  }
  function converge(x,y,color,start=0){
    const g=make('g',{'data-effect':'convergence','pointer-events':'none'});
    make('ellipse',{cx:x,cy:y,rx:49,ry:74,fill:'url(#as-halo)'},g);
    const rings=Array.from({length:3},(_,i)=>make('ellipse',{cx:x,cy:y,rx:10+i*6,ry:23+i*12,fill:'none',stroke:color,'stroke-width':1.4,'stroke-dasharray':'3 6',opacity:.5},g));
    const dots=Array.from({length:46},(_,i)=>make('circle',{r:i%7===0?2.5:1.4,fill:i%7===0?'#f8fdff':color,stroke:color,'stroke-width':.5},g));
    vortices.push({g,x,y,rings,dots,start});
  }
  function flowTick(t,speed=1){
    flows.forEach(({layer,points,trails,nodes,start},j)=>{
      const active=fade(t,start);layer.setAttribute('opacity',active);let strokes='';
      nodes.forEach(({dot,halo},i)=>{
        const u=(t*(.105+(i%3)*.014)*speed+i/nodes.length+j*.11)%1;
        const p=point(points,u),tail=point(points,Math.max(0,u-.045));
        // A tapered helix closes onto the target; foreground particles appear larger.
        const a=u*15-t*2+i*2.399,spread=Math.sin(Math.PI*u)*(6+(i%4)*2),offset=Math.sin(a)*spread;
        const x=p[0]+p[2]*offset,y=p[1]+p[3]*offset,back=Math.sin(a-.6)*spread;
        dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('opacity',.4+.6*(1+Math.cos(a))/2);
        if(halo){halo.setAttribute('cx',x);halo.setAttribute('cy',y);}
        if(i%2===0)strokes+=`M${tail[0]+tail[2]*back} ${tail[1]+tail[3]*back} Q${p[0]-p[3]*4} ${p[1]+p[2]*4} ${x} ${y} `;
      });
      trails.setAttribute('d',strokes);
    });
    vortices.forEach(({g,x,y,rings,dots,start})=>{g.setAttribute('opacity',fade(t,start));rings.forEach((n,i)=>n.setAttribute('transform',`rotate(${t*(i%2?-24:20)+i*51} ${x} ${y})`));dots.forEach((n,i)=>{const q=(t*.19+i/dots.length)%1,a=q*8+i*2.399,r=9+(1-q)*48;n.setAttribute('cx',x+Math.cos(a)*r*.56);n.setAttribute('cy',y+Math.sin(a)*r);n.setAttribute('opacity',Math.sin(q*Math.PI)*.85);});});
  }
  return {stream,converge,flowTick};
}
