// ===================== 11 收藏鳥：用孵出的鳥換收藏鳥 =====================
// 孵出來的規則鳥，各自值多少「鳥幣」：越後面章節的鳥越值錢
const BIRD_VALUE={1:1,2:2,3:3,4:4,5:5,O:6,6:7,7:8};
const RARITY={
  common:{name:'普通',cost:8,cls:'r-common'},
  rare:{name:'稀有',cost:16,cls:'r-rare'},
  epic:{name:'珍稀',cost:28,cls:'r-epic'},
  legend:{name:'傳說',cost:45,cls:'r-legend'},
};
const RARITY_ORDER=['common','rare','epic','legend'];
const E_=(x,y,r=1.05)=>`<circle cx="${x}" cy="${y}" r="${r}" class="eye-k"/>`;
const EW=(x,y)=>`<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/><circle cx="${x+.25}" cy="${y-.1}" r=".8" class="eye-k"/>`;
const T_=c=>TAIL.replace('FILL',c), B_=c=>BODY.replace('FILL',c);
const COLLECT={
  bulbul:{name:'白頭翁',rarity:'common',fact:'頭頂後方有一塊白色的羽毛，看起來像白頭髮。都市的公園和行道樹很常見，叫聲又響又多變。',
    svg:svgWrap(T_('#8f9a7c')+B_('#a3ad8f')+`<ellipse cx="10.6" cy="15" rx="5.8" ry="3.4" fill="#ece8d6"/><path d="M4.6 7.6 Q6.6 2.4 12 2.6 Q16.8 3 18 7.6 Q12 6 4.6 7.6 Z" fill="#23262b"/><ellipse cx="8" cy="5.6" rx="2.8" ry="1.7" fill="#fff"/>${E_(14,8.4)}<path d="M17.8 8.6 L20.8 9.4 L17.9 10.3 Z" fill="#333"/>`),
    call:[[1800,2400,.08],[2400,1900,.1],[2000,2600,.08]]},
  blackbulbul:{name:'紅嘴黑鵯',rarity:'common',fact:'全身黑色，嘴巴和腳卻是鮮紅色。叫聲很像小貓在喵喵叫，常一群在樹上吃果實。',
    svg:svgWrap(T_('#2b2f36')+B_('#33373f')+`<path d="M7 3.4 L8.4 .6 L9.6 3 L11 .2 L12 3 Z" fill="#2b2f36"/>${EW(14,8)}<path d="M17.4 8 L21.4 9.2 L17.6 10.6 Z" fill="#e23b2e"/>`),
    call:[[900,1400,.12],[1400,800,.14]],wave:'triangle'},
  dove:{name:'珠頸斑鳩',rarity:'common',fact:'脖子後面有一圈黑底白點的羽毛，像戴了一條珍珠項鍊。常在地上走來走去找種子吃。',
    svg:svgWrap(T_('#a88a7c')+B_('#c7a596')+`<ellipse cx="10.4" cy="14.6" rx="6" ry="3.6" fill="#dcc0b2"/><path d="M5 8.4 Q7 3 12 3 Q16.6 3.2 17.8 7.6 Q12 7 5 8.4 Z" fill="#b6a3a9"/><rect x="12.4" y="10" width="4.6" height="3.6" rx="1.6" fill="#2b2b2b"/><circle cx="13.6" cy="11" r=".5" fill="#fff"/><circle cx="15.2" cy="11.4" r=".5" fill="#fff"/><circle cx="14.2" cy="12.6" r=".5" fill="#fff"/><circle cx="16" cy="12.6" r=".5" fill="#fff"/>${E_(14.2,7.2,.95)}<path d="M17.8 8 L20 8.6 L17.9 9.3 Z" fill="#5a4a44"/>`),
    call:[[420,380,.22],[380,360,.32]],wave:'sine',gap:.08},
  swallow:{name:'家燕',rarity:'common',fact:'尾巴是長長的叉子形狀。常在騎樓和屋簷下用泥巴做碗狀的巢，春天到處都看得到牠們飛來飛去。',
    svg:svgWrap(`<path d="M3.4 12.4 L-3.6 11.4 L-1 14.2 L-4 17.6 L3.4 16.4 Z" fill="#1f3a6e" class="ln"/>`+B_('#24427a')+`<ellipse cx="11" cy="15.2" rx="6" ry="3.6" fill="#f4efe6"/><path d="M13 9.6 Q17.4 9 18.2 11.6 Q16.4 13.4 13.4 12.6 Z" fill="#b5482b"/><path d="M14.6 4.6 Q17.6 5.6 18 7.6 L15.6 7.4 Z" fill="#b5482b"/>${E_(14,7.6)}<path d="M18 8.2 L20.2 8.8 L18 9.5 Z" fill="#222"/>`),
    call:[[3400,3800,.03],[3600,3200,.03],[3400,3900,.03],[3700,3300,.03]]},
  egret:{name:'小白鷺',rarity:'common',fact:'全身雪白，嘴和腳是黑色，腳趾卻是黃色的，像穿了黃襪子。常站在水田和溪邊等魚游過來。',
    svg:svgWrap(`<path d="M7 3.6 Q2 1 -1 2.4" stroke="#fff" stroke-width=".8" fill="none" class="ln-thin"/><path d="M7.6 3.2 Q3 -.4 .4 .2" stroke="#fff" stroke-width=".7" fill="none"/>`+T_('#fff')+B_('#fff')+`<path d="M5 13.4 Q8.6 17.6 13.4 16.4" class="wing-w"/>${E_(13.8,7.6)}<path d="M17.2 7.8 L24.6 8.8 L17.4 10 Z" fill="#222"/>`),
    call:[[600,420,.14]],wave:'sawtooth'},
  monarch:{name:'黑枕藍鶲',rarity:'rare',fact:'雄鳥全身亮藍色，後腦勺有一小撮黑色羽毛，名字的「黑枕」就是這樣來的。常在低海拔樹林裡捕捉飛蟲。',
    svg:svgWrap(T_('#2a63c6')+B_('#2f6fd8')+`<ellipse cx="10.6" cy="15.2" rx="5.8" ry="3.4" fill="#d6e4f7"/><circle cx="6.4" cy="4.4" r="1.9" fill="#111"/><path d="M14.4 10.4 L17.4 10 L17 11 Z" fill="#111"/>${E_(14,7.6)}<path d="M17.6 8.1 L20.6 9 L17.7 10 Z" fill="#1b2633"/>`),
    call:[[2600,3000,.06],[2600,3000,.06],[2600,3000,.06],[2800,2400,.1]]},
  scimitar:{name:'小彎嘴',rarity:'rare',fact:'台灣特有種。嘴巴又長又往下彎，眼睛上方有一條白色眉線。很害羞，常躲在灌木叢裡，只聽得到叫聲。',
    svg:svgWrap(T_('#7a5034')+B_('#8a5a3b')+`<ellipse cx="11" cy="14.6" rx="5.6" ry="3.6" fill="#f4efe6"/><path d="M4.6 13 Q7.4 18.4 12.6 18" stroke="#b5622e" stroke-width="2" fill="none"/><path d="M7 6.6 Q12 4.6 17 6.6" stroke="#fff" stroke-width="1.2" fill="none"/>${E_(13.6,8)}<path d="M17.2 8.2 Q22.4 9 22 12.6 Q20.6 10.4 17.4 10.2 Z" fill="#e3c24a"/>`),
    call:[[1100,900,.1],[1200,1000,.1],[900,700,.14]],wave:'triangle'},
  yuhina:{name:'冠羽畫眉',rarity:'rare',fact:'台灣特有種，頭上有一撮翹翹的冠羽。叫聲常被聽成「吐米酒」，在中高海拔的山上很常見。',
    svg:svgWrap(`<path d="M7 4.4 L6 -1.8 L11 3 Z" fill="#7d6f5f" class="ln"/>`+T_('#8c7e6a')+B_('#9b8f7c')+`<ellipse cx="11" cy="14.8" rx="5.8" ry="3.4" fill="#ede6d6"/><path d="M11.4 7.8 Q14 6.6 17 7.6" stroke="#1b1b1b" stroke-width=".9" fill="none"/><path d="M13.2 10.4 Q14.6 12.6 16.8 11" stroke="#1b1b1b" stroke-width=".8" fill="none"/>${E_(14,7.6,.9)}<path d="M17.6 8.2 L20.4 9 L17.7 9.9 Z" fill="#333"/>`),
    call:[[2000,2600,.07],[2300,1800,.08],[2600,3000,.1]]},
  bushrobin:{name:'栗背林鴝',rarity:'rare',fact:'台灣特有種，住在高山上。名字的「栗背」指的是背上栗紅色的羽毛。常在步道上跳來跳去，一點都不怕人。',
    svg:svgWrap(T_('#2c3a5a')+B_('#2f3e60')+`<path d="M2.8 10.6 Q4 4.6 9 3.8 Q6.4 8 8.6 13.4 Q5 14 2.8 10.6 Z" fill="#b8562a"/><ellipse cx="11" cy="15.4" rx="5.4" ry="3" fill="#d8c8b8"/><path d="M10 6.4 Q13.6 5 17 6.6" stroke="#fff" stroke-width="1.1" fill="none"/>${E_(14,8)}<path d="M17.6 8.4 L20.4 9.2 L17.7 10 Z" fill="#1b1b1b"/>`),
    call:[[3000,2400,.08],[2800,3200,.08]]},
  bushtit:{name:'紅頭山雀',rarity:'rare',fact:'身體很小，頭頂是紅褐色，喉嚨有一塊黑色。總是一大群在樹梢間快速移動，叫聲細細碎碎的。',
    svg:svgWrap(`<path d="M3.4 12 L-4 13.4 L-3.6 15 L3.4 15.8 Z" fill="#7d8592" class="ln"/>`+B_('#8f97a3')+`<ellipse cx="10.8" cy="15" rx="5.8" ry="3.4" fill="#e9dccf"/><path d="M4.6 7.4 Q6.6 2.4 12 2.6 Q16.8 3 18 7.2 Q12 5.6 4.6 7.4 Z" fill="#b5512e"/><ellipse cx="12.4" cy="9.8" rx="3.4" ry="2.2" fill="#fff"/><ellipse cx="15.4" cy="12" rx="2.2" ry="1.6" fill="#1b1b1b"/>${EW(14.2,7.8)}<path d="M17.8 8.6 L19.6 9.2 L17.8 9.8 Z" fill="#222"/>`),
    call:[[5200,5600,.025],[5400,5000,.025],[5200,5700,.025],[5500,5100,.025]]},
  budgie:{name:'藍色虎皮鸚鵡',rarity:'rare',fact:'原產澳洲，野生的虎皮鸚鵡其實是綠色的，藍色是人工飼養時出現的羽色變化。頭後面有像老虎斑紋的波浪條紋，很愛說話、學聲音。',
    svg:svgWrap(`<path d="M3.4 12.4 L-6.2 15.6 L-5.6 17 L3.6 15.8 Z" fill="#2f6fc0" class="ln"/>`+B_('#5b9bea')+`<path d="M5 14 q2 -1.4 4 0 M6 16.4 q2 -1.4 4 0 M3.6 11.4 q2 -1.4 4 0" stroke="#1d3f73" stroke-width=".7" fill="none"/><path d="M6 6.2 Q8 2.6 12.4 2.8 Q17.4 3.2 18.2 8.6 Q16.8 12.8 12.6 12.4 Q8.6 11.6 6 6.2 Z" fill="#fff"/><path d="M6.6 5.8 q1.2 -1 2.4 0 M7.4 7.8 q1.2 -1 2.4 0 M8.8 4.2 q1.2 -1 2.4 0 M10.6 2.9 q1.2 -.9 2.4 0" stroke="#1b1b1b" stroke-width=".6" fill="none"/><circle cx="14.4" cy="12.1" r=".7" fill="#1b1b1b"/><circle cx="16.3" cy="11.4" r=".7" fill="#1b1b1b"/><ellipse cx="17.7" cy="7.7" rx="1.2" ry=".8" fill="#3b6fd0"/>${E_(13.8,7.2,.95)}<path d="M17.4 8.4 Q20.4 8.6 18.4 11.2 Z" fill="#d9cfa8"/>`),
    call:[[2600,3400,.04],[3200,2400,.05],[2800,3600,.04],[3400,2800,.05],[3000,3800,.04]]},
  yellowtit:{name:'黃山雀',rarity:'epic',fact:'台灣特有種。全身鮮黃色，頭上頂著一撮黑色的冠羽，非常亮眼。數量不多，能遇到算是幸運。',
    svg:svgWrap(`<path d="M7.6 4.6 L7.2 -2 L12 3.4 Z" fill="#1b1b1b" class="ln"/>`+T_('#6f7f99')+B_('#ffd23a')+`<path d="M3.4 9 Q5 5 9 4.6 Q7.4 9 9.6 14 Q5.4 14 3.4 9 Z" fill="#6f7f99"/><circle cx="6" cy="9" r=".7" fill="#fff"/><circle cx="7" cy="11.4" r=".7" fill="#fff"/><path d="M14 11 Q15.4 14.4 13 17" stroke="#1b1b1b" stroke-width="1.6" fill="none"/>${E_(14,7.6)}<path d="M17.6 8.2 L20.2 9 L17.7 9.8 Z" fill="#333"/>`),
    call:[[3600,3000,.06],[3600,3000,.06],[3200,3800,.08]]},
  pheasant2:{name:'藍腹鷴',rarity:'epic',fact:'台灣特有種。雄鳥全身深藍色，背上有一塊白色，臉是鮮紅色，還拖著白色的長尾羽。住在中低海拔的原始森林。',
    svg:svgWrap(`<path d="M3.4 12.6 L-8 14.6 L-7.6 16.4 L3.6 16.4 Z" fill="#fff" class="ln"/>`+B_('#24306a')+`<path d="M3 8 Q6 3.6 10 4.4 Q8 7 8.4 9.6 Q5.4 10.6 3 8 Z" fill="#fff"/><ellipse cx="14.4" cy="8.4" rx="3" ry="2.6" fill="#e23b2e"/><path d="M11.6 3.6 Q13 1.4 14.6 3.2" stroke="#fff" stroke-width="1.1" fill="none"/>${E_(14.6,8.2,.85)}<path d="M17.6 8.8 L20 9.6 L17.8 10.4 Z" fill="#d9d2c0"/>`),
    call:[[700,500,.16],[600,450,.18]],wave:'triangle'},
  oriole:{name:'朱鸝',rarity:'epic',fact:'身體是深紅色，頭和脖子是黑色，嘴巴是淡藍色。在台灣數量非常稀少，是珍貴的保育類鳥。',
    svg:svgWrap(T_('#7a1a27')+B_('#8e1f2e')+`<path d="M8 3.4 Q14 2 18.2 7 Q18.4 12 14 13.6 Q9.4 12.6 8 3.4 Z" fill="#141414"/>${EW(14.2,7.6)}<path d="M17.8 8 L21.6 9.2 L17.9 10.4 Z" fill="#a9c2d6"/>`),
    call:[[1400,1800,.1],[1800,1300,.12],[1500,2000,.12]],wave:'triangle'},
  pitta:{name:'八色鳥',rarity:'epic',fact:'羽毛有綠、藍、紅、黃、黑等好多種顏色，所以叫八色鳥。夏天才會飛來台灣繁殖，數量很稀少。',
    svg:svgWrap(`<path d="M3 12.6 L-1.4 14.4 L-1 15.6 L3.2 16.4 Z" fill="#e23b2e" class="ln"/>`+B_('#4caf50')+`<ellipse cx="11" cy="15.2" rx="6" ry="3.4" fill="#f1e3b6"/><ellipse cx="11.4" cy="17.6" rx="2.6" ry="1.2" fill="#e23b2e"/><path d="M4 11 Q5 8.4 8 8.6 Q7 11 8.4 13 Q5.4 13.4 4 11 Z" fill="#3fa1e6"/><path d="M5.6 6.6 Q10 2.6 17.4 6.6 Q18 10 15.4 11 Q10 10.6 5.6 6.6 Z" fill="#1b1b1b"/><path d="M7.4 5.4 Q11.4 3.2 16 5" stroke="#e9c477" stroke-width="1.2" fill="none"/>${EW(14,8)}<path d="M17.8 8.4 L20.6 9.2 L17.9 10 Z" fill="#222"/>`),
    call:[[1700,1500,.12],[1900,1600,.14]],wave:'sine',gap:.1},
  spoonbill:{name:'黑面琵鷺',rarity:'epic',fact:'黑色的臉加上扁平像飯匙的長嘴。每年冬天飛到台南曾文溪口過冬，全世界的數量曾經只剩幾百隻。',
    svg:svgWrap(T_('#fff')+B_('#fff')+`<path d="M5 13.4 Q8.6 17.6 13.4 16.4" class="wing-w"/><path d="M8.6 3.2 Q4.6 1.2 1.6 3.2 Q5 3.4 8 5" fill="#fff" class="ln"/><path d="M12 6 Q15.6 4.6 18 7 Q18 10.4 14.8 10.8 Q12 10 12 6 Z" fill="#1b1b1b"/>${EW(14.4,7.6)}<path d="M17.6 7.6 L23 8.2 Q25.6 8.6 25 10.4 Q24 11.6 22.6 10.6 L17.6 9.8 Z" fill="#1b1b1b"/><ellipse cx="13.6" cy="13.2" rx="2.4" ry="1.4" fill="#f3d36b"/>`),
    call:[[300,280,.2]],wave:'sawtooth'},
  fishowl:{name:'黃魚鴞',rarity:'legend',fact:'台灣最大型的貓頭鷹之一，全身金黃褐色，住在中低海拔的溪流旁，專門抓魚和蝦。非常難得一見。',
    svg:svgWrap(`<path d="M4 5.4 L2.4 -1.6 L8 3.4 Z" fill="#b8742e" class="ln"/><path d="M16 5.4 L17.6 -1.6 L12 3.4 Z" fill="#b8742e" class="ln"/><circle cx="10" cy="11" r="8.4" class="ln" fill="#d08a3c"/><ellipse cx="10" cy="9.6" rx="6.6" ry="4.6" fill="#f0c98a"/><circle cx="7.2" cy="9.2" r="2.4" fill="#ffd23a"/><circle cx="12.8" cy="9.2" r="2.4" fill="#ffd23a"/><circle cx="7.3" cy="9.2" r="1.2" class="eye-k"/><circle cx="12.7" cy="9.2" r="1.2" class="eye-k"/><path d="M9.2 11 L10.8 11 L10 13 Z" fill="#555"/><path d="M6 15 v2 M8.6 15.6 v2.2 M11.4 15.6 v2.2 M14 15 v2" stroke="#8a5424" stroke-width=".8"/>`),
    call:[[260,220,.3],[240,200,.34]],wave:'sine',gap:.2},
  hawkeagle:{name:'熊鷹',rarity:'legend',fact:'台灣體型最大的猛禽之一，翅膀又寬又大，住在深山的原始森林。牠的羽毛在魯凱族、排灣族的文化中非常尊貴。',
    svg:svgWrap(`<path d="M5.6 4 L1.4 1.6 L4 6 Z" fill="#3f2b1e" class="ln"/>`+T_('#4a3424')+B_('#5a3e2b')+`<ellipse cx="11" cy="14.6" rx="6" ry="3.8" fill="#e9dccb"/><path d="M7 13.4 h3 M8 15.2 h4 M7.4 17 h3.4 M12 13.6 h3 M13 15.6 h2.6" stroke="#5a3e2b" stroke-width=".9"/><path d="M11 6.8 Q14 5.4 16.8 6.8" stroke="#2b1e14" stroke-width="1.2" fill="none"/><circle cx="14" cy="8.2" r="1.3" fill="#f2c230"/><circle cx="14.1" cy="8.2" r=".65" class="eye-k"/><path d="M17 7.4 Q21.6 7.6 20.6 11.4 Q19.6 9.8 17.2 10.2 Z" fill="#3a3a3a"/>`),
    call:[[1800,1300,.3],[1600,1100,.35]],wave:'sine',gap:.12},
};
Object.assign(SPECIES,COLLECT);
const COLLECT_ORDER=Object.keys(COLLECT).sort((a,b)=>RARITY_ORDER.indexOf(COLLECT[a].rarity)-RARITY_ORDER.indexOf(COLLECT[b].rarity));
const costOf=k=>RARITY[COLLECT[k].rarity].cost;
const isCollect=t=>t in COLLECT;
const valueOf=t=>BIRD_VALUE[t]||0;
const aviaryValue=()=>PROG.aviary.reduce((s,t)=>s+valueOf(t),0);
const rarityTag=k=>{const r=RARITY[COLLECT[k].rarity]; return `<span class="rtag ${r.cls}">${r.name}</span>`;};

