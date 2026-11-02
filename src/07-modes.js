// ===================== 07 模式：闖關、每日、自由、工作室、競速 =====================
const hintTxt=()=>S.hints?`提示 ${S.hints} 次`:'沒用提示';
function withLoading(n,text,fn){
  if(n<9){fn();return;}
  $('loadingText').textContent=text||'出題中…'; $('loading').hidden=false; birdify($('loading'));
  setTimeout(()=>{try{fn();}finally{$('loading').hidden=true;}},40);
}
function startPuzzle(P,mode){ S.mode=mode; setPuzzle(P); resetPlay(); syncPanels(); maybeIntro(S.P,()=>{ if(!S.vals.some((v,i)=>v&&!S.P.givens[i])) S.t0=Date.now(); }); }
async function copyText(t,msgEl){
  let ok=false; try{await navigator.clipboard.writeText(t); ok=true;}catch(e){}
  if(msgEl) msgEl.textContent=ok?'已複製':'無法自動複製，請手動選取：'+t;
  return ok;
}
function seg(el,opts,get,set){
  el.innerHTML=''; opts.forEach(([val,label])=>{const b=document.createElement('button'); b.textContent=label;
    b.setAttribute('aria-pressed',get()===val); b.onclick=()=>{set(val); el.querySelectorAll('button').forEach((x,k)=>x.setAttribute('aria-pressed',opts[k][0]===val));}; el.appendChild(b);});
}
const CHIP_BIRDS=[1,2,3,4,5,'O',6,7];
function chips(el,set,onChange){
  el.innerHTML=''; CHIP_BIRDS.forEach(t=>{const b=document.createElement('button'); b.innerHTML=birdDot(t)+SPECIES[t].name;
    const fixed=t===1; b.disabled=fixed; b.setAttribute('aria-pressed',fixed||set.has(t));
    if(!fixed) b.onclick=()=>{set.has(t)?set.delete(t):set.add(t); b.setAttribute('aria-pressed',set.has(t)); onChange&&onChange();};
    el.appendChild(b);}); birdify(el);
}
const randSeed=()=>(Math.random()*4294967296)>>>0;
function cfgCode(cfg,seed,sol){return {n:cfg.n,tit:cfg.birds.has(2),owl:cfg.birds.has('O'),partial:[3,4,5,6,7].filter(t=>cfg.birds.has(t)),diff:cfg.diff,seed,sol}}

// ---------- 闖關 ----------
function startLevel(L){
  L=Math.max(1,Math.min(LEVELS,L)); S.levelNo=L; // 所有關卡都可以直接選
  const sp=levelSpec(L);
  withLoading(sp.n,L===100?'帝雉之關準備中，請稍等幾秒…':'出題中…',()=>startPuzzle(generateLevel(L),'level'));
}
function openMap(){
  $('mapBody').innerHTML=CHAPTERS.map((c,ci)=>`<div class="chap"><h4>${birdDot(c.bird)}第 ${ci+1} 章・${c.name}<span>第 ${c.from}–${c.to} 關</span></h4><div class="lvgrid">`+
    range(c.to-c.from+1).map(k=>{const L=c.from+k, lock=false;
      return `<button class="lv${L===c.to?' boss':''}${S.mode==='level'&&L===S.levelNo?' cur':''}" data-l="${L}" ${lock?'disabled':''} aria-label="第 ${L} 關${lock?'，未解鎖':''}"><b>${L}</b><span class="stars">${starHTML(PROG.stars[L]||0)}</span></button>`;}).join('')+'</div></div>').join('');
  birdify($('mapBody'));
  $('mapBody').querySelectorAll('.lv').forEach(b=>b.onclick=()=>{closeSheet('map'); setMenu(false); switchTo('level',()=>startLevel(+b.dataset.l));});
  openSheet('map'); const cur=$('mapBody').querySelector('.cur'); cur&&cur.scrollIntoView({block:'center'});
}
$('mapBtn').onclick=openMap;
$('prevLv').onclick=()=>startLevel(S.levelNo-1);
$('nextLv').onclick=()=>startLevel(S.levelNo+1);

