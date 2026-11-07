// ===================== 02 模擬人類推理：評難度、教學提示 =====================
// 技巧：1 單一候選  2 唯一位置  3 鄰格推理（看旁邊格子的可能性）  4 數對
const TECH_NAME={1:'只剩一個可能',2:'唯一位置',3:'看鄰居的可能',4:'數對'};
const TECH_W={1:1,2:2,3:6,4:12};

function logicSolve(P,start,maxPlace=Infinity){
  const n=P.n,NN=P.NN,g=start.slice(),full=P.full;
  const UM=unitMasks(P,g);
  const C=Array(NN).fill(0), elimTech=Array(NN).fill(0);
  for(let i=0;i<NN;i++) if(!g[i]) C[i]=baseCand(P,g,i,UM);
  const steps=[]; let adv=0;
  const place=(i,v,tech,info)=>{
    g[i]=v; const b=1<<(v-1); C[i]=0;
    for(const u of P.cu[i]){ UM[u]|=b; for(const j of P.units[u].cells) if(!g[j]) C[j]&=~b; }
    steps.push({i,v,tech,info});
    for(const [j,t] of P.nb[i]) if(!g[j]) C[j]&=P.A[t][v];
    for(const k of P.cellOw[i]) for(const j of P.ow[k].cells) if(!g[j]) C[j]&=owlMask(P.ow[k],j,g,n);
    for(const [j,s] of P.gtOf[i]) if(!g[j]) C[j]&=s>0?below(v):above(v,full);
    for(const k of P.cellCg[i]) for(const j of P.cg[k].cells) if(!g[j]) C[j]&=cageMask(P.cg[k],j,g,n,full);
  };
  const lo=m=>lowBit(m), hi=m=>32-Math.clz32(m);
  const owlFeasible=(o,i,v)=>{let a=v,b=v;
    for(const j of o.cells) if(j!==i){ if(g[j]){a+=g[j];b+=g[j];} else {const m=C[j]; if(!m) return false; a+=lo(m); b+=hi(m);} }
    return a<=o.s&&o.s<=b;};
  const cageFeasible=(cg,i,v)=>{let a=v,b=v;
    for(const j of cg.cells) if(j!==i){ if(g[j]){ if(g[j]===v) return false; a+=g[j];b+=g[j]; } else { const m=C[j]&~(1<<(v-1)); if(!m) return false; a+=lo(m); b+=hi(m);} }
    return a<=cg.s&&cg.s<=b;};
  const arc=()=>{let changed=false;
    for(let i=0;i<NN;i++) if(!g[i]){ const m=C[i]; let keep=0;
      for(const v of bitsOf(m)){ let ok=true;
        for(const [j,t] of P.nb[i]) if(!g[j]&&!(C[j]&P.A[t][v])){ok=false;break;}
        if(ok) for(const [j,s] of P.gtOf[i]) if(!g[j]&&!(C[j]&(s>0?below(v):above(v,full)))){ok=false;break;}
        if(ok) for(const k of P.cellOw[i]) if(!owlFeasible(P.ow[k],i,v)){ok=false;break;}
        if(ok) for(const k of P.cellCg[i]) if(!cageFeasible(P.cg[k],i,v)){ok=false;break;}
        if(ok) keep|=1<<(v-1); }
      if(keep!==m){C[i]=keep;elimTech[i]=Math.max(elimTech[i],3);return true;} } // 像人一樣：一次只想通一格
    return false;};
  const pairs=()=>{let changed=false;
    for(const U of P.units){ const em=U.cells.filter(i=>!g[i]);
      for(let a=0;a<em.length;a++){ const ma=C[em[a]]; if(popc(ma)!==2) continue;
        for(let b=a+1;b<em.length;b++) if(C[em[b]]===ma)
          for(const i of em) if(i!==em[a]&&i!==em[b]&&(C[i]&ma)){C[i]&=~ma;elimTech[i]=Math.max(elimTech[i],4);changed=true;}
          if(changed) return true; } }
    return false;};

  while(steps.length<maxPlace){
    let empty=0; for(let i=0;i<NN;i++) if(!g[i]){ empty++; if(!C[i]) return {g,steps,stuck:true,contradiction:true}; }
    if(!empty) return {g,steps,solved:true,adv};
    let found=false;
    for(let i=0;i<NN;i++) if(!g[i]&&popc(C[i])===1){ place(i,lowBit(C[i]),Math.max(1,elimTech[i]),{kind:'single'}); found=true; break; }
    if(found) continue;
    outer: for(const U of P.units){
      for(let v=1;v<=n;v++){ const b=1<<(v-1); let cnt=0,at=-1,present=false;
        for(const i of U.cells){ if(g[i]===v){present=true;break;} if(!g[i]&&(C[i]&b)){cnt++;at=i;} }
        if(!present&&cnt===1){ let t=2; for(const i of U.cells) t=Math.max(t,elimTech[i]);
          place(at,v,t,{kind:'hidden',unit:U.kind,idx:U.idx}); found=true; break outer; } } }
    if(found) continue;
    if(arc()){adv++; continue;}
    if(pairs()){adv++; continue;}
    return {g,steps,stuck:true,C,adv};
  }
  return {g,steps,partial:true,C,adv};
}
function gradePuzzle(P){
  const r=logicSolve(P,P.givens);
  let score=0,max=0; for(const s of r.steps){score+=TECH_W[s.tech]||1; max=Math.max(max,s.tech);}
  if(!r.solved){score+=1000; max=5;}
  return {score,max,adv:r.adv};
}
