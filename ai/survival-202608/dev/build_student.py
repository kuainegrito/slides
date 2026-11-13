"""Student adaptation: same 62-page sequence, original artwork and shared media.

Teacher source is read-only. New prose changes the learning audience, not the
authorship of showcased papers, student works or credited third-party media.
"""
import copy,html,json,re,sys
from pathlib import Path
from xml.etree import ElementTree as E
from PIL import ImageFont

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'site/ai/survival-202608'
HUB=ROOT/'site/ai/survival'
OUT=HUB/'student';OUT.mkdir(parents=True,exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)
SHARED='/slides/ai/survival-202608/'
NS='{http://www.w3.org/2000/svg}'
E.register_namespace('',NS[1:-1])
original=json.loads((SOURCE/'slides.json').read_text(encoding='utf8'))
data=copy.deepcopy(original)
for s in data['slides']:
    s['svg']=s['svg'].replace('href="assets/','href="'+SHARED+'assets/')
    s['thumb']=SHARED+s['thumb']
    if s.get('video'):s['video']=SHARED+s['video']
    if s.get('media'):
        s['media']['src']=SHARED+s['media']['src'];s['media']['poster']=SHARED+s['media']['poster']
data['background']=SHARED+data['background']
data.update(edition='student',editionTitle='学生版',title='学会 AI，做出自己的作品',subtitle='如何在 AI 浪潮中存活 · 学生版',adapted='2026-11-11')
pages={s['n']:s for s in data['slides']}
changes=[]
INK='#203b55';PURPLE='#795299';BLUE='#2b7096';MUTED='#647d93'

def esc(s):return html.escape(str(s),quote=True)
def font(c,size):return ImageFont.truetype('C:/Windows/Fonts/simkai.ttf' if '\u3000'<=c<='\uffef' else 'C:/Windows/Fonts/SansSerifCollection.ttf',round(size))
font_cache={}
def measure(s,size):
    total=0
    for c in s:
        chinese='\u3000'<=c<='\uffef';key=(chinese,round(size))
        if key not in font_cache:font_cache[key]=font(c,size)
        total+=font_cache[key].getlength(c)
    return total
def lines(s,width,size):
    out=[]
    for paragraph in s.split('\n'):
        line=''
        for token in re.findall(r'[A-Za-z0-9][A-Za-z0-9’/.:−+→-]*|\s+|.',paragraph):
            if line and measure(line+token,size)>width:
                out.append(line.strip());line=token.lstrip()
            else:line+=token
        if line:out.append(line.strip())
    return out
def text(x,y,s,size=24,color=INK,anchor='start',weight=400):
    return f'<text x="{x}" y="{y}" font-family="DeckSans, DeckKai, sans-serif" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{esc(s)}</text>'
def paragraph(x,y,s,width=850,size=24,color=INK,leading=1.5):
    return ''.join(text(x,y+i*size*leading,line,size,color) for i,line in enumerate(lines(s,width,size)))
def title(zh,en):
    size=min(34,860/max(measure(zh,34),1)*34)
    return text(38,53,zh,round(size,1),PURPLE)+text(39,86,en,19,BLUE)
def rect(x,y,w,h,fill='#ffffff',opacity=.68,r=14):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" fill-opacity="{opacity}" stroke="#c3d8e7"/>'
def svg(body):return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg" aria-label="学生版幻灯片">{body}</svg>'
def artwork(n):
    root=E.fromstring(pages[n]['svg'])
    for parent in root.iter():
        for child in list(parent):
            if child.tag==NS+'text':parent.remove(child)
    return ''.join(E.tostring(c,encoding='unicode') for c in root)
def fitted_art(n,box,view=(0,0,960,540)):
    x,y,w,h=box;vx,vy,vw,vh=view
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{vx} {vy} {vw} {vh}" preserveAspectRatio="xMidYMid meet">{artwork(n)}</svg>'
def original_text(n,predicate):
    return ''.join(E.tostring(t,encoding='unicode') for t in E.fromstring(pages[n]['svg']).iter(NS+'text') if predicate(t))
