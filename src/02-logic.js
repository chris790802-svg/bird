// ===================== 02 模擬人類推理：評難度、教學提示 =====================
// 技巧：1 單一候選  2 唯一位置  3 鄰格推理（看旁邊格子的可能性）  4 數對
const TECH_NAME={1:'只剩一個可能',2:'唯一位置',3:'看鄰居的可能',4:'數對'};
const TECH_W={1:1,2:2,3:6,4:12};
function unitCells(n,u){return u<n?range(n).map(k=>u*n+k):range(n).map(k=>k*n+(u-n))}

function logicSolve(P,start,maxPlace=Infinity){
  const n=P.n,NN=P.NN,g=start.slice();
  const [rowM,colM]=lineMasks(P,g);
  const C=Array(NN).fill(0), elimTech=Array(NN).fill(0);
  for(let i=0;i<NN;i++) if(!g[i]) C[i]=baseCand(P,g,i,rowM,colM);
  const units=range(2*n).map(u=>unitCells(n,u));
  const steps=[];
  const place=(i,v,tech,info)=>{
    g[i]=v; const b=1<<(v-1), r=i/n|0, c=i%n; rowM[r]|=b; colM[c]|=b; C[i]=0;
    steps.push({i,v,tech,info});
    for(let k=0;k<n;k++){const a=r*n+k,d=k*n+c; if(!g[a])C[a]&=~b; if(!g[d])C[d]&=~b;}
    for(const [j,t] of P.nb[i]) if(!g[j]) C[j]&=P.A[t][v];
    for(const k of P.cellOw[i]) for(const j of P.ow[k].cells) if(!g[j]) C[j]&=owlMask(P.ow[k],j,g,n);
  };
  const owlFeasible=(o,i,v)=>{let lo=v,hi=v;
    for(const j of o.cells) if(j!==i){ if(g[j]){lo+=g[j];hi+=g[j];} else {const m=C[j]; if(!m) return false; lo+=lowBit(m); hi+=32-Math.clz32(m);} }
    return lo<=o.s&&o.s<=hi;};
  const arc=()=>{let changed=false;
    for(let i=0;i<NN;i++) if(!g[i]){ const m=C[i]; let keep=0;
      for(const v of bitsOf(m)){ let ok=true;
        for(const [j,t] of P.nb[i]) if(!g[j]&&!(C[j]&P.A[t][v])){ok=false;break;}
        if(ok) for(const k of P.cellOw[i]) if(!owlFeasible(P.ow[k],i,v)){ok=false;break;}
        if(ok) keep|=1<<(v-1); }
      if(keep!==m){C[i]=keep;elimTech[i]=Math.max(elimTech[i],3);changed=true;} }
    return changed;};
  const pairs=()=>{let changed=false;
    for(const U of units){ const em=U.filter(i=>!g[i]);
      for(let a=0;a<em.length;a++){ const ma=C[em[a]]; if(popc(ma)!==2) continue;
        for(let b=a+1;b<em.length;b++) if(C[em[b]]===ma)
          for(const i of em) if(i!==em[a]&&i!==em[b]&&(C[i]&ma)){C[i]&=~ma;elimTech[i]=Math.max(elimTech[i],4);changed=true;} } }
    return changed;};

  while(steps.length<maxPlace){
    let empty=0; for(let i=0;i<NN;i++) if(!g[i]){ empty++; if(!C[i]) return {g,steps,stuck:true,contradiction:true}; }
    if(!empty) return {g,steps,solved:true};
    let found=false;
    for(let i=0;i<NN;i++) if(!g[i]&&popc(C[i])===1){ place(i,lowBit(C[i]),Math.max(1,elimTech[i]),{kind:'single'}); found=true; break; }
    if(found) continue;
    outer: for(let u=0;u<units.length;u++){ const U=units[u];
      for(let v=1;v<=n;v++){ const b=1<<(v-1); let cnt=0,at=-1,present=false;
        for(const i of U){ if(g[i]===v){present=true;break;} if(!g[i]&&(C[i]&b)){cnt++;at=i;} }
        if(!present&&cnt===1){ let t=2; for(const i of U) t=Math.max(t,elimTech[i]);
          place(at,v,t,{kind:'hidden',unit:u<n?'row':'col',idx:u<n?u:u-n}); found=true; break outer; } } }
    if(found) continue;
    if(arc()) continue;
    if(pairs()) continue;
    return {g,steps,stuck:true,C};
  }
  return {g,steps,partial:true,C};
}
function gradePuzzle(P){
  const r=logicSolve(P,P.givens);
  let score=0,max=0; for(const s of r.steps){score+=TECH_W[s.tech]||1; max=Math.max(max,s.tech);}
  if(!r.solved){score+=1000; max=5;}
  return {score,max};
}
