(()=>{
 const {drinks,getQuestions,defaults,kindNames,bodyNames}=TonightData;
 const counts={cocktail:drinks.filter(d=>d.kind==='cocktail').length,beer:drinks.filter(d=>d.kind==='beer').length};
 const state={view:'category',kind:null,step:0,preferences:defaults(),results:[],resultIndex:0,random:false,quote:null};
 let savedQuotes;try{savedQuotes=JSON.parse(localStorage.getItem('tonight-quotes-v9'));}catch{}
 const quoteSession=TonightQuoteEngine.createSession(savedQuotes);
 const app=document.getElementById('app');
 let mismatchTimer;
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sourceLink=(url,label)=>`<a class="source" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>`;
 const carbonName=d=>d.carbonation==='soft'?'细腻气泡':d.bubbles?'有气泡':'无气泡';
 function artwork(d,featured=false){return `<aside class="showcase ${d.image?'':'type-art'} ${d.kind==='beer'?'beer-art':''}" aria-label="${e(d.name)}展示">${d.image?`<img src="${e(d.image)}" alt="${e(d.name)}${d.imageType==='generated'?' · AI 示意图':'酒款图片'}" ${featured?'fetchpriority="high"':''}>`:`<span class="drink-initial" aria-hidden="true">${e(d.en.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span>`}<div class="photo-copy"><h2>${e(d.en)}</h2><div class="photo-rule"></div><div class="photo-bottom"><span>${e(d.name)}</span><span>${d.abv} ABV</span></div></div></aside>`;}
 function undernote(){return `<div class="under-note"><span class="number">${drinks.length}</span><span>${counts.cocktail} 款鸡尾酒 · ${counts.beer} 款啤酒 · 经典与名吧作品</span></div>`;}
 function category(){
  app.innerHTML=`<section class="workspace category enter"><div class="conversation"><div class="topline"><span class="eyebrow">TONIGHT IS YOURS</span><span class="step-count">先选酒种</span></div><h1 tabindex="-1">今晚，喝什么？</h1><p class="subtext">跟着口味选一杯，或把选择交给偶然。</p><div class="category-grid"><button class="category-card" data-kind="cocktail"><span class="category-kicker">01 / COCKTAIL</span><strong>鸡尾酒</strong><span>从经典到名吧作品<br>${counts.cocktail} 种可能</span><span class="card-arrow" aria-hidden="true">↗</span></button><button class="category-card" data-kind="beer"><span class="category-kicker">02 / BEER</span><strong>啤酒</strong><span>从清爽拉格到浓郁世涛<br>${counts.beer} 款酒厂经典</span><span class="card-arrow" aria-hidden="true">↗</span></button></div><button class="random-card" data-action="random"><span class="random-symbol" aria-hidden="true">↝</span><span><strong>完全随机</strong><small>跳过所有问题，从 ${drinks.length} 款里直接抽一杯</small></span><span aria-hidden="true">→</span></button><p class="category-bottom">经典有章法，今晚可以有点意外。</p></div>${artwork(drinks.find(d=>d.id==='dry-martini'),true)}</section>${undernote()}`;
 }
 function summary(){
  if(state.random)return '全酒单随机 · 不使用任何口味筛选';
  const q=getQuestions(state.kind).flatMap(q=>q.groups||[q]);const selected=[kindNames[state.kind]];
  for(const item of q){const v=state.preferences[item.key];if(item.multi)selected.push(...v.map(x=>item.options.find(o=>o[0]===x)?.[1]));else if(v!=='any')selected.push(item.options.find(o=>o[0]===v)?.[1]);}
  return selected.filter(Boolean).map(e).join(' · ');
 }
 function choices(q){return `<fieldset class="choices ${q.multi?'multi-choices':''}" aria-label="${e(q.label)}"><legend class="sr-only">${e(q.label)}</legend>${q.multi?'<button type="button" class="choice choice-single choice-any" data-action="any-tastes"><span><span><b>不限风味</b><small>交给今晚，直接下一步</small></span></span></button>':''}${q.options.map(([value,title,sub])=>{const selected=q.multi?state.preferences[q.key].includes(value):state.preferences[q.key]===value;const content=`<span><span><b>${e(title)}</b><small>${e(sub)}</small></span></span>`;if(!q.multi)return `<button type="button" class="choice choice-single ${value==='any'?'choice-any':''}" data-answer-key="${q.key}" data-answer-value="${value}" aria-pressed="${selected}">${content}</button>`;const disabled=!selected&&state.preferences[q.key].length>=3;return `<label class="choice"><input type="checkbox" name="${q.key}" value="${value}" ${selected?'checked':''} ${disabled?'disabled':''}>${content}</label>`;}).join('')}</fieldset>`;}
 function quiz(){
  const qs=getQuestions(state.kind),q=qs[state.step];const featured=drinks.find(d=>d.id===(state.kind==='beer'?'sierra-pale':'dry-martini'));
  app.innerHTML=`<section class="workspace quiz enter"><div class="conversation"><div class="topline"><button class="text-button kind-back" data-action="category">← ${kindNames[state.kind]} / 换酒种</button><span class="step-count">0${state.step+1} / 0${qs.length}</span></div><div class="step-labels">${qs.map((s,i)=>`<span class="${i<=state.step?'active':''}">${s.label}</span>`).join('')}</div><div class="steps" aria-label="第 ${state.step+1} 步，共 ${qs.length} 步">${qs.map((_,i)=>`<i class="${i<=state.step?'active':''}"></i>`).join('')}</div><h1 tabindex="-1">${q.title}</h1><p class="subtext">${q.hint}</p>${choices(q)}${q.multi?`<div class="taste-tools"><span id="taste-status" role="status">已选 ${state.preferences.tastes.length} / 3</span><button class="text-button" data-action="clear-tastes">不限风味 / 清空</button></div>`:''}<div class="actions ${q.multi?'':'single-actions'}"><button class="text-button" data-action="${state.step?'back':'category'}">${state.step?'上一步':'返回'}</button>${q.multi?'<button class="primary" data-action="next"><span>继续</span><span aria-hidden="true">→</span></button>':''}</div><p class="selection-summary">${summary()}</p></div>${artwork(featured,true)}</section>${undernote()}`;
 }
 function quoteHtml(){const q=state.quote;if(!q)return '';return `<div class="quote-heading"><span>${e(q.type)}</span></div><blockquote class="quote"><p>“${e(q.text)}”</p>${q.zh?`<div class="quote-translation">${e(q.zh)}</div>`:''}<cite>${sourceLink(q.source,q.credit)}</cite></blockquote>`;}
 function resultTags(d){
  const bases={gin:'金酒',vodka:'伏特加',rum:'朗姆酒',tequila:'龙舌兰 / 梅斯卡尔',whisky:'威士忌',brandy:'白兰地',aperitif:'开胃酒 / 利口酒',other:'其他烈酒'};
  const ingredients=d.ingredients.map(row=>row[0]).join(' ');
  const baseLabel=b=>b==='tequila'?(/Mezcal|梅斯卡尔/i.test(ingredients)?'梅斯卡尔':'龙舌兰'):b==='other'?(/Pisco|皮斯科/i.test(ingredients)?'皮斯科':/Cacha[cç]a|卡莎萨/i.test(ingredients)?'卡莎萨':/Grappa|葡萄渣/i.test(ingredients)?'格拉帕':'甘蔗烈酒'):bases[b];
  const first=d.kind==='beer'?(d.origin?.split(' · ')[1]||'啤酒'):d.bases.map(baseLabel).join(' + ');
  // Show the drink's real profile, never turn an unmet preference into a claim.
  // Floral/fruit aromas share one display family; matching keeps the exact flavors.
  const flavorLabels=[...new Set(d.tags.map(t=>['花香','果香'].includes(t)?'花果香':t))];
  const tags=[first,...flavorLabels,bodyNames[d.body],carbonName(d)];
  return [...new Set(tags.filter(Boolean))].map((tag,i)=>`<span class="tag${i===0?' tag-base':''}"${tag==='花果香'?` title="${e(d.tags.filter(t=>['花香','果香'].includes(t)).join('、'))}"`:''}>${e(tag)}</span>`).join('');
 }
 function hideMismatch(){clearTimeout(mismatchTimer);const toast=app.querySelector('#mismatch-toast');if(toast){toast.hidden=true;toast.innerHTML='';}}
 function showMismatch(){
  hideMismatch();const match=state.results[state.resultIndex];if(state.random||!match?.misses.length)return;
  const toast=app.querySelector('#mismatch-toast');if(!toast)return;
  toast.hidden=false;toast.innerHTML=`<span>与偏好不同：${e([...new Set(match.misses)].join('、'))}</span><button data-action="dismiss-mismatch" aria-label="关闭偏好差异提示">×</button>`;
  mismatchTimer=setTimeout(hideMismatch,5000);
 }
 function result(){
  const match=state.results[state.resultIndex];if(!match){app.innerHTML='<section class="empty-result"><h1 tabindex="-1">暂时没有符合条件的酒款</h1><button class="primary" data-action="category">返回选酒种</button></section>';return;}
  const d=match.drink;
  state.quote=TonightQuoteEngine.draw(d,quoteSession);
  try{localStorage.setItem('tonight-quotes-v9',JSON.stringify(quoteSession));}catch{}
  app.innerHTML=`<section class="workspace result enter"><div class="conversation"><h1 tabindex="-1">${e(d.name)}</h1><p class="english-name">${e(d.en)}</p>${d.bar?`<p class="bar-origin">名吧经典 · ${e(d.bar)}</p>`:''}<div class="tags" aria-label="酒款特性">${resultTags(d)}</div><div class="metrics"><div><small>${d.kind==='beer'?'酒厂标示 ABV':'成品 ABV · 估算'}</small><strong>${d.abv}</strong></div><div><small>酒感</small><strong>${d.strength}</strong></div><div><small>酒体</small><strong>${bodyNames[d.body]}</strong></div></div><div class="actions"><button class="primary" data-action="another" ${state.results.length<2?'disabled':''}><span>${state.random?'再随机一杯':'换一杯看看'}</span><span aria-hidden="true">↻</span></button><button class="edit-button" data-action="${state.random?'category':'edit'}">${state.random?'按口味选':'调整偏好'}</button></div></div><div class="result-feature">${artwork(d)}<div id="quote-slot">${quoteHtml()}</div><button class="text-button reset-button" data-action="category">重新选酒种</button></div></section><section class="details"><div><h2>${d.bar?'一杯酒，一间酒吧':'这一杯的故事'}</h2><p>${e(d.history)}</p><div class="source-links">${sourceLink(d.source,d.kind==='beer'?'酒厂资料':d.source.includes('iba-world')?'IBA 原始配方':'配方与酒款资料')}${d.storySource?sourceLink(d.storySource,'历史 / 文化来源'):''}${d.imageSource?sourceLink(d.imageSource,d.imageCredit||'图片出处'):''}</div></div><div><h2>${d.kind==='beer'?'这款啤酒的档案':'杯中有什么'}</h2><ul class="ingredients">${d.ingredients.map(([name,amount])=>`<li><span>${e(name)}</span><span>${e(amount)}</span></li>`).join('')}</ul><span class="source">${e(d.collection)}</span></div></section><div id="mismatch-toast" class="mismatch-toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>`;
 }
 function render(focus=false){hideMismatch();if(state.view==='category')category();else if(state.view==='quiz')quiz();else result();if(focus)app.querySelector('h1')?.focus({preventScroll:false});}
 function chooseCategory(kind){if(!kindNames[kind])throw Error('无效酒种');Object.assign(state,{kind,step:0,view:'quiz',preferences:defaults(),results:[],random:false});render(true);}
 function complete(kind,preferences){const normalized=TonightEngine.validate(kind,preferences);const results=TonightEngine.recommend(kind,normalized);Object.assign(state,{kind,preferences:normalized,results,resultIndex:0,view:'result',random:false});render(true);return readResult();}
 function randomAll(){Object.assign(state,{kind:null,preferences:defaults(),results:TonightEngine.randomAll(),resultIndex:0,view:'result',random:true});render(true);return readResult();}
 function readResult(){const m=state.results[state.resultIndex];return m?{id:m.drink.id,name:m.drink.name,kind:m.drink.kind,random:state.random,unmatchedPreferences:m.misses}:null;}
 function updateTasteControls(){app.querySelectorAll('input[name="tastes"]').forEach(input=>{input.checked=state.preferences.tastes.includes(input.value);input.disabled=!input.checked&&state.preferences.tastes.length>=3;});const status=app.querySelector('#taste-status');if(status)status.textContent=`已选 ${state.preferences.tastes.length} / 3`;}
 app.addEventListener('change',event=>{const input=event.target;if(!input.matches('input'))return;
  if(input.name==='tastes'){if(input.checked&&!state.preferences.tastes.includes(input.value)&&state.preferences.tastes.length<3)state.preferences.tastes.push(input.value);else if(!input.checked)state.preferences.tastes=state.preferences.tastes.filter(t=>t!==input.value);updateTasteControls();}
  const summaryEl=app.querySelector('.selection-summary');if(summaryEl)summaryEl.innerHTML=summary();
 });
 function advance(){if(state.step<getQuestions(state.kind).length-1){state.step++;render(true);}else complete(state.kind,state.preferences);}
 app.addEventListener('click',event=>{
  const categoryButton=event.target.closest('[data-kind]');if(categoryButton){chooseCategory(categoryButton.dataset.kind);return;}
  const answer=event.target.closest('[data-answer-key]');
  if(answer&&state.view==='quiz'){const q=getQuestions(state.kind)[state.step];if(!q.multi&&q.key===answer.dataset.answerKey&&q.options.some(o=>o[0]===answer.dataset.answerValue)){state.preferences[q.key]=answer.dataset.answerValue;advance();}return;}
  const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
  if(action==='category'){state.view='category';render(true);}
  if(action==='random')randomAll();
  if(action==='any-tastes'&&state.view==='quiz'&&getQuestions(state.kind)[state.step].multi){state.preferences.tastes=[];advance();}
  if(action==='next'&&state.view==='quiz'&&getQuestions(state.kind)[state.step].multi)advance();
  if(action==='back'){state.step=Math.max(0,state.step-1);render(true);}
  if(action==='another'){
   if(state.results.length<2)return;
   state.resultIndex++;
   if(state.resultIndex>=state.results.length){const previous=state.results.at(-1)?.drink.id;state.results=state.random?TonightEngine.randomAll():TonightEngine.recommend(state.kind,state.preferences);state.resultIndex=0;if(state.random&&state.results.length>1&&state.results[0].drink.id===previous)[state.results[0],state.results[1]]=[state.results[1],state.results[0]];}
   render(true);showMismatch();
  }
  if(action==='edit'){state.view='quiz';state.step=0;render(true);}
  if(action==='dismiss-mismatch'){hideMismatch();app.querySelector('[data-action="another"]')?.focus({preventScroll:true});}
  if(action==='clear-tastes'){state.preferences.tastes=[];updateTasteControls();app.querySelector('.selection-summary').innerHTML=summary();}
 });
 render();
 if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'recommend_drink',description:'完成鸡尾酒或啤酒的偏好推荐，并在页面显示结果。',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['cocktail','beer']},preferences:{type:'object',properties:{base:{type:'string',enum:['any','gin','vodka','rum','tequila','whisky','brandy','aperitif','other']},style:{type:'string',enum:['any','lager','wheat','hoppy','stout','belgian','sour']},tastes:{type:'array',items:{type:'string',enum:TonightData.flavors.map(x=>x[0])},maxItems:3,uniqueItems:true},body:{type:'string',enum:['any','crisp','silky','rich']},bubbles:{type:'string',enum:['any','yes','no','soft']}},additionalProperties:false}},required:['kind','preferences'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>complete(input.kind,input.preferences)});
  register({name:'draw_random_drink',description:'忽略所有偏好，从全部鸡尾酒与啤酒中随机抽一杯并显示。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:randomAll});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 }
})();
