# -*- coding: utf-8 -*-
"""
enrich_groups.py — 把 group 形状递归展开为带绝对坐标的 children，写回 slides.json。

组的坐标变换（OOXML）：
  child_abs = group.off + (child.off - group.chOff) * (group.ext / group.chExt)

children[] 元素：
  {kind:'text', l,t,w,h, paras} | {kind:'pic', l,t,w,h, src} | {kind:'group', ..., children}

用法：python enrich_groups.py "<pptx>" "<slides.json>" [--slides 2-33]
"""
import hashlib
import json
import os
import re
import sys

from pptx import Presentation


def emu_scale(prs):
    return 1280.0 / prs.slide_width, 720.0 / prs.slide_height


def walk(shapes, ox, oy, sx, sy, kx, ky, img_dir, hash_to_file, out, depth=0):
    for shape in shapes:
        try:
            l = ox + (shape.left - 0) * sx * 1  # 先算 EMU 偏移
        except Exception:
            continue
        # 统一在调用方传入已换算系数：这里 shape.left 为 EMU
        try:
            cl = (shape.left - 0)
            ct = (shape.top - 0)
            cw = shape.width
            ch = shape.height
        except Exception:
            continue
        # 当前坐标系：父组坐标 -> 绝对 EMU
        al = ox + (cl - 0) * sx
        at = oy + (ct - 0) * sy
        aw = cw * sx
        ah = ch * sy

        st = shape.shape_type
        if st == 13:
            try:
                img = shape.image
                h = hashlib.md5(img.blob).hexdigest()[:12]
                fn = hash_to_file.get(h)
                if not fn:
                    fn = f'{h}.{img.ext}'
                    with open(os.path.join(img_dir, fn), 'wb') as f:
                        f.write(img.blob)
                    hash_to_file[h] = fn
                out.append({'kind': 'pic', 'l': al * kx, 't': at * ky,
                            'w': aw * kx, 'h': ah * ky, 'src': fn})
            except Exception:
                pass
        elif shape.has_text_frame and shape.text_frame.text.strip():
            paras = []
            for p in shape.text_frame.paragraphs:
                runs = []
                for r in p.runs:
                    fs = None
                    try:
                        if r.font.size:
                            fs = round(r.font.size.pt, 1)
                    except Exception:
                        pass
                    color = None
                    try:
                        if r.font.color and r.font.color.rgb:
                            color = str(r.font.color.rgb)
                    except Exception:
                        pass
                    runs.append({'t': r.text, 'fs': fs, 'b': bool(r.font.bold), 'c': color})
                if runs:
                    paras.append({'lvl': p.level, 'runs': runs})
            out.append({'kind': 'text', 'l': al * kx, 't': at * ky,
                        'w': aw * kx, 'h': ah * ky, 'paras': paras})
        elif st == 6 and depth < 4:  # 嵌套组
            try:
                ge = shape.element
                xfrm = ge.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
                chOff = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}chOff')
                chExt = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}chExt')
                cox, coy = int(chOff.get('x')), int(chOff.get('y'))
                cex, cey = int(chExt.get('cx')), int(chExt.get('cy'))
                nsx = sx * (aw / max(cex, 1)) if False else None
                # 子组坐标系换算：新 sx' = aw(emu) / chExt.cx, sy' = ah / chExt.cy
                sx2 = aw / max(cex, 1)
                sy2 = ah / max(cey, 1)
                ox2 = al - cox * sx2
                oy2 = at - coy * sy2
                sub = []
                walk(shape.shapes, ox2, oy2, sx2, sy2, kx, ky, img_dir, hash_to_file, sub, depth + 1)
                out.append({'kind': 'group', 'l': al * kx, 't': at * ky,
                            'w': aw * kx, 'h': ah * ky, 'children': sub})
            except Exception:
                pass


def main():
    pptx_path, json_path = sys.argv[1], sys.argv[2]
    lo, hi = 1, 10 ** 9
    if '--slides' in sys.argv:
        i = sys.argv.index('--slides')
        m = re.match(r'(\d+)-(\d+)', sys.argv[i + 1])
        lo, hi = int(m.group(1)), int(m.group(2))

    img_dir = os.path.join(os.path.dirname(json_path), '..', 'assets', 'img')
    prs = Presentation(pptx_path)
    kx, ky = emu_scale(prs)
    slides = json.load(open(json_path, encoding='utf-8'))

    # 已有图片 hash 表（webp 化后的文件名映射：hash.webp）
    hash_to_file = {}
    for f in os.listdir(img_dir):
        h = f.split('.')[0]
        hash_to_file[h] = f

    n_done = 0
    for i, slide in enumerate(prs.slides, start=1):
        if not (lo <= i <= hi):
            continue
        s = slides[i - 1]
        gi = 0
        for sh in s['shapes']:
            if sh.get('type') != 'group':
                continue
            # 找对应的第 gi 个 group 形状
            target = None
            c = -1
            for shape in slide.shapes:
                if shape.shape_type == 6:
                    c += 1
                    if c == gi:
                        target = shape
                        break
            gi += 1
            if target is None:
                continue
            try:
                ge = target.element
                xfrm = ge.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
                off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off')
                ext = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}ext')
                chOff = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}chOff')
                chExt = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}chExt')
                ox0, oy0 = int(off.get('x')), int(off.get('y'))
                ex0, ey0 = int(ext.get('cx')), int(ext.get('cy'))
                cox, coy = int(chOff.get('x')), int(chOff.get('y'))
                cex, cey = int(chExt.get('cx')), int(chExt.get('cy'))
                sx0 = ex0 / max(cex, 1)
                sy0 = ey0 / max(cey, 1)
                ox2 = ox0 - cox * sx0
                oy2 = oy0 - coy * sy0
                children = []
                walk(target.shapes, ox2, oy2, sx0, sy0, kx, ky, img_dir, hash_to_file, children)
                sh['children'] = children
                n_done += 1
            except Exception as e:
                sh['children_err'] = str(e)

    json.dump(slides, open(json_path, 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'))
    print(f'展开 group: {n_done} 个（范围 {lo}-{hi}）')


if __name__ == '__main__':
    main()
