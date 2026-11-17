# AI classroom pulse · 2026-11-16

## Published behavior

Both public editions insert two runtime slides after original slide 1 (all old slide IDs unchanged):
- `#s65`: QR code, clickable fallback URL, optional 3-minute timer, live response count.
- `#s66`: automatically refreshed grouped results, bar plots, concerns/uses category word cloud, role filter.

Participant route: `/slides/open_class/ai_survival/survey/?session=ai-survival-YYYYMMDD`.
The existing Nginx route aliases `/slides/open_class/ai_survival/` to physical `ai/survival/`.

Seven bilingual, fixed-choice questions: role; AI products (not exact model versions); payment; chat/tools/agent usage; frequency; up to 3 use cases; up to 3 concerns. No names, student IDs, contact details or free text. Participation is voluntary and a plain-language notice explains aggregate display and infrastructure connection logs.

## Sessions

The default is `ai-survival-YYYYMMDD` using the presenter's browser local date. Both editions share that session. On QR slide, expand Session settings and choose **New class** for a fresh random-suffix session. The resulting `?survey=` URL is retained for navigation and can be bookmarked/copied. Switching sessions retains old results; there is no destructive reset control. A static old QR points to its original session.

The dashboard refreshes every 5 seconds only while visible. Leaving the slide disposes its timer. Error states are distinguished from zero responses and last received results remain labelled stale. Role filter is exact (Both is separate from Student/Teacher). Percentages use the filtered respondent total; multi-select totals can exceed 100%. Word size represents selected-category counts, not unmoderated prose.

## Persistence and limitations

See `server/ai-survey/README.md` for the isolated API/service and validation. Persistent data are grouped counts and hashed dedupe IDs, not row-level answers. Public results are anonymous aggregates accessible to anyone knowing the session URL; do not use for sensitive research or individual assessment. Browser dedupe is convenience plus idempotent server IDs, not verified identity: a respondent can clear storage or switch browser. Existing server rate/body/session caps reduce abuse, not eliminate it. No third-party form or analytics code runs on the participant page. Normal server access logs may retain IPs.

## Source and deployment

- Player integration: `ai/survival/player.js`, both edition HTML cache versions.
- UI/schema/QR: `ai/survival/survey/`.
- Rebuild hook: `ai/survival-202608/dev/build_editions.py` preserves runtime slides and copies survey assets from source.
- Vendor: qrcode-generator 2.0.4, MIT copyright header retained. `.js` is the production module because the existing Nginx MIME map sends `.mjs` as application/octet-stream.
- Guarded release scripts: `scripts/prepare-survey-release.py`, `scripts/deploy-ai-survey.py` (hash drift guards, backups, rollback, 513 protected live files verified unchanged).
- Final frontend release: `/root/releases/slides-survey-20261116-070125`.

## Verification

Evidence is outside the repo under `F:\codex_worktrees\projects\slides\runs\survey-20261116`.
- `scripts/test-ai-survey.cjs`: real local API, student+teacher navigation, 390px mobile form, submission/persistence, reload duplicate guard, polling, bars/cloud, role filter, zero vs error, stale data, timer, overflow.
- `scripts/verify-ai-survey-live.cjs`: public QR link, actual mobile submission in separate QA room, both editions' aggregate result, persistence, duplicate reload.
- `scripts/test-survey-qr.cjs`: decode a screenshot of the live QR with independent jsQR 1.4.0 (test-only dependency in runs).
- Backend's focused tests: `server/ai-survey/server.test.cjs`.

QA sessions are explicitly `-qa-*`, separate from classroom default. No test answers were added to the default classroom session. Focused tests passed; no claim of exhaustive site-wide regression, physical-phone camera testing, or full security audit.

No Git commit was made: pre-existing tracked and staged changes coexist in this shared master checkout. Do not indiscriminately stage or commit them with this feature.

