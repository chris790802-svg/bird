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
  s.addEventListener('keydown',e=>{if(e.key==='Escape'&&s.id!=='intro') closeSheet(s.id); e.stopPropagation();});
  s.addEventListener('click',e=>{if(e.target===s&&s.id!=='intro'&&s.id!=='tut') closeSheet(s.id);});
});

// ---------- 新鳥登場 ----------
let introQueue=[], introDone=null;
function maybeIntro(P,then){
  const list=birdsIn(P).filter(t=>!PROG.seen.includes(t));
  if(!list.length){then&&then();return;}
  introQueue=list; introDone=then; showIntro();
}
function showIntro(){
  const t=introQueue.shift(), sp=SPECIES[t];
  $('introBird').innerHTML=sp.svg; $('intro-title').textContent=sp.name+(sp.role?`（${sp.role}）`:'');
  $('introRule').textContent=(t==='O'?'':'站在兩格之間：')+sp.rule;
  $('introEx').textContent=sp.ex?'例如 '+sp.ex:'';
  $('introFact').textContent=sp.fact;
  PROG.seen.push(t); saveProg(); chirp(t,.06);
  openSheet('intro');
}
$('introOk').onclick=()=>{ if(introQueue.length){showIntro();return;} closeSheet('intro'); const f=introDone; introDone=null; f&&f(); checkAch(); };

// ---------- 孵蛋 ----------
function hatch(force){
  const pool=PROG.seen.filter(t=>t!=='E');
  const t=force||pool[rnd(pool.length)]||1;
  PROG.aviary.push(t); if(PROG.aviary.length>60) PROG.aviary.shift();
  if(t==='E'&&!PROG.seen.includes('E')) PROG.seen.push('E');
  saveProg(); return t;
}

// ---------- 圖鑑 ----------
function openDex(){
  const firstCh=t=>{const c=CHAPTERS.find(c=>c.bird===t); return c?`${c.name}・第 ${c.from} 關登場`:t==='E'?'通過第 100 關':'';};
  const got=SPECIES_ORDER.filter(t=>PROG.seen.includes(t)).length;
  $('dexNote').textContent=`已經認識 ${got} / ${SPECIES_ORDER.length} 種鳥。在關卡裡遇到新的鳥，就會收進圖鑑。`;
  $('dexBody').innerHTML=SPECIES_ORDER.map(t=>{const sp=SPECIES[t], on=PROG.seen.includes(t);
    return `<div class="dex-item${on?'':' locked'}"><span class="pic">${sp.svg}</span><b>${on?sp.name:'？？？'}</b><span class="tag">${firstCh(t)}</span>`+
      (on?`<p><b style="font-size:.8rem">規則：</b>${sp.rule}</p><p>${sp.fact}</p>`:'<p>還沒遇過這種鳥。</p>')+'</div>';}).join('');
  openSheet('dex');
}

