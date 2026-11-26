// Materialize each teaching step once. Navigation and the printed notes retain
// their original identifiers. Only the three source films use native video.
window.lesson.slides.forEach((slide,i)=>{
  for(const [j,item] of slide.steps.entries()){
    if(item.original?.video)continue;
    const make=window.gcScenes[i+1];
    if(typeof make!=='function')throw new Error('此页缺少动态场景：'+(i+1));
    item.html=make(j);
  }
});
