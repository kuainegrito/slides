---
name: pptx-to-html-courseware
description: 将教学 PPTX 转为可离线或上线的互动 HTML 课件，精修课堂放映、独立讲稿、机制动画与模拟器嵌入，也可从已定稿的 HTML 按实际点击顺序导出内嵌视频的 PowerPoint。适用于整学期课程及教学竞赛短课。
---

# 互动 HTML 课件与视频放映版

## 本机工作区

本机在 `F:/codex_worktrees` 下的项目目录处理脚本、解包、缓存、录屏和验证材料。运行时将可配置的临时目录和缓存指向该项目。Nutstore 存放指定的正式交付或已提交的主分支镜像。

制作新 HTML 时，从原 PPTX 提取内容和节奏。修订多版本课件时，先明确哪份管画面和媒体、哪份提供批注、哪份决定章节命名。增删页后用标题、内容和相邻步骤确认对应关系。用户确认 HTML 定稿后，从该版本的学生放映界面导出视频，沿用已确认的原片、页码和揭示顺序。

从定稿 HTML 制作视频 PPT 时，直接读[按点击导出视频 PowerPoint](references/click-video-export.md)。下文的五阶段适用于从 PPTX 新建网页课件。

## 课堂与竞赛放映：独立讲稿窗口

制作于快的教学放映版时，默认让投影端全屏展示学生要看的幻灯片。教师在自己屏幕上通过“讲稿”按钮打开独立窗口，阅读当前讲稿、板书提示和下一步预告。原生 PowerPoint 用备注和演讲者视图实现相同体验。

HTML 双窗共享当前页和页内步骤。教师在任一窗口前进、后退或跳页，两端同步；放映中途打开或重开讲稿窗口，直接定位到当前步骤。每段口播和板书提示随对应步骤保存，增删页后由放映顺序计算页码。只需整页展示时，一次翻页即可推进；页内动画自行播放，换页由教师控制。

放映底栏为上一页、下一页、重播、目录、讲稿、全屏和媒体操作预留固定位置。同一窗口尺寸下，视频出现、声音开关或按钮文案变化时，各按钮的屏幕坐标保持稳定。窄屏可用固定的第二行容纳媒体操作。验收时在“下一步”中心连续点击同一坐标，依次经过静音视频、有声视频和普通页，再原位点击“上一步”返回，核对实际页码。

底栏提供页码输入框和“跳转”按钮。输入范围随当前总页数更新；输入有效整数后，按 Enter 或点击“跳转”进入目标页第一步，讲稿窗口同步。空值或越界时保留当前页并提示有效范围。跳转成功后移出输入焦点，方向键恢复步进。桌面和窄屏分别核验回车、点击、越界输入，以及原翻页按钮的位置。

导航按钮旁显示常用快捷键的小字，投影底栏沿用自动隐藏。完整按键表可放进目录；页码输入框的 Enter 属于跳转，视频控件如无专用按键则保留按钮名称。显示文字、无障碍按键标记和实际监听器须一致。用固定控件槽容纳小字，检查桌面、窄屏及有声视频页之间翻页按钮位置稳定。

手机版学生放映沿用同一套页内步进。向左滑或轻点屏幕右边缘前进，向右滑或轻点左边缘返回。以位移和主方向识别横滑，过滤竖向与多指手势；保护导航、目录、视频控件与互动 iframe，抑制手势后合成的重复点击。桌面点击与键盘行为沿用原规则。在触屏视口验证边缘轻点、横滑、页内揭示、控件输入和互动区，优先使用真实触屏或浏览器触摸事件。

讲稿窗口把“上一步／下一步”放入独立的固定底栏，只让正文、板书提示和下一步预告所在区域滚动。切换步骤后正文回到顶部。验收时用一个短稿和一个超过窗口高度的长稿往返切换，核对两按钮的屏幕坐标，并检查长稿末尾可滚动读到。

按教师真正停顿和点击的位置记录步骤。入页即见的底图或问题是第一步；教师要等待学生回答时，答案随下一次点击出现。整页直接讲过的目标页可以只有一步。每步关联学生画面、口播、动作、板书增量和起止时间，HTML 双窗与 PPT 备注共用这份数据。

先画完整板书机制图，再沿放映顺序逐步推导。教师端给出本步要写、贴、连或指的内容，并展示截至本步的板书。先出现的板书只用学生已经见过的概念。把书写、听原声、候答和观看演算计入课时，边指边讲只计一次，以本场时限彩排。

