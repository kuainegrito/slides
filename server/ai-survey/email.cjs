'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {promisify}=require('node:util');const scrypt=promisify(crypto.scrypt);
const TO='kuainegrito@gmail.com',FROM='info@kuaiyu.site';
const err=(status,message)=>Object.assign(new Error(message),{status});
async function verify(password,c){if(!c||!/^[0-9a-f]{32,128}$/.test(c.salt||'')||!/^[0-9a-f]{128}$/.test(c.hash||''))throw err(503,'Email export is not configured');const actual=await scrypt(password,c.salt,64);return crypto.timingSafeEqual(actual,Buffer.from(c.hash,'hex'));}
function csv(result){const rows=['group,question,option,count,total,question_total,percent'];for(const [group,g]of [['all',result],...Object.entries(result.countsByRole||{}),...Object.entries(result.countsByGender||{}).map(([g,v])=>['gender:'+g,v]),...Object.entries(result.countsByRoleByGender||{}).flatMap(([r,groups])=>Object.entries(groups).map(([g,v])=>['role:'+r+'/gender:'+g,v]))])for(const [q,counts]of Object.entries(g.counts||{})){const denominator=['models','uses','concerns'].includes(q)?g.total:Object.values(counts).reduce((a,n)=>a+(Number(n)||0),0);for(const [opt,n]of Object.entries(counts))rows.push([group,q,opt,n,g.total,denominator,denominator?Math.round(n/denominator*10000)/100:0].map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(','));}return '\uFEFF'+rows.join('\r\n');}
function createEmail({dataDir,configPath,loadConfig,createTransport,now=Date.now}={}){
 let busy=false;const failures=new Map();let globalAttempts=[];
 const config=loadConfig||(()=>fs.readFile(configPath,'utf8').then(JSON.parse).catch(()=>{throw err(503,'Email export is not configured');}));
 async function send({session,password},key,result){
  if(typeof password!=='string'||password.length<1||password.length>256)throw err(400,'Password required');
  const t=now();globalAttempts=globalAttempts.filter(x=>x>t-900000);if(globalAttempts.length>=30)throw err(429,'Too many password attempts; try later');
  for(const [k,v]of failures)if(v.until<t)failures.delete(k);
  if(failures.size>10000||((failures.get(key)||{}).n||0)>=5)throw err(429,'Too many password attempts; try later');
  if(busy)throw err(429,'Email request already in progress');busy=true;
  try{
   globalAttempts.push(t);const c=await config();
   if(!await verify(password,c)){const f=failures.get(key)||{n:0,until:t+900000};f.n++;failures.set(key,f);throw err(403,'Incorrect password');}
   failures.delete(key);
   if(!result.total)throw err(409,'No responses to email');
   const smtp=c.smtp||{};
   if(!smtp.host||!smtp.user||!smtp.password||![465,587].includes(smtp.port)||smtp.secure!==(smtp.port===465))throw err(503,'Email export is not configured');
   const file=path.join(dataDir,'email-state.json');let state={};try{state=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw err(503,'Email state unavailable');}
   const latest=Object.values(state).sort((a,b)=>b.at-a.at)[0];
   if(latest&&t-latest.at<60000)throw err(429,'Please wait before sending another report');
   if(state[session]&&t-state[session].at<600000)throw err(429,'This session was recently requested; check your inbox before retrying');
   // Record before SMTP: timeouts or process interruption must not auto-resend.
   state[session]={at:t,status:'attempted'};
   async function persist(){const temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify(state),{mode:0o600});await fs.rename(temp,file);}
   await persist();
   const make=createTransport||require(process.env.SURVEY_NODEMAILER_PATH||'nodemailer').createTransport;
   let transport;
   try{
    transport=make({host:smtp.host,port:smtp.port,secure:smtp.secure,requireTLS:!smtp.secure,auth:{user:smtp.user,pass:smtp.password},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true,tls:{rejectUnauthorized:true}});
    const sent=await transport.sendMail({from:FROM,to:TO,subject:'AI classroom survey · '+session,text:'Anonymous aggregate results for '+session+'\nResponses: '+result.total+'\nUpdated: '+result.updatedAt+'\nMulti-select percentages may exceed 100%. This is an informal classroom poll.',attachments:[{filename:session+'.csv',content:csv(result),contentType:'text/csv; charset=utf-8'},{filename:session+'.json',content:JSON.stringify({session,...result},null,2),contentType:'application/json'}]});
    if(!sent.accepted?.some(x=>String(x).toLowerCase()===TO))throw Error('Unconfirmed acceptance');
    state[session].status='accepted';await persist();return {ok:true,status:'accepted',message:'Mail server accepted the report; inbox delivery is not yet confirmed'};
   }catch(e){state[session].status='uncertain';await persist().catch(()=>{});throw err(502,'Email delivery is unconfirmed. Check inbox and spam before retrying.');}finally{transport?.close();}
  }finally{busy=false;}
 }
 return {send};
}
module.exports={createEmail,verify,csv};
