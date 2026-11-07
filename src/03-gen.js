// ===================== 03 出題：關卡、每日一題、題目代碼 =====================
// spec：{n, tit, partial:[鳥代號], owl, keep(開局給數字比例), density, minKeep}
function buildPuzzle(spec,givenSol){
  const n=spec.n, NN=n*n, dens=spec.density??0.75, tit=!!spec.tit, partial=spec.partial||[];
  const P={n,tit};
  // 0. 答案：有鳥巢或斜線時，要先排好鳥巢再填答案（填不出來就換一組鳥巢重來）
  let sol=null;
  if(givenSol) sol=givenSol.slice();
  else if(spec.reg||spec.diag){
    const hasBox=[4,6,8,9].includes(n);
    P.diag=!!spec.diag; P.h=range(n).map(()=>Array(n-1).fill(0)); P.v=range(n-1).map(()=>Array(n).fill(0));
    if(spec.reg&&!hasBox){ // 7×7：隨機長出鳥巢再填答案，填不出來就換一組
      for(let t=0;t<30&&!sol;t++){ P.reg=growRegions(n); prep(P); sol=fillUnits(P); }
    }
    if(!sol){
      P.reg=spec.reg?baseRegions(n):undefined; prep(P);
      for(let t=0;t<60&&!sol;t++) sol=fillUnits(P);
      if(!sol) throw new Error('fill failed');
      if(spec.reg&&hasBox) P.reg=shapeRegions(P.reg,sol,n);
    }
  } else sol=randomLatin(n);
  P.sol=sol;
  const pick=(a,b)=>{const d=fullBird(a,b,tit); if(d) return d;
    const opts=partial.filter(t=>holds(t,a,b,n)); return opts.length&&RNG()<dens?opts[rnd(opts.length)]:0;};
  P.h=range(n).map(r=>range(n-1).map(c=>pick(sol[r*n+c],sol[r*n+c+1])));
  P.v=range(n-1).map(r=>range(n).map(c=>pick(sol[r*n+c],sol[(r+1)*n+c])));
  // 部分線索的候選清單（on=false 表示被拿掉）
  const allOwls=[], allGt=[], allEgg=[], allCg=[];
  if(spec.owl) for(let r=0;r<n-1;r++) for(let c=0;c<n-1;c++) if(RNG()<0.5)
    allOwls.push({r,c,s:sol[r*n+c]+sol[r*n+c+1]+sol[(r+1)*n+c]+sol[(r+1)*n+c+1],on:true});
  if(spec.gt){ // 樹鵲只站在沒有其他鳥的邊上
    for(let r=0;r<n;r++) for(let c=0;c<n-1;c++) if(!P.h[r][c]&&RNG()<spec.gt){const a=r*n+c,b=a+1; allGt.push({p:sol[a]>sol[b]?[a,b]:[b,a],on:true});}
    for(let r=0;r<n-1;r++) for(let c=0;c<n;c++) if(!P.v[r][c]&&RNG()<spec.gt){const a=r*n+c,b=a+n; allGt.push({p:sol[a]>sol[b]?[a,b]:[b,a],on:true});}
  }
  if(spec.egg) for(let i=0;i<NN;i++) if(RNG()<spec.egg) allEgg.push({i,e:sol[i]%2?1:2,on:true});
  if(spec.cage){ // 鳥群：2 到 4 格連在一起、數字都不一樣
    const used=new Set(), nbs=i=>{const r=i/n|0,c=i%n,o=[]; if(c>0)o.push(i-1); if(c<n-1)o.push(i+1); if(r>0)o.push(i-n); if(r<n-1)o.push(i+n); return o;};
    for(const st of shuffle(range(NN))){
      if(used.has(st)||RNG()>spec.cage) continue;
      const size=2+rnd(3), cells=[st], vals=new Set([sol[st]]);
      while(cells.length<size){ const fr=shuffle(cells.flatMap(nbs).filter(j=>!used.has(j)&&!cells.includes(j)&&!vals.has(sol[j])));
        if(!fr.length) break; cells.push(fr[0]); vals.add(sol[fr[0]]); }
      if(cells.length<2) continue;
      cells.forEach(j=>used.add(j)); allCg.push({cells:cells.sort((a,b)=>a-b),s:cells.reduce((t,j)=>t+sol[j],0),on:true});
    }
  }
  const sync=()=>{
    P.owls=allOwls.filter(o=>o.on).map(({r,c,s})=>({r,c,s}));
    P.gt=allGt.filter(x=>x.on).map(x=>x.p); if(!P.gt.length) delete P.gt;
    if(allEgg.some(x=>x.on)){ P.egg=Array(NN).fill(0); allEgg.forEach(x=>{if(x.on)P.egg[x.i]=x.e;}); } else delete P.egg;
    P.cages=allCg.filter(x=>x.on).map(({cells,s})=>({cells,s})); if(!P.cages.length) delete P.cages;
    prep(P);
  };
  sync();
  // 1. 先拿掉開局數字（所有部分線索都在）
  // 開局至少要給幾個數字：6×6、7×7 三個，8×8 四個，9×9 六個
  const floor=spec.minGiven??Math.max(3,Math.round(NN*0.07));
  let grid=sol.slice(), givens=NN; const target=Math.max(floor,Math.round(NN*spec.keep));
  for(const i of shuffle(range(NN))){
    if(givens<=target) break;
    const k=grid[i]; grid[i]=0;
    if(countSolutions(P,grid)!==1) grid[i]=k; else givens--;
  }
  // 2. 再拿掉多餘的部分線索，讓留下來的都有用；每一種至少留 minKeep 個
  const minKeep=spec.minKeep??2, cnt={};
  const items=[], add=(it,t)=>{it.t=t; items.push(it); cnt[t]=(cnt[t]||0)+1;};
  P.h.forEach((row,r)=>row.forEach((t,c)=>{if(t>=3) add({kind:'h',r,c},t);}));
  P.v.forEach((row,r)=>row.forEach((t,c)=>{if(t>=3) add({kind:'v',r,c},t);}));
  allOwls.forEach(o=>add({kind:'x',o},'O')); allGt.forEach(o=>add({kind:'x',o},'W'));
  allEgg.forEach(o=>add({kind:'x',o},'EG')); allCg.forEach(o=>add({kind:'x',o},'K'));
  const minOf=t=>(spec.minK&&spec.minK[t])??minKeep;
  for(const it of shuffle(items)){
    if(cnt[it.t]<=minOf(it.t)) continue;
    if(it.kind==='x') it.o.on=false; else P[it.kind][it.r][it.c]=0;
    sync();
    if(countSolutions(P,grid)===1) cnt[it.t]--;
    else { if(it.kind==='x') it.o.on=true; else P[it.kind][it.r][it.c]=it.t; sync(); }
  }
  // 3. 一定要能「純推理」解開：卡住的話，在最關鍵的格子補一個數字（優先補在旁邊有線索的格子）
  logicRepair(P,grid);
  P.givens=grid;
  return P;
}
function birdsIn(P){
  const s=new Set(); P.h.flat().concat(P.v.flat()).forEach(t=>t&&s.add(t)); if(P.owls&&P.owls.length) s.add('O');
  if(P.reg) s.add('weaver'); if(P.gt&&P.gt.length) s.add('woodpecker'); if(P.egg) s.add('quail');
  if(P.diag) s.add('goose'); if(P.cages&&P.cages.length) s.add('starling');
  return [...s].sort((a,b)=>BIRD_ORDER.indexOf(a)-BIRD_ORDER.indexOf(b));
}
const BIRD_ORDER=[1,2,3,4,5,'O',6,7,'weaver','woodpecker','quail','goose','starling'];
function logicRepair(P,grid){
  for(let k=0;k<60;k++){
    const r=logicSolve(P,grid); if(r.solved) return;
    let best=-1,bs=99;
    for(let i=0;i<P.NN;i++) if(!r.g[i]){
      const c=r.C?popc(r.C[i]):P.n, nearBird=P.nb[i].some(([,t])=>t>0)||P.cellOw[i].length>0||P.gtOf[i].length>0||P.cellCg[i].length>0||(P.egg&&P.egg[i]);
      const s=c-(nearBird?.6:0)+RNG()*.3; if(s<bs){bs=s;best=i;} }
    if(best<0) return; grid[best]=P.sol[best];
  }
}