def replace(n,zh,en,body,reason):
    s=pages[n];s['title']=zh;s['svg']=svg(body);s['text']='\n'.join(E.fromstring(s['svg']).itertext()).strip();s['textExcerpt']=False
    changes.append({'pdf_page':n,'teacher_title':next(t['title'] for t in original['slides'] if t['n']==n),'student_title':zh,'reason':reason})
def list_page(n,zh,en,items,reason,footer=None):
    body=title(zh,en);start=139;step=318/len(items)
    for i,(heading,detail) in enumerate(items):
        y=start+i*step
        body+=f'<circle cx="50" cy="{y-8}" r="13" fill="#e2edf5" stroke="#9dbdd2"/>'+text(50,y-3,str(i+1),14,BLUE,'middle')
        body+=text(78,y,heading,26,INK)+paragraph(78,y+32,detail,828,20,MUTED,1.35)
    if footer:body+=rect(37,477,886,40,opacity=.55,r=9)+text(480,504,footer,20,PURPLE,'middle')
    replace(n,zh,en,body,reason)

list_page(3,'先问自己：你是在用 AI，还是在学会 AI？','Before we begin · Three questions for your learning',[
 ('你最近让 AI 帮你完成过什么？','查概念、写作业、读文献、写代码，还是做了一个自己的作品？'),
 ('关掉 AI 后，你还能讲清楚答案为什么对吗？','请区分“得到了答案”和“自己掌握了方法”。'),
 ('这学期，你最想用 AI 解决哪个真实问题？','从一门课、一个兴趣或一个科研小任务开始。')], '将教师讨论改为学生自我诊断与学习目标')

body=title('把 AI 素养，当作大学阶段的基本功','AI literacy belongs in your learning toolkit')
body+=rect(30,118,477,322)+fitted_art(4,(42,130,453,270))+text(268,424,'原课件中的教师应用报告：教与学都在变化',16,MUTED,'middle')
for y,h,d in [(152,'学得更主动','让 AI 追问、举例、反馈；你负责理解和判断。'),(258,'做得更完整','把想法变成图解、程序、演示或一个小工具。'),(364,'形成可展示的能力','拿出过程、核验和作品，让别人看见你的成长。')]:
    body+=text(536,y,h,26,BLUE)+paragraph(536,y+34,d,382,22,INK,1.4)
body+=text(480,501,'从现在开始，把“会提问、会核验、会创造”练成习惯。',24,PURPLE,'middle')
replace(4,'为什么现在就要认真学 AI','AI literacy',body,'保留教师报告为背景，不将教师调查冒充学生数据；强调学生学习动机')

list_page(5,'今天的路线：理解 → 使用 → 创造','Our route through the AI wave',[
 ('AI 从哪里来？','沿用历史主线，理解这场变化的来路。'),
 ('AI 怎样学习与生成？','看懂数据、神经网络与梯度下降，动手探索高维切片。'),
 ('AI 能怎样帮助我的学习？','体验模拟器、图解、代码与创作案例。'),
 ('面对未来，我应该练什么？','专业基础、判断力、跨学科协作与持续学习。'),
 ('今天之后，我要做什么？','完成一个小项目，把学习变成可核验的作品。')], '保留原五条主线，转化为学生学习路线')

list_page(19,'把 AI 用在学习的关键环节','Learn, investigate, build and explain',[
 ('读懂：把不懂的地方问具体','让它用例子解释，再对照教材或原文核对。'),
 ('练习：让它做追问你的学习伙伴','先自己作答，再请它指出漏洞；最后闭卷复述。'),
 ('探索：读论文、整理数据、尝试代码','保留来源和原始记录，分清事实、假设与推测。'),
 ('创造：把理解变成作品','做一张机制图、一个演示、一个小程序或一次清晰汇报。'),
 ('检验：你能独立解释并迁移吗？','换一道题、换一个场景，看看自己是否真的会了。')], '以学生的学习与初步科研流程替代泛化应用清单')

