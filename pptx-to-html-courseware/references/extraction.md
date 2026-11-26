# P0 提取参考：PPTX → 结构化数据

> 目录：提取字段与坐标换算 / 图片优化 / QR 扫描 / 动画顺序 / group 展开 / 已知坑

## 1. 提取字段（每页）

用 python-pptx 遍历 `prs.slides`，每页产出：

```json
{
  "n": 42,                      // PPT 页码（1 起）；slides.json 下标 = n-1
  "shapes": [ ... ],
  "notes": "讲稿原文",
  "anim": { "steps": [[shapeIdx...]...], "static": [shapeIdx...] }   // extract_anim.py 写入，无动画页为 null
}
```

每个 shape：`{type, l, t, w, h, ...}`，坐标统一换算到 **1280×720**：

```python
SCALE_X = 1280 / prs.slide_width    # EMU → px
SCALE_Y = 720 / prs.slide_height
```

- 文本：`paras: [{runs: [{t, fs(字号), b, color}]}]`——保留 run 级富文本，引擎按原字号渲染
- 图片：`type: 'pic'`, `src: '<hash>.webp'`（内容哈希去重）
- 表格：`has_table` 判断要 try；`shape_type==13` 是图片；`6` 是 group
- 字号经验换算（引擎内）：`r.fs * 1280/960 * 0.72`——改版式时别动它，用覆盖器控制

## 2. 图片优化

- WebP **q82**，最长边 **1600px**，按内容哈希去重
- 实测：148MB PPTX → 92 张图 83.3MB → **9.9MB**
- 不保留本地原图；需要时从源 PPTX 重提

## 3. QR 扫描（互动点实证）

OpenCV `cv2.QRCodeDetector().detectAndDecodeMulti()` 扫所有提取的图片 → `qr_codes.json`：

```json
{ "page": 35, "text": "https://kuaiyu.site/cardiac_cycle/..." }
```

同时 grep 讲稿/文本里的标注（如"稳态软件""稳态模拟""微信小程序打开"）作为补充证据。**凡 PPT 印了 QR 的页 = 课堂互动点**，是 app 嵌入的路标。

## 4. 动画顺序（scripts/extract_anim.py）

```bash
python scripts/extract_anim.py "<pptx>" "<slides.json>" [--slides 2-33]
```

原理：`<p:timing>` mainSeq 下每个 `nodeType="clickEffect"` 的 `<p:par>` 是一次点击；withGroup/afterEffect 跟随上一次点击；`<p:spTgt spid>` 对应 `shape.shape_id`；组内形状的 spid 映射到外层 group 下标（整组同现）。

输出写回 `anim.steps`（shapeIdx 数组按点击序）与 `anim.static`（从未被动画引用 → 恒显）。

实测：192 页课件仅 18 页有显式点击动画——**无动画页由引擎自动合成**（见 architecture.md）。

## 5. group 递归展开（scripts/enrich_groups.py）

```bash
python scripts/enrich_groups.py "<pptx>" "<slides.json>" [--slides 2-33]
```

按 OOXML `chOff/chExt` 变换把 group 内子形状坐标换算回页坐标，写入 `shapes[].children`。展开后组内图片可直接被覆盖器取用。

**重用组内素材时直接按展开后的页绝对坐标摆放**——旧代码曾用错误偏移（相对坐标当绝对）导致图片错位/被裁。

## 6. 已知坑

- **中文路径**：bash 里 `cd "/d/.../上课/..."` 用引号；含全角括号的路径写进 python 脚本字符串里，别在 bash 命令行拼接
- **pip 装包**：默认源可能 SSL 断流，加 `-i https://pypi.tuna.tsinghua.edu.cn/simple`
- **合并单元格表格**：导出后 rows 是打平碎片，精修时应按语义重建成干净 HTML 表，并**人工核对**（曾出现"起源"行错位：交感缩血管被标成大脑皮层运动区）
- **讲稿清理**：提取的 notes 含计时残留（`3'`、`24''` 类），精修时顺手清
- **页码两套体系**：slides.json 下标 = PPT页码−1；sections.json 的 range/at 全是 PPT 页码
