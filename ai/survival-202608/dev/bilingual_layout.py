"""English first / charcoal; Chinese second / purple. Preserve source artwork."""
import ast,copy,html,json,re
from pathlib import Path
from xml.etree import ElementTree as E
from PIL import ImageFont
ROOT=Path(__file__).resolve().parent
NS='{http://www.w3.org/2000/svg}';E.register_namespace('',NS[1:-1])
EN='#3f3f46';ZH='#7030a0';FAMILY='BiSans, BiKai, sans-serif'
fonts={}
def width(s,size,lang):
 key=(lang,round(size*10));
 if key not in fonts:fonts[key]=ImageFont.truetype('C:/Windows/Fonts/'+('simkai.ttf' if lang=='zh' else 'SansSerifCollection.ttf'),round(size*10))
 return fonts[key].getlength(s)/10
def wrap(s,w,size,lang):
 out=[]
 for part in s.split('\n'):
  line=''
  for word in re.findall(r'[A-Za-z0-9][A-Za-z0-9’/.:−+→-]*|\s+|.',part):
   if line and width(line+word,size,lang)>w:out.append(line.strip());line=word.lstrip()
   else:line+=word
  if line:out.append(line.strip())
 return out
def text(x,y,s,size,lang='en',anchor='start'):
 content=html.escape(s)
 if lang=='zh':content=''.join(f'<tspan fill="{EN}">{html.escape(v)}</tspan>' if i%2 else html.escape(v) for i,v in enumerate(re.split(r'([A-Za-z][A-Za-z0-9 .-]*)',s)))
 return f'<text x="{x:.2f}" y="{y:.2f}" font-family="{FAMILY}" font-size="{size:.2f}" fill="{ZH if lang=="zh" else EN}" data-lang="{lang}" text-anchor="{anchor}">{content}</text>'
def pair(en,zh,x,y,w,h,es=18,zs=24,center=False):
 for _ in range(45):
  el=wrap(en,w,es,'en');zl=wrap(zh,w,zs,'zh');height=len(el)*es*1.18+len(zl)*zs*1.18+3
  if height<=h:break
  es*=.97;zs*=.97
 assert es>=9 and zs>=12,(en,es,zs,h)
 xx=x+w/2 if center else x;anchor='middle' if center else 'start';cursor=y
 out='<g class="bi-pair">'
 for line in el:cursor+=es*1.18;out+=text(xx,cursor,line,es,'en',anchor)
 cursor+=3
 for line in zl:cursor+=zs*1.18;out+=text(xx,cursor,line,zs,'zh',anchor)
 return out+'</g>'
def normalize(svg):
 root=E.fromstring(svg)
 for t in root.iter(NS+'text'):
  if t.get('data-lang'):continue
  t.set('font-family',FAMILY);t.set('fill',EN)
  # Keep the PDF's per-character x/y arrays while assigning script colors.
  if list(t):
   for c in t.iter(NS+'tspan'):c.set('fill',ZH if re.search('[\u3400-\u9fff]',c.text or '') else EN)
  else:
   source=t.text or '';t.text=None
   for token in re.findall(r'[\u3000-\u9fff\uff00-\uffef]+|[^\u3000-\u9fff\uff00-\uffef]+',source):
    sub=E.SubElement(t,NS+'tspan',{'fill':ZH if re.search('[\u3400-\u9fff]',token) else EN});sub.text=token
 return E.tostring(root,encoding='unicode')