## 2026-11-16 follow-up: order bias and exports
- Multi-select model/product, use and concern choices are shuffled with response UUID + question seed. Order remains stable on reload/retry when localStorage is available. Other/none/unsure stay at the end; single-select ordinal choices are unchanged. Answer IDs and backend schema unchanged. This mitigates but cannot eliminate primacy bias.
- Results slide offers CSV and JSON downloads of the last successfully loaded whole-session aggregate snapshot (all groups, not only the visible filter). CSV is UTF-8 BOM for Excel, includes option keys/labels, count, group denominator and percent; JSON includes snapshot timestamps and aggregate-only scope. A refresh error retains the last snapshot and labels it stale; export does not silently fabricate zero data.
- Persistent server data are aggregate counts overall and by role plus hashed random-ID deduplication, not person-level answer records. Individual answer combinations and arbitrary cross-question associations cannot be recovered or exported. Downloads add no new data collection or API access.
- Verified local actual response persistence, downloads and count matching, unchanged single-select order, anchored tail choices, stable reload order, both editions/navigation/error states.

## 2026-11-16 admin email replacement
The previous browser CSV/JSON buttons are replaced by Email results on both results slides. The password form states the fixed sender info@kuaiyu.site and recipient kuainegrito@gmail.com. It sends session/password only in HTTPS POST body, clears the field immediately, stores no password, and differentiates SMTP acceptance from confirmed inbox delivery. Cancel clears/removes the form. No raw answers are added to storage. Aggregate charts and the existing public results API remain public. Backend setup and throttle details: server/ai-survey/README.md.
Local fake-transport browser checks pass; no actual email was sent during UI testing.

## Local implementation 2026-11-17 (not deployed)

The earlier sections describe the existing published release. The new local release uses four runtime slides: QR `#s65`, usage portrait `#s66`, edition-specific reflection/goals `#s67`, and gender/behavior comparisons `#s68`. Main sequence `1,65,66,67,68,2,5,6`; original pages 3/4 are preserved in source and accessible via Overview → Opening backups (`?backups=1`). Legacy deep links to those pages enter backup mode. The roadmap and history remain in the main presentation. Each main edition has 65 slides and two separately accessible backups.

The QR carries `edition=student|teacher`; standalone old links default to student wording. Role defaults to the edition but remains editable and is not inferred from the edition in stored statistics. Both editions retain shared room/deduplication semantics: one response per browser/room, not one response per edition.

Eight required questions (role, tools, mode, frequency, uses, concerns, reflection, goal), plus optional gender and payment. Student additions: what happens after receiving learning help; desired learning/creation outcome. Teacher additions: review of generated teaching materials; desired teaching improvement. Fixed choices only; no private free text. Option IDs stay independent of translated labels. Questionnaire answers and slide navigation intentionally add no new third-party/cross-site analytics. The existing room-local API stores aggregate counts and hashed deduplication IDs, not answer rows. Coverage and exclusions: `AI_SURVEY_COVERAGE.json`.

The gender comparison page offers frequency, chat/tools/Agent mode, and the edition's reflection habit. The role filter uses actual role × gender aggregates. Respondents who skip gender or prefer not to say are excluded from behavior cross-tabs. Each exposed group needs ≥5 responses; each single-choice question within a group also needs ≥5 answers. Groups/questions below this threshold are absent from the public API and aggregate email attachments, not just visually hidden. A one-group result is labelled insufficient for between-group comparison. The threshold is a classroom presentation safeguard, not statistical significance, protection against repeated-query differencing, or a research-grade privacy guarantee. No causal conclusions, automatic significance tests, or population inference are made.

New reflection and payment denominators use actual answered counts; overall totals include legacy and skipped-optional responses. The CSV preserves `total` (group total) and adds `question_total` and `percent`. Old stored data gain empty new count fields on read; no historical gender/reflection is invented. Backend accepts legacy seven-question payloads plus one complete student/teacher reflection pair, and validates optional gender/payment when present.

