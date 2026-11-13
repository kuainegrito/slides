import json,re
from pathlib import Path
R=Path(__file__).resolve().parent;D=R/'site/ai/survival-202608'
text='A Universe of Tokens\n词元的语义星云\nFour context stories, automatically switching every eight seconds. Pause and select either sentence to explore.\n每八秒切换一组语境；可以暂停，点击句子手动切换。\nRelated words and English, Chinese, French and Spanish equivalents occupy shared semantic regions.\n关联词与英、中、法、西班牙语词语共同组成语义星云。\nWatch a contextual representation move between meanings: bank, light, flower / spend, mouse.\n观察语境化表示在不同含义之间移动：河岸／银行、光／轻、花朵／花钱、老鼠／鼠标。\nSynthetic 8D contextual states projected into 3D; paths are illustrative, not model traces. Word labels may contain several tokens.\n合成八维语境状态的三维投影，移动路径为教学示意；词语可能包含多个词元。'
cn='暂停 mouse 的动画，分别点击“老鼠吃奶酪”和“用鼠标点击”。观察猫、狗、奶酪与键盘、屏幕等邻居，以及法语 souris 和西班牙语 ratón。为什么相同词形会对应不同语境化表示？再用“花朵／花钱”解释上下文的作用。'
en='Pause mouse, then select the animal and computer sentences. Compare cat, dog and cheese with keyboard and screen, including French souris and Spanish ratón. Why can the same spelling have different contextual representations? Explain flower versus spend in Chinese.'
for rel in ['site/ai/survival-202608/slides.json','site/ai/survival/student/slides.json']:
 p=R/rel;data=json.loads(p.read_text(encoding='utf8'));s=next(s for s in data['slides'] if s['n']==21);s['text']=text;s['thumb']=('/slides/ai/survival-202608/' if '/student/' in rel else '')+'assets/tokens-preview-v2.webp'
 if '/student/' in rel:s.update(studentTask=cn,studentTaskEn=en)
 p.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
p=R/'refine_interactive_20261113.py';source=p.read_text(encoding='utf8');start=source.index('UPDATES=');end=source.index('\ndef apply_page',start);ns={};exec(source[start:end],ns);ns['UPDATES'][21]['text']=text;source=source[:start]+'UPDATES='+repr(ns['UPDATES'])+source[end:];source=source.replace('(name+"-preview-v1.webp")','(name+("-preview-v2.webp" if name=="tokens" else "-preview-v1.webp"))');p.write_text(source,encoding='utf8')
for fn,value in [('build_student.py',cn),('bilingual_metadata.py',en)]:
 p=R/fn;s=p.read_text(encoding='utf8');s=re.sub(r'^21:.*$',lambda m:'21:'+repr(value)+',',s,flags=re.M);p.write_text(s,encoding='utf8')
for name in ['deck.js','index.html']:
 p=D/name;s=p.read_text(encoding='utf8');
 for stem in ['tokens.js','tokens.css','deck.js','slides.json']:s=s.replace(stem+'?v=20261113-gd5',stem+'?v=20261113-tk2')
 p.write_text(s,encoding='utf8')
p=R/'build_editions.py';s=p.read_text(encoding='utf8').replace("version='20261113-gd5'","version='20261113-tk2'").replace("sourceVersion='20261113-gd5'","sourceVersion='20261113-tk2'")
for stem in ['tokens.js','tokens.css']:s=s.replace(stem+'?v=20261113-gd5',stem+'?v=20261113-tk2')
p.write_text(s,encoding='utf8')
print('Updated P21 only and durable build hooks')