def teacher(data):
 for s in data['slides']:
  if s.get('bilingualStyle')!='en-first-v1':
   if s['n']==26:
    r=E.fromstring(s['svg']);t=next(r.iter(NS+'text'));x=float(t.get('x').split()[0]);y=float(t.get('y').split()[0]);size=float(t.get('font-size'))
    r.append(E.fromstring(text(480,y-size*1.15,'How can we connect the knowledge?',min(29,size*.75),'en','middle')));s['svg']=E.tostring(r,encoding='unicode')
   elif s['n']==63:
    r=E.fromstring(s['svg']);ts=list(r.iter(NS+'text'));zh=next(t for t in ts if '谢' in ''.join(t.itertext()));en=next(t for t in ts if 'Thank' in ''.join(t.itertext()));zy,ey=zh.get('y'),en.get('y');zh.set('y',ey);en.set('y',zy);r.remove(en);r.insert(list(r).index(zh),en);s['svg']=E.tostring(r,encoding='unicode');s['text']='Thank you!\n谢谢！'
   elif s['n']==25 and data.get('edition')!='student':
    r=E.fromstring(s['svg']);r.append(E.fromstring(text(162.72,490,'Desktop link',11)));s['svg']=E.tostring(r,encoding='unicode')
   elif s['n']==8:
    r=E.fromstring(s['svg']);ts=list(r.iter(NS+'text'));extra=next(t for t in ts if ''.join(t.itertext())=='driver assistance');cn=next(t for t in ts if ''.join(t.itertext())=='交通预测、路径优化、驾驶辅助');ey,cy=extra.get('y'),cn.get('y');extra.set('y',cy);cn.set('y',ey);s['svg']=E.tostring(r,encoding='unicode')
  if s['n']==48 and not s.get('bilingualFooterInset'):
   r=E.fromstring(s['svg'])
   for t in r.iter(NS+'text'):
    yy=t.get('y','0').split()
    if yy and float(yy[0])>480:t.set('y',' '.join(str(float(v)-8) for v in yy))
   s['svg']=E.tostring(r,encoding='unicode');s['bilingualFooterInset']=8
  if s['n']==48 and data.get('edition')!='student' and not s.get('bilingualArtScale'):
   r=E.fromstring(s['svg']);g=E.Element(NS+'g',{'transform':'translate(28.8,0) scale(.94)'})
   for el in list(r):
    if el.tag not in (NS+'text',NS+'defs'):r.remove(el);g.append(el)
   r.insert(0,g);s['svg']=E.tostring(r,encoding='unicode');s['bilingualArtScale']=.94
  s['svg']=normalize(s['svg']);s['bilingualStyle']='en-first-v1'
  if s['n']==26:s['text']='How can we connect the knowledge?\n如何整合知识点？'
 from build_bilingual_thumbnails import apply_refs
 return apply_refs(data)