// ---------- 每日一題 ----------
function startDaily(){
  const key=todayKey();
  if(loadMode('daily')&&S.P.label&&S.P.label.key===key){ buildBoard(); render(); $('win').hidden=!S.done; syncPanels(); return; }
  const sp=dailySpec(key);
  withLoading(sp.n,'今天的週末大盤準備中…',()=>startPuzzle(generateDaily(key),'daily'));
}
const WD='日一二三四五六';
function dailyInfo(){
  const key=todayKey(), d=new Date(key+'T00:00:00Z'), sp=dailySpec(key), rec=PROG.daily[key];
  $('dailyKind').textContent=sp.weekend?'週末大盤':'每日一題';
  $('dailyDate').textContent=`${d.getUTCMonth()+1} 月 ${d.getUTCDate()} 日（星期${WD[d.getUTCDay()]}）`;
  $('streakN').textContent=streakNow();
  const birds=birdsIn(S.mode==='daily'&&S.P?S.P:{h:[],v:[],owls:[]}).filter(t=>t!==1&&t!==2).map(t=>SPECIES[t].name);
  $('dailyNote').textContent=rec?`今天已經解開了，最好成績 ${fmt(rec.t)}，${rec.h?`提示 ${rec.h} 次`:'沒用提示'}。明天台北時間午夜會換新題。`
    :`今天是 ${sp.n}×${sp.n}${birds.length?'，主角是'+listJoin(birds):''}。全世界都是同一題，每天台北時間午夜換新。`;
  $('shareDaily').hidden=!rec;
}
$('shareDaily').onclick=()=>{
  const key=todayKey(), rec=PROG.daily[key]; if(!rec) return; const sp=dailySpec(key);
  copyText(`鳥巢數獨 ${sp.weekend?'週末大盤':'每日一題'} ${key}\n用時 ${fmt(rec.t)} ${'★'.repeat(rec.st||starsFor(rec.h))}\n連續 ${streakNow()} 天`,$('shareMsg'));
};

// 排行榜：存在 artifact 的共用資料庫，每人一份文件 board/<自己的 id>
let DBP=null, USERP=null, leaderUnsub=null;
const getDB=()=>DBP||(DBP=(window.claude&&claude.use)?claude.use('db').catch(()=>null):Promise.resolve(null));
const getUser=()=>USERP||(USERP=(window.claude&&claude.use)?claude.use('user').catch(()=>null):Promise.resolve(null));
async function loadLeader(){
  const db=await getDB(); if(!db){ $('leader').hidden=true; return; }
  $('leader').hidden=false; $('leaderNote').textContent='讀取中…';
  const key=todayKey();
  const timer=setTimeout(()=>{$('leaderNote').textContent='暫時讀不到排行';},10000);
  try{
    const snap=await db.collection('board').get(); clearTimeout(timer);
    const user=await getUser(); const me=user?await user.id():null;
    const rows=[]; snap.docs.forEach(d=>{const x=d.data(); const r=x&&x.d&&x.d[key]; if(r&&typeof r.t==='number') rows.push({id:d.id,t:r.t,h:r.h|0});});
    rows.sort((a,b)=>a.h-b.h||a.t-b.t);
    const top=rows.slice(0,10); let names={};
    if(user&&top.length){ try{names=await user.profiles(top.map(r=>r.id));}catch(e){} }
    $('leaderList').innerHTML='';
    top.forEach(r=>{const li=document.createElement('li'); if(r.id===me) li.className='me';
      const nm=document.createElement('span'); nm.textContent=r.id===me?'你':((names[r.id]&&names[r.id].name)||'玩家');
      const t=document.createElement('span'); t.className='t'; t.textContent=fmt(r.t)+(r.h?`（提示 ${r.h}）`:'');
      li.append(nm,t); $('leaderList').appendChild(li);});
    $('leaderNote').textContent=rows.length?`今天有 ${rows.length} 人解開`:'還沒有人解開，搶第一！';
  }catch(e){ clearTimeout(timer); $('leaderNote').textContent='暫時讀不到排行'; }
}
async function postDaily(key,t,h){
  try{ const db=await getDB(), user=await getUser(); if(!db||!user) return; const id=await user.id(); if(!id) return;
    const ref=db.collection('board').doc(id); const cur=(await ref.get()).data()||{}; const d=cur.d||{};
    const old=d[key]; if(old&&(old.h<h||(old.h===h&&old.t<=t))) return;
    d[key]={t,h}; await ref.set({d}); loadLeader();
  }catch(e){}
}

