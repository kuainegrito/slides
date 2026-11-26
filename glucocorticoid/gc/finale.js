// Heavy-atom coordinates and bond orders are from PubChem CID 5754.
// The flowing ribbons and the lettering are chapter-end artwork.
window.gcScenes[21]=()=>'<svg viewBox="0 0 1280 720" style="position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none">'+window.gcCortisolArt(930,302,2.8)+'</svg><div class="farewell-reader"><h2>谢谢</h2><p>糖皮质激素 · 皮质醇 C₂₁H₃₀O₅</p></div>';
window.gcFinale = function(g){
  const tau=Math.PI*2;
  let seed=5754;
  function random(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}
  function fade(v){v=Math.max(0,Math.min(1,v));return v*v*v*(10+v*(-15+6*v))}
  const dust=Array.from({length:190},()=>[random()*1280,random()*720,random(),random()*tau]);
  const glyph=document.createElement('canvas');glyph.width=540;glyph.height=260;
  const pen=glyph.getContext('2d',{willReadFrequently:true});pen.font='700 198px KaiTi, STKaiti, "Noto Serif CJK SC", SimSun, serif';
  pen.fillStyle='white';pen.fillText('谢谢',5,205);const rgba=pen.getImageData(0,0,540,260).data;
  const grains=[];
  for(let y=0;y<260;y+=3)for(let x=0;x<530;x+=3){
    const j=(y*540+x)*4+3;
    if(rgba[j]>135 && random()<(rgba[j-8]<100||rgba[j+8]<100?.78:.38))grains.push([x+random()*2,y+random()*2,random(),random()]);
  }
  const wash=document.createElement('canvas');wash.width=1280;wash.height=720;const p=wash.getContext('2d');
  const bg=p.createLinearGradient(0,0,1280,720);bg.addColorStop(0,'#071d31');bg.addColorStop(.56,'#0a2b40');bg.addColorStop(1,'#07182c');
  p.fillStyle=bg;p.fillRect(0,0,1280,720);
  function cloud(x,y,r,col){const f=p.createRadialGradient(x,y,0,x,y,r);f.addColorStop(0,col);f.addColorStop(1,'transparent');p.fillStyle=f;p.fillRect(x-r,y-r,2*r,2*r)}
  cloud(845,315,340,'#16707b66');cloud(410,370,325,'#183d635c');cloud(1115,384,160,'#70332d30');
  for(const [x,y,z] of dust){p.fillStyle='rgba(159,216,227,'+(.1+z*.22)+')';p.beginPath();p.arc(x,y,.4+z*.8,0,tau);p.fill()}
  const sheen=p.createLinearGradient(0,0,515,215);sheen.addColorStop(0,'#fbf0cc');sheen.addColorStop(.49,'#d1ece4');sheen.addColorStop(1,'#66cfda');
  pen.globalCompositeOperation='source-in';pen.fillStyle=sheen;pen.fillRect(0,0,540,260);
  function ribbon(t,layer,u){
    const depth=layer/10;
    const x=-100+1500*u;
    const a=-.9+u*6.9+depth*1.36;
    const y=485-105*Math.sin(u*3.2)+Math.sin(a*1.6+t*.14)*52+Math.sin(a*2.1-t*.10)*22+(depth-.5)*(45+32*Math.cos(a));
    return [x,y];
  }
  function write(str,x,y,font,color){g.font=font;g.fillStyle=color;g.fillText(str,x,y)}
  return function(t){
    g.globalAlpha=1;g.drawImage(wash,0,0);
    for(let k=0;k<12;k++){
      g.beginPath();for(let j=0;j<=84;j++){const [x,y]=ribbon(t,k,j/84);if(j)g.lineTo(x,y);else g.moveTo(x,y)}
      g.strokeStyle=k===5?'#71d4d235':(k%4===0?'#e3b58c2b':'#70c9df18');g.lineWidth=k===5?1.8:.9;g.stroke();
      for(let n=0;n<7;n++){const [x,y]=ribbon(t,k,((n+.48*k)/7+t*(.015+k*.0005))%1);g.globalAlpha=.2+k*.017;g.fillStyle=k%3?'#84e4e2':'#f8d096';g.beginPath();g.arc(x,y,(k%3+1)*.64,0,tau);g.fill()}
      g.globalAlpha=1;
    }
    // A solid underprint keeps the lettering readable through the particle reveal.
    const v=fade(t/4.6);g.globalAlpha=.27+v*.68;g.drawImage(glyph,80,188);g.globalAlpha=1;
    for(const [x,y,phase,size] of grains){
      const f=fade((t-phase*1.5)/3.0),q=1-f;
      const ox=80+x+(560-x+phase*170)*q,oy=188+y+(94-y)*q+Math.sin(phase*tau*2-q*4)*55*q;
      g.globalAlpha=(.24+.7*f)*(.54+.35*Math.sin(t*.65+phase*tau));g.fillStyle=size>.79?'#ffdfad':'#c8f4ee';
      g.fillRect(ox,oy,.65+size*1.5,.65+size*1.5);
    }
    g.globalAlpha=1;g.strokeStyle='#71d6e0';g.lineWidth=2;g.beginPath();g.moveTo(84,181);g.lineTo(129,181);g.stroke();
    write('生理学　/　糖皮质激素',82,153,'600 22px "Microsoft YaHei",sans-serif','#88dee3');
    write('皮质醇',804,525,'600 27px "Microsoft YaHei",sans-serif','#e9f4ef');
    write('C₂₁H₃₀O₅',907,526,'400 28px "Segoe UI",Arial,sans-serif','#a7d5d2');
  }
};
