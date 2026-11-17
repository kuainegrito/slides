# Anonymous AI survey backend

Dependency-free Node 20+ service. Production uses the existing Kuaiyu VPS, no external service or account.

## Contract
GET `/api/ai-survey/v1/results?session=ai-survival-YYYYMMDD[-suffix]`
POST `/api/ai-survey/v1/responses` JSON `{session,responseId,answers}`.
`responseId` is a client-generated UUID persisted locally for safe retry. All seven fixed-choice questions are required. Multi-choice `uses` and `concerns` max 3. `none`/model `unsure` are exclusive.
Results: `{total,updatedAt,counts,countsByRole,words:[]}`. UI derives a fixed-vocabulary cloud from counts. Never render untrusted free text. Empty result is genuine zero; failures return an error HTTP status, not zero.

## Storage and privacy
Only aggregate option counts and SHA256 hashes of random response IDs are stored, not response-level answers, names, email, IP, browser fingerprint, or UA. Rate-limit buckets use an ephemeral process-salted IP HMAC, never written to storage. Nginx access logging is disabled for these two exact routes; upstream hosting/network infrastructure may have its own logs. No raw-response/export endpoint exists. Public aggregate results are not confidential research data.

Data directory: `/var/lib/kuaiyu-ai-survey` managed by systemd DynamicUser/StateDirectory, outside static web root. Writes serialized and atomically renamed after fsync. Limits: 10,000 responses/session, 256 persisted sessions; storage-full rejects new sessions without deleting historical data. IDs deduplicate retries, not people: resetting local storage or another browser can submit again. Origin allowlisting is not authentication or bot-proofing. Fixed input, 4KB body limit, per-IP/global in-memory rate limits, HTTP timeouts and process memory limit provide basic abuse resistance. Suitable for an informal classroom poll, not a secure election or research-grade enrollment.

## Run/test on K
Set TEMP/TMP and SURVEY_DATA_DIR to F drive. `node --test server/ai-survey/server.test.cjs`.
CLI defaults loopback port3098; override PORT and SURVEY_DATA_DIR. Programmatic `createService` allows local origins in test harness. Do not relax production origin settings for testing.

## Production deployment 2026-11-16
User approved isolated service and exact Nginx routes. `/opt/kuaiyu-ai-survey/server.cjs`, `kuaiyu-ai-survey.service`, snippet `/etc/nginx/snippets/ai-survey-locations.conf` included from existing personal-portal server. No other route or Stats auth changed. `deploy-vps.py` holds initial deployment procedure; review before reuse (existing service updates need explicit restart).
Backup: `/opt/kuaiyu-ai-survey-deploy-backups/20261116T145606/personal-portal`.
Rollback: restore that configuration only if no later legitimate edits, nginx -t then reload; stop survey service. Preserve survey data and newer config changes.

Validation: local tests passed date/path, validation, oversized bodies, wrong-origin, idempotency, concurrency, reload persistence, no raw identifiers, response/session/rate limits. Production isolated QA session `ai-survival-20261116-qa-backend` retains one synthetic teacher response; separate from actual classroom. Duplicate POST stayed at 1. Homepage/Stats/slides HTTP200; unauthenticated Stats API401. Nginx test passed; service active. No survey responses deleted.

## Pending password-gated email feature (local only)
POST `/api/ai-survey/v1/email` accepts exactly `{session,password}`. Recipient and sender cannot be supplied by client. Returns `status: accepted` only after SMTP accepts the fixed recipient, not a guarantee of inbox delivery. Never automatically retry a timeout/502. Pending exact proxy route is in `nginx-email.pending.conf`; requires approval before installation.

