# kuaiyu.site/slide — 活体网页课件

PPTX → HTML 流水线产物。线上：https://kuaiyu.site/slide/

## 目录

- `physio/cardiovascular/` —— 《生理学》第10版 · 第四章 血液循环（192 页）
  - `index.html` 封面目录 · `deck.html?sec=sec1..sec5|review` 放映页
  - `data/slides.json` 全量提取内容 · `data/sections.json` 章节+app嵌入点
  - `dev/TASKS.json` 并行协作任务队列（认领规则见文件头注释）

## 协作

权威开发档案在本地 `html_development_log/`（README/PLAN/DECISIONS/AGENT_GUIDE/LOG）。
精修单页用 `window.DECK_OVERRIDES[页码]` 覆盖机制，详见档案 AGENT_GUIDE.md。
