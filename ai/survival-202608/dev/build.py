"""Reproducible PDF -> layered web slides. Source files are read only.

Explicit user authorization: deterministic pixel masks/crops, no generative redraw.
Hidden mapping: PDF 32 = hidden PPTX 36; no other PPTX-only content is imported.
"""
import hashlib, html, io, json, math, re, sys
from pathlib import Path
import pymupdf as fitz
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'site/ai/survival-202608'
ASSETS=OUT/'assets'
ASSETS.mkdir(parents=True,exist_ok=True)
SOURCE=Path('D:/Nutstore/0A_TransMed/上课/How to survive in the world of AI_202608.pdf')
DOC=fitz.open(SOURCE)
BACKGROUND={5,12,38,65}
FLAT_PAGES={4,10,11,12,13,16,17,18,20,21,22,27,29,30,31,35,36,38,43,58}
# Pale translucent illustrations must not be mistaken for the pale slide base.
# Coordinates are measured in the 960 x 540 PDF frame, then scaled to the image.
ART_PROTECTION={
  10:[(84,180,260,440),(284,180,460,440),(478,180,660,440),(679,180,880,440)],
  12:[(30,85,580,443),(620,85,940,443)],
  16:[(25,155,265,415),(288,155,495,415),(519,155,681,415),(714,130,930,500)],
  17:[(30,150,290,458),(317,125,594,458),(619,130,932,461)],
  18:[(644,117,782,306),(798,117,935,306),(644,314,782,490),(798,314,935,490)],
  20:[(380,145,490,326),(480,165,598,294),(586,105,743,338),(762,84,934,141),(762,168,934,221),(762,254,934,309),(762,332,934,387),(241,350,648,512),(677,419,919,493)],
  21:[(240,90,880,485)],
  22:[(341,197,433,331),(256,286,484,451),(464,152,674,357),(588,345,680,445),(738,110,936,175),(738,186,936,250),(738,265,936,329),(738,344,936,410),(480,352,612,400)],
  30:[(335,226,472,385),(371,157,472,221),(480,166,580,339),(587,127,719,210),(693,60,873,141),(724,155,777,311),(796,184,954,258),(694,297,932,394),(466,244,708,365),(57,412,225,482),(258,412,399,482),(425,412,554,482),(561,412,720,482),(734,412,914,482)],
  36:[(389,83,478,297),(522,96,683,292),(682,113,784,259),(800,80,924,306),(255,294,924,435),(620,240,808,380),(77,434,141,494),(274,434,335,494),(485,434,548,494),(684,434,747,494)],
  38:[(411,116,562,235),(589,107,668,184),(700,118,858,234),(360,198,431,286),(573,191,693,312),(845,196,917,280),(550,324,695,425),(711,292,873,429),(382,283,543,362),(390,353,465,438),(572,420,653,507),(727,430,809,510)],
  58:[(75,281,465,534),(616,110,871,364),(19,199,859,398)]
}
TITLES={1:'How to survive in the era of AI',2:'Kuai Yu · 于快',3:'开始前的几个问题',4:'中国教师生成式人工智能应用报告',5:'Outline · 目录',6:'The development of AI · 人工智能的发展',7:'LeNet 1 · 早期探索',8:'ChatGPT 之前的 AI 应用',9:'AI 写作比我们想象得更早',10:'AI 的基本架构',11:'数据的爆炸性增长',12:'神经系统与人工神经网络',13:'Gradient descent · 梯度下降',14:'真实世界中的梯度下降',15:'高维空间中的梯度下降',16:'AI 如何学习与创造',17:'The attention revolution · 注意力机制',18:'从知识到含义',19:'当今人工智能的应用',20:'From prompt to prose · 从提示到成文',21:'A universe of tokens · 词元的语义星云',22:'Code from conversation · 对话成码',23:'Gamification in education · 游戏化教学',24:'骑行能量代谢模拟器',25:'用 AI 智能体制作稳态模拟器',26:'如何整合知识点？',27:'Adaptations to aerobic training',28:'知识整合',29:'有氧训练的适应',30:'The art of asking · 问得其所，答有所据',31:'Beyond the prompt · 超越提示词',33:'How to survive in the era of AI',34:'提示词中的文化背景',35:'Culture shapes how we say things',36:'Agents that do the legwork · 智能代理',37:'AI 与工作',38:'Nuance into creation · 细微之处，化为创作',39:'我的教学漫画',40:'学生创作的作品',41:'优化教材图片与获取灵感',42:'学术论文',43:'论文图解',44:'AI 创建的库欣综合征患者',45:'AI 模拟外貌变化',46:'AI 制造视觉冲击',47:'AI 延伸课堂知识',48:'运动生理学中的 AI 视觉叙事',49:'使用 AI 的建议 · 1–4',50:'使用 AI 的建议 · 5–7',51:'使用 AI 的建议 · 8–10',52:'未来人工智能的展望',53:'人类与 AI 的未来',54:'从赵以炯到 AI 时代',55:'AI 的未来图景',56:'如何在 AI 的浪潮中存活 · I',57:'如何在 AI 的浪潮中存活 · II',58:'找到 AI 赋能教育的支点',59:'我的个人预测',60:'AI 之前与之后的教学',61:'交流与公开课',62:'kuaiyu.site',63:'谢谢 · Thank you'}
CHAPTERS=[{'id':'start','title':'开场','en':'Opening','start':1,'color':'#21759c'},{'id':'history','title':'AI 的发展','en':'The development of AI','start':6,'color':'#276aa7'},{'id':'architecture','title':'AI 的基本架构','en':'How AI works','start':10,'color':'#6855b8'},{'id':'applications','title':'AI 的应用','en':'Applications of AI','start':19,'color':'#208c99'},{'id':'future','title':'未来展望','en':'The outlook of AI','start':52,'color':'#6c55a0'},{'id':'survive','title':'与 AI 共处','en':'How to survive','start':56,'color':'#946395'}]
stats={'masked_assets':[],'deduplicated_backgrounds':0,'occluded_objects_removed':0,'native_text_spans':0,'custom_text_pages':[6,8,9],'skipped_pdf_pages':[32]}
asset_cache={}
written=set()