body=title('我的实践：把能量代谢做成可体验的工具','From physiology concepts to an interactive learning tool')
body+=fitted_art(23,(22,109,916,330),(8,69,938,423))
body+=text(480,470,'先预测，再操作，最后用机制解释观察到的变化。',26,PURPLE,'middle')
body+=text(480,505,'你的挑战：改变一个条件，记录一次结果，而不是只“玩一遍”。',21,INK,'middle')
replace(23,'我的成果：让能量代谢可视化','My work: learning through simulation',body,'保留成果过程与配图，改为学生体验任务')

body=title('我的实践：让复杂稳态调控变得可探索','Explore a simulator, then explain the regulation')
body+=fitted_art(25,(22,135,916,283),(7,163,941,265))
body+=text(480,451,'练习：只改一个条件，先预测调节方向，再观察模拟结果。',25,PURPLE,'middle')
body+=text(480,487,'说清：刺激是什么？反馈在哪里？哪些结论还要回到教材核对？',21,INK,'middle')
body+=text(480,518,'在“课堂任务”中打开原工具；模拟器是学习模型。',17,MUTED,'middle')
replace(25,'我的成果：探索稳态调控','My work: exploring homeostasis',body,'从教师制作工具转到学生使用工具验证理解，移除原页误重复的骑行说明')

body=artwork(26)+rect(112,186,736,185,opacity=.91)
body+=text(480,240,'怎样把整本书，学成一张知识网？',34,PURPLE,'middle')+text(480,282,'From scattered facts to a connected explanation',21,BLUE,'middle')
body+=text(480,329,'概念之间的箭头，要能说出“为什么”。',25,INK,'middle')
replace(26,'把知识点连成知识网','Connect your knowledge',body,'将知识整合问题转向学生的理解与迁移')

body=artwork(28)+title('图能拼在一起，机制也讲得通吗？','Connect the mechanisms, not just the pictures')
body+=text(494,284,'+',63,BLUE)+text(480,454,'输入 → 调节 → 结果',32,PURPLE,'middle')+text(480,501,'给每一条连接写出依据；找出一个你还解释不清的环节。',23,INK,'middle')
replace(28,'从拼图到解释机制','Explain every link',body,'保留两幅整合图，将问号转为机制核验练习')

body=artwork(39)+text(32,313,'我的教学漫画',25,PURPLE)+text(32,352,'先理解机制，',23)+text(32,386,'再把它讲成故事。',21)
body+=text(32,431,'Explain before',18,BLUE)+text(32,456,'you illustrate.',18,BLUE)+text(32,500,'选一幅，用自己的话解释。',16,MUTED)
replace(39,'我的成果：把机制讲成漫画','My work: concepts into comics',body,'保留所有漫画，增加学生讲解任务')

body=artwork(40)+text(27,325,'这些是我的学生创作的作品',25,PURPLE)+text(27,363,'Student creations',21,BLUE)
body+=paragraph(27,411,'下一个作品，可以是你的。\n选一个概念，做出自己的解释。',330,23,INK,1.6)
replace(40,'学生已经做出了这些作品，你也可以','Your own creation can come next',body,'保留学生作品归属，以同伴作品建立学生行动意愿')

body=artwork(41)+text(34,416,'从看懂教材图，到讲清机制',26,PURPLE)+text(34,451,'Read → verify → explain',21,BLUE)
body+=paragraph(34,488,'先核对科学内容，再优化视觉表达。',414,23,INK,1.3)
replace(41,'读懂教材，再改进表达','Understand before you redesign',body,'将教师改图示例改成学生阅读和表达练习')

body=title('读论文：别让漂亮图解替你判断','A visual summary is a starting point, not the evidence')
body+=rect(30,113,470,392)+fitted_art(42,(43,124,444,365))
for y,h,d in [(156,'先看原文','研究问了什么？研究对象是谁？'),(267,'再看图解','图中的数字、箭头和结论在原文哪里？'),(378,'最后自己讲','用一分钟说明：发现了什么，不能推出什么。')]:
    body+=text(532,y,h,27,BLUE)+paragraph(532,y+37,d,385,23,INK,1.4)
