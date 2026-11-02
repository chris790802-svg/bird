// ===================== 03 出題：關卡、每日一題、題目代碼 =====================
// spec：{n, tit, partial:[鳥代號], owl, keep(開局給數字比例), density, minKeep}
function buildPuzzle(spec,givenSol){
  const n=spec.n, NN=n*n, sol=givenSol?givenSol.slice():randomLatin(n);
  const dens=spec.density??0.75, tit=!!spec.tit, partial=spec.partial||[];
  const pick=(a,b)=>{const d=fullBird(a,b,tit); if(d) return d;
    const opts=partial.filter(t=>holds(t,a,b,n)); return opts.length&&RNG()<dens?opts[rnd(opts.length)]:0;};
  const h=range(n).map(r=>range(n-1).map(c=>pick(sol[r*n+c],sol[r*n+c+1])));
  const v=range(n-1).map(r=>range(n).map(c=>pick(sol[r*n+c],sol[(r+1)*n+c])));
  const allOwls=[];
  if(spec.owl) for(let r=0;r<n-1;r++) for(let c=0;c<n-1;c++) if(RNG()<0.5)
    allOwls.push({r,c,s:sol[r*n+c]+sol[r*n+c+1]+sol[(r+1)*n+c]+sol[(r+1)*n+c+1],on:true});
  const P={n,tit,h,v,sol};
  const sync=()=>{P.owls=allOwls.filter(o=>o.on).map(({r,c,s})=>({r,c,s})); prep(P);};
  sync();
  // 1. 先拿掉開局數字（所有部分線索都在）
  let grid=sol.slice(), givens=NN; const target=Math.round(NN*spec.keep);
  for(const i of shuffle(range(NN))){
    if(givens<=target) break;
    const k=grid[i]; grid[i]=0;
    if(countSolutions(P,grid)!==1) grid[i]=k; else givens--;
  }
  // 2. 再拿掉多餘的部分線索，讓留下來的鳥都有用；每種新鳥至少留 minKeep 隻
  const minKeep=spec.minKeep??2, cnt={};
  const items=[];
  P.h.forEach((row,r)=>row.forEach((t,c)=>{if(t>=3){items.push({kind:'h',r,c,t});cnt[t]=(cnt[t]||0)+1;}}));
  P.v.forEach((row,r)=>row.forEach((t,c)=>{if(t>=3){items.push({kind:'v',r,c,t});cnt[t]=(cnt[t]||0)+1;}}));
  allOwls.forEach(o=>{items.push({kind:'o',o,t:'O'});cnt.O=(cnt.O||0)+1;});
  for(const it of shuffle(items)){
    if(cnt[it.t]<=minKeep) continue;
    if(it.kind==='o') it.o.on=false; else P[it.kind][it.r][it.c]=0;
    sync();
    if(countSolutions(P,grid)===1) cnt[it.t]--;
    else { if(it.kind==='o') it.o.on=true; else P[it.kind][it.r][it.c]=it.t; sync(); }
  }
  P.givens=grid;
  return P;
}
function birdsIn(P){
  const s=new Set(); P.h.flat().concat(P.v.flat()).forEach(t=>t&&s.add(t)); if(P.owls&&P.owls.length) s.add('O');
  return [...s].sort((a,b)=>BIRD_ORDER.indexOf(a)-BIRD_ORDER.indexOf(b));
}
const BIRD_ORDER=[1,2,3,4,5,'O',6,7];
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
];
const LEVELS=100;
function chapterOf(L){return CHAPTERS.find(c=>L>=c.from&&L<=c.to)}
function levelSpec(L){const ch=chapterOf(L), t=ch.to===ch.from?1:(L-ch.from)/(ch.to-ch.from); return {...ch.spec(t,L),t,chapter:CHAPTERS.indexOf(ch)+1};}
const LEVEL_CACHE=new Map();
function generateLevel(L){
  if(LEVEL_CACHE.has(L)) return LEVEL_CACHE.get(L);
  const sp=levelSpec(L);
  const K=sp.n<=6?5:sp.n<=7?4:sp.n<=8?3:2;
  const P=pickByDifficulty(sp,L*7919+2026,K,sp.t);
  P.label={kind:'level',L}; LEVEL_CACHE.set(L,P); return P;
}

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
