globalThis.TonightEngine=(()=>{
 const {drinks,getQuestions,defaults}=TonightData;
 function validate(kind,input){
  if(!['cocktail','beer'].includes(kind))throw new Error('请选择鸡尾酒或啤酒。');
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('无效的偏好。');
  if(Object.keys(input).some(k=>!Object.hasOwn(defaults(),k)))throw new Error('存在未知偏好字段。');
  const p={...defaults(),...input};
  for(const q of getQuestions(kind).flatMap(q=>q.groups||[q])){
   if(q.multi){if(!Array.isArray(p[q.key])||p[q.key].length>3||new Set(p[q.key]).size!==p[q.key].length||p[q.key].some(v=>!q.options.some(o=>o[0]===v)))throw new Error('风味需选择 0–3 个有效且不重复的选项。');}
   else if(!q.options.some(o=>o[0]===p[q.key]))throw new Error(`无效的${q.label}选项。`);
  }
  if(kind==='beer')p.base='any';else p.style='any';return p;
 }
 function shuffle(items,rng=Math.random){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function recommend(kind,input,rng=Math.random){
  const p=validate(kind,input);
  const pool=drinks.filter(d=>d.kind===kind&&(kind==='beer'?(p.style==='any'||p.style===d.style):(p.base==='any'||d.bases.includes(p.base))));
  return shuffle(pool,rng).map(drink=>{
   let score=0;const matches=[],misses=[];
   const check=(good,label,weight)=>{(good?matches:misses).push(label);if(good)score+=weight;};
   if(kind==='beer'&&p.style!=='any')matches.push('啤酒风格');if(kind==='cocktail'&&p.base!=='any')matches.push('基酒');
   for(const taste of p.tastes)check(drink.tastes.includes(taste),TonightData.flavors.find(x=>x[0]===taste)[1],3);
   if(p.body!=='any')check(drink.body===p.body,'酒体',2);
   if(p.bubbles!=='any')check(drink.carbonation===p.bubbles,'气泡',2);
   return {drink,score,matches,misses};
  }).sort((a,b)=>b.score-a.score);
 }
 function randomAll(rng=Math.random){return shuffle(drinks,rng).map(drink=>({drink,score:0,matches:[],misses:[]}));}
 return {validate,recommend,randomAll,shuffle};
})();