replace(42,'原论文与 AI 图解：对照着读','Read the paper alongside the summary',body,'保留原论文，不误标为讲者发表成果；为下一页图解建立核验步骤')

body=artwork(44)+text(480,439,'虚拟病例：先描述你看到的，再解释机制',27,PURPLE,'middle')
body+=text(480,475,'Learn to observe before asking AI for an explanation',21,BLUE,'middle')+text(480,512,'AI 生成角色用于学习示意；不能把画面当作真实患者资料。',22,INK,'middle')
replace(44,'用虚拟病例练习观察与解释','Observe, describe, explain',body,'保留原角色，将教师制图意图转成学生观察任务')

body=artwork(45)+text(480,48,'比较前后图像，练习提出可核验的解释',30,PURPLE,'middle')
body+=text(480,435,'Compare the images. What would you need to verify?',22,BLUE,'middle')
body+=text(480,478,'哪些是画面线索？哪些结论需要额外证据？',26,INK,'middle')+text(480,515,'这些变化为 AI 合成示意，不代表真实病程或疗效。',21,MUTED,'middle')
replace(45,'从观察到判断：别跳过证据','From observation to evidence',body,'保留合成图片，强调观察与证据的区别')

credit=original_text(46,lambda t:float(t.get('x','0').split()[0])>750)
body=artwork(46)+credit+text(480,469,'用视觉吸引注意，再用内容说明问题',29,PURPLE,'middle')+text(480,509,'Use impact to support a clear presentation',22,BLUE,'middle')
replace(46,'视觉表达：吸引注意之后，还要讲清楚','Make the message clear',body,'将课堂导入转为学生汇报表达，完整保留陈鹏老师署名')

body=artwork(47)+title('跨学科连接，靠基础，也靠核验','Connect ideas, then verify every link')
body+=text(480,122,'让 AI 帮你搭桥；桥是否牢靠，要靠专业知识与可靠来源判断。',24,INK,'middle')
body+=text(241,449,'Physiology → Pharmacology',21,BLUE,'middle')+text(241,483,'从生理机制追问药理作用',24,PURPLE,'middle')+text(241,516,'把因果链逐步写清楚，再查证。',18,INK,'middle')
body+=text(721,449,'Engineering → Philosophy',21,BLUE,'middle')+text(721,483,'从技术实践追问价值与意义',24,PURPLE,'middle')+text(721,516,'区分事实描述、解释与价值判断。',18,INK,'middle')
replace(47,'用 AI 跨学科学习，但不跳过专业基础','Connect disciplines with evidence',body,'去掉“只需简单了解”式表述，强调学生需理解并核验连接')

body=artwork(48)+text(864,300,'AI 合成',23,PURPLE,'middle')+text(864,331,'AI composite',17,BLUE,'middle')
body+=text(480,505,'我的视觉叙事示例：把三代骑行者放进同一画面。',22,PURPLE,'middle')+text(480,532,'图像能帮助讲故事；遗传与训练的结论，仍要回到研究证据。',20,INK,'middle')
replace(48,'图像能讲故事，不能替代因果证据','Visual storytelling and scientific evidence',body,'保留合成成果，区分视觉表达和科学论证')

list_page(49,'学习用 AI：先把任务说清楚','Student toolkit · Ask with a learning goal',[
 ('说清目标与自己卡住的位置','“我在学什么、已经懂什么、哪一步不懂、希望得到什么形式的帮助？”'),
 ('把大任务拆小','先列问题，再找资料、分析、写作和检查；每一步留下自己的判断。'),
 ('要求解释与追问，而不只给答案','先自己尝试，请 AI 提示一小步；再关掉提示，独立完成。'),
 ('给出材料与边界','提供课程范围、教材段落或数据说明；明确不能编造、不能越过的要求。')], '把通用提示技巧转换为学生学习流程', 'AI 可以降低尝试的门槛，理解与判断仍需要你来完成。')