// ---------- 自由練習 ----------
let FREE={n:7,diff:1,birds:new Set([2,3])};
try{const d=JSON.parse(localStorage.getItem('kp4-free')); if(d) FREE={n:d.n,diff:d.diff,birds:new Set(d.birds)};}catch(e){}
const saveFree=()=>{try{localStorage.setItem('kp4-free',JSON.stringify({n:FREE.n,diff:FREE.diff,birds:[...FREE.birds]}))}catch(e){}};
seg($('freeSize'),[[6,'6×6'],[7,'7×7'],[8,'8×8'],[9,'9×9']],()=>FREE.n,v=>{FREE.n=v;saveFree();});
seg($('freeDiff'),DIFFS.map((d,k)=>[k,d.name]),()=>FREE.diff,v=>{FREE.diff=v;saveFree();});
chips($('freeBirds'),FREE.birds,saveFree);
function freeNew(){
  const o=cfgCode(FREE,randSeed());
  withLoading(o.n,'出題中…',()=>{ const P=puzzleFromCode(o); S.extra={code:P.label.code}; startPuzzle(P,'free'); });
}
$('freeGo').onclick=()=>{ setMenu(false); switchTo('free',freeNew,true); };
$('freeCopy').onclick=async()=>{ const c=S.mode==='free'&&S.extra&&S.extra.code; if(!c) return; if(await copyText(c,$('freeMsg'))){PROG.c.shared++;saveProg();checkAch();} };

// ---------- 工作室 ----------
let STUDIO={n:6,diff:1,birds:new Set([2])};
seg($('studioSize'),[[5,'5×5'],[6,'6×6'],[7,'7×7'],[8,'8×8'],[9,'9×9']],()=>STUDIO.n,v=>{STUDIO.n=v; if(S.editing) startEdit(true);});
seg($('studioDiff'),DIFFS.map((d,k)=>[k,d.name]),()=>STUDIO.diff,v=>{STUDIO.diff=v;});
chips($('studioBirds'),STUDIO.birds);
function startEdit(fresh){
  if(S.mode==='race') raceLeave();
  save(); S.mode='studio'; S.editing=true; hideHint(); $('win').hidden=true;
  N=STUDIO.n; NN=N*N;
  let v=null; if(!fresh){try{const d=JSON.parse(localStorage.getItem('kp4-edit')); if(d&&d.n===N) v=d.v;}catch(e){}}
  S.editVals=v||Array(NN).fill(0); S.sel=0; buildBoard(); renderEdit(); syncPanels();
  $('studioMsg').textContent='用下方數字鍵把答案填滿。紅色代表同列或同行重複了。';
}
$('studioEdit').onclick=()=>startEdit(false);
$('studioRand').onclick=()=>{ if(!S.editing) startEdit(false); S.editVals=randomLatin(N); renderEdit(); saveEdit(); };
$('studioClear').onclick=()=>{ if(!S.editing) startEdit(false); S.editVals=Array(NN).fill(0); renderEdit(); saveEdit(); };
$('studioMake').onclick=()=>{
  if(!S.editing){ $('studioMsg').textContent='先按「開始填答案」，把答案填好再產生題目。'; return; }
  if(!isLatin(S.editVals,N)){ $('studioMsg').textContent='答案還沒填完，或有數字在同一列、同一行重複了（紅色的格子）。'; return; }
  const o=cfgCode(STUDIO,randSeed(),S.editVals.slice());
  S.editing=false;
  withLoading(o.n,'幫你放鳥中…',()=>{ const P=puzzleFromCode(o); S.extra={code:P.label.code}; startPuzzle(P,'studio'); showStudioCode(); });
};
function showStudioCode(){
  const c=S.extra&&S.extra.code; if(!c) return;
  const m=$('studioMsg'); m.innerHTML=''; m.append('題目做好了！代碼 ');
  const code=document.createElement('code'); code.textContent=c; const b=document.createElement('button'); b.className='pill small'; b.textContent='複製代碼';
  b.onclick=async()=>{ if(await copyText(c)){ b.textContent='已複製'; PROG.c.shared++; saveProg(); checkAch(); } };
  m.append(code,' ',b);
}
$('codeGo').onclick=()=>{
  const o=decodeCode($('codeIn').value);
  if(!o){ $('codeMsg').textContent='這個代碼看不懂，請確認有沒有打錯字。'; return; }
  $('codeMsg').textContent=`${o.n}×${o.n}・${DIFFS[o.diff].name}${o.sol?'・手作題':''}`;
  switchTo('studio',()=>withLoading(o.n,'出題中…',()=>{ const P=puzzleFromCode(o); S.extra={code:P.label.code}; startPuzzle(P,'studio'); }),true);
};

