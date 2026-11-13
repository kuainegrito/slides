const fs=require('node:fs'),path=require('node:path');
const {Resvg}=require('F:/codex_worktrees/cache/dependencies/slide-render/node_modules/@resvg/resvg-js');
const root=__dirname,site=path.join(root,'site'),work=path.join(root,'work/student-edition/renders');
fs.mkdirSync(work,{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(site,'ai/survival/student/slides.json'),'utf8'));
const changes=JSON.parse(fs.readFileSync(path.join(root,'work/student-edition/adaptation-review.json'),'utf8')).changed_pages.map(s=>s.pdf_page);
const cache=new Map();
function image(p){if(!cache.has(p)){const local=path.join(root,'work/student-edition/png-assets',path.basename(p)+'.png');cache.set(p,'data:image/png;base64,'+fs.readFileSync(local).toString('base64'));}return cache.get(p);}
for(const slide of data.slides){
 if(!changes.includes(slide.n))continue;
 let svg=slide.svg.replace(/(<svg\b[^>]*>)/,`$1<image width="960" height="540" href="${image(data.background)}"/>`)
  .replace(/font-family="DeckSans, DeckKai, sans-serif"/g,'font-family="Sans Serif Collection, KaiTi"')
  .replace(/href="(\/slides\/[^\"]+)"/g,(all,p)=>`href="${image(p)}"`);
 const render=new Resvg(svg,{font:{fontFiles:['C:/Windows/Fonts/SansSerifCollection.ttf','C:/Windows/Fonts/simkai.ttf'],loadSystemFonts:false,defaultFontFamily:'Sans Serif Collection'},fitTo:{mode:'width',value:1440}});
 fs.writeFileSync(path.join(work,`page-${String(slide.n).padStart(2,'0')}.png`),render.render().asPng());
}
console.log(JSON.stringify({rendered:changes.length}));