list_page(50,'学习用 AI：把核验变成习惯','Student toolkit · Check, compare and explain',[
 ('查原文，不只看一个像真的引用','AI 给出的题名、作者、DOI 和页码都要打开核对；要求引用不等于已经可靠。'),
 ('让它针对你的学习状态反馈','告诉它你的年级、基础与错误步骤；让它先诊断误解，再给练习。'),
 ('善用英语，但以准确理解为准','读英文原始资料、对照中英文术语；不要把“英文回答”自动当作更正确。')], '增加可操作核验，避免学生误信引用或英文权威', '一次有效对话之后，试着用自己的话复述，再做一道新题。')

list_page(51,'学习用 AI：留下属于你的能力','Student toolkit · Know the limits and keep the process',[
 ('识别边界：信息不足，就补充或查证','遇到新知识、实时数据、专业结论和含糊任务，要回到可靠资料与老师。'),
 ('积累自己的学习工作流','保存有效提示、错误案例、核验清单和作品版本；逐步变成可复用的方法。'),
 ('作品要能讲清过程，也要遵守规则','按课程要求说明 AI 的参与；不编造数据或引用，不用代做冒充独立能力。')], '以学习记录、责任和作品能力替代教师个人工作流建议', '最终检查：不看 AI 输出，你能解释、复现，并迁移到新问题吗？')

body=title('面对 AI 的未来，你想成为什么样的学习者？','The future of AI — and the skills you choose to build')
body+=text(480,258,'专业基础 × AI 素养 × 判断与创造',41,PURPLE,'middle')
body+=text(480,325,'工具会变，提出问题、验证结果、与人合作的能力值得持续练习。',24,INK,'middle')
replace(52,'未来变化，与你今天的练习有关','Your learning shapes your options',body,'把未来章节从旁观趋势转为学生能力选择')

list_page(56,'这个学期，完成一次真正的 AI 学习实践','Your semester plan · Start small, finish something real',[
 ('第 1 步：选一个自己真正关心的问题','从一门课、一个兴趣或一个真实需求出发，写清成功标准。'),
 ('第 2 步：把基础与工具一起补上','先理解关键概念，再用 AI 辅助阅读、练习、代码或表达。'),
 ('第 3 步：做出能运行、能讲解的小成果','例如一张机制图、一份可复现分析、一个互动演示或小工具。'),
 ('第 4 步：核验、展示、修改','请老师或同学提出问题；记录 AI 的贡献、自己的判断和改进。')], '将面向教师的生存建议改为学生可执行项目路线', '目标不是收集更多工具，而是完成一个可解释、可核验的作品。')

list_page(57,'学好 AI，也练好与人相处的能力','Use AI with responsibility, curiosity and care',[
 ('学术诚信与隐私边界','遵守课程和项目要求；未经允许，不上传他人的敏感资料或未公开数据。'),
 ('学好英语，保持持续学习','用语言接触更多原始资料和不同观点，也把表达练清楚。'),
 ('与老师、同学交流，一起做事','带着具体问题与已尝试的过程求助；认真回应不同意见。'),
 ('保持兴趣，主动分享','让 AI 帮你拓展热爱；分享方法、失败和改进，而不只是最终成品。')], '保留原人文主线，改为学生责任、合作与成长场景')

body=title('找到你自己的“学习支点”','Your foundation is what AI can help you build on')
body+=rect(28,120,486,330)+fitted_art(58,(39,132,464,281))+text(270,432,'原图：我在教学实践中寻找支点',17,MUTED,'middle')
for y,h,d in [(152,'专业基础','知道关键概念，才有能力判断输出。'),(244,'真实问题','从自己的课程、兴趣和需求出发。'),(336,'实践与反馈','做出作品，听取意见，留下改进记录。')]:
    body+=text(545,y,h,28,BLUE)+paragraph(545,y+34,d,365,23,INK,1.4)
body+=text(480,501,'AI 能放大你的积累；先把值得放大的能力练出来。',25,PURPLE,'middle')
replace(58,'找到自己的学习支点','Find your learning foundation',body,'保留教师支点原图作来源，以学生的基础、问题和实践重新解释')

