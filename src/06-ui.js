// ===================== 06 遊戲畫面：棋盤、輸入、提示、過關 =====================
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const S={mode:'level',levelNo:1,P:null,vals:[],notes:[],sel:-1,noteMode:false,hist:[],t0:0,elapsed:0,done:false,hints:0,usedNotes:false,
  editing:false,editVals:[],paused:false,prevLines:null};
let N=6,NN=36;
const boardEl=$('board'); let cells=[],edgeEls=[],owlEls=[],HINT=null;
const posName=i=>`第 ${(i/N|0)+1} 列第 ${i%N+1} 格`;
const listJoin=a=>a.join('、');

function rawPuzzle(P){const {n,tit,h,v,owls,sol,givens,label}=P; return {n,tit,h,v,owls,sol,givens,label};}
function setPuzzle(P){prep(P); S.P=P; N=P.n; NN=N*N;}
function resetPlay(){
  S.vals=S.P.givens.slice(); S.notes=Array(NN).fill(0); S.hist=[]; S.sel=S.vals.indexOf(0);
  S.t0=Date.now(); S.elapsed=0; S.done=false; S.hints=0; S.usedNotes=false; S.editing=false;
  hideHint(); $('win').hidden=true; buildBoard(); render(); save();
}

// ---------- 畫棋盤 ----------
function buildBoard(){
  boardEl.innerHTML=''; cells=[]; edgeEls=[]; owlEls=[];
  boardEl.style.setProperty('--n',N);
  $('total').textContent=NN; document.querySelectorAll('.nmax').forEach(e=>e.textContent=N);
  for(let i=0;i<NN;i++){
    const d=document.createElement('div'); d.className='cell'; d.setAttribute('role','button');
    d.setAttribute('aria-label',posName(i));
    d.addEventListener('pointerdown',()=>{S.sel=i; render();});
    boardEl.appendChild(d); cells.push(d);
  }
  if(!S.editing){
    const P=S.P;
    const add=(t,x,y,a,b)=>{ if(!t) return; const d=document.createElement('span'); d.className='dot'; d.innerHTML=birdSVG(t);
      d.style.left=x+'%'; d.style.top=y+'%'; boardEl.appendChild(d); edgeEls.push({el:d,a,b,t}); };
    for(let r=0;r<N;r++) for(let c=0;c<N-1;c++) add(P.h[r][c],(c+1)/N*100,(r+.5)/N*100,r*N+c,r*N+c+1);
    for(let r=0;r<N-1;r++) for(let c=0;c<N;c++) add(P.v[r][c],(c+.5)/N*100,(r+1)/N*100,r*N+c,(r+1)*N+c);
    (P.owls||[]).forEach((o,k)=>{ const d=document.createElement('span'); d.className='owl'; d.innerHTML=birdSVG('O')+`<b>${o.s}</b>`;
      d.style.left=(o.c+1)/N*100+'%'; d.style.top=(o.r+1)/N*100+'%'; boardEl.appendChild(d); owlEls.push({el:d,cells:P.ow[k].cells,s:o.s}); });
  }
  buildKeys(); renderBirdInfo();
}
function buildKeys(){
  const k=$('keys'); k.innerHTML=''; k.style.gridTemplateColumns=`repeat(${N},1fr)`;
  for(let n=1;n<=N;n++){const b=document.createElement('button'); b.className='key'; b.id='key'+n; b.textContent=n; b.onclick=()=>input(n); k.appendChild(b);}
}
function renderBirdInfo(){
  const list=S.editing?[]:birdsIn(S.P);
  $('birdChip').innerHTML=list.map(t=>birdDot(t)).join('');
  $('ruleBirds').innerHTML=list.length?list.map(t=>{const sp=SPECIES[t];
    return `<li><span class="sw dot" data-bird="${t}"></span><span><b>${sp.name}</b>：${sp.rule}${sp.full?'（全部畫出）':t==='O'?'':'（只畫一部分）'}。<span class="eg">例 ${sp.ex}</span></span></li>`;}).join('')
    :'<li><span>編輯答案中，還沒有放鳥。</span></li>';
  birdify($('birdChip')); birdify($('ruleBirds'));
}

