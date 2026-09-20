globalThis.TonightData=(()=>{
 const flavors=[['sour','酸爽','柠檬、青柠的明亮酸感'],['sweet','甜润','糖、蜂蜜或甜美麦芽'],['bitter','微苦','苦橙、酒花的悠长收尾'],['savory','咸鲜','盐感、番茄与鲜味'],['dry','干爽','少甜，收口利落'],['fruity','果香','莓果、柑橘或热带水果'],['herbal','草本','薄荷、杜松与香草植物'],['floral','花香','紫罗兰、接骨木、洋甘菊'],['coffee','烘焙','咖啡、可可或烘烤麦芽'],['spicy','辛香','姜、丁香、香料或辣椒'],['smoky','烟熏','泥煤、梅斯卡尔的烟气']];
 const base={key:'base',label:'基酒',title:'想从哪种基酒开始？',hint:'也可以选择不限，给经典之外留一点空间。',options:[['any','不限基酒','交给今晚'],['gin','金酒','GIN · 杜松与草本'],['vodka','伏特加','VODKA · 纯净利落'],['rum','朗姆酒','RUM · 甘蔗与热带'],['tequila','龙舌兰 / 梅斯卡尔','AGAVE · 鲜明或烟熏'],['whisky','威士忌','WHISKY · 木质与谷物'],['brandy','白兰地','BRANDY · 葡萄与果香'],['aperitif','开胃酒 / 利口酒','APERITIF · 草本与低度调饮'],['other','其他烈酒','皮斯科、卡莎萨、格拉帕等']]};
 const style={key:'style',label:'啤酒风格',title:'今晚，偏爱哪种啤酒？',hint:'先选大方向，再按风味找到具体酒款。',options:[['any','不限风格','让我发现新的喜欢'],['lager','拉格 / 博克','LAGER · 从清爽到麦芽浓香'],['wheat','小麦啤酒','WHEAT · 果香与蓬松泡沫'],['hoppy','淡艾尔 / IPA','HOPPY · 酒花与柑橘松香'],['stout','世涛','STOUT · 咖啡与烘烤香'],['belgian','比利时强艾尔','BELGIAN · 酵母果香与层次'],['sour','酸啤 / 果味酸啤','SOUR · 果酸或微咸']]};
 const taste={key:'tastes',label:'风味',title:'想在杯中遇到哪些滋味？',hint:'可选 1–3 种。什么都不选，就是不限定。',multi:true,options:flavors};
 const body={key:'body',label:'酒体',options:[['any','都可以','看今晚的缘分'],['crisp','清爽利落','轻盈，收口干净'],['silky','圆润顺滑','柔和、丝滑或细腻泡沫'],['rich','饱满浓郁','厚实，有存在感']]};
 function getQuestions(kind){return [kind==='beer'?style:base,{...taste,options:kind==='beer'?flavors.filter(o=>!['floral','herbal'].includes(o[0])):flavors},
  {...body,title:'这一口，想要什么质地？',hint:'从轻盈清爽，到圆润饱满。'},
  {key:'bubbles',label:'气泡',title:'想要一点气泡吗？',hint:kind==='beer'?'清脆的碳酸，还是细腻的绵密泡沫？':'最后一步，选好就揭晓今晚这一杯。',options:kind==='beer'?[['any','都可以','不限定气泡强弱'],['yes','清脆气泡','碳酸感更明显'],['soft','细腻柔和','偏氮气的绵密口感']]:[['any','都可以','不限定气泡'],['yes','要气泡','清脆、活泼'],['no','不要气泡','安静地慢慢品味']]}];}
 const defaults=()=>({base:'any',style:'any',tastes:[],body:'any',bubbles:'any'});
 return {drinks:TonightCatalog.drinks,updatedAt:TonightCatalog.updatedAt,getQuestions,defaults,flavors,bodyNames:{crisp:'清爽利落',silky:'圆润顺滑',rich:'饱满浓郁'},kindNames:{cocktail:'鸡尾酒',beer:'啤酒'}};
})();
