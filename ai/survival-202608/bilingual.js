export const INK='#3f3f46',PURPLE='#7030a0';
export const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chinese=s=>String(s).split(/([A-Za-z][A-Za-z0-9 .-]*)/g).map((v,i)=>i%2?`<span class="lang-en">${escapeText(v)}</span>`:escapeText(v)).join('');
export function bi(en,zh,inline=false){return `<span class="bi${inline?' bi-inline':''}"><span class="lang-en" lang="en">${escapeText(en)}</span><span class="lang-zh" lang="zh-CN">${chinese(zh)}</span></span>`;}
export function setBi(el,en,zh,inline=false){el.innerHTML=bi(en,zh,inline);}
export function svgBi(el,en,zh,{enSize=8,zhSize=10,gap=1}={}){
 const x=el.getAttribute('x'),y=Number(el.getAttribute('y'));el.replaceChildren();el.setAttribute('fill',INK);
 for(const [s,dy,size,lang,color] of [[en,-zhSize*.55,enSize,'en',INK],[zh,zhSize*.55+gap,zhSize,'zh',PURPLE]]){
  const t=document.createElementNS('http://www.w3.org/2000/svg','tspan');t.setAttribute('x',x);t.setAttribute('y',y+dy);t.setAttribute('font-size',size);t.setAttribute('fill',color);t.dataset.lang=lang;if(lang==='zh'){for(const [i,v] of s.split(/([A-Za-z][A-Za-z0-9 .-]*)/g).entries()){if(!v)continue;const q=document.createElementNS('http://www.w3.org/2000/svg','tspan');q.setAttribute('fill',i%2?INK:PURPLE);q.dataset.lang=i%2?'en':'zh';q.textContent=v;t.append(q);}}else t.textContent=s;el.append(t);
 }
}