// ---------- 檢查衝突 ----------
function conflicts(){
  const bad=new Set(), badE=new Set(), badO=new Set(), v=S.vals;
  for(let i=0;i<NN;i++){ if(!v[i]) continue; const r=i/N|0,c=i%N;
    for(let k=0;k<N;k++){const a=r*N+k,b=k*N+c; if(a!==i&&v[a]===v[i])bad.add(i); if(b!==i&&v[b]===v[i])bad.add(i);} }
  edgeEls.forEach((e,k)=>{const a=v[e.a],b=v[e.b]; if(a&&b&&!allowPair(e.t,a,b,N,S.P.tit)){bad.add(e.a);bad.add(e.b);badE.add(k);}});
  // 沒有鳥的邊：不可以是鸚鵡或山雀的關係
  for(let i=0;i<NN;i++) if(v[i]) for(const [j,t] of S.P.nb[i]) if(t===0&&j>i&&v[j]&&!allowPair(0,v[i],v[j],N,S.P.tit)){bad.add(i);bad.add(j);}
  owlEls.forEach((o,k)=>{ if(o.cells.every(j=>v[j])&&o.cells.reduce((s,j)=>s+v[j],0)!==o.s){badO.add(k); o.cells.forEach(j=>bad.add(j));} });
  return {bad,badE,badO};
}
function lineKeysDone(){
  const sol=S.P.sol, rowOK=[], colOK=[];
  for(let k=0;k<N;k++){ rowOK[k]=range(N).every(j=>S.vals[k*N+j]===sol[k*N+j]); colOK[k]=range(N).every(j=>S.vals[j*N+k]===sol[j*N+k]); }
  return {rowOK,colOK};
}

// ---------- 畫面更新 ----------
function render(){
  if(S.editing) return renderEdit();
  const {bad,badE,badO}=conflicts(), sel=S.sel;
  const {rowOK,colOK}=lineKeysDone();
  const keys=new Set([...rowOK.flatMap((ok,k)=>ok?['r'+k]:[]),...colOK.flatMap((ok,k)=>ok?['c'+k]:[])]);
  const fresh=S.prevLines?[...keys].filter(k=>!S.prevLines.has(k)):[]; S.prevLines=keys;
  cells.forEach((d,i)=>{
    const r=i/N|0,c=i%N,v=S.vals[i];
    d.className='cell'+(S.P.givens[i]?' given':'')+(rowOK[r]||colOK[c]?' line':'')+(i===sel?' sel':'')
      +(bad.has(i)&&!S.P.givens[i]?' bad':'')+(HINT&&HINT.i===i?' hint':'');
    if(v) d.textContent=v;
    else if(S.notes[i]) d.innerHTML='<div class="notes">'+range(N).map(k=>`<span>${(S.notes[i]>>k)&1?k+1:''}</span>`).join('')+'</div>';
    else d.textContent='';
  });
  edgeEls.forEach((e,k)=>e.el.classList.toggle('bad',badE.has(k)));
  owlEls.forEach((o,k)=>o.el.classList.toggle('bad',badO.has(k)));
  $('filled').textContent=S.vals.filter(Boolean).length;
  $('notes').setAttribute('aria-pressed',S.noteMode);
  fresh.forEach(k=>celebrateLine(k[0]==='r',+k.slice(1)));
  if(!S.done&&!S.paused&&S.vals.every(Boolean)&&bad.size===0) onWin();
}
function renderEdit(){
  const v=S.editVals, bad=new Set();
  for(let i=0;i<NN;i++){ if(!v[i]) continue; const r=i/N|0,c=i%N;
    for(let k=0;k<N;k++){const a=r*N+k,b=k*N+c; if(a!==i&&v[a]===v[i])bad.add(i); if(b!==i&&v[b]===v[i])bad.add(i);} }
  cells.forEach((d,i)=>{ d.className='cell edit'+(i===S.sel?' sel':'')+(bad.has(i)?' bad':''); d.textContent=v[i]||''; });
  $('filled').textContent=v.filter(Boolean).length;
}

