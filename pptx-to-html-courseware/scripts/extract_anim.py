# -*- coding: utf-8 -*-
"""
extract_anim.py — 从 PPTX 提取每页动画的「点击出现顺序」，写入 slides.json 的 anim 字段。

原理：
- PPT 动画在 slide XML 的 <p:timing> 里，mainSeq 下每个 nodeType="clickEffect" 的 <p:par>
  是一次点击；withGroup / afterEffect 跟随上一点击（after 记 slight delay）。
- 动画目标 <p:spTgt spid="N"> 的 N 对应形状的 cNvPr id（python-pptx 的 shape.shape_id）。
- 组内形状的 spid 会映射到外层 group 在 slides.json 中的下标（整组一起出现）。

输出（写回 slides.json 每页）：
  "anim": {
    "steps": [ [shapeIdx, ...], ... ],   # 按点击顺序，shapeIdx 是 shapes[] 下标
    "static": [shapeIdx, ...]            # 从未被动画引用 → 始终显示
  }
无动画页：anim 为 None（引擎按原样整页显示）。

用法：
  python extract_anim.py "<pptx路径>" "<slides.json路径>" [--slides 2-33]
"""
import json
import re
import sys

from pptx import Presentation

P_NS = '{http://schemas.openxmlformats.org/presentationml/2006/main}'


def shape_index_map(slide):
    """按 extract 时的 append 规则重建 sid -> shapes[] 下标映射。"""
    sid2idx = {}
    idx = 0
    for shape in slide.shapes:
        st = shape.shape_type
        appended = False
        if st == 13:  # picture
            appended = True
        elif shape.has_text_frame:
            if shape.text_frame.text.strip():
                appended = True
        elif st == 6:  # group
            appended = True
            # 组内子形状也登记到该组下标
            for sub in shape.shapes:
                sid2idx[sub.shape_id] = idx
        else:
            try:
                if getattr(shape, 'has_table', False) and shape.has_table:
                    appended = True
            except Exception:
                pass
        if appended:
            sid2idx[shape.shape_id] = idx
            idx += 1
    return sid2idx


def parse_timing(slide, sid2idx):
    """返回 steps: [[idx,...], ...]；无动画返回 []"""
    el = slide.element
    timing = el.find(P_NS + 'timing')
    if timing is None:
        return []
    steps = []
    # mainSeq 下的 clickEffect / withGroup / afterEffect，按文档顺序
    for ctn in timing.iter(P_NS + 'cTn'):
        nt = ctn.get('nodeType')
        if nt == 'clickEffect':
            steps.append([])
        elif nt in ('withGroup', 'afterEffect'):
            if not steps:
                steps.append([])
        else:
            continue
        # 该 cTn 子树里所有 spTgt
        for sptgt in ctn.iter(P_NS + 'spTgt'):
            spid = sptgt.get('spid')
            if spid is None:
                continue
            idx = sid2idx.get(int(spid))
            if idx is not None and idx not in steps[-1]:
                steps[-1].append(idx)
    return [s for s in steps if s]


def main():
    pptx_path, json_path = sys.argv[1], sys.argv[2]
    lo, hi = 1, 10 ** 9
    if '--slides' in sys.argv:
        i = sys.argv.index('--slides')
        m = re.match(r'(\d+)-(\d+)', sys.argv[i + 1])
        lo, hi = int(m.group(1)), int(m.group(2))

    prs = Presentation(pptx_path)
    slides = json.load(open(json_path, encoding='utf-8'))

    n_anim = 0
    for i, slide in enumerate(prs.slides, start=1):
        if not (lo <= i <= hi):
            continue
        s = slides[i - 1]
        sid2idx = shape_index_map(slide)
        n_shapes = len(s['shapes'])
        steps = parse_timing(slide, sid2idx)
        if steps:
            used = set()
            for st in steps:
                used.update(st)
            static = [k for k in range(n_shapes) if k not in used]
            s['anim'] = {'steps': steps, 'static': static}
            n_anim += 1
        else:
            s['anim'] = None

    json.dump(slides, open(json_path, 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'))
    print(f'动画页数 {n_anim} / 范围 {lo}-{hi}')


if __name__ == '__main__':
    main()