Provision a server-only credential JSON with `{salt,hash,smtp:{host,port,secure,user,password}}`. Use random hex salt, `crypto.scrypt(password,salt,64)` hex hash. No plaintext gate password belongs in files/source/client/log or command arguments. Root coordinator handles password selection and confidential provisioning. Configure systemd `LoadCredential=survey-email.json:/etc/kuaiyu-ai-survey/email.json`; service reads CREDENTIALS_DIRECTORY automatically. Prefer extracting approved existing SMTP settings directly on VPS, not through model-visible output. SMTP fallback WEEKLY_SMTP_PASSWORD needs explicit safe transfer into isolated credential if not stored in weekly settings. Do not make the existing Stats settings file readable to the survey service.

Installed nodemailer: `/opt/traffic-stats-api/node_modules/nodemailer/dist/cjs/nodemailer.js`; set SURVEY_NODEMAILER_PATH=/opt/traffic-stats-api/node_modules/nodemailer. Production sender fixed info@kuaiyu.site; recipient fixed kuainegrito@gmail.com. TLS certificate validation required. Only enum aggregate JSON/CSV attached, no response IDs. No actual email sent during development.

Throttles: 5 failures per ephemeral hashed IP in 15min; 30 global auth attempts/15min; 1 send attempt/minute globally and 1/session/10minutes. A persistent attempt ledger is saved before SMTP; uncertain outcomes are never automatically retried. Coordinator should check inbox/spam before any deliberate retry. Fake-transport tests verify fixed addresses, no credential leakage, cooldown, uncertainty and HTTP checks. Existing survey regression suite passed.

Email deployment completed 2026-11-16 with explicit user approval. Existing SMTP settings copied server-side into root-only isolated credential; selected password retained only as salted scrypt hash. systemd LoadCredential enabled. Backup: /opt/kuaiyu-ai-survey-deploy-backups/email-20261116T214931. Nginx validation passed, service active. Production wrong-password and wrong-origin both403; Stats unauth401; prior QA aggregate remains1. Six regression/fake-SMTP tests passed. No real email sent, so SMTP authentication/delivery remains untested in this feature. Frontend deployment owned separately.


## 2026-11-17：分版本课前反思、开场备份与性别行为比较（本地）

- 正式开场为封面 → 问卷 → AI 画像 → 反思与目标 → 性别/使用习惯比较 → 讲者介绍 → 路线 → AI 历史。稳定内容 ID 顺序为 `1,65,66,67,68,2,5,6`，两版各 65 张；原第 3–4 页移出主放映但原 JSON/SVG 保留。总览中的“开场备份”进入独立 `?backups=1#s3` 两页视图，可返回主放映；旧 `#s3/#s4` 深链自动进入备份。
- 扫码 URL 显式携带 `edition=student|teacher`。身份默认选中相应版本但可修改。学生反思题为学习后如何处理答案、希望获得的能力；教师版为使用教学材料前如何审核、希望改进的教学任务。八道必答及性别、付费两道自愿题；无自由文本和姓名/联系方式。
- 结果拆为三个页面，前两页分别 4/2 张图表；反思题按实际作答人数计算比例，旧答卷不充当新题的零分/否定回答。反思是自述做法，不是能力测量。手机竖屏课前活动使用更高的可滚动画布。
- 性别比较支持使用频率、问答/工具/Agent 模式及本版本反思习惯，支持身份筛选。仅保存 `countsByGender` / `countsByRoleByGender` 聚合计数，不保存逐人答案组合；跳过及不愿回答者不进入行为分组。API、CSV/JSON 邮件导出和界面均排除少于 5 人的组及本题少于 5 答的分布。少于两个有效组提示不可组间比较。仅描述本场自愿回答，不作因果/总体推断；不等于防差分攻击或研究级匿名保证。
- 后端向后兼容旧版七题及已有聚合文件，读取时补齐新字段但不推测历史性别；新题的回答数、CSV `question_total` 与百分比分开于全组总数。邮件固定收件人、密码门控和既有节流保持不变。
- 验证：8 项后端/假 SMTP 测试通过；`scripts/test-ai-survey.cjs` 回归通过；`scripts/test-opening-survey.cjs` 通过双方版本、真实本地 API 提交/持久化、防重复、可选题、身份默认/筛选、完整开场、键盘、备份返回/旧深链、组大小限制与比例、桌面和 390px 无横向溢出。截图人工检查。证据：`F:/codex_worktrees/projects/slides/runs/opening-20261117/`。仅窄屏浏览器，未实机手机测试。
- 状态：仅本地实现与验收，未部署、提交或推送。保留共享 master 原有暂存及未提交改动。新前端需与 `server/ai-survey/server.cjs`、`email.cjs` 配套发布：先更新兼容后端再更新前端，保留服务器数据和实际线上字节备份。


