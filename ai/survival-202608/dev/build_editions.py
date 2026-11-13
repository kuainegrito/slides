"""Publishable edition picker and two small players, sharing the original media."""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'site/ai/survival-202608';HUB=ROOT/'site/ai/survival'
HUB.mkdir(parents=True,exist_ok=True)
shared='/slides/ai/survival-202608/'
version='20261113-tk9'
sourceVersion='20261113-tk9'

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
player=player.replace("import('./gradient.js?v=20261112-bi4')","import('/slides/ai/survival-202608/gradient.js?v=20261112-bi4')")
player=player.replace("import('./descent.js?v=20261113-gd5')","import('/slides/ai/survival-202608/descent.js?v=20261113-gd5')")
player=player.replace("import('./tokens.js?v=20261113-tk9')","import('/slides/ai/survival-202608/tokens.js?v=20261113-tk9')")
player=player.replace("fetch('slides.json?v="+sourceVersion+"')","fetch(sourceURL)")
player=player.replace("import('./neural.js?v=20261112-bi4')","import('/slides/ai/survival-202608/neural.js?v=20261112-bi4')")
player=player.replace("from './bilingual.js?v=20261112-bi4'","from '/slides/ai/survival-202608/bilingual.js?v=20261112-bi4'")
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
(HUB/'player.js').write_text(player,encoding='utf8')
template=(SOURCE/'index.html').read_text(encoding='utf8')
for edition,caption in [('teacher','教师版'),('student','学生版')]:
    target=HUB/edition;target.mkdir(exist_ok=True)
    src=shared+'slides.json?v='+sourceVersion if edition=='teacher' else '/slides/ai/survival/student/slides.json?v='+version
    doc=template.replace('<html lang="zh-CN">',f'<html lang="zh-CN" data-edition="{edition}" data-source="{src}">')
    doc=doc.replace('href="deck.css?v=20261110-r2a"',f'href="{shared}deck.css?v=20261110-r2a"').replace('href="gradient.css?v=20261110-r2a"',f'href="{shared}gradient.css?v=20261110-r2a"')
    doc=doc.replace(f'<script type="module" src="deck.js?v={sourceVersion}"></script>',f'<link rel="stylesheet" href="../editions.css?v={version}">\n  <script type="module" src="../player.js?v={version}"></script>')
    doc=doc.replace('href="neural.css?v=20261111-nn1"',f'href="{shared}neural.css?v=20261111-nn1"')
    doc=doc.replace('href="bilingual.css?v=20261112-bi4"',f'href="{shared}bilingual.css?v=20261112-bi4"')
    doc=doc.replace('href="descent.css?v=20261113-gd5"',f'href="{shared}descent.css?v=20261113-gd5"').replace('href="tokens.css?v=20261113-tk9"',f'href="{shared}tokens.css?v=20261113-tk9"')
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
    (target/'index.html').write_text(doc,encoding='utf8')

data=json.loads((ROOT/'site/manifest.json').read_text(encoding='utf8'))
card=next(d for d in data['decks'] if d['id']=='ai/survival-202608')
card.update(href='./ai/survival/',structure='教师版 / 学生版 · 各 62 页',statusText='双版本已上线',updated='2026-11-11',highlights=['教师与学生双入口','原声视频与高维交互','学生学习任务与作品实践'])
data['updated_at']='2026-11-11'
(ROOT/'site/manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print('Built two edition players and updated the course index card')