// ---------- 雙人競速（room：同時開著頁面的人） ----------
let ROOMP=null, RACE=null, NAMES={};
const getRoom=()=>ROOMP||(ROOMP=(window.claude&&claude.use)?claude.use('room').catch(()=>null):Promise.resolve(null));
function normRoom(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12)}
async function raceJoin(code){
  code=normRoom(code); if(code.length<2){ $('raceMsg').textContent='房間代碼至少要 2 個英文字母或數字。'; return; }
  $('raceMsg').textContent='連線中…';
  const room=await getRoom();
  if(!room){ $('raceMsg').textContent='這裡沒辦法即時連線。可以改用「自由練習」產生題目代碼，和朋友玩同一題再比時間。'; return; }
  let r; try{ r=await room.join('race-'+code); }catch(e){ $('raceMsg').textContent='加入房間失敗，請稍後再試。'; return; }
  if(S.mode!=='race'){ save(); }
  RACE={code,r,round:1,start:null,ready:false,unsub:null,cd:null};
  RACE.unsub=r.onPeers(()=>{renderRacers(); checkRound(); checkStart();},()=>{$('raceMsg').textContent='和房間的連線中斷了。';});
  newRound(1);
  $('raceMsg').textContent=''; $('roomName').textContent=code.toUpperCase();
  syncPanels();
}
function newRound(round){
  RACE.round=round; RACE.start=null; RACE.ready=false; clearInterval(RACE.cd);
  const P=racePuzzle(RACE.code+':'+round); S.mode='race'; setPuzzle(P); resetPlay();
  S.paused=true; S.elapsed=0;
  showRaceCover('等雙方都按「準備好了」');
  RACE.r.presence({round,ready:false,at:null,filled:0,done:null}).catch(()=>{});
  $('raceReady').disabled=false; $('raceReady').textContent='準備好了'; renderRacers();
}
function showRaceCover(t){ $('countdown').hidden=false; $('cdNum').textContent=t; $('cdNum').style.fontSize=t.length>3?'1.1rem':''; }
function viewers(){return RACE?RACE.r.peers().filter(p=>p.kind==='viewer'):[]}
async function resolveNames(ids){
  const need=ids.filter(id=>id&&!(id in NAMES)); if(!need.length) return;
  need.forEach(id=>NAMES[id]='');
  const u=await getUser(); if(!u) return;
  try{const ps=await u.profiles(need); for(const id of need) NAMES[id]=(ps[id]&&ps[id].name)||'';}catch(e){}
  renderRacers();
}
function renderRacers(){
  if(!RACE) return; const ps=viewers(); resolveNames(ps.map(p=>p.by));
  const ul=$('racers'); ul.innerHTML='';
  ps.forEach((p,k)=>{ const pr=p.presence||{}, li=document.createElement('li'); if(p.isMe&&p.sameTab) li.className='me';
    const nm=document.createElement('span'); nm.className='nm'; nm.textContent=p.isMe&&p.sameTab?'你':(NAMES[p.by]||`玩家 ${k+1}`);
    const bar=document.createElement('span'); bar.className='bar'; bar.innerHTML=`<i style="width:${Math.min(100,(pr.filled||0)/NN*100)}%"></i>`;
    const st=document.createElement('span'); st.className='st'; st.textContent=pr.done!=null?fmt(pr.done):pr.round!==RACE.round?'換題中':pr.ready?'準備好了':'等待中';
    li.append(nm,bar,st); ul.appendChild(li); });
  $('raceStatus').textContent=ps.length<2?'等朋友用同一個代碼加入…':'';
}
function checkRound(){ const hi=Math.max(...viewers().map(p=>(p.presence&&p.presence.round)|0)); if(hi>RACE.round) newRound(hi); }
function checkStart(){
  if(!RACE||RACE.start) return; const ps=viewers().filter(p=>(p.presence&&p.presence.round)===RACE.round);
  if(ps.length<2||!ps.every(p=>p.presence.ready&&typeof p.presence.at==='number')) return;
  RACE.start=Math.max(...ps.map(p=>p.presence.at))+3500;
  clearInterval(RACE.cd);
  RACE.cd=setInterval(()=>{ const left=RACE.start-Date.now();
    if(left>0){ showRaceCover(String(Math.ceil(left/1000))); if(left%1000<120) blip(660,.06,.04); return; }
    clearInterval(RACE.cd); $('countdown').hidden=true; S.paused=false; S.t0=RACE.start; render(); blip(990,.15,.05); },100);
}
function raceProgress(){ if(!RACE) return; const c=S.vals.filter((v,i)=>v&&v===S.P.sol[i]).length; RACE.r.presence({filled:c}).catch(()=>{}); }
async function raceLeave(){ if(!RACE) return; clearInterval(RACE.cd); try{RACE.unsub&&RACE.unsub(); await RACE.r.leave();}catch(e){} RACE=null; $('countdown').hidden=true; S.paused=false; syncPanels(); }
$('roomJoin').onclick=()=>raceJoin($('roomIn').value);
$('roomNew').onclick=()=>{ const c=Math.random().toString(36).slice(2,7); $('roomIn').value=c.toUpperCase(); raceJoin(c); };
$('roomCopy').onclick=()=>RACE&&copyText(RACE.code.toUpperCase(),$('raceMsg'));
$('roomLeave').onclick=()=>{ raceLeave(); switchTo('level'); };
$('raceReady').onclick=()=>{ if(!RACE) return; RACE.ready=true; $('raceReady').disabled=true; RACE.r.presence({ready:true,at:Date.now()}).catch(()=>{}); };

