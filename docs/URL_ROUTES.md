# 2026-11-15：公开课规范路径

公开入口为 `/slides/open_class/`；AI 课件入口为
`/slides/open_class/ai_survival/`，其下保留 `teacher/` 与 `student/`。
共享互动与资源为 `/slides/open_class/ai_survival-202608/`。

公开 URL 与物理源码分离：`ai/`、`ai/survival/`、`ai/survival-202608/`
继续作为本仓库及服务器物理目录，避免在并行课件开发过程中移动源码。
运行时绝对链接与 manifest 跳转使用新地址，稳定课件 ID 不改变。

Nginx 配置由 `kuainegrito/my_website` 仓库的
`nginx/slides-locations.conf` 维护，路由记录在
`shared/app-routes/routes.json` 的 `contentRoutes`。
旧 `/slides/ai/`、旧 `survival/` 与旧资源深链用 307 跳转，保留查询参数；
浏览器继续保留片段，旧二维码和教师 / 学生页链接可用。

本次发布对线上现有文件仅替换 URL，不覆盖当前课件内容或并发修改；
入口分类新建 `ai/index.html`。Portal 两处“课件中心”入口均进入 `/slides/`。
发布证据与回滚清单位于
`F:/codex_worktrees/projects/cycling/evidence/portal-courseware-20261115/`。

已上线：教师 / 学生旧深链保留 query 与 `#s21`，规范入口与资源通过 HTTP 哈希
及 Chrome 验证。回滚备份 `/root/releases/portal-courseware-20261115-070527/`。
