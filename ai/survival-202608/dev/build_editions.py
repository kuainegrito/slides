"""Publishable edition picker and two small players, sharing the original media."""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'site/ai/survival-202608';HUB=ROOT/'site/ai/survival'
HUB.mkdir(parents=True,exist_ok=True)
shared='/slides/ai/survival-202608/'
version='20261115-context1'
sourceVersion='20261115-context1'
playerVersion='20261115-context1'

player=(SOURCE/'deck.js').read_text(encoding='utf8')
player=player.replace("const $ = id => document.getElementById(id);", """const $ = id => document.getElementById(id);
  const edition=document.documentElement.dataset.edition;
  const editionLabel=edition==='student'?'学生版':'教师版';
  const sourceURL=new URL(document.documentElement.dataset.source,location.href);
  const storageKey=name=>'ai-survival-'+edition+'-'+name;
  function resolveSource(data){
    const asset=p=>p?new URL(p,sourceURL).href:p;
    data.background=asset(data.background);
    for(const slide of data.slides){
      slide.svg=slide.svg.replace(/href=\"([^\"]+)\"/g,(all,path)=>'href=\"'+asset(path)+'\"');
      slide.thumb=asset(slide.thumb);if(slide.video)slide.video=asset(slide.video);
      if(slide.media){slide.media.src=asset(slide.media.src);slide.media.poster=asset(slide.media.poster);}
    }
    return data;
  }""")
player=player.replace("'ai-survival-motion'","storageKey('motion')").replace("'ai-survival-last-page'","storageKey('last-page')")
player=player.replace("import('./valley.js?v=20261113-valley2')","import('/slides/ai/survival-202608/valley.js?v=20261118-colors1')")
player=player.replace("import('./descent.js?v=20261113-gd5')","import('/slides/ai/survival-202608/descent.js?v=20261113-gd5')")
player=player.replace("import('./tokens.js?v=20261115-urdu2')","import('/slides/ai/survival-202608/tokens.js?v=20261118-colors1')")
player=player.replace("fetch('slides.json?v="+sourceVersion+"')","fetch(sourceURL)")
player=player.replace("import('./context-window.js?v=20261115-context1')","import('/slides/ai/survival-202608/context-window.js?v=20261115-context1')")
player=player.replace("import('./neural.js?v=20261112-bi4')","import('/slides/ai/survival-202608/neural.js?v=20261112-bi4')")
player=player.replace("from './bilingual.js?v=20261114-aikai1'","from '/slides/ai/survival-202608/bilingual.js?v=20261114-aikai1'")
player=player.replace(".then(data=>{deck=data;slides=data.slides;", ".then(raw=>{const data=resolveSource(raw);deck=data;slides=data.slides;")
player=player.replace("slide.title+' · AI 课件 · 于快'","slide.title+' · '+editionLabel+' · 于快'")
player=player.replace("s.title+' '+s.text).toLowerCase()", "s.title+' '+s.text+' '+(s.studentTask||'')).toLowerCase()")
player=player.replace("$('text-toggle').addEventListener('click',showText);", """$('text-toggle').addEventListener('click',showText);
  $('student-task-toggle')?.addEventListener('click',()=>{
    const s=slides[current];setBi($('student-task-title'),s.titleEn,s.titleZh||s.title);
    setBi($('student-task-content'),s.studentTaskEn||'Explain this slide in your own words.',s.studentTask||'试着用自己的话解释这一页。');
    $('student-task-links').replaceChildren();
    for(const uri of s.originalLinks||[]){const a=document.createElement('a');a.href=uri;a.target='_blank';a.rel='noopener noreferrer';
      setBi(a,...(uri.includes('/cycling/')?['Open the cycling metabolism simulator ↗','打开骑行能量代谢模拟器 ↗']:uri.includes('/homeostasis/')?['Open the homeostasis simulator ↗','打开稳态模拟器 ↗']:uri==='https://www.kuaiyu.site/'?['Visit Kuai Yu’s website ↗','打开于快的网站 ↗']:['Open reference ↗','打开本页参考链接 ↗']));$('student-task-links').append(a);}
    openPanel('student-task','student-task-toggle');
  });""")
