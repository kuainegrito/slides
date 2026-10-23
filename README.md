# kuaiyu.site/slides — 活体网页课件中心

把教学 PPTX 变成**可翻页、可嵌入互动工具、可持续迭代**的网页课件。

**线上入口：https://kuaiyu.site/slides/**（旧路径 `/slide/` 301 重定向至此）

## 这是什么

- 不是 PPT 的截图搬运——按幻灯片母版的设计语言重建版式，保留原动画出现节奏（分步显现）；
- PPT 里印了二维码的地方（课堂上学生被派去玩互动模拟器的教学点），网页版直接**内嵌该 app**：先出官方双码海报供扫码，按 → 在大屏打开模拟器，互动工具取代静态幻灯片；
- 图表数据优先取自 app 的运行时基准（而非手绘），保证投影上的曲线和学生手机里的模拟器完全一致。

## 课件清单

| 课件 | 状态 | 内容 |
|---|---|---|
| `physio/cardiovascular/` | ✅ 已上线 | 《生理学》第10版 · 第四章 血液循环：192 页 · 六节（含总结复习）· 9 处互动模拟器嵌入 |
| `physio/cell/` | 筹备中 | 第二章 · 细胞的基本功能 |

新课件接入：目录放进本仓库并在根 `manifest.json` 登记一条，门户自动列出。

## 单份课件的内部结构

- `index.html` 封面目录 · `deck.html?sec=secN#s页码` 放映页（`#app-N` 直达互动页）
- `data/slides.json` 全量提取内容（坐标/富文本/讲稿/动画序） · `data/sections.json` 章节+app 嵌入点
- `data/overrides/secN.js` 按节精修覆盖器（`window.DECK_OVERRIDES[页码]` 协议）
- `dev/TASKS.json` 并行协作任务队列（认领规则见文件头注释）

## 操作

- 翻页：`← → ↑ ↓`、底部虚拟按钮、普通页左右边缘热区（app 页自动隐藏热区以免遮挡模拟器控件）
- `F` 全屏 · `O` 总览 · `N` 讲稿 · `M` 侧栏

## 协作与流水线

- 权威开发档案：`html_development_log/`（README / PLAN / DECISIONS(ADR) / AGENT_GUIDE / LOG / TASKS 快照）
- 全套方法论已沉淀为可复用 skill：`pptx-to-html-courseware`（提取脚本、引擎协议、部署与验证 playbook、踩坑清单）
- 部署：tar-over-ssh 直传 VPS `/var/www/slides/`，nginx 独立 snippet，不走主门户构建
