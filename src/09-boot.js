// ===================== 09 啟動 =====================
birdify();
function syncSound(){ $('btn-sound').setAttribute('aria-pressed',PROG.sound); $('btn-sound').textContent=PROG.sound?'音效開':'音效關'; }
$('btn-sound').onclick=()=>{ PROG.sound=!PROG.sound; saveProg(); syncSound(); if(PROG.sound) chirp(1,.05); };
$('btn-dex').onclick=openDex; $('btn-garden').onclick=openGarden; $('btn-ach').onclick=openAch;
syncSound();

// ---- 外觀：自動（跟著手機）、淺色、深色 ----
const THEMES=['auto','light','dark'], THEME_NAME={auto:'自動',light:'淺色',dark:'深色'};
function applyTheme(){ const t=PROG.theme||'auto', root=document.documentElement;
  if(t==='auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme',t);
  $('btn-theme').textContent='外觀：'+THEME_NAME[t]; }
$('btn-theme').onclick=()=>{ PROG.theme=THEMES[(THEMES.indexOf(PROG.theme||'auto')+1)%3]; saveProg(); applyTheme(); };
if(PROG.theme&&PROG.theme!=='auto') applyTheme(); else $('btn-theme').textContent='外觀：自動';

// ---- 頁首：樹枝上的小鳥和鳥籠 ----
(function banner(){
  const nest=(t,x,y,w,flip)=>{ const inner=`<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="-2 -3 24 24">${birdSVG(t).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg>`;
    return `<g class="perch" data-bird="${t}">${flip?`<g transform="translate(${2*x+w},0) scale(-1,1)">${inner}</g>`:inner}</g>`; };
  const leaf=(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="3.4" transform="rotate(${r} ${x} ${y})" fill="var(--leaf)"/>`;
  const bars=[0,1,2,3,4,5,6].map(k=>{const x=304+k*6; return `<line x1="${x}" y1="46" x2="${x}" y2="84"/>`;}).join('');
  $('banner').innerHTML=
    `<path d="M-14 22 Q90 34 180 22 T372 12" fill="none" stroke="var(--branch)" stroke-width="5" stroke-linecap="round"/>`+
    `<path d="M120 28 Q132 40 150 44" fill="none" stroke="var(--branch)" stroke-width="3" stroke-linecap="round"/>`+
    `<path d="M252 18 Q262 6 276 2" fill="none" stroke="var(--branch)" stroke-width="3" stroke-linecap="round"/>`+
    leaf(30,30,20)+leaf(70,33,-15)+leaf(148,46,30)+leaf(160,40,-30)+leaf(214,22,15)+leaf(276,4,-20)+leaf(284,10,25)+leaf(360,16,-10)+leaf(372,10,30)+
    nest(2,36,4,26)+nest(3,92,8,22)+nest(1,190,-4,28,true)+nest(5,140,26,20)+
    `<g class="cage-swing"><g stroke="var(--cage)" stroke-width="1.6" fill="none">`+
      `<line x1="322" y1="14" x2="322" y2="28"/><circle cx="322" cy="31" r="3"/>`+
      `<path d="M302 46 Q302 33 322 33 Q342 33 342 46"/><line x1="302" y1="46" x2="342" y2="46"/>${bars}`+
      `<line x1="304" y1="72" x2="340" y2="72"/></g>`+
      `<rect x="299" y="83" width="46" height="5" rx="2.5" fill="var(--cage)"/>`+
      nest(1,312,52,20)+`</g>`;
  $('banner').querySelectorAll('.perch').forEach(g=>g.addEventListener('click',()=>{
    const t=isNaN(+g.dataset.bird)?g.dataset.bird:+g.dataset.bird; chirp(t,.05);
    if(RM) return; g.classList.remove('hop'); void g.getBoundingClientRect(); g.classList.add('hop'); }));
})();
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