# Classroom poll: preserve the four runtime slides when rebuilding editions.
player="import {addSurveySlides,mountSurvey} from './survey/slides.js?v=20261120-closing1';\n"+player
player=player.replace('const data=resolveSource(raw);','const data=resolveSource(addSurveySlides(raw));')
player=player.replace("    if(slide.interactive==='context'){","    if(slide.interactive?.startsWith('survey-')) disposeInteraction=mountSurvey(content,slide.interactive.slice(7));\n    if(slide.interactive==='context'){")
player=player.replace(".context-lab'", ".context-lab,.survey-lab'")
# Keep survey assets next to the existing player; copies go only into the F build tree.
import shutil
survey_source=ROOT.parents[2]/'ai/survival/survey'
if survey_source.is_dir(): shutil.copytree(survey_source,HUB/'survey',dirs_exist_ok=True)
edition_css=ROOT.parents[2]/'ai/survival/editions.css'
if edition_css.is_file(): shutil.copy2(edition_css,HUB/'editions.css')
shutil.copy2(edition_css.with_name('toolkit-kai-v1.woff2'),HUB/'toolkit-kai-v1.woff2')

# Edition opening: retain original content IDs and expose backups outside the main sequence.
player=player.replace('Page (1–63)','Slide ID (1–68)').replace('页码（1–63）','页码（1–73）')
player=player.replace('for(const slide of data.slides){','for(const slide of [...data.slides,...(data.backupSlides||[])]){')
player=player.replace('if(i<0){if(notify)',"if(i<0){if(deck.backupSlides?.some(s=>s.n===n)){const u=new URL(location.href);u.searchParams.set('backups','1');u.hash='s'+n;location.assign(u.href);return true;}if(notify)")
player=player.replace("deck=data;slides=data.slides;","deck=data;slides=data.slides;const backupLink=document.createElement('a');const backupURL=new URL(location.href);const inBackups=new URLSearchParams(location.search).get('backups')==='1';if(inBackups)backupURL.searchParams.delete('backups');else backupURL.searchParams.set('backups','1');backupURL.hash=inBackups?'s1':'s3';backupLink.href=backupURL.href;backupLink.className='opening-backups';backupLink.textContent=inBackups?'Return to presentation / 返回正式放映':'Opening backups (original pages 3–4) / 开场备份（原第 3–4 页）';document.querySelector('#overview .panel-head').after(backupLink);")
player="import {mountMeaning} from './meaning-flow.js?v=20261117-particles2';\n"+player
player=player.replace("    if(slide.interactive==='descent'){","    if(slide.n===18)disposeInteraction=mountMeaning(content,slide.svg);\n    if(slide.interactive==='descent'){")
player=player.replace('.context-lab,.survey-lab','.context-lab,.survey-lab,.meaning-lab')
shutil.copy2(ROOT.parents[2]/'ai/survival/meaning-flow.js',HUB/'meaning-flow.js')
shutil.copy2(ROOT.parents[2]/'ai/survival/meaning-art.js',HUB/'meaning-art.js')
player="import {mountApplicationScene} from './application-scenes.js?v=20261117-scenes3';\n"+player
player=player.replace("    if(slide.n===18)disposeInteraction=mountMeaning(content,slide.svg);","    if(slide.n===18)disposeInteraction=mountMeaning(content,slide.svg);\n    if(slide.n===20||slide.n===22)disposeInteraction=mountApplicationScene(content,slide,edition);")
player=player.replace('.survey-lab,.meaning-lab','.survey-lab,.meaning-lab,.application-scene')
for module in ['application-scenes.js','prose-scene.js','code-scene.js','scene-particles.js','scene-results.js']:
    shutil.copy2(ROOT.parents[2]/('ai/survival/'+module),HUB/module)
# Agent bridge follows basic applications; stable source IDs and original artwork remain.
player="import {addAgentSlides,mountAgentLesson} from './agent-lesson.js?v=20261119-qol1';\n"+player
player=player.replace('resolveSource(addSurveySlides(raw))','resolveSource(addAgentSlides(addSurveySlides(raw)))')
player=player.replace('    if(slide.n===18)',"    if(slide.interactive?.startsWith('agent-'))disposeInteraction=mountAgentLesson(content,slide,edition);\n    if(slide.n===18)")
player=player.replace('.meaning-lab,.application-scene','.meaning-lab,.application-scene,.agent-lab')
player=player.replace('slide.thumb=asset(slide.thumb);', 'if(slide.originalSvg)slide.originalSvg=slide.originalSvg.replace(/href="([^"]+)"/g,(all,path)=>\'href="\'+asset(path)+\'"\');\n      slide.thumb=asset(slide.thumb);')
player=player.replace('1–68','1–73')
for module in ['agent-lesson.js','agent-scenes.js','agent-lesson.css','agent-story.js','agent-story-art.js','agent-workbench.js','agent-studio.js','agent-workbench-media.js']:
    shutil.copy2(ROOT.parents[2]/('ai/survival/'+module),HUB/module)