## 2026-11-17：教师/学生开场与新版问卷已部署并完成公网验收

- 公网发布 `/root/releases/slides-opening-20261117-044407`，13 个限定文件（11 个前端及两个后端）；先更新兼容后端并重启独立 `kuaiyu-ai-survey`，健康后发布两版入口、播放器、问卷与页数信息。11 个前端 HTTPS/SHA256 校验全部一致；513 个其他课件文件和 Nginx/systemd 配置保持不变。
- 真实 Chrome 公网验收通过双方开场 `1,65,66,67,68,2,5,6`、分版本 QR/问卷、手机实际提交与重载防重、独立备份/返回/旧深链、三页结果、真实分母、身份筛选和性别比较（不足五人抑制、稀疏新题抑制、比例正确）。最终 QA 场次 `ai-survival-20261117-qa-live-1794890827864` 保留 11 份合成答卷；前两次测试运行也仅使用独立 `-qa-live-` 房间，未向默认课堂场次添加回答。最终套件窗口北京时间 12:47:07–12:47:34；完整人工/自动公网检查约 12:44–12:50，访问流量可按 QA query/房间/时间窗识别。
- 独立 jsQR 解码两版真实二维码截图通过；服务器持久化聚合与公网结果逐项一致，随机 UUID 仅以哈希落盘，无效回答未存储；原有三个数据文件字节不变。实际服务器 CSV 生成器校验通过；邮件表单取消、错误密码拒绝通过，未发送邮件，SMTP 投递未复测。8 项后端/假 SMTP 测试通过；公开路由检查通过；HTTP/HTTPS 与 apex/www 均正确到规范 HTTPS 入口，首页/课件中心/Stats 正常，Stats API 未登录返回 401。浏览器零 pageerror/资源 4xx。
- 唯一正式发布/公网证据移至 `F:/codex_worktrees/projects/slides/evidence/opening-20261117/`（`release/` 和 `live/`）；本地可重建测试仍在 `runs/opening-20261117/`。桌面和 390px 截图已检查；未测试实体手机、Safari 或微信。备份、数据快照及带哈希保护的回滚脚本 `/root/releases/slides-opening-20261117-044407/rollback.py` 已创建，未实际执行生产回滚。
- 状态：公网已部署验证；未 Git 提交或推送，原有暂存/未提交改动保留。未改校园部署或其他应用。

## 2026-11-17：每月 AI 支出与性别选项

性别题只显示女/男，仍可跳过；旧答卷和旧客户端的既有选项继续兼容。选择“目前自己付费”后显示可跳过的每月美元支出题，区间为 <$20、$20–<$80、$80–$200、>$200；改选其他付费状态会清除隐藏的支出选择。画像增加支出分布，以实际回答本题人数为分母；历史未回答不计入分母。服务端校验支出仅能随 current 提交，并兼容历史聚合和分组数据。

本地 9 项后端测试和两版浏览器测试通过；线上两版真实表单、提交、防重、支出图表和旧版本兼容通过，QA 答卷与默认课堂场次分离。公网已部署：/root/releases/slides-spending-20261117-082211，原有 6 个数据文件、516 个其他课件文件及服务配置保持不变；服务器备份和回滚脚本位于同一发布目录。未实际发送邮件。证据：F:/codex_worktrees/projects/slides/evidence/opening-spending-20261117/。
