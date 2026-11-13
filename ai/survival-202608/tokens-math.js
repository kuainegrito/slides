// Explicitly synthetic 8D vectors for a projection teaching scene, not trained embeddings.
export const CLUSTERS=[
 {en:'Water & rivers',zh:'水与河流',color:'#4b9cc7',center:[-3.4,1.8,.8,2.5,-1.2,.5,-2.8,1.7],words:[['water','水'],['river','河流'],['glace','冰'],['flow','流动'],['river bank','河岸'],['current','水流'],['ocean','海洋'],['rain','雨']]},
 {en:'Finance & money',zh:'金融与金钱',color:'#c39c51',center:[0,2.1,-1.4,-2.7,1.4,1.5,2.2,-1.4],words:[['money','金钱'],['cash','现金'],['savings bank','银行'],['finance','金融'],['spend','花钱'],['interest','利息'],['credit','信用'],['value','价值']]},
 {en:'Technology & computing',zh:'技术与计算',color:'#8978cb',center:[3.2,1.2,.5,-1.2,-2.6,-1.8,1.5,2.9],words:[['code','代码'],['data','数据'],['model','模型'],['token','词元'],['glace','镜子'],['network','网络'],['compute','计算'],['AI','人工智能']]},
 {en:'Nature & seasons',zh:'自然与季节',color:'#6baf89',center:[-2.7,-1.6,-.6,1.3,3.1,-1.5,1,-2.6],words:[['spring','春天'],['season','季节'],['flower','花朵'],['growth','生长'],['forest','森林'],['llama','大羊驼'],['leaf','叶片'],['seed','种子']]},
 {en:'Light & ideas',zh:'光与想法',color:'#b781bc',center:[.2,-2.2,1.5,-2.3,-1.4,2.6,-1.2,1.2],words:[['light','光线'],['vision','视觉'],['idea','想法'],['insight','洞见'],['bright','明亮'],['image','图像'],['see','看见'],['llama','火焰']]},
 {en:'Body & health',zh:'身体与健康',color:'#4faaa8',center:[3,-1.6,-1.3,2.6,.5,1.3,-.5,-2.2],words:[['weight','体重'],['health','健康'],['body','身体'],['diet','饮食'],['light','轻的'],['energy','能量'],['exercise','运动'],['balance','平衡']]},
 {en:'Romance & company',zh:'约会与陪伴',color:'#c77ca4',center:[-1,.3,3.3,1.6,-1.1,2.3,.8,-2.4],words:[['date','约会'],['romance','浪漫'],['dinner','晚餐'],['flowers','鲜花'],['love','爱'],['couple','情侣'],['candle','烛光'],['heart','心动']]},
 {en:'Fruit & food',zh:'水果与食物',color:'#9caa4c',center:[2.2,-.5,-3.2,-1.8,2.7,.3,-2,1.1],words:[['date','椰枣'],['avocado','牛油果'],['fruit','水果'],['palm','棕榈'],['sweet','甜'],['salad','沙拉'],['guacamole','牛油果酱'],['eat','吃']]},
 {en:'Objects & belongings',zh:'物品与随身用品',color:'#7d93c1',center:[-3,.3,-2.3,2.8,.9,-2.1,1.9,.4],words:[['things','东西'],['bag','包'],['keys','钥匙'],['book','书'],['phone','手机'],['pack','收拾'],['carry','携带'],['object','物品']]},
 {en:'Past & memory',zh:'过去与记忆',color:'#8d9cc3',center:[-2.7,2.5,-1.8,.4,-2.1,2.9,-.5,1.8],words:[['kal','昨天'],['memory','记忆'],['history','历史'],['finished','完成'],['before','之前'],['remember','回想'],['past','过去'],['yesterday','昨天']]},
 {en:'Future & possibility',zh:'未来与可能',color:'#63b7ae',center:[2.9,2.2,2.3,-.7,1.9,-2.4,1.3,-1.6],words:[['kal','明天'],['plan','计划'],['hope','希望'],['tomorrow','明天'],['later','以后'],['next','下一个'],['will','将要'],['future','未来']]},
 {en:'Directions & navigation',zh:'方位与导航',color:'#bb9761',center:[1.7,-2.6,2.8,1.9,-1.2,.8,-2.3,1.5],words:[['east / west','东西'],['east','东'],['west','西'],['compass','指南针'],['map','地图'],['direction','方向'],['sunrise','日出'],['sunset','日落']]}

];
let seed=13021;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const normal=()=>Math.sqrt(-2*Math.log(Math.max(1e-9,random())))*Math.cos(2*Math.PI*random());
export const NODES=CLUSTERS.flatMap((c,k)=>c.words.map(([en,zh],i)=>({id:k*8+i,cluster:k,en,zh,vector:c.center.map(v=>v+normal()*.44)})));
export const DUST=CLUSTERS.flatMap((c,k)=>Array.from({length:190},()=>({cluster:k,vector:c.center.map(v=>v+normal()*.68),size:.25+random()*1.6,phase:random()*Math.PI*2})));
export const BRIDGES=[
 {label:'bank',zh:'河岸 ↔ 银行',a:4,b:10,en:'The river bank and the savings bank share a spelling, but the context changes the meaning.',cn:'同样拼作 bank，“河岸”和“银行”由上下文区分。'},
 {label:'light',zh:'光线 ↔ 轻的',a:32,b:44,en:'A light in the room and a light bag belong to different contexts.',cn:'房间里的 light 指光，a light bag 中的 light 指轻。'},
 {label:'flower / spend',zh:'花朵 ↔ 花钱',a:26,b:12,en:'The character 花 can describe a flower or spending money; the surrounding words resolve the sense.',cn:'“花”可以表示花朵，也可以表示花钱；前后词语帮助确定含义。'},
 {label:'mouse',zh:'老鼠 ↔ 鼠标',a:29,b:20,en:'Mouse links an animal to a computing device through a shared word and analogy.',cn:'mouse 通过相同词形与类比，把动物与计算设备连接起来。'}
];
export const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
export function basis(angle){const c=Math.cos(angle),s=Math.sin(angle),q=Math.cos(.15+angle*.48),r=Math.sin(.15+angle*.48);return [[c*q,0,0,s*q,0,0,r,0],[0,c*q,0,0,s*q,0,0,r],[0,0,c,0,0,s,0,0]];}
export const project=(vector,angle)=>basis(angle).map(row=>dot(row,vector));
export function rotate([x,y,z],yaw,pitch){const a=x*Math.cos(yaw)+z*Math.sin(yaw),b=-x*Math.sin(yaw)+z*Math.cos(yaw);return [a,y*Math.cos(pitch)-b*Math.sin(pitch),y*Math.sin(pitch)+b*Math.cos(pitch)];}