讲稿窗口底栏提供可见的「关闭讲稿」，同时支持 Esc 和 P 关闭并返回放映。投影的全屏操作绑定在投影端。macOS 浏览器可能以新标签或全屏空间显示讲稿，验收须分别试有窗和全屏投影两种入口，并在不同浏览器验证关闭、原页续播和重开同步。关闭键不拦截 Command／Ctrl 等系统组合键。浏览器模拟结果与 macOS 真机结果分别记录。

病例视频需要教师伴讲时，先按原片核对人物、场景和转折，再写能在片长内自然说完的口述。讲者端可用简短画面提示标出开口与停顿时机，给原声和人物反应留时间。

验收时同时打开两窗，试一次页内步进、跨页和返回，核对当前讲稿与投影画面，并确认投影全屏时观众看不到教师提示。

## 总流程（五阶段）

| 阶段 | 目标 | 关键产出 |
|---|---|---|
| P0 提取 | PPTX → 结构化数据 + 图片 + 互动点证据 | `data/slides.json`、`assets/img/*.webp`、`qr_codes.json` |
| P0 骨架 | 可上线的放映引擎，零手工 ~70% 保真 | `deck.html + deck.js + deck.css`、`sections.json` |
| P1–Pn 精修 | 按节覆盖器定制，还原动画节奏 | `data/overrides/secN.js` |
| 融合 | 二维码页升级为 app 互动页 | qrPoster 封面 + iframe 懒加载 |
| 部署验证 | tar+ssh 上线，DOM 断言闭环 | git commit + VPS + 线上验证记录 |

原则：**骨架先行**（先全部上线再逐节精修）；**逐节交付**（一节一个 commit 粒度）；**全程留痕**（LOG.md 倒序追加 + TASKS.json 认领制，供并行 agent 协作与后期提炼）。

## P0-1 提取（python-pptx）

见 [references/extraction.md](references/extraction.md)。要点：

1. 提取每页 shapes 的坐标/字号/颜色/富文本 run/图片/表格/notes → `slides.json`；坐标统一换算到 **1280×720 坐标系**（EMU→px，按幻灯片实际尺寸归一）。
2. 图片去重落盘并优化：**WebP q82、最长边 1600**（实测 83.3MB→9.9MB）。
3. **QR 扫描**（OpenCV `detectAndDecodeMulti`）+ 文本标注（"稳态软件/模拟"）→ `qr_codes.json`——这是互动点的实证路标。
4. 动画顺序：`scripts/extract_anim.py` 解析 `<p:timing>` 的 clickEffect 序列写入 `anim{steps,static}`；组展开：`scripts/enrich_groups.py` 按 OOXML chOff/chExt 递归展开 group（含坐标变换）。

## P0-2 骨架引擎

见 [references/architecture.md](references/architecture.md)。核心决策（ADR 精华）：

- **绝对坐标还原**而非逐页手写：deck.js 按 slides.json 逐对象绝对定位，零手工即得约 70% 保真度，精修渐进不影响其他页。
- **单 deck.html + `?sec=` 参数**：数据驱动多节共用外壳，天然支持深链 `deck.html?sec=sec3#s104`。
- **分步显现**：已定稿讲稿或播放器有明确步骤时沿用实际顺序；新搭骨架有 anim 按 anim，其余可自动合成（顶部 <100px 标题恒显，其余按纵向中心排序、40px 内并为一步）。→ 先走页内步进再翻页。
- **覆盖器协议 v2**：`window.DECK_OVERRIDES[页码] = fn(pageEl, data, api)` 返回 `{steps:[[el..]..], static:[el..]}`，引擎接管步进。**封面/单帧内容必须放 static**（放 steps 会入场空白）。
- **舞台固定 1280×720 + `flex: none`，只由 transform 缩放**——flex 子项默认 shrink 会造成布局层+变换层双重缩小。

## P1–Pn 精修（按节覆盖器）

