import {questionsForEdition,editionId,sessionId,validSession,request} from './schema.js?v=20261117-spending1';
const edition=editionId(),questions=questionsForEdition(edition);
document.querySelector('.survey-intro').textContent='About 3 minutes · 8 quick questions + optional gender and payment · '+(edition==='teacher'?'Teacher edition / 教师版':'Student edition / 学生版')+' · 约 3 分钟 · 8 道必答＋性别、付费两道自愿题';
const form=document.querySelector('#survey-form'),status=document.querySelector('#survey-status'),session=sessionId();
const key='ai-survey-v1-'+session;let saved=null;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const responseId=saved?.responseId||crypto.randomUUID();
// Persist before render so reload/retry keeps both response identity and option order.
try{localStorage.setItem(key,JSON.stringify({...saved,responseId}));}catch{}
function orderedOptions(q){
 if(!q.multi)return q.options;
 let seed=2166136261;for(const c of responseId+q.id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 const tail=new Set(['other','none','unsure']);const main=q.options.filter(x=>!tail.has(x[0]));
 for(let i=main.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[main[i],main[j]]=[main[j],main[i]];}
 return [...main,...q.options.filter(x=>tail.has(x[0]))];
}
function success(){form.hidden=true;document.querySelector('#survey-success').hidden=false;status.textContent='';}
if(!validSession(session)){status.textContent='Invalid session link. Please scan the classroom QR again. / 场次链接无效，请重新扫码。';}
else if(saved?.submitted){success();}
else{
 document.querySelector('#survey-session').textContent='Session / 场次：'+session;
 for(const [i,q] of questions.entries()){
  const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=(i+1)+'. '+q.title;field.append(legend);
  if(q.hint){const hint=document.createElement('p');hint.className='survey-hint';hint.textContent=q.hint;field.append(hint);}
  const grid=document.createElement('div');grid.className='survey-options';
  for(const [id,label] of orderedOptions(q)){const l=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span');input.type=q.multi?'checkbox':'radio';input.name=q.id;input.value=id;input.required=!q.multi&&!q.optional;if(q.id==='role'&&id===edition)input.checked=true;text.textContent=label;l.append(input,text);grid.append(l);
   input.addEventListener('change',()=>{if(!q.multi)return;const checked=[...grid.querySelectorAll('input:checked')];if(input.checked&&['none','unsure'].includes(id)){checked.forEach(x=>{if(x!==input)x.checked=false;});}else if(input.checked){checked.filter(x=>['none','unsure'].includes(x.value)).forEach(x=>x.checked=false);}if(q.max&&grid.querySelectorAll('input:checked').length>q.max){input.checked=false;status.textContent='Choose up to '+q.max+' options. / 最多选择 '+q.max+' 项。';}else status.textContent='';});}
  field.append(grid);if(q.conditional){field.hidden=true;field.dataset.conditional=q.id;}form.append(field);
 }
 const spendingField=form.querySelector('[data-conditional=spending]');function syncSpending(){const visible=form.querySelector('[name=paid]:checked')?.value==='current';spendingField.hidden=!visible;if(!visible)spendingField.querySelectorAll('input').forEach(input=>input.checked=false);}form.querySelectorAll('[name=paid]').forEach(input=>input.addEventListener('change',syncSpending));syncSpending();
 const button=document.createElement('button');button.type='submit';button.className='survey-submit';button.textContent='Send my answers / 提交回答';form.append(button);
 form.addEventListener('submit',async e=>{e.preventDefault();const answers={};for(const q of questions){const values=[...form.querySelectorAll('input[name="'+q.id+'"]:checked')].map(x=>x.value);if(!values.length&&q.optional)continue;if(!values.length){status.textContent='Please answer: '+q.title;form.querySelector('[name="'+q.id+'"]').focus();return;}answers[q.id]=q.multi?values:values[0];}
  button.disabled=true;status.textContent='Sending… / 正在提交…';try{try{localStorage.setItem(key,JSON.stringify({responseId}));}catch{}await request('/responses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session,responseId,answers})});try{localStorage.setItem(key,JSON.stringify({responseId,submitted:true}));}catch{}success();}catch(error){status.textContent=(error.name==='AbortError'?'Connection timed out. Retry safely; your answer will not be counted twice. / 连接超时，可安全重试，不会重复计数。':error.message);button.disabled=false;}});
}
