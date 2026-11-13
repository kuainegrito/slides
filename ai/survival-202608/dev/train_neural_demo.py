"""Small reproducible synthetic-digit teaching network, never an accuracy claim."""
import json,os
from pathlib import Path
os.environ['OPENBLAS_NUM_THREADS']='1'
import numpy as np
ROOT=Path(__file__).resolve().parent
rows=[
 ['01110','10001','10011','10101','11001','10001','01110'],
 ['00100','01100','00100','00100','00100','00100','01110'],
 ['01110','10001','00001','00010','00100','01000','11111'],
 ['11110','00001','00001','01110','00001','00001','11110'],
 ['00010','00110','01010','10010','11111','00010','00010'],
 ['11111','10000','10000','11110','00001','00001','11110'],
 ['01110','10000','10000','11110','10001','10001','01110'],
 ['11111','00001','00010','00100','01000','01000','01000'],
 ['01110','10001','10001','01110','10001','10001','01110'],
 ['01110','10001','10001','01111','00001','00001','01110']]
templates=np.array([[int(c) for line in digit for c in line] for digit in rows],dtype=float)
rng=np.random.default_rng(120826)
dims=[35,8,6,10]
weights=[rng.normal(0,np.sqrt(2/dims[i]),(dims[i+1],dims[i])) for i in range(3)]
biases=[np.full(dims[i+1],.15 if i<2 else 0.) for i in range(3)]
params=weights+biases;m=[np.zeros_like(p) for p in params];v=[np.zeros_like(p) for p in params]
def forward(x):
 z1=x@weights[0].T+biases[0];a1=np.maximum(0,z1)
 z2=a1@weights[1].T+biases[1];a2=np.maximum(0,z2)
 z3=a2@weights[2].T+biases[2];exp=np.exp(z3-z3.max(axis=1,keepdims=True));p=exp/exp.sum(axis=1,keepdims=True)
 return z1,a1,z2,a2,z3,p
for step in range(1,1801):
 labels=rng.integers(0,10,128);x=templates[labels].copy()
 amount=rng.uniform(0,.28,(128,1));x=np.clip(x*(1-amount)+rng.random(x.shape)*amount+rng.normal(0,.045,x.shape),0,1)
 z1,a1,z2,a2,z3,p=forward(x);target=np.eye(10)[labels]*.91+.009
 d3=(p-target)/len(x);d2=(d3@weights[2])*(z2>0);d1=(d2@weights[1])*(z1>0)
 gradients=[d1.T@x,d2.T@a1,d3.T@a2,d1.sum(0),d2.sum(0),d3.sum(0)]
 for k,(param,g) in enumerate(zip(params,gradients)):
  g+=param*1e-5;m[k]=.9*m[k]+.1*g;v[k]=.999*v[k]+.001*g*g
  param-=.008*(m[k]/(1-.9**step))/(np.sqrt(v[k]/(1-.999**step))+1e-8)
z1,a1,z2,a2,z3,p=forward(templates)
assert np.array_equal(p.argmax(1),np.arange(10))
data={'architecture':dims,'seed':120826,'training':'Synthetic 5x7 templates with grayscale perturbations; fixed weights, not a handwriting benchmark.','templates':templates.astype(int).tolist(),'weights':[np.round(w,8).tolist() for w in weights],'biases':[np.round(b,8).tolist() for b in biases]}
(ROOT/'site/ai/survival-202608/neural-weights.js').write_text('/* Rebuild with train_neural_demo.py. Synthetic teaching model. */\nexport const MODEL='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(ROOT/'work/neural-12/model-reference.json').write_text(json.dumps({'architecture':dims,'clean_template_predictions':p.argmax(1).tolist(),'clean_template_probabilities':p.tolist(),'hidden1':a1.tolist(),'hidden2':a2.tolist(),'logits':z3.tolist(),'training_steps':1800,'seed':120826},indent=2),encoding='utf8')
print('Synthetic template predictions:',p.argmax(1).tolist());print('Clean 8:',p[8].round(5).tolist())