// 產生多個候選題，依推理難度排序後挑一題
function pickByDifficulty(spec,seed,K,t){
  const cands=[];
  for(let k=0;k<K;k++){
    RNG=mulberry32(seed+k*104729);
    try{ const P=buildPuzzle(spec); P.grade=gradePuzzle(P); cands.push(P); } finally{ RNG=Math.random; }
  }
  cands.sort((a,b)=>a.grade.score-b.grade.score);
  return cands[Math.round(t*(K-1))];
}

// ---------- 闖關：8 章 100 關 ----------
const lerp=(a,b,t)=>a+(b-a)*t;
const CHAPTERS=[
  {name:'鸚鵡的庭院',  bird:1,  from:1,  to:12,  spec:t=>({n:6,tit:false,partial:[],keep:lerp(.6,.14,t)})},
  {name:'山雀的樹梢',  bird:2,  from:13, to:24,  spec:(t,L)=>L<=18?{n:6,tit:true,partial:[],keep:lerp(.33,.05,t*2)}:{n:7,tit:true,partial:[],keep:lerp(.28,0,(t-.5)*2)}},
  {name:'綠繡眼的花叢',bird:3,  from:25, to:36,  spec:(t,L)=>L<=30?{n:6,tit:false,partial:[3],keep:lerp(.3,.05,t*2)}:{n:7,tit:true,partial:[3],keep:lerp(.22,0,(t-.5)*2)}},
  {name:'翠鳥的溪邊',  bird:4,  from:37, to:48,  spec:t=>({n:7,tit:true,partial:[4],keep:lerp(.25,0,t)})},
  {name:'麻雀的屋簷',  bird:5,  from:49, to:60,  spec:(t,L)=>({n:L<=54?7:8,tit:true,partial:[5],keep:L<=54?lerp(.22,.04,t*2):lerp(.2,0,(t-.5)*2)})},
  {name:'貓頭鷹的夜晚',bird:'O',from:61, to:72,  spec:(t,L)=>({n:L<=66?7:8,tit:true,partial:[],owl:true,keep:L<=66?lerp(.2,.02,t*2):lerp(.18,0,(t-.5)*2)})},
  {name:'台灣藍鵲的山林',bird:6,from:73, to:86,  spec:(t,L)=>L<=79?{n:8,tit:true,partial:[6],keep:lerp(.2,.03,t*2)}:{n:9,tit:true,partial:[6,3],keep:lerp(.18,0,(t-.5)*2)}},
  {name:'五色鳥與帝雉',bird:7,  from:87, to:100, spec:(t,L)=>{
    if(L===100) return {n:9,tit:true,partial:[3,4,5,6,7],owl:true,keep:0,density:.5,minKeep:1};
    const mix=[[7],[7],[7,4],[7,5],[7,3],[7,6],[7,4,5],[7,3,6],[7],[7,5],[7,3,4],[7,6],[7,4,6]][L-87];
    return {n:9,tit:true,partial:mix,owl:L%4===0,keep:lerp(.14,0,t)};}},
  // ---- 101 關以後：每章一種新線索，先從 6×6 教起 ----
  {name:'織布鳥的鳥巢',bird:'weaver',from:101,to:112,spec:(t,L)=>L<=106?{n:6,tit:false,reg:true,keep:lerp(.45,.12,t*2)}:{n:7,tit:true,reg:true,keep:lerp(.22,.04,(t-.5)*2)}},
  {name:'樹鵲的樹林',bird:'woodpecker',from:113,to:124,spec:(t,L)=>L<=118?{n:6,tit:false,gt:.6,minK:{W:9},keep:lerp(.35,.08,t*2)}:{n:7,tit:true,gt:.5,minK:{W:11},keep:lerp(.2,.03,(t-.5)*2)}},
  {name:'鵪鶉的蛋',bird:'quail',from:125,to:136,spec:(t,L)=>L<=130?{n:6,tit:false,egg:.6,minK:{EG:10},keep:lerp(.35,.08,t*2)}:{n:7,tit:true,egg:.5,partial:[3],minK:{EG:14},keep:lerp(.2,.03,(t-.5)*2)}},
  {name:'鴻雁的天空',bird:'goose',from:137,to:148,spec:(t,L)=>L<=142?{n:6,tit:false,diag:true,keep:lerp(.4,.1,t*2)}:{n:8,tit:true,diag:true,keep:lerp(.18,.03,(t-.5)*2)}},
  {name:'灰椋鳥的鳥群',bird:'starling',from:149,to:160,spec:(t,L)=>L<=154?{n:6,tit:false,cage:.8,minK:{K:5},keep:lerp(.3,.06,t*2)}:{n:7,tit:true,cage:.7,minK:{K:7},keep:lerp(.18,.03,(t-.5)*2)}},
  {name:'鳥巢裡的鳥群',bird:'weaver',from:161,to:172,spec:(t,L)=>L<=166?{n:7,tit:true,reg:true,cage:.6,minK:{K:5},keep:lerp(.22,.05,t*2)}:{n:8,tit:true,reg:true,cage:.6,minK:{K:7},keep:lerp(.16,.03,(t-.5)*2)}},
  {name:'候鳥大集合',bird:'goose',from:173,to:186,spec:(t,L)=>{
    const mix=[{reg:true,gt:.4,minK:{W:10}},{diag:true,egg:.4,minK:{EG:12}},{cage:.6,gt:.3,minK:{K:7,W:6}},{reg:true,egg:.4,minK:{EG:12}},{diag:true,cage:.6,minK:{K:7}},{reg:true,diag:true}][(L-173)%6];
    return {n:9,tit:true,...mix,keep:lerp(.12,.03,t)};}},
  {name:'終章・百鳥齊鳴',bird:'starling',from:187,to:200,spec:(t,L)=>{
    if(L===200) return {n:9,tit:true,reg:true,diag:true,gt:.25,egg:.25,cage:.4,owl:true,partial:[3,4,6,7],density:.5,minK:{W:5,EG:5,K:4},minKeep:1,keep:.02};
    const mix=[{reg:true,cage:.5,partial:[3],minK:{K:6}},{diag:true,gt:.3,partial:[4],minK:{W:8}},{reg:true,egg:.35,partial:[6],minK:{EG:10}},{cage:.5,egg:.3,partial:[7],minK:{K:6,EG:6}},{reg:true,diag:true,gt:.25,minK:{W:6}},{diag:true,cage:.5,owl:true,minK:{K:6}},{reg:true,gt:.3,egg:.3,minK:{W:6,EG:6}}][(L-187)%7];
    return {n:9,tit:true,...mix,keep:lerp(.1,.02,t)};}},
];
const LEVELS=200;
function chapterOf(L){return CHAPTERS.find(c=>L>=c.from&&L<=c.to)}
// 有「區塊」規則（鳥巢區域、鳥群總和、雁群斜線）的關卡，開局只給少量數字；只有鳥規則的關卡維持原本
const isBlock=sp=>!!(sp.reg||sp.cage||sp.diag);
function levelSpec(L){
  const ch=chapterOf(L), t=ch.to===ch.from?1:(L-ch.from)/(ch.to-ch.from), sp={...ch.spec(t,L),t,chapter:CHAPTERS.indexOf(ch)+1};
  if(isBlock(sp)){ const few=sp.n<=8?2:3; sp.keep=0; sp.minGiven=few; sp.maxGiven=few+2; }
  return sp;
}
const LEVEL_CACHE=new Map();
// 難度＝解題過程中「卡住、需要進階推理」的次數；每一章從 0 慢慢升高，後面的章節最高點也比較高
const diffOf=P=>P.grade.adv;
function levelTarget(L){
  const sp=levelSpec(L), c=sp.chapter;
  if(L===LEVELS) return 99;                      // 最終關：挑候選裡最難的
  const hi=Math.min(13,2.5+0.65*c);
  return hi*Math.pow(sp.t,1.3);
}
function generateLevel(L){
  if(LEVEL_CACHE.has(L)) return LEVEL_CACHE.get(L);
  const sp=levelSpec(L), K=sp.n<=7?8:6, target=levelTarget(L), seed=L*7919+2026;
  let best=null;
  // 都太簡單的話多試幾題（最多 4 倍）
  const cap=sp.maxGiven??Infinity, over=P=>Math.max(0,P.givens.filter(Boolean).length-cap);
  const worse=(P,Q)=>over(P)!==over(Q)?over(P)>over(Q):Math.abs(diffOf(P)-target)>Math.abs(diffOf(Q)-target);
  for(let k=0;k<K*4&&(k<K||over(best)>0||Math.abs(diffOf(best)-target)>2);k++){
    RNG=mulberry32(seed+k*104729);
    try{ const P=buildPuzzle(sp); P.grade=gradePuzzle(P); easeTo(P,target,cap);
      if(!best||worse(best,P)) best=P; } finally{ RNG=Math.random; }
  }
  best.label={kind:'level',L}; LEVEL_CACHE.set(L,best); return best;
}
// 太難的話，在需要「進階推理」的那一步直接給出數字，一次一格，直到接近目標難度
function easeTo(P,target,cap=Infinity){
  for(let k=0;k<60&&diffOf(P)>target+.5&&P.givens.filter(Boolean).length<cap;k++){
    const r=logicSolve(P,P.givens); const st=r.steps.find(s=>s.tech>=3);
    if(!st) break;
    P.givens[st.i]=st.v; P.grade=gradePuzzle(P);
  }
}
// 給玩家看的難度：1 到 5 個鳥巢
function nestRating(P){ const d=diffOf(P); return d<1?1:d<3?2:d<6?3:d<10?4:5; }

