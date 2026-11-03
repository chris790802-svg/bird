// ===================== 10 鳥園：大庭園、種子商店、擺設、季節 =====================
// 物品：vb 是 viewBox，w 是鳥園高度 400px 時的寬度；air 表示放在天空；flat 表示貼地（畫在最後面）
const G_CATS=[['fac','設施'],['plant','植物'],['view','景觀'],['season','季節']];
const G_ITEMS={
  feeder:{name:'餵食台',cat:'fac',cost:60,w:46,vb:'0 0 40 60',svg:'<rect x="18" y="20" width="4" height="40" fill="#8a5a3b"/><path d="M3 20 L37 20 L31 11 L9 11 Z" fill="#d0874f"/><rect x="5" y="20" width="30" height="5" rx="1.5" fill="#a26a3f"/><circle cx="13" cy="19" r="2" fill="#f1c95a"/><circle cx="20" cy="18.5" r="2" fill="#f1c95a"/><circle cx="27" cy="19" r="2" fill="#f1c95a"/><rect x="13" y="56" width="14" height="4" rx="2" fill="#7a4d30"/>'},
  bath:{name:'鳥浴盆',cat:'fac',cost:80,w:62,vb:'0 0 50 36',svg:'<rect x="21" y="14" width="8" height="18" fill="#b8c4cf"/><ellipse cx="25" cy="13" rx="23" ry="7" fill="#d5dee6"/><ellipse cx="25" cy="11.5" rx="18" ry="4.2" fill="#7cc4f0"/><path d="M14 11 q3 -2 6 0" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/><rect x="14" y="31" width="22" height="5" rx="2.5" fill="#b8c4cf"/>'},
  birdhouse:{name:'小鳥屋',cat:'fac',cost:120,w:46,vb:'0 0 40 66',svg:'<rect x="18" y="32" width="4" height="34" fill="#8a5a3b"/><path d="M4 16 L20 2 L36 16 Z" fill="#e05d4b"/><rect x="8" y="16" width="24" height="20" fill="#f2d39b"/><circle cx="20" cy="25" r="4.5" fill="#5a3b26"/><rect x="18" y="31" width="4" height="2" fill="#8a5a3b"/>'},
  bench:{name:'長椅',cat:'fac',cost:70,w:72,vb:'0 0 60 32',svg:'<rect x="4" y="4" width="52" height="5" rx="2" fill="#b07a4f"/><rect x="4" y="11" width="52" height="5" rx="2" fill="#b07a4f"/><rect x="2" y="18" width="56" height="5" rx="2" fill="#c98b55"/><rect x="7" y="22" width="4" height="10" fill="#555f6b"/><rect x="49" y="22" width="4" height="10" fill="#555f6b"/>'},
  swing:{name:'鞦韆',cat:'fac',cost:150,w:58,vb:'0 0 50 62',svg:'<path d="M4 62 L12 4 L38 4 L46 62" stroke="#8a5a3b" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="8" y="2" width="34" height="5" rx="2" fill="#a26a3f"/><g class="g-swing"><line x1="18" y1="6" x2="18" y2="44" stroke="#c9b28f" stroke-width="1.5"/><line x1="32" y1="6" x2="32" y2="44" stroke="#c9b28f" stroke-width="1.5"/><rect x="14" y="43" width="22" height="4" rx="2" fill="#e05d4b"/></g>'},
  lamp:{name:'路燈',cat:'fac',cost:90,w:24,vb:'0 0 20 72',svg:'<rect x="8" y="16" width="4" height="52" fill="#4a5563"/><rect x="5" y="66" width="10" height="6" rx="2" fill="#4a5563"/><path d="M3 16 L17 16 L14 4 L6 4 Z" fill="#4a5563"/><rect x="6" y="6" width="8" height="9" fill="#ffe28a" class="g-glow"/>'},
  mailbox:{name:'郵筒',cat:'fac',cost:60,w:34,vb:'0 0 30 42',svg:'<rect x="1" y="8" width="13" height="30" rx="3" fill="#2e8b57"/><rect x="16" y="8" width="13" height="30" rx="3" fill="#d6403a"/><path d="M1 12 q6.5 -9 13 0 Z" fill="#2e8b57"/><path d="M16 12 q6.5 -9 13 0 Z" fill="#d6403a"/><rect x="4" y="16" width="7" height="2" fill="#163f28"/><rect x="19" y="16" width="7" height="2" fill="#6a1714"/><rect x="2" y="37" width="26" height="5" rx="1" fill="#555f6b"/>'},
  windmill:{name:'風車',cat:'fac',cost:220,w:62,vb:'0 0 50 82',svg:'<path d="M20 82 L23 28 L27 28 L30 82 Z" fill="#9aa7b4"/><g class="g-spin" style="transform-origin:25px 26px"><path d="M25 26 L25 2 L34 19 Z" fill="#ff8f4f"/><path d="M25 26 L49 26 L32 35 Z" fill="#ffd93a"/><path d="M25 26 L25 50 L16 33 Z" fill="#7fd8c2"/><path d="M25 26 L1 26 L18 17 Z" fill="#3b93e6"/></g><circle cx="25" cy="26" r="3" fill="#fff"/>'},
  aviary:{name:'大鳥籠涼亭',cat:'fac',cost:300,w:78,vb:'0 0 60 82',svg:'<path d="M6 30 Q6 6 30 6 Q54 6 54 30" fill="none" stroke="#6f93b8" stroke-width="2.5"/><circle cx="30" cy="4" r="3" fill="none" stroke="#6f93b8" stroke-width="2"/><g stroke="#6f93b8" stroke-width="1.6">'+[0,1,2,3,4,5,6,7,8].map(k=>`<line x1="${8+k*5.5}" y1="30" x2="${8+k*5.5}" y2="76"/>`).join('')+'</g><rect x="4" y="28" width="52" height="4" rx="2" fill="#6f93b8"/><rect x="2" y="75" width="56" height="7" rx="3" fill="#6f93b8"/><line x1="12" y1="56" x2="48" y2="56" stroke="#a26a3f" stroke-width="2.5"/>'},
  scarecrow:{name:'稻草人',cat:'fac',cost:90,w:46,vb:'0 0 40 62',svg:'<rect x="18" y="20" width="4" height="42" fill="#8a5a3b"/><rect x="4" y="24" width="32" height="4" fill="#8a5a3b"/><path d="M10 26 L30 26 L28 44 L12 44 Z" fill="#5f86ad"/><path d="M12 44 L14 50 M16 44 L17 50 M24 44 L23 50 M28 44 L26 50" stroke="#e8c770" stroke-width="2"/><circle cx="20" cy="16" r="8" fill="#f2d39b"/><path d="M8 11 L32 11 L26 3 L14 3 Z" fill="#c98b55"/><circle cx="17" cy="16" r="1.2" fill="#333"/><circle cx="23" cy="16" r="1.2" fill="#333"/><path d="M17 19.5 q3 2 6 0" stroke="#333" stroke-width="1" fill="none"/>'},
  telescope:{name:'賞鳥望遠鏡',cat:'fac',cost:120,w:36,vb:'0 0 32 46',svg:'<path d="M16 24 L6 46 M16 24 L26 46 M16 24 L16 46" stroke="#555f6b" stroke-width="2.2"/><g transform="rotate(-24 16 20)"><rect x="2" y="15" width="26" height="9" rx="3" fill="#3b93e6"/><rect x="25" y="13" width="6" height="13" rx="2" fill="#27415d"/><rect x="0" y="17" width="4" height="5" rx="1" fill="#27415d"/></g>'},
  blind:{name:'賞鳥小屋',cat:'fac',cost:260,w:88,vb:'0 0 70 52',svg:'<path d="M2 20 L35 2 L68 20 Z" fill="#7a5034"/><rect x="6" y="20" width="58" height="30" fill="#a8774d"/><g stroke="#8a5f3b" stroke-width="1">'+[0,1,2,3,4].map(k=>`<line x1="6" y1="${26+k*5}" x2="64" y2="${26+k*5}"/>`).join('')+'</g><rect x="14" y="26" width="42" height="7" rx="2" fill="#2a2018"/><rect x="29" y="36" width="12" height="14" fill="#5a3b26"/>'},
  flowers:{name:'花圃',cat:'plant',cost:40,w:58,vb:'0 0 50 22',svg:'<ellipse cx="25" cy="18" rx="24" ry="5" fill="#7a5034"/>'+[[7,'#ff7aa2'],[15,'#ffd93a'],[23,'#b28dff'],[31,'#ff8f4f'],[39,'#ff7aa2'],[45,'#6cb5ff']].map(([x,c],k)=>`<line x1="${x}" y1="17" x2="${x}" y2="${9+(k%2)*3}" stroke="#4e9a52" stroke-width="1.5"/><circle cx="${x}" cy="${8+(k%2)*3}" r="3.4" fill="${c}"/><circle cx="${x}" cy="${8+(k%2)*3}" r="1.2" fill="#fff4b0"/>`).join('')},
  sunflower:{name:'向日葵',cat:'plant',cost:50,w:26,vb:'0 0 22 54',svg:'<line x1="11" y1="20" x2="11" y2="54" stroke="#4e9a52" stroke-width="2.5"/><ellipse cx="6" cy="36" rx="5" ry="2.5" fill="#4e9a52" transform="rotate(-30 6 36)"/><ellipse cx="16" cy="42" rx="5" ry="2.5" fill="#4e9a52" transform="rotate(30 16 42)"/>'+range(12).map(k=>`<ellipse cx="11" cy="4" rx="2.4" ry="5" fill="#ffd23a" transform="rotate(${k*30} 11 12)"/>`).join('')+'<circle cx="11" cy="12" r="5" fill="#7a4d24"/>'},
  mushroom:{name:'蘑菇',cat:'plant',cost:30,w:28,vb:'0 0 26 22',svg:'<rect x="9" y="10" width="8" height="12" rx="3" fill="#fff3e0"/><path d="M1 12 Q2 1 13 1 Q24 1 25 12 Z" fill="#e05d4b"/><circle cx="8" cy="7" r="2" fill="#fff"/><circle cx="17" cy="5" r="1.6" fill="#fff"/><circle cx="19" cy="9" r="1.3" fill="#fff"/>'},
  bamboo:{name:'竹子',cat:'plant',cost:80,w:36,vb:'0 0 30 92',svg:[6,15,23].map((x,k)=>`<rect x="${x}" y="${4+k*8}" width="4" height="${88-k*8}" rx="2" fill="${k%2?'#5fae63':'#4e9a52'}"/>`+[0,1,2,3,4].map(j=>`<rect x="${x-.5}" y="${18+j*16+k*4}" width="5" height="2" fill="#3c7d40"/>`).join('')+`<ellipse cx="${x+8}" cy="${12+k*8}" rx="7" ry="2.4" fill="#6fbf6a" transform="rotate(-25 ${x+8} ${12+k*8})"/>`).join('')},
  sakura:{name:'櫻花樹',cat:'plant',cost:200,w:112,vb:'0 0 80 92',svg:'<path d="M36 92 L37 52 Q30 44 24 40 M38 56 Q46 46 54 42" stroke="#7a5034" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="40" cy="34" r="24" fill="#f7b8cc"/><circle cx="20" cy="42" r="15" fill="#f9c7d6"/><circle cx="60" cy="42" r="15" fill="#f4a9c0"/><circle cx="40" cy="16" r="13" fill="#fbd3df"/><circle cx="30" cy="30" r="2" fill="#fff"/><circle cx="52" cy="26" r="2" fill="#fff"/><circle cx="46" cy="44" r="2" fill="#fff"/>'},
  maple:{name:'楓樹',cat:'plant',cost:200,w:112,vb:'0 0 80 92',svg:'<path d="M38 92 L39 50 M39 60 L28 46 M39 56 L52 44" stroke="#6b4428" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="40" cy="32" r="24" fill="#e8743b"/><circle cx="20" cy="40" r="15" fill="#f0a03c"/><circle cx="60" cy="40" r="15" fill="#d8502f"/><circle cx="40" cy="14" r="13" fill="#f2b64a"/>'},
  pine:{name:'松樹',cat:'plant',cost:150,w:66,vb:'0 0 50 92',svg:'<rect x="22" y="72" width="6" height="20" fill="#6b4428"/><path d="M25 2 L40 30 L10 30 Z" fill="#3f8f5a"/><path d="M25 18 L44 52 L6 52 Z" fill="#378052"/><path d="M25 36 L48 76 L2 76 Z" fill="#2f7049"/>'},
  pond:{name:'池塘',cat:'view',cost:180,w:136,flat:true,vb:'0 0 110 34',svg:'<ellipse cx="55" cy="18" rx="54" ry="16" fill="#8fbfa0"/><ellipse cx="55" cy="18" rx="48" ry="12" fill="#5fb0e0"/><ellipse cx="40" cy="15" rx="12" ry="2" fill="#bfe3f7" opacity=".8"/><ellipse cx="78" cy="21" rx="7" ry="3" fill="#5fae63"/><circle cx="76" cy="19.5" r="1.8" fill="#ff9fc0"/><ellipse cx="30" cy="22" rx="6" ry="2.6" fill="#5fae63"/>'},
  bridge:{name:'小木橋',cat:'view',cost:140,w:100,vb:'0 0 80 32',svg:'<path d="M2 28 Q40 0 78 28" stroke="#a26a3f" stroke-width="6" fill="none"/><path d="M4 22 Q40 -4 76 22" stroke="#c98b55" stroke-width="2" fill="none"/>'+[12,24,40,56,68].map(x=>`<line x1="${x}" y1="${x===40?6:x<40?27-x*.6:27-(80-x)*.6}" x2="${x}" y2="${(x===40?6:x<40?27-x*.6:27-(80-x)*.6)-8}" stroke="#a26a3f" stroke-width="2"/>`).join('')},
  lantern:{name:'石燈籠',cat:'view',cost:110,w:32,vb:'0 0 28 52',svg:'<rect x="6" y="46" width="16" height="6" rx="1" fill="#9aa3a8"/><rect x="11" y="30" width="6" height="16" fill="#aab2b7"/><rect x="5" y="26" width="18" height="5" fill="#9aa3a8"/><rect x="7" y="14" width="14" height="12" fill="#aab2b7"/><rect x="10" y="17" width="8" height="6" fill="#ffe28a" class="g-glow"/><path d="M1 14 L14 4 L27 14 Z" fill="#8a9398"/><circle cx="14" cy="3" r="2" fill="#8a9398"/>'},
  tent:{name:'帳篷',cat:'view',cost:160,w:74,vb:'0 0 60 46',svg:'<path d="M30 2 L58 46 L2 46 Z" fill="#ff8f4f"/><path d="M30 2 L44 46 L16 46 Z" fill="#ffb069"/><path d="M30 18 L37 46 L23 46 Z" fill="#7a4d30"/><line x1="30" y1="2" x2="30" y2="-2" stroke="#7a4d30" stroke-width="1.5"/><path d="M30 -2 l6 2 l-6 2 Z" fill="#3b93e6"/>'},
  picnic:{name:'野餐墊',cat:'view',cost:60,w:74,flat:true,vb:'0 0 60 24',svg:'<path d="M6 8 L54 8 L60 22 L0 22 Z" fill="#fff"/>'+[0,1,2,3,4,5].map(k=>`<path d="M${6+k*8} 8 L${10+k*8} 8 L${10+k*10} 22 L${6+k*10} 22 Z" fill="#e05d4b" opacity=".85"/>`).join('')+'<rect x="34" y="2" width="12" height="9" rx="2" fill="#c98b55"/><path d="M36 2 q4 -4 8 0" stroke="#8a5a3b" stroke-width="1.4" fill="none"/><circle cx="18" cy="12" r="3" fill="#e05d4b"/>'},
  balloon:{name:'熱氣球',cat:'view',cost:260,w:46,air:true,vb:'0 0 40 62',svg:'<path d="M20 2 C4 2 0 18 8 32 L14 42 L26 42 L32 32 C40 18 36 2 20 2 Z" fill="#ff7aa2"/><path d="M20 2 C14 2 12 18 14 32 L16 42 L24 42 L26 32 C28 18 26 2 20 2 Z" fill="#ffd93a"/><line x1="15" y1="42" x2="16" y2="50" stroke="#7a4d30"/><line x1="25" y1="42" x2="24" y2="50" stroke="#7a4d30"/><rect x="14" y="50" width="12" height="9" rx="2" fill="#a26a3f"/>'},
  cloud:{name:'雲朵',cat:'view',cost:40,w:74,air:true,vb:'0 0 60 26',svg:'<path d="M10 24 Q0 24 2 16 Q4 9 12 11 Q14 2 25 3 Q34 1 38 9 Q46 5 52 11 Q60 13 58 20 Q57 24 50 24 Z" fill="#fff" opacity=".95"/>'},
  rainbow:{name:'彩虹',cat:'view',cost:350,w:230,air:true,vb:'0 0 200 100',svg:'<g fill="none" stroke-width="7" opacity=".75">'+['#ff6b6b','#ffb347','#ffe066','#7bd88f','#6cb5ff','#b28dff'].map((c,k)=>`<path d="M${10+k*7} 100 A${90-k*7} ${90-k*7} 0 0 1 ${190-k*7} 100" stroke="${c}"/>`).join('')+'</g>'},
};
const G_SEASONS={
  spring:{name:'春天・櫻花雨',cost:300,desc:'粉紅色的花瓣慢慢飄落'},
  autumn:{name:'秋天・楓葉季',cost:300,desc:'草地變成金黃色，楓葉隨風飄'},
  winter:{name:'冬天・下雪',cost:300,desc:'白雪覆蓋，雪花片片落下'},
  firefly:{name:'夏夜・螢火蟲',cost:400,desc:'天色變暗，螢火蟲在草地上發光'},
};
const itemSVG=(k,cls='')=>{const it=G_ITEMS[k]; return `<svg viewBox="${it.vb}" class="${cls}" aria-hidden="true">${it.svg}</svg>`;};

