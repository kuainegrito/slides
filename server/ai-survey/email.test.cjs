'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {createEmail}=require('./email.cjs');const {createService}=require('./server.cjs');
const password=crypto.randomBytes(24).toString('hex');const salt=crypto.randomBytes(16).toString('hex');const config={salt,hash:crypto.scryptSync(password,salt,64).toString('hex'),smtp:{host:'smtp.example.invalid',port:465,secure:true,user:'info@kuaiyu.site',password:'fake-test-only'}};
const result={total:3,updatedAt:'2026-11-16T00:00:00Z',counts:{role:{teacher:3}},countsByRole:{teacher:{total:3,counts:{role:{teacher:3}}}},words:[]};
const dir=()=>fs.mkdtemp(path.join(process.env.TEMP,'survey-email-test-'));
test('fixed mail, aggregates only, cooldown and password failures',async()=>{let message;let time=Date.now();const dataDir=await dir();const email=createEmail({dataDir,now:()=>time,loadConfig:async()=>config,createTransport:()=>({sendMail:async m=>{message=m;return {accepted:['kuainegrito@gmail.com']};},close(){}})});const b={session:'ai-survival-20261116-mailqa',password};
for(let i=0;i<5;i++)await assert.rejects(email.send({...b,password:'wrong'},'bad',result),{status:403});await assert.rejects(email.send(b,'bad',result),{status:429});
assert.equal((await email.send(b,'good',result)).status,'accepted');assert.equal(message.to,'kuainegrito@gmail.com');assert.equal(message.from,'info@kuaiyu.site');assert.equal(message.attachments.length,2);assert(!JSON.stringify(message).includes(password));await assert.rejects(email.send(b,'good',result),{status:429});
const state=await fs.readFile(path.join(dataDir,'email-state.json'),'utf8');assert(!state.includes(password));assert(!state.includes(config.hash));assert(state.includes('accepted'));
});
test('SMTP uncertainty is retained and no retry is performed',async()=>{let n=0;const email=createEmail({dataDir:await dir(),loadConfig:async()=>config,createTransport:()=>({sendMail:async()=>{n++;throw Error('timeout');},close(){}})});const b={session:'ai-survival-20261116-failure',password};await assert.rejects(email.send(b,'key',result),{status:502});await assert.rejects(email.send(b,'key',result),{status:429});assert.equal(n,1);});
test('HTTP mail route validation/origin and fake acceptance',async()=>{const dataDir=await dir();let calls=0;const server=createService({dataDir,email:{send:async(b,key,r)=>{calls++;assert.equal(b.password,password);assert(!('ids'in r));return {status:'accepted'};}}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/email';const post=(b,origin='https://www.kuaiyu.site')=>fetch(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(b)});try{const b={session:'ai-survival-20261116',password};assert.equal((await post(b,'https://evil.invalid')).status,403);assert.equal((await post({...b,to:'evil@example.invalid'})).status,400);assert.equal((await(await post(b)).json()).status,'accepted');assert.equal(calls,1);}finally{await new Promise(r=>server.close(r));}});

test('closing email contains only the matching poll and uses respondent denominators',async()=>{
 const dataDir=await dir(),messages=[];
 let time=Date.now();
 const email=createEmail({dataDir,now:()=>time,loadConfig:async()=>config,createTransport:()=>({
  sendMail:async message=>{messages.push(message);return {accepted:['kuainegrito@gmail.com']};},close(){},
 })});
 const server=createService({dataDir,email});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/';
 const session='ai-survival-20261120-email-test',another=session+'-other';
 const post=(route,body)=>fetch(url+route,{method:'POST',headers:{
  Origin:'https://www.kuaiyu.site','Content-Type':'application/json',
 },body:JSON.stringify(body)});
 const vote=(session,answers,query='')=>post('responses'+query,{session,responseId:crypto.randomUUID(),answers});
 const request={session,password};
 try{
  await vote(session,{role:'teacher',models:['claude'],mode:'agent',frequency:'daily',uses:['teaching'],concerns:['accuracy']});
  assert.equal((await post('email?poll=closing',request)).status,409);
  await vote(session,{standout:['tokens','cardiac']},'?poll=closing');
  await vote(session,{standout:['tokens','cycling']},'?poll=closing');
  await vote(another,{standout:['comics']},'?poll=closing');
  assert.equal((await post('email',request)).status,200);
  time+=61000;
  assert.equal((await post('email?poll=closing',{...request,password:'not-the-password'})).status,403);
  assert.equal((await post('email?poll=closing',request)).status,200);
  const [opening,closing]=messages;
  assert.match(opening.subject,/AI classroom survey/);
  assert.match(closing.subject,/Lecture highlights/);
  assert.equal(closing.attachments[1].filename,'closing-'+session+'.json');
  const payload=JSON.parse(closing.attachments[1].content);
  assert.deepEqual(Object.keys(payload).sort(),['counts','poll','session','total','updatedAt']);
  assert.equal(payload.poll,'closing');
  assert.equal(payload.session,session);
  assert.equal(payload.total,2);
  assert.deepEqual(Object.keys(payload.counts),['standout']);
  assert.equal(payload.counts.standout.comics,0);
  assert.match(closing.attachments[0].content,/"all","standout","tokens","2","2","2","100"/);
  assert.match(closing.attachments[0].content,/"all","standout","cardiac","1","2","2","50"/);
  assert.equal((await post('email?poll=closing',request)).status,429);
  assert.equal(messages.length,2);
 }finally{await new Promise(r=>server.close(r));}
});