shutil.copytree(ROOT.parents[2]/'ai/survival/agent-media',HUB/'agent-media',dirs_exist_ok=True)
shutil.copy2(ROOT.parents[2]/'ai/survival/index.html',HUB/'index.html')
player=player.replace('presentation.js?v=20261114-coverflood1','presentation.js?v=20261119-qol1')
player="import {colorEditionArtwork, refineEditionSlide, setBilingualCopy, watchEditionColors} from './edition-language.js?v=20261118-p9play1';\n"+player
player=player.replace('    for(const slide of [...data.slides,...(data.backupSlides||[])]){',"    for(const slide of [...data.slides,...(data.backupSlides||[])]){\n      refineEditionSlide(slide,edition,slide.sourceLabel?.startsWith('Backup'));")
player=player.replace('    prepareSteps(content,current===0,current===slides.length-1);',"    colorEditionArtwork(content.querySelector(':scope > svg'),slide);\n    prepareSteps(content,current===0,current===slides.length-1,!slide.staticPresentation);")
player=player.replace("    stage.classList.remove('entering');void stage.offsetWidth;stage.classList.add('entering');","    stage.classList.remove('entering');\n    if(!slide.staticPresentation){void stage.offsetWidth;stage.classList.add('entering');}")
player=player.replace('  function colorTranscript(value){return String(value).split(\'\\n\').map(line=>escapeText(line).replace(/[\\u3000-\\u9fff\\uff00-\\uffef]+|[^\\u3000-\\u9fff\\uff00-\\uffef]+/g,part=>\'<span class="\'+(/[\\u3400-\\u9fff]/.test(part)?\'lang-zh\':\'lang-en\')+\'">\'+part+\'</span>\')).join(\'\\n\');}',"  function colorTranscript(value){const copy=document.createElement('div');setBilingualCopy(copy,value);return copy.innerHTML;}")
shutil.copy2(ROOT.parents[2]/'ai/survival/edition-language.js',HUB/'edition-language.js')
shutil.copy2(ROOT.parents[2]/'ai/survival-202608/assets/lenet-demo-still-v1.webp',SOURCE/'assets/lenet-demo-still-v1.webp')
shutil.copy2(ROOT.parents[2]/'ai/survival-202608/assets/bilingual-kai-hua-v1.woff2',SOURCE/'assets/bilingual-kai-hua-v1.woff2')
player=player.replace('  installPresentation();','  installPresentation();\n  watchEditionColors(content);')
player="import {layoutPressTimeline} from './press-timeline.js?v=20261119-qol1';\n"+player
player=player.replace("    colorEditionArtwork(content.querySelector(':scope > svg'),slide);","    const artwork=content.querySelector(':scope > svg');\n    colorEditionArtwork(artwork,slide);\n    if(slide.n===9&&artwork)layoutPressTimeline(artwork);")
shutil.copy2(ROOT.parents[2]/'ai/survival/press-timeline.js',HUB/'press-timeline.js')
# Classroom sequence, app keyboard routing and visible page numbers.
player="import {arrangeClassroomSlides} from './classroom-sequence.js?v=20261120-closing1';\nimport {renderClassroomApp,classroomAppConsumesKey} from './classroom-app-slides.js?v=20261119-classroom1';\n"+player
player=player.replace("    if(slide.interactive?.startsWith('agent-'))disposeInteraction=mountAgentLesson(content,slide,edition);\n","    renderClassroomApp(content,slide);\n    if(slide.interactive?.startsWith('agent-'))disposeInteraction=mountAgentLesson(content,slide,edition);\n",1)
player=player.replace("      import('/slides/ai/survival-202608/neural.js?v=20261112-bi4').then(module=>{\n","      import('/slides/ai/survival-202608/neural.js?v=20261119-classroom1').then(module=>{\n",1)
player=player.replace("    stage.setAttribute('aria-label',slide.sourceLabel?slide.title:slide.title+'，原 PDF 第 '+slide.n+' 页');\n","    stage.setAttribute('aria-label',slide.title+'，第 '+(current+1)+' 页');\n",1)
player=player.replace("    $('current').textContent=current+1;$('total').textContent=slides.length;$('source-page').textContent=slide.sourceLabel||('PDF '+slide.n);\n","    $('current').textContent=current+1;$('total').textContent=slides.length;\n",1)
player=player.replace("该原 PDF 页未纳入放映。", "找不到该幻灯片。", 1)
player=player.replace("b.dataset.page=s.n;b.dataset.search=(s.n+", "b.dataset.page=s.n;b.dataset.position=index+1;b.dataset.search=((index+1)+", 1)
player=player.replace("'原 PDF 第 '+s.n+' 页：'", "'第 '+(index+1)+' 页：'", 1)
player=player.replace("number.textContent=String(s.n).padStart", "number.textContent=String(index+1).padStart", 1)
player=player.replace("b.dataset.page===q", "b.dataset.position===q", 1)
player=player.replace("stage.addEventListener('touchstart',e=>{if(e.target.closest(", "stage.addEventListener('touchstart',e=>{if(slides[current]?.interactive?.startsWith('classroom-')||e.target.closest(", 1)
player=player.replace("$('jump-input').value=slides[current].n", "$('jump-input').value=current+1", 1)
player=player.replace(
    "if(goPdf(Number($('jump-input').value))){$('jump').close();}else setBi($('jump-error'),'This page is excluded. Choose another page.','该页未纳入放映，请选择其他页码。');",
    "const page=$('jump-input').valueAsNumber;if(Number.isInteger(page)&&page>=1&&page<=slides.length){setSlide(page-1);$('jump').close();}else setBi($('jump-error'),'Enter a slide number from 1 to '+slides.length+'.','请输入 1 至 '+slides.length+' 的放映页码。');",
    1,
)
player=player.replace(
    "||document.querySelector('dialog[open]'))return;switch(e.key){",
    "||document.querySelector('dialog[open]'))return;if(classroomAppConsumesKey(slides[current],e.key)){e.preventDefault();return;}switch(e.key){",
    1,
)
player=player.replace("'Go to slide ID','跳转到原 PDF 页码'", "'Go to slide','跳转到幻灯片'", 1)
player=player.replace("'Slide ID (1–73)','页码（1–73）'", "'Slide number','放映页码'", 1)
player=player.replace("    setBi(document.querySelector('#help p'),'Swipe left or right on touchscreens. Click the page number to jump to an original PDF page.','触屏可左右轻扫翻页。点击页码可跳到原 PDF 对应页。');\n    document.querySelector('#search').placeholder='Search / 搜索主题、关键词或 PDF 页码';\n","    setBi(document.querySelector('#help p'),'Click the page number to jump. Use the on-screen arrows when a classroom simulator is open.','点击页码可跳转。课堂模拟器开启时，请用屏幕箭头翻页。');\n    document.querySelector('#search').placeholder='Search / 搜索主题、关键词或放映页码';\n",1)
player=player.replace("resolveSource(addAgentSlides(addSurveySlides(raw)))", "resolveSource(arrangeClassroomSlides(addAgentSlides(addSurveySlides(raw)),edition))", 1)
player=player.replace("deck=data;slides=data.slides;", "deck=data;slides=data.slides;$('jump-input').max=String(slides.length);", 1)
for module in ['classroom-sequence.js','classroom-app-slides.js']:
    shutil.copy2(ROOT.parents[2]/('ai/survival/'+module),HUB/module)