// ---------- 各模式的設定 ----------
const MODES={
  level:{start:()=>startLevel(PROG.max),newText:'重玩',onNew:()=>startLevel(S.levelNo),next:()=>startLevel(S.levelNo+1),
    win(){ const L=S.levelNo, st=starsFor(S.hints), first=!PROG.stars[L], gain=Math.max(0,st-(PROG.stars[L]||0))*10;
      PROG.stars[L]=Math.max(PROG.stars[L]||0,st); PROG.max=Math.max(PROG.max,Math.min(LEVELS,L+1));
      const hatched=first?hatch(L===100?'E':undefined):undefined;
      return {title:L===100?'全部 100 關破關！':`第 ${L} 關過關！`,stars:st,msg:`用時 ${fmt(S.elapsed)}・${hintTxt()}`+(st<3?'・不用提示可以拿三顆星':''),
        hatched,seeds:gain,next:L<LEVELS,againText:'再玩一次'}; }},
  daily:{start:startDaily,newText:'重玩',onNew:()=>{ resetPlay(); },
    win(){ const key=S.P.label.key, st=starsFor(S.hints), rec=PROG.daily[key], first=!rec;
      if(!rec||S.hints<rec.h||(S.hints===rec.h&&S.elapsed<rec.t)) PROG.daily[key]={t:S.elapsed,h:S.hints,st};
      if(S.P.label.weekend) PROG.c.weekend=1;
      const hatched=first?hatch():undefined; saveProg(); postDaily(key,S.elapsed,S.hints);
      return {title:S.P.label.weekend?'週末大盤完成！':'今天的題目解開了！',stars:st,msg:`用時 ${fmt(S.elapsed)}・${hintTxt()}・連續 ${streakNow()} 天`,hatched,seeds:first?40:0,againText:'再玩一次'}; }},
  free:{start:freeNew,newText:'新局',onNew:freeNew,
    win(){ return {title:'解開了！',msg:`${N}×${N}・${DIFFS[FREE.diff].name}・用時 ${fmt(S.elapsed)}・${hintTxt()}`,seeds:5,againText:'再出一題'}; }},
  studio:{start:()=>startEdit(false),newText:'重玩',onNew:()=>{ if(S.editing) return; resetPlay(); },
    win(){ return {title:'解開了！',msg:`用時 ${fmt(S.elapsed)}・${hintTxt()}。把代碼分享給朋友，看誰比較快！`,againText:'再玩一次'}; }},
  race:{start:()=>{},newText:'重玩',onNew:()=>{},
    win(){ const others=viewers().filter(p=>!(p.isMe&&p.sameTab)&&p.presence&&p.presence.round===RACE.round&&p.presence.done!=null);
      const firstPlace=!others.length; if(firstPlace) PROG.c.raceWins++;
      RACE&&RACE.r.presence({done:S.elapsed,filled:NN}).catch(()=>{});
      return {title:firstPlace?'你第一個解完！':'解完了！',msg:`用時 ${fmt(S.elapsed)}・${hintTxt()}`+(firstPlace?'':'，對手比你快一點'),againText:'再比一場'}; }},
};
$('new').onclick=()=>MODES[S.mode].onNew();
$('again').onclick=()=>{ $('win').hidden=true;
  if(S.mode==='race'){ if(RACE) newRound(RACE.round+1); return; }
  if(S.mode==='free') return freeNew();
  if(S.mode==='level') return startLevel(S.levelNo);
  resetPlay(); };
