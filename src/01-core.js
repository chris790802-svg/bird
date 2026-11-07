// ===================== 01 核心：亂數、規則、唯一解檢查 =====================
let RNG=Math.random;
const rnd=n=>Math.floor(RNG()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const range=n=>[...Array(n).keys()];
const popc=m=>{let k=0;while(m){m&=m-1;k++}return k};
const bitsOf=m=>{const o=[];for(let v=1;m;v++,m>>>=1)if(m&1)o.push(v);return o};
const lowBit=m=>{let v=1;while(!(m&1)){m>>>=1;v++}return v};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function hashStr(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}

// 鳥的代號：邊上的鳥 1–7，貓頭鷹另外放在格子角落
// 1 鸚鵡：差 1（全部畫出）  2 山雀：兩倍（全部畫出）
// 3 綠繡眼：相加 = N+1   4 翠鳥：差 2   5 麻雀：同奇偶   6 台灣藍鵲：差 3   7 五色鳥：三倍
// 3–7 只畫一部分，而且只會站在「沒有鸚鵡、沒有山雀」的邊上
const EDGE_BIRDS=[1,2,3,4,5,6,7];
function holds(t,a,b,n){
  switch(t){
    case 1:return Math.abs(a-b)===1;
    case 2:return a===2*b||b===2*a;
    case 3:return a+b===n+1;
    case 4:return Math.abs(a-b)===2;
    case 5:return (a-b)%2===0;
    case 6:return Math.abs(a-b)===3;
    case 7:return a===3*b||b===3*a;
  }
  return false;
}
// 這兩個數之間「一定要畫」的鳥：有山雀時兩倍優先，否則差 1 畫鸚鵡
function fullBird(a,b,tit){return tit&&(a===2*b||b===2*a)?2:(Math.abs(a-b)===1?1:0)}
function allowPair(t,a,b,n,tit){
  const d=fullBird(a,b,tit);
  if(t===1||t===2) return d===t;
  if(d) return false;
  return t===0||holds(t,a,b,n);
}
function allowTable(n,tit){
  const A=[];
  for(let t=0;t<=7;t++){A[t]=[0];for(let w=1;w<=n;w++){let m=0;for(let v=1;v<=n;v++)if(allowPair(t,v,w,n,tit))m|=1<<(v-1);A[t][w]=m;}}
  return A;
}

// 題目物件：{n,tit,h,v,owls,sol,givens} 再加上 101 關以後的線索（都可以沒有）：
//   reg   鳥巢區域：長度 NN 的陣列，每格屬於第幾個巢（每個巢也要 1 到 N 各一次）
//   diag  雁群斜線：true 時兩條對角線也要 1 到 N 各一次
//   gt    樹鵲箭頭：[[大的格子, 小的格子], ...]
//   egg   鳥蛋：長度 NN 的陣列，0 沒有、1 白蛋（奇數）、2 藍蛋（偶數）
//   cages 鳥群總和：[{cells:[...], s:總和}, ...]，群裡的數字不能重複
// prep 補上推理用的結構（不存檔）
function prep(P){
  const n=P.n,NN=n*n,full=(1<<n)-1;
  P.NN=NN; P.A=allowTable(n,P.tit); P.full=full;
  P.nb=range(NN).map(i=>{const r=i/n|0,c=i%n,o=[];
    if(c>0)o.push([i-1,P.h[r][c-1]]); if(c<n-1)o.push([i+1,P.h[r][c]]);
    if(r>0)o.push([i-n,P.v[r-1][c]]); if(r<n-1)o.push([i+n,P.v[r][c]]);
    return o;});
  P.ow=(P.owls||[]).map(o=>({cells:[o.r*n+o.c,o.r*n+o.c+1,(o.r+1)*n+o.c,(o.r+1)*n+o.c+1],s:o.s}));
  P.cellOw=range(NN).map(()=>[]); P.ow.forEach((o,k)=>o.cells.forEach(i=>P.cellOw[i].push(k)));
  // 要「1 到 N 各一次」的群組：列、行、鳥巢、斜線
  P.units=[];
  for(let r=0;r<n;r++) P.units.push({kind:'row',idx:r,cells:range(n).map(c=>r*n+c)});
  for(let c=0;c<n;c++) P.units.push({kind:'col',idx:c,cells:range(n).map(r=>r*n+c)});
  if(P.reg) for(let k=0;k<n;k++) P.units.push({kind:'reg',idx:k,cells:range(NN).filter(i=>P.reg[i]===k)});
  if(P.diag){ P.units.push({kind:'diag',idx:0,cells:range(n).map(k=>k*n+k)}); P.units.push({kind:'diag',idx:1,cells:range(n).map(k=>k*n+(n-1-k))}); }
  P.cu=range(NN).map(()=>[]); P.units.forEach((u,k)=>u.cells.forEach(i=>P.cu[i].push(k)));
  let odd=0; for(let v=1;v<=n;v+=2) odd|=1<<(v-1);
  P.em=range(NN).map(i=>!P.egg||!P.egg[i]?full:P.egg[i]===1?odd:full&~odd);
  P.gtOf=range(NN).map(()=>[]); (P.gt||[]).forEach(([hi,lo])=>{P.gtOf[hi].push([lo,1]); P.gtOf[lo].push([hi,-1]);});
  P.cg=(P.cages||[]); P.cellCg=range(NN).map(()=>[]); P.cg.forEach((c,k)=>c.cells.forEach(i=>P.cellCg[i].push(k)));
  return P;
}
function owlMask(o,i,g,n){
  let fs=0,e=0;
  for(const j of o.cells) if(j!==i){ if(g[j]) fs+=g[j]; else e++; }
  const rem=o.s-fs;
  let lo=e?rem-e*n:rem, hi=e?rem-e:rem;
  lo=Math.max(1,lo); hi=Math.min(n,hi);
  if(lo>hi) return 0;
  return ((1<<hi)-1)&~((1<<(lo-1))-1);
}
// 鳥群：剩下的總和，要能用「還沒用過、互不相同」的數字湊出來
function sumRange(mask,e){ // 從 mask 裡挑 e 個不同數字，最小和最大的總和
  const b=bitsOf(mask); if(b.length<e) return null;
  let lo=0,hi=0; for(let k=0;k<e;k++){lo+=b[k]; hi+=b[b.length-1-k];} return [lo,hi];
}
function cageMask(cg,i,g,n,full){
  let used=0,fs=0,e=0;
  for(const j of cg.cells) if(j!==i){ if(g[j]){ used|=1<<(g[j]-1); fs+=g[j]; } else e++; }
  let m=0; const rem=cg.s-fs;
  for(let v=1;v<=n;v++){ const b=1<<(v-1); if(used&b) continue;
    const rest=rem-v; if(e===0){ if(rest===0) m|=b; continue; }
    const r=sumRange(full&~used&~b,e); if(r&&rest>=r[0]&&rest<=r[1]) m|=b; }
  return m;
}
const above=(w,full)=>full&~((1<<w)-1), below=w=>(1<<(w-1))-1;
// 某一格在目前盤面下的基本候選數
function baseCand(P,g,i,UM){
  const n=P.n; let m=P.em[i];
  for(const u of P.cu[i]) m&=~UM[u];
  for(const [j,t] of P.nb[i]){const w=g[j]; if(w) m&=P.A[t][w];}
  for(const k of P.cellOw[i]) m&=owlMask(P.ow[k],i,g,n);
  for(const [j,s] of P.gtOf[i]){const w=g[j]; if(w) m&=s>0?above(w,P.full):below(w);}
  for(const k of P.cellCg[i]) m&=cageMask(P.cg[k],i,g,n,P.full);
  return m;
}
function unitMasks(P,g){
  const UM=Array(P.units.length).fill(0);
  for(let i=0;i<P.NN;i++) if(g[i]){const b=1<<(g[i]-1); for(const u of P.cu[i]) UM[u]|=b;}
  return UM;
}
// 數解答數量（到 limit 為止）；超過搜尋預算視為「不唯一」
function countSolutions(P,grid,limit=2,budget=250000){
  const n=P.n,NN=P.NN,g=grid.slice();
  const UM=unitMasks(P,g);
  let count=0,nodes=0;
  const go=()=>{
    if(++nodes>budget){count=limit;return;}
    let best=-1,bm=0,bn=99;
    for(let i=0;i<NN;i++) if(!g[i]){const m=baseCand(P,g,i,UM),k=popc(m); if(k<bn){bn=k;best=i;bm=m; if(k<=1)break;}}
    if(best<0){count++;return;}
    if(bn===0) return;
    const us=P.cu[best];
    for(let v=1;v<=n;v++) if(bm>>(v-1)&1){const b=1<<(v-1);
      g[best]=v; for(const u of us) UM[u]|=b; go(); g[best]=0; for(const u of us) UM[u]&=~b;
      if(count>=limit) return;}
  };
  go(); return count;
}
// 只照「列、行、鳥巢、斜線」隨機填滿一個答案（填不出來回傳 null）
function fillUnits(P,budget=40000){
  const n=P.n,NN=P.NN,g=Array(NN).fill(0),UM=Array(P.units.length).fill(0); let nodes=0;
  const go=()=>{
    if(++nodes>budget) return false;
    let best=-1,bm=0,bn=99;
    for(let i=0;i<NN;i++) if(!g[i]){ let m=P.full; for(const u of P.cu[i]) m&=~UM[u]; const k=popc(m); if(k<bn){bn=k;best=i;bm=m; if(k<=1)break;} }
    if(best<0) return true; if(!bn) return false;
    for(const v of shuffle(bitsOf(bm))){ const b=1<<(v-1); g[best]=v; for(const u of P.cu[best]) UM[u]|=b;
      if(go()) return true; g[best]=0; for(const u of P.cu[best]) UM[u]&=~b; }
    return false;
  };
  return go()?g:null;
}
// 鳥巢：先用規則的形狀（6×6、8×8、9×9 用方塊，其他用橫列）填好答案，
// 再把相鄰兩個巢裡「數字相同」的兩格互換，巢的形狀變得不規則，但每個巢仍然剛好 1 到 N
function growRegions(n){ // 從橫列開始，隨機交換邊界格子（每個巢大小不變、保持相連）
  const NN=n*n; let reg=range(NN).map(i=>i/n|0);
  const nbs=i=>{const r=i/n|0,c=i%n,o=[]; if(c>0)o.push(i-1); if(c<n-1)o.push(i+1); if(r>0)o.push(i-n); if(r<n-1)o.push(i+n); return o;};
  const connected=k=>{const cells=range(NN).filter(i=>reg[i]===k); const seen=new Set([cells[0]]),st=[cells[0]];
    while(st.length){const x=st.pop(); for(const y of nbs(x)) if(reg[y]===k&&!seen.has(y)){seen.add(y);st.push(y);}} return seen.size===cells.length;};
  let ok=0;
  for(let t=0;t<NN*40&&ok<NN*3;t++){
    const a=rnd(NN), ns=nbs(a).filter(b=>reg[b]!==reg[a]); if(!ns.length) continue;
    const A=reg[a], B=reg[ns[rnd(ns.length)]];
    const cs=range(NN).filter(x=>reg[x]===B&&nbs(x).some(y=>reg[y]===A)); if(!cs.length) continue;
    const c=cs[rnd(cs.length)]; reg[a]=B; reg[c]=A;
    if(connected(A)&&connected(B)) ok++; else { reg[a]=A; reg[c]=B; }
  }
  return reg;
}
function baseRegions(n){ const NN=n*n, box={4:[2,2],6:[2,3],8:[2,4],9:[3,3]}[n];
  return range(NN).map(i=>{const r=i/n|0,c=i%n; return box?Math.floor(r/box[0])*(n/box[1])+Math.floor(c/box[1]):r;}); }
function shapeRegions(reg,sol,n){
  reg=reg.slice(); const NN=n*n;
  const nbs=i=>{const r=i/n|0,c=i%n,o=[]; if(c>0)o.push(i-1); if(c<n-1)o.push(i+1); if(r>0)o.push(i-n); if(r<n-1)o.push(i+n); return o;};
  const connected=k=>{const cells=range(NN).filter(i=>reg[i]===k); const seen=new Set([cells[0]]),st=[cells[0]];
    while(st.length){const x=st.pop(); for(const y of nbs(x)) if(reg[y]===k&&!seen.has(y)){seen.add(y);st.push(y);}} return seen.size===cells.length;};
  let ok=0;
  for(let t=0;t<NN*80&&ok<NN*2;t++){
    const a=rnd(NN), A=reg[a], ns=nbs(a).filter(b=>reg[b]!==A); if(!ns.length) continue;
    const B=reg[ns[rnd(ns.length)]];
    const c=range(NN).find(x=>reg[x]===B&&sol[x]===sol[a]);
    if(c===undefined||!nbs(c).some(y=>reg[y]===A)) continue;
    reg[a]=B; reg[c]=A;
    if(connected(A)&&connected(B)) ok++; else { reg[a]=A; reg[c]=B; }
  }
  return reg;
}
function randomLatin(n){
  const NN=n*n;
  for(let tries=0;tries<60;tries++){
    const g=Array(NN).fill(0),rowM=Array(n).fill(0),colM=Array(n).fill(0); let steps=0;
    const go=i=>{ if(i===NN) return true; if(++steps>20000) return false;
      const r=i/n|0,c=i%n;
      for(const v of shuffle(range(n).map(x=>x+1))){const b=1<<(v-1); if(rowM[r]&b||colM[c]&b)continue;
        g[i]=v;rowM[r]|=b;colM[c]|=b; if(go(i+1))return true; g[i]=0;rowM[r]&=~b;colM[c]&=~b;}
      return false;};
    if(go(0)) return g;
  }
  const rp=shuffle(range(n)),cp=shuffle(range(n)),sp=shuffle(range(n));
  return range(NN).map(i=>sp[(rp[i/n|0]+cp[i%n])%n]+1);
}
function isLatin(g,n){
  for(let k=0;k<n;k++){let r=0,c=0;for(let j=0;j<n;j++){const a=g[k*n+j],b=g[j*n+k];if(!a||!b||a>n||b>n)return false;r|=1<<(a-1);c|=1<<(b-1);} if(r!==(1<<n)-1||c!==(1<<n)-1)return false;}
  return true;
}