LIST_EN={
3:[('What have you used AI for recently?','Concepts, assignments, papers, code, or a project of your own?'),('Can you explain why the answer is right after closing AI?','Getting an answer and learning a method are different.'),('What real problem would you like to solve this semester?','Start with one course, one interest, or one small research task.')],
5:[('Where did AI come from?','Follow its history to understand how this change began.'),('How does AI learn and generate?','Explore data, neural networks, gradient descent and a high-dimensional slice.'),('How can AI support my learning?','Try simulations, diagrams, code and creative projects.'),('Which skills should I build for the future?','Subject knowledge, judgment, collaboration and lifelong learning.'),('What will I do after today?','Finish a small project with results you can check.')],
19:[('Understand: ask a specific question.','Request examples, then check the textbook or original source.'),('Practice: make AI a questioning partner.','Answer first, ask for gaps, then explain without help.'),('Explore: papers, data and code.','Keep sources and raw records; separate facts, assumptions and guesses.'),('Create: turn understanding into work.','Make a mechanism diagram, demonstration, small program or clear presentation.'),('Check: can you explain and transfer independently?','Try a new question or context to find out what you really understand.')],
49:[('State your learning goal and where you are stuck.','Explain what you know, what you do not understand and what help you need.'),('Break large tasks into small steps.','Question, research, analyze, write and check; keep your own decisions.'),('Ask for explanations and questions, not only answers.','Try first, request one hint, then finish independently.'),('Provide materials and boundaries.','Give the course scope, textbook or data; state what must not be invented.')],
50:[('Open the original, not just a plausible citation.','Check titles, authors, DOIs and pages. A request for citations does not ensure reliability.'),('Request feedback for your current understanding.','Share your level, prior knowledge and wrong steps; diagnose misconceptions before practice.'),('Use English well, and prioritize accurate understanding.','Read original sources and compare terminology. English output is not automatically more correct.')],
51:[('Recognize limits; add information or verify.','For new knowledge, live data, specialist claims or vague tasks, consult reliable sources and teachers.'),('Build your own learning workflow.','Save effective prompts, mistakes, checklists and versions as reusable methods.'),('Explain your process and follow the rules.','Disclose AI use as required; do not invent data or citations or pass off others’ work as your own.')],
56:[('Step 1: choose a problem you really care about.','Start from a course, an interest or a real need, and define success.'),('Step 2: build foundations alongside tool skills.','Understand key concepts; use AI to support reading, practice, code or communication.'),('Step 3: make something that works and can be explained.','A mechanism map, reproducible analysis, interactive demo or small tool.'),('Step 4: check, present and revise.','Seek questions and feedback; record AI’s contribution, your decisions and improvements.')],
57:[('Academic integrity and privacy.','Follow course rules; obtain permission before sharing sensitive or unpublished data.'),('Learn English and keep learning.','Reach original sources and different perspectives, and practice clear expression.'),('Work with teachers and classmates.','Bring specific questions and previous attempts; respond thoughtfully to different views.'),('Keep your interests and share actively.','Use AI to extend what you love; share methods, failures and improvements as well as results.')],
59:[('Build a strong foundation in one subject.','AI still needs people who explain problems, identify errors and understand mechanisms.'),('Use AI to explore another method.','Try programming, data analysis, design or another language in a real task.'),('Show evidence of your ability.','Use work, process records and clear explanations to show what you did, checked and learned.')]
}
FOOT_EN={49:'AI lowers the cost of trying; understanding and judgment still need your work.',50:'After a useful conversation, explain it in your own words and try a new problem.',51:'Final check: can you explain, reproduce and transfer it without the AI output?',56:'Aim to finish an explainable, verifiable project, not to collect more tools.',59:'These are my learning suggestions: keep experimenting, checking and reflecting as tools change.'}
def student(data):
 pages={s['n']:s for s in data['slides']}
 def art(n):
  r=E.fromstring(pages[n]['svg'])
  for p in r.iter():
   for c in list(p):
    if c.tag==NS+'text':p.remove(c)
  return ''.join(E.tostring(c,encoding='unicode') for c in r)
 def put(n,body):
  pages[n]['svg']=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg" aria-label="Bilingual slide / 双语幻灯片">{body}</svg>'
  pages[n]['text']='\n'.join(''.join(t.itertext()) for t in E.fromstring(pages[n]['svg']).iter(NS+'text'));pages[n]['bilingualStyle']='en-first-v1'
 def heading(en,zh):return pair(en,zh,36,10,888,80,23,29)
 tree=ast.parse((ROOT/'build_student.py').read_text(encoding='utf8'))
 for call in (n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='list_page'):
  args=[ast.literal_eval(a) for a in call.args];n,zh,en,items=args[:4];body=heading(en,zh);step=348/len(items)
  for i,((h,d),(eh,ed)) in enumerate(zip(items,LIST_EN[n])):
   y=105+i*step;body+=f'<circle cx="49" cy="{y+17}" r="12" fill="#e8eef5" stroke="#c2cddc"/>'+text(49,y+21,str(i+1),12,'en','middle')
   body+=pair(eh+' '+ed,h+'：'+d,76,y,838,step-6,18 if len(items)<4 else 15,23 if len(items)<4 else 19)
  if len(args)>5 and args[5]:body+=pair(FOOT_EN[n],args[5],38,478,884,51,14,18,True)
  put(n,body)
 # Custom pages keep the same images, with text in allocated bilingual boxes.
 b=art(4)+heading('AI literacy belongs in your learning toolkit','把 AI 素养，当作大学阶段的基本功')
 b+=pair('Original teacher-use report: teaching and learning are changing.','原课件中的教师应用报告：教与学都在变化',43,406,451,37,11,14,True)
 for y,en,zh in [(119,'Learn actively: ask AI for questions, examples and feedback; you provide understanding and judgment.','学得更主动：让 AI 追问、举例、反馈；你负责理解和判断。'),(225,'Make your ideas work: turn them into a diagram, program, demonstration or small tool.','做得更完整：把想法变成图解、程序、演示或一个小工具。'),(331,'Show your capabilities: use your process, checks and finished work to demonstrate growth.','形成可展示的能力：拿出过程、核验和作品，让别人看见你的成长。')]:b+=pair(en,zh,536,y,382,100,16,22)
 b+=pair('Start now: make questioning, verification and creation a habit.','从现在开始，把“会提问、会核验、会创造”练成习惯。',30,474,900,54,17,23,True);put(4,b)
 b=art(23)+heading('My work: turn physiology into a tool you can explore','我的实践：把能量代谢做成可体验的工具')
 b+=pair('Predict, interact, then explain what changed using the mechanism.','先预测，再操作，最后用机制解释观察到的变化。',25,443,910,44,16,22,True)
 b+=pair('Your challenge: change one condition and record the result, rather than simply playing once.','你的挑战：改变一个条件，记录一次结果，而不是只“玩一遍”。',25,488,910,41,13.5,18,True);put(23,b)
 b='<g transform="translate(57.6,0) scale(.88)">'+art(25)+'</g>'+heading('My work: explore complex homeostatic regulation','我的实践：让复杂稳态调控变得可探索')
 for y,en,zh in [(378,'Change one condition; predict the response before observing the simulation.','练习：只改一个条件，先预测调节方向，再观察模拟结果。'),(427,'Identify the stimulus and feedback. Which conclusions still need a textbook check?','说清：刺激是什么？反馈在哪里？哪些结论还要回到教材核对？'),(479,'Open the original tool in Classroom task. A simulator is a learning model.','在“课堂任务”中打开原工具；模拟器是学习模型。')]:b+=pair(en,zh,28,y,904,46,16,21,True)
 put(25,b)
 b=art(26)+pair('From scattered facts to a connected explanation','怎样把整本书，学成一张知识网？',122,200,716,93,25,32,True)+pair('Explain why each arrow connects the concepts.','概念之间的箭头，要能说出“为什么”。',130,307,700,54,18,24,True);put(26,b)
 b=art(28)+heading('Connect the mechanisms, not just the pictures','图能拼在一起，机制也讲得通吗？')+text(494,284,'+',63)
 b+=pair('Input → Regulation → Outcome','输入 → 调节 → 结果',30,420,900,51,22,29,True)+pair('Justify every link; find one step you cannot yet explain.','给每一条连接写出依据；找出一个你还解释不清的环节。',30,482,900,47,16,22,True);put(28,b)
 b=art(39)+pair('My teaching comics','我的教学漫画',27,290,194,57,17,24)+pair('Understand the mechanism, then tell its story.','先理解机制，再把它讲成故事。',27,355,194,101,16,22)+pair('Choose one and explain it in your own words.','选一幅，用自己的话解释。',27,467,194,60,12,16);put(39,b)
 b=art(40)+pair('Creations by my students','这些是我的学生创作的作品',27,303,330,75,20,25)+pair('Your work can be next. Choose a concept and create your own explanation.','下一个作品，可以是你的。选一个概念，做出自己的解释。',27,391,330,130,18,24);put(40,b)
 b=art(41)+pair('Read the textbook figure; explain the mechanism.','从看懂教材图，到讲清机制',34,400,414,65,19,25)+pair('Check the science before improving the visual presentation.','先核对科学内容，再优化视觉表达。',34,478,414,50,15,21);put(41,b)
 b=art(42)+heading('Read the paper: a visual summary does not replace evidence','读论文：别让漂亮图解替你判断')
 for y,en,zh in [(124,'Read the original first. What question was asked, and who or what was studied?','先看原文：研究问了什么？研究对象是谁？'),(252,'Check the summary. Where does the paper support its numbers, arrows and conclusions?','再看图解：图中的数字、箭头和结论在原文哪里？'),(380,'Explain it yourself in one minute: what was found, and what cannot be concluded?','最后自己讲：用一分钟说明发现了什么，不能推出什么。')]:b+=pair(en,zh,532,y,385,111,18,24)
 put(42,b)
 b=art(44)+pair('A fictional case: observe first, then explain the mechanism','虚拟病例：先描述你看到的，再解释机制',28,415,904,65,20,27,True)+pair('AI-generated characters are learning illustrations, not real patient records.','AI 生成角色用于学习示意；不能把画面当作真实患者资料。',28,487,904,43,15,20,True);put(44,b)
 b=art(45)+pair('Compare the images and propose an explanation you can verify','比较前后图像，练习提出可核验的解释',28,6,904,72,22,29,True)
 b+=pair('What can you observe, and which conclusions need more evidence?','哪些是画面线索？哪些结论需要额外证据？',28,419,904,58,19,25,True)+pair('These AI composites do not represent a real disease course or treatment effect.','这些变化为 AI 合成示意，不代表真实病程或疗效。',28,485,904,44,15,20,True);put(45,b)
 r=E.fromstring(pages[46]['svg']);credit=''.join(E.tostring(t,encoding='unicode') for t in r.iter(NS+'text') if float(t.get('x','0').split()[0])>750)
 b=art(46)+credit+pair('Use visual impact to draw attention, then make the message clear','用视觉吸引注意，再用内容说明问题',25,447,910,79,22,29,True);put(46,b)
 b=art(47)+heading('Connect disciplines with foundations and verification','跨学科连接，靠基础，也靠核验')+pair('Let AI suggest connections; use subject knowledge and reliable sources to test them.','让 AI 帮你搭桥；桥是否牢靠，要靠专业知识与可靠来源判断。',27,99,906,51,15,21,True)
 for x,en,zh,ed,zd in [(28,'Physiology → Pharmacology','从生理机制追问药理作用','Explain each causal step, then check it.','把因果链逐步写清楚，再查证。'),(508,'Engineering → Philosophy','从技术实践追问价值与意义','Separate facts, interpretations and values.','区分事实描述、解释与价值判断。')]:b+=pair(en,zh,x,434,424,55,19,25,True)+pair(ed,zd,x,494,424,36,12,17,True)
 put(47,b)
 b='<g transform="translate(62.4,0) scale(.87)">'+art(48)+'</g>'+pair('AI composite','AI 合成',790,256,147,70,17,23,True)
 b+=pair('My visual story brings three generations of cyclists together. Images can tell a story; claims about genetics and training still need research evidence.','我的视觉叙事示例：把三代骑行者放进同一画面。图像能帮助讲故事；遗传与训练的结论，仍要回到研究证据。',28,438,904,92,17,22,True);put(48,b)
 b=heading('The future of AI—and the learner you choose to become','面对 AI 的未来，你想成为什么样的学习者？')+pair('Subject foundations × AI literacy × Judgment and creation','专业基础 × AI 素养 × 判断与创造',30,193,900,125,28,40,True)+pair('Tools change. Keep practicing how to ask questions, verify results and collaborate.','工具会变，提出问题、验证结果、与人合作的能力值得持续练习。',40,356,880,94,21,28,True);put(52,b)
 b=art(58)+heading('Find your own foundation for learning with AI','找到你自己的“学习支点”')+pair('Original: finding a fulcrum in my teaching practice','原图：我在教学实践中寻找支点',39,416,464,36,11,15,True)
 for y,en,zh in [(124,'Subject foundations: understand key concepts so you can judge the output.','专业基础：知道关键概念，才有能力判断输出。'),(229,'Real questions: start from your courses, interests and needs.','真实问题：从自己的课程、兴趣和需求出发。'),(334,'Practice and feedback: create, listen and record improvements.','实践与反馈：做出作品，听取意见，留下改进记录。')]:b+=pair(en,zh,545,y,365,100,17,23)
 b+=pair('AI can amplify what you have built. First develop something worth amplifying.','AI 能放大你的积累；先把值得放大的能力练出来。',28,474,904,55,17,23,True);put(58,b)
 b=art(60)+heading('When answers are easier to get, what shows your ability?','当答案更容易得到，什么体现你的水平？')+pair('Original teaching illustration—not statistical results','原图：AI 改变教学工作的示意，不是统计结果',39,418,471,43,12,16,True)
 for y,en,zh in [(126,'Explain the process: show the reasoning behind your choices, not just the answer.','讲清过程：不只交答案，还能解释关键选择。'),(239,'Check the evidence: identify sources, limits and what remains uncertain.','核对证据：指出来源、限制，以及哪里仍不确定。'),(352,'Transfer and create: solve a new problem independently and produce something useful.','迁移与创造：换一个问题，仍能独立推进并做出作品。')]:b+=pair(en,zh,551,y,362,104,17,23)
 b+=pair('Move from getting an answer to understanding, judging and solving the problem.','从“我拿到了答案”，走向“我能理解、判断并解决问题”。',28,477,904,53,16,22,True);put(60,b)
 b=art(61)+pair('Bring your questions and work. Explain the problem and what you have tried; share attempts, difficulties and improvements.','带上你的问题与作品来交流。说清你想解决什么、已经试过什么。欢迎分享尝试、困惑与改进。',539,14,382,143,16,21)
 b+=pair('Keep learning with my XinhuaNet open class on neuroscience and AI. Afterwards, choose one connection and explain it to a classmate.','继续学习：我的新华网公开课——神经科学如何促进人工智能的发展。看完后，选一个联系，用自己的话讲给同学。',516,390,403,140,16,21);put(61,b)
 b=art(62)+text(551,360,'www.kuaiyu.site',28)+pair('Try my work, then create your own. Scan the code and explore a tool. Record the problem it solves, what you learn and one improvement you would like to make.','从体验我的作品，走向做出你的作品。扫码进入网站，选一个工具体验。记录它解决的问题、你的发现，再提出一个你想做的小改进。',461,382,450,147,17,23);put(62,b)
 b=pair('Thank you!','谢谢！',80,144,800,135,43,56,True)+pair('Start today: use AI to complete a small project you can verify.','从今天开始：用 AI 完成一个可核验的小项目。',40,334,880,72,21,29,True)+pair('Learn to ask, learn to judge, and create something of your own.','学会提问，学会判断，做出属于你的作品。',40,424,880,72,21,28,True);put(63,b)
 # The other pages inherit the original English-first narrative and artwork.
 for s in data['slides']:s['svg']=normalize(s['svg']);s['bilingualStyle']='en-first-v1'
 from build_bilingual_thumbnails import apply_refs
 return apply_refs(data)

if __name__=='__main__':
 for name,path,fn in [('teacher','ai/survival-202608/slides.json',teacher),('student','ai/survival/student/slides.json',student)]:
  before=ROOT/'work/bilingual-v1/before/site'/path;data=json.loads(before.read_text(encoding='utf8'))
  if name=='student':data=teacher(data)
  from bilingual_metadata import apply
  data=apply(fn(data));(ROOT/'site'/path).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
  print(name,len(data['slides']))