Verification: backend tests plus `scripts/test-opening-survey.cjs` and the existing frontend regression. Local QA rooms only; no live classroom answers or real email sent. Screenshots and machine-readable result: `../runs/opening-20261117/`. Runtime/generator cache IDs are `20261117-opening1`. Generator preserves backup navigation, four result/QR IDs, and shared edition CSS. Full historical deck regeneration was not run; generator syntax was checked. New API and frontend must be released together (compatible backend first). Production is unchanged.


## 2026-11-17：教师/学生开场与新版问卷已部署并完成公网验收

- 公网发布 `/root/releases/slides-opening-20261117-044407`，13 个限定文件（11 个前端及两个后端）；先更新兼容后端并重启独立 `kuaiyu-ai-survey`，健康后发布两版入口、播放器、问卷与页数信息。11 个前端 HTTPS/SHA256 校验全部一致；513 个其他课件文件和 Nginx/systemd 配置保持不变。
- 真实 Chrome 公网验收通过双方开场 `1,65,66,67,68,2,5,6`、分版本 QR/问卷、手机实际提交与重载防重、独立备份/返回/旧深链、三页结果、真实分母、身份筛选和性别比较（不足五人抑制、稀疏新题抑制、比例正确）。最终 QA 场次 `ai-survival-20261117-qa-live-1794890827864` 保留 11 份合成答卷；前两次测试运行也仅使用独立 `-qa-live-` 房间，未向默认课堂场次添加回答。最终套件窗口北京时间 12:47:07–12:47:34；完整人工/自动公网检查约 12:44–12:50，访问流量可按 QA query/房间/时间窗识别。
- 独立 jsQR 解码两版真实二维码截图通过；服务器持久化聚合与公网结果逐项一致，随机 UUID 仅以哈希落盘，无效回答未存储；原有三个数据文件字节不变。实际服务器 CSV 生成器校验通过；邮件表单取消、错误密码拒绝通过，未发送邮件，SMTP 投递未复测。8 项后端/假 SMTP 测试通过；公开路由检查通过；HTTP/HTTPS 与 apex/www 均正确到规范 HTTPS 入口，首页/课件中心/Stats 正常，Stats API 未登录返回 401。浏览器零 pageerror/资源 4xx。
- 唯一正式发布/公网证据移至 `F:/codex_worktrees/projects/slides/evidence/opening-20261117/`（`release/` 和 `live/`）；本地可重建测试仍在 `runs/opening-20261117/`。桌面和 390px 截图已检查；未测试实体手机、Safari 或微信。备份、数据快照及带哈希保护的回滚脚本 `/root/releases/slides-opening-20261117-044407/rollback.py` 已创建，未实际执行生产回滚。
- 状态：公网已部署验证；未 Git 提交或推送，原有暂存/未提交改动保留。未改校园部署或其他应用。

## 2026-11-17：每月 AI 支出与性别选项

性别题只显示女/男，仍可跳过；旧答卷和旧客户端的既有选项继续兼容。选择“目前自己付费”后显示可跳过的每月美元支出题，区间为 <$20、$20–<$80、$80–$200、>$200；改选其他付费状态会清除隐藏的支出选择。画像增加支出分布，以实际回答本题人数为分母；历史未回答不计入分母。服务端校验支出仅能随 current 提交，并兼容历史聚合和分组数据。

本地 9 项后端测试和两版浏览器测试通过；线上两版真实表单、提交、防重、支出图表和旧版本兼容通过，QA 答卷与默认课堂场次分离。公网已部署：/root/releases/slides-spending-20261117-082211，原有 6 个数据文件、516 个其他课件文件及服务配置保持不变；服务器备份和回滚脚本位于同一发布目录。未实际发送邮件。证据：F:/codex_worktrees/projects/slides/evidence/opening-spending-20261117/。