$('nextBtn').onclick=()=>{ $('win').hidden=true; MODES[S.mode].next&&MODES[S.mode].next(); };

// ---------- 切換模式 ----------
function switchTo(m,then,forceFresh){
  if(S.mode==='race'&&m!=='race') raceLeave();
  if(S.P&&!S.editing) save();
  hideHint(); $('win').hidden=true; $('countdown').hidden=true; S.paused=false; S.editing=false;
  if(then){ S.mode=m; then(); syncPanels(); return; }
  if(m==='daily'){ S.mode='daily'; startDaily(); syncPanels(); return; }
  if(m==='race'){ S.mode='race'; if(!RACE){ S.paused=true; syncPanels(); showRaceCover('加入房間後開始'); } return; }
  if(!forceFresh&&loadMode(m)){ buildBoard(); render(); $('win').hidden=!S.done; syncPanels(); return; }
  S.mode=m; MODES[m].start(); syncPanels();
}
document.querySelectorAll('.tabs .tab').forEach(b=>b.onclick=()=>{ if(S.mode===b.dataset.mode&&!(S.mode==='studio'&&S.editing)) return; switchTo(b.dataset.mode); });

const MODE_NAME={level:'闖關',daily:'每日一題',free:'自由練習',studio:'工作室',race:'雙人競速'};
function syncPanels(){
  const m=S.mode;
  let sub=MODE_NAME[m];
  if(m==='level'){ const sp=levelSpec(S.levelNo); sub=`第 ${S.levelNo} 關・${CHAPTERS[sp.chapter-1].name}`+(PROG.stars[S.levelNo]?' '+'★'.repeat(PROG.stars[S.levelNo]):''); }
  else if(m==='daily'){ const k=todayKey(); sub=`${dailySpec(k).weekend?'週末大盤':'每日一題'}・${+k.slice(5,7)}/${+k.slice(8)}`; }
  else if(m==='free'&&S.P) sub=`自由練習・${N}×${N}・${DIFFS[FREE.diff].name}`;
  $('hudSub').textContent=sub;
  document.querySelectorAll('.tabs .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.mode===m));
  ['level','daily','free','studio','race'].forEach(k=>$('panel-'+k).hidden=k!==m);
  $('new').textContent=MODES[m].newText; $('new').disabled=m==='race';
  $('hint').disabled=m==='race';
  if(m==='level'){ const L=S.levelNo, sp=levelSpec(L), ch=CHAPTERS[sp.chapter-1];
    $('stageCh').textContent=`第 ${sp.chapter} 章・${ch.name}`; $('stageNo').textContent=L;
    $('stageTag').textContent=`${sp.n}×${sp.n}`+(L===ch.to?'・本章最終關':''); $('stageStars').innerHTML=PROG.stars[L]?starHTML(PROG.stars[L]):'';
    $('prevLv').disabled=L<=1; $('nextLv').disabled=L>=LEVELS;
    const done=Object.keys(PROG.stars).length; $('progN').textContent=done; $('progBar').style.width=done/LEVELS*100+'%'; }
  if(m==='daily'){ dailyInfo(); loadLeader(); }
  if(m==='free') $('freeCode').textContent=S.extra&&S.extra.code&&S.P&&S.P.label.kind==='custom'?S.extra.code:'—';
  if(m==='race'){ $('raceOff').hidden=!!RACE; $('raceOn').hidden=!RACE; }
}
