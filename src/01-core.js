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

// 題目物件：{n,tit,h,v,owls,sol,givens}；prep 補上推理用的結構（不存檔）
function prep(P){
  const n=P.n,NN=n*n;
  P.NN=NN; P.A=allowTable(n,P.tit);
  P.nb=range(NN).map(i=>{const r=i/n|0,c=i%n,o=[];
    if(c>0)o.push([i-1,P.h[r][c-1]]); if(c<n-1)o.push([i+1,P.h[r][c]]);
    if(r>0)o.push([i-n,P.v[r-1][c]]); if(r<n-1)o.push([i+n,P.v[r][c]]);
    return o;});
  P.ow=(P.owls||[]).map(o=>({cells:[o.r*n+o.c,o.r*n+o.c+1,(o.r+1)*n+o.c,(o.r+1)*n+o.c+1],s:o.s}));
  P.cellOw=range(NN).map(()=>[]); P.ow.forEach((o,k)=>o.cells.forEach(i=>P.cellOw[i].push(k)));
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
// 某一格在目前盤面下的基本候選數（同列、同行、旁邊已填格子的鳥、貓頭鷹）
function baseCand(P,g,i,rowM,colM){
  const n=P.n; let m=((1<<n)-1)&~rowM[i/n|0]&~colM[i%n];
  for(const [j,t] of P.nb[i]){const w=g[j]; if(w) m&=P.A[t][w];}
  for(const k of P.cellOw[i]) m&=owlMask(P.ow[k],i,g,n);
  return m;
}
function lineMasks(P,g){
  const n=P.n,rowM=Array(n).fill(0),colM=Array(n).fill(0);
  for(let i=0;i<P.NN;i++) if(g[i]){const b=1<<(g[i]-1);rowM[i/n|0]|=b;colM[i%n]|=b;}
  return [rowM,colM];
}
// 數解答數量（到 limit 為止）；超過搜尋預算視為「不唯一」
function countSolutions(P,grid,limit=2,budget=250000){
  const n=P.n,NN=P.NN,g=grid.slice();
  const [rowM,colM]=lineMasks(P,g);
  let count=0,nodes=0;
  const go=()=>{
    if(++nodes>budget){count=limit;return;}
    let best=-1,bm=0,bn=99;
    for(let i=0;i<NN;i++) if(!g[i]){const m=baseCand(P,g,i,rowM,colM),k=popc(m); if(k<bn){bn=k;best=i;bm=m; if(k<=1)break;}}
    if(best<0){count++;return;}
    if(bn===0) return;
    const r=best/n|0,c=best%n;
    for(let v=1;v<=n;v++) if(bm>>(v-1)&1){const b=1<<(v-1);
      g[best]=v;rowM[r]|=b;colM[c]|=b; go(); g[best]=0;rowM[r]&=~b;colM[c]&=~b;
      if(count>=limit) return;}
  };
  go(); return count;
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
