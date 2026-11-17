import {mountAgentScene} from './agent-scenes.js?v=20261117-story1';
import {sessionId,validSession,request,questions} from './survey/schema.js?v=20261117-spending1';

export const agentSource='https://www.anthropic.com/research/building-effective-agents';
const topics=[
 [69,'bridge','One answer, or a finished task?','拿到一个答案，还是完成一件事？'],
 [70,'poll','Back to our AI pulse','回看问卷：我们用到哪一步？'],
 [36,'care','AI is the brain; an agent is like Mum','AI 是大脑，Agent 像妈妈'],
 [71,'weather','Tools return evidence, not magic','会调工具，还要根据反馈调整'],
 [72,'transfer','Give a goal, tools and a finish line','把目标、工具和验收标准交代清楚'],
 [73,'workbench','An agent at work on your computer','真实任务：让电脑里的工具协同工作']
];
const texts={
 workbench:'Example: create a cycling-energy micro-lesson from approved sources. Word / python-docx writes the script; Blender renders a cycling scene; python-pptx builds slides; FFmpeg composes video and subtitles; FFprobe and rendered previews support checks.\n医学跨学科实例：将审定的骑行能量代谢资料制作成微课。Word 文档接口或 python-docx 写讲稿，Blender 渲染场景，python-pptx 生成 PPTX，FFmpeg 合成字幕视频，再检查文件、版面和引用。\nA failed subtitle check sends the agent back to FFmpeg before another review. Human review covers scientific correctness.\n字幕裁切检查失败后返回合成环节，修改后复查；科学内容由人验收。页面为具体工作流演示，不在观众电脑执行命令，也不声称已经生成这些交付物。',
 bridge:'Slides, translation and a simple webpage produce one output. What is missing when a task needs several tools?\nPPT、翻译、简单网页：先把一个成果做好。若要读资料、做课件、检查网页、整理交付，AI 还缺什么？\nDiscuss first, then reveal: planning, tools, feedback and checking. A single translation may only need a chat.\n先讨论，再揭晓：计划、工具、状态记录、反馈与核验。单次翻译不必强行上 Agent。',
 poll:'Read the existing mode question from the same classroom session. Uncertain answers are separate; the suggestion is a teaching heuristic, not an ability score.\n调用本场课前问卷的使用模式题。不确定单列；按本题实际作答数计算，讲解建议不是能力判断。',
 care:'A language model supplies reasoning; an agent system uses it to plan, call permitted tools, observe results and adjust.\n大语言模型提供推理能力；Agent 系统围绕目标组织计划、调用已授权工具、读取反馈并调整。\n“I am hungry”: plan a meal, inspect supplied fridge inventory, draft a shopping list, ask before spending, then check the outcome.\n“我饿了”：安排一餐、检查已提供的冰箱清单、补齐采购草稿，付款前请你确认，再检查结果。\nMum is a metaphor for a caring organiser, not a claim about gender or a machine that can see a fridge or cook without connected equipment.\n妈妈是照料与统筹的生活比喻，任何照料者都能胜任；Agent 不会凭空看见冰箱或替人做饭。',
 weather:'“I will go out this afternoon”: obtain location and time, request a weather tool, inspect its return, update the plan, then confirm what is ready.\n“下午我要出门”：明确地点与时间、调用天气工具、检查返回结果、调整准备清单，再核对是否完成。\nA tool failure is unknown, not sunshine. Retry or ask the person; never invent live weather.\n工具失败意味着未知，不是晴天。重试或请人核查，不编造实时天气。本页天气与工具调用均为课堂模拟。',
 transfer:'Useful agents connect a goal to tools, feedback and a checkable result. Begin with a small, bounded task.\n从一个边界清晰的小任务开始：说明目标、提供工具、明确可做与不可做，再验收结果。\nStudent: use supplied notes to draft study slides and a practice webpage, run checks, then explain independently.\n学生：根据提供的笔记制作复习课件与练习网页，检查后独立解释。\nTeacher: use approved materials to draft a lesson, practice activity and preview page, check sources and objectives before use.\n教师：根据审定材料制作课件、练习与预览页，核对来源和教学目标后再使用。'
};
function fallback(en,zh){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 600"><rect width="1080" height="600" fill="#eaf2f8"/><text x="48" y="200" font-family="sans-serif" font-size="36" fill="#3f3f46">${en}</text><text x="48" y="260" font-family="KaiTi,serif" font-size="34" fill="#7030a0">${zh}</text></svg>`;}
export function addAgentSlides(data){
 if(data.agentVersion||!data.slides.some(s=>s.n===22))return data;
 data.agentVersion='20261117-story1';const original=data.slides.find(s=>s.n===36),chapter=data.slides.find(s=>s.n===22).chapter;
 data.slides=data.slides.filter(s=>![36,69,70,71,72,73].includes(s.n));
 const slides=topics.map(([n,kind,en,zh])=>{const svg=fallback(en,zh);return {n,chapter,title:zh,titleEn:en,titleZh:zh,svg,thumb:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),text:texts[kind],textExcerpt:false,originalLinks:n===73?[agentSource,'https://ffmpeg.org/ffmpeg.html','https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html','https://python-pptx.readthedocs.io/en/latest/','https://python-docx.readthedocs.io/en/latest/']:[agentSource],interactive:'agent-'+kind,originalSvg:n===36?original?.svg:null,studentTask:'挑选一个多步骤任务：写出目标、工具、需由你确认的动作，以及怎么验收。',studentTaskEn:'Define a goal, tools, actions requiring your confirmation, and a checkable result.'};});
 data.slides.splice(data.slides.findIndex(s=>s.n===22)+1,0,...slides);return data;
}
export function agentRecommendation(values={}){
 const count=k=>Math.max(0,Number(values[k])||0),agent=count('agent'),nonAgent=count('chat')+count('assisted')+count('none'),unsure=count('unsure'),total=agent+nonAgent+unsure;
 const kind=total<5?'small':nonAgent>total/2?'intro':unsure>=total/3?'clarify':agent>total/2?'advanced':'mixed';
 return {total,agent,nonAgent,unsure,kind};
}
const suggestions={small:'样本少或尚未作答：先口头询问，再决定节奏。',intro:'超过半数选择了问答、辅助工具或尚未使用：建议重点讲入门比喻，再做一次完整演示。',clarify:'较多人选择“不确定”：先澄清“问答＋工具”和 Agent 自主推进任务的区别。',advanced:'超过半数自述用过 Agent：可简讲比喻，重点讨论失败、权限和验收。',mixed:'经验混合：保留简短入门，再请有经验者分享一个具体任务。'};
export function mountAgentLesson(host,slide,edition){
 if(!document.querySelector('link[data-agent-lesson]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./agent-lesson.css?v=20261117-story1',import.meta.url).href;css.dataset.agentLesson='true';document.head.append(css);}
 if(slide.interactive!=='agent-poll')return mountAgentScene(host,slide,edition);
 const root=document.createElement('section');root.className='agent-lab agent-poll';host.append(root);
 root.innerHTML=`<h1>Back to our AI pulse <span class="agent-poll-title-zh">回看问卷：我们用到哪一步？</span></h1><p>Same room, same question · 本场课前问卷的“目前用到哪一步”</p><div class="agent-poll-controls"><label>Group / 分组 <select aria-label="Agent poll group"><option value="all">全体 / Everyone</option><option value="student">学生 / Students</option><option value="teacher">教师 / Teachers</option><option value="both">两者都是 / Both</option><option value="other">其他 / Other</option></select></label><button data-refresh>Refresh / 刷新</button><a href="#s66">回看完整画像 ↗</a></div><p class="agent-poll-status" role="status"></p><div class="agent-poll-bars"></div><div class="agent-recommendation" aria-live="polite"></div><p class="agent-poll-note">按本题实际作答数计算；“不确定”单列。自述不等于熟练程度，只描述本场参与者。建议不自动跳页，讲者决定节奏。若含测试答卷，请换正式场次后解读。</p>`;
 const select=root.querySelector('select'),status=root.querySelector('[role=status]'),bars=root.querySelector('.agent-poll-bars'),recommend=root.querySelector('.agent-recommendation');let data=null,disposed=false,busy=false;const session=sessionId();
 function render(){if(!data)return;const values=(select.value==='all'?data:data.countsByRole?.[select.value])?.counts?.mode||{},summary=agentRecommendation(values);bars.replaceChildren();
  for(const [id,label] of questions.find(q=>q.id==='mode').options){const n=Math.max(0,Number(values[id])||0),row=document.createElement('div');row.className='agent-poll-row';row.dataset.mode=id;const name=document.createElement('span');name.textContent=label;const track=document.createElement('div'),fill=document.createElement('i');fill.style.width=(summary.total?n/summary.total*100:0)+'%';track.append(fill);const number=document.createElement('b');number.textContent=`${n} · ${summary.total?Math.round(n/summary.total*100):0}%`;row.append(name,track,number);bars.append(row);}
  recommend.dataset.recommendation=summary.kind;recommend.textContent=`${summary.total} 人回答本题 · ${suggestions[summary.kind]}`;
 }
 async function refresh(){if(busy||disposed)return;if(!validSession(session)){status.textContent='场次编号无效，请回到开场问卷设置场次。';return;}busy=true;try{const next=await request('/results?session='+encodeURIComponent(session));if(disposed)return;if(!next.counts||!Number.isInteger(next.total))throw Error('Invalid response');data=next;render();status.textContent=`${session} · 更新 ${new Date().toLocaleTimeString()} · 每 5 秒刷新`;status.dataset.stale='false';}catch{if(disposed)return;status.textContent=data?'刷新失败：保留上次结果，以下建议可能已过时。':'暂时无法读取问卷；这不代表零人使用 Agent。可口头询问后继续。';status.dataset.stale='true';if(!data)recommend.textContent='尚无可用数据，不推断本班使用情况。';}finally{busy=false;}}
 select.addEventListener('change',render);root.querySelector('[data-refresh]').addEventListener('click',refresh);refresh();const timer=setInterval(()=>{if(!document.hidden)refresh();},5000);return()=>{disposed=true;clearInterval(timer);root.remove();};
}