// ---------- 每日一題（以台北時間為準，全世界同一題） ----------
function todayKey(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  return p; // YYYY-MM-DD
}
function dayOffset(key,d){const t=new Date(key+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+d);return t.toISOString().slice(0,10);}
function dailySpec(key){
  const wd=new Date(key+'T00:00:00Z').getUTCDay();
  if(wd===0||wd===6){
    const wk=Math.floor(Date.parse(key)/864e5/7);
    const pairs=[[3,7],[4,5],[6,7],[3,4],[5,6]];
    return {n:9,tit:true,partial:pairs[wk%pairs.length],owl:wd===0,keep:.05,weekend:true};
  }
  const byDay={1:{partial:[3]},2:{partial:[4]},3:{partial:[5]},4:{partial:[],owl:true},5:{partial:[6]}}[wd];
  return {n:7,tit:true,keep:.12,...byDay,weekend:false};
}
function generateDaily(key){
  const sp=dailySpec(key);
  const P=pickByDifficulty(sp,hashStr('daily:'+key),sp.n===9?2:3,.5);
  P.label={kind:'daily',key,weekend:sp.weekend}; return P;
}

// ---------- 題目代碼（分享用）：大小、鳥、難度、種子，手作題另含解答 ----------
const DIFFS=[{name:'簡單',keep:.35},{name:'普通',keep:.15},{name:'困難',keep:.05},{name:'極難',keep:0}];
function codeSpec(o){return {n:o.n,tit:o.tit,partial:o.partial,owl:o.owl,keep:DIFFS[o.diff].keep}}
function encodeCode(o){
  const bytes=[1,o.n,(o.tit?1:0)|(o.owl?2:0)|(o.sol?4:0),o.partial.reduce((m,t)=>m|1<<t,0),o.diff,
    (o.seed>>>24)&255,(o.seed>>>16)&255,(o.seed>>>8)&255,o.seed&255];
  if(o.sol) for(let i=0;i<o.sol.length;i+=2) bytes.push((o.sol[i]<<4)|(o.sol[i+1]||0));
  let x=1n; for(const b of bytes) x=(x<<8n)|BigInt(b);
  return x.toString(36).toUpperCase().replace(/(.{4})(?=.)/g,'$1-');
}
function decodeCode(s){
  try{
    s=String(s).toLowerCase().replace(/[^0-9a-z]/g,''); if(!s||s.length>80) return null;
    let x=0n; for(const ch of s) x=x*36n+BigInt(parseInt(ch,36));
    const bytes=[]; while(x>1n){bytes.unshift(Number(x&255n)); x>>=8n;}
    if(x!==1n||bytes[0]!==1||bytes.length<9) return null;
    const n=bytes[1], fl=bytes[2], pm=bytes[3], diff=bytes[4];
    if(n<4||n>9||diff>3) return null;
    const seed=((bytes[5]<<24)|(bytes[6]<<16)|(bytes[7]<<8)|bytes[8])>>>0;
    const partial=[3,4,5,6,7].filter(t=>pm>>t&1);
    let sol=null;
    if(fl&4){ sol=[]; for(let i=9;i<bytes.length;i++){sol.push(bytes[i]>>4,bytes[i]&15);} sol=sol.slice(0,n*n); if(!isLatin(sol,n)) return null; }
    return {n,tit:!!(fl&1),owl:!!(fl&2),partial,diff,seed,sol};
  }catch(e){return null}
}
function puzzleFromCode(o){
  RNG=mulberry32(o.seed);
  try{ const P=buildPuzzle(codeSpec(o),o.sol||null); P.label={kind:'custom',code:encodeCode(o)}; return P; } finally{ RNG=Math.random; }
}
function racePuzzle(room){
  RNG=mulberry32(hashStr('race:'+room));
  try{ const P=buildPuzzle({n:7,tit:true,partial:[3],keep:.14}); P.label={kind:'race',room}; return P; } finally{ RNG=Math.random; }
}