// ---------- 動畫與聲音 ----------
function pop(el){ if(RM||!el||!el.animate) return; el.animate([{transform:'scale(.75)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'}); }
function anim(el,cls){ if(RM) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls),1000); }
function celebrateLine(isRow,idx){
  const inLine=j=>isRow?(j/N|0)===idx:j%N===idx;
  range(N).forEach(j=>{const el=cells[isRow?idx*N+j:j*N+idx]; if(!RM&&el.animate) el.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:320,delay:j*45,easing:'ease-out'});});
  const birds=edgeEls.filter(e=>inLine(e.a)&&inLine(e.b));
  birds.forEach((e,k)=>setTimeout(()=>anim(e.el,'fly'),k*70));
  if(birds.length) chirp(birds[rnd(birds.length)].t,.045); else blip(988,.1,.035);
}
function feedback(i){
  const v=S.vals[i]; if(!v) return;
  pop(cells[i]);
  const mine=edgeEls.filter(e=>e.a===i||e.b===i);
  if(v===S.P.sol[i]){
    const happy=mine.filter(e=>S.vals[e.a]&&S.vals[e.b]);
    happy.forEach(e=>anim(e.el,'flap'));
    if(happy.length) chirp(happy[0].t,.04); else blip(740,.05,.03);
  }else{
    const {badE}=conflicts();
    const sad=mine.filter(e=>badE.has(edgeEls.indexOf(e)));
    sad.forEach(e=>anim(e.el,'tilt'));
    blip(220,.12,.035,'sine');
  }
}

// ---------- 輸入 ----------
function push(){S.hist.push({v:S.vals.slice(),n:S.notes.slice()}); if(S.hist.length>300) S.hist.shift();}
function place(i,n){
  S.vals[i]=n; S.notes[i]=0; const r=i/N|0,c=i%N;
  for(let k=0;k<N;k++){S.notes[r*N+k]&=~(1<<(n-1)); S.notes[k*N+c]&=~(1<<(n-1));}
}
function autoFill(i){ // 一列或一行只剩一格、其他都對 → 補上最後一格
  const auto=[]; if(!S.vals[i]||S.vals[i]!==S.P.sol[i]) return auto;
  const r=i/N|0,c=i%N;
  for(const line of [range(N).map(k=>r*N+k),range(N).map(k=>k*N+c)]){
    const empty=line.filter(j=>!S.vals[j]);
    if(empty.length===1&&line.every(j=>!S.vals[j]||S.vals[j]===S.P.sol[j])){const j=empty[0]; place(j,S.P.sol[j]); auto.push(j);}
  }
  return auto;
}
function setValue(i,n){ // 提示或一般填入共用
  push(); place(i,n); const auto=autoFill(i);
  hideHint(); render(); save(); feedback(i); auto.forEach(j=>pop(cells[j])); afterMove();
}
function input(n){
  const i=S.sel;
  if(S.editing){ if(i<0||n>N) return; S.editVals[i]=S.editVals[i]===n?0:n; renderEdit(); saveEdit(); return; }
  if(i<0||S.done||S.paused||S.P.givens[i]||n>N) return;
  if(S.noteMode&&!S.vals[i]){ push(); S.notes[i]^=1<<(n-1); S.usedNotes=true; render(); save(); return; }
  if(S.vals[i]===n){ push(); S.vals[i]=0; hideHint(); render(); save(); afterMove(); return; }
  setValue(i,n);
}
function erase(){
  const i=S.sel;
  if(S.editing){ if(i>=0){S.editVals[i]=0; renderEdit(); saveEdit();} return; }
  if(i<0||S.done||S.paused||S.P.givens[i]) return; push(); S.vals[i]=0; S.notes[i]=0; render(); save(); afterMove();
}
function undo(){ if(S.editing||S.done||S.paused) return; const h=S.hist.pop(); if(!h) return; S.vals=h.v; S.notes=h.n; hideHint(); render(); save(); afterMove(); }
function afterMove(){ if(S.mode==='race') raceProgress(); }

