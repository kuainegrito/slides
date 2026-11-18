import {storyArt} from './agent-story-art.js?v=20261117-story1';
import {createWorkbenchMedia} from './agent-workbench-media.js?v=20261118-colors1';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const starts=[0,3,8,14,20,27,30,35];
const actions=['Sources','Draft','Render','Build slides','Compose','Check'];
const decisions=['Link exercise and cardiac mechanisms.','Write the footage into a storyboard.','Place recordings in scenes; render frames.','Combine narration and visuals in slides.','Join clips, captions and opening titles.','Inspect the preview and revise the result.'];
export const workbenchSteps=[
 ['Plan','真实素材','cycling.mp4 + heart.mp4','把运动观察与心脏机制连成一课。'],
 ['Word','逐段写稿','python make_script.py','将资料、画面与讲解写进分镜。'],
 ['Blender','镜头渲染','blender -b scenes.blend -a','把素材放入镜头，逐帧输出。'],
 ['PPTX','生成课件','python build_slides.py','讲稿和画面进入同一套课件。'],
 ['FFmpeg','合成视频','ffmpeg -i cycling.mp4 -i heart.mp4','拼接镜头，叠加字幕与片头。'],
 ['Review','检查返工','ffprobe lesson.mp4 + preview','检查成片，依据结果修改。']
];
export function nextWorkbenchTime(t){return [5.5,11,17,23.5,28.8,32.5,37].find(x=>x>t+.1)??37;}
export function workbenchState(t,{failed=false}={}){
 let phase=starts.findIndex((s,i)=>t>=s&&(i===starts.length-1||t<starts[i+1]));phase=Math.max(0,phase);if(failed)phase=5;
 const step=phase===6?4:phase===7?5:phase,local=failed?1.8:t-starts[phase];
 return {phase,step,local,failed:failed||(phase===5&&local>=1.2),repair:phase===6,repaired:phase===7,previousStep:phase===6?5:phase===7?4:Math.max(0,step-1),transition:smooth(local/.65),progress:clamp(local/([3,5,6,6,7,3,5,12][phase])),filmTime:phase===7?(t-35)%12:phase===6?(t-30)%12:Math.max(0,t-20)%12};
}
export function buildWorkbench(svg,edition){
 const {make,path,rect,text}=storyArt(svg),label=(x,y,s,size=15,p=svg,color='#3f3f46')=>text(x,y,s,size,p,false,color);
 const bi=(x,y,en,zh,size=14,p=svg,color='#3f3f46',zhColor='#7030a0',gap=size+3)=>{
  const g=make('g',{'data-bilingual':'true'},p),e=label(x,y,en,size,g,color),z=text(x,y+gap,zh,size,g,true);
  e.dataset.lang='en';z.dataset.lang='zh';z.style.fill=zhColor;z.setAttribute('font-size',size+1);
  return {g,en:e,zh:z,set(a,b){e.textContent=a;z.textContent=b;}};
 };
 bi(35,105,edition==='teacher'?'Task: Turn cycling and 3D-heart footage into a classroom micro-lesson.':'Task: Turn cycling and 3D-heart footage into an interdisciplinary medical presentation.',edition==='teacher'?'任务：用骑行游戏与 3D 心脏制作课堂微课。':'任务：用骑行游戏与 3D 心脏制作医学跨学科展示。',15,svg,'#3f3f46','#7030a0',21);
 rect(34,139,704,365,'#d9e6ef',svg,{stroke:'#a8c1d1'});rect(34,139,704,32,'#d7e9f4');
 const appName=bi(53,151,'','',11,svg,'#e3f2fb','#d8d2ed',14),saveStatus=bi(512,151,'','',10,svg,'#a8d9de','#c5dfea',14);
 // A document types itself while source recordings stay visible beside it.
 const word=make('g',{'data-studio-panel':'Word'});rect(66,185,366,290,'#fff',word,{stroke:'#b8cddd'});
 bi(90,205,'Exercise → cardiac mechanisms','运动观察 → 心脏机制',16,word,'#3f3f46','#7030a0',19);label(90,244,'Storyboard / 分镜讲稿 · narration.docx',11,word,'#6e8295');
 const script=[['01  Observe the cycling game.','01  进入骑行游戏，观察运动状态。'],['02  Record the simulation conditions.','02  记录画面，标注模拟条件。'],['03  Explore the 3D cardiac cycle.','03  切到 3D 心脏，解释心动周期。'],['04  Compare both views; ask questions.','04  将两个视角并排，提出讨论问题。'],['05  Check narration, sources and visuals.','05  核对讲解、来源和画面对应。'],['06  Export slides, captions and a preview.','06  导出课件、字幕与视频预览。']];
 const paragraphs=script.map(([en,zh],i)=>({en,zh,node:bi(90,263+i*32,'','',12,word,'#52677b','#7030a0',14)})),cursor=rect(90,252,2,14,'#8a58b2',word),docStamp=label(90,460,'Saved / 已保存 · narration.docx',12,word,'#38988f');
 const blender=make('g',{'data-studio-panel':'Blender'});rect(54,181,672,302,'#dbe7f2',blender);
 for(let i=0;i<12;i++){path(`M${55+i*61} 478 L${390+(i-6)*19} 195`,'#acc8da',1,blender);path(`M55 ${235+i*22} H726`,'#acc8da',1,blender);}
 const renderBar=rect(75,468,0,5,'#69d2cf',blender);bi(75,438,'App footage on scene planes · Render demo','应用录屏进入镜头 · 渲染调度示意',12,blender,'#bad8e6','#dcc8ef',16);
 const ppt=make('g',{'data-studio-panel':'PPTX'});
 const slideCards=[76,411].map((x,i)=>{const g=make('g',{},ppt);rect(x-11,185,316,278,'#fff',g,{stroke:'#b8cbd9'});bi(x+6,205,i?'02  The cardiac cycle':'01  Energy supply during exercise',i?'02  心脏的工作节律':'01  运动中的能量供应',13,g,'#3f3f46','#7030a0',19);bi(x+6,420,i?'Connect structure, phase and explanation.':'Observe, ask, and retain the conditions.',i?'把结构、时相与讲解对应起来':'先观察，再提问；保留模拟条件',11,g,'#5b768a','#7030a0',17);return g;});
 const media=createWorkbenchMedia(svg,make);
 const sourceLabels=make('g',{'data-studio-part':'source-labels'});bi(80,198,'CYCLING / Gameplay capture','CYCLING / 游戏实录',13,sourceLabels,'#c5e9f0','#dcc8ef',18);bi(420,198,'CARDIACCYCLE / 3D-heart capture','CARDIACCYCLE / 3D 心脏实录',13,sourceLabels,'#c5e9f0','#dcc8ef',18);bi(80,450,'Two real application recordings, one production project.','两段真实应用画面，进入同一个制作项目。',14,sourceLabels,'#c6d9e5','#dcc8ef',21);
 // Editing tracks and all transitions are driven by the shared scene clock.
 const edit=make('g',{'data-studio-panel':'timeline'});rect(53,410,674,83,'#e1eaf3',edit);const clips=[];
 [['VIDEO/视频',425,'#c9dcf5'],['VOICE/旁白',448,'#c4e6e0'],['TEXT/字幕',471,'#e5d5f0']].forEach(([name,y,color],row)=>{label(60,y+7,name,8,edit,'#a8bdcf');for(let i=0;i<3;i++){const node=rect(115+i*197,y-6,186,17,color,edit,{rx:3});clips.push({node,row,i});label(122+i*197,y+6,row===0?['cycling.mp4','heart.mp4','Split / 双画面'][i]:row===1?['Voice demo / 旁白示意','Explain / 机制讲解','Question / 总结提问'][i]:['Observe / 观察运动','Explain / 解释机制','Sources / 保留来源'][i],9,edit,'#e6f4fa');}});
 const playhead=path('M115 412 V490','#f2b06a',2,edit),renderPercent=label(530,399,'',11,edit,'#bde9e5');
 const movie=make('g',{'data-studio-panel':'movie-overlay'});
 rect(67,190,390,22,'#edf4fa',movie);
 const filmTimeBack=rect(592,455,115,20,'#edf4fa',movie);
 const subtitleClip=make('clipPath',{id:'studio-subtitle-clip'},make('defs')),subBounds=rect(54,180,672,294,'#fff',subtitleClip),subtitles=make('g',{'clip-path':'url(#studio-subtitle-clip)'},movie);
 const subtitleBack=rect(80,419,618,45,'#f5f8fcf5',subtitles),subtitle=bi(96,436,'','',15,subtitles,'#fff','#eee4ff',18),safeFrame=rect(71,194,638,260,'none',movie,{stroke:'#ed8791','stroke-width':2,'stroke-dasharray':'7 5'}),filmTitle=label(73,205,'',12,movie,'#d9f0fa'),filmProgress=rect(69,480,0,3,'#6cdbd0',movie),filmTimeLabel=label(602,470,'',11,movie,'#000');
 const desk=make('g',{'data-studio-part':'agent-desk'});rect(754,139,292,365,'#e5edf7',desk);bi(773,159,'AGENT / Observe → use tools','AGENT / 读反馈 → 调工具',12,desk,'#bedee9','#dcc8ef',17);
 const stepName=bi(773,205,'','',18,desk,'#fff','#dcc8ef',21),decision=bi(773,247,'','',12,desk,'#d2e5ee','#dcc8ef',16),receiving=label(773,285,'',11,desk,'#91ccd7');rect(771,297,258,50,'#f3f7fc',desk);
 const command=label(782,316,'',10,desk,'#91d6dc'),command2=label(782,336,'',10,desk,'#91d6dc');command.setAttribute('font-family','Consolas,monospace');command2.setAttribute('font-family','Consolas,monospace');
 const resultBack=rect(771,359,258,115,'#dbeaf1',desk),result=bi(784,377,'','',13,desk,'#e2f1fa','#dcc8ef',18),follow=bi(784,416,'','',11,desk,'#bed6e4','#dcc8ef',16),version=bi(784,452,'','',10,desk,'#9ad8c8','#c1ded8',15),stateBar=rect(773,486,0,4,'#72d4cc',desk);
 const rail=make('g',{'data-studio-part':'tool-rail'});path('M114 528 H960','#aec5d5',2,rail);
 const toolNodes=workbenchSteps.map(([name,zh],i)=>{const g=make('g',{'data-tool':name},rail),box=rect(38+i*168,507,154,46,'#e9f2f9',g,{stroke:'#acc3d6'});bi(49+i*168,523,name+' · '+actions[i],zh,12,g,'#3f3f46','#7030a0',18);return {g,box};});
 const returnArc=path('M960 514 Q875 472 790 514','#e29a96',3,rail);returnArc.setAttribute('stroke-dasharray','6 5');
 const packet=make('g',{'data-studio-part':'file-transfer'});rect(-69,-35,138,68,'#f8fcff',packet,{stroke:'#84b8c9','stroke-width':2});path('M-51 -21 h26 v28 h-26 Z M-46 -13 h16 M-46 -6 h16','#8ca6c3',2,packet);const packetName=label(-15,-13,'',12,packet,'#455e79'),packetRoute=bi(-15,5,'','',9,packet,'#52677b','#7030a0',14);
 const files=['sources/','narration.docx','render.mp4','lesson.pptx','lesson_v1.mp4','review.json','lesson_v2.mp4'];
 return {
  tick(t,options={}){
   const s=workbenchState(t,options),{step,phase,local,progress,failed,repair,repaired}=s;svg.dataset.tool=workbenchSteps[step][0];svg.dataset.studioPhase=repair?'repair':failed?'failed':repaired?'finished':workbenchSteps[step][0].toLowerCase();media.tick(t,s);
   word.setAttribute('opacity',step===1?1:0);blender.setAttribute('opacity',step===2?1:0);ppt.setAttribute('opacity',step===3?1:0);sourceLabels.setAttribute('opacity',step===0?1:0);
   appName.set(['PROJECT / Two real recordings','WORD / Drafting a storyboard','BLENDER / Recordings into scenes','POWERPOINT / Assembling slides','FFMPEG / Multi-track composition','PLAYER / Finished preview'][step],['项目 / 两段真实素材','Word / 分镜讲稿逐段写出','Blender / 画面进入镜头','PowerPoint / 课件组装','FFmpeg / 多轨合成','播放器 / 成片预览'][step]);
   saveStatus.set(repair?'v1 → caption fix → v2':repaired?'lesson_v2.mp4 · HTML preview':step===2?'FRAME '+Math.min(180,Math.floor(progress*180))+' / 180':step===4?'Combine footage + captions':'Autosave · workflow demo',repair?'v1 → 调整字幕 → v2':repaired?'lesson_v2.mp4 · HTML 预览':step===2?'正在渲染 / 180 帧':step===4?'组合画面 + 字幕':'自动保存 · 制作过程示意');
   const typed=clamp(local/3.7)*script.length;let caretY=277,caretX=90;
   paragraphs.forEach(({en,zh,node},i)=>{const amount=clamp(typed-i),enCount=amount?Math.max(1,Math.floor(en.length*amount)):0,zhCount=amount?Math.max(1,Math.floor(zh.length*amount)):0;node.set(en.slice(0,enCount),zh.slice(0,zhCount));if(typed>=i&&typed<i+1){caretY=277+i*32;caretX=90+zhCount*11.5;}});
   cursor.setAttribute('x',Math.min(410,caretX));cursor.setAttribute('y',caretY-11);cursor.setAttribute('opacity',step===1&&progress<.9?(.3+.7*Math.sin(t*7)**2):0);docStamp.setAttribute('opacity',smooth((local-3.4)/.6));
   renderBar.setAttribute('width',622*progress);slideCards.forEach((g,i)=>g.setAttribute('transform',`translate(${(1-smooth((local-i*.6)/1.2))*70} ${(1-smooth((local-i*.6)/1.2))*20})`));edit.setAttribute('opacity',step===4?1:0);clips.forEach(({node,row,i})=>{node.setAttribute('width',186*smooth((local-i*.35-row*.15)/1.5));node.setAttribute('opacity',repair&&row===2?.5+.5*Math.sin(t*6)**2:1);});playhead.setAttribute('transform',`translate(${(repair?progress:((local/7)%1))*590} 0)`);renderPercent.textContent=(repair?'Re-encode / 重编码 ':'Compose / 合成 ')+Math.floor(progress*100)+'%';
   movie.setAttribute('opacity',step>=4?1:0);const h=step===4?218:294;subBounds.setAttribute('height',h);safeFrame.setAttribute('height',h-34);safeFrame.setAttribute('opacity',failed?1:0);const subtitleY=failed?180+h+3:repair?180+h+3-42*smooth(local/2.8):180+h-20;subtitleBack.setAttribute('y',subtitleY-35);subtitle.en.setAttribute('y',subtitleY-18);subtitle.zh.setAttribute('y',subtitleY);subtitle.set(s.filmTime<3.6?'Start with cycling: observe movement and energy supply.':s.filmTime<7.6?'Explore the 3D heart and connect it to the cardiac cycle.':'Bring both views together: observe → explain → ask.',s.filmTime<3.6?'从骑行游戏出发：观察运动与供能。':s.filmTime<7.6?'进入 3D 心脏：把画面与心动周期联系起来。':'两种视角合在一起：观察 → 解释 → 提问。');filmTitle.textContent=(s.filmTime<3.6?'01 · CYCLING / 骑行':s.filmTime<7.6?'02 · CARDIACCYCLE / 心动周期':'03 · Side by side / 双画面对照')+'   ·   '+(repaired?'Revision v2 / 修订版 v2':'Draft v1 / 初稿 v1');filmProgress.setAttribute('opacity',step===5?1:0);filmTimeLabel.setAttribute('opacity',step===5?1:0);filmTimeBack.setAttribute('opacity',step===5?1:0);filmProgress.setAttribute('width',638*s.filmTime/12);filmTimeLabel.textContent='00:'+String(Math.floor(s.filmTime)).padStart(2,'0')+' / 00:12';
   stepName.set(repair?'FFmpeg · Rework':workbenchSteps[step][0]+' · '+actions[step],repair?'FFmpeg · 修复再合成':workbenchSteps[step][1]);
   decision.set(repair?'Revise parameters from the review.':repaired?'Rechecked; ready for human review.':failed?'Captions cropped: return to composition.':decisions[step],repair?'依据检查意见，改参数再执行。':repaired?'已复查，交给人审阅。':failed?'发现字幕被裁切，退回合成。':workbenchSteps[step][3]);
   receiving.textContent='IN / 输入 · '+(repair?'review.json + lesson_v1.mp4':repaired?'lesson_v2.mp4':step===0?'cycling.mp4 + heart.mp4':files[step-1]);
   command.textContent=repair?'subtitle.y = safe_bottom - 24':repaired?'ffprobe lesson_v2.mp4':workbenchSteps[step][2];command2.textContent=repair?'ffmpeg ... lesson_v2.mp4':step===4?'-filter_complex ... lesson_v1.mp4':step===5?'preview + captions / 预览与字幕检查':'→ '+files[Math.min(step,4)];
   resultBack.setAttribute('fill',failed?'#f5dfe3':repair?'#ede5f7':repaired?'#d8eee8':'#dbeaf1');
   result.set(failed?'FAIL · Captions outside safe area':repair?'FIX · Captions back in frame':repaired?'PASS · Visuals and captions checked':'OUTPUT / '+files[Math.min(step,4)],failed?'失败 · 字幕超出安全区':repair?'修复 · 字幕回到画面内':repaired?'通过 · 画面与字幕复查':'输出 / '+files[Math.min(step,4)]);
   follow.set(failed?'Send review.json back to the tool.':repair?'Recompose and reopen the preview.':repaired?'Human review: content, sources, objectives.':'Pass the output to the next step.',failed?'输出 review.json，重新调用工具':repair?'重跑合成，并打开新预览':repaired?'人的验收：知识、来源、教学目标':'把产物交给下一步继续处理');
   version.set(repair?'Keep v1; produce v2.':repaired?'Keep versions and review records.':'Output files become the next input.',repair?'保留 v1，生成 v2':repaired?'保留版本与检查记录':'文件是下一工具的输入');stateBar.setAttribute('width',254*(repaired?1:progress));
   toolNodes.forEach(({g,box},i)=>{g.setAttribute('opacity',i===step?1:i<step?.75:.4);box.setAttribute('fill',i===step?repair?'#eadbf2':'#cce7ec':'#e9f2f9');});returnArc.setAttribute('opacity',repair||failed?1:0);
   // Physical file transfer, including the review file sent back to FFmpeg.
   const boundary=starts.findIndex((start,i)=>i>0&&t>=start-1.15&&t<start+1.1);
   if(boundary>0){const q=clamp((t-(starts[boundary]-1.15))/2.25),from=Math.min(5,boundary-1),to=boundary===6?4:Math.min(5,boundary),p0=[610,424],p1=[114+from*168,505],p2=[114+to*168,490],p3=[330,263],u=1-q,x=u*u*u*p0[0]+3*u*u*q*p1[0]+3*u*q*q*p2[0]+q*q*q*p3[0],y=u*u*u*p0[1]+3*u*u*q*p1[1]+3*u*q*q*p2[1]+q*q*q*p3[1];packet.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.sin(q*Math.PI)*-9})`);packet.setAttribute('opacity',Math.sin(q*Math.PI));packetName.textContent=files[Math.min(boundary-1,6)];packetRoute.set(boundary===6?'Review → rework':'Output → next tool',boundary===6?'检查意见 → 返工':'产物 → 下一个工具');}else packet.setAttribute('opacity',0);packet.dataset.active=String(boundary>0);
   return s;
  },setPlaying:media.setPlaying,dispose:media.dispose
 };
}