def esc(s):return html.escape(str(s),quote=True)
def num(n):return f'{n:.3f}'.rstrip('0').rstrip('.')
def rgb(c):
    if c is None:return 'none'
    if isinstance(c,(int,float)):c=(c,c,c)
    if len(c)==1:c=c*3
    return '#'+''.join(f'{min(255,max(0,round(x*255))):02x}' for x in c[:3])
def get_image(xref):
    data=DOC.extract_image(xref)
    im=Image.open(io.BytesIO(data['image'])).convert('RGBA')
    if data.get('smask'):
        mask=Image.open(io.BytesIO(DOC.extract_image(data['smask'])['image'])).convert('L')
        if mask.size==im.size:im.putalpha(mask)
    return im

def remove_pale_background(im, protected=()):
    """Flood from pale background; keep enclosed white details and protected art.

    RGB channels of retained foreground are never regenerated or recolored.
    Transparency only changes the identified cool, light background pixels.
    """
    a=np.asarray(im).copy(); c=a[:,:,:3].astype(np.int16)
    r,g,b=c[:,:,0],c[:,:,1],c[:,:,2]
    pale=(r>150)&(g>176)&(b>190)&(b>=r-8)&(b>=g-9)&((g-r)<62)
    # Pale near-white canvas and light blue digital texture are the source base.
    labels,n=ndimage.label(pale)
    counts=np.bincount(labels.ravel())
    selected=counts>max(300,im.width*im.height*.0007)
    selected[0]=False
    bg=selected[labels]
    a[:,:,3][bg]=0
    if protected:
        keep=np.zeros(bg.shape,dtype=np.float32)
        for x0,y0,x1,y1 in protected:keep[max(0,y0):y1,max(0,x0):x1]=1
        # Feather *only the pale background selection*, retaining the original
        # darker art pixels exactly. Avoid rectangular seams on the common base.
        keep=ndimage.gaussian_filter(keep,sigma=max(4,im.width/110))
        a[:,:,3]=np.maximum(a[:,:,3],np.minimum(np.asarray(im)[:,:,3],np.rint(keep*255).astype(np.uint8)))
    return Image.fromarray(a)

