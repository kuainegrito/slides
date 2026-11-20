'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const OPTIONS = {
 role:['student','teacher','both','other'],
 gender:['female','male','nonbinary','another','prefer_not'],
 models:['chatgpt','claude','gemini','deepseek','doubao','qwen','kimi','yuanbao','copilot','other','none','unsure'],
 paid:['current','past','institution','never','prefer_not'],
 spending:['under20','20to80','80to200','over200'],
 mode:['chat','assisted','agent','none','unsure'],
 frequency:['daily','weekly','monthly','rarely','never'],
 uses:['learning','writing','research','coding','teaching','admin','creative','life','none'],
 concerns:['accuracy','privacy','dependency','integrity','cost','skills','jobs','access','none'],
 student_habit:['answer','understand','verify','independent','none'],
 student_goal:['mechanism','study','verify','create','project','unsure'],
 teacher_review:['draft','facts','alignment','trial','none'],
 teacher_goal:['mechanism','design','feedback','verify','create','unsure']
};
const MULTI={models:12,uses:3,concerns:3};
const CLOSING_OPTIONS=['cover','lenet','gradient','tokens','context','mum','cycling','cardiac','workbench','culture','comics','student-work','ai-toolkit','agent-toolkit','zhao','reflection','other'];
const PREFIX='/api/ai-survey/v1/';
function fail(status,message){return Object.assign(new Error(message),{status});}
function sessionValid(s){
 if(typeof s!=='string'||!/^ai-survival-\d{8}(?:-[a-zA-Z0-9_-]{1,32})?$/.test(s)) return false;
 const d=s.slice(12,20); const iso=d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6,8);
 return !isNaN(Date.parse(iso)) && new Date(iso).toISOString().slice(0,10)===iso;
}
function validate(b,closing=false){
 if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!['session','responseId','answers'].includes(k))) throw fail(400,'Invalid request');
 if(!sessionValid(b.session)||typeof b.responseId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.responseId)) throw fail(400,'Invalid session or responseId');
 const a=b.answers;
 if(closing){
  const picks=a?.standout;
  if(!a||Object.keys(a).length!==1||!Array.isArray(picks)||!picks.length||picks.length>3||new Set(picks).size!==picks.length||picks.some(id=>!CLOSING_OPTIONS.includes(id))) throw fail(400,'Choose one to three lecture highlights');
  return b;
 }
 if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).some(k=>!Object.hasOwn(OPTIONS,k)))throw fail(400,'Invalid questions');
 const required=['role','models','mode','frequency','uses','concerns'];
 if(required.some(k=>!Object.hasOwn(a,k)))throw fail(400,'All core questions required');
 if(Object.hasOwn(a,'spending')&&a.paid!=='current')throw fail(400,'Spending requires current payment');
 const student=Object.hasOwn(a,'student_habit')||Object.hasOwn(a,'student_goal'),teacher=Object.hasOwn(a,'teacher_review')||Object.hasOwn(a,'teacher_goal');
 if(student&&teacher||student&&(!Object.hasOwn(a,'student_habit')||!Object.hasOwn(a,'student_goal'))||teacher&&(!Object.hasOwn(a,'teacher_review')||!Object.hasOwn(a,'teacher_goal')))throw fail(400,'Complete one reflection pair');
 for(const [k,opts] of Object.entries(OPTIONS)){
  if(!Object.hasOwn(a,k))continue;
  const vals=MULTI[k]?a[k]:[a[k]];
  if(!Array.isArray(vals)||!vals.length||vals.length>(MULTI[k]||1)||new Set(vals).size!==vals.length||vals.some(v=>!opts.includes(v)))throw fail(400,'Invalid '+k);
  if(vals.length>1&&(vals.includes('none')||(k==='models'&&vals.includes('unsure'))))throw fail(400,'Exclusive option in '+k);
 }
 return b;
}
function counts(){return Object.fromEntries(Object.entries(OPTIONS).map(([k,v])=>[k,Object.fromEntries(v.map(x=>[x,0]))]));}
const GENDERS=['female','male','nonbinary','another'];
function genderGroups(){return Object.fromEntries(GENDERS.map(g=>[g,{total:0,counts:counts()}]));}
function empty(){return {version:1,total:0,updatedAt:null,counts:counts(),countsByRole:Object.fromEntries(OPTIONS.role.map(r=>[r,{total:0,counts:counts()}])),countsByGender:genderGroups(),countsByRoleByGender:Object.fromEntries(OPTIONS.role.map(r=>[r,genderGroups()])),ids:[]};}
function publicGender(groups={}){return Object.fromEntries(Object.entries(groups).filter(([g,v])=>GENDERS.includes(g)&&v.total>=5).map(([g,v])=>[g,{total:v.total,counts:Object.fromEntries(Object.entries(v.counts).filter(([q,c])=>q!=='gender'&&(['models','uses','concerns'].includes(q)?v.total:Object.values(c).reduce((a,n)=>a+n,0))>=5))}]));}
function publicResult(s){return {total:s.total,updatedAt:s.updatedAt,counts:s.counts,countsByRole:s.countsByRole,countsByGender:publicGender(s.countsByGender),countsByRoleByGender:Object.fromEntries(OPTIONS.role.map(r=>[r,publicGender(s.countsByRoleByGender?.[r])])),genderMinimum:5,words:[]};}
function createService({dataDir,allowedOrigins=['https://www.kuaiyu.site','https://kuaiyu.site'],maxSessions=256,maxResponses=10000,postLimit=300,globalLimit=1200,email=null}={}){
 if(!dataDir)throw Error('dataDir required');
 let queue=Promise.resolve(); const salt=crypto.randomBytes(32); const buckets=new Map();
 const ready=fs.mkdir(dataDir,{recursive:true});
 const filename=(s,closing=false)=>path.join(dataDir,(closing?'closing-':'')+s+'.json');
 async function readClosing(s){
  await ready;
  try{
   const data=JSON.parse(await fs.readFile(filename(s,true),'utf8'));
   if(data.version!==1||!Array.isArray(data.ids))throw Error('Invalid store');
   return data;
  }catch(e){
   if(e.code!=='ENOENT')throw e;
   return {version:1,total:0,updatedAt:null,counts:Object.fromEntries(CLOSING_OPTIONS.map(id=>[id,0])),ids:[]};
  }
 }
 async function read(s){await ready;try{const v=JSON.parse(await fs.readFile(filename(s),'utf8'));if(v.version!==1||!Array.isArray(v.ids))throw Error('Invalid store');v.countsByGender??=genderGroups();v.countsByRoleByGender??=Object.fromEntries(OPTIONS.role.map(r=>[r,genderGroups()]));const defaults=counts();v.counts={...defaults,...v.counts};for(const role of OPTIONS.role)v.countsByRole[role].counts={...counts(),...v.countsByRole[role].counts};for(const groups of [v.countsByGender,...Object.values(v.countsByRoleByGender)])for(const group of Object.values(groups))group.counts={...counts(),...group.counts};return v;}catch(e){if(e.code==='ENOENT')return empty();throw e;}}
 function rate(key,limit){const now=Date.now();if(buckets.size>10000){for(const [k,v]of buckets)if(v.until<now)buckets.delete(k);if(buckets.size>10000)throw fail(429,'Busy, try later');}let v=buckets.get(key);if(!v||v.until<now){v={n:0,until:now+60000};buckets.set(key,v);}if(++v.n>limit)throw fail(429,'Too many requests, try in one minute');}
 async function save(b,closing=false){
  const run=async()=>{const s=await (closing?readClosing(b.session):read(b.session));const id=crypto.createHash('sha256').update(b.responseId.toLowerCase()).digest('hex');
   if(s.ids.includes(id))return {ok:true,duplicate:true,total:s.total};
   if(s.total>=maxResponses)throw fail(409,'Session response limit reached');
   if(s.total===0&&(await fs.readdir(dataDir)).filter(x=>x.endsWith('.json')).length>=maxSessions)throw fail(503,'Session storage full');
   s.ids.push(id);s.total++;s.updatedAt=new Date().toISOString();
   if(closing){
    for(const option of b.answers.standout)s.counts[option]++;
   }else{
    const r=s.countsByRole[b.answers.role];r.total++;
    for(const k of Object.keys(b.answers))for(const v of (MULTI[k]?b.answers[k]:[b.answers[k]])){s.counts[k][v]++;r.counts[k][v]++;}
    const gender=b.answers.gender;
    if(GENDERS.includes(gender))for(const groups of [s.countsByGender,s.countsByRoleByGender[b.answers.role]]){const group=groups[gender];group.total++;for(const [k,value]of Object.entries(b.answers)){if(k==='gender')continue;for(const v of (MULTI[k]?value:[value]))group.counts[k][v]++;}}
   }
   const dest=filename(b.session,closing);const tmp=dest+'.tmp';const h=await fs.open(tmp,'w',0o600);try{await h.writeFile(JSON.stringify(s));await h.sync();}finally{await h.close();}await fs.rename(tmp,dest);
   return {ok:true,duplicate:false,total:s.total};
  };const p=queue.then(run);queue=p.catch(()=>{});return p;
 }
 function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===429?{'Retry-After':'60'}:{})});res.end(JSON.stringify(data));}
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   const closing=url.searchParams.get('poll')==='closing';
   if(![PREFIX+'results',PREFIX+'responses',PREFIX+'health',PREFIX+'email'].includes(url.pathname))throw fail(404,'Not found');
   const peer=req.socket.remoteAddress||'';const ip=(['127.0.0.1','::1','::ffff:127.0.0.1'].includes(peer)?req.headers['x-real-ip']:null)||peer;
   const key=crypto.createHmac('sha256',salt).update(String(ip)).digest('hex');
   rate('global',globalLimit);rate(key,req.method==='POST'?postLimit:600);
   if(req.method==='GET'&&url.pathname===PREFIX+'health')return send(res,200,{ok:true});
   if(req.method==='GET'&&url.pathname===PREFIX+'results'){
    const s=url.searchParams.get('session');
    if(!sessionValid(s))throw fail(400,'Invalid session');
    if(closing){
     const {total,updatedAt,counts}=await readClosing(s);
     return send(res,200,{total,updatedAt,counts});
    }
    return send(res,200,publicResult(await read(s)));
   }
   if(req.method!=='POST'||![PREFIX+'responses',PREFIX+'email'].includes(url.pathname))throw fail(405,'Method not allowed');
   if(!allowedOrigins.includes(req.headers.origin))throw fail(403,'Same-origin submission required');
   if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw fail(415,'JSON required');
   if(Number(req.headers['content-length'])>4096)throw fail(413,'Request too large');
   let body='';for await(const chunk of req){body+=chunk.toString('utf8');if(Buffer.byteLength(body)>4096)throw fail(413,'Request too large');}
   let b;try{b=JSON.parse(body);}catch{throw fail(400,'Invalid JSON');}
   if(url.pathname===PREFIX+'email'){
    if(!email)throw fail(503,'Email export is not configured');
    if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).sort().join(',')!=='password,session'||!sessionValid(b.session))throw fail(400,'Invalid email request');
    if(closing){
     const {total,updatedAt,counts}=await readClosing(b.session);
     return send(res,200,await email.send(b,key,{total,updatedAt,counts:{standout:counts}},'closing'));
    }
    return send(res,200,await email.send(b,key,publicResult(await read(b.session))));
   }
   return send(res,200,await save(validate(b,closing),closing));
  }catch(e){if(!res.headersSent)send(res,e.status||503,{error:e.status?e.message:'Survey temporarily unavailable'});}
 });
 server.requestTimeout=10000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
 return server;
}
if(require.main===module){const dataDir=process.env.SURVEY_DATA_DIR||path.join(__dirname,'data');const configPath=process.env.SURVEY_EMAIL_CONFIG||(process.env.CREDENTIALS_DIRECTORY?path.join(process.env.CREDENTIALS_DIRECTORY,'survey-email.json'):null);const email=configPath?require('./email.cjs').createEmail({dataDir,configPath}):null;const server=createService({dataDir,email});server.listen(Number(process.env.PORT||3098),'127.0.0.1',()=>console.log('ai-survey listening on loopback'));}
module.exports={createService,validate,sessionValid,OPTIONS,CLOSING_OPTIONS};
