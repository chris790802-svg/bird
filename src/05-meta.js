// ===================== 05 進度、圖鑑、鳥園、成就 =====================
const $=id=>document.getElementById(id);
let PROG={max:1,stars:{},seen:[1],aviary:[],ach:{},daily:{},sound:true,c:{wins:0,shared:0,raceWins:0}};
try{const d=JSON.parse(localStorage.getItem('kp4-prog')); if(d&&d.max) PROG={...PROG,...d,c:{...PROG.c,...(d.c||{})}};}catch(e){}
function saveProg(){try{localStorage.setItem('kp4-prog',JSON.stringify(PROG))}catch(e){}}
const starHTML=k=>[1,2,3].map(i=>`<span class="${i<=k?'on':''}">★</span>`).join('');
const totalStars=()=>Object.values(PROG.stars).reduce((a,b)=>a+b,0)+Object.keys(PROG.daily).length;
const birdDot=(t,cls='')=>`<span class="dot ${cls}" data-bird="${t}"></span>`;

// ---------- 通知 ----------
function toast(text,bird){
  const el=document.createElement('div'); el.className='toast';
  el.innerHTML=(bird!==undefined?birdDot(bird):'')+'<span></span>'; el.lastChild.textContent=text;
  birdify(el); $('toasts').appendChild(el);
  setTimeout(()=>{el.classList.add('out'); setTimeout(()=>el.remove(),450);},3200);
}

// ---------- 彈出視窗共用 ----------
let lastFocus=null;
function openSheet(id){lastFocus=document.activeElement; $(id).hidden=false; const b=$(id).querySelector('button'); b&&b.focus();}
function closeSheet(id){$(id).hidden=true; if(lastFocus&&lastFocus.focus) lastFocus.focus();}
document.addEventListener('click',e=>{const c=e.target.closest('[data-close]'); if(c) closeSheet(c.dataset.close);});
document.querySelectorAll('.sheet').forEach(s=>{
  s.addEventListener('keydown',e=>{if(e.key==='Escape'&&s.id!=='intro'&&s.id!=='ad') closeSheet(s.id); e.stopPropagation();});
  s.addEventListener('click',e=>{if(e.target===s&&s.id!=='intro'&&s.id!=='tut'&&s.id!=='ad') closeSheet(s.id);});
});

// ---------- 新鳥登場 ----------
let introQueue=[], introDone=null;
function maybeIntro(P,then){
  const list=birdsIn(P).filter(t=>!PROG.seen.includes(t));
  if(!list.length){then&&then();return;}
  introQueue=list; introDone=then; showIntro();
}
function showIntro(){
  const t=introQueue.shift(), sp=SPECIES[t]; $('introKind').textContent='新的鳥登場'; $('introOk').textContent='知道了，開始';
  $('introBird').innerHTML=sp.svg; $('intro-title').textContent=sp.name+(sp.role?`（${sp.role}）`:'');
  $('introRule').textContent=(sp.place!==undefined?sp.place:t==='O'?'':'站在兩格之間：')+sp.rule;
  $('introEx').textContent=sp.ex?'例如 '+sp.ex:'';
  $('introFact').textContent=sp.fact;
  PROG.seen.push(t); saveProg(); chirp(t,.06);
  openSheet('intro');
}
$('introOk').onclick=()=>{ if(introQueue.length){showIntro();return;} closeSheet('intro'); const f=introDone; introDone=null; f&&f(); checkAch(); };

// ---------- 孵蛋 ----------
function hatch(force){
  const pool=PROG.seen.filter(t=>BIRD_VALUE[t]);
  const t=force||pool[rnd(pool.length)]||1;
  PROG.aviary.push(t);
  // 鳥園最多住 80 隻：太多時，先請最不值錢的規則鳥離開，收藏鳥和帝雉不會被請走
  while(PROG.aviary.length>80){ let at=-1,mv=99; PROG.aviary.forEach((b,i)=>{const v=BIRD_VALUE[b]||0; if(v&&v<mv){mv=v;at=i;}}); if(at<0) break; PROG.aviary.splice(at,1); }
  if(t==='E'&&!PROG.seen.includes('E')) PROG.seen.push('E');
  saveProg(); return t;
}

// ---------- 圖鑑 ----------
function openDex(){
  const firstCh=t=>{const c=CHAPTERS.find(c=>c.bird===t); return c?`${c.name}・第 ${c.from} 關登場`:t==='E'?'通過第 100 關':'';};
  const all=[...SPECIES_ORDER,...COLLECT_ORDER], got=all.filter(t=>PROG.seen.includes(t)).length;
  $('dexNote').textContent=`已經認識 ${got} / ${all.length} 種鳥。規則鳥在關卡裡遇到就會收進來；收藏鳥要在鳥園用孵出來的鳥交換。`;
  const card=(t,tag,lockText)=>{const sp=SPECIES[t], on=PROG.seen.includes(t);
    return `<div class="dex-item${on?'':' locked'}"><span class="pic">${sp.svg}</span><b>${on?sp.name:'？？？'}</b>${tag}`+
      (on?(sp.rule&&!isCollect(t)?`<p><b style="font-size:.8rem">規則：</b>${sp.rule}</p>`:'')+`<p>${sp.fact}</p>`:`<p>${lockText}</p>`)+'</div>';};
  let h='<h4 class="dex-h">規則鳥</h4><div class="dex-grid">'+SPECIES_ORDER.map(t=>card(t,`<span class="tag">${firstCh(t)}</span>`,'還沒遇過這種鳥。')).join('')+'</div>';
  RARITY_ORDER.forEach(r=>{ const ks=COLLECT_ORDER.filter(k=>COLLECT[k].rarity===r), n=ks.filter(k=>PROG.seen.includes(k)).length;
    h+=`<h4 class="dex-h">收藏鳥・${RARITY[r].name} <span>${n} / ${ks.length}・每隻 ${RARITY[r].cost} 鳥幣</span></h4><div class="dex-grid">`+
      ks.map(k=>card(k,rarityTag(k),`到鳥園的「換鳥」，用 ${costOf(k)} 鳥幣兌換。`)).join('')+'</div>'; });
  $('dexBody').innerHTML=h;
  openSheet('dex');
}

