from pathlib import Path
ROOT=Path(__file__).resolve().parent;D=ROOT/'site/ai/survival-202608';B=ROOT/'work/bilingual-v1/before/site/ai/survival-202608'
s=(B/'deck.js').read_text(encoding='utf8')
s="import {bi,setBi,escapeText} from './bilingual.js?v=20261112-bi1';\n"+s
s=s.replace("'./neural.js?v=20261111-nn1'","'./neural.js?v=20261112-bi1'").replace("'./gradient.js?v=20261110-r2a'","'./gradient.js?v=20261112-bi1'").replace("fetch('slides.json?v=20261111-nn1')","fetch('slides.json?v=20261112-bi1')")
s=s.replace("$('motion').querySelector('span').textContent = paused ? '动效已关' : '动效';", "$('motion').innerHTML='◌ '+bi(paused?'Motion off':'Motion',paused?'动效已关':'动效',true);")
s=s.replace("$('chapter-label').textContent=chapter.title;", "setBi($('chapter-label'),chapter.en,chapter.title);")
s=s.replace("caption.append(number,document.createTextNode(s.title));", "caption.append(number);const words=document.createElement('span');words.className='thumb-title';setBi(words,s.titleEn,s.title);caption.append(words);")
s=s.replace("$('text-title').textContent=s.title;$('text-content').textContent=(s.textExcerpt?'图中文字摘录\\n\\n':'')+(s.text||'本页以原图呈现。');", "setBi($('text-title'),s.titleEn,s.title);$('text-content').innerHTML=(s.textExcerpt?bi('Text extracted from the original picture','图中文字摘录')+'<br><br>':'')+colorTranscript(s.text||'本页以原图呈现。');")
s=s.replace("title.textContent=c.title;subtitle.textContent=c.en;", "title.textContent=c.en;title.className='lang-en';subtitle.textContent=c.title;subtitle.className='lang-zh';")
ui='''
  function colorTranscript(value){return String(value).split('\\n').map(line=>escapeText(line).replace(/[\\u3000-\\u9fff\\uff00-\\uffef]+|[^\\u3000-\\u9fff\\uff00-\\uffef]+/g,part=>'<span class="'+(/[\\u3400-\\u9fff]/.test(part)?'lang-zh':'lang-en')+'">'+part+'</span>')).join('\\n');}
  function localizeUi(){
    for(const [id,icon,en,zh] of [['fullscreen','⛶','Fullscreen','全屏'],['overview-toggle','▦','Overview','总览'],['text-toggle','T','Text','文字'],['student-task-toggle','◎','Task','课堂任务'],['laser-toggle','⌖','Pointer','激光笔']]){const el=$(id);if(el)el.innerHTML=icon+' '+bi(en,zh,true);}
    const home=document.querySelector('.home-link>span:last-child');if(home)setBi(home,document.documentElement.dataset.edition?'Editions':'Course hub',document.documentElement.dataset.edition?'版本选择':'课件中心',true);
    const badge=document.querySelector('.edition-badge');if(badge)setBi(badge,document.documentElement.dataset.edition==='student'?'Student':'Teacher',document.documentElement.dataset.edition==='student'?'学生版':'教师版',true);
    for(const [sel,en,zh] of [['#chapters h2','Contents','章节目录'],['#overview h2','Slide overview','课件总览'],['#help h2','Presentation shortcuts','放映快捷键'],['#jump h2','Go to the original PDF page','跳转到原 PDF 页码'],['label[for="jump-input"]','Page (1–63)','页码（1–63）'],['#jump .primary','Go','前往']]){const el=document.querySelector(sel);if(el)setBi(el,en,zh,true);}
    const descriptions=[['Previous / next slide','上一页 / 下一页'],['Fullscreen','全屏放映'],['Overview / contents','缩略图总览 / 章节目录'],['Slide text / pointer','本页文字 / 激光笔'],['Close panel or leave fullscreen','关闭面板或退出全屏']];
    document.querySelectorAll('#help dd').forEach((el,i)=>setBi(el,...descriptions[i]));
    setBi(document.querySelector('#help p'),'Swipe left or right on touchscreens. Click the page number to jump to an original PDF page.','触屏可左右轻扫翻页。点击页码可跳到原 PDF 对应页。');
    document.querySelector('#search').placeholder='Search / 搜索主题、关键词或 PDF 页码';
    const loading=content.querySelector('.loading');if(loading)setBi(loading,'Opening the slides…','正在打开课件…');
  }
  localizeUi();
'''
s=s.replace("  fetch('slides.json?v=20261112-bi1')",ui+"  fetch('slides.json?v=20261112-bi1')")
(D/'deck.js').write_text(s,encoding='utf8')
p=D/'index.html';h=(B/'index.html').read_text(encoding='utf8').replace('<script src="deck.js?v=20261111-nn1" defer></script>','<script type="module" src="deck.js?v=20261112-bi1"></script>\n  <link rel="stylesheet" href="bilingual.css?v=20261112-bi1">');p.write_text(h,encoding='utf8')
p=ROOT/'build_editions.py';s=p.read_text(encoding='utf8').replace("version='20261111-student2'","version='20261112-bi1'").replace("sourceVersion='20261111-nn1'","sourceVersion='20261112-bi1'")
s=s.replace("player=player.replace(\"import('./gradient.js?v=20261110-r2a')\",\"import('/slides/ai/survival-202608/gradient.js?v=20261110-r2a')\")", "player=player.replace(\"import('./gradient.js?v=20261112-bi1')\",\"import('/slides/ai/survival-202608/gradient.js?v=20261112-bi1')\")")
s=s.replace("player=player.replace(\"import('./neural.js?v=20261111-nn1')\",\"import('/slides/ai/survival-202608/neural.js?v=20261111-nn1')\")", "player=player.replace(\"import('./neural.js?v=20261112-bi1')\",\"import('/slides/ai/survival-202608/neural.js?v=20261112-bi1')\")\nplayer=player.replace(\"from './bilingual.js?v=20261112-bi1'\",\"from '/slides/ai/survival-202608/bilingual.js?v=20261112-bi1'\")")
s=s.replace("$('student-task-title').textContent=s.title;", "setBi($('student-task-title'),s.titleEn,s.title);")
s=s.replace("$('student-task-content').textContent=s.studentTask||'试着用自己的话解释这一页。';", "setBi($('student-task-content'),s.studentTaskEn||'Explain this slide in your own words.',s.studentTask||'试着用自己的话解释这一页。');")
s=s.replace("f'<script src=\"deck.js?v={sourceVersion}\" defer></script>'", "f'<script type=\"module\" src=\"deck.js?v={sourceVersion}\"></script>'")
s=s.replace('<script src="../player.js?v={version}" defer></script>', '<script type="module" src="../player.js?v={version}"></script>')
s=s.replace("    doc=doc.replace('<title>","    doc=doc.replace('href=\"bilingual.css?v=20261112-bi1\"',f'href=\"{shared}bilingual.css?v=20261112-bi1\"')\n    doc=doc.replace('<title>")
p.write_text(s,encoding='utf8')
print('Rebuilt player and edition generator')