// ---------- 鳥園 ----------
const DECOS=[
  {need:5,  name:'餵食台', svg:'<svg viewBox="0 0 40 50" width="46" style="left:8%;bottom:12%"><rect x="18" y="16" width="4" height="34" fill="#8a5a3b"/><path d="M4 16 L36 16 L32 10 L8 10 Z" fill="#c98b55"/><rect x="6" y="16" width="28" height="4" fill="#a26a3f"/><circle cx="14" cy="15" r="1.6" fill="#e9c46a"/><circle cx="20" cy="14.5" r="1.6" fill="#e9c46a"/><circle cx="26" cy="15" r="1.6" fill="#e9c46a"/></svg>'},
  {need:20, name:'鳥浴盆', svg:'<svg viewBox="0 0 50 34" width="58" style="left:44%;bottom:6%"><rect x="22" y="14" width="6" height="18" fill="#b8c4cf"/><ellipse cx="25" cy="12" rx="22" ry="7" fill="#d5dee6"/><ellipse cx="25" cy="10.5" rx="17" ry="4" fill="#7cc4f0"/><rect x="15" y="30" width="20" height="4" rx="2" fill="#b8c4cf"/></svg>'},
  {need:45, name:'小鳥屋', svg:'<svg viewBox="0 0 40 60" width="48" style="right:8%;bottom:12%"><rect x="18" y="30" width="4" height="30" fill="#8a5a3b"/><path d="M6 14 L20 2 L34 14 Z" fill="#e05d4b"/><rect x="9" y="14" width="22" height="18" fill="#f2d39b"/><circle cx="20" cy="22" r="4" fill="#5a3b26"/></svg>'},
  {need:80, name:'櫻花樹', svg:'<svg viewBox="0 0 80 90" width="110" style="left:-2%;bottom:20%"><rect x="36" y="50" width="8" height="40" fill="#7a5034"/><circle cx="40" cy="36" r="24" fill="#f7b8cc"/><circle cx="22" cy="44" r="15" fill="#f9c7d6"/><circle cx="58" cy="44" r="15" fill="#f4a9c0"/><circle cx="40" cy="20" r="13" fill="#fbd3df"/></svg>'},
  {need:130,name:'風車',   svg:'<svg viewBox="0 0 50 70" width="54" style="right:30%;bottom:30%"><rect x="23" y="26" width="4" height="44" fill="#9aa7b4"/><g style="transform-origin:25px 25px;animation:spin 6s linear infinite"><path d="M25 25 L25 3 L33 18 Z" fill="#ff8f4f"/><path d="M25 25 L47 25 L32 33 Z" fill="#ffd93a"/><path d="M25 25 L25 47 L17 32 Z" fill="#7fd8c2"/><path d="M25 25 L3 25 L18 17 Z" fill="#3b93e6"/></g></svg><style>@keyframes spin{to{transform:rotate(360deg)}}</style>'},
  {need:200,name:'彩虹',   svg:'<svg viewBox="0 0 200 100" width="300" style="left:8%;top:2%;opacity:.7"><g fill="none" stroke-width="7"><path d="M10 100 A90 90 0 0 1 190 100" stroke="#ff6b6b"/><path d="M17 100 A83 83 0 0 1 183 100" stroke="#ffb347"/><path d="M24 100 A76 76 0 0 1 176 100" stroke="#ffe066"/><path d="M31 100 A69 69 0 0 1 169 100" stroke="#7bd88f"/><path d="M38 100 A62 62 0 0 1 162 100" stroke="#6cb5ff"/><path d="M45 100 A55 55 0 0 1 155 100" stroke="#b28dff"/></g></svg>'},
];
let gardenTimer=null;
function openGarden(){
  const st=totalStars(), yard=$('yard');
  $('gardenNote').textContent=`每次第一次過關、或解開每日一題，就會孵出一隻鳥住進來。現在有 ${PROG.aviary.length} 隻，累積 ${st} 顆星。`;
  yard.innerHTML='<span class="sun"></span>'+DECOS.filter(d=>st>=d.need).map(d=>d.svg.replace('<svg ','<svg class="deco" ')).join('');
  if(!PROG.aviary.length) yard.insertAdjacentHTML('beforeend','<div class="empty">還沒有鳥住進來。去過一關看看吧！</div>');
  const birds=PROG.aviary.slice(-40).map(t=>{const b=document.createElement('span'); b.className='gb'; b.innerHTML=birdSVG(t);
    b.style.left=(4+RNG()*86)+'%'; b.style.bottom=(4+RNG()*30)+'%'; b.dataset.t=t;
    b.onclick=()=>{chirp(t,.06); b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop');};
    yard.appendChild(b); return b;});
  $('decoList').innerHTML=DECOS.map(d=>`<div class="${st>=d.need?'':'off'}"><b>${d.name}</b><span>${st>=d.need?'已放進鳥園':`需要 ${d.need} 顆星`}</span></div>`).join('');
  clearInterval(gardenTimer);
  gardenTimer=setInterval(()=>{ if($('garden').hidden){clearInterval(gardenTimer);return;}
    const b=birds[rnd(birds.length)]; if(!b) return;
    if(RNG()<.5){ b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); }
    else { const x=4+RNG()*86, old=parseFloat(b.style.left); b.classList.toggle('flip',x<old); b.style.left=x+'%'; }
  },700);
  openSheet('garden');
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
  {id:'dexall',name:'賞鳥達人', desc:'圖鑑收集全部 9 種鳥', ok:()=>SPECIES_ORDER.every(t=>PROG.seen.includes(t))},
  {id:'yard20',name:'熱鬧的鳥園', desc:'鳥園裡住了 20 隻鳥', ok:()=>PROG.aviary.length>=20},
  {id:'l50',   name:'過半', desc:'通過第 50 關', ok:()=>!!PROG.stars[50]},
  {id:'l100',  name:'帝雉現身', desc:'通過第 100 關', ok:()=>!!PROG.stars[100]},
];
function checkAch(){
  for(const a of ACH) if(!PROG.ach[a.id]&&a.ok()){ PROG.ach[a.id]=Date.now(); saveProg(); toast(`達成成就「${a.name}」`,2); blip(880,.12,.04); }
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
