// ===================== 12 提示次數：最多 5 次，每 12 小時恢復 1 次，看廣告立刻恢復 =====================
const HINT_MAX=5, HINT_REGEN=12*3600*1000, AD_SECONDS=15;
function hintState(){
  if(!PROG.hintE) PROG.hintE={n:HINT_MAX,t:Date.now()};
  const h=PROG.hintE, now=Date.now();
  if(h.n>=HINT_MAX){ h.n=HINT_MAX; h.t=now; return h; }
  const k=Math.floor((now-h.t)/HINT_REGEN);
  if(k>0){ h.n=Math.min(HINT_MAX,h.n+k); h.t=h.n>=HINT_MAX?now:h.t+k*HINT_REGEN; saveProg(); }
  return h;
}
function nextHintIn(){ const h=hintState(); return h.n>=HINT_MAX?0:Math.max(0,h.t+HINT_REGEN-Date.now()); }
const fmtWait=ms=>{ const m=Math.ceil(ms/60000), hh=Math.floor(m/60), mm=m%60; return hh?`${hh} 小時 ${mm} 分`:`${mm} 分`; };
function useHint(){
  const h=hintState(); if(h.n<=0){ openHintOut(); return false; }
  if(h.n>=HINT_MAX) h.t=Date.now();
  h.n--; saveProg(); refreshHintBtn(); return true;
}
function refreshHintBtn(){
  const n=hintState().n, b=$('hint');
  b.innerHTML=`提示 <span class="hint-n${n?'':' zero'}">${n}</span>`;
  b.setAttribute('aria-label',`提示，剩下 ${n} 次`);
}
setInterval(refreshHintBtn,60000);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') refreshHintBtn(); });

// ---------- 提示用完 ----------
function openHintOut(){
  const h=hintState();
  $('hoCount').textContent=`${h.n} / ${HINT_MAX}`;
  $('hoWait').textContent=h.n>=HINT_MAX?'提示已經滿了。':`下一次提示會在 ${fmtWait(nextHintIn())}後恢復。`;
  $('hoAd').disabled=h.n>=HINT_MAX;
  openSheet('hintOut');
}
$('hoAd').onclick=()=>{ closeSheet('hintOut'); playAd(); };

// ---------- 示意廣告（不連到任何地方） ----------
let AD=null;
function playAd(){
  const left=$('adLeft'), bar=$('adBar'), done=$('adDone'), skip=$('adSkip');
  done.hidden=true; skip.hidden=false; bar.style.width='0%';
  const t0=Date.now(); openSheet('ad'); chirp(1,.04);
  clearInterval(AD);
  AD=setInterval(()=>{
    const s=(Date.now()-t0)/1000, r=Math.max(0,AD_SECONDS-s);
    left.textContent=r>0?`${Math.ceil(r)} 秒後可以領取提示`:'看完了！';
    bar.style.width=Math.min(100,s/AD_SECONDS*100)+'%';
    if(r<=0){ clearInterval(AD); AD=null; done.hidden=false; skip.hidden=true; done.focus(); blip(988,.12,.04); }
  },200);
}
$('adDone').onclick=()=>{
  const h=hintState(); h.n=Math.min(HINT_MAX,h.n+1); if(h.n>=HINT_MAX) h.t=Date.now();
  saveProg(); refreshHintBtn(); closeSheet('ad'); toast('恢復了 1 次提示！',5); chirp(5,.05);
};
$('adSkip').onclick=()=>{ clearInterval(AD); AD=null; closeSheet('ad'); toast('廣告沒有看完，提示沒有恢復'); };
refreshHintBtn();