// ---------- 成就 ----------
const ACH=[
  {id:'first', name:'第一步', desc:'第一次過關', ok:()=>PROG.c.wins>=1},
  {id:'ch1',   name:'鸚鵡的好朋友', desc:'完成第一章', ok:()=>range(12).every(k=>PROG.stars[k+1])},
  {id:'star10',name:'星星收集家', desc:'拿到 10 個三星', ok:()=>Object.values(PROG.stars).filter(s=>s===3).length>=10},
  {id:'nohint8',name:'自己來就好', desc:'不用提示解完一題 8×8 以上', ok:()=>!!PROG.c.nohint8},
  {id:'nonote',name:'全靠腦袋', desc:'不開筆記解完一題 7×7 以上', ok:()=>!!PROG.c.nonote},
  {id:'fast',  name:'快手', desc:'3 分鐘內、不用提示解完一題 7×7 以上', ok:()=>!!PROG.c.fast},
  {id:'streak3',name:'每天來看看', desc:'每日一題連續 3 天', ok:()=>bestStreak()>=3},
  {id:'streak7',name:'一週不間斷', desc:'每日一題連續 7 天', ok:()=>bestStreak()>=7},
  {id:'weekend',name:'週末大盤', desc:'解開一次週末大盤', ok:()=>!!PROG.c.weekend},
  {id:'dex5',  name:'賞鳥新手', desc:'圖鑑收集 5 種鳥', ok:()=>PROG.seen.length>=5},
  {id:'dexall',name:'賞鳥達人', desc:'認識全部 14 種規則鳥', ok:()=>SPECIES_ORDER.every(t=>PROG.seen.includes(t))},
  {id:'coll1', name:'第一位新朋友', desc:'第一次用鳥換到收藏鳥', ok:()=>COLLECT_ORDER.some(k=>PROG.seen.includes(k))},
  {id:'coll8', name:'野鳥收藏家', desc:'收集 8 種收藏鳥', ok:()=>COLLECT_ORDER.filter(k=>PROG.seen.includes(k)).length>=8},
  {id:'legend',name:'傳說現身', desc:'換到一隻傳說等級的鳥', ok:()=>COLLECT_ORDER.some(k=>COLLECT[k].rarity==='legend'&&PROG.seen.includes(k))},
  {id:'collall',name:'鳥類收藏大全', desc:'收集全部 19 種收藏鳥', ok:()=>COLLECT_ORDER.every(k=>PROG.seen.includes(k))},
  {id:'yard20',name:'熱鬧的鳥園', desc:'鳥園裡住了 20 隻鳥', ok:()=>PROG.aviary.length>=20},
  {id:'deco10',name:'鳥園設計師', desc:'鳥園裡擺了 10 樣東西', ok:()=>(PROG.gItems||[]).length>=10},
  {id:'l50',   name:'過半', desc:'通過第 50 關', ok:()=>!!PROG.stars[50]},
  {id:'l100',  name:'帝雉現身', desc:'通過第 100 關', ok:()=>!!PROG.stars[100]},
  {id:'l150',  name:'候鳥的旅程', desc:'通過第 150 關', ok:()=>!!PROG.stars[150]},
  {id:'l200',  name:'百鳥齊鳴', desc:'通過第 200 關', ok:()=>!!PROG.stars[200]},
];
function checkAch(quiet){
  for(const a of ACH) if(!PROG.ach[a.id]&&a.ok()){ PROG.ach[a.id]=Date.now(); saveProg(); if(!quiet){ toast(`達成成就「${a.name}」`,2); blip(880,.12,.04); } }
}
function openAch(){
  const got=ACH.filter(a=>PROG.ach[a.id]).length;
  $('achBody').innerHTML=`<p class="note">已達成 ${got} / ${ACH.length}</p>`+ACH.map((a,k)=>`<div class="ach-item${PROG.ach[a.id]?' got':''}"><span class="medal">${PROG.ach[a.id]?'★':k+1}</span><div><b>${a.name}</b><span>${a.desc}</span></div></div>`).join('');
  openSheet('ach');
}

// ---------- 每日一題的連續天數 ----------
function streakNow(){ let k=todayKey(); if(!PROG.daily[k]) k=dayOffset(k,-1); let n=0; while(PROG.daily[k]){n++;k=dayOffset(k,-1);} return n; }
function bestStreak(){ const keys=Object.keys(PROG.daily).sort(); let best=0,cur=0,prev=null;
  for(const k of keys){ cur=(prev&&dayOffset(prev,1)===k)?cur+1:1; best=Math.max(best,cur); prev=k; } return best; }
