# 部署与线上验证参考

> 目录：部署管线 / nginx / 验证 playbook / 踩坑清单

## 1. 部署管线（GitHub + VPS 双轨）

```bash
# 1) 提交
cd /d/0A_TransMed/上课/slide && git add -A && git commit -m "..." && git push origin master

# 2) 传 VPS（增量打包含中文路径也没问题，tar 管道最稳）
cd /d/0A_TransMed/上课/slide && tar czf - <相对路径...> | ssh root@124.220.84.73 "tar xzf - -C /var/www/slides"

# 3) 冒烟（建议直接打 www 域名并 -L 跟随，避免 non-www→www 第一跳干扰判断）
curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' -L https://www.kuaiyu.site/slides/<学科>/<章节>/
```

- 仓库：`kuainegrito/slides`（master）；VPS：`/var/www/slides/` = `kuaiyu.site/slides/`
- **curl 必须带 `-H 'Host: kuaiyu.site'`**（直连 IP 时），直接 IP 访问 404

## 2. nginx（只需首次）

`/etc/nginx/snippets/slides-locations.conf`（现行版本含旧路径兜底）：

```nginx
location = /slide { return 301 /slides/; }
location ~ ^/slide/(.*)$ { return 301 /slides/$1$is_args$args; }   # 旧路径 301，保留 query
location = /slides { return 301 /slides/; }
location /slides/ { alias /var/www/slides/; index index.html; try_files $uri $uri/ =404; add_header Cache-Control "no-cache" always; }
location ^~ /slides/<学科>/<章节>/assets/img/ { alias /var/www/slides/<学科>/<章节>/assets/img/; add_header Cache-Control "public, max-age=604800" always; }
```

门户 server block 里 include 后 `nginx -t && systemctl reload nginx`。

## 3. 线上验证 playbook（嵌入浏览器）

用 InAppBrowser 的 `evaluate` 做 DOM 断言。五条铁律：

1. **锚定当前页**：`document.querySelectorAll('#stage > *')[Deck.cur]`——懒渲染下隐藏页也在 DOM 里，`body.textContent` 断言是空支票
2. **URL 带变化 query**（`?sec=secN&v=<递增>#s<页>`）——纯改 hash 不触发整页加载；静态资源可能缓存，必要时 `location.reload(true)` 强刷
3. **遍历用合成按键**：`document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))`——逐页走，收集 `window.__errs`（先 `addEventListener('error')` 挂收集器）
4. **后台标签截图会超时**——用几何断言（offsetWidth / getComputedStyle / naturalWidth）+ class 状态断言闭环；需要视觉复核时让标签前台再 screenshot
5. **节范围隔离**：`?sec=secN` 只含本节页，跳别节 hash 不生效；断言前先查 sections.json 的 range

### 常用断言片段

```js
// 当前页身份与类型
var cur = document.querySelectorAll('#stage > *')[Deck.cur];
cur.className;                       // 'slide-page current' / 'app-slide current'
// 图片真加载
img.complete && img.naturalWidth > 0
// SVG 曲线坐标边界（数据驱动校验）
p.getAttribute('d').match(/[\d.]+,[\d.]+/g).map(...)
// 封面→app 步进切换
cover.classList.contains('on') && iframe.classList.contains('on')
// app 页热区隐藏
getComputedStyle(stage.querySelector('.flip')).display === 'none'
```

## 4. 踩坑清单（按发现序）

| # | 坑 | 解法 |
|---|---|---|
| 1 | 懒渲染下 textContent 断言命中隐藏页 | 锚定当前页元素 |
| 2 | 纯改 hash URL 验证不到新代码 | 加变化 query 强制整页加载 |
| 3 | 对着截图手绘曲线形态错 | 从 app 运行时 JSON 反取采样 |
| 4 | PPT 二维码被当装饰丢掉 | 它是嵌入点路标，必须保留/升级为封面 |
| 5 | 后台标签截图超时 | DOM 几何断言替代 |
| 6 | group 嵌套 pic 用错坐标系 | 展开后是页绝对坐标，按原坐标摆放 |
| 7 | flex 容器里固定尺寸舞台双重缩小 | `.stage { flex: none }`，只 transform 缩放 |
| 8 | 推广类任务改漏条目 | 先把 sections.json 里所有目标条目 walk 一遍打印再动手 |
| 9 | JS 报错"看着对" | 信报错行号；用 xxd/repr 看原字节（曾多一个 `]`）；最小复现要复制原字节不是重敲 |
| 10 | 覆盖器改完浏览器用旧 JS | 验证前强刷（location.reload(true)） |
| 11 | 贝塞尔控制点越界 | 先定量程映射，逐控制点核对物理量 |
| 12 | iframe 地址 301 | URL 尾斜杠必须有 |
| 13 | bash 中文/全角括号路径断裂 | 路径写进 python 字符串，bash 只 cd |
