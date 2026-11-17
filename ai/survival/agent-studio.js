import {storyArt} from './agent-story-art.js?v=20261117-story1';
import {createWorkbenchMedia} from './agent-workbench-media.js?v=20261118-studio1';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const starts=[0,3,8,14,20,27,30,35];
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
 text(35,114,edition==='teacher'?'任务：用骑行游戏与 3D 心脏制作课堂微课。':'任务：用骑行游戏与 3D 心脏制作医学跨学科展示。',21,svg,true);
 rect(34,139,704,365,'#d9e6ef',svg,{stroke:'#a8c1d1'});rect(34,139,704,32,'#304b67');
 const appName=label(53,161,'',15,svg,'#e3f2fb'),saveStatus=label(512,160,'',12,svg,'#a8d9de');
 // A document types itself while source recordings stay visible beside it.
 const word=make('g',{'data-studio-panel':'Word'});rect(66,185,366,290,'#fff',word,{stroke:'#b8cddd'});label(90,214,'运动观察 → 心脏机制',20,word,'#68448d');label(90,237,'分镜讲稿 / narration.docx',12,word,'#6e8295');
 const script=[['01  进入骑行游戏，观察运动状态。',265],['02  记录画面，标注模拟条件。',292],['03  切到 3D 心脏，解释心动周期。',319],['04  将两个视角并排，提出讨论问题。',346],['05  核对讲解、来源和画面对应。',373],['06  导出课件、字幕与视频预览。',400]];
 const paragraphs=script.map(([s,y])=>({s,node:label(90,y,'',16,word,'#52677b')})),cursor=rect(90,252,2,18,'#8a58b2',word),docStamp=label(90,451,'已保存 · narration.docx',13,word,'#38988f');
 const blender=make('g',{'data-studio-panel':'Blender'});rect(54,181,672,302,'#102339',blender);
 for(let i=0;i<12;i++){path(`M${55+i*61} 478 L${390+(i-6)*19} 195`,'#2b4d67',1,blender);path(`M55 ${235+i*22} H726`,'#2b4d67',1,blender);}
 const renderBar=rect(75,461,0,5,'#69d2cf',blender);label(75,449,'应用录屏进入镜头 · 渲染调度示意',13,blender,'#bad8e6');
 const ppt=make('g',{'data-studio-panel':'PPTX'});
 const slideCards=[76,411].map((x,i)=>{const g=make('g',{},ppt);rect(x-11,185,316,278,'#fff',g,{stroke:'#b8cbd9'});label(x+6,214,i?'02  心脏的工作节律':'01  运动中的能量供应',18,g,'#714e98');label(x+6,435,i?'把结构、时相与讲解对应起来':'先观察，再提问；保留模拟条件',13,g,'#5b768a');return g;});
 const media=createWorkbenchMedia(svg,make);
 const sourceLabels=make('g',{'data-studio-part':'source-labels'});label(80,216,'CYCLING / 游戏实录',15,sourceLabels,'#c5e9f0');label(420,216,'CARDIACCYCLE / 3D 心脏实录',15,sourceLabels,'#c5e9f0');label(80,464,'两段真实应用画面，进入同一个制作项目。',16,sourceLabels,'#c6d9e5');
 // Editing tracks and all transitions are driven by the shared scene clock.
 const edit=make('g',{'data-studio-panel':'timeline'});rect(53,410,674,83,'#18324b',edit);const clips=[];
 [['VIDEO',425,'#517ab0'],['VOICE',448,'#528e8d'],['TEXT',471,'#9370b0']].forEach(([name,y,color],row)=>{label(64,y+7,name,10,edit,'#a8bdcf');for(let i=0;i<3;i++){const node=rect(115+i*197,y-6,186,17,color,edit,{rx:3});clips.push({node,row,i});label(122+i*197,y+6,row===0?['cycling.mp4','heart.mp4','两画面合并'][i]:row===1?['旁白轨（示意）','机制讲解','总结提问'][i]:['观察运动','解释机制','保留来源'][i],10,edit,'#e6f4fa');}});
 const playhead=path('M115 412 V490','#f2b06a',2,edit),renderPercent=label(578,399,'',12,edit,'#bde9e5');
 const movie=make('g',{'data-studio-panel':'movie-overlay'}),subtitleClip=make('clipPath',{id:'studio-subtitle-clip'},make('defs')),subBounds=rect(54,180,672,294,'#fff',subtitleClip),subtitles=make('g',{'clip-path':'url(#studio-subtitle-clip)'},movie);
 const subtitleBack=rect(80,432,618,29,'#061322dc',subtitles),subtitle=label(96,452,'',16,subtitles,'#fff'),safeFrame=rect(71,194,638,260,'none',movie,{stroke:'#ed8791','stroke-width':2,'stroke-dasharray':'7 5'}),filmTitle=label(73,205,'',13,movie,'#d9f0fa'),filmProgress=rect(69,480,0,3,'#6cdbd0',movie),filmTimeLabel=label(602,470,'',11,movie,'#d5e6ef');
 const desk=make('g',{'data-studio-part':'agent-desk'});rect(754,139,292,365,'#233c56',desk);label(773,165,'AGENT / 读反馈 → 调工具',15,desk,'#bedee9');
 const stepName=label(773,199,'',23,desk,'#fff'),decision=label(773,228,'',14,desk,'#d2c0ea'),receiving=label(773,264,'',12,desk,'#91ccd7');rect(771,277,258,62,'#102a43',desk);
 const command=label(782,298,'',11,desk,'#91d6dc'),command2=label(782,320,'',11,desk,'#91d6dc');command.setAttribute('font-family','Consolas,monospace');command2.setAttribute('font-family','Consolas,monospace');
 const resultBack=rect(771,356,258,97,'#33556c',desk),result=label(784,382,'',16,desk,'#e2f1fa'),follow=label(784,409,'',14,desk,'#bed6e4'),version=label(784,436,'',12,desk,'#9ad8c8'),stateBar=rect(773,478,0,4,'#72d4cc',desk);
 const rail=make('g',{'data-studio-part':'tool-rail'});path('M114 528 H960','#aec5d5',2,rail);
 const toolNodes=workbenchSteps.map(([name,zh],i)=>{const g=make('g',{'data-tool':name},rail),box=rect(38+i*168,514,154,42,'#e9f2f9',g,{stroke:'#acc3d6'});label(49+i*168,540,name+' · '+zh,13,g);return {g,box};});
 const returnArc=path('M960 514 Q875 472 790 514','#e29a96',3,rail);returnArc.setAttribute('stroke-dasharray','6 5');
 const packet=make('g',{'data-studio-part':'file-transfer'});rect(-69,-35,138,68,'#f8fcff',packet,{stroke:'#84b8c9','stroke-width':2});path('M-51 -21 h26 v28 h-26 Z M-46 -13 h16 M-46 -6 h16','#8ca6c3',2,packet);const packetName=label(-15,-7,'',12,packet,'#455e79'),packetRoute=label(-15,15,'',10,packet,'#8e62ad');
 const files=['sources/','narration.docx','render.mp4','lesson.pptx','lesson_v1.mp4','review.json','lesson_v2.mp4'];
 return {
  tick(t,options={}){
   const s=workbenchState(t,options),{step,phase,local,progress,failed,repair,repaired}=s;svg.dataset.tool=workbenchSteps[step][0];svg.dataset.studioPhase=repair?'repair':failed?'failed':repaired?'finished':workbenchSteps[step][0].toLowerCase();media.tick(t,s);
   word.setAttribute('opacity',step===1?1:0);blender.setAttribute('opacity',step===2?1:0);ppt.setAttribute('opacity',step===3?1:0);sourceLabels.setAttribute('opacity',step===0?1:0);
   appName.textContent=['PROJECT / 两段真实素材','WORD / 分镜讲稿逐段写出','BLENDER / 画面进入镜头','POWERPOINT / 课件组装','FFMPEG / 多轨合成','PLAYER / 成片预览'][step];saveStatus.textContent=repair?'v1 → 调整字幕 → v2':repaired?'lesson_v2.mp4 · HTML 预览':step===2?'FRAME '+Math.min(180,Math.floor(progress*180))+' / 180':step===4?'组合画面 + 字幕':'自动保存 · 制作过程示意';
   let remaining=clamp(local/3.7)*script.reduce((a,[str])=>a+str.length,0),caretY=265,caretX=90;paragraphs.forEach(({s:line,node},i)=>{const n=Math.max(0,Math.min(line.length,Math.floor(remaining)));node.textContent=line.slice(0,n);if(remaining>=0&&remaining<=line.length){caretY=script[i][1];caretX=90+n*16;}remaining-=line.length;});cursor.setAttribute('x',Math.min(410,caretX));cursor.setAttribute('y',caretY-15);cursor.setAttribute('opacity',step===1&&progress<.9?(.3+.7*Math.sin(t*7)**2):0);docStamp.setAttribute('opacity',smooth((local-3.4)/.6));
   renderBar.setAttribute('width',622*progress);slideCards.forEach((g,i)=>g.setAttribute('transform',`translate(${(1-smooth((local-i*.6)/1.2))*70} ${(1-smooth((local-i*.6)/1.2))*20})`));edit.setAttribute('opacity',step===4?1:0);clips.forEach(({node,row,i})=>{node.setAttribute('width',186*smooth((local-i*.35-row*.15)/1.5));node.setAttribute('opacity',repair&&row===2?.5+.5*Math.sin(t*6)**2:1);});playhead.setAttribute('transform',`translate(${(repair?progress:((local/7)%1))*590} 0)`);renderPercent.textContent=(repair?'重新编码 ':'合成进度 ')+Math.floor(progress*100)+'%';
   movie.setAttribute('opacity',step>=4?1:0);const h=step===4?218:294;subBounds.setAttribute('height',h);safeFrame.setAttribute('height',h-34);safeFrame.setAttribute('opacity',failed?1:0);const subtitleY=failed?180+h+3:repair?180+h+3-42*smooth(local/2.8):180+h-20;subtitleBack.setAttribute('y',subtitleY-21);subtitle.setAttribute('y',subtitleY);subtitle.textContent=s.filmTime<3.6?'从骑行游戏出发：观察运动与供能。':s.filmTime<7.6?'进入 3D 心脏：把画面与心动周期联系起来。':'两种视角合在一起：观察 → 解释 → 提问。';filmTitle.textContent=(s.filmTime<3.6?'01 / CYCLING':s.filmTime<7.6?'02 / CARDIACCYCLE':'03 / 两画面对照')+'   ·   '+(repaired?'修订版 v2':'初稿 v1');filmProgress.setAttribute('opacity',step===5?1:0);filmTimeLabel.setAttribute('opacity',step===5?1:0);filmProgress.setAttribute('width',638*s.filmTime/12);filmTimeLabel.textContent='00:'+String(Math.floor(s.filmTime)).padStart(2,'0')+' / 00:12';
   stepName.textContent=repair?'FFmpeg · 修复再合成':workbenchSteps[step][0]+' · '+workbenchSteps[step][1];decision.textContent=repair?'依据检查意见，改参数再执行。':repaired?'已复查，交给人审阅。':failed?'发现字幕被裁切，退回合成。':workbenchSteps[step][3];receiving.textContent='INPUT / '+(repair?'review.json + lesson_v1.mp4':repaired?'lesson_v2.mp4':step===0?'cycling.mp4 + heart.mp4':files[step-1]);command.textContent=repair?'subtitle.y = safe_bottom - 24':repaired?'ffprobe lesson_v2.mp4':workbenchSteps[step][2];command2.textContent=repair?'ffmpeg ... lesson_v2.mp4':step===4?'-filter_complex ... lesson_v1.mp4':step===5?'inspect frames + captions':'→ '+files[Math.min(step,4)];resultBack.setAttribute('fill',failed?'#743f4f':repair?'#5a4b72':repaired?'#245c59':'#33556c');result.textContent=failed?'FAIL · 字幕超出安全区':repair?'FIX · 字幕回到画面内':repaired?'PASS · 画面与字幕复查':'OUTPUT / '+files[Math.min(step,4)];follow.textContent=failed?'输出 review.json，重新调用工具':repair?'重跑合成，并打开新预览':repaired?'人的验收：知识、来源、教学目标':'把产物交给下一步继续处理';version.textContent=repair?'保留 v1，生成 v2':repaired?'保留版本与检查记录':'文件是下一工具的输入';stateBar.setAttribute('width',254*(repaired?1:progress));
   toolNodes.forEach(({g,box},i)=>{g.setAttribute('opacity',i===step?1:i<step?.75:.4);box.setAttribute('fill',i===step?repair?'#eadbf2':'#cce7ec':'#e9f2f9');});returnArc.setAttribute('opacity',repair||failed?1:0);
   // Physical file transfer, including the review file sent back to FFmpeg.
   const boundary=starts.findIndex((start,i)=>i>0&&t>=start-1.15&&t<start+1.1);
   if(boundary>0){const q=clamp((t-(starts[boundary]-1.15))/2.25),from=Math.min(5,boundary-1),to=boundary===6?4:Math.min(5,boundary),p0=[610,424],p1=[114+from*168,505],p2=[114+to*168,490],p3=[330,263],u=1-q,x=u*u*u*p0[0]+3*u*u*q*p1[0]+3*u*q*q*p2[0]+q*q*q*p3[0],y=u*u*u*p0[1]+3*u*u*q*p1[1]+3*u*q*q*p2[1]+q*q*q*p3[1];packet.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.sin(q*Math.PI)*-9})`);packet.setAttribute('opacity',Math.sin(q*Math.PI));packetName.textContent=files[Math.min(boundary-1,6)];packetRoute.textContent=boundary===6?'检查意见 → 返工':'产物 → 下一个工具';}else packet.setAttribute('opacity',0);packet.dataset.active=String(boundary>0);
   return s;
  },setPlaying:media.setPlaying,dispose:media.dispose
 };
}