// ---------- 鳥幣錢包：出售鳥換鳥幣，再用鳥幣兌換收藏鳥 ----------
const coins=()=>PROG.coins||0;
let SELL=null;
function tradeList(box){
  const head=document.createElement('div'); head.className='wallet';
  head.innerHTML=`<span class="coin-ic" aria-hidden="true"></span><span>鳥幣錢包 <b>${coins()}</b></span><button class="pill small primary" id="sellOpen">出售鳥，兌換鳥幣</button>`+
    `<p class="note">孵出來的鳥可以出售換鳥幣，越後面章節的鳥越值錢：鸚鵡 1、山雀 2、綠繡眼 3、翠鳥 4、麻雀 5、領角鴞 6、藍鵲 7、五色鳥 8。你鳥園裡可以出售的鳥共值 ${aviaryValue()} 鳥幣。</p>`;
  box.appendChild(head); head.querySelector('#sellOpen').onclick=openSell;
  COLLECT_ORDER.forEach(k=>{ const sp=COLLECT[k], have=PROG.aviary.filter(t=>t===k).length, cost=costOf(k), ok=coins()>=cost;
    const d=document.createElement('div'); d.className='g-card';
    d.innerHTML=`<span class="g-ic"><span class="pic">${sp.svg}</span></span><b></b>${rarityTag(k)}<span class="g-sub"></span><button class="pill small${ok?' primary':''}"></button>`;
    d.querySelector('b').textContent=sp.name; d.querySelector('.g-sub').textContent=`${cost} 鳥幣`+(have?`・已有 ${have} 隻`:'');
    const btn=d.querySelector('button'); btn.textContent='兌換'; btn.disabled=!ok; btn.onclick=()=>buyBird(k);
    box.appendChild(d); });
}
function buyBird(k){
  const cost=costOf(k); if(coins()<cost) return;
  PROG.coins=coins()-cost; PROG.aviary.push(k);
  const first=!PROG.seen.includes(k); if(first) PROG.seen.push(k);
  saveProg(); gRender(); gList(); checkAch(); chirp(k,.06); showNewBird(k,first);
}
function openSell(){ SELL={cnt:{}}; renderSell(); $('trade').hidden=false; }
function renderSell(){
  const own={}; PROG.aviary.forEach(t=>{ if(valueOf(t)) own[t]=(own[t]||0)+1; });
  const sum=Object.entries(SELL.cnt).reduce((s,[t,n])=>s+valueOf(isNaN(+t)?t:+t)*n,0);
  $('tradeBird').innerHTML='<span class="coin-ic big"></span>'; $('tradeName').textContent='出售鳥，兌換鳥幣'; $('tradeTag').innerHTML='';
  $('tradeNeed').textContent=`錢包現在有 ${coins()} 鳥幣，這次可以換到 ${sum} 鳥幣`;
  $('tradeNeed').classList.toggle('ok',sum>0);
  const box=$('tradeRows'); box.innerHTML='';
  const kinds=BIRD_ORDER.filter(t=>own[t]);
  if(!kinds.length) box.innerHTML='<p class="note">鳥園裡沒有可以出售的鳥。過關就會孵出新的鳥。收藏鳥和帝雉不能出售。</p>';
  kinds.forEach(t=>{ const n=SELL.cnt[t]||0, row=document.createElement('div'); row.className='trow';
    row.innerHTML=`${birdDot(t)}<span class="tn">${SPECIES[t].name}<small>每隻 ${valueOf(t)} 鳥幣・有 ${own[t]} 隻</small></span><button class="step" aria-label="少一隻">−</button><b>${n}</b><button class="step" aria-label="多一隻">＋</button><button class="pill small all">全部</button>`;
    const [minus,plus]=row.querySelectorAll('.step'); minus.disabled=n<=0; plus.disabled=n>=own[t];
    minus.onclick=()=>{SELL.cnt[t]=n-1; renderSell();}; plus.onclick=()=>{SELL.cnt[t]=n+1; renderSell();};
    row.querySelector('.all').onclick=()=>{SELL.cnt[t]=own[t]; renderSell();};
    box.appendChild(row); });
  birdify(box);
  $('tradeGo').disabled=sum<=0; $('tradeGo').textContent=sum>0?`出售，得到 ${sum} 鳥幣`:'出售';
}
$('tradeAuto').onclick=()=>{ SELL.cnt={}; renderSell(); };
$('tradeCancel').onclick=()=>{ $('trade').hidden=true; SELL=null; };
$('tradeGo').onclick=()=>{
  let sum=0;
  for(const [t0,n] of Object.entries(SELL.cnt)){ const t=isNaN(+t0)?t0:+t0; for(let j=0;j<n;j++){ const i=PROG.aviary.indexOf(t); if(i>=0){ PROG.aviary.splice(i,1); sum+=valueOf(t); } } }
  PROG.coins=coins()+sum; saveProg(); $('trade').hidden=true; SELL=null;
  gRender(); gList(); blip(988,.12,.04); toast(`出售成功，得到 ${sum} 鳥幣`);
};
function showNewBird(k,first){
  const sp=COLLECT[k];
  $('introKind').textContent=first?'新的鳥加入圖鑑':'又來了一隻';
  $('introBird').innerHTML=sp.svg; $('intro-title').textContent=sp.name;
  $('introRule').innerHTML=`${rarityTag(k)} 牠已經住進你的鳥園了！`;
  $('introEx').textContent=''; $('introFact').textContent=sp.fact;
  $('introOk').textContent='太好了！'; introQueue=[]; introDone=null; openSheet('intro');
}
