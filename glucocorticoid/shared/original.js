(() => {
  let current, frame, media, ready = false, range, holder, posterFallback;
  const art = document.getElementById('illustration');
  const stage = document.getElementById('stage');
  const buttons = document.getElementById('tools');
  function control(name,label,action) {
    const button = document.createElement('button'); button.type='button'; button.textContent=label; button.hidden=true;
    button.id=name; button.onclick=e=>{action();e.currentTarget.blur()}; buttons.prepend(button); return button;
  }
  const playButton = control('film-control','暂停影片',() => { if(media){ if(media.paused) media.play().catch(()=>{}); else media.pause(); } });
  const soundButton = control('sound-control','开启原声',() => { if(media){media.muted=!media.muted;media.play().catch(()=>{});mediaControls()} });
  function mediaControls() {
    playButton.hidden=!media;
    soundButton.hidden=!media || !current?.sound;
    if(media){playButton.textContent=media.paused?'播放影片':'暂停影片';soundButton.textContent=media.muted?'开启原声':'关闭原声'}
  }
  function sendRange() {
    if(frame && ready) frame.contentWindow.postMessage({type:'lecture-play-range',...range},'*');
  }
  window.addEventListener('message',e=>{
    if(!frame || e.source!==frame.contentWindow) return;
    if(e.data?.type==='lecture-scene-ready'){ready=true;frame.dataset.ready='yes';sendRange()}
    if(e.data?.type==='lecture-scene-frame'){frame.dataset.elapsed=String(e.data.t);frame.dataset.ended=String(e.data.end)}
  });
  function reset() {
    if(media){media.pause();media.removeAttribute('src');media.load()}
    media=null;frame=null;current=null;ready=false;holder=null;posterFallback=null;
    art.replaceChildren();mediaControls();
  }
  function layout(view) {
    const top=Math.max(0,Math.min(.65,Number(view.cutTop??.24)));
    const bottom=Math.max(0,Math.min(.60,Number(view.cutBottom??.17)));
    const height=Math.max(1,720*(1-top-bottom));
    const zoom=Math.min(art.clientWidth/1280,art.clientHeight/height);
    holder.style.width=(1280*zoom)+'px';holder.style.height=(height*zoom)+'px';
    const surface=holder.firstElementChild;
    surface.style.transform='scale('+zoom+')';
    surface.style.top=(-720*top*zoom)+'px';
  }
  window.originalLecture = {
    clear(){if(current)reset()},
    render(view,label) {
      if(!view) return false;
      const same=frame && current?.animation===view.animation;
      if(!same)reset();
      current=view;
      if(view.video) {
        stage.classList.add('film');
        media=document.createElement('video');media.playsInline=true;media.autoplay=true;media.loop=!!view.loop;media.muted=!view.sound;media.preload='auto';
        media.className='full-film';media.setAttribute('aria-label',label);
        media.poster=view.poster||(view.loop?'assets/cover-poster.jpg':'assets/case-poster.jpg');
        media.src=view.video;
        art.append(media);const film=media;
        film.onplay=film.onpause=film.onended=mediaControls;
        film.play().catch(()=>{if(media!==film)return;film.muted=true;mediaControls();film.play().catch(()=>{if(media===film)document.getElementById('tools').classList.add('visible')})});
        if(view.tag){const tag=document.createElement('div');tag.className='film-tag';tag.textContent=view.tag;art.append(tag)}
        mediaControls();return true;
      }
      stage.classList.add('source-art');
      if(!same){
        holder=document.createElement('div');holder.className='original-crop';art.append(holder);
        const surface=document.createElement(view.animation?'iframe':'img');
        surface.className='original-surface';
        if(view.animation) {
          frame=surface;frame.tabIndex=-1;frame.title=label;
          frame.src=view.animation+'?capture&lecture';
        } else {surface.src=view.image;surface.alt=label;surface.draggable=false}
        holder.append(surface);
      }
      layout(view);
      if(frame){range={from:view.from??0,to:view.to??null};sendRange()}
      return true;
    }
  };
})();
