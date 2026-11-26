(() => {
  const presets = {
    glucose: ['#79e5f4',3.2], gc:['#ffd180',3.3], aa:['#8ae3bf',2.9],
    fat:['#ffae83',3.2], signal:['#96e5ff',2.6], ion:['#a3d8ff',2.8], blood:['#f77f78',5.3]
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('fx-toggle');
  let manualPause=false, active=null, raf=0, previous=0, time=0;
  const textureCache=new Map(), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function sprite(kind,color) {
    const key=kind+color; if(textureCache.has(key))return textureCache.get(key);
    const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.translate(32,32);
    const haze=g.createRadialGradient(0,0,1,0,0,28);haze.addColorStop(0,color);haze.addColorStop(1,'transparent');
    g.globalAlpha=.35;g.fillStyle=haze;g.fillRect(-32,-32,64,64);g.globalAlpha=1;
    g.fillStyle=color;g.strokeStyle=color;g.lineWidth=3;
    if(kind==='blood'){
      g.scale(1,.70);const red=g.createRadialGradient(-2,-2,1,0,0,15);
      red.addColorStop(0,'#8a3242');red.addColorStop(.57,'#df6c69');red.addColorStop(.82,'#ffa18c');red.addColorStop(1,'#8d3947');
      g.fillStyle=red;g.beginPath();g.arc(0,0,15,0,2*Math.PI);g.fill();
    } else if(kind==='glucose'){
      g.beginPath();for(let k=0;k<=6;k++){const a=(k/3-.5)*Math.PI;g[k?'lineTo':'moveTo'](12*Math.cos(a),12*Math.sin(a))}g.closePath();g.fill();
      g.strokeStyle='#e4fdff';g.lineWidth=1.6;g.stroke();
    } else if(kind==='fat'){
      g.beginPath();g.moveTo(-15,4);g.lineTo(-9,-2);g.lineTo(-3,3);g.lineTo(4,-4);g.lineTo(11,0);g.stroke();
      g.beginPath();g.arc(11,0,4,0,Math.PI*2);g.fill();
    } else if(kind==='aa'){
      g.beginPath();g.arc(-5,2,7,0,Math.PI*2);g.arc(5,-3,5,0,Math.PI*2);g.fill();
    } else {
      g.beginPath();g.arc(0,0,kind==='gc'?9:8,0,Math.PI*2);g.fill();
      g.fillStyle='#fff7df';g.beginPath();g.arc(-2,-2,3,0,Math.PI*2);g.fill();
    }
    textureCache.set(key,c);return c;
  }
  function lanes(svg){
    if(!svg) return [];
    const rootMatrix=svg.getScreenCTM();
    if(!rootMatrix)return [];
    return Array.from(svg.querySelectorAll('path[data-flow]')).flatMap((p,idx)=>{
      const length=p.getTotalLength();if(!(length>1))return [];
      const m=rootMatrix.inverse().multiply(p.getScreenCTM()),samples=Math.ceil(length/4)+1, coords=new Float32Array(samples*2);
      for(let k=0;k<samples;k++){const at=p.getPointAtLength(length*k/(samples-1)).matrixTransform(m);coords[k*2]=at.x;coords[k*2+1]=at.y}
      const kind=p.dataset.flow, [defaultColor,radius]=presets[kind]||presets.signal;
      const speed=Math.max(.1,Number(p.dataset.speed)||58),rate=p.dataset.rate===undefined?3:Number(p.dataset.rate);
      if(!(rate>0))return [];
      return [{coords,samples,length,speed,rate,phase:(idx*.618)%1,
        count:clamp(Math.round(length/speed*rate),1,150),radius:Number(p.dataset.radius)||radius,
        tex:sprite(kind,p.dataset.color||defaultColor),start:Number(p.dataset.start)||0}];
    });
  }
  function measure(){
    if(!active)return;
    const a=active;const w=a.host.clientWidth,h=a.host.clientHeight;
    const screenWidth=a.host.getBoundingClientRect().width;
    const ratio=clamp(devicePixelRatio*screenWidth/Math.max(1,w),.65,2);
    a.canvas.width=Math.round(w*ratio);a.canvas.height=Math.round(h*ratio);
    const dims=a.svg?.viewBox?.baseVal;
    const vw=dims?.width||1280,vh=dims?.height||720,scale=Math.min(w/vw,h/vh);
    a.ctx.setTransform(scale*ratio,0,0,scale*ratio,(w-scale*vw)/2*ratio,(h-scale*vh)/2*ratio);
  }
  function draw(now){
    const a=active;if(!a)return;
    if(previous){const interval=now-previous;time+=Math.min(.15,interval/1000)}
    previous=now;
    const g=a.ctx;
    g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,a.canvas.width,a.canvas.height);g.restore();
    if(a.ending)a.ending(time);
    else for(const line of a.lanes){
      if(time<line.start)continue;
      const {length,coords,samples,count,radius}=line;
      for(let i=0;i<count;i++){
        const u=((time-line.start)*line.speed/length + (i+line.phase)/count)%1;
        const w=u*(samples-1),k=Math.min(samples-2,Math.floor(w)),f=w-k,j=2*k;
        const x=coords[j]+(coords[j+2]-coords[j])*f,y=coords[j+1]+(coords[j+3]-coords[j+1])*f;
        const size=radius*(.88+.18*Math.sin(i*2.4))*3.5;
        g.globalAlpha=.83 * Math.min(1,u*18,(1-u)*18);
        g.drawImage(line.tex,x-size,y-size,size*2,size*2);
      }
    }
    g.globalAlpha=1;
  }
  function animate(now){if(!active||active.stopped)return;draw(now);raf=requestAnimationFrame(animate)}
  function paused(){return manualPause||reduced.matches||document.hidden}
  function reconcile(){
    if(!active)return;const a=active;a.stopped=paused();cancelAnimationFrame(raf);previous=0;
    for(const animation of a.host.getAnimations({subtree:true})){
      if(a.stopped)animation.pause();else animation.play();
    }
    if(a.stopped)a.svg?.pauseAnimations();else a.svg?.unpauseAnimations();
    toggle.textContent=manualPause?'继续动效':'暂停动效';toggle.setAttribute('aria-pressed',String(manualPause));
    if(!a.stopped)raf=requestAnimationFrame(animate);
    else if(reduced.matches){time=a.ending?9:3.6;a.svg?.setCurrentTime(8);draw(performance.now());previous=0}
  }
  function clear(){cancelAnimationFrame(raf);raf=0;previous=0;time=0;if(active)active.canvas.remove();active=null;toggle.hidden=true}
  function mount(host,isFinal){
    clear();toggle.hidden=false;
    const svg=host.querySelector('svg'); const canvas=document.createElement('canvas');canvas.className='particle-plane';canvas.setAttribute('aria-hidden','true');
    host.append(canvas);const ctx=canvas.getContext('2d');
    active={host,svg,canvas,ctx,lanes:lanes(svg),ending:isFinal?window.gcFinale(ctx):null,stopped:false};
    measure();draw(performance.now());reconcile();
  }
  function togglePause(){if(!active||reduced.matches)return;manualPause=!manualPause;reconcile()}
  toggle.onclick=()=>{togglePause();toggle.blur()};
  document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='a'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!document.querySelector('dialog[open]')){e.preventDefault();if(!e.repeat)togglePause()}});
  document.addEventListener('visibilitychange',reconcile);reduced.addEventListener('change',reconcile);
  window.addEventListener('resize',()=>{measure();if(active?.stopped){previous=0;draw(performance.now());previous=0}});
  window.addEventListener('pagehide',clear);
  window.gcFX={mount,clear};
})();
