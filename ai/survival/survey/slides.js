import {setBilingualCopy} from '../edition-language.js?v=20261118-colors1';
import qrcode from './vendor/qrcode.js';
import {closingQuestion,questions,reflectionQuestions,editionId,sessionId,validSession,defaultSession,request} from './schema.js?v=20261120-closing1';
const css=new URL('./survey.css?v=20261120-closing1',import.meta.url).href;
export function addSurveySlides(data){
 if(data.openingVersion)return data;data.openingVersion='20261117-spending1';
 const chapter=data.slides[0].chapter;
 data.backupSlides=data.slides.filter(s=>[3,4].includes(s.n));
 data.slides=data.slides.filter(s=>![3,4,65,66,67,68].includes(s.n));
 const slide=(n,kind,title)=>({n,chapter,title,titleEn:title,titleZh:kind==='join'?'课前快问':kind==='reflection'?'反思、目标与讨论':kind==='gender'?'性别与使用习惯':'我们的 AI 画像',sourceLabel:'Live classroom poll',text:'Anonymous AI usage and reflection poll. 匿名课前使用与反思调查。',originalLinks:[],svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><rect width="960" height="540" fill="#eaf2f8"/></svg>',thumb:new URL('./thumb.svg',import.meta.url).href,interactive:'survey-'+kind});
 data.slides.splice(1,0,slide(65,'join','Before we begin · AI pulse'),slide(66,'results','Our AI portrait · Live results'),slide(67,'reflection','Our next step · Reflection and goals'),slide(68,'gender','Gender and AI habits · Class comparisons'));
 if(new URLSearchParams(location.search).get('backups')==='1'){
  data.slides=data.backupSlides.map(s=>({...s,chapter:'backups',sourceLabel:'Backup / 备份 · PDF '+s.n}));
  data.chapters=[{id:'backups',title:'开场备份',en:'Opening backups',start:3,color:'#6855b8'}];
 }
 return data;
}
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)setBilingualCopy(x,text);return x;}
function button(text,fn){const b=el('button','',text);b.type='button';b.addEventListener('click',fn);return b;}
function openSurveyEmail(root,status,session,{closing=false}={}){
  if(root.querySelector('.survey-email-form'))return;
  const panel=el('form','survey-email-form'),label=el('label','','Admin password / 管理密码 '),input=el('input');input.type='password';input.autocomplete='off';input.required=true;input.maxLength=256;input.setAttribute('aria-label','Admin password');label.append(input);
  const note=el('p','',closing
   ? 'Email only this session’s lecture highlights totals (CSV and JSON). / 仅发送本场次课末投票汇总（CSV 和 JSON）。'
   : 'Send this session’s aggregate CSV + JSON to kuainegrito@gmail.com from info@kuaiyu.site. No individual answers. / 仅发送本场次汇总，不含个人答卷。');
  const feedback=el('p');feedback.setAttribute('role','status');const send=el('button','','Send / 发送');send.type='submit';panel.append(label,note,send,button('Cancel / 取消',()=>{input.value='';panel.remove();}),feedback);if(closing)status.parentElement.after(panel);else status.after(panel);input.focus();
  panel.addEventListener('submit',async e=>{e.preventDefault();if(!validSession(session))return;send.disabled=true;feedback.textContent='Sending / 正在发送…';const password=input.value;input.value='';try{const data=await request(closing?'/email?poll=closing':'/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,password})});feedback.textContent=data.status==='accepted'?'Mail server accepted the message. Inbox delivery is not independently confirmed. / 邮件服务器已接受发送，尚未确认收件箱投递。':'Request received. / 请求已收到。';send.hidden=true;input.disabled=true;}catch(error){feedback.textContent=error.name==='AbortError'?'Request timed out. Delivery may be pending; check your inbox before retrying. / 请求超时，可能仍在发送，请先检查邮箱再重试。':error.message;send.disabled=false;}});
 }
function mountClosingSurvey(host, kind) {
 const root=el('section','survey-lab');
 root.dataset.panel=kind;
 root.append(el('p','survey-eyebrow','LECTURE HIGHLIGHTS / 课末快问'));
 host.append(root);
 const session=sessionId();
 const status=el('p','survey-live-status');
 status.setAttribute('role','status');
 if(kind==='closing-join'){
  const layout=el('div','survey-join-grid'),copy=el('div','survey-join-copy');
  copy.append(el('h1','',closingQuestion.title.replace(' / ','\n')));
  copy.append(el('p','',closingQuestion.hint),el('p','','Results appear on the next slide. / 下一页公布本场汇总。'));
  layout.append(copy);
  root.append(layout,status);
  if(validSession(session)){
   const url=new URL('/slides/open_class/ai_survival/survey/',location.origin);
   url.searchParams.set('session',session);
   url.searchParams.set('poll','closing');
   const qr=el('a','survey-qr');
   qr.href=url.href;qr.target='_blank';qr.rel='noopener';
   const code=qrcode(0,'M');code.addData(url.href);code.make();
   qr.innerHTML=code.createSvgTag({cellSize:4,margin:16,scalable:true});
   qr.append(el('span','','Scan or click to vote / 扫码或点击投票'));
   layout.append(qr);
  }else setBilingualCopy(status,'Invalid session link. / 场次链接无效。');
  return ()=>root.remove();
 }
 const header=el('div','survey-results-head'),total=el('div','survey-total','—');
 header.append(el('h1','','What stood out today? / 哪些内容最令人印象深刻？'),total);
 const controls=el('div','survey-result-controls'),list=el('ol','survey-closing-results');
 controls.append(button('Refresh / 刷新',refresh),button('Email results / 发送结果',()=>openSurveyEmail(root,status,session,{closing:true})),status);
 root.append(header,controls,list,el('p','survey-small-note','Percent of respondents. Each person can choose up to three. / 比例以作答人数为分母，每人最多选三项。'));
 let busy=false,disposed=false,hasData=false;
 async function refresh(){
  if(busy||disposed)return;
  if(!validSession(session)){setBilingualCopy(status,'Invalid session link. / 场次链接无效。');return;}
  busy=true;
  try{
   const data=await request('/results?poll=closing&session='+encodeURIComponent(session));
   if(disposed)return;
   hasData=true;
   const n=Number(data.total)||0;
   total.replaceChildren(document.createTextNode(String(n)),el('small','','respondents / 人作答'));
   const counts=closingQuestion.options.map(([id,label])=>({label,count:Number(data.counts?.[id])||0})).sort((a,b)=>b.count-a.count);
   list.replaceChildren();
   if(n)for(const {label,count} of counts){
    const item=el('li','survey-closing-result');
    const share=Math.round(100*count/n);
    const track=el('div','survey-bar-track'),fill=el('div','survey-bar-fill');
    fill.style.width=share+'%';
    track.append(fill);
    item.append(el('span','survey-closing-label',label.replace(' / ','\n')),el('span','survey-closing-count',count+' · '+share+'%'),track);
    list.append(item);
   }
   setBilingualCopy(status,n?'Live · Updates every 5 seconds / 实时 · 每 5 秒更新':'Waiting for votes. / 等待投票。');
  }catch{
   if(!disposed)setBilingualCopy(status,hasData?'Refresh failed. Showing the last result. / 刷新失败，显示上次结果。':'Results unavailable. / 暂时无法读取结果。');
  }finally{busy=false;}
 }
 const timer=setInterval(refresh,5000);
 refresh();
 return ()=>{disposed=true;clearInterval(timer);root.remove();};
}
export function mountSurvey(host,kind){if(!document.querySelector('link[data-survey]')){const link=el('link');link.rel='stylesheet';link.href=css;link.dataset.survey='true';document.head.append(link);}
 if(kind==='closing-join'||kind==='closing-results')return mountClosingSurvey(host,kind);
 const edition=editionId(),reflection=kind==='reflection';const root=el('section','survey-lab');root.dataset.panel=kind;root.setAttribute('aria-label',kind==='join'?'Classroom questionnaire':'Live questionnaire results');host.append(root);let session=sessionId(),disposed=false,busy=false,poll=0,timer=0,remaining=180,running=false,lastData=null;const clean=[];
 root.append(el('p','survey-eyebrow','AI PULSE / 课前快问'));
 const status=el('p','survey-live-status');status.setAttribute('role','status');
 function updateUrl(){const u=new URL(location.href);u.searchParams.set('survey',session);history.replaceState(null,'',u);}
 function joinUrl(){const u=new URL('/slides/open_class/ai_survival/survey/',location.origin);u.searchParams.set('session',session);u.searchParams.set('edition',edition);return u.href;}
 function message(text,error=false){setBilingualCopy(status,text);status.dataset.error=String(error);}
 let total,grid,empty,role,topic,qr,link,behavior;
 function qrUpdate(){if(!validSession(session)){message('Invalid session. Use ai-survival-YYYYMMDD or a class suffix. / 场次编号无效。',true);return;}updateUrl();const code=qrcode(0,'M');code.addData(joinUrl());code.make();qr.innerHTML=code.createSvgTag({cellSize:4,margin:16,scalable:true});qr.append(el('span','', 'Scan to answer / 扫码作答'));qr.href=joinUrl();link.textContent=joinUrl();link.href=joinUrl();}
 if(kind==='join'){
  root.append(el('h1','','Before we begin / 先认识一下大家'));
  const layout=el('div','survey-join-grid'),copy=el('div','survey-join-copy'),right=el('div');copy.append(el('p','','How do you use AI? What excites or worries you?\n你如何使用 AI，又期待或担心什么？'));
  const tags=el('div','survey-join-tags');for(const t of ['Tools / 工具','Practice / 做法','Reflection / 反思','Goals / 目标'])tags.append(el('span','',t));copy.append(tags,el('p','','8 quick questions + optional gender and payment · About 3 minutes\n8 道必答＋性别、付费两道自愿题 · 约 3 分钟 · 自愿参与'));
  const controls=el('div','survey-host-controls'),clock=el('span','survey-countdown','03:00');const start=button('Start timer / 开始计时',()=>{running=!running;setBilingualCopy(start,running?'Pause / 暂停':'Continue / 继续');});controls.append(clock,start,button('Reset timer / 重置计时',()=>{remaining=180;running=false;clock.textContent='03:00';setBilingualCopy(start,'Start timer / 开始计时');}));copy.append(controls);
  timer=setInterval(()=>{if(running&&!document.hidden&&remaining>0){remaining--;clock.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');if(!remaining){running=false;setBilingualCopy(start,'Time is up / 时间到');}}},1000);
  qr=el('a','survey-qr');qr.target='_blank';qr.rel='noopener';qr.setAttribute('aria-label','Open questionnaire');link=el('a','survey-link');link.target='_blank';link.rel='noopener';right.append(qr,link);layout.append(copy,right);root.append(layout,status);
  const details=el('details','survey-host-details'),summary=el('summary','','Session settings / 场次设置');details.append(summary,el('p','','Both editions share this session with different reflection questions. Role is editable on the form. Use a new room for another class. / 两版本共享场次、反思题不同；身份可修改。另一班请新建场次，旧结果保留。'));const input=el('input');input.value=session;input.setAttribute('aria-label','Session identifier');details.append(input,button('Use session / 切换场次',()=>{if(!validSession(input.value)){message('Use ai-survival-YYYYMMDD[-class]. / 请使用规定场次格式。',true);return;}session=input.value;qrUpdate();refresh();}),button('New class / 新建场次',()=>{session=defaultSession()+'-'+Math.random().toString(36).slice(2,8);input.value=session;qrUpdate();refresh();}));root.append(details,el('p','survey-join-foot','No names or student IDs. Grouped results on the next slide. / 不询问姓名或学号；下一页看汇总结果。'));qrUpdate();
 }else{
  const head=el('div','survey-results-head'),heading=el('div');heading.append(el('h1','',reflection?'Our next step / 我们的下一步':kind==='gender'?'Gender & AI habits / 性别与使用习惯':'Our AI portrait / 我们的 AI 画像'));total=el('div','survey-total','—');head.append(heading,total);root.append(head);
  const prompt=el('p','survey-discussion',edition==='teacher'?'Discuss: what must remain your judgment? Today: understand, review and design one teaching task. / 讨论：哪个环节必须由你判断？今天从理解、核验走向一项教学任务的设计。':'Discuss: did AI give you an answer, or help you learn a method? Today: understand, check and create around one problem of your own. / 讨论：AI 让你拿到答案，还是学会方法？今天围绕自己的一个问题，理解、核验并创造。');if(reflection)root.append(prompt);const controls=el('div','survey-result-controls');role=el('select');role.setAttribute('aria-label','Filter by role');for(const [id,name] of [['all','Everyone / 全体'],...questions[0].options]){const o=el('option','',name);o.value=id;role.append(o);}topic=el('select');topic.setAttribute('aria-label','Word cloud topic');for(const [id,name] of [['concerns','Concerns cloud / 担忧词云'],['uses','Uses cloud / 用途词云']]){const o=el('option','',name);o.value=id;topic.append(o);}role.onchange=()=>render(lastData);topic.onchange=()=>render(lastData);topic.hidden=reflection||kind==='gender';behavior=el('select');behavior.setAttribute('aria-label','Comparison behavior');behavior.hidden=kind!=='gender';for(const q of questionsForComparison()){const option=el('option','',q.title);option.value=q.id;behavior.append(option);}behavior.onchange=()=>render(lastData);controls.append(behavior);controls.append(role,topic,button('Refresh / 刷新',refresh),button('Email results / 发送结果',()=>openSurveyEmail(root,status,session)));root.append(controls,status);empty=el('div','survey-empty');grid=el('div','survey-results-grid');root.append(empty,grid,el('p','survey-small-note','Live refresh every 5 s. Counts describe this room, not all students or teachers. Reflection charts describe self-reported practice, not competence. Multiple-choice percentages may exceed 100%. Word clouds use selected categories, not private free text. / 每 5 秒刷新；仅代表本场参与者；反思题为自述做法，不是能力评分；多选比例可超过 100%；词云来自选项标签。'));
 }
 function questionsForComparison(){return [...questions.filter(q=>['frequency','mode'].includes(q.id)),reflectionQuestions[edition][0]];}
 function render(data){if(!data)return;const view=role?.value==='all'||!role?data:data.countsByRole?.[role.value];const count=Number(view?.total)||0;const counts=view?.counts||{};total.replaceChildren(document.createTextNode(String(count)),el('small','','responses / 份回答'));grid.replaceChildren();grid.hidden=count===0;empty.hidden=count>0;setBilingualCopy(empty,count===0?'Waiting for responses in this group. Scan the opening QR slide. / 本组尚无回答，请扫描开场二维码。':'');
  if(kind==='gender'){
   const groups=role.value==='all'?data.countsByGender:data.countsByRoleByGender?.[role.value];const field=behavior.value,q=questionsForComparison().find(q=>q.id===field);const minimum=Math.max(5,Number(data.genderMinimum)||5);let shown=0;
   for(const [id,label]of questions.find(q=>q.id==='gender').options){if(id==='prefer_not')continue;const group=groups?.[id],values=group?.counts?.[field];if(!values)continue;const denominator=Object.values(values).reduce((a,n)=>a+(Number(n)||0),0);if(denominator<minimum)continue;shown++;const card=el('section','survey-chart');card.dataset.gender=id;card.append(el('h2','',label),el('p','survey-chart-meta',denominator+' answered / 人作答'));
    for(const [option,label]of q.options){const n=Number(values[option])||0,row=el('div','survey-bar-row'),track=el('div','survey-bar-track'),fill=el('div','survey-bar-fill');fill.style.width=n/denominator*100+'%';track.append(fill);row.append(el('span','survey-bar-label',label),track,el('span','survey-bar-number',n+' · '+Math.round(n/denominator*100)+'%'));card.append(row);}grid.append(card);
   }
   grid.hidden=shown===0;empty.hidden=shown>0;setBilingualCopy(empty,'Not enough answers for this comparison. Each displayed gender group needs at least '+minimum+' answers to this question. Skipped answers are excluded. / 当前数据不足；每个展示组在本题至少需 '+minimum+' 人作答。跳过者不参与比较。');
   const note=el('p','survey-comparison-note',(shown<2?'Fewer than two eligible groups: no between-group comparison yet. / 尚不足两个可展示组，暂不能组间比较。 ':'')+'\nDescriptive classroom responses only, not causal or population differences. Participation, role and prior experience may affect the pattern. / 仅描述本场自愿回答；不代表因果或总体差异，身份、经验等也会影响结果。');grid.append(note);if(!shown)empty.append(note);return;
  }
  for(const field of (reflection?reflectionQuestions[edition].map(q=>q.id):['models','frequency','mode','spending'])){const q=[...questions,...reflectionQuestions[edition]].find(x=>x.id===field),card=el('section','survey-chart');const denominator=field==='models'?count:Object.values(counts[field]||{}).reduce((a,n)=>a+(Number(n)||0),0);card.dataset.question=field;card.append(el('h2','',q.title.replace(/\? /g,' ')));card.append(el('p','survey-chart-meta',denominator+' answered / 人作答'+(denominator<count?' · Unanswered excluded / 未答不计入':'')+(q.id==='student_habit'||q.id==='teacher_review'?' · Self-report / 自述做法':'')));const entries=q.options.map(([id,name])=>({id,name,n:Number(counts[field]?.[id])||0}));if(field==='models'||field.startsWith('student_')||field.startsWith('teacher_'))entries.sort((a,b)=>b.n-a.n);for(const x of entries){if(field==='models'&&!x.n)continue;const row=el('div','survey-bar-row'),track=el('div','survey-bar-track'),fill=el('div','survey-bar-fill');fill.style.width=Math.min(100,x.n/(denominator||1)*100)+'%';track.append(fill);row.append(el('span','survey-bar-label',x.name),track,el('span','survey-bar-number',x.n+' · '+Math.round(x.n/(denominator||1)*100)+'%'));row.title=x.name+': '+x.n+' / '+denominator;card.append(row);}card.append(el('p','survey-chart-meta',field==='models'?'Multiple choice / 多选':'Single choice / 单选'));grid.append(card);}
  if(reflection)return;const field=topic.value,q=questions.find(x=>x.id===field),card=el('section','survey-chart'),cloud=el('div','survey-cloud');card.append(el('h2','',field==='concerns'?'What worries us / 我们的担忧':'What we use it for / 我们的用途'));const words=q.options.map(([id,name])=>({name,n:Number(counts[field]?.[id])||0})).filter(x=>x.n).sort((a,b)=>b.n-a.n);const max=Math.max(1,...words.map(x=>x.n));for(const [i,x] of words.entries()){const word=el('span','',x.name);word.style.fontSize=(12+13*x.n/max)+'px';word.style.color=['#7953a4','#286b92','#468181'][i%3];word.title=x.name+': '+x.n;cloud.append(word);}card.append(cloud,el('p','survey-chart-meta','Size = selection count / 字号代表选择人数'));grid.append(card);
 }
 async function refresh(){if(busy||disposed||!validSession(session))return;busy=true;try{const data=await request('/results?session='+encodeURIComponent(session));if(disposed)return;if(!Number.isInteger(data.total)||!data.counts)throw new Error('Invalid results response');lastData=data;if(kind!=='join')render(data);message((kind==='join'?data.total+' responses received / 已收到 '+data.total+' 份 · ':'')+'Updated / 更新 '+new Date().toLocaleTimeString()+' · '+session);}catch(e){if(disposed)return;message('Unable to refresh. '+(lastData?'Showing last received results. ':'No results loaded. ')+ ' / 刷新失败，'+(lastData?'保留上次结果。':'尚未载入结果。'),true);if(empty&&!lastData){empty.hidden=false;setBilingualCopy(empty,'Connection unavailable, not zero responses. Try Refresh. / 连接失败，并非零回答。请重试刷新。');grid.hidden=true;}}finally{busy=false;}}
 refresh();poll=setInterval(()=>{if(!document.hidden)refresh();},5000);return()=>{disposed=true;clearInterval(poll);clearInterval(timer);clean.forEach(fn=>fn());root.remove();};
}