// ---------- 存檔資料與舊版轉換 ----------
function gInit(){
  if(PROG.seeds!==undefined) return;
  PROG.seeds=totalStars()*10; PROG.gItems=[]; PROG.gBag={}; PROG.gSeasons=[]; PROG.gSeason=null; PROG.gNext=1;
  const st=totalStars();
  // 以前靠星星解鎖的裝飾直接送給你，另外附一個花圃
  [[5,'feeder',14,10],[20,'bath',40,6],[45,'birdhouse',72,14],[80,'sakura',6,26],[130,'windmill',58,30],[200,'rainbow',30,62]]
    .forEach(([need,k,x,y])=>{ if(st>=need) PROG.gItems.push({id:PROG.gNext++,k,x,y}); });
  PROG.gItems.push({id:PROG.gNext++,k:'flowers',x:46,y:4},{id:PROG.gNext++,k:'mushroom',x:54,y:12});
  saveProg();
}
function addSeeds(n){ if(!n) return; gInit(); PROG.seeds+=n; saveProg(); }

// ---------- 畫面 ----------
let G={tab:'fac',edit:false,sel:null,timer:null,birds:[]};
function openGarden(){
  gInit(); G.edit=false; G.sel=null; $('trade').hidden=true;
  openSheet('garden'); gLayout(); gRender();
  const sc=$('yardScroll'), ground=PROG.gItems.filter(i=>!G_ITEMS[i.k]?.air);
  const cx=ground.length?ground.reduce((t,i)=>t+i.x,0)/ground.length:50;
  sc.scrollLeft=Math.max(0,cx/100*sc.scrollWidth-sc.clientWidth/2);
  clearInterval(G.timer); G.timer=setInterval(gTick,800);
}
function gLayout(){
  const sc=$('yardScroll'), h=sc.clientHeight||300, w=sc.clientWidth||360;
  const world=$('yard'); world.style.width=Math.max(900,w*3)+'px';
  world.style.setProperty('--ys',(h/320).toFixed(3));
}
addEventListener('resize',()=>{ if(!$('garden').hidden) gLayout(); });
function gRender(){
  const world=$('yard'), season=PROG.gSeason;
  world.className='yard-world'+(season?' season-'+season:'')+(G.edit?' editing':'');
  world.innerHTML='<span class="g-orb"></span><svg class="g-hills" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 40 L0 22 Q30 6 60 18 T120 14 T190 20 T250 10 T300 18 L300 40 Z" fill="var(--g-hill2)"/><path d="M0 40 L0 30 Q40 18 90 28 T180 26 T260 30 T300 26 L300 40 Z" fill="var(--g-hill1)"/></svg><div class="g-path"></div>';
  PROG.gItems.forEach(it=>{
    const def=G_ITEMS[it.k]; if(!def) return;
    const el=document.createElement('div'); el.className='g-item'+(G.sel===it.id?' sel':''); el.dataset.id=it.id;
    el.style.left=it.x+'%'; el.style.bottom=it.y+'%'; el.style.width=`calc(var(--ys) * ${def.w}px)`;
    el.style.zIndex=def.flat?1:def.air?2:Math.round(100-it.y);
    el.innerHTML=itemSVG(it.k); world.appendChild(el); gDrag(el,it);
  });
  const birds=PROG.aviary.slice(-80);
  G.birds=birds.map(t=>{ const b=document.createElement('span'); b.className='gb'; b.innerHTML=birdSVG(t);
    b.style.left=(30+RNG()*40)+'%'; b.style.bottom=(3+RNG()*30)+'%'; b.style.zIndex=200;
    b.onclick=()=>{ if(G.edit) return; chirp(t,.06); hop(b); }; world.appendChild(b); return b; });
  if(!birds.length) world.insertAdjacentHTML('beforeend','<div class="g-empty">還沒有鳥住進來。第一次過關就會孵出一隻！</div>');
  // 季節效果
  const fx=$('gFx'); fx.innerHTML=''; fx.className='g-fx'+(season?' fx-'+season:'');
  if(season&&!RM) for(let k=0;k<22;k++){ const s=document.createElement('i');
    s.style.left=(RNG()*100)+'%'; s.style.animationDelay=(-RNG()*8)+'s'; s.style.animationDuration=(season==='firefly'?3+RNG()*3:6+RNG()*5)+'s';
    if(season==='firefly') s.style.top=(45+RNG()*50)+'%'; fx.appendChild(s); }
  $('seedN').textContent=PROG.seeds;
  $('gEdit').textContent=G.edit?'完成擺設':'擺設'; $('gEdit').setAttribute('aria-pressed',G.edit);
  gBar();
}
function hop(b){ if(RM) return; b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); }
function gTick(){
  if($('garden').hidden){ clearInterval(G.timer); return; }
  const b=G.birds[rnd(G.birds.length)]; if(!b) return;
  const r=RNG();
  if(r<.35) hop(b);
  else{ let x,y;
    const ground=PROG.gItems.filter(it=>!G_ITEMS[it.k].air);
    if(r<.6&&ground.length){ const it=ground[rnd(ground.length)]; x=it.x+(RNG()-.5)*4; y=it.y+(G_ITEMS[it.k].flat?3:1); }
    else { x=3+RNG()*94; y=3+RNG()*30; }
    b.classList.toggle('flip',x<parseFloat(b.style.left)); b.style.left=x+'%'; b.style.bottom=y+'%'; }
}
function gBar(){
  const bar=$('gBar');
  if(G.edit){ const it=PROG.gItems.find(i=>i.id===G.sel);
    bar.innerHTML=it?`<span>已選：<b>${G_ITEMS[it.k].name}</b>，拖曳可以移動</span><button class="pill small" id="gStore">收回背包</button>`
      :'<span>拖曳物品就能移動位置。點一下可以選取。</span>';
    const s=$('gStore'); if(s) s.onclick=()=>{ PROG.gItems=PROG.gItems.filter(i=>i.id!==it.id); PROG.gBag[it.k]=(PROG.gBag[it.k]||0)+1; G.sel=null; saveProg(); gRender(); gList(); toast(`${G_ITEMS[it.k].name}收回背包了`); };
  } else bar.innerHTML=`<span>住了 <b>${PROG.aviary.length}</b> 隻鳥・擺了 <b>${PROG.gItems.length}</b> 樣東西。左右滑動可以逛整座鳥園。</span>`;
}
// 擺設模式：拖曳移動
function gDrag(el,it){
  el.addEventListener('pointerdown',e=>{
    if(!G.edit) return; e.preventDefault(); el.setPointerCapture(e.pointerId);
    const world=$('yard'), W=world.clientWidth, H=world.clientHeight, sx=e.clientX, sy=e.clientY, x0=it.x, y0=it.y, def=G_ITEMS[it.k];
    let moved=false;
    G.sel=it.id; document.querySelectorAll('.g-item.sel').forEach(n=>n.classList.remove('sel')); el.classList.add('sel'); gBar();
    const mv=ev=>{ const dx=(ev.clientX-sx)/W*100, dy=-(ev.clientY-sy)/H*100; if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>4) moved=true;
      it.x=Math.max(1,Math.min(97,x0+dx)); it.y=def.air?Math.max(48,Math.min(86,y0+dy)):Math.max(0,Math.min(38,y0+dy));
      el.style.left=it.x+'%'; el.style.bottom=it.y+'%'; if(!def.flat&&!def.air) el.style.zIndex=Math.round(100-it.y); };
    const up=()=>{ el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up); el.removeEventListener('pointercancel',up); if(moved) saveProg(); };
    el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
  });
}
function gPlace(k){
  const sc=$('yardScroll'), world=$('yard'), def=G_ITEMS[k];
  const x=Math.max(2,Math.min(95,(sc.scrollLeft+sc.clientWidth/2)/world.clientWidth*100-3));
  const it={id:PROG.gNext++,k,x,y:def.air?62+RNG()*14:6+RNG()*20};
  PROG.gItems.push(it); G.edit=true; G.sel=it.id; saveProg(); gRender();
}