1. 认领任务（TASKS.json → doing）再动手。
2. 在 `data/overrides/secN.js` 注册覆盖器；`api` 提供 `ce/esc/data/sec/BASE_W/BASE_H`；复用元素带 `x-el` 类获得入场动效。
3. 在 deck.html 注册 script；定制样式追加到 deck.css 末尾，类名前缀 `x-`。
4. 图片直接用 `assets/img/<hash>.webp`（slides.json 里 pic 的 src 即文件名）；**group 里的嵌套 pic 坐标是页绝对坐标，重用素材按原坐标摆放最稳**。
5. 版式模式目录见 [references/design-language.md](references/design-language.md)（标题条/卡片/双栏对照/流程链/大数字/时间轴/英雄页 SVG 等）。
6. **手绘生理/科学曲线前先找权威数据**：优先从对应 app 的运行时资源（如 `content/*.json` baseline）反取采样，弃手绘贝塞尔；若必须手绘，先定坐标映射量程并检查**所有贝塞尔控制点**是否越界。

## 融合 app（互动点升级）

见 [references/app-integration.md](references/app-integration.md)。要点：

- **PPT 里的二维码 = app 嵌入点路标**（qr 实证）；设计性补充嵌入点标 `qr:false`。
- 教师演示模型传播时，沿用原页标题，在标题下嵌入模型原有的网络视图。进入该步后从约定的基线自动施加扰动，保留观察时间，换页仍由教师决定。讲稿点明扰动、观察时点和要追踪的路径，并分清 AI 在图谱构建中的作用与模拟器计算的读数。离线交付时带齐引擎、拓扑、数据和显示资源，从最终离线包重新打开，断网验证传播过程及目标时点的实际读数。
- 学生扫码后自行操作时，app 用**整页 iframe** 嵌在对应页之后（懒加载、离开卸载 src），不挤占幻灯片版面。
- **学生扫码入口的二维码封面先行**：app 页第一步只显示官方双码海报（`qrPoster`，16:9 近乎铺满舞台），学生扫码后按 → 封面淡出、app 淡入。
- **覆盖层热区与 app 控件互斥**：app 页给舞台加 `app-mode` class 隐藏左右边缘翻页热区；翻页用热键（←→↑↓）+ 文档流里的底部虚拟按钮行（**不用 fixed 定位**——height-bound 大屏会盖 iframe 底边）。

## 部署与验证

见 [references/deploy-verify.md](references/deploy-verify.md)。要点：

- 部署：`tar czf - <改动文件> | ssh root@VPS "tar xzf - -C /var/www/slides"`；GitHub 与 VPS 独立双轨。
- 验证走**嵌入浏览器 DOM 断言**，五条铁律：
  1. 断言锚定 `#stage > *`[Deck.cur]（当前页）——懒渲染下 `body.textContent` 会命中全部隐藏页，是空支票；
  2. URL 必须带变化 query（`&v=N`）——纯改 hash 不触发整页加载，静态资源另可能缓存，必要时强刷；
  3. 遍历用页面内合成事件 `document.dispatchEvent(new KeyboardEvent(...))`；
  4. 后台标签截图会超时——几何断言（offsetWidth/computed style）+ class 状态断言足够闭环；
  5. hash 跳页只换内容，计数器/总览状态以按键遍历为准；`?sec=` 各节独立，跳别节页码不生效。

## 协作与留痕

- 工程档案目录：`README.md`（总览）/ `PLAN.md`（阶段）/ `DECISIONS.md`（ADR）/ `AGENT_GUIDE.md`（上手）/ `LOG.md`（倒序日志）/ `TASKS.json`（机器可读任务队列，仓库内为工作副本）。
- 一次只做 TASKS.json 里一个 doing；一个子任务一个 commit；决策写 ADR。
- 大节可拆（如 77 页拆 3a/3b）；每节 Definition of Done：标题体系、图文重排、组图修复、app 引导语、讲稿清理、响应式抽查、TASKS/LOG 更新。

## 参考文件导航

| 文件 | 什么时候读 |
|---|---|
| [references/extraction.md](references/extraction.md) | P0 提取阶段：python-pptx 细节、动画/组/QR/图片优化 |
| [references/architecture.md](references/architecture.md) | 搭/改引擎：数据结构、渲染规则、覆盖器协议、导航交互 |
| [references/design-language.md](references/design-language.md) | 精修排版：设计变量、相位配色、版式模式目录 |
| [references/app-integration.md](references/app-integration.md) | 嵌入 app：qrPoster、官方数据反取、交互冲突处理 |
| [references/deploy-verify.md](references/deploy-verify.md) | 部署上线与线上验证 playbook、踩坑清单 |