// ---------- 教學式提示 ----------
function findHint(){
  const P=S.P;
  const wrong=S.vals.findIndex((v,i)=>v&&!P.givens[i]&&v!==P.sol[i]);
  if(wrong>=0) return {i:wrong,v:P.sol[wrong],text:`${posName(wrong)}的 ${S.vals[wrong]} 填錯了，先從這裡改起。`};
  const r=logicSolve(P,S.vals,1);
  if(r.steps.length){ const st=r.steps[0]; return {i:st.i,v:st.v,text:explain(st)}; }
  const i=S.vals.findIndex(v=>!v); if(i<0) return null;
  return {i,v:P.sol[i],text:`這一步光靠推理比較難找到，需要先試填看看。這裡直接告訴你：${posName(i)}是 ${P.sol[i]}。`};
}
function explain(st){
  const P=S.P, g=S.vals, i=st.i, v=st.v, r=i/N|0, c=i%N;
  if(st.info.kind==='hidden'){
    const unit=st.info.unit==='row'?`第 ${st.info.idx+1} 列`:`第 ${st.info.idx+1} 行`;
    return `${unit}裡，數字 ${v} 只有一個地方能放，就是${posName(i)}。其他空格放 ${v} 都會跟同列、同行或旁邊的鳥衝突。`+(st.tech>=3?'（要先想想鄰格還可能填什麼。）':'');
  }
  const rowV=range(N).map(k=>g[r*N+k]).filter(Boolean).sort((a,b)=>a-b);
  const colV=range(N).map(k=>g[k*N+c]).filter(x=>x&&!rowV.includes(x)).sort((a,b)=>a-b);
  const parts=[];
  if(rowV.length) parts.push(`同一列已經有 ${listJoin(rowV)}`);
  if(colV.length) parts.push(`同一行還有 ${listJoin(colV)}`);
  const used=new Set([...rowV,...colV]);
  for(const [j,t] of P.nb[i]){ const w=g[j]; if(!w) continue;
    const ex=range(N).map(k=>k+1).filter(x=>!used.has(x)&&!allowPair(t,x,w,N,P.tit));
    if(!ex.length) continue; ex.forEach(x=>used.add(x));
    parts.push(t?`和旁邊的 ${w} 之間有${SPECIES[t].name}，所以不能是 ${listJoin(ex)}`:`和旁邊的 ${w} 之間沒有鳥，所以不能是 ${listJoin(ex)}`); }
  for(const k of P.cellOw[i]){ const o=P.ow[k]; const m=owlMask(o,i,g,N);
    const ex=range(N).map(x=>x+1).filter(x=>!used.has(x)&&!(m>>(x-1)&1)); if(ex.length){ex.forEach(x=>used.add(x)); parts.push(`領角鴞的總和 ${o.s} 排除了 ${listJoin(ex)}`);} }
  let s=`${posName(i)}只能填 ${v}。`+(parts.length?parts.join('；')+'。':'');
  if(st.tech>=3) s+=st.tech===4?'另外，這一列或這一行有兩格只能是同一對數字，所以其他格就不能用那兩個數。':'再看看旁邊空格還可能填什麼，就能排除剩下的數字。';
  return s;
}
function doHint(){
  if(S.done||S.editing||S.paused) return;
  const h=findHint(); if(!h) return;
  S.hints++; HINT=h; S.sel=h.i;
  $('hintText').textContent=h.text; $('hintbar').hidden=false; birdify($('hintbar'));
  render(); save(); chirp(5,.035);
}
function hideHint(){ HINT=null; $('hintbar').hidden=true; }
$('hintFill').onclick=()=>{ if(!HINT) return; const h=HINT; setValue(h.i,h.v); };
$('hintClose').onclick=()=>{ hideHint(); render(); };

