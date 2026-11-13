const fs=require('node:fs'),path=require('node:path');
const {Resvg}=require('F:/codex_worktrees/cache/dependencies/slide-render/node_modules/@resvg/resvg-js');
const root=__dirname,work=path.join(root,'work/bilingual-v1');
const images=new Map();
function image(uri){const key=path.basename(uri);if(!images.has(key))images.set(key,'data:image/png;base64,'+fs.readFileSync(path.join(work,'png',key+'.png')).toString('base64'));return images.get(key);}
for(const edition of ['teacher','student']){
 const source=edition==='teacher'?'ai/survival-202608':'ai/survival/student';
 const deck=JSON.parse(fs.readFileSync(path.join(root,'site',source,'slides.json'),'utf8'));const out=path.join(work,'renders',edition);fs.mkdirSync(out,{recursive:true});
 for(const slide of deck.slides){if(!/<text\b/.test(slide.svg))continue;
  let svg=slide.svg.replace(/(<svg\b[^>]*>)/,`$1<image width="960" height="540" href="${image(deck.background)}"/>`).replace(/font-family="[^"]+"/g,'font-family="Sans Serif Collection, KaiTi"').replace(/href="([^"]+\.webp)"/g,(all,p)=>`href="${image(p)}"`);
  const r=new Resvg(svg,{font:{fontFiles:['C:/Windows/Fonts/SansSerifCollection.ttf','C:/Windows/Fonts/simkai.ttf'],loadSystemFonts:false,defaultFontFamily:'Sans Serif Collection'},fitTo:{mode:'width',value:1440}});
  fs.writeFileSync(path.join(out,`page-${String(slide.n).padStart(2,'0')}.png`),r.render().asPng());
 }
 console.log('Rendered '+edition);
}
