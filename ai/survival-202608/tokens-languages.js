// Decorative multilingual neighbors; the same seed stays stable while a case is displayed.
export const POOLS=[
 [['acqua','意It'],['água','葡Pt'],['Wasser','德De'],['eau','法Fr']],
 [['dinheiro','葡Pt'],['denaro','意It'],['Geld','德De'],['dinero','西Es']],
 [['espejo','西Es'],['miroir','法Fr'],['specchio','意It'],['Spiegel','德De']],
 [['lama','法Fr'],['animal','西Es'],['gato','葡Pt'],['perro','西Es']],
 [['feu','法Fr'],['fuego','西Es'],['fuoco','意It'],['Feuer','德De']],
 [['santé','法Fr'],['salute','意It'],['salud','西Es'],['saúde','葡Pt']],
 [['amour','法Fr'],['amor','葡Pt'],['Liebe','德De'],['amore','意It']],
 [['maçã','葡Pt'],['mela','意It'],['pomme','法Fr'],['manzana','西Es']],
 [['coisas','葡Pt'],['choses','法Fr'],['cose','意It'],['Sachen','德De']],
 [['gestern','德De'],['hier','法Fr'],['ontem','葡Pt'],['ieri','意It']],
 [['morgen','德De'],['demain','法Fr'],['amanhã','葡Pt'],['domani','意It']],
 [['leste','葡Pt'],['ouest','法Fr'],['oeste','西Es'],['Osten','德De']]
];
export function foreignNeighbors(cluster,seed){let x=(seed+cluster*1009)>>>0;const words=POOLS[cluster].map(p=>[...p]);for(let i=words.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[words[i],words[j]]=[words[j],words[i]];}return words.slice(0,3);}