// Contextual states are authored illustrations, not an embedding lookup moving in a trained model.
export const CASES=[
 {en:'bank',zh:'河岸／银行',a:4,b:10,contexts:[{en:'Sit by the river bank',zh:'坐在河岸边',fr:'rive',es:'orilla'},{en:'Deposit money at the bank',zh:'把钱存入银行',fr:'banque',es:'banco'}]},
 {en:'light',zh:'光／轻',a:32,b:44,contexts:[{en:'Turn on the light',zh:'打开灯',fr:'lumière',es:'luz'},{en:'A light suitcase',zh:'轻便的行李箱',fr:'léger',es:'ligero'}]},
 {en:'flower / spend',zh:'花',a:26,b:12,contexts:[{en:'A flower in spring',zh:'春天的一朵花',fr:'fleur',es:'flor'},{en:'Spend money on books',zh:'花钱买书',fr:'dépenser',es:'gastar'}]},
 {en:'glace',zh:'冰／镜子',a:2,b:20,pun:'De la glace dans le verre, une glace devant moi.',punZh:'杯里有冰，面前有一面镜子。',contexts:[{en:'Ice melts in the glass',zh:'杯里的冰融化了',fr:'glace',es:'hielo'},{en:'Look at yourself in the mirror',zh:'看镜子里的自己',fr:'glace',es:'espejo'}]},
 {en:'date',zh:'约会／椰枣',a:48,b:56,pun:'I brought a date to dinner.',punZh:'我带了约会对象来吃晚餐。／我带了一颗椰枣来吃晚餐。',contexts:[{en:'A date at a candlelit dinner',zh:'烛光晚餐的约会对象',fr:'rendez-vous',es:'cita'},{en:'A sweet date from a palm',zh:'棕榈树上的甜椰枣',fr:'datte',es:'dátil'}]},
 {en:'llama',zh:'大羊驼／火焰',a:29,b:39,pun:'La llama mira la llama.',punZh:'大羊驼看着火焰。',contexts:[{en:'A llama grazes in the Andes',zh:'大羊驼在安第斯山吃草',fr:'lama',es:'llama'},{en:'A candle flame flickers',zh:'蜡烛的火焰摇曳',fr:'flamme',es:'llama'}]},
 {en:'kal · کل',zh:'昨天／明天',a:72,b:80,pun:'ہم کل کا کام کل کریں گے۔',punZh:'我们把 kal 的工作留到 kal 做：昨天的工作明天做／明天的工作明天做。',roman:'Ham kal kā kām kal kareṅge.',contexts:[{en:'The exam was yesterday',zh:'考试在昨天',fr:'hier',es:'ayer',ur:'کل',urSentence:'کل امتحان تھا۔',urNeighbors:['یاد','ماضی','گزرا']},{en:'The exam will be tomorrow',zh:'考试将在明天',fr:'demain',es:'mañana',ur:'کل',urSentence:'کل امتحان ہو گا۔',urNeighbors:['منصوبہ','مستقبل','امید']}]},
 {en:'dongxi',zh:'东西',a:64,b:88,pun:'我的东西不分东西。',punZh:'东西可指物品，也可指东与西两个方位；dōngxi 与 dōngxī 的读音还不同。',contexts:[{en:'Pack your things',zh:'收拾好你的东西',fr:'affaires',es:'cosas'},{en:'Tell east from west',zh:'辨别东西方向',fr:'est / ouest',es:'este / oeste'}]}

];
export const NEIGHBORS=[
 [['river','河流'],['water','水'],['stream','溪流'],['shore','岸边'],['boat','船'],['flow','流动']],
 [['money','金钱'],['cash','现金'],['save','存钱'],['books','书籍'],['buy','买'],['credit','信用']],
 [['keyboard','键盘'],['screen','屏幕'],['click','点击'],['pointer','指针'],['code','代码'],['computer','电脑']],
 [['cat','猫'],['dog','狗'],['cheese','奶酪'],['pet','宠物'],['spring','春天'],['seed','种子']],
 [['lamp','灯'],['bright','明亮'],['sun','太阳'],['vision','视觉'],['glow','光辉'],['spark','火花']],
 [['weight','重量'],['heavy','重的'],['carry','携带'],['bag','包'],['balance','平衡'],['feather','羽毛']],
 [['romance','浪漫'],['dinner','晚餐'],['flowers','鲜花'],['love','爱'],['candle','烛光'],['heart','心动']],
 [['fruit','水果'],['palm','棕榈'],['sweet','甜'],['salad','沙拉'],['guacamole','牛油果酱'],['eat','吃']],
 [['bag','包'],['keys','钥匙'],['book','书'],['phone','手机'],['pack','收拾'],['carry','携带']],
 [['memory','记忆'],['history','历史'],['finished','完成'],['before','之前'],['remember','回想'],['past','过去']],
 [['plan','计划'],['hope','希望'],['tomorrow','明天'],['later','以后'],['next','下一个'],['will','将要']],
 [['east','东'],['west','西'],['compass','指南针'],['map','地图'],['sunrise','日出'],['sunset','日落']]

];
export const SOURCE_HOLD_MS=3000,TRAVEL_MS=6000,DESTINATION_HOLD_MS=5000;
export const TOUR_MS=SOURCE_HOLD_MS+TRAVEL_MS+DESTINATION_HOLD_MS;
export const smoother=t=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
export function tourState(elapsed){const time=Math.max(0,elapsed),local=time%TOUR_MS,t=(local-SOURCE_HOLD_MS)/TRAVEL_MS;return {route:Math.floor(time/TOUR_MS)%CASES.length,local,progress:smoother(t),phase:t<=0?'source':t>=1?'arrival':'travel'};}
export function contextVector(route,progress){const c=CASES[route],a=NODES[c.a].vector,b=NODES[c.b].vector,t=Math.max(0,Math.min(1,progress));return a.map((v,i)=>v+(b[i]-v)*t);}