def save_webp(im, label, mask=False, protected=(), limit=1440, quality=78):
    if mask:im=remove_pale_background(im,protected)
    if max(im.size)>limit:im.thumbnail((limit,limit),Image.Resampling.LANCZOS)
    if mask:
        pixels=np.asarray(im).copy()
        levels=17 if protected else 85
        pixels[:,:,3]=(np.round(pixels[:,:,3]/levels)*levels).astype(np.uint8)
        im=Image.fromarray(pixels)
    # RGB under fully transparent pixels carries no visual information.
    # Do not store the discarded full-slide background there.
    buff=io.BytesIO(); im.save(buff,'WEBP',quality=quality,method=6,exact=False)
    data=buff.getvalue();name=hashlib.sha256(data).hexdigest()[:16]+'.webp'
    (ASSETS/name).write_bytes(data)
    written.add(name)
    if mask:stats['masked_assets'].append({'label':label,'asset':name,'transparent_fraction':round(float(np.mean(np.asarray(im)[:,:,3]==0)),3)})
    return 'assets/'+name

bg=save_webp(get_image(12),'shared original background',limit=1600,quality=82)

def svg_image(src,box,cls=''):
    x,y,x1,y1=box
    return f'<image class="{cls}" x="{num(x)}" y="{num(y)}" width="{num(x1-x)}" height="{num(y1-y)}" href="{src}" preserveAspectRatio="none"/>'

def span_svg(s):
    chars=s['chars'];text=''.join(chr(c[0]) for c in chars)
    if not text.strip():return ''
    family='DeckSans, DeckKai, sans-serif'
    # Wingdings's PDF character mappings are already Unicode geometric bullets.
    xs=' '.join(num(c[2][0]) for c in chars);ys=' '.join(num(c[2][1]) for c in chars)
    stats['native_text_spans']+=1
    return f'<text x="{xs}" y="{ys}" font-family="{family}" font-size="{num(s["size"])}" fill="{rgb(s["color"])}" opacity="{num(s["opacity"])}" xml:space="preserve">{esc(text)}</text>'

def drawing_svg(d):
    parts=[];last=None
    for it in d['items']:
        op=it[0]
        if op=='l':
            if last!=it[1]:parts.append(f'M{num(it[1].x)} {num(it[1].y)}')
            parts.append(f'L{num(it[2].x)} {num(it[2].y)}');last=it[2]
        elif op=='c':
            if last!=it[1]:parts.append(f'M{num(it[1].x)} {num(it[1].y)}')
            parts.append('C'+' '.join(f'{num(p.x)} {num(p.y)}' for p in it[2:]));last=it[-1]
        elif op=='re':
            r=it[1];parts.append(f'M{num(r.x0)} {num(r.y0)}H{num(r.x1)}V{num(r.y1)}H{num(r.x0)}Z');last=None
        elif op=='qu':
            q=it[1];parts.append('M'+'L'.join(f'{num(p.x)} {num(p.y)}' for p in [q.ul,q.ur,q.lr,q.ll])+'Z');last=None
    if d.get('closePath'):parts.append('Z')
    return f'<path d="{" ".join(parts)}" fill="{rgb(d.get("fill"))}" stroke="{rgb(d.get("color"))}" stroke-width="{num(d.get("width") or 0)}" fill-opacity="{d.get("fill_opacity",1) or 1}"/>'

def contained(a,b,tol=1):return a[0]>=b[0]-tol and a[1]>=b[1]-tol and a[2]<=b[2]+tol and a[3]<=b[3]+tol

def page_svg(page,n):
    image_seqs=[i for i,b in enumerate(page.get_bboxlog()) if b[0]=='fill-image']
    infos=page.get_image_info(xrefs=True)
    if len(infos)!=len(image_seqs):raise ValueError(f'image ordering mismatch {n}')
    objects=[];opaque=[]
    for seq,inf in zip(image_seqs,infos):
        xref=inf['xref'];box=inf['bbox']
        if xref in BACKGROUND:
            stats['deduplicated_backgrounds']+=1;continue
        if not inf['has-mask']:opaque.append((seq,box))
        objects.append((seq,box,'image',inf))
    for s in page.get_texttrace():
        if s['type']!=1:objects.append((s['seqno'],s['bbox'],'text',s))
    for d in page.get_drawings():objects.append((d['seqno'],list(d['rect']),'drawing',d))
    out=[]
    for seq,box,kind,obj in sorted(objects,key=lambda o:o[0]):
        if any(later>seq and contained(box,cover) for later,cover in opaque):
            stats['occluded_objects_removed']+=1;continue
        if kind=='image':
            xref=obj['xref'];masked=n in FLAT_PAGES and (box[2]-box[0])>400 and (box[3]-box[1])>240
            key=(xref,masked)
            if key not in asset_cache:
                im=get_image(xref)
                protected=[(round(a*im.width/960),round(b*im.height/540),round(c*im.width/960),round(d*im.height/540)) for a,b,c,d in ART_PROTECTION.get(n,[])]
                # Keep photographic people and their clothing intact on this panel.
                if n==31:protected=[(0,round(im.height*.38),im.width,im.height)]
                src=save_webp(im,f'PDF {n} / xref {xref}',mask=masked,protected=protected)
                asset_cache[key]=src
            out.append(svg_image(asset_cache[key],box,'original-art'))
        elif kind=='text':out.append(span_svg(obj))
        else:out.append(drawing_svg(obj))
    return ''.join(out)