shutil.copytree(ROOT.parents[2]/'ai/survival/classroom-posters',HUB/'classroom-posters',dirs_exist_ok=True)
(HUB/'player.js').write_text(player,encoding='utf8')
template=(SOURCE/'index.html').read_text(encoding='utf8')
for edition,caption in [('teacher','教师版'),('student','学生版')]:
    target=HUB/edition;target.mkdir(exist_ok=True)
    src=shared+'slides.json?v='+sourceVersion if edition=='teacher' else '/slides/ai/survival/student/slides.json?v='+version
    doc=template.replace('<html lang="zh-CN">',f'<html lang="zh-CN" data-edition="{edition}" data-source="{src}">')
    doc=doc.replace('href="deck.css?v=20261110-r2a"',f'href="{shared}deck.css?v=20261110-r2a"').replace('href="valley.css?v=20261113-valley2"',f'href="{shared}valley.css?v=20261113-valley2"')
    doc=doc.replace(f'<script type="module" src="deck.js?v={playerVersion}"></script>',f'<link rel="stylesheet" href="../editions.css?v={version}">\n  <script type="module" src="../player.js?v={playerVersion}"></script>')
    doc=doc.replace('href="neural.css?v=20261111-nn1"',f'href="{shared}neural.css?v=20261111-nn1"')
    doc=doc.replace('href="bilingual.css?v=20261114-aikai1"',f'href="{shared}bilingual.css?v=20261114-aikai1"')
    doc=doc.replace('href="descent.css?v=20261113-gd5"',f'href="{shared}descent.css?v=20261113-gd5"').replace('href="tokens.css?v=20261115-zoom1"',f'href="{shared}tokens.css?v=20261115-zoom1"')
    doc=doc.replace('<title>How to survive in the era of AI · 于快</title>',f'<title>如何在 AI 浪潮中存活 · {caption} · 于快</title>')
    doc=doc.replace('href="/slides/" title="返回课件中心"','href="../" title="选择教师版或学生版"').replace('<span>课件中心</span>','<span>版本选择</span>')
    doc=doc.replace('<small>Kuai Yu · 于快</small>',f'<small>Kuai Yu · 于快 <b class="edition-badge">{caption}</b></small>')
    if edition=='student':
        doc=doc.replace('教学应用，以及如何在 AI 浪潮中存活。','学习实践、作品探索，以及如何把 AI 素养练成大学基本功。')
        doc=doc.replace('<span class="edition">202608</span>','<span class="edition">STUDENT EDITION</span>')
        marker='<button id="text-toggle"'
        at=doc.index(marker);end=doc.index('</button>',at)+9
        doc=doc[:end]+'<button id="student-task-toggle" aria-label="本页课堂任务" title="本页课堂任务" aria-controls="student-task" aria-expanded="false">◎ <span>课堂任务</span></button>'+doc[end:]
        panel='<dialog id="student-task" class="panel transcript-panel"><div class="panel-head"><div><small>YOUR TURN</small><h2 id="student-task-title"></h2></div><button data-close aria-label="关闭课堂任务">×</button></div><p id="student-task-content"></p><div id="student-task-links"></div></dialog>'
        doc=doc.replace('<div id="toast"',panel+'\n  <div id="toast"')
    doc=doc.replace('../player.js?v='+playerVersion,'../player.js?v=20261120-closing1')
    doc=doc.replace('id="total">62','id="total">64')
    doc=re.sub(r'<span id="source-page">.*?</span>','',doc)
    doc=re.sub(r'(id="jump-input"[^>]* max=")\d+',r'\g<1>64',doc)
    doc=re.sub(r'页码（1–\d+）','放映页码',doc)
    doc=doc.replace('跳转到原 PDF 页码','跳转到幻灯片').replace('搜索主题、关键词或原 PDF 页码','搜索主题、关键词或放映页码').replace('点击页码可跳到原 PDF 对应页。','点击页码可跳转。课堂模拟器开启时，请用屏幕箭头翻页。')
    doc=doc.replace('../editions.css?v='+version,'../editions.css?v=20261120-closing1')
    (target/'index.html').write_text(doc,encoding='utf8')

data=json.loads((ROOT/'site/manifest.json').read_text(encoding='utf8'))
card=next(d for d in data['decks'] if d['id']=='ai/survival-202608')
card.update(href='./ai/survival/',structure='教师版 / 学生版 · 各 64 页',statusText='双版本已上线',updated='2026-11-11',highlights=['教师与学生双入口','原声视频与高维交互','学生学习任务与作品实践'])
data['updated_at']='2026-11-11'
(ROOT/'site/manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print('Built two edition players and updated the course index card')

# Keep every generated public course entry connected to Stats. Redirect-only wrappers
# are counted at their destination; source/reference HTML under dev is excluded.
for tracking_page in (ROOT/'site').rglob('*.html'):
    if 'dev' in tracking_page.relative_to(ROOT/'site').parts: continue
    tracking_data = tracking_page.read_bytes()
    if b'</body>' in tracking_data and b'visit-log.js' not in tracking_data:
        tracking_page.write_bytes(tracking_data.replace(b'</body>', b'<script defer src="/slides/visit-log.js?v=20261113.1"></script>\n</body>', 1))

# New teaching addenda are applied after base edition generation.
from build_context_window import install as install_context_window
install_context_window(ROOT/'site')
