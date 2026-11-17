'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const crypto=require('node:crypto');const {createService,sessionValid}=require('./server.cjs');
const baseAnswers={role:'student',models:['chatgpt','deepseek'],paid:'never',mode:'chat',frequency:'daily',uses:['learning'],concerns:['accuracy','privacy']};
test('date validation',()=>{assert(sessionValid('ai-survival-20261116'));assert(!sessionValid('ai-survival-20260230'));assert(!sessionValid('../../etc/passwd'));});
test('persistent idempotent aggregate, validation, privacy and concurrency',async()=>{
const dir=await fs.mkdtemp(path.join(process.env.TEMP||os.tmpdir(),'survey-test-'));let server=createService({dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));let url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/';
const post=async(b,origin='https://www.kuaiyu.site')=>fetch(url+'responses',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(b)});
const b={session:'ai-survival-20261116-test',responseId:crypto.randomUUID(),answers:baseAnswers};
try{
assert.equal((await(await fetch(url+'results?session='+b.session)).json()).total,0);
assert.equal((await post(b)).status,200);assert.equal((await(await post(b)).json()).duplicate,true);
assert.equal((await post({...b,responseId:crypto.randomUUID(),answers:{...baseAnswers,uses:['none','learning']}})).status,400);
assert.equal((await post({...b,answers:{...baseAnswers,extra:'x'}})).status,400);
assert.equal((await post(b,'https://evil.example')).status,403);
assert.equal((await post({...b,session:'../../etc/passwd'})).status,400);
assert.equal((await post({...b,responseId:'<script>'})).status,400);
assert.equal((await fetch(url+'responses',{method:'POST',headers:{Origin:'https://www.kuaiyu.site','Content-Type':'application/json'},body:'x'.repeat(5000)})).status,413);
await Promise.all(Array.from({length:12},()=>post({...b,responseId:crypto.randomUUID()})));
let result=await(await fetch(url+'results?session='+b.session)).json();assert.equal(result.total,13);assert.equal(result.counts.models.chatgpt,13);assert.equal(result.countsByRole.student.total,13);assert(!('ids'in result));
await new Promise(r=>server.close(r));server=createService({dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/';assert.equal((await(await fetch(url+'results?session='+b.session)).json()).total,13);
const stored=await fs.readFile(path.join(dir,b.session+'.json'),'utf8');assert(!stored.includes(b.responseId));assert(!stored.includes('answers'));assert(!stored.includes('127.0.0.1'));
}finally{await new Promise(r=>server.close(r));}
});
test('storage and request limits',async()=>{const dir=await fs.mkdtemp(path.join(process.env.TEMP||os.tmpdir(),'survey-limit-'));const server=createService({dataDir:dir,maxResponses:1,maxSessions:1,postLimit:3});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/responses';const post=s=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://kuaiyu.site'},body:JSON.stringify({session:s,responseId:crypto.randomUUID(),answers:baseAnswers})});try{assert.equal((await post('ai-survival-20261116')).status,200);assert.equal((await post('ai-survival-20261116')).status,409);assert.equal((await post('ai-survival-20261117')).status,503);assert.equal((await post('ai-survival-20261117')).status,429);}finally{await new Promise(r=>server.close(r));}});