def text(x,y,value,size=20,color='#152f4e',anchor='start',bold=False):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="DeckSans, DeckKai, sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{esc(value)}</text>'
def group(content,step):return f'<g class="reveal" style="--order:{step}">{content}</g>'
def title(en,zh):return text(36,50,en,30,bold=True)+text(36,84,zh,23,'#85508a')
def crop_asset(xref,box,label,mask=True,clear=()):
    im=get_image(xref).crop(box)
    if clear:
        from PIL import ImageDraw
        dr=ImageDraw.Draw(im)
        for r in clear:dr.rectangle(r,fill=(0,0,0,0))
    return save_webp(im,label,mask=mask,limit=1200,quality=86)

def custom6():
    rows=[('1940s–1950s','Foundations','奠基时期','Concepts born,','early ideas','概念诞生，早期探索','#22689d'),('1950s–1970s','Symbolic AI','符号主义时期','Rule-based systems,','logic and reasoning','基于规则的系统，逻辑推理','#1c79a6'),('1970s–1990s','AI Winters','寒冬时期','Funding drops,','progress slows','资金减少，发展放缓','#268b9b'),('1990s–2000s','Machine Learning','机器学习时期','Data-driven methods','gain rise','数据驱动方法兴起','#54944c'),('2010s','Deep Learning','深度学习时期','Big data, GPUs,','breakthroughs','大数据、算力推动突破','#6553a5'),('2020s–Present','Generative AI','生成式人工智能时期','Foundation models,','wide applications','基础模型、广泛应用','#8e49a4')]
    icons=[(116,22,244,156),(380,26,517,157),(634,21,770,158),(887,21,1038,157),(1150,19,1295,157),(1382,17,1550,158)]
    out=title('The development of AI','人工智能的发展历程')
    out+='<path class="trace" d="M80 444H894" stroke="url(#timeline)" stroke-width="4" fill="none"/>'
    for i,(r,box) in enumerate(zip(rows,icons)):
        year,en,zh,a,b,c,col=r;x=88+i*157
        src=crop_asset(55,box,f'PDF 6 original icon {i+1}')
        p=svg_image(src,(x-40,136,x+40,218))
        p+=f'<rect x="{x-71}" y="237" width="142" height="31" rx="15" fill="{col}"/>'
        p+=text(x,259,year,17,'white','middle',True)+text(x,300,en,17,col,'middle',True)+text(x,329,zh,16.5 if len(zh)>9 else 18,col,'middle')
        p+=text(x,366,a,14,'#263b4a','middle')+text(x,387,b,14,'#263b4a','middle')+text(x,415,c,12,'#263b4a','middle')
        p+=f'<circle class="node-pulse" cx="{x}" cy="444" r="8" fill="#eef6fa" stroke="{col}" stroke-width="4"/>'
        out+=group(p,i)
    return out