list_page(59,'面对变化，先建立可迁移的能力','A personal perspective · Build capabilities, not just credentials',[
 ('把一门专业学扎实','AI 时代仍需要能解释问题、识别错误、理解机制的人。'),
 ('用 AI 接触另一种方法','尝试编程、数据分析、设计或跨语言阅读，并把它用于真实任务。'),
 ('让能力有证据','用作品、过程记录和清晰讲解，说明你做了什么、验证了什么、学到了什么。')], '将个人就业与学位预测转成学生可执行能力建议，不把预测当成定论', '这是我的学习建议；工具变化很快，保持试验、核验与反思。')

body=title('当答案更容易得到，什么体现你的水平？','Show your reasoning, your evidence and your own work')
body+=rect(28,124,493,337)+fitted_art(60,(39,137,471,277))+text(273,442,'原图：AI 改变教学工作的示意，不是统计结果',16,MUTED,'middle')
for y,h,d in [(162,'讲清过程','不只交答案，还能解释关键选择。'),(273,'核对证据','指出来源、限制，以及哪里仍不确定。'),(384,'迁移与创造','换一个问题，仍能独立推进并做出作品。')]:
    body+=text(551,y,h,28,BLUE)+paragraph(551,y+36,d,362,23,INK,1.4)
body+=text(480,505,'从“我拿到了答案”，走向“我能理解、判断并解决问题”。',24,PURPLE,'middle')
replace(60,'把学习成果，从答案变成能力','From answers to demonstrated capability',body,'保留原教师变化示意并明确其性质，新增学生成果标准')

body=artwork(61)+text(539,54,'带上你的问题与作品来交流',25,PURPLE)
body+=paragraph(539,89,'说清你想解决什么、已经试过什么。\n欢迎分享尝试、困惑与改进。',382,21,INK,1.4)
body+=text(516,410,'继续学习：我的新华网公开课',25,PURPLE)+paragraph(516,449,'神经科学如何促进人工智能的发展。\n看完后，选一个联系，用自己的话讲给同学。',403,22,INK,1.4)
replace(61,'带着具体问题与作品，继续交流','Keep learning and share your work',body,'保留公开课、二维码和交流信息，引导学生带过程和作品交流')

body=artwork(62)+text(551,360,'www.kuaiyu.site',28,BLUE)
body+=text(461,405,'从体验我的作品，走向做出你的作品',24,PURPLE)
body+=paragraph(461,443,'扫码进入网站，选一个工具体验。\n记录它解决的问题、你的发现，\n再提出一个你想做的小改进。',450,23,INK,1.35)
replace(62,'体验作品，然后开始自己的探索','Explore the tools, then build your own',body,'保留个人网站和二维码，增加明确学生行动')

body=text(480,220,'谢谢！',56,PURPLE,'middle')+text(480,278,'Thank you!',34,BLUE,'middle')
body+=text(480,382,'从今天开始：用 AI 完成一个可核验的小项目。',29,INK,'middle')+text(480,434,'学会提问，学会判断，做出属于你的作品。',26,PURPLE,'middle')
replace(63,'下一步：做出你的第一个小项目','Your next step starts today',body,'结尾保留致谢，加入学生实践承诺')

