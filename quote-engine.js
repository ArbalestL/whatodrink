/* Shared thematic pairing for web and native mini-app. */
globalThis.TonightQuoteEngine=(()=>{
 const hash=s=>{let n=0;for(let i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))>>>0;return n;};
 function forDrink(d){
  return Object.keys(TonightQuotes).map(id=>({id,quote:TonightQuotes[id]}))
   .filter(x=>x.quote.text&&x.quote.credit&&x.quote.source&&(!x.quote.kinds||x.quote.kinds.includes(d.kind)))
   .map(x=>{
    const q=x.quote,exact=(q.drinks||[]).includes(d.id);
    const affinity=(q.bases||[]).some(b=>(d.bases||[]).includes(b))?4:0;
    const aroma=(q.tastes||[]).some(t=>d.tastes.includes(t))?2:0;
    const mood=(q.strength===d.strengthLevel?1:0)+(q.bubbles===true&&d.bubbles?1:0);
    return {quote:q,score:(d.quoteKey===x.id?200:exact?100:0)+affinity+aroma+mood,tie:hash(d.id+'|'+x.id)};
   }).sort((a,b)=>b.score-a.score||a.tie-b.tie).map(x=>x.quote);
 }
 // Explicit ingredient vocabulary, matched against the recipe, never the story.
 const ingredientPatterns={rum:/朗姆|\brum\b/i,gin:/金酒|\bgin\b/i,vodka:/伏特加|vodka/i,scotch:/苏格兰|scotch/i,mint:/薄荷|mint/i,sherry:/雪莉|sherry/i,prosecco:/普罗赛克|prosecco/i,olive:/橄榄|olive/i,beer:/啤酒|\bbeer\b/i};
 function ingredientMatch(q,d){const recipe=(d.ingredients||[]).map(row=>row.join(' ')).join(' ');return (q.ingredients||[]).some(key=>(key==='beer'&&d.kind==='beer')||(ingredientPatterns[key]&&ingredientPatterns[key].test(recipe)));}
 function affinity(q,d){
  if((q.drinks||[]).includes(d.id))return 5;
  if(ingredientMatch(q,d))return 3;
  // Explicit ingredients override broad editorial base associations.
  if(q.ingredients&&q.ingredients.length)return 0;
  return (q.bases||[]).some(b=>(d.bases||[]).includes(b))?2:0;
 }
 function pools(d){const options=forDrink(d);return {related:options.filter(q=>affinity(q,d)>0),general:options.filter(q=>!q.ingredients&&!q.bases&&!q.drinks)};}
 function createSession(saved){
  const valid=Object.keys(TonightQuotes).map(key=>TonightQuotes[key].text);
  const history=saved&&Array.isArray(saved.used)?saved.used:[];
  const used=history.filter((text,i)=>valid.includes(text)&&history.indexOf(text)===i);
  return {used,last:used.length?used[used.length-1]:''};
 }
 function draw(d,session,rng=Math.random){
  const candidates=pools(d);
  const all=candidates.related.concat(candidates.general);
  if(!all.length)return null;
  // Never recycle a small thematic pool while eligible unseen lines remain.
  let eligible=all.filter(q=>!session.used.includes(q.text));
  if(!eligible.length){
   // Global least-recently-used rotation, including switches between drink types.
   const oldest=Math.min(...all.filter(q=>q.text!==session.last||all.length===1).map(q=>session.used.indexOf(q.text)));
   eligible=all.filter(q=>session.used.indexOf(q.text)===oldest);
  }
  const available=pool=>pool.filter(q=>eligible.includes(q));
  const related=available(candidates.related),general=available(candidates.general);
  // Target 60% thematic pairing only when both pools contain eligible lines.
  let pool=related.length&&general.length?(rng()<.6?related:general):related.length?related:general;
  if(!pool.length)pool=available(forDrink(d));
  if(!pool.length)pool=forDrink(d);if(!pool.length)return null;
  const unused=pool;
  const total=unused.reduce((sum,q)=>sum+(affinity(q,d)||1),0);let cursor=rng()*total;
  const quote=unused.find(q=>{cursor-=affinity(q,d)||1;return cursor<0;})||unused[unused.length-1];
  session.used=session.used.filter(text=>text!==quote.text);session.used.push(quote.text);session.last=quote.text;
  return quote;
 }
 return {forDrink,createSession,draw,pools,affinity};
})();
