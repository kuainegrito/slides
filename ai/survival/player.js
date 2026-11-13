import {prepareSteps,revealNext,hidePrevious,installPresentation} from '/slides/ai/survival-202608/presentation.js?v=20261113-p1';
import {bi,setBi,escapeText} from '/slides/ai/survival-202608/bilingual.js?v=20261112-bi4';
/* Original source artwork + native text, with a dependency-free slide player. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const edition=document.documentElement.dataset.edition;
  const editionLabel=edition==='student'?'学生版':'教师版';
  const sourceURL=new URL(document.documentElement.dataset.source,location.href);
  const storageKey=name=>'ai-survival-'+edition+'-'+name;
  function resolveSource(data){
    const asset=p=>p?new URL(p,sourceURL).href:p;
    data.background=asset(data.background);
    for(const slide of data.slides){
      slide.svg=slide.svg.replace(/href="([^"]+)"/g,(all,path)=>'href="'+asset(path)+'"');
      slide.thumb=asset(slide.thumb);if(slide.video)slide.video=asset(slide.video);
      if(slide.media){slide.media.src=asset(slide.media.src);slide.media.poster=asset(slide.media.poster);}
    }
    return data;
  }
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const storage = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k,v) => { try { localStorage.setItem(k,v); } catch {} } };
  let preference = storage.get(storageKey('motion'));
  let paused = preference ? preference === 'paused' : motionQuery.matches;
  let deck, slides = [], current = 0, laser = false, touchStart = null, overviewBuilt = false;
  let toastTimer, enteringTimer, disposeInteraction=null, slideGeneration=0;
  const stage = $('stage'), content = $('slide-content');
  installPresentation();
  function syncSlideVideo() {
    const video=content.querySelector('.slide-video');
    if(!video)return;
    if(paused||document.hidden){video.pause();return;}
    // Keep the original SVG visible until a frame is ready; autoplay may be denied.
    if(!video.getAttribute('src'))video.src=video.dataset.src;
    video.play().catch(()=>{});
  }
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.remove('visible'),2400); }
  function applyMotion() {
    document.documentElement.classList.toggle('motion-paused', paused);
    document.documentElement.classList.toggle('motion-playing', !paused && preference === 'playing');
    $('motion').setAttribute('aria-pressed', String(!paused));
    $('motion').setAttribute('aria-label', paused ? '开启装饰动效' : '暂停装饰动效');
    $('motion').innerHTML='◌ '+bi(paused?'Motion off':'Motion',paused?'动效已关':'动效',true);
    const motion = document.querySelector('.edge-light');
    if (paused) motion.pauseAnimations?.(); else motion.unpauseAnimations?.();
    syncSlideVideo();
    drawAmbient(performance.now());
  }
  $('motion').addEventListener('click',()=>{paused=!paused;preference=paused?'paused':'playing';storage.set(storageKey('motion'),preference);applyMotion();});
  motionQuery.addEventListener('change',()=>{if(!preference){paused=motionQuery.matches;applyMotion();}});
  function closePanels() { document.querySelectorAll('dialog[open]').forEach(d=>d.close()); }
  function toggleDialog(id) { const d=$(id); if(d.open){d.close();return;} closePanels(); d.showModal(); }
  for(const d of document.querySelectorAll('dialog')) {
    d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));
    d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
    d.addEventListener('close',()=>document.querySelectorAll('[aria-controls="'+d.id+'"]').forEach(b=>b.setAttribute('aria-expanded','false')));
  }
  function openPanel(id,button){toggleDialog(id);$(button)?.setAttribute('aria-expanded',String($(id).open));}
  function setSlide(index,{hash=true}={}) {
    if(!slides.length)return;
    current=Math.max(0,Math.min(slides.length-1,index));
    const slide=slides[current], chapter=deck.chapters.find(c=>c.id===slide.chapter);
    const generation=++slideGeneration;
    disposeInteraction?.();disposeInteraction=null;
    const previousVideo=content.querySelector('video');
    if(previousVideo){previousVideo.pause();previousVideo.removeAttribute('src');previousVideo.load();}
    content.innerHTML=slide.svg;
    prepareSteps(content,current===0,current===slides.length-1);
    if(slide.video){
      const video=document.createElement('video');
      video.className='slide-video';video.muted=true;video.defaultMuted=true;
      video.loop=true;video.playsInline=true;video.preload='none';
      video.dataset.src=slide.video;video.setAttribute('aria-hidden','true');
      video.addEventListener('playing',()=>video.classList.add('ready'));
      video.addEventListener('error',()=>video.classList.remove('ready'));
      content.append(video);syncSlideVideo();
    }
    if(slide.media){
      const holder=document.createElement('div');holder.className='slide-media';
      const [x,y,w,h]=slide.media.box;
      Object.assign(holder.style,{left:x/9.6+'%',top:y/5.4+'%',width:w/9.6+'%',height:h/5.4+'%'});
      const video=document.createElement('video');video.controls=true;video.playsInline=true;
      video.preload='none';video.src=slide.media.src;video.poster=slide.media.poster;
      video.setAttribute('aria-label',slide.media.title);
      const play=document.createElement('button');play.className='media-play';play.innerHTML='▶ '+bi('Play with original audio · 1:01','播放原声视频 · 1:01',true);
      play.addEventListener('click',()=>video.play().catch(()=>toast('视频暂时无法播放，请重试。')));
      video.addEventListener('play',()=>{play.hidden=true;});
      video.addEventListener('ended',()=>{play.hidden=false;play.innerHTML='↻ '+bi('Replay','再看一次',true);});
      holder.append(video,play);content.append(holder);
    }
    if(slide.interactive==='descent'){
      import('/slides/ai/survival-202608/descent.js?v=20261113-gd5').then(module=>{
        if(generation!==slideGeneration)return;
        disposeInteraction=module.mountDescent(content,slide.svg);
      }).catch(error=>{console.error(error);toast('动画加载失败，已保留原图。');});
    }
    if(slide.interactive==='tokens'){
      import('/slides/ai/survival-202608/tokens.js?v=20261113-tk12').then(module=>{
        if(generation!==slideGeneration)return;
        disposeInteraction=module.mountTokens(content,slide.svg);
      }).catch(error=>{console.error(error);toast('星云加载失败，已保留原图。');});
    }
    if(slide.interactive==='neural'){
      import('/slides/ai/survival-202608/neural.js?v=20261112-bi4').then(module=>{
        if(generation!==slideGeneration)return;
        disposeInteraction=module.mountNeural(content,slide.svg);
      }).catch(error=>{console.error(error);toast('动画加载失败，已保留原图。');});
    }
    if(slide.interactive==='gradient'){
      import('/slides/ai/survival-202608/gradient.js?v=20261112-bi4').then(module=>{
        if(generation!==slideGeneration)return;
        disposeInteraction=module.mountGradient(content,slide.svg);
      }).catch(error=>{console.error(error);toast('互动加载失败，已保留原图。');});
    }
    content.dataset.pdfPage=String(slide.n);
    stage.setAttribute('aria-label',slide.title+'，原 PDF 第 '+slide.n+' 页');
    stage.classList.remove('entering');void stage.offsetWidth;stage.classList.add('entering');
    clearTimeout(enteringTimer);enteringTimer=setTimeout(()=>stage.classList.remove('entering'),450);
    $('current').textContent=current+1;$('total').textContent=slides.length;$('source-page').textContent='PDF '+slide.n;
    $('prev').disabled=current===0;$('next').disabled=current===slides.length-1;
    if(content.querySelector('[aria-hidden="true"][style*="hidden"]'))$('next').disabled=false;
    $('progress-fill').style.width=((current+1)/slides.length*100)+'%';
    setBi($('chapter-label'),chapter.en,chapter.title);$('chapter-en').textContent=chapter.en;
    document.documentElement.style.setProperty('--accent',chapter.color);
    document.title=slide.title+' · '+editionLabel+' · 于快';
    if(hash)history.replaceState(null,'','#s'+slide.n);
    storage.set(storageKey('last-page'),String(slide.n));
    document.querySelectorAll('.chapter-option').forEach(b=>b.classList.toggle('active',b.dataset.chapter===chapter.id));
    document.querySelectorAll('.thumb').forEach(b=>b.classList.toggle('active',+b.dataset.page===slide.n));
    // Only current content is mounted. Preload original art for the adjacent page.
    const next=slides[current+1];
    if(next){const parser=new DOMParser().parseFromString(next.svg,'image/svg+xml');parser.querySelectorAll('image').forEach(node=>{const im=new Image();im.src=node.getAttribute('href');});}
  }
  function goPdf(n,{hash=true,notify=false}={}) {const i=slides.findIndex(s=>s.n===n);if(i<0){if(notify)toast('该原 PDF 页未纳入放映。');return false;}setSlide(i,{hash});return true;}
  function next(){if(revealNext())return;if(current<slides.length-1)setSlide(current+1);}function prev(){if(hidePrevious())return;if(current>0)setSlide(current-1);}
  $('next').addEventListener('click',next);$('prev').addEventListener('click',prev);
  addEventListener('hashchange',()=>{const n=Number(location.hash.replace(/^#s/,''));if(!goPdf(n,{hash:false,notify:true}))setSlide(current);});
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewport').requestFullscreen();}catch{toast('此浏览器暂不支持全屏，可横屏放映。');}}
  $('fullscreen').addEventListener('click',fullscreen);
  function buildOverview(){if(overviewBuilt)return;overviewBuilt=true;for(const [index,s] of slides.entries()){const b=document.createElement('button');b.type='button';b.className='thumb';b.dataset.page=s.n;b.dataset.search=(s.n+' '+s.title+' '+s.text+' '+(s.studentTask||'')).toLowerCase();b.setAttribute('aria-label','原 PDF 第 '+s.n+' 页：'+s.title);const img=new Image();img.src=s.thumb;img.alt='';img.loading='lazy';img.width=320;img.height=180;const caption=document.createElement('span'),number=document.createElement('b');number.textContent=String(s.n).padStart(2,'0');caption.append(number);const words=document.createElement('span');words.className='thumb-title';setBi(words,s.titleEn,s.titleZh||s.title);caption.append(words);b.append(img,caption);b.addEventListener('click',()=>{setSlide(index);$('overview').close();});$('overview-grid').append(b);} }
  function showOverview(){buildOverview();openPanel('overview','overview-toggle');document.querySelectorAll('.thumb').forEach(b=>b.classList.toggle('active',+b.dataset.page===slides[current].n));}
  $('overview-toggle').addEventListener('click',showOverview);
  $('search').addEventListener('input',()=>{const q=$('search').value.trim().toLowerCase();let count=0;document.querySelectorAll('.thumb').forEach(b=>{const match=/^\d+$/.test(q)?b.dataset.page===q:b.dataset.search.includes(q);b.hidden=!match;if(match)count++;});$('overview-grid').querySelector('.no-results')?.remove();if(!count){const p=document.createElement('p');p.className='no-results';setBi(p,'No matching slides.','没有找到匹配的页面。');$('overview-grid').append(p);}});
  $('chapters-toggle').addEventListener('click',()=>openPanel('chapters','chapters-toggle'));
  function showText(){const s=slides[current];setBi($('text-title'),s.titleEn,s.titleZh||s.title);$('text-content').innerHTML=(s.textExcerpt?bi('Text extracted from the original picture','图中文字摘录')+'<br><br>':'')+colorTranscript(s.text||'本页以原图呈现。');$('page-links').replaceChildren();for(const uri of s.originalLinks){const a=document.createElement('a');a.href=uri;a.target='_blank';a.rel='noopener noreferrer';a.textContent=uri;$('page-links').append(a);}openPanel('transcript','text-toggle');}
  $('text-toggle').addEventListener('click',showText);
  $('student-task-toggle')?.addEventListener('click',()=>{
    const s=slides[current];setBi($('student-task-title'),s.titleEn,s.titleZh||s.title);
    setBi($('student-task-content'),s.studentTaskEn||'Explain this slide in your own words.',s.studentTask||'试着用自己的话解释这一页。');
    $('student-task-links').replaceChildren();
    for(const uri of s.originalLinks||[]){const a=document.createElement('a');a.href=uri;a.target='_blank';a.rel='noopener noreferrer';
      setBi(a,...(uri.includes('/cycling/')?['Open the cycling metabolism simulator ↗','打开骑行能量代谢模拟器 ↗']:uri.includes('/homeostasis/')?['Open the homeostasis simulator ↗','打开稳态模拟器 ↗']:uri==='https://www.kuaiyu.site/'?['Visit Kuai Yu’s website ↗','打开于快的网站 ↗']:['Open reference ↗','打开本页参考链接 ↗']));$('student-task-links').append(a);}
    openPanel('student-task','student-task-toggle');
  });
  $('help-toggle').addEventListener('click',()=>toggleDialog('help'));
  function toggleLaser(){laser=!laser;$('laser-toggle').setAttribute('aria-pressed',String(laser));stage.classList.toggle('laser-on',laser);$('laser').hidden=true;}
  $('laser-toggle').addEventListener('click',toggleLaser);
  stage.addEventListener('pointermove',e=>{if(!laser)return;const r=stage.getBoundingClientRect();$('laser').hidden=false;$('laser').style.left=(e.clientX-r.left)+'px';$('laser').style.top=(e.clientY-r.top)+'px';});
  stage.addEventListener('pointerleave',()=>{$('laser').hidden=true;});
  stage.addEventListener('touchstart',e=>{if(e.target.closest('.slide-media,.gradient-lab,.neural-lab,.nn-return,.descent-lab,.gd-return,.tokens-lab,.tk-return')){touchStart=null;return;}if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  stage.addEventListener('touchend',e=>{if(!touchStart||laser)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){dx<0?next():prev();}},{passive:true});
  $('page-jump').addEventListener('click',()=>{$('jump-error').textContent='';$('jump-input').value=slides[current].n;toggleDialog('jump');$('jump-input').select();});
  $('jump-form').addEventListener('submit',e=>{e.preventDefault();if(goPdf(Number($('jump-input').value))){$('jump').close();}else setBi($('jump-error'),'This page is excluded. Choose another page.','该页未纳入放映，请选择其他页码。');});
  document.addEventListener('keydown',e=>{if(!slides.length||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,.slide-media,.gradient-lab,.gl-return,.neural-lab,.nn-return,.descent-lab,.gd-return,.tokens-lab,.tk-return')||document.querySelector('dialog[open]'))return;switch(e.key){case'ArrowRight':case'ArrowDown':case'PageDown':case' ':e.preventDefault();next();break;case'ArrowLeft':case'ArrowUp':case'PageUp':e.preventDefault();prev();break;case'Home':e.preventDefault();setSlide(0);break;case'End':e.preventDefault();setSlide(slides.length-1);break;case'f':case'F':fullscreen();break;case'o':case'O':showOverview();break;case'm':case'M':openPanel('chapters','chapters-toggle');break;case't':case'T':showText();break;case'l':case'L':toggleLaser();break;case'?':toggleDialog('help');}});
  // Quiet portal-style network animation. Its time stops while paused or hidden.
  const canvas=$('ambient'),ctx=canvas.getContext('2d');let raf=0,last=0,phase=0,w=0,h=0;
  function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);drawAmbient(performance.now());}
  function drawAmbient(now){cancelAnimationFrame(raf);if(!paused&&!document.hidden){phase+=Math.min(40,now-last||0)*.00012;}last=now;ctx.clearRect(0,0,w,h);const points=[];for(let i=0;i<43;i++){const side=i%2;const x=side?w-6-(i*71%110):6+(i*43%100);const y=(i*137%Math.max(h,1))+Math.sin(phase+i)*12;points.push([x,y]);}ctx.lineWidth=.7;for(let i=0;i<points.length;i++){const [x,y]=points[i];for(let j=i+1;j<points.length;j++){const [x2,y2]=points[j],dist=Math.hypot(x-x2,y-y2);if(dist<125){ctx.strokeStyle='rgba(78,133,170,'+(1-dist/125)*.16+')';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}}ctx.fillStyle=i%5===0?'rgba(143,101,175,.4)':'rgba(81,147,178,.28)';ctx.beginPath();ctx.arc(x,y,i%5===0?2.4:1.4,0,Math.PI*2);ctx.fill();}if(!paused&&!document.hidden)raf=requestAnimationFrame(drawAmbient);}
  addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=performance.now();drawAmbient(last);syncSlideVideo();if(document.hidden)content.querySelector('.slide-media video')?.pause();});resize();applyMotion();

  function colorTranscript(value){return String(value).split('\n').map(line=>escapeText(line).replace(/[\u3000-\u9fff\uff00-\uffef]+|[^\u3000-\u9fff\uff00-\uffef]+/g,part=>'<span class="'+(/[\u3400-\u9fff]/.test(part)?'lang-zh':'lang-en')+'">'+part+'</span>')).join('\n');}
  function localizeUi(){
    const brand=document.querySelector('.deck-brand small');if(brand?.firstChild?.nodeType===3){const names=document.createElement('span');setBi(names,'Kuai Yu','于快',true);brand.firstChild.replaceWith(names);}

    for(const [id,icon,en,zh] of [['fullscreen','⛶','Fullscreen','全屏'],['overview-toggle','▦','Overview','总览'],['text-toggle','T','Text','文字'],['student-task-toggle','◎','Task','课堂任务'],['laser-toggle','⌖','Pointer','激光笔']]){const el=$(id);if(el)el.innerHTML=icon+' '+bi(en,zh,true);}
    const home=document.querySelector('.home-link>span:last-child');if(home)setBi(home,document.documentElement.dataset.edition?'Editions':'Course hub',document.documentElement.dataset.edition?'版本选择':'课件中心',true);
    const badge=document.querySelector('.edition-badge');if(badge)setBi(badge,document.documentElement.dataset.edition==='student'?'Student':'Teacher',document.documentElement.dataset.edition==='student'?'学生版':'教师版',true);
    for(const [sel,en,zh] of [['#chapters h2','Contents','章节目录'],['#overview h2','Slide overview','课件总览'],['#help h2','Presentation shortcuts','放映快捷键'],['#jump h2','Go to the original PDF page','跳转到原 PDF 页码'],['label[for="jump-input"]','Page (1–63)','页码（1–63）'],['#jump .primary','Go','前往']]){const el=document.querySelector(sel);if(el)setBi(el,en,zh,true);}
    const descriptions=[['Previous / next slide','上一页 / 下一页'],['First / last slide','第一张 / 最后一张'],['Fullscreen','全屏放映'],['Overview / contents','缩略图总览 / 章节目录'],['Slide text / pointer','本页文字 / 激光笔'],['Close panel or leave fullscreen','关闭面板或退出全屏']];
    document.querySelectorAll('#help dd').forEach((el,i)=>setBi(el,...descriptions[i]));
    setBi(document.querySelector('#help p'),'Swipe left or right on touchscreens. Click the page number to jump to an original PDF page.','触屏可左右轻扫翻页。点击页码可跳到原 PDF 对应页。');
    document.querySelector('#search').placeholder='Search / 搜索主题、关键词或 PDF 页码';
    const loading=content.querySelector('.loading');if(loading)setBi(loading,'Opening the slides…','正在打开课件…');
  }
  localizeUi();
  fetch(sourceURL).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(raw=>{const data=resolveSource(raw);deck=data;slides=data.slides;stage.style.backgroundImage='url("'+data.background+'")';for(const [i,c] of deck.chapters.entries()){const b=document.createElement('button');b.className='chapter-option';b.dataset.chapter=c.id;const number=document.createElement('span');number.className='number';number.textContent=String(i+1).padStart(2,'0');const label=document.createElement('span'),title=document.createElement('b'),subtitle=document.createElement('small');title.textContent=c.en;title.className='lang-en';subtitle.textContent=c.title;subtitle.className='lang-zh';label.append(title,subtitle);b.append(number,label);b.addEventListener('click',()=>{goPdf(c.start);$('chapters').close();});$('chapter-list').append(b);}const n=Number(location.hash.replace(/^#s/,''));if(!goPdf(n))setSlide(0);}).catch(error=>{content.replaceChildren();const p=document.createElement('p');p.className='loading';setBi(p,'Unable to load. Please refresh.','课件暂时未能加载，请刷新重试。');content.append(p);console.error('Slide loading failed',error);});
})();