# Short, optional classroom prompts preserve the pace of picture-heavy pages.
notes={
1:'今天请带着一个自己的问题来听：学完后，你愿意用 AI 做出什么小作品？',
2:'观察这些经历怎样连接专业、语言、运动与技术。你已有的兴趣或专业基础，可以成为哪个项目的起点？',
3:'先独立想 30 秒，再与同伴交流：最近一次 AI 对话，究竟让你“拿到答案”还是“学会了方法”？',
4:'写下一个必须由你自己判断的环节：来源是否可靠、推理是否成立，或结果能否应用。',
5:'给自己选一个本次重点：理解机制、改进学习方法，或找到一个可做的项目。',
6:'选择一个阶段，说明它解决了什么问题。不要把 AI 的发展只记成一串年份。',
7:'看视频：输入是什么、输出是什么、模型在识别什么？区分任务目标与实现方法。',
8:'在这八类应用中，找一个你亲自接触过的例子。它预测或生成的到底是什么？',
9:'区分规则化写作与开放式生成。得到流畅文本后，你还需要核验什么？',
10:'用你熟悉的任务串起“数据—模型—参数—输出”，每一环都说一个例子。',
11:'数据多不等于数据合适。想想你的课程小项目需要哪些数据，以及哪些信息不应上传。',
12:'播放两条通路，比较突触整合与加权求和。将数字 8 的噪声调到 70%，再看各类概率怎样变化；指出为什么模型概率不是正确率，也不能当作人脑的计算记录。',
13:'从同一起点比较 0.25、1.30 和 2.10 的步长系数。先预测，再播放或单步验证：什么时候平稳下降，什么时候振荡，什么时候损失反而变大？',
14:'地形是帮助理解的类比。试着解释起点与路径为什么可能影响优化结果。',
15:'先选“仅更新所见 2 维”走一步，再改为“更新全部 8 维”。为什么眼前两维不动，总损失仍能下降？',
16:'请从输入讲到输出：模型已有的训练过程与你现在输入提示词的过程有什么区别？',
17:'找一句需要上下文才能理解的话，说明哪些词之间的联系会影响它的含义。',
18:'同一句请求，加上对象、情境和目的后，会改变哪些合理回答？把这用于你的学习提问。',
19:'选一个学习任务，写明哪些部分让 AI 协助，哪些部分必须自己完成与核验。',
20:'用自己写的一段话练习修改：要求指出逻辑缺口，保留你的观点，并逐条解释改动。',
21:'选择 date 或 avocat，点击“切换词义”，观察镜头如何沿光流移动，以及哪些词云被提亮。尝试解释 I brought a date to dinner 和 J’ai mangé mon avocat 的双关；为什么翻译后双关可能消失？',
22:'从一个小功能开始：描述输入、输出和一个可检查的例子；看懂后再增加复杂度。',
23:'体验于快制作的工具：先写预测，再改一个条件，最后解释结果。作品的价值在于它帮助解决什么问题。',
24:'操作前写下一个预测。操作后记下结果和解释；若与你的理解不符，回到教材或向老师求证。',
25:'一次只改变一个条件，画出你认为的反馈链。区分模拟器呈现的机制与模型没有覆盖的因素。',
26:'选本周的一章，先自己列概念，再让 AI 帮你发现缺少的连接；最后自己解释每条箭头。',
27:'选择一个训练适应，沿着“结构或功能改变—作用机制—结果”讲清楚，不只记名词。',
28:'两幅图之间的连接，有哪些是因果关系，哪些只是分类或并列？分别标清楚。',
29:'不看图，复述一条完整机制链；再打开图和教材检查遗漏与错误。',
30:'把一个含糊问题改成具体请求：说明背景、已知信息、目标和需要核验的部分。',
31:'当问题涉及人的感受与具体处境时，哪些信息需要沟通，而不能只凭一条提示词推断？',
33:'回到开场问题：看过这些案例，你现在会怎样定义“学会 AI”？',
34:'用两种语言表达同一个学习请求，比较术语、假设与语气；不要只比较谁写得更长。',
35:'向老师提问或与同学合作时，试着把期待、困难与反馈说得清楚而尊重。',
36:'设计一个资料整理小流程：搜索、筛选、记录来源、复核。重要判断与最终提交由你负责。',
37:'看这幅图时，想一想专业知识、兴趣与技术可以怎样在你的生活里相互支持。',
38:'先确定受众和目的，再选择图、视频、音乐或演示。形式要帮助别人理解你的内容。',
39:'选一幅我的漫画，讲清它对应的机制；再选一个新概念，尝试设计自己的解释。',
40:'这些是学生创作的作品。请给其中一幅提一条科学性建议和一条表达建议，然后构思自己的版本。',
41:'给图中的结构、箭头和标签逐项核对。视觉更好看，不等于科学内容更准确。',
42:'先读原文，再看下一页图解。各找出研究对象、方法、主要结果和一个限制。',
43:'回到上一页论文，核对图中至少一个数字与一个结论。AI 图解不能替代原文证据。',
44:'只描述看得见的线索，再列需要什么信息才能解释它们。不要从一张合成图直接作诊断。',
45:'区分“画面发生了变化”和“真实治疗有效”。两者需要的证据完全不同。',
46:'保留原作者署名。设想你的课程汇报：视觉冲击后，用一句话说明要讨论的问题。',
47:'选一条跨学科连接，把推理拆成几步；每一步标出可查证的依据或仍不确定的地方。',
48:'在展示自己的 AI 合成图时明确标注，并把视觉叙事与科学证据分开说明。',
49:'用本页四条方法，改写你最近的一次学习提示词。保留改写前后的版本，比较学习效果。',
50:'选 AI 给出的一个引用，打开原文核对题名、作者和它是否真的支持相关说法。',
51:'为自己的课程建立一张简短清单：来源、解释、验证、AI 使用说明、可以独立完成的部分。',
52:'这部分是关于未来的思考。把注意力落在你今天能练习、能验证、能持续积累的能力上。',
53:'这是一幅未来想象图。请区分画面激发的可能性与已经得到证实的事实。',
54:'从身边的真实问题出发：你所在的校园、社区或家乡，有什么值得用专业知识与 AI 一起探索？',
55:'想象你的专业与 AI 合作的一个场景，并写出需要由人承担的判断与责任。',
56:'现在写下你的项目：问题是什么、第一步是什么、完成后拿什么证明它有用？',
57:'请按课程要求说明 AI 的参与。遇到不知道是否允许的用法，先向任课老师确认。',
58:'列出你的三个学习支点：已经掌握的基础、真正关心的问题、能够请教的人或可获得的反馈。',
59:'选择一项跨学科方法，把它用于自己的专业任务；用结果和过程评估收获。',
60:'检查你的成果：能讲清过程吗？证据可追溯吗？换一个场景还能独立解决吗？',
61:'交流时请带上具体问题、已尝试的方法和一个可展示的版本，这样更容易得到有效反馈。',
62:'打开网站体验一个作品，记录它解决了什么问题，并提出一个你愿意尝试的小改进。',
63:'给自己定一个可完成的起点，并约一位同学或老师反馈。先完成，再改进。'}
for n,s in pages.items():s['studentTask']=notes[n]
links={23:['https://www.kuaiyu.site/apps/cycling/'],24:['https://www.kuaiyu.site/apps/cycling/'],25:['https://www.kuaiyu.site/apps/homeostasis/simulator.html?lang=zh'],62:['https://www.kuaiyu.site/']}
for n,urls in links.items():pages[n]['originalLinks']=urls
for c in data['chapters']:
    c['title'],c['en']={'start':('为什么要学 AI','Why learn AI'),'history':('AI 从哪里来','Where AI comes from'),'architecture':('理解 AI 怎样工作','How AI works'),'applications':('学习与作品实践','Learn, explore, create'),'future':('未来与我的能力','Your future capabilities'),'survive':('开始自己的项目','Build your own project')}[c['id']]
for s in data['slides']:
    if s['n'] in {c['pdf_page'] for c in changes}:s['thumb']=f'/slides/ai/survival/student/assets/page-{s["n"]:02d}.webp'
from bilingual_layout import student as apply_student_bilingual
from bilingual_metadata import apply as apply_bilingual_metadata
data=apply_bilingual_metadata(apply_student_bilingual(data))
(OUT/'slides.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(ROOT/'work/student-edition/adaptation-review.json').write_text(json.dumps({'audience':'大学本科生，以原课件医学、生命科学及运动生理学案例为主','source_pages':62,'student_pages':len(pages),'changed_pages':changes,'preserved':'全部原配图仍被引用；封面视频、第7页原声视频、第15页高维交互、隐藏页排除规则保留','authorship':'学生作品和陈鹏老师视频归属保留；不将展示的原论文声明为讲者论文','shared_media':True},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'pages':len(pages),'adapted':len(changes),'adapted_pages':[c['pdf_page'] for c in changes]},ensure_ascii=False))
