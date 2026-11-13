from pathlib import Path
import json,re
cn='选择 date 或 avocat，点击“切换词义”，观察镜头如何沿光流移动，以及哪些词云被提亮。尝试解释 I brought a date to dinner 和 J’ai mangé mon avocat 的双关；为什么翻译后双关可能消失？'
en='Select date or avocat and switch meanings. Follow the camera and light flow between the highlighted clouds. Explain the puns in I brought a date to dinner and J’ai mangé mon avocat; why might the pun disappear in translation?'
extra='\nSix cases: bank, light, flower / spend, mouse, date, avocat.\n六组例子：河岸／银行、光／轻、花朵／花钱、老鼠／鼠标、约会／椰枣、律师／牛油果。\nI brought a date to dinner.\n我带了约会对象来吃晚餐。／我带了一颗椰枣来吃晚餐。\nJ’ai mangé mon avocat.\n我吃了我的牛油果。／我把我的律师吃了。\nThe camera follows the light between two highlighted semantic clouds. Switch meaning manually or play the eight-second tour.\n镜头沿光流穿行于两团提亮的语义词云；可以手动切换词义，或每八秒自动轮播。'
for fn in ['site/ai/survival-202608/slides.json','site/ai/survival/student/slides.json']:
 p=Path(fn);d=json.loads(p.read_text(encoding='utf8'));s=next(s for s in d['slides'] if s['n']==21);s['text']=s['text'].replace('Four context stories, automatically switching every eight seconds. Pause and select either sentence to explore.','Six context stories, automatically switching every eight seconds. Pause and switch meanings to explore.').replace('每八秒切换一组语境；可以暂停，点击句子手动切换。','每八秒切换一组语境；可以暂停，手动切换词义。')+extra;s['thumb']=s['thumb'].replace('-v4.webp','-v5.webp')
 if 'studentTask' in s:s.update(studentTask=cn,studentTaskEn=en)
 p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf8')
 if 'survival-202608' in fn:sourceText=s['text']
p=Path('refine_interactive_20261113.py');s=p.read_text(encoding='utf8');a=s.index('UPDATES=');b=s.index('\ndef apply_page');ns={};exec(s[a:b],ns);ns['UPDATES'][21]['text']=sourceText;s=s[:a]+'UPDATES='+repr(ns['UPDATES'])+s[b:];s=s.replace('-preview-v4.webp','-preview-v5.webp');p.write_text(s,encoding='utf8')
for fn,value in [('build_student.py',cn),('bilingual_metadata.py',en)]:
 p=Path(fn);s=p.read_text(encoding='utf8');s=re.sub(r'^21:.*$',lambda m:'21:'+repr(value)+',',s,flags=re.M);p.write_text(s,encoding='utf8')
s=Path('build_tokens_v2_fonts.py').read_text(encoding='utf-8-sig').replace('tokens-v2/fonts.json','tokens-v5/fonts.json').replace("+'-v2.woff2'","+'-v5.woff2'").replace("tokens-kai-v1.woff2","tokens-kai-v2.woff2");Path('build_tokens_v5_fonts.py').write_text(s,encoding='utf8')
