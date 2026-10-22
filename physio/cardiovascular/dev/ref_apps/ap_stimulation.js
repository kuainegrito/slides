/* Tap counts and seconds are pedagogical parameters, not a numerical excitability
   model. Successful APs replay the selected cell's existing trace as an example;
   the rolling response graph is deliberately unitless. No cached trace is edited. */
const STIM = {on:false, elapsed:0, lastAP:null, taps:[], events:[], history:[], count:0,
  phase:null, saved:null, lastSample:-1, feedbackUntil:0, apStartValue:0};
const STIM_WINDOW = 1200; // Display says 1 second; allow 200 ms of input grace.
const STIM_UPSTROKE = 0.45;
const STIM_AUTO_CYCLE = {san:9,purkinje:14}; // Teaching seconds; Purkinje is slower.
const ST = AP_LANG==='en' ? {
  enter:'Stimulation mode', leave:'Back to demo', button:'Stimulate · SPACE', reset:'Reset',
  names:{rest:'Rest',absolute:'Absolute refractory',relative:'Relative refractory',super:'Supernormal',sub:'Subnormal'},
  short:{rest:'Rest',absolute:'Absolute',relative:'Relative',super:'Supernormal',sub:'Subnormal'},
  need:n=>n===1?'Just 1 tap':`${n} taps / 1 second`, blocked:'No stimulus can trigger an AP', count:n=>`${n} AP${n===1?'':'s'}`,
  ready:'Tap twice within 1 second to trigger an AP.', wait:'Blocked: channels are still unavailable. Try again as they recover.',
  partial:(n,k)=>`Subthreshold · ${n}/${k} taps. Keep tapping!`, fired:'AP triggered! Try stimulating again now.',
  auto:'Spontaneous AP · the pacemaker fires without a tap.', expired:'The taps have faded. Try a faster burst.',
  window:'Taps in the last 1 second', help:'How this exercise works',
  note:'Slowed teaching exercise · response is schematic; membrane and channel readouts replay a representative AP.',
  detail:'Tap within 1 second: rest needs 2; absolute refractoriness blocks all taps; relative refractoriness needs 3. The supernormal window needs just one tap. A new AP joins the current response and replaces its remaining recovery tail; AP heights are not added together. Only a fresh tap can trigger an evoked AP. Holding SPACE does not repeat. Seconds and tap counts are exercise settings, not physiological measurements. Reset, cell changes and mode changes clear the exercise.',
  nerve:'Nerve: 1 tap in the supernormal period, then 4 in the subnormal period. These optional after-effects illustrate a myelinated axon recovery cycle; the original HH trace does not model them.',
  purkinje:'Purkinje fibres depolarize automatically and fire every 14 exercise seconds, slower than the sinoatrial cell. An evoked AP restarts the cycle. This illustrates intrinsic pacemaking; in the heart, faster upstream impulses normally drive them. Includes a supernormal window (1 tap).',
  other:'This cell exercise includes absolute and relative refractoriness, then rest; no universal supernormal period is assumed.',
  san:'Sinoatrial cells depolarize automatically between APs and fire every 9 exercise seconds unless an evoked AP restarts the cycle. There is no stable resting potential.',
  pacing:'Automatic depolarization',pacingShort:'Automatic',autoReady:'Depolarizing automatically. You can also tap to stimulate.',
  autoNext:s=>`Auto AP in ${s.toFixed(1)} s`,superReady:'Supernormal window · tap once now!',
  source:'Recovery-cycle physiology', graph:'Schematic response', axis:'Exercise time / s',
  key:'Red: AP · amber: subthreshold · gray: blocked', until:s=>`Next phase in ${s.toFixed(1)} s`,
  representative:'Representative AP replay', title:'Stimulation & recovery', replayTime:'Replay time t',
  explain:{rest:'Excitability has returned to baseline. Two weak stimuli within 1 second reach the exercise threshold.',
    absolute:'The channels carrying the AP upstroke are unavailable after activation and inactivation. Increasing stimulus strength cannot elicit a second AP.',
    relative:'Some channels have recovered, but excitability is still reduced. Tap 3 times within 1 second to elicit another AP. Its upstroke begins at the current response level, interrupting recovery from the preceding AP.',
    super:'Excitability briefly exceeds baseline. A weak stimulus can now reach threshold: one tap is enough in this exercise. This after-effect depends on the tissue.',
    sub:'Excitability falls below baseline during the late after-effect, associated with persistent potassium conductance. Four taps are needed before baseline excitability returns.'}
} : {
  enter:'刺激模式',leave:'返回演示',button:'施加刺激 · 空格',reset:'重置',
  names:{rest:'静息期',absolute:'绝对不应期',relative:'相对不应期',super:'超常期',sub:'低常期'},
  short:{rest:'静息',absolute:'绝对',relative:'相对',super:'超常',sub:'低常'},
  need:n=>n===1?'只需按 1 次':`1 秒内 ${n} 次`,blocked:'再强的刺激也不能触发 AP',count:n=>`${n} 次 AP`,
  ready:'1 秒内连按 2 次，触发一次 AP。',wait:'未触发：通道尚未恢复。等恢复一些再试。',
  partial:(n,k)=>`阈下刺激 · ${n}/${k} 次，继续快按！`,fired:'已触发 AP！现在再刺激试试。',
  auto:'自发 AP · 起搏细胞不需要外加刺激。',expired:'刺激已消退，试着按快一些。',
  window:'最近 1 秒内的刺激',help:'练习说明',
  note:'慢放教学练习 · 波形为示意；膜动画与通道读数回放代表性 AP。',
  detail:'1 秒内完成连按：静息需 2 次；绝对不应期不能触发；相对不应期需 3 次。超常窗口只需按 1 次。新 AP 从当前反应水平接续，替代前一次 AP 尚未完成的恢复段，不把两个 AP 的高度相加。诱发 AP 必须有新的按下动作，长按空格不会连发。秒数和按键次数是练习参数，不是生理测量值。重置、换细胞或切换模式会清空练习。',
  nerve:'神经：超常期只需 1 次，之后低常期需 4 次。这两段示意有髓轴突的恢复周期；原 HH 波形模型并未模拟这些后效应。',
  purkinje:'浦肯野纤维会自动去极化，每 14 个教学秒自发一次 AP，比窦房结慢；诱发 AP 会重新计时。这里展示其固有自律性，在完整心脏中通常由更快的上游冲动驱动。包含超常窗口（1 次即可）。',
  other:'此细胞练习依次展示绝对不应期、相对不应期和恢复；不假定所有细胞都有超常期。',
  san:'窦房结在两次 AP 之间自动去极化，每 9 个教学秒自发一次 AP，诱发 AP 会重新计时。它没有稳定的静息电位。',
  pacing:'自动去极化',pacingShort:'自律',autoReady:'正在自动去极化，也可以按键施加刺激。',
  autoNext:s=>`${s.toFixed(1)} 秒后自发 AP`,superReady:'超常窗口 · 现在只需按 1 次！',
  source:'恢复周期的生理依据',graph:'膜反应示意',axis:'练习时间 / 秒',
  key:'红：AP · 橙：阈下 · 灰：阻断',until:s=>`${s.toFixed(1)} 秒后进入下一期`,
  representative:'代表性 AP 回放',title:'刺激与兴奋性恢复',replayTime:'回放时间 t',
  explain:{rest:'兴奋性已恢复到基线。1 秒内累积两个弱刺激，即可达到本练习的触发阈值。',
    absolute:'承担 AP 上升支的通道在激活与失活后暂不可用。即使增加刺激强度，也不能产生第二个 AP。',
    relative:'部分通道已恢复，但兴奋性仍低于正常。1 秒内快按 3 次即可触发新 AP。新上升支从当前反应水平开始，接替前一次 AP 尚未完成的恢复段。',
    super:'兴奋性短暂高于正常，弱刺激也能达到阈值：本练习只需按 1 次。这种后效应与组织类型有关。',
    sub:'后效应晚段的兴奋性低于正常，与持续的钾电导有关。此时需快按 4 次，随后恢复基线。'}
};
const STIM_COLORS={rest:'#2f6fd0',absolute:'#b23b55',relative:'#ac650c',super:'#18865d',sub:'#8054b7'};
function stimProtocol(){
  const abs=['ventricle','purkinje'].includes(CELL.id)?4:CELL.id==='san'?3:2;
  const stages=[{key:'absolute',duration:abs,need:Infinity},{key:'relative',duration:2.8,need:3}];
  if(['nerve','purkinje'].includes(CELL.id)) stages.push({key:'super',duration:2,need:1});
  if(CELL.id==='nerve') stages.push({key:'sub',duration:2,need:4});
  return stages;
}
function stimPhase(){
  let age=STIM.lastAP===null?Infinity:STIM.elapsed-STIM.lastAP, start=0;
  for(const p of stimProtocol()){
    if(age<start+p.duration) return {...p,
      left:start+p.duration-age,progress:(age-start)/p.duration};
    start+=p.duration;
  }
  return {key:'rest',need:2,left:0,progress:0};
}
function stimMessage(message){
  $('stimFeedback').textContent=message;
  STIM.feedbackUntil=STIM.elapsed+1.5;
}
function stimPhaseName(key){return key==='rest'&&STIM_AUTO_CYCLE[CELL.id]?ST.pacing:ST.names[key];}
function stimPacingRange(){
  if(CELL.id==='san') return {start:0,end:MK.tThr};
  if(CELL.id!=='purkinje') return null;
  // Reuse the diastolic limb starting at the maximum diastolic potential,
  // not the earlier repolarization crossing, which still falls afterward.
  let mdp=IDX(MK.tPeak);
  for(let i=mdp;i<TR.N;i++) if(TR.Vm[i]<TR.Vm[mdp]) mdp=i;
  return {start:TR.time[mdp],end:TR.time[TR.N-1]};
}
function resetStimulation(){
  Object.assign(STIM,{elapsed:0,lastAP:null,taps:[],events:[],history:[],count:0,phase:null,lastSample:-1,feedbackUntil:0,apStartValue:0});
  STIM.pacing=stimPacingRange();
  tNow=STIM.pacing?.start??0; naLoad=0; hoverI=null; lastPhase=-1;
  $('stimStages').innerHTML=stimProtocol().map(p=>`<span data-phase="${p.key}">${ST.short[p.key]}</span>`).join('')+
    `<span data-phase="rest">${STIM.pacing?ST.pacingShort:ST.short.rest}</span>`;
  $('stimCellNote').textContent=CELL.id==='san'?ST.san:CELL.id==='nerve'?ST.nerve:CELL.id==='purkinje'?ST.purkinje:ST.other;
  $('stimSource').href=CELL.id==='purkinje'?'https://pubmed.ncbi.nlm.nih.gov/2297816/':'https://pmc.ncbi.nlm.nih.gov/articles/PMC2075106/';
  stimMessage(STIM.pacing?ST.autoReady:ST.ready); updateStimulationUI(); updateDetail(true);
}
function setStimulation(on){
  if(on===STIM.on) return;
  if(on){STIM.saved={t:tNow,playing}; pause();}
  STIM.on=on;
  document.body.classList.toggle('stimulating',on);
  $('stimPanel').hidden=!on;
  $('modeBtn').textContent=on?ST.leave:ST.enter;
  $('modeBtn').setAttribute('aria-pressed',String(on));
  if(on) resetStimulation();
  else {tNow=Math.min(STIM.saved.t,TR.T-0.001);STIM.taps=[];if(STIM.saved.playing) play();}
  relayout(); syncScrub(); updateDetail(true); drawWave();
  apLog('stimulation_mode',{enabled:on});
}
function fireStimAP(source,phase){
  // Capture the complete response BEFORE replacing the old AP and consuming its
  // local stimuli. This joins an RRP re-excitation to the current level instead
  // of snapping to rest, erasing prior history, or adding two full AP waveforms.
  STIM.apStartValue=stimResponseValue();
  STIM.lastAP=STIM.elapsed; STIM.count++; STIM.taps=[];
  recordStimPoint(STIM.elapsed,STIM.apStartValue,'absolute');
  STIM.events.push({t:STIM.elapsed,type:'ap'});
  stimMessage(source==='automatic'?ST.auto:ST.fired);
  apLog('stimulation_ap',{source,period:phase,count:STIM.count});
}
function stimulate(source='button'){
  if(!STIM.on || document.hidden) return;
  const now=performance.now(), p=stimPhase();
  STIM.taps=STIM.taps.filter(t=>now-t<STIM_WINDOW);
  // Blocked taps must never carry over into recovery.
  if(p.key==='absolute'){
    STIM.taps=[]; STIM.events.push({t:STIM.elapsed,type:'blocked'});stimMessage(ST.wait);
  }else{
    STIM.taps.push(now);
    if(STIM.taps.length>=p.need) fireStimAP(source,p.key);
    else {STIM.events.push({t:STIM.elapsed,type:'sub'});stimMessage(ST.partial(STIM.taps.length,p.need));}
  }
  updateStimulationUI();
}
function stimTraceTime(){
  const cycle=STIM_AUTO_CYCLE[CELL.id],pace=STIM.pacing;
  if(STIM.lastAP===null) return pace?pace.start+(pace.end-pace.start)*Math.min(1,STIM.elapsed/cycle):0;
  const age=STIM.elapsed-STIM.lastAP, abs=stimProtocol()[0].duration;
  const start=MK.s2??MK.s??MK.tThr;
  const end=MK.tRepolEnd??MK.t3end??MK.CL;
  // Stretch the upstroke so one AP is perceptible; replay the original channel
  // states without presenting them as a solver for the tap-count thresholds.
  if(age<STIM_UPSTROKE) return start+(MK.tPeak-start)*age/STIM_UPSTROKE;
  if(age<abs) return MK.tPeak+(end-MK.tPeak)*(age-STIM_UPSTROKE)/(abs-STIM_UPSTROKE);
  if(pace) return pace.start+(pace.end-pace.start)*Math.min(1,(age-abs)/(cycle-abs));
  const finish=MK.tRecover??Math.min(TR.T-TR.sdt,end+TR.T*.08);
  return Math.min(TR.T-TR.sdt,end+(finish-end)*Math.min(1,(age-abs)/2.8));
}
function stimNormalizedValue(time){
  const rest=TR.Vm[IDX(STIM.pacing?.start??0)],peak=MK.vPeak??TR.Vm[IDX(MK.tPeak)];
  return (TR.Vm[IDX(time)]-rest)/Math.max(1,peak-rest);
}
function stimResponseValue(){
  let value=STIM.lastAP!==null||STIM.pacing?stimNormalizedValue(stimTraceTime()):0;
  const age=STIM.lastAP===null?Infinity:STIM.elapsed-STIM.lastAP;
  if(age<STIM_UPSTROKE){
    const start=stimNormalizedValue(MK.s2??MK.s??MK.tThr);
    const rise=clamp((value-start)/Math.max(1e-6,1-start),0,1);
    value=STIM.apStartValue+(1-STIM.apStartValue)*rise;
  }
  for(const e of STIM.events){
    const since=STIM.elapsed-e.t;
    if(e.type==='sub'&&e.t>(STIM.lastAP??-1)&&since>=0&&since<STIM_WINDOW/1000) value+=.12*Math.exp(-since/.35);
  }
  return value;
}
function recordStimPoint(t,v,phase){
  const last=STIM.history.at(-1),point={t,v,phase};
  if(last&&last.t===t) STIM.history[STIM.history.length-1]=point;
  else STIM.history.push(point);
  STIM.lastSample=t;
}
function updateStimulationUI(){
  const p=stimPhase(), now=performance.now(), before=STIM.taps.length;
  STIM.taps=STIM.taps.filter(t=>now-t<STIM_WINDOW);
  if(before && !STIM.taps.length && STIM.elapsed>=STIM.feedbackUntil) stimMessage(ST.expired);
  $('stimPanel').style.setProperty('--stim-color',STIM_COLORS[p.key]);
  if(STIM.phase!==p.key){
    STIM.phase=p.key;
    $('stimPhase').textContent=stimPhaseName(p.key);
    $('stimPanel').classList.toggle('superReady',p.key==='super');
    if(p.key==='super') stimMessage(ST.superReady);
    $('stimStages').querySelectorAll('span').forEach(el=>el.classList.toggle('active',el.dataset.phase===p.key));
  }
  $('stimNeed').textContent=p.need===Infinity?ST.blocked:ST.need(p.need);
  $('stimCount').textContent=ST.count(STIM.count);
  $('stimNext').textContent=p.left?ST.until(p.left):STIM_AUTO_CYCLE[CELL.id]?
    ST.autoNext(Math.max(0,STIM_AUTO_CYCLE[CELL.id]-(STIM.elapsed-(STIM.lastAP??0)))):'';
  $('stimDots').querySelectorAll('i').forEach((el,i)=>{
    el.classList.toggle('needed',i<p.need&&p.need!==Infinity);
    el.classList.toggle('filled',i<STIM.taps.length);
  });
  $('stimMeter').setAttribute('aria-valuenow',STIM.taps.length);
  $('stimMeter').setAttribute('aria-valuetext',`${STIM.taps.length} / ${p.need===Infinity?'∞':p.need}`);
  const remaining=STIM.taps.length?Math.max(0,1-(now-STIM.taps[0])/STIM_WINDOW):0;
  $('stimWindow').firstElementChild.style.transform=`scaleX(${remaining})`;
  if(STIM.elapsed>=STIM.feedbackUntil){
    $('stimFeedback').textContent=p.key==='absolute'?ST.wait:p.key==='super'?ST.superReady:
      STIM.taps.length?ST.partial(STIM.taps.length,p.need):p.key==='rest'?
      (STIM.pacing?ST.autoReady:ST.ready):stimPhaseName(p.key)+' · '+ST.need(p.need);
  }
}
function stepStimulation(dt){
  if(document.hidden) return;
  const previous=STIM.elapsed;
  STIM.elapsed+=dt;
  // Keep the exact peak when a frame spans it, so closely spaced APs stay
  // distinguishable even on a narrow display or a slower rendering frame.
  const peakAt=STIM.lastAP===null?Infinity:STIM.lastAP+STIM_UPSTROKE;
  if(previous<peakAt&&STIM.elapsed>=peakAt) recordStimPoint(peakAt,1,'absolute');
  const cycle=STIM_AUTO_CYCLE[CELL.id];
  if(cycle && STIM.elapsed-(STIM.lastAP??0)>=cycle) fireStimAP('automatic',stimPhase().key);
  tNow=stimTraceTime();
  updateStimulationUI();
  if(STIM.elapsed-STIM.lastSample>=.025){
    recordStimPoint(STIM.elapsed,stimResponseValue(),stimPhase().key);
  }
  STIM.history=STIM.history.filter(p=>p.t>STIM.elapsed-12);
  STIM.events=STIM.events.filter(p=>p.t>STIM.elapsed-12);
}
function drawStimWave(){
  const c=wctx,w=WW,h=WH,l=SMALL?12:20,r=w-12,top=26,bottom=h-27,span=12;
  const end=Math.max(span,STIM.elapsed+0.5),start=end-span;
  // Leave space below rest for the AHP/RRP tail rather than clipping it at the
  // bottom edge just where a second AP may begin.
  const x=t=>l+(t-start)/span*(r-l),y=v=>top+(bottom-top)*(.78-v*.68);
  c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,w,h);c.fillStyle='#fcfdff';c.fillRect(0,0,w,h);
  c.font=(SMALL?10:12)+'px "Segoe UI",sans-serif';c.fillStyle='#48607f';c.textAlign='left';
  c.fillText(ST.graph,l,15);c.textAlign='right';c.fillText(ST.axis,r,15);
  for(let t=Math.ceil(start/2)*2;t<=end;t+=2){
    c.strokeStyle='#e4ebf4';c.beginPath();c.moveTo(x(t),top);c.lineTo(x(t),bottom);c.stroke();
    c.fillStyle='#7d8fa8';c.textAlign='center';c.fillText(String(t),x(t),h-7);
  }
  c.save();c.beginPath();c.rect(l,top,r-l,bottom-top);c.clip();
  for(let i=1;i<STIM.history.length;i++){
    const a=STIM.history[i-1],b=STIM.history[i];c.fillStyle=STIM_COLORS[b.phase]+'16';
    c.fillRect(x(a.t),top,Math.max(1,x(b.t)-x(a.t)),bottom-top);
  }
  c.strokeStyle='#aebdd0';c.setLineDash([4,4]);c.beginPath();c.moveTo(l,y(0));c.lineTo(r,y(0));c.stroke();c.setLineDash([]);
  c.strokeStyle='#d6304c';c.lineWidth=2.5;c.lineJoin='round';c.beginPath();
  STIM.history.forEach((p,i)=>i?c.lineTo(x(p.t),y(p.v)):c.moveTo(x(p.t),y(p.v)));c.stroke();
  for(const e of STIM.events){
    c.fillStyle=e.type==='ap'?'#d6304c':e.type==='sub'?'#d89528':'#8593a6';
    c.fillRect(x(e.t)-1.5,bottom-5,3,5);
  }
  c.restore();
}
function initStimulation(){
  $('modeBtn').textContent=ST.enter;
  $('modeBtn').addEventListener('click',()=>setStimulation(!STIM.on));
  $('stimBtn').textContent=ST.button;$('stimReset').textContent=ST.reset;
  $('stimBtn').addEventListener('click',()=>stimulate());
  $('stimReset').addEventListener('click',resetStimulation);
  $('stimHelpTitle').textContent=ST.help;$('stimNote').textContent=ST.note;
  $('stimHelpText').textContent=ST.detail;$('stimKey').textContent=ST.key;
  $('stimSource').textContent=ST.source;
  $('stimMeter').setAttribute('aria-label',ST.window);
  $('stimPanel').setAttribute('aria-label',ST.enter);
  ['pPoints','pTips','modelNote'].forEach(id=>$(id).closest('.sec').classList.add('stimDemoOnly'));
  $('stimHelp').addEventListener('toggle',relayout);
  document.addEventListener('visibilitychange',()=>{STIM.taps=[];lastTs=0;});
}
function updateStimDetail(){
  const p=stimPhase();
  $('pNum').textContent=ST.enter;
  $('pTime').textContent=STIM.elapsed.toFixed(1)+' s';
  $('pTitle').textContent=stimPhaseName(p.key);
  $('pSummary').textContent=p.key==='rest'&&STIM.pacing?(CELL.id==='san'?ST.san:ST.purkinje):ST.explain[p.key];
  const tag=p.need===Infinity?ST.blocked:ST.need(p.need);
  if($('pTags').textContent!==tag) $('pTags').innerHTML=`<span class="tag">${tag}</span>`;
}