// ---------- 商店、背包、季節 ----------
function openShop(){ gInit(); $('trade').hidden=true; gList(); openSheet('shop'); }
// 買到或從背包拿出來的東西：關掉商店、打開鳥園，放在畫面中間讓你拖曳
function placeFromShop(k){ closeSheet('shop'); if($('garden').hidden) openGarden(); gPlace(k); }
function gList(){
  $('shopSeeds').textContent=PROG.seeds; $('shopCoins').textContent=PROG.coins||0;
  document.querySelectorAll('.g-tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===G.tab));
  const box=$('gList'); box.innerHTML='';
  const card=(icon,name,sub,btn,disabled,fn)=>{ const d=document.createElement('div'); d.className='g-card';
    d.innerHTML=`<span class="g-ic">${icon}</span><b></b><span class="g-sub"></span><button class="pill small${disabled?'':' primary'}"></button>`;
    d.querySelector('b').textContent=name; d.querySelector('.g-sub').textContent=sub; const b=d.querySelector('button'); b.textContent=btn; b.disabled=disabled; b.onclick=fn; box.appendChild(d); };
  if(G.tab==='trade'){ tradeList(box); return; }
  if(G.tab==='bag'){
    const ks=Object.keys(PROG.gBag).filter(k=>PROG.gBag[k]>0);
    if(!ks.length){ box.innerHTML='<p class="note">背包是空的。在「擺設」模式選取物品，按「收回背包」就會放到這裡。</p>'; return; }
    ks.forEach(k=>card(itemSVG(k),G_ITEMS[k].name,`背包裡有 ${PROG.gBag[k]} 個`,'放進鳥園',false,()=>{ PROG.gBag[k]--; placeFromShop(k); }));
    return;
  }
  if(G.tab==='season'){
    Object.entries(G_SEASONS).forEach(([k,s])=>{ const own=PROG.gSeasons.includes(k), on=PROG.gSeason===k;
      card(`<span class="g-season s-${k}"></span>`,s.name,own?s.desc:`${s.cost} 顆種子・${s.desc}`,on?'使用中':own?'使用':'兌換',on||(!own&&PROG.seeds<s.cost),()=>{
        if(!own){ PROG.seeds-=s.cost; PROG.gSeasons.push(k); blip(880,.1,.04); toast(`兌換了「${s.name}」`); }
        PROG.gSeason=k; saveProg(); gRender(); gList(); toast(`鳥園換成「${s.name}」了`); }); });
    if(PROG.gSeason) card('<span class="g-season s-none"></span>','一般天氣','不使用季節效果','使用',false,()=>{ PROG.gSeason=null; saveProg(); gRender(); gList(); });
    return;
  }
  Object.entries(G_ITEMS).filter(([,it])=>it.cat===G.tab).forEach(([k,it])=>{
    const n=PROG.gItems.filter(i=>i.k===k).length+(PROG.gBag[k]||0);
    card(itemSVG(k),it.name,`${it.cost} 顆種子`+(n?`・已有 ${n} 個`:''),'兌換',PROG.seeds<it.cost,()=>{
      PROG.seeds-=it.cost; blip(880,.1,.04); toast(`兌換了${it.name}，拖曳可以調整位置`); placeFromShop(k); checkAch(); });
  });
}
document.querySelectorAll('.g-tab').forEach(b=>b.onclick=()=>{ G.tab=b.dataset.t; $('trade').hidden=true; gList(); });
$('gShop').onclick=openShop;
$('gEdit').onclick=()=>{ G.edit=!G.edit; if(!G.edit) G.sel=null; gRender(); };
