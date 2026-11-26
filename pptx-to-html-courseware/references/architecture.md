# 引擎与架构参考

> 目录：目录结构 / 数据结构 / 渲染与分步规则 / 覆盖器协议 / 导航交互 / ADR 精华

## 1. 目录结构（以课件仓库根为站点根）

```
<仓库根>/                               ← 对应 kuaiyu.site/slides/（VPS /var/www/slides/）
  index.html                            课件中心门户（读 manifest.json 自动列表）
  manifest.json                         课件清单（live/building/planned 三态）
  <学科>/<章节>/                        如 physio/cardiovascular/
    index.html                          封面 + 节目录卡
    deck.html                           放映页外壳（?sec=secN 参数驱动）
    assets/css/deck.css                 全部样式（设计变量 :root）
    assets/js/deck.js                   渲染引擎 + 翻页/总览/讲稿/快捷键
    assets/img/*.webp                   PPT 提取图片
    data/slides.json                    全部页内容（坐标/富文本/讲稿/anim）
    data/sections.json                  章节定义 + 小节导航 + app 嵌入点
    data/overrides/secN.js              精修覆盖器（按节一个文件）
    dev/TASKS.json                      任务队列工作副本（随 git）
```

## 2. sections.json 结构

```json
{
  "deck": {"title": "...", "chapter": "...", "book": "...", "totalSlides": 192},
  "sections": [{
    "id": "sec1", "no": "01", "title": "...", "short": "...", "en": "...",
    "range": [2, 33],                  // PPT 页码（含两端）
    "color": "#c2546a",                // 节色 → --sec-color CSS 变量
    "topics": [{"at": 4, "t": "..."}], // 侧栏小节导航（at=PPT 页码）
    "apps": [{
      "at": 10,                        // 在该 PPT 页之后插入整页 app
      "name": "3D 心动周期模拟器",
      "url": "https://kuaiyu.site/cardiac_cycle/",   // 尾斜杠必须有，否则 301
      "note": "为什么在这里...", 
      "qr": true,                      // 有 PPT 二维码实证；设计性补充为 false
      "guide": ["第一步看什么", "动手做什么", "思考什么"],
      "qrPoster": "assets/img/poster_xxx.webp"       // 16:9 官方双码海报封面
    }]
  }]
}
```

## 3. 渲染与分步规则

- 舞台固定 **1280×720**（`BASE_W/BASE_H`），CSS `.stage { width:1280px; height:720px; flex: none; }`，缩放只走 `transform: scale()`（fitStage 计算 `min((wrapW-30)/1280, (wrapH-20)/720)`）
- 页类型：`slide-page`（绝对坐标还原 slides.json）与 `app-slide`（iframe 整页）
- 分步显现：元素挂 `data-step`，当前 `_revealed` 步数控制 `.on` class；**→ 先走页内步进再翻页，← 反向退步**
- 顺序来源：有 `anim` 按 anim；无 anim 自动合成——标题区（顶 <100px 文本）恒显，其余形状按纵向中心排序、40px 内并为一步
- hash 路由：`#s<N>`（第 N 页幻灯片）与 `#app-<N>`（app 页）；启动时解析

## 4. 覆盖器协议 v2

```js
window.DECK_OVERRIDES = window.DECK_OVERRIDES || {};
window.DECK_OVERRIDES[42] = function (pageEl, data, api) {   // 键 = PPT 页码
  var card = api.ce('div', 'x-el x-card', '<h4>…</h4>');
  card.style.cssText = 'position:absolute;left:80px;top:150px;width:500px';
  var title = api.ce('div', 'x-el x-title', '<h2>…</h2>');
  return { steps: [[card]], static: [title] };
};
```

- `static` 恒显；`steps` 按 → 逐组点亮；**封面/单帧内容必须放 static**（放 steps 入场空白）
- `api`：`ce(tag, cls, html)` / `esc(s)` / `data`（本页 slides.json 条目）/ `sec` / `BASE_W/BASE_H`
- 复用元素统一带 `x-el` 类获得入场动效；返回 null = 全自控（自行 append）
- 注册：deck.html 底部加 `<script src="data/overrides/secN.js"></script>`；样式追加 deck.css 末尾，类名前缀 `x-`

## 5. 导航交互（现行标准）

- 热键：`←→↑↓` 翻页（含步进）、`F` 全屏、`O` 总览、`N` 讲稿、`M` 侧栏、Home/End
- 左右边缘热区（`.flip`，12% 宽全高）：**普通页保留，app 页隐藏**（`.stage.app-mode .flip { display:none }`，go() 按当前页类型切换 class）
- 底部虚拟翻页按钮 `.pagenav`：**文档流独立 chrome 行**（main 之后），不用 fixed——height-bound 大屏上 fixed 底栏会盖住 iframe 底边（app 的时间轴控件常在底部）

## 6. ADR 精华（决策模式，可迁移到新课件）

| 决策 | 内容 | 理由/后果 |
|---|---|---|
| 绝对坐标还原 | slides.json 坐标驱动，覆盖器渐进精修 | 零手工 70% 保真；代价：group 需 enrich 展开 |
| 单 deck + ?sec= | 多节共用外壳 | 避免 N 份外壳漂移；天然深链 |
| app 整页 iframe | 插在该页之后，懒加载、离开卸载 src | 不挤占版面；避免一次加载多个 WebGL |
| QR 为互动点实证 | 二维码/文本标注定位嵌入点 | 课堂本来就这么用 |
| 部署独立双轨 | 课件不走主门户构建，rsync/tar 直传独立目录 | 更新频率不同，互不破坏 |
| 设计沿用 PPT 母版 | 母版底图 + 白色渐变蒙层保可读 | 师生视觉连续性 |
| 分步显现 | 显式动画优先，无动画按阅读带合成 | 每页都有课堂节奏 |
| 覆盖器返回 {steps,static} | 引擎统一管步进 | static 放单帧内容（踩过坑） |
| 相位配色系统 | 五色贯穿同主题全部页 | 跨页视觉锚点 |
