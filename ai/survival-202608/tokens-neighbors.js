// Curated teaching vocabulary: rows are contextual concept glosses, not universal synonyms.
// Four concepts per tier; translations do not imply shared polysemy across languages.
export const SEMANTIC_NEIGHBOR_LEGEND = Object.freeze({
 en:'Authored proximity tiers for layout, not measured embeddings or similarity scores. Translations describe the selected sense.',
 zh:'距离层级由作者编排，仅用于布局，不是实测嵌入或相似度分数。译词描述当前语义。',
 es:'Niveles de proximidad diseñados para la visualización, no medidas de similitud. Las traducciones describen el sentido elegido.',
 pt:'Níveis de proximidade definidos para a visualização, não medidas de semelhança. As traduções descrevem o sentido escolhido.'
});
const table = text => text.trim().split('\n').map(row=>row.split('|'));
const river=table(`river bank|河岸|orilla del río|margem do rio
river|河流|río|rio
water|水|agua|água
stream|溪流|arroyo|riacho
current|水流|corriente de agua|corrente de água
shore|岸边|orilla|margem
floodplain|洪泛平原|llanura aluvial|planície aluvial
sediment|沉积物|sedimento|sedimento
watershed|流域|cuenca hidrográfica|bacia hidrográfica
rainfall|降雨|lluvia|chuva
wetland|湿地|humedal|zona úmida
estuary|河口|estuario|estuário`);
const finance=table(`savings bank|储蓄银行|banco de ahorros|banco de poupança
money|金钱|dinero|dinheiro
deposit|存款|depósito bancario|depósito bancário
savings|储蓄|ahorros|poupança
spend money|花钱|gastar dinero|gastar dinheiro
payment|付款|pago|pagamento
loan|贷款|préstamo|empréstimo
interest rate|利率|tipo de interés|taxa de juros
budget|预算|presupuesto|orçamento
household finances|家庭财务|finanzas familiares|finanças familiares
investment|投资|inversión|investimento
economy|经济|economía|economia`);
const computing=table(`computer|计算机|computadora|computador
code|代码|código|código
data|数据|datos|dados
software|软件|software|software
keyboard|键盘|teclado|teclado
screen|屏幕|pantalla|tela
algorithm|算法|algoritmo|algoritmo
network|网络|red informática|rede de computadores
information|信息|información|informação
storage|存储|almacenamiento|armazenamento
programming|编程|programación|programação
digital system|数字系统|sistema digital|sistema digital`);
const animals=table(`animal|动物|animal|animal
llama|美洲驼|llama|lhama
herd|兽群|manada|manada
grazing|吃草|pastoreo|pastejo
pasture|牧场|pastizal|pastagem
fur|兽毛|pelaje|pelagem
mammal|哺乳动物|mamífero|mamífero
habitat|栖息地|hábitat|habitat
mountain|山地|montaña|montanha
ecosystem|生态系统|ecosistema|ecossistema
vegetation|植被|vegetación|vegetação
biodiversity|生物多样性|biodiversidad|biodiversidade`);
const light=table(`light|光|luz|luz
lamp|灯|lámpara|lâmpada
brightness|亮度|brillo|brilho
illumination|照明|iluminación|iluminação
glow|辉光|resplandor|resplendor
beam of light|光束|haz de luz|feixe de luz
shadow|影子|sombra|sombra
sunlight|阳光|luz solar|luz solar
vision|视觉|visión|visão
color|颜色|color|cor
optics|光学|óptica|óptica
visibility|可见度|visibilidad|visibilidade`);
const weight=table(`lightweight|重量轻|ligero|leve
weight|重量|peso|peso
heavy|沉重|pesado|pesado
light suitcase|轻便行李箱|maleta ligera|mala leve
carry|携带|llevar|carregar
weigh|称重|pesar|pesar
scale|秤|balanza|balança
load|负载|carga|carga
balance|平衡|equilibrio|equilíbrio
strength|力量|fuerza|força
lifting|举起|levantamiento|levantamento
transport|运输|transporte|transporte`);
const romance=table(`romantic date|恋爱约会|cita romántica|encontro romântico
couple|情侣|pareja|casal
romance|浪漫爱情|romance|romance
love|爱|amor|amor
dinner together|共进晚餐|cena juntos|jantar juntos
bouquet|花束|ramo de flores|buquê de flores
candlelight|烛光|luz de velas|luz de velas
affection|爱意|afecto|afeto
companionship|陪伴|compañía|companhia
conversation|交谈|conversación|conversa
trust|信任|confianza|confiança
shared memories|共同回忆|recuerdos compartidos|memórias compartilhadas`);
const dates=table(`date fruit|椰枣|dátil|tâmara
date palm|椰枣树|palmera datilera|tamareira
sweetness|甜味|dulzor|doçura
fruit flesh|果肉|pulpa|polpa
fruit pit|果核|hueso de la fruta|caroço da fruta
dried dates|干椰枣|dátiles secos|tâmaras secas
ripe fruit|成熟果实|fruta madura|fruta madura
harvest|收获|cosecha|colheita
orchard|果园|huerto frutal|pomar
oasis|绿洲|oasis|oásis
snack|点心|refrigerio|lanche
dietary fiber|膳食纤维|fibra alimentaria|fibra alimentar`);
const objects=table(`belongings|随身物品|pertenencias|pertences
things|东西|cosas|coisas
bag|包|bolsa|bolsa
keys|钥匙|llaves|chaves
book|书|libro|livro
phone|手机|teléfono móvil|celular
pack a bag|收拾行李|preparar la maleta|arrumar a mala
carry|携带|llevar|carregar
storage|收纳|almacenamiento|armazenamento
checklist|清单|lista de verificación|lista de verificação
luggage|行李|equipaje|bagagem
personal possessions|个人财物|posesiones personales|bens pessoais`);
const past=table(`yesterday|昨天|ayer|ontem
past|过去|pasado|passado
previous day|前一天|día anterior|dia anterior
already happened|已经发生|ya ocurrió|já aconteceu
memory|记忆|recuerdo|memória
before|以前|antes|antes
finished|已完成|terminado|concluído
remember|回想|recordar|lembrar
history|历史|historia|história
archive|档案|archivo|arquivo
experience|经历|experiencia|experiência
chronology|时间顺序|cronología|cronologia`);
const future=table(`tomorrow|明天|mañana|amanhã
future|未来|futuro|futuro
next day|第二天|día siguiente|dia seguinte
not yet|尚未|todavía no|ainda não
plan|计划|plan|plano
later|以后|más tarde|mais tarde
upcoming|即将到来|próximo|próximo
intention|打算|intención|intenção
possibility|可能性|posibilidad|possibilidade
expectation|期待|expectativa|expectativa
preparation|准备|preparación|preparação
long-term goal|长期目标|objetivo a largo plazo|objetivo de longo prazo`);
const directions=table(`east|东|este|leste
west|西|oeste|oeste
direction|方向|dirección|direção
compass|指南针|brújula|bússola
north|北|norte|norte
south|南|sur|sul
map|地图|mapa|mapa
orientation|辨别方位|orientación|orientação
navigation|导航|navegación|navegação
horizon|地平线|horizonte|horizonte
route|路线|ruta|rota
geography|地理|geografía|geografia`);
const ice=table(`ice|冰|hielo|gelo
frozen water|冻结的水|agua congelada|água congelada
freezing|结冰|congelación|congelamento
melting|融化|fusión del hielo|derretimento
cold|寒冷|frío|frio
ice cube|冰块|cubo de hielo|cubo de gelo
frost|霜|escarcha|geada
snow|雪|nieve|neve
glacier|冰川|glaciar|geleira
winter|冬季|invierno|inverno
temperature|温度|temperatura|temperatura
water cycle|水循环|ciclo del agua|ciclo da água`);
const mirror=table(`mirror|镜子|espejo|espelho
reflection|镜中映像|reflejo|reflexo
reflective surface|反射表面|superficie reflectante|superfície refletora
look in a mirror|照镜子|mirarse al espejo|olhar-se no espelho
glass|玻璃|vidrio|vidro
face|脸|rostro|rosto
image|影像|imagen|imagem
reflected light|反射光|luz reflejada|luz refletida
optics|光学|óptica|óptica
symmetry|对称|simetría|simetria
appearance|外貌|apariencia|aparência
self-portrait|自画像|autorretrato|autorretrato`);
const flower=table(`flower|花朵|flor|flor
petal|花瓣|pétalo|pétala
blossom|开花|florecer|florescer
flower bud|花蕾|capullo floral|botão floral
pollen|花粉|polen|pólen
stem|茎|tallo|caule
leaf|叶子|hoja|folha
seed|种子|semilla|semente
garden|花园|jardín|jardim
spring season|春季|primavera|primavera
pollination|授粉|polinización|polinização
plant growth|植物生长|crecimiento vegetal|crescimento vegetal`);
const llama=table(`llama|美洲驼|llama|lhama
Andes|安第斯山脉|Andes|Andes
grazing|吃草|pastoreo|pastejo
herd|兽群|manada|manada
camelid|骆驼科动物|camélido|camelídeo
wool|毛纤维|lana|lã
pasture|牧场|pastizal|pastagem
pack animal|驮畜|animal de carga|animal de carga
highlands|高地|tierras altas|terras altas
herbivore|食草动物|herbívoro|herbívoro
animal husbandry|畜牧业|ganadería|pecuária
mountain habitat|山地栖息地|hábitat de montaña|habitat de montanha`);
const flame=table(`flame|火焰|llama|chama
fire|火|fuego|fogo
burning|燃烧|combustión|combustão
candle flame|烛焰|llama de una vela|chama de uma vela
heat|热|calor|calor
wick|烛芯|mecha|pavio
spark|火花|chispa|faísca
fuel|燃料|combustible|combustível
light emission|发光|emisión de luz|emissão de luz
oxygen|氧气|oxígeno|oxigênio
fireplace|壁炉|chimenea|lareira
fire safety|防火安全|seguridad contra incendios|segurança contra incêndios`);
const spending=table(`spend money|花钱|gastar dinero|gastar dinheiro
purchase|购买|compra|compra
pay|付款|pagar|pagar
expenditure|支出|gasto|despesa
money|金钱|dinero|dinheiro
price|价格|precio|preço
budget|预算|presupuesto|orçamento
receipt|收据|recibo|recibo
household finances|家庭财务|finanzas familiares|finanças familiares
savings|储蓄|ahorros|poupança
consumer choice|消费选择|elección del consumidor|escolha do consumidor
financial planning|财务规划|planificación financiera|planejamento financeiro`);
const BASE=[river,finance,computing,animals,light,weight,romance,dates,objects,past,future,directions];
const LANGS=['en','zh','es','pt'];
const TIERS=[.9,.55,.25];
export function semanticNeighbors(cluster,route=0){
 if(!Number.isInteger(cluster)||cluster<0||cluster>=BASE.length)return [];
 const rows=route===2&&cluster===1?spending:route===3&&cluster===0?ice:route===3&&cluster===2?mirror:route===2&&cluster===3?flower:route===5&&cluster===3?llama:route===5&&cluster===4?flame:BASE[cluster];
 return rows.flatMap((row,i)=>row.map((text,j)=>({text,lang:LANGS[j],relatedness:TIERS[Math.floor(i/4)]})));
}
// Authored 8D placement around an anchor; radius is a layout distance, not measured similarity.
export function semanticLayout(word,index,cluster,anchor){
 const radius=.36+(1-word.relatedness)*1.55;
 const t=index*2.399963+cluster*.51;
 const z=1-2*((index*.61803398875)%1);
 const rr=Math.sqrt(1-z*z);
 const direction=[rr*Math.cos(t),rr*Math.sin(t),z,...Array.from({length:5},(_,d)=>Math.sin(t*(d+2))*.25)];
 const length=Math.hypot(...direction);
 const vector=anchor.map((value,d)=>value+direction[d]/length*radius);
 const size=(word.lang==='zh'?9.4:8.2)+2.4*word.relatedness;
 return {vector,radius,size};
}
// Additional authored neighbors balance scripts without implying shared wordplay.
// Each entry: eight Chinese neighbors, then two sense-specific ar/ko/ja/ru glosses.
const EXTRA={
 river:['河床 河谷 支流 溪水 河湾 河滩 水道 水文', ['ماء','물','水','вода'], ['نهر','강','川','река']],
 finance:['账户 本金 利息 存单 余额 汇款 货币 金融', ['مال','돈','お金','деньги'], ['بنك','은행','銀行','банк']],
 computing:['程序 指令 字节 文件 服务器 处理器 数据库 操作系统', ['حاسوب','컴퓨터','コンピューター','компьютер'], ['بيانات','데이터','データ','данные']],
 animals:['草地 野生动物 蹄子 驼毛 饲料 保护区 山坡 草食性', ['حيوان','동물','動物','животное'], ['عشب','풀','草','трава']],
 light:['灯泡 光线 明亮 光源 灯光 光照 光谱 折射', ['ضوء','빛','光','свет'], ['مصباح','램프','ランプ','лампа']],
 weight:['轻巧 轻盈 轻量 负重 减重 承重 便携 质量', ['وزن','무게','重さ','вес'], ['خفيف','가벼운','軽い','лёгкий']],
 romance:['相恋 心动 相伴 爱情 恋人 烛光晚餐 相处 关怀', ['حب','사랑','愛','любовь'], ['عشاء','저녁 식사','夕食','ужин']],
 dates:['枣肉 枣核 棕榈 果穗 果皮 果糖 采摘 果干', ['تمر','대추야자 열매','ナツメヤシの実','финики'], ['حلو','달콤한','甘い','сладкий']],
 objects:['物件 物品 背包 钱包 衣物 文具 日用品 整理', ['حقيبة','가방','かばん','сумка'], ['مفتاح','열쇠','鍵','ключ']],
 past:['往昔 昨日 先前 过往 往事 追忆 回顾 旧事', ['أمس','어제','昨日','вчера'], ['الماضي','과거','過去','прошлое']],
 future:['明日 将来 后续 预期 目标 展望 规划 日后', ['غدا','내일','明日','завтра'], ['المستقبل','미래','未来','будущее']],
 directions:['东方 西方 北方 南方 方位 东西向 路标 定位', ['شرق','동쪽','東','восток'], ['غرب','서쪽','西','запад']],
 ice:['冰晶 冰层 冰面 低温 冰雪 冻结 冰点 固态', ['جليد','얼음','氷','лёд'], ['بارد','차가운','冷たい','холодный']],
 mirror:['镜面 镜框 镜像 平面镜 反光 倒影 成像 梳妆镜', ['مرآة','거울','鏡','зеркало'], ['انعكاس','반사','反射','отражение']],
 flower:['花香 花茎 花枝 花期 花冠 花蕊 植株 花丛', ['زهرة','꽃','花','цветок'], ['بتلة','꽃잎','花びら','лепесток']],
 llama:['驼群 驼毛 蹄子 草地 饲养 载物 高原 放牧', ['لاما','라마','ラマ','лама'], ['جبل','산','山','гора']],
 flame:['火苗 火光 烛火 火舌 火星 热量 点燃 熄灭', ['لهب','불꽃','炎','пламя'], ['شمعة','양초','ろうそく','свеча']],
 spending:['消费 开销 花费 购物 付费 账单 结账 零钱', ['دفع','지불','支払い','оплата'], ['شراء','구매','購入','покупка']]
};
const EXTRA_BASE=['river','finance','computing','animals','light','weight','romance','dates','objects','past','future','directions'];
export function internationalNeighbors(cluster,route=0){
 if(!Number.isInteger(cluster)||cluster<0||cluster>=EXTRA_BASE.length)return [];
 const key=route===2&&cluster===1?'spending':route===3&&cluster===0?'ice':route===3&&cluster===2?'mirror':route===2&&cluster===3?'flower':route===5&&cluster===3?'llama':route===5&&cluster===4?'flame':EXTRA_BASE[cluster];
 const [chinese,...concepts]=EXTRA[key];
 return [...chinese.split(' ').map((text,i)=>({text,lang:'zh',relatedness:i<3?.9:i<6?.55:.25})),...concepts.flatMap((row,i)=>row.map((text,j)=>({text,lang:['ar','ko','ja','ru'][j],relatedness:i===0?.9:.55})))];
}
