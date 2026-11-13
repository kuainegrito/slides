"""Apply the user-approved font, video and interactive-page refinements."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def apply_refinements(data):
    for slide in data['slides']:
        slide['svg']=re.sub(r'font-family="[^"]*"','font-family="DeckSans, DeckKai, sans-serif"',slide['svg'])
        if slide['n']==7:
            slide['media']={'src':'assets/lecun-demo-v1.mp4','poster':'assets/0cc9d9ebb1bce11f.webp','box':[476.52,183.689,420.77,308.92],'title':'Yann LeCun · 手写数字识别演示'}
        if slide['n']==12:
            slide['interactive']='neural'
            if (ROOT/'site/ai/survival-202608/assets/neural-preview-v1.webp').exists():slide['thumb']='assets/neural-preview-v1.webp'
        if slide['n'] in (13,21):
            from refine_interactive_20261113 import apply_page
            apply_page(slide)
        if slide['n']==15:
            slide['interactive']='gradient'
            if (ROOT/'site/ai/survival-202608/assets/gradient-preview-v2.webp').exists():slide['thumb']='assets/gradient-preview-v2.webp'
            slide['textExcerpt']=False
            slide['text']='高维空间中的梯度下降 · Gradient descent in 8 dimensions\n每个参数是一个维度。三维曲面显示两个参数和总损失；其余六个参数固定在当前值，形成当前双参数切片。\n本例开始时 w1、w2 的偏导为零，另外六个方向的梯度仍非零。只更新眼前两维会停在 L=20.75；同时更新全部八维，学习率 0.25，第一步总损失降至 2.3725。\n可旋转视角、切换观察参数、单步或连续下降，也可增大学习率观察损失上升。\n教学模型：L = ½Σwᵢ² + ¼Σ(wᵢ−wᵢ₊₁)²，w9=w1。完整八维损失函数不变，更新改变的是参数位置与截取的切片。它是凸函数，唯一全局最小值为0；真实网络可能有海量参数和非凸损失。'
    from bilingual_layout import teacher
    from bilingual_metadata import apply
    return apply(teacher(data))
if __name__=='__main__':
    path=ROOT/'site/ai/survival-202608/slides.json'
    path.write_text(json.dumps(apply_refinements(json.loads(path.read_text(encoding='utf8'))),ensure_ascii=False,separators=(',',':')),encoding='utf8')
