(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const {title:course,slides} = window.lesson;
  const points = slides.flatMap((slide, index) => slide.steps.map((_, step) => ({index,step})));
  let cursor = 0, presenter, transition, hideTimer;
  const imageReady = new Map();
  function prepareImages(markup) {
    const source = document.createElement('template');
    source.innerHTML = markup;
    const pending = [];
    for (const el of source.content.querySelectorAll('image,img,video[poster]')) {
      const url = el.getAttribute('href') || el.getAttribute('xlink:href') || el.getAttribute('src') || el.getAttribute('poster');
      if (!url || url.startsWith('#') || el.localName === 'video' && !el.getAttribute('poster')) continue;
      const asset = el.localName === 'video' ? el.getAttribute('poster') : url;
      if (!imageReady.has(asset)) {
        const image = new Image();
        image.src = asset;
        imageReady.set(asset, image.decode().catch(() => {}));
      }
      pending.push(imageReady.get(asset));
    }
    return Promise.all(pending);
  }
  const core = [course === '胰岛素' ? '来源与结构' : '来源与种类','作用机制',...(slides.some(slide => slide.section === '生物作用') ? ['生物作用'] : []),'分泌调节'];
  function scale() {
    document.documentElement.style.setProperty('--scale', Math.min(document.documentElement.clientWidth / 1280, document.documentElement.clientHeight / 720));
  }
  function wake() {
    $('tools').classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => $('tools').classList.remove('visible'),1800);
  }
  function resolveHash() {
    const pair = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash);
    if (!pair) return 0;
    const i = Math.min(slides.length,Math.max(1,Number(pair[1]))) - 1;
    const j = Math.min(slides[i].steps.length,Math.max(1,Number(pair[2] || 1))) - 1;
    return points.findIndex(p => p.index === i && p.step === j);
  }
  const chalkDiagram = `<svg viewBox="0 0 720 490" role="img" aria-label="随讲稿步骤揭示的黑板机制图" style="width:100%;display:block"><defs><marker id="chalk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 1L9 5L0 9" fill="none" stroke="#c9e0d4"/></marker></defs><g data-at="11"><text x="365" y="32" text-anchor="middle" font-size="26" fill="currentColor">GC</text></g>
    <g data-at="53"><text x="596" y="327" text-anchor="middle" font-size="17" fill="currentColor">皮质醇</text></g>
    <g data-at="72"><text x="145" y="156" text-anchor="middle" font-size="17" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🟤</tspan> 肝糖异生 ↑</text></g>
    <g data-at="73"><text x="270" y="129" font-family="Segoe UI Emoji, sans-serif" font-size="31" aria-label="骨骼肌">💪</text><text x="344" y="150" text-anchor="middle" font-size="17" fill="currentColor">摄糖 ↓</text><text x="226" y="209" text-anchor="middle" font-size="17" fill="currentColor">血糖 ↑</text><path d="M164 164L207 191" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/><path d="M310 164L246 192" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="82"><text x="87" y="87" text-anchor="middle" font-size="17" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🟡</tspan> 脂肪分解</text><text x="72" y="121" text-anchor="middle" font-size="14" fill="currentColor">甘油</text><path d="M100 94L132 135" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="83"><text x="87" y="61" text-anchor="middle" font-size="13" fill="currentColor">长期过多：脂肪重新分布</text></g>
    <g data-at="91"><text x="344" y="101" text-anchor="middle" font-size="17" fill="currentColor">蛋白分解 ↑</text><text x="242" y="120" text-anchor="middle" font-size="14" fill="currentColor">生糖氨基酸</text><path d="M298 108Q253 111 167 137" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="101"><text x="222" y="255" text-anchor="middle" font-size="17" fill="currentColor">保障供糖</text><path d="M225 217V234" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/><text x="397" y="301" text-anchor="middle" font-size="17" fill="currentColor">应激适应</text><path d="M264 251L358 285" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="103"><text x="154" y="299" text-anchor="middle" font-size="17" fill="currentColor">允许作用 → 血管反应性 → 稳压</text><path d="M290 294H354" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="112"><text x="197" y="398" text-anchor="middle" font-size="16" fill="currentColor">其他组织效应</text><text x="197" y="423" text-anchor="middle" font-size="15" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🩸</tspan> 微血管｜炎症时通透性升高受抑 → 渗出 ↓</text><text x="197" y="446" text-anchor="middle" font-size="15" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🍽️</tspan> 胃腺｜胃酸、胃蛋白酶原分泌可 ↑</text><text x="197" y="469" text-anchor="middle" font-size="15" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🫘</tspan> 肾单位｜皮质醇显著过多 → 排钾 ↑ → 血钾可 ↓</text><rect x="10" y="376" width="374" height="105" rx="6" fill="none" stroke="currentColor" opacity=".45"/></g>
    <g data-at="121"><text x="159" y="342" text-anchor="middle" font-size="17" fill="currentColor">限制过度炎症 → 减轻组织损伤</text><path d="M289 337L358 309" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="131"><text x="596" y="64" text-anchor="middle" font-size="17" fill="currentColor">应激</text><text x="596" y="113" text-anchor="middle" font-size="17" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🧠</tspan> 下丘脑</text><text x="596" y="182" text-anchor="middle" font-size="17" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">💧</tspan> 腺垂体</text><text x="596" y="258" text-anchor="middle" font-size="17" fill="currentColor"><tspan font-family="Segoe UI Emoji, sans-serif" aria-hidden="true">🔺</tspan> 肾上腺皮质束状带</text><text x="564" y="151" text-anchor="middle" font-size="15" fill="currentColor">CRH</text><text x="560" y="220" text-anchor="middle" font-size="15" fill="currentColor">ACTH</text><path d="M596 71V92" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/><path d="M596 120V161" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/><path d="M596 188V236" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/><path d="M596 266V305" fill="none" stroke="currentColor" stroke-width="1.8" marker-end="url(#chalk-arrow)"/></g>
    <g data-at="132"><path d="M631 322H688V107H633 M688 176H633 M633 100V114 M633 169V183" fill="none" stroke="currentColor" stroke-width="1.8" /><text x="655" y="357" text-anchor="middle" font-size="15" fill="currentColor">负反馈</text></g>
    <g data-at="151"><g fill="#ffad92"><text x="623" y="326" font-size="21">↑</text><text x="581" y="222" font-size="21">↑</text><ellipse cx="587" cy="215" rx="11" ry="14" fill="none" stroke="#ffad92" stroke-width="2"/></g></g></svg>`;
  function updatePresenter() {
    if (!presenter || presenter.closed) return;
    const {index,step} = points[cursor], slide = slides[index], item = slide.steps[step];
    const get = id => presenter.document.getElementById(id);
    get('script-pane').scrollTop=0;
    get('pos').textContent = course+'  ·  '+slide.section+'  ·  第 '+(index+1)+' / '+slides.length+' 页，步骤 '+(step+1)+' / '+slide.steps.length+'  ·  细化版 '+(slide.old || '—');
    get('pace').textContent = item.pace || '';
    get('topic').textContent = slide.title;
    const words = get('words');
    const board = get('board');
    const cues = [].concat(item.inlineBoard || []);
    const parts = [];
    let offset = 0;
    for (const cue of cues) {
      const instruction = cue.text || item.board;
      const start = item.note.indexOf(cue.after, offset);
      if (!instruction || start < 0) continue;
      const end = start + cue.after.length;
      const reminder = presenter.document.createElement('span');
      reminder.className = 'inline-board';
      reminder.textContent = '【板书｜约 ' + cue.seconds + ' 秒　' + instruction + '】';
      parts.push(item.note.slice(offset, end), reminder);
      offset = end;
    }
    parts.push(item.note.slice(offset));
    const emphasized = parts.flatMap(part => {
      if (typeof part !== 'string' || !item.underline?.length) return [part];
      const matches = item.underline.map(text => ({ text, start: part.indexOf(text) }))
        .filter(match => match.start >= 0).sort((a, b) => a.start - b.start);
      const nodes = [];
      let cursor = 0;
      for (const { text, start } of matches) {
        const mark = presenter.document.createElement('u');
        mark.textContent = text;
        nodes.push(part.slice(cursor, start), mark);
        cursor = start + text.length;
      }
      nodes.push(part.slice(cursor));
      return nodes;
    });
    words.replaceChildren(...emphasized);
    board.hidden = parts.length > 0 || !item.board;
    board.textContent = board.hidden ? '' : item.board;
    const position=(index+1)*10+step+1;
    for (const group of get('chalkboard').querySelectorAll('[data-at]')) {
      const at=Number(group.dataset.at);
      group.style.display=at<=position?'':'none';
      group.style.color=at===position?'#ffe39a':'#dcefe8';
    }
    get('prev').disabled=cursor===0;
    get('advance').disabled=cursor===points.length-1;
    const next = points[cursor+1];
    get('next').textContent = next ? '下一步　'+slides[next.index].title+'　'+(slides[next.index].steps[next.step].caption||'') : '放映结束';
  }
  function draw() {
    const {index,step} = points[cursor], slide = slides[index], item = slide.steps[step];
    $('stage').className = [slide.full?'full':'',slide.doi?'research':''].join(' ');
    window.gcFX.clear();
    const ending=slide.section==='致谢';
    $('stage').classList.toggle('finale',ending);
    $('illustration').classList.toggle('live',!item.original);
    $('page-count').textContent=String(index+1).padStart(2,'0')+' / '+slides.length;
    $('course').textContent = index === 0 ? '生理学　·　第十一章' : '生理学　/　'+course;
    const chapters = core.includes(slide.section) ? core : [slide.section];
    $('chapters').replaceChildren(...chapters.map(name => {
      const label = document.createElement('span');
      label.textContent=name; if(name===slide.section) label.className='picked'; return label;
    }));
    $('title').textContent = slide.title;
    $('subtitle').textContent = slide.sub || '';
    if (!item.original) {
      window.originalLecture.clear();
      $('illustration').innerHTML = item.html || '';
      window.gcFX.mount($('illustration'),ending);
    } else {
      window.originalLecture.render(item.original, [slide.title,slide.sub].filter(Boolean).join(' · '));
    }
    $('caption').textContent = item.caption || '';
    $('citation').hidden = !slide.doi;
    if (slide.doi) {
      $('citation').querySelector('span').textContent = (slide.cite ? slide.cite+'　·　' : '')+'DOI';
      $('doi').textContent = slide.doi;
      $('doi').href = 'https://doi.org/'+slide.doi;
    }
    document.querySelector('[data-action=back]').disabled = cursor===0;
    document.querySelector('[data-action=forward]').disabled = cursor===points.length-1;
    document.title = course+' · '+slide.title;
    updatePresenter();
  }
  function go(where, animate = true) {
    const target = Math.max(0, Math.min(points.length-1,where));
    cursor = target;
    const {index,step} = points[cursor];
    const images = prepareImages(slides[index].steps[step].html);
    for (const next of points.slice(cursor+1,cursor+4)) prepareImages(slides[next.index].steps[next.step].html);
    const hash = '#'+(index+1)+'.'+(step+1);
    if(location.hash !== hash) location.replace(hash);
    if (transition) transition.skipTransition();
    if(animate && document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const running = document.startViewTransition(async () => { await images; draw(); });
      transition = running;
      running.finished.finally(() => { if(transition === running) transition=null; });
    } else draw();
  }
  function toggleOutline() {
    if ($('outline').open) return $('outline').close();
    const {index} = points[cursor];
    $('contents').replaceChildren();
    let group, lastSection;
    slides.forEach((s,i) => {
      if(lastSection !== s.section) {
        group = document.createElement('section');
        const title = document.createElement('h3');
        title.textContent = s.section;
        group.append(title); $('contents').append(group); lastSection=s.section;
      }
      const b = document.createElement('button');
      b.textContent = (i+1)+'　'+s.title+(s.sub ? ' · '+s.sub : '');
      if(index === i) b.className='current';
      b.onclick = () => { $('outline').close(); go(points.findIndex(p => p.index === i)); };
      group.append(b);
    });
    $('outline').showModal();
    $('contents').querySelector('.current')?.scrollIntoView({block:'nearest'});
  }
  const rehearsalDuration = 20 * 60 * 1000;
  let rehearsalRemaining = rehearsalDuration;
  let rehearsalDeadline = null;
  function setupRehearsal(window) {
    const doc = window.document;
    const time = doc.getElementById('rehearsal-time');
    const status = doc.getElementById('rehearsal-status');
    const toggle = doc.getElementById('rehearsal-toggle');
    function update() {
      if (rehearsalDeadline !== null) {
        rehearsalRemaining = Math.max(0, rehearsalDeadline - Date.now());
        if (rehearsalRemaining === 0) rehearsalDeadline = null;
      }
      const seconds = Math.ceil(rehearsalRemaining / 1000);
      const text = String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
      if (time.textContent !== text) time.textContent = text;
      const expired = seconds === 0;
      const label = expired ? '时间到' : '';
      if (status.textContent !== label) status.textContent = label;
      time.classList.toggle('expired', expired);
      toggle.textContent = rehearsalDeadline !== null ? '暂停' : expired ? '重新开始' : rehearsalRemaining < rehearsalDuration ? '继续' : '开始';
    }
    toggle.onclick = () => {
      update();
      if (rehearsalDeadline === null) {
        if (!rehearsalRemaining) rehearsalRemaining = rehearsalDuration;
        rehearsalDeadline = Date.now() + rehearsalRemaining;
      } else rehearsalDeadline = null;
      update();
    };
    doc.getElementById('rehearsal-reset').onclick = () => {
      rehearsalDeadline = null;
      rehearsalRemaining = rehearsalDuration;
      update();
    };
    update();
    window.setInterval(update, 250);
  }
  function openPresenter() {
    if (!presenter || presenter.closed) {
      presenter = window.open('','_blank','popup=yes,width=760,height=650');
      if (!presenter) return;
      presenter.document.open();
      presenter.document.write('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>教师讲稿</title><style>*{box-sizing:border-box}body{background:#f3f6f4;color:#15384a;font:19px/1.7 Microsoft YaHei,sans-serif;margin:0;padding:28px}small{color:#386989}h1{font-size:30px;line-height:1.3}article{font-size:24px;white-space:pre-line;color:#161616}.inline-board{color:#a32222;font-weight:700;margin:0 .22em;box-decoration-break:clone}aside{margin-top:12px;color:#7f3e1b;font-weight:600}footer{border-top:1px solid #bcccd0;margin:18px 0;font-size:16px;padding-top:10px}button{font:inherit;padding:6px 14px;margin:4px;border:1px solid #79919c;background:white;color:#143a52;border-radius:5px}body{height:100vh;height:100dvh;display:grid;grid-template-rows:minmax(0,1fr) auto auto;padding:0}main{overflow-y:auto;padding:22px 28px;scrollbar-gutter:stable}nav{display:flex;gap:12px;padding:8px 28px;border-top:1px solid #bcccd0;background:#f3f6f4}nav button{margin:0;min-width:0}nav #close-presenter{margin-left:auto}.rehearsal{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:7px 12px;background:#f3f6f4;border-top:1px solid #bcccd0;font-size:15px}.rehearsal output{min-width:5ch;font-size:23px;font-weight:700;font-variant-numeric:tabular-nums}.rehearsal button{margin:0;padding:4px 10px;min-width:5ch}.rehearsal .expired,.rehearsal #rehearsal-status{color:#a32222}@media(max-width:480px){nav{gap:6px;padding:8px}nav button{padding:6px;font-size:14px}}button:disabled{opacity:.5}section#chalkboard{background:#183e39;color:#f3f6ec;border-radius:8px;padding:12px 18px;margin-top:12px;font-size:17px}#chalk-title{text-align:center;font-weight:bold;font-size:25px}.chalk-cols{display:grid;grid-template-columns:1fr 1fr;gap:1em}.chalk-cols div div{white-space:pre-line;line-height:1.42;margin:.5em 0}.fresh{color:#ffde89}</style><main id="script-pane"><small id="pos"></small><div id="pace" style="color:#235b68;font-weight:650;font-variant-numeric:tabular-nums"></div><h1 id="topic"></h1><article id="words"></article><aside id="board"></aside><section id="chalkboard" aria-label="截至本步的板书">'+chalkDiagram+'</section><footer id="next"></footer></main><div class="rehearsal" role="group" aria-label="20 分钟排练倒计时"><span>排练模式</span><output id="rehearsal-time" role="timer" aria-live="off">20:00</output><button id="rehearsal-toggle" type="button">开始</button><button id="rehearsal-reset" type="button">重置</button><span id="rehearsal-status" role="status"></span></div><nav aria-label="讲稿翻页"><button id="prev">← 上一步</button><button id="advance">下一步 →</button><button id="close-presenter" aria-keyshortcuts="Escape P" title="Esc 或 P 返回放映">关闭讲稿</button></nav></html>');
      presenter.document.close();
      setupRehearsal(presenter);
      presenter.document.getElementById('prev').onclick = () => go(cursor-1);
      presenter.document.getElementById('advance').onclick = () => go(cursor+1);
      const closePresenter = () => {
        const windowToClose = presenter;
        presenter = null;
        windowToClose.close();
        window.focus();
      };
      presenter.document.getElementById('close-presenter').onclick = closePresenter;
      presenter.addEventListener('keydown',e => {
        if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
          e.preventDefault();
          if (!e.repeat) closePresenter();
          return;
        }
        if(['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();if(!e.repeat)go(cursor+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}
      });
    }
    updatePresenter(); presenter.focus();
  }
  const actions = {
    back:()=>go(cursor-1), forward:()=>go(cursor+1), replay:()=>go(cursor,false),
    outline:toggleOutline, close:()=>$('outline').close(), presenter:openPresenter,
    full:()=>(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{})
  };
  const touchControls = '#tools, dialog, a, button, input, select, textarea, video, iframe, [role="button"], [contenteditable]';
  let touchStart;
  document.addEventListener('touchstart', e => {
    touchStart = null;
    if (e.touches.length !== 1 || $('outline').open || e.target.closest(touchControls)) return;
    const { identifier, clientX, clientY } = e.touches[0];
    touchStart = { identifier, clientX, clientY };
  }, { passive: true });
  document.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  document.addEventListener('touchend', e => {
    const start = touchStart;
    touchStart = null;
    if (!start || e.touches.length || $('outline').open || e.target.closest(touchControls)) return;
    const end = [...e.changedTouches].find(touch => touch.identifier === start.identifier);
    if (!end) return;
    const dx = end.clientX - start.clientX, dy = end.clientY - start.clientY;
    let direction = 0;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > 1.35 * Math.abs(dy)) {
      direction = dx < 0 ? 1 : -1;
    } else if (Math.hypot(dx, dy) <= 12) {
      const width = window.visualViewport?.width || document.documentElement.clientWidth;
      const x = end.clientX - (window.visualViewport?.offsetLeft || 0);
      const edge = Math.min(width * .22, 100);
      if (x <= edge) direction = -1;
      if (x >= width - edge) direction = 1;
    }
    if (e.cancelable) e.preventDefault();
    if (direction) go(cursor + direction);
  }, { passive: false });
  document.addEventListener('click',e => {
    const b=e.target.closest('[data-action]');
    if(b) { const action=b.dataset.action;
      if(action==='back'||action==='forward') go(cursor+(action==='forward'?1:-1),false);
      else actions[action](); if(e.detail) b.blur(); return; }
    if(e.target.closest('a,button,input,select,video,dialog')) return;
    if(e.pointerType !== 'touch' && !e.sourceCapabilities?.firesTouchEvents && e.target.closest('#stage')) go(cursor+1);
  });
  document.addEventListener('keydown',e => {
    if(e.altKey || e.ctrlKey || e.metaKey) return;
    if($('outline').open) { if(e.key.toLowerCase()==='m') toggleOutline(); return; }
    if(e.target.closest('input,textarea,select') || (e.target.closest('video,button,a') && [' ','Enter'].includes(e.key))) return;
    const key=e.key.toLowerCase();
    const action=({' ':'forward',arrowright:'forward',arrowdown:'forward',pagedown:'forward',enter:'forward',arrowleft:'back',arrowup:'back',pageup:'back',r:'replay',f:'full',m:'outline',p:'presenter'})[key];
    if(action || key==='home' || key==='end'){
      e.preventDefault(); if(e.repeat) return;
      if(action) actions[action](); else go(key==='home'?0:points.length-1);
    }
  });
  window.addEventListener('message',e=>{
    const frame=$('illustration').querySelector('#homeoxnet-full');
    if(frame && e.source===frame.contentWindow && e.data?.type==='homeoxnet-slide' && [1,-1].includes(e.data.direction))go(cursor+e.data.direction);
  });
  const jumpNumber=$('jump-number');
  jumpNumber.max=String(slides.length);
  jumpNumber.title='输入 1 至 '+slides.length+' 的页码';
  $('page-jump').addEventListener('submit',event=>{
    event.preventDefault();
    const target=points.findIndex(point=>point.index===jumpNumber.valueAsNumber-1 && point.step===0);
    if(target<0)return;
    go(target,false);
    jumpNumber.value='';
    document.activeElement?.blur();
    wake();
  });
  window.addEventListener('resize',scale);
  window.addEventListener('hashchange',() => { const next = resolveHash(); if(next !== cursor) go(next,false); });
  window.addEventListener('pointermove',e => { if(e.clientY > innerHeight*.88) wake(); });
  window.addEventListener('pagehide',() => { if(presenter && !presenter.closed) presenter.close(); });
  scale(); go(resolveHash(),false); wake();
})();
