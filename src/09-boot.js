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
