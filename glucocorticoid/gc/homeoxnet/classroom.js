// Local session transport for the original simulator frontend.
(()=>{
 let model,automatic=true;
 const json=(data,status=200)=>Promise.resolve(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}));
 window.fetch=(url,options={})=>{
  const path=String(url).split('?')[0],b=JSON.parse(options.body||'{}');
  if(path.endsWith('/api/session/start')){
   model=HN.createSession(b.lang);HN.setThreatScoring(model,!b.noThreat);
   return json({sid:'classroom',meta:HN.meta(b.lang),snapshot:HN.snapshot(model)});
  }
  if(path.includes('/api/session/classroom/')){
   const op=path.split('/').pop();
   switch(op){
    case 'tick':{
     if(automatic)HN.setControl(model,'cortisol',100);
     const dt=automatic?Math.min(b.dt,(14400-model.simTime)/b.speed):b.dt;
     const frame=HN.tick(model,dt,b.speed,{lens:b.lens,segment:b.segment,autoBrake:b.autoBrake});
     if(automatic&&model.simTime>=14400){automatic=false;setTimeout(()=>{if(!paused)togglePause()},0)}
     return json(frame)}
    case 'explain':return json(HN.explainParameter(model,b.key));
    case 'control':automatic=false;HN.setControl(model,b.key,b.value);break;
    case 'zero':automatic=false;HN.zeroControls(model);break;
    case 'threat':HN.setThreatScoring(model,b.enabled!==false);break;
    case 'scenario':automatic=false;HN.applyScenario(model,b.name);break;
    case 'reset':automatic=false;HN.resetSession(model);break;
    case 'continue-observation':HN.continueObservation(model);break;
    case 'logout':break;
    default:return json({error:'Unavailable offline'},404);
   }
   return json(HN.snapshot(model));
  }
  if(path.includes('/api/learning-event'))return json({});
  return json({error:'此联网功能在离线放映中不可用'},503);
 };
 if(navigator.sendBeacon)navigator.sendBeacon=()=>true;
 window.addEventListener('load',()=>{
  function begin(){if(!model||!latest||!timeMeta){setTimeout(begin,40);return}
   document.getElementById('startBtn').click();autoLensEnabled=false;setLens('hours');speedIndex=timeMeta.speedSteps.indexOf(4);
   HN.setControl(model,'cortisol',100);latest=HN.snapshot(model);renderTimeConsole();renderSnapshot(latest);selectParam('cortisol');}
  begin();
 });
})();
