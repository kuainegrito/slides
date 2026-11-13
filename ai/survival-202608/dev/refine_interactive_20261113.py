"""Page 13/21 interactive registrations; original SVG art is retained."""
import json
from pathlib import Path
UPDATES={13: {'interactive': 'descent', 'titleZh': '梯度下降', 'textExcerpt': False, 'text': 'Gradient descent: learn by taking a step\n梯度下降：沿着坡度，一步步学习\nL(w) = ½(w − 1)²; g = w − 1; w′ = w − ηg\nRead the slope, calculate the update, then measure the new loss.\n先看坡度，再计算参数改变量，更新后再计算损失。\nPause, step, reset, and compare learning rates from the same starting point.\n可以暂停、单步、重置，从同一起点比较不同步长系数。\nA one-parameter convex teaching model, not a complete neural-network loss landscape.\n这是单参数凸函数教学模型，不是真实网络的完整损失地形。'}, 21: {'interactive': 'tokens', 'titleZh': '词元的语义星云', 'textExcerpt': False, 'text': 'A Galaxy of Tokens\n词元的语义星云\nEight cases: bank, light, flower / spend, glace, date, llama, kal, dongxi.\n八组例子：河岸／银行、光／轻、花、冰／镜子、约会／椰枣、大羊驼／火焰、昨天／明天、东西。\nShow the whole galaxy for 12 seconds on entry, then approach bank. Loops do not repeat the overview.\n进入时先展示十二秒全景，再靠近 bank；循环不重复全景。\nEach case: source 3s, smooth travel 6s, arrival hold 5s.\n每组：起点三秒，平滑移动六秒，到达停留五秒。\nLa llama mira la llama.\n大羊驼看着火焰。\nDe la glace dans le verre, une glace devant moi.\n杯里有冰，面前有一面镜子。\n我的东西不分东西。\n物品读 dōngxi；方位读 dōngxī。\nکل امتحان تھا۔ / کل امتحان ہو گا۔\n考试在昨天。／考试将在明天。\nSynthetic 8D states, projected into 3D; illustrative camera and light-flow paths are not trained model traces. Words may span multiple tokens.\n合成八维状态的三维投影；镜头与光流路径为教学示意，词语可能包含多个词元。'}}
def apply_page(slide):
    slide.update(UPDATES[slide["n"]])
    name="descent" if slide["n"]==13 else "tokens"
    target=Path(__file__).resolve().parent/"site/ai/survival-202608/assets"/(name+("-preview-v9.webp" if name=="tokens" else "-preview-v1.webp"))
    if target.exists():slide["thumb"]="assets/"+target.name
