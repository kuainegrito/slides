"""Animate the supplied cover pixels: a looping hand-drawn binary wave.

No generative redraw. Camera, title, author and all people stay fixed.
240 independently rendered frames; deterministic seeds, no audio, H.264 MP4.
"""
import argparse, hashlib, json, math, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, 'F:/codex_worktrees/cache/slide-python')
import cv2
import pymupdf as fitz

ROOT = Path(__file__).resolve().parent
WORK = ROOT / 'work/cover-wave'
WORK.mkdir(parents=True, exist_ok=True)
ASSETS = ROOT / 'site/ai/survival-202608/assets'
SOURCE = Path('D:/Nutstore/0A_TransMed/上课/How to survive in the world of AI_202608.pdf')
FPS, SECONDS = 30, 8
W, H = 1440, 810
with fitz.open(SOURCE) as doc:
    pix=doc[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
    source=np.frombuffer(pix.samples,dtype=np.uint8).reshape(H,W,3).copy()
yy, xx = np.mgrid[:H, :W].astype(np.float32)

def smooth(a, b, v):
    z = np.clip((v-a)/(b-a), 0, 1)
    return z*z*(3-2*z)

# Freeze all lettering and every figure. Only the open wave/foam region moves.
field = smooth(805, 1000, xx) * (1-smooth(430, 498, yy))
title = ((xx < 950) & (yy < 124)) | ((xx < 842) & (yy < 218))
field[title] = 0
field = cv2.GaussianBlur(field, (0, 0), 3)
field[title | (yy >= 498)] = 0
protected = (field == 0)

# Use small blue 0/1 cutouts from the original crest for the airborne spray.
sprites = []
for box in [(987,62,1010,91),(1057,35,1081,62),(1093,25,1115,48),
            (1180,41,1201,68),(1244,30,1264,55),(1288,33,1310,60)]:
    x0,y0,x1,y1=box
    rgb=source[y0:y1,x0:x1]
    r,g,b=[rgb[:,:,i].astype(float) for i in range(3)]
    alpha=np.clip((b-r-12)/44,0,1)*np.clip((g-r-6)/22,0,1)
    sprites.append(Image.fromarray(np.dstack([rgb,(alpha*255).astype(np.uint8)])))

rng = np.random.default_rng(202608)
particles = [dict(offset=float(rng.random()), x=float(rng.uniform(1080,1360)),
                  y=float(rng.uniform(82,208)), dx=float(rng.uniform(100,235)),
                  rise=float(rng.uniform(75,135)), fall=float(rng.uniform(150,240)),
                  size=float(rng.uniform(.52,.86)), sprite=i%len(sprites),
                  rotation=float(rng.uniform(-24,24))) for i in range(30)]

def frame(number):
    phase = 2*math.pi*number/(FPS*SECONDS)
    # The crest leans forward and rolls while two travelling ripples flow over it.
    surge = (1-math.cos(phase))*.5
    curl = np.exp(-(((xx-1055)/235)**2+((yy-260)/225)**2))
    angle = .115*math.sin(phase-.55) * curl
    dx = field * (100*surge + angle*(yy-270)
                  + 9*np.sin(yy*.030+xx*.008+2*phase)
                  + 4*np.sin(yy*.060-xx*.012+3*phase))
    dy = field * (-20*surge - angle*(xx-1055)
                  + 7*np.sin(xx*.019+yy*.014+2*phase))
    warped = cv2.remap(source, xx+dx, yy+dy, cv2.INTER_CUBIC,
                       borderMode=cv2.BORDER_REFLECT_101)
    # A stationary source plate guarantees pixel-exact preservation outside water.
    warped[protected] = source[protected]
    overlay = Image.new('RGBA',(W,H))
    for p in particles:
        u = (number/(FPS*SECONDS)*2+p['offset'])%1
        opacity = math.sin(math.pi*u)**1.4 * .73
        x = p['x']-p['dx']*u-30*surge
        y = p['y']-p['rise']*4*u*(1-u)+p['fall']*u*u
        sprite = sprites[p['sprite']]
        scale=p['size']*(.75+.4*u)
        sprite=sprite.resize((max(1,round(sprite.width*scale)),max(1,round(sprite.height*scale))),Image.Resampling.LANCZOS)
        sprite=sprite.rotate(p['rotation']+35*u,Image.Resampling.BICUBIC,expand=True)
        sprite.putalpha(sprite.getchannel('A').point(lambda a:round(a*opacity)))
        overlay.alpha_composite(sprite,(round(x),round(y)))
    spray=np.array(overlay)
    spray[protected,3]=0
    alpha=spray[:,:,3:4].astype(np.float32)/255
    result=np.clip(warped*(1-alpha)+spray[:,:,:3]*alpha,0,255).astype(np.uint8)
    assert np.array_equal(result[protected],source[protected])
    return result

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--preview',action='store_true')
    args=parser.parse_args()
    samples=[0,30,60,90,120,150,180,210]
    sheet=Image.new('RGB',(960,1080),'#e7edf2')
    for i,n in enumerate(samples):
        im=Image.fromarray(frame(n))
        im.save(WORK/f'frame-{n:03d}.png')
        thumb=im.resize((480,270),Image.Resampling.LANCZOS)
        sheet.paste(thumb,((i%2)*480,(i//2)*270))
    sheet.save(WORK/'contact.jpg',quality=94)
    if args.preview:return
    output=ASSETS/'cover-wave-v1.mp4'
    command=['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo',
             '-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),
             '-i','pipe:0','-an','-c:v','libx264','-preset','slow','-crf','21',
             '-pix_fmt','yuv420p','-movflags','+faststart','-threads','4',str(output)]
    proc=subprocess.Popen(command,stdin=subprocess.PIPE)
    for n in range(FPS*SECONDS):
        proc.stdin.write(frame(n).tobytes())
        if n%60==0: print(f'Rendered {n}/{FPS*SECONDS}',flush=True)
    proc.stdin.close()
    if proc.wait():raise RuntimeError('Video encoding failed')
    ffprobe=subprocess.run(['ffprobe','-v','error','-count_frames','-select_streams','v:0',
          '-show_entries','stream=codec_name,width,height,r_frame_rate,duration,nb_read_frames',
          '-of','json',str(output)],capture_output=True,text=True,check=True)
    probe=json.loads(ffprobe.stdout)
    stream=probe['streams'][0]
    assert int(stream['nb_read_frames'])==240 and float(stream['duration'])==8
    subprocess.run(['ffmpeg','-v','error','-i',str(output),'-f','null','-'],check=True)
    first,last=frame(0).astype(float),frame(239).astype(float)
    second=frame(1).astype(float)
    report={'source':str(SOURCE),'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'output':str(output),'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
            'bytes':output.stat().st_size,'probe':probe,'full_decode':True,
            'protected_pixels_unchanged_before_encoding':True,
            'loop_mean_pixel_delta':float(np.mean(abs(first-last))),
            'normal_mean_pixel_delta':float(np.mean(abs(first-second))),
            'style':'Original pixel displacement and cutout digit spray; no redraw; locked camera',
            'samples':samples}
    (WORK/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    print(json.dumps(report,indent=2),flush=True)

if __name__=='__main__':main()