def custom8():
    rows=[('E-commerce recommendation','电商推荐与用户行为分析','Taobao clickstream, purchase prediction','淘宝用户行为、个性化推荐',(66,347,415,491)),('Bioinformatics & omics','生物信息学与组学分析','PCA, PLS–DA, clustering','PCA、PLS–DA、聚类分析',(468,343,815,489)),('Finance & stock analysis','金融风控与股市分析','Stock trend modeling, fraud/risk detection','股市分析、风险识别',(858,343,1199,490)),('Medical imaging','医学影像辅助诊断','Tumor screening, X-ray/CT classification','肿瘤筛查、影像分类',(1241,347,1612,493)),('Computer vision','计算机视觉','Face recognition, object detection','人脸识别、目标检测',(48,620,419,762)),('Speech & language tools','语音与语言工具','Speech recognition, translation, spam filtering','语音识别、翻译、垃圾信息过滤',(467,640,818,753)),('Smart transportation','智能交通','Traffic prediction, route optimization,','交通预测、路径优化、驾驶辅助',(853,632,1203,748)),('Manufacturing & predictive maintenance','工业质检与预测维护','Defect detection, sensor-based maintenance','缺陷检测、预测性维护',(1237,639,1611,770))]
    out=title('Applications of machine learning/AI before ChatGPT','ChatGPT 出现前的机器学习 / 人工智能应用')
    out+=text(38,116,'2010–2022 · Representative applications / 代表性应用',15,'#6655a4')
    out+='<path d="M555 113H917" stroke="#7d63bd" stroke-width="2"/><path d="M917 108L927 113L917 118Z" fill="#7d63bd"/><circle cx="735" cy="113" r="5" fill="#eef4fa" stroke="#7d63bd" stroke-width="2"/>'
    for i,(en,zh,a,b,box) in enumerate(rows):
        x=28+(i%4)*234;y=136+(i//4)*173
        p=f'<rect x="{x}" y="{y}" width="221" height="164" rx="12" fill="#ffffff" fill-opacity=".55" stroke="#c8dae9"/>'
        p+=text(x+12,y+21,en,11.1,bold=True)+text(x+12,y+40,zh,13,'#744e92')
        clear={4:[(100,0,370,19)],7:[(80,0,374,23)]}.get(i,[])
        src=crop_asset(62,box,f'PDF 8 original illustration {i+1}',mask=i not in [3,4,6,7],clear=clear)
        p+=svg_image(src,(x+14,y+50,x+207,y+125))
        p+=text(x+110,y+141,a,9.5,'#203a50','middle')+text(x+110,y+156,b,11,'#744e92','middle')
        if i==6:p+=text(x+110,y+131,'driver assistance',8.4,'#203a50','middle')
        out+=group(p,i)
    foot=[('Improve efficiency','提升效率'),('Reduce risk','降低风险'),('Drive insights','发现洞察'),('Transform industries','赋能行业转型')]
    foot_icons=[(158,846,253,933),(514,845,611,933),(852,843,950,933),(1199,844,1295,934)]
    for i,((en,zh),box) in enumerate(zip(foot,foot_icons)):
        x=28+234*i
        out+=svg_image(crop_asset(62,box,f'PDF 8 original footer icon {i+1}'),(x,486,x+40,527))
        out+=text(x+48,503,en,14,'#425c8b','start',True)+text(x+48,523,zh,13,'#795390','start')
    return out

def custom9():
    rows=[('2006','Reuters','路透社','Auto finance news','自动财经新闻','data → prose / 数据成文','#1b6dad'),('2014','L.A. Times','洛杉矶时报','Quakebot','地震快讯机器人','~3 min after quake / 震后约3分钟','#22899c'),('2014','Associated Press','美联社','Earnings at scale','财报批量生成','300 → 3,000 / 每报道进扩容','#37854d'),('2020','The Guardian','卫报','GPT-3 op-ed','GPT-3 评论实验','edited from 8 outputs / 8稿拼编','#6550a1'),('2025','Il Foglio','《日报》/ Il Foglio','Full AI edition','整份 AI 报纸','4 pages / 4版实验','#8848a7')]
    icons=[(136,326,321,459),(421,332,614,457),(763,318,890,456),(1021,322,1220,459),(1322,324,1511,458)]
    out=title('AI writing started earlier than we thought…','AI 写作比我们想象得更早…')+text(36,120,'Journalism timeline / 新闻业时间线 · Before ChatGPT / 早于 ChatGPT',16,'#596780')
    out+='<path class="trace" d="M76 436H903" stroke="url(#timeline)" stroke-width="4" fill="none"/>'
    for i,(r,box) in enumerate(zip(rows,icons)):
        year,en,zh,a,b,c,col=r;x=100+i*190
        p=svg_image(crop_asset(66,box,f'PDF 9 original icon {i+1}'),(x-48,153,x+48,222))
        p+=f'<rect x="{x-68}" y="239" width="136" height="30" rx="15" fill="{col}"/>'
        p+=text(x,261,year,23,'white','middle',True)+text(x,303,en,21,col,'middle',True)+text(x,331,zh,19,col,'middle')
        p+=text(x,366,a,15,'#183949','middle')+text(x,392,b,16,'#183949','middle')+text(x,415,c,11,'#183949','middle')
        p+=f'<circle class="node-pulse" cx="{x}" cy="436" r="8" fill="#eef6fa" stroke="{col}" stroke-width="4"/>'
        out+=group(p,i)
    # Preserve the five additional original publication logos, with original pixels.
    for i,xref in enumerate([67,69,71,72,73]):
        src=save_webp(get_image(xref),f'PDF 9 original logo {i+1}',limit=200,quality=92)
        out+=svg_image(src,(60+i*190,140,90+i*190,153)).replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"')
    out+=text(480,500,'From rule-based to LLMs / 从规则生成到大模型',24,'#355d91','middle',True)
    return out

def make_svg(body):return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" class="slide-svg" aria-label="幻灯片内容"><defs><linearGradient id="timeline" gradientUnits="userSpaceOnUse" x1="0" x2="960"><stop stop-color="#2279b2"/><stop offset=".45" stop-color="#3d9d88"/><stop offset="1" stop-color="#8747ac"/></linearGradient></defs>'+body+'</svg>'

# The fonts were already embedded in the user's PDF. Reuse the supplied subsets.
for xref,name in [(13,'source-sans'),(16,'source-kai')]:
    (ASSETS/(name+'.ttf')).write_bytes(DOC.extract_font(xref)[3])

slides=[]
reviewed=json.loads((ROOT/'reviewed-text.json').read_text(encoding='utf8'))
for i,page in enumerate(DOC,1):
    if i==32:continue
    body={6:custom6,8:custom8,9:custom9}.get(i,lambda:page_svg(page,i))()
    chapter=next(c for c in reversed(CHAPTERS) if i>=c['start'])
    plain=' '.join(page.get_text().split())
    if i in [6,8,9]:plain=' '.join(html.unescape(re.sub('<[^>]*>',' ',body)).split())
    # Never embed the original large document or hidden-page assets in delivery.
    thumb=page.get_pixmap(matrix=fitz.Matrix(320/960,320/960),alpha=False)
    thumb_im=Image.frombytes('RGB',(thumb.width,thumb.height),thumb.samples)
    thumb_src=save_webp(thumb_im,f'thumbnail {i}',limit=320,quality=68)
    if str(i) in reviewed:plain=reviewed[str(i)]
    slides.append({'n':i,'title':TITLES[i],'chapter':chapter['id'],'svg':make_svg(body),'text':plain,'textExcerpt':str(i) in reviewed,'thumb':thumb_src,'originalLinks':[l['uri'] for l in page.get_links() if l.get('uri','').startswith(('https://','http://'))]})
    print(f'{i}: {TITLES[i]}',flush=True)

assert (ASSETS/'cover-wave-v1.mp4').exists(), 'Run python animate_cover.py first'
slides[0]['video']='assets/cover-wave-v1.mp4'
data={'title':'How to survive in the era of AI','subtitle':'如何在 AI 浪潮中存活','author':'Kuai Yu · 于快','version':'202608','background':bg,'chapters':CHAPTERS,'slides':slides}
from refine_deck import apply_refinements
data=apply_refinements(data)
(OUT/'slides.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
from build_fonts import build_fonts
build_fonts()
for stale in ASSETS.glob('*.webp'):
    if stale.name not in written and re.fullmatch(r'[0-9a-f]{16}\.webp',stale.name):
        assert stale.resolve().parent==ASSETS.resolve()
        stale.unlink()
stats.update({'source_pdf':SOURCE.name,'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'source_bytes':SOURCE.stat().st_size,'source_pages':len(DOC),'published_pages':len(slides),'assets_bytes':sum(p.stat().st_size for p in ASSETS.iterdir()),'asset_count':len(list(ASSETS.iterdir()))})
(ROOT/'work/conversion-report.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in stats.items() if k!='masked_assets'},ensure_ascii=False,indent=2))