test('edition reflection pairs, optional payment, legacy migration and export denominators',async()=>{
 const dir=await fs.mkdtemp(path.join(process.env.TEMP||os.tmpdir(),'survey-opening-'));
 let server=createService({dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/';const session='ai-survival-20261117-qa-opening';
 const post=answers=>fetch(url+'responses',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.kuaiyu.site'},body:JSON.stringify({session,responseId:crypto.randomUUID(),answers})});
 try{
  assert.equal((await post(baseAnswers)).status,200);
  await new Promise(r=>server.close(r));
  const filename=path.join(dir,session+'.json'),legacy=JSON.parse(await fs.readFile(filename));
  delete legacy.countsByGender;delete legacy.countsByRoleByGender;
  for(const group of [legacy,...Object.values(legacy.countsByRole)])for(const key of ['student_habit','student_goal','teacher_review','teacher_goal'])delete group.counts[key];
  await fs.writeFile(filename,JSON.stringify(legacy));
  server=createService({dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/';
  const student={...baseAnswers,student_habit:'independent',student_goal:'create'};delete student.paid;
  assert.equal((await post(student)).status,200);
  assert.equal((await post({...baseAnswers,role:'teacher',teacher_review:'facts',teacher_goal:'design'})).status,200);
  for(const invalid of [{...baseAnswers,student_habit:'answer'},{...student,teacher_review:'facts',teacher_goal:'design'},{...student,student_goal:'private text'},{...student,paid:'invalid'}])assert.equal((await post(invalid)).status,400);
  const result=await(await fetch(url+'results?session='+session)).json();assert.equal(result.total,3);assert.equal(result.counts.student_habit.independent,1);assert.equal(result.counts.teacher_review.facts,1);assert.equal(result.counts.paid.never,2);assert.equal(result.countsByRole.teacher.counts.teacher_goal.design,1);
  assert.equal(Object.values(result.counts.student_goal).reduce((a,b)=>a+b),1);
  const csv=require('./email.cjs').csv(result);assert(csv.includes('student_goal'));assert(csv.includes('teacher_review'));
  const stored=await fs.readFile(filename,'utf8');assert(!stored.includes('answers'));assert(!stored.includes('private text'));
 }finally{await new Promise(r=>server.close(r));}
});

test('gender aggregate comparisons suppress small groups and sparse questions in API/export',async()=>{
 const dir=await fs.mkdtemp(path.join(process.env.TEMP||os.tmpdir(),'survey-gender-'));const server=createService({dataDir:dir});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/api/ai-survey/v1/',session='ai-survival-20261117-qa-gender';
 const post=answers=>fetch(base+'responses',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.kuaiyu.site'},body:JSON.stringify({session,responseId:crypto.randomUUID(),answers})});
 const read=async()=> (await fetch(base+'results?session='+session)).json();
 try{
  for(let i=0;i<4;i++)assert.equal((await post({...baseAnswers,gender:'female',student_habit:'independent',student_goal:'create'})).status,200);
  assert.deepEqual((await read()).countsByGender,{});
  assert.equal((await post({...baseAnswers,gender:'female',student_habit:'independent',student_goal:'create'})).status,200);
  for(let i=0;i<5;i++)await post({...baseAnswers,gender:'male',role:i===4?'teacher':'student',frequency:'weekly',teacher_review:'facts',teacher_goal:'design'});
  await post({...baseAnswers,gender:'prefer_not'});await post(baseAnswers);await post({...baseAnswers,gender:'nonbinary'});
  assert.equal((await post({...baseAnswers,gender:'private text'})).status,400);
  const result=await read();assert.equal(result.total,13);assert.deepEqual(Object.keys(result.countsByGender).sort(),['female','male']);assert.equal(result.countsByGender.female.counts.student_habit.independent,5);assert.equal(result.countsByGender.male.counts.frequency.weekly,5);assert.equal(result.countsByGender.male.counts.student_habit,undefined);assert.deepEqual(Object.keys(result.countsByRoleByGender.student),['female']);assert.deepEqual(result.countsByRoleByGender.teacher,{});
  const csv=require('./email.cjs').csv(result);assert(csv.includes('gender:female'));assert(!csv.includes('gender:nonbinary'));assert(!csv.includes('role:teacher/gender:male'));
  const stored=JSON.parse(await fs.readFile(path.join(dir,session+'.json')));assert.equal(stored.countsByGender.nonbinary.total,1);assert.equal(stored.countsByGender.prefer_not,undefined);assert(!('answers'in stored));assert(!('responses'in stored));
 }finally{await new Promise(r=>server.close(r));}
});

test('spending is optional and restricted to current payers',()=>{const {validate}=require('./server.cjs');const b={session:'ai-survival-20261117-test',responseId:crypto.randomUUID(),answers:{...baseAnswers,paid:'current',spending:'20to80'}};assert.doesNotThrow(()=>validate(b));assert.throws(()=>validate({...b,answers:{...b.answers,paid:'never'}}));assert.throws(()=>validate({...b,answers:{...b.answers,spending:'invalid'}}));assert.doesNotThrow(()=>validate({...b,answers:baseAnswers}));});
