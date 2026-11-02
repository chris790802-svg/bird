// ===================== 09 啟動 =====================
birdify();
function syncSound(){ $('btn-sound').setAttribute('aria-pressed',PROG.sound); $('btn-sound').textContent=PROG.sound?'音效開':'音效關'; }
$('btn-sound').onclick=()=>{ PROG.sound=!PROG.sound; saveProg(); syncSound(); if(PROG.sound) chirp(1,.05); };
$('btn-dex').onclick=openDex; $('btn-garden').onclick=openGarden; $('btn-ach').onclick=openAch;
syncSound();
(function boot(){
  // 分享連結 #p-代碼：直接打開那一題
  const h=location.hash.replace(/^#/,'');
  if(/^p-[0-9a-z-]+$/i.test(h)){ const o=decodeCode(h.slice(2)); if(o){ $('codeIn').value=h.slice(2).toUpperCase(); switchTo('studio',()=>withLoading(o.n,'出題中…',()=>{const P=puzzleFromCode(o); S.extra={code:P.label.code}; startPuzzle(P,'studio');}),true); return; } }
  let m='level'; try{m=localStorage.getItem('kp4-mode')||'level'}catch(e){}
  if(m==='race'||m==='studio') m='level'; // 工作室、雙人競速暫時隱藏
  if(m==='level'){ if(loadMode('level')){ buildBoard(); render(); $('win').hidden=!S.done; syncPanels(); } else startLevel(PROG.max); }
  else switchTo(m);
})();
let seenTut=false; try{seenTut=!!localStorage.getItem('kp4-tut')}catch(e){}
if(!seenTut) tutOpen();

// ---- 自動更新：放在 GitHub Pages 時，打開或切回來就檢查有沒有新版本 ----
(function(){
  if(!/^https?:$/.test(location.protocol)) return;
  const mine=(document.querySelector('meta[name="build"]')||{}).content; if(!mine) return;
  let checking=false;
  async function check(){
    if(checking) return; checking=true;
    try{
      const r=await fetch(location.pathname+'?v='+Date.now(),{cache:'no-store'});
      if(!r.ok) return;
      const m=(await r.text()).match(/<meta name="build" content="([0-9a-f]+)">/);
      if(!m||m[1]===mine) return;
      let tried=null; try{tried=sessionStorage.getItem('kp4-reload')}catch(e){}
      if(tried===m[1]) return; // 已經為這個版本重新載入過，避免一直重來
      try{sessionStorage.setItem('kp4-reload',m[1])}catch(e){}
      save(); toast('有新版本，重新載入中…',1);
      setTimeout(()=>location.replace(location.pathname+'?v='+m[1]),900);
    }catch(e){} finally{checking=false;}
  }
  setTimeout(check,1500);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') check(); });
})();