// ---------- 過關 ----------
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function secs(){ return S.done||S.paused?S.elapsed:Math.floor((Date.now()-S.t0)/1000); }
setInterval(()=>{$('time').textContent=fmt(Math.max(0,secs()));},500);
function starsFor(h){return h===0?3:h<=2?2:1}
function onWin(){
  S.done=true; S.elapsed=Math.floor((Date.now()-S.t0)/1000); hideHint();
  PROG.c.wins++;
  if(S.hints===0&&N>=8) PROG.c.nohint8=1;
  if(!S.usedNotes&&N>=7) PROG.c.nonote=1;
  if(S.hints===0&&N>=7&&S.elapsed<=180) PROG.c.fast=1;
  const res=MODES[S.mode].win();
  $('wintitle').textContent=res.title; $('winstars').innerHTML=res.stars?starHTML(res.stars):'';
  $('winmsg').textContent=res.msg;
  const egg=$('winEgg');
  if(res.hatched!==undefined){ egg.hidden=false; egg.innerHTML=birdDot(res.hatched)+`<span>孵出了一隻${SPECIES[res.hatched].name}，牠住進鳥園了！</span>`; birdify(egg); }
  else egg.hidden=true;
  $('again').textContent=res.againText||'再來一局'; $('nextBtn').hidden=!res.next; $('nextBtn').textContent=res.nextText||'下一關';
  $('winBirds').innerHTML=birdsIn(S.P).slice(0,4).map(t=>birdDot(t)).join(''); birdify($('winBirds'));
  $('win').hidden=false; saveProg(); save(); confetti();
  birdsIn(S.P).slice(0,3).forEach((t,k)=>setTimeout(()=>chirp(t,.045),k*380));
  edgeEls.forEach((e,k)=>setTimeout(()=>anim(e.el,'fly'),(k%12)*60));
  checkAch(); syncPanels();
}
function confetti(){
  if(RM) return;
  const c=document.createElement('canvas'); c.id='confetti'; document.body.appendChild(c);
  const dpr=devicePixelRatio||1, W=innerWidth, H=innerHeight; c.width=W*dpr; c.height=H*dpr;
  const x=c.getContext('2d'); x.scale(dpr,dpr);
  const cs=getComputedStyle(document.documentElement);
  const cols=['--accent','--mint','--butter','--blush','--sky'].map(v=>cs.getPropertyValue(v).trim());
  const P=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*80,y:H*.45,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,
    r:Math.random()*5+4,c:cols[Math.floor(Math.random()*cols.length)],round:Math.random()<.5,a:Math.random()*6,va:(Math.random()-.5)*.3}));
  const t0=performance.now();
  (function f(t){ const e=t-t0; x.clearRect(0,0,W,H);
    for(const p of P){p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va; x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;
      x.globalAlpha=Math.max(0,1-e/2600); if(p.round){x.beginPath();x.arc(0,0,p.r*.6,0,7);x.fill();} else x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); x.restore();}
    if(e<2600) requestAnimationFrame(f); else c.remove(); })(t0);
}

// ---------- 存檔（每個模式各一份） ----------
function save(){ if(!S.P) return; try{ localStorage.setItem('kp4-s-'+S.mode,JSON.stringify({P:rawPuzzle(S.P),vals:S.vals,notes:S.notes,sel:S.sel,
  elapsed:secs(),done:S.done,hints:S.hints,usedNotes:S.usedNotes,levelNo:S.levelNo,extra:S.extra||null})); localStorage.setItem('kp4-mode',S.mode);}catch(e){} }
function loadMode(m){ try{ const d=JSON.parse(localStorage.getItem('kp4-s-'+m)); if(!d||!d.P) return false;
  S.mode=m; setPuzzle(d.P); Object.assign(S,{vals:d.vals,notes:d.notes,sel:d.sel,elapsed:d.elapsed,done:d.done,hints:d.hints,usedNotes:d.usedNotes,
    levelNo:d.levelNo||S.levelNo,extra:d.extra,hist:[],editing:false,paused:false,prevLines:null}); S.t0=Date.now()-d.elapsed*1000; return true; }catch(e){return false} }
function saveEdit(){ try{localStorage.setItem('kp4-edit',JSON.stringify({n:N,v:S.editVals}))}catch(e){} }

// ---------- 控制 ----------
$('notes').onclick=()=>{S.noteMode=!S.noteMode; render();};
$('erase').onclick=erase; $('undo').onclick=undo; $('hint').onclick=doHint;
document.addEventListener('keydown',e=>{
  if(e.target.closest&&e.target.closest('input,textarea')) return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.key>='1'&&e.key<='9'){input(+e.key);return;}
  if(e.key==='Backspace'||e.key==='Delete'||e.key==='0'){erase();return;}
  const k=e.key.toLowerCase();
  if(k==='n'){S.noteMode=!S.noteMode;render();return;}
  if(k==='h'){doHint();return;}
  const mv={ArrowUp:-N,ArrowDown:N,ArrowLeft:-1,ArrowRight:1}[e.key];
  if(mv!==undefined){e.preventDefault(); if(S.sel<0) S.sel=0; else{const r=S.sel/N|0,c=S.sel%N;
    if((mv===-1&&c>0)||(mv===1&&c<N-1)||(mv===-N&&r>0)||(mv===N&&r<N-1)) S.sel+=mv;} render();}
});
