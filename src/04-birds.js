// ===================== 04 鳥：圖鑑資料、圖、叫聲 =====================
// 每隻鳥都畫在 viewBox -2 -3 24 24 裡：圓身體、頭朝右
const TAIL='<path d="M3 12.6 L-1.4 14.4 L-1 15.6 L3.2 16.4 Z" class="ln" fill="FILL"/>';
const BODY='<circle cx="10" cy="11" r="8.4" class="ln" fill="FILL"/>';
const svgWrap=(inner,extra='')=>`<svg viewBox="-2 -3 24 24" aria-hidden="true"${extra}>${inner}</svg>`;
const SPECIES={
  1:{key:'parrot',name:'玄鳳鸚鵡',role:'白點',rule:'兩格相差 1',ex:'3·4、5·6',
     full:true,fact:'原產澳洲。頭上的黃色冠羽會隨心情豎起或放下，臉頰上有一塊橘色圓斑。',
     svg:svgWrap(`<path d="M9 3.4 Q7.4 -1.4 11.6 -2.2" class="crest"/><path d="M10.8 3.2 Q10.6 -0.4 14 -0.8" class="crest"/>
      <path d="M3 12.6 L-1.4 14.4 L-1 15.6 L3.2 16.4 Z" class="bd-w"/><circle cx="10" cy="11" r="8.4" class="bd-w"/>
      <path d="M8.4 4.4 Q14.6 3 17.6 8.6 Q15.6 11 11.4 10.2 Q8.2 8.4 8.4 4.4 Z" fill="#ffe36e"/>
      <circle cx="13.2" cy="12.2" r="2.3" fill="#ff8f4f"/><path d="M5 13.4 Q8.6 17.6 13.4 16.4" class="wing-w"/>
      <circle cx="13.8" cy="7.5" r="1.05" class="eye-k"/><path d="M17.4 8.3 Q20.6 8.6 18 11 Z" fill="#b9a28a"/>`),
     call:[[1500,2100,.09],[1700,2300,.11]]},
  2:{key:'tit',name:'青背山雀',role:'黑點',rule:'一格剛好是另一格的兩倍',ex:'2·4、3·6',
     full:true,fact:'台灣中低海拔山區常見。黑色頭頂配上白色大臉頰，常成群在樹梢間跳來跳去找蟲吃。',
     svg:svgWrap(`<path d="M3 12.6 L-1.4 14.4 L-1 15.6 L3.2 16.4 Z" class="bd-b"/><circle cx="10" cy="11" r="8.4" class="bd-b"/>
      <ellipse cx="10.4" cy="10.4" rx="3.9" ry="2.6" transform="rotate(-14 10.4 10.4)" class="ck-w"/>
      <path d="M5 13.4 Q8.6 17.6 13.4 16.4" class="wing-b"/>
      <circle cx="13.6" cy="7.7" r="1.35" class="eye-w"/><circle cx="13.9" cy="7.6" r=".7" class="eye-k"/>
      <path d="M17.6 8.2 L21 9.4 L17.8 10.6 Z" fill="#f2a93b"/>`),
     call:[[3200,2600,.05],[3200,2600,.05],[3000,2400,.07]]},
  3:{key:'whiteeye',name:'綠繡眼',rule:'兩格相加剛好等於 N+1（N 是棋盤寬度）',ex:'6×6 裡 1·6、2·5、3·4',
     fact:'眼睛外圍有一圈白色眼圈，所以叫綠繡眼。都市公園很常見，最愛鑽進花叢裡吸花蜜。',
     svg:svgWrap(TAIL.replace('FILL','#8fbf45')+BODY.replace('FILL','#a6cf5d')+
      `<ellipse cx="10.4" cy="14.8" rx="5.6" ry="3.2" fill="#f1ecb8"/><ellipse cx="15.2" cy="11.6" rx="2.6" ry="2" fill="#ffd93a"/>
      <circle cx="13.7" cy="7.7" r="2.1" fill="#fff"/><circle cx="13.9" cy="7.7" r="1" class="eye-k"/>
      <path d="M17.6 8.6 L20.8 9.3 L17.7 10.1 Z" fill="#4a4a4a"/>`),
     call:[[2800,3400,.04],[3000,3500,.04],[2900,3400,.04],[3100,3600,.05]]},
  4:{key:'kingfisher',name:'翠鳥',rule:'兩格相差剛好 2',ex:'1·3、4·6',
     fact:'背上是閃亮的藍色，肚子是橘色。會停在水邊的樹枝上，看準了就俯衝進水裡抓魚。',
     svg:svgWrap(TAIL.replace('FILL','#2a7fc4')+BODY.replace('FILL','#2f8fd8')+
      `<ellipse cx="10.6" cy="14.6" rx="6.2" ry="3.6" fill="#f08a3c"/><ellipse cx="12" cy="9.8" rx="2.5" ry="1.3" fill="#f08a3c"/>
      <circle cx="15.8" cy="11.2" r="1.2" fill="#fff"/><circle cx="13.8" cy="7.3" r="1.1" class="eye-k"/>
      <path d="M17 7.6 L23.6 9.3 L17.2 10.6 Z" fill="#2b2b2b"/>`),
     call:[[3600,3400,.06],[3700,3400,.06]]},
  5:{key:'sparrow',name:'麻雀',rule:'兩格同為奇數，或同為偶數',ex:'1·5、2·6',
     fact:'臉頰上有一個黑色小斑點，是辨認牠的重點。總是成群住在人類房子附近，城市鄉下都看得到。',
     svg:svgWrap(TAIL.replace('FILL','#8a5a3b')+BODY.replace('FILL','#d8b58a')+
      `<path d="M2.4 8.6 Q3.6 2.6 10 2.6 Q16.4 2.6 18.2 8.2 Q12 6.6 2.4 8.6 Z" fill="#8a5a3b"/>
      <ellipse cx="12.6" cy="10.6" rx="3.2" ry="2.3" fill="#fff6e8"/><circle cx="12.4" cy="11" r=".95" fill="#2a2018"/>
      <ellipse cx="16.2" cy="12.8" rx="1.4" ry="1.9" fill="#2a2018"/>
      <circle cx="14" cy="7.6" r="1" class="eye-k"/><path d="M17.6 8.4 L20.4 9.4 L17.8 10.4 Z" fill="#3a3a3a"/>`),
     call:[[2200,1700,.07],[2300,1800,.07]]},
  O:{key:'owl',name:'領角鴞',role:'貓頭鷹',rule:'站在四格交界，頭上的數字是這四格的總和',ex:'四格 1、2、3、4 → 10',
     fact:'台灣低海拔最常見的貓頭鷹，頭上有兩撮像耳朵的羽毛。白天躲著睡覺，晚上出來抓老鼠和昆蟲。',
     svg:svgWrap(`<path d="M4.6 5 L4.4 -.8 L8.6 3.6 Z" fill="#8a6240" class="ln"/><path d="M15.4 5 L15.6 -.8 L11.4 3.6 Z" fill="#8a6240" class="ln"/>
      <circle cx="10" cy="11" r="8.4" class="ln" fill="#a87d52"/>
      <ellipse cx="10" cy="9.4" rx="6.8" ry="4.8" fill="#ead6b4"/>
      <circle cx="7.2" cy="9" r="2.3" fill="#ffcc3a"/><circle cx="12.8" cy="9" r="2.3" fill="#ffcc3a"/>
      <circle cx="7.3" cy="9" r="1.2" class="eye-k"/><circle cx="12.7" cy="9" r="1.2" class="eye-k"/>
      <path d="M9.2 10.8 L10.8 10.8 L10 12.8 Z" fill="#6b4a2c"/>
      <path d="M6.4 15.4 l1 .9 l1 -.9 M9.6 16.4 l1 .9 l1 -.9 M12.4 15.4 l1 .9 l1 -.9" stroke="#7a5634" stroke-width=".7" fill="none"/>`),
     call:[[420,380,.32],[400,360,.4]],wave:'sine'},
  6:{key:'magpie',name:'台灣藍鵲',role:'台灣特有種',rule:'兩格相差剛好 3',ex:'1·4、3·6',
     fact:'台灣特有種，有一條長長的藍尾巴，嘴和腳是紅色的。喜歡成群活動，家族成員還會一起幫忙照顧寶寶。',
     svg:svgWrap(`<path d="M3.6 12 L-6.4 18.4 L-5.4 20 L4 15.8 Z" fill="#2a5fc0" class="ln"/>
      <path d="M-6.4 18.4 L-8 19.6 L-7 21 L-5.4 20 Z" fill="#fff" class="ln"/>
      <circle cx="10" cy="11" r="8.4" class="ln" fill="#2f6ad0"/>
      <path d="M9.6 2.6 A8.4 8.4 0 0 1 18.3 9.6 Q13 12.4 8.4 9.2 Q7.4 5.6 9.6 2.6 Z" fill="#1b2230"/>
      <circle cx="13.8" cy="7.2" r="1.25" fill="#ffdf4a"/><circle cx="13.9" cy="7.2" r=".65" class="eye-k"/>
      <path d="M17.6 8 L21.6 9.4 L17.8 10.8 Z" fill="#e23b2e"/>`),
     call:[[900,650,.08],[880,640,.08],[900,620,.1]],wave:'sawtooth'},
  7:{key:'barbet',name:'五色鳥',role:'台灣特有種',rule:'一格剛好是另一格的三倍',ex:'1·3、2·6、3·9',
     fact:'台灣特有種，頭上有藍、黃、紅、黑好幾種顏色。會在樹幹上啄洞做窩，叫聲「郭、郭、郭」很像在敲木魚。',
     svg:svgWrap(TAIL.replace('FILL','#3f9a45')+BODY.replace('FILL','#4caf50')+
      `<ellipse cx="13.6" cy="7.6" rx="3.8" ry="3.2" fill="#2f8fd8"/><ellipse cx="15.2" cy="11.8" rx="2.6" ry="1.9" fill="#ffd93a"/>
      <circle cx="16.8" cy="9.6" r="1.05" fill="#e23b2e"/><path d="M11 4.4 Q13.4 3.4 16 4.6" stroke="#1b2230" stroke-width="1.1" fill="none"/>
      <circle cx="13.8" cy="7.5" r="1" class="eye-k"/><path d="M17.2 7.8 L21.2 9.2 L17.4 10.8 Z" fill="#333"/>`),
     call:[[620,600,.12],[620,600,.12],[620,600,.12],[620,600,.12]],wave:'triangle',gap:.12},
  // ---- 101 關以後的章節鳥 ----
  weaver:{key:'weaver',name:'織布鳥',role:'鳥巢',place:'',rule:'棋盤分成幾個不同顏色的鳥巢，每個鳥巢裡也要剛好 1 到 N 各一次',ex:'就像列和行一樣，同一個鳥巢裡不能重複',note:'',
     fact:'雄鳥會用草葉一根一根編織出吊掛在樹枝上的精巧鳥巢，巢編得漂亮，才會吸引母鳥。',
     svg:svgWrap(TAIL.replace('FILL','#d9a91f')+BODY.replace('FILL','#f2c230')+`<path d="M5 13.4 Q8.6 17.6 13.4 16.4" stroke="#b8860b" stroke-width="1" fill="none"/><path d="M11.4 4.4 Q17.4 4.4 18.4 9.4 Q16.6 13 12.6 12.4 Q10.4 10.4 11.4 4.4 Z" fill="#1b1b1b"/><circle cx="14.4" cy="7.8" r="1.25" fill="#c0392b"/><circle cx="14.5" cy="7.8" r=".6" class="eye-k"/><path d="M17.6 8 L21.4 9.4 L17.8 11 Z" fill="#555"/>`),
     call:[[2400,3200,.05],[3000,2200,.05],[2600,3400,.06]]},
  woodpecker:{key:'woodpecker',name:'小啄木',role:'啄木鳥箭頭',place:'',rule:'站在兩格之間，嘴巴指向數字比較大的那一格',ex:'嘴巴朝右，右邊的數字比較大',note:'（只畫一部分）',
     fact:'台灣最小的啄木鳥，常在都市公園的樹幹上邊爬邊敲，發出「篤篤篤」的聲音，找藏在樹皮裡的蟲吃。',
     svg:svgWrap(TAIL.replace('FILL','#6b5440')+BODY.replace('FILL','#7a6250')+`<path d="M4 11 h5 M3.4 13.4 h6 M4.4 15.8 h5.4" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/><path d="M8.4 4 Q14 1.6 17.6 6.4 Q13 6 8.4 6.6 Z" fill="#8a8f96"/><path d="M10.4 7 Q15.6 6.4 18 8.6 Q17 12.6 12.6 12.8 Q10 11.2 10.4 7 Z" fill="#fff"/><path d="M11 10.2 Q14 10.8 17 10.2" stroke="#6b5440" stroke-width="1" fill="none"/>${'<circle cx="14.2" cy="8" r=".95" class="eye-k"/>'}<path d="M17.8 8.2 L22.8 9 L17.9 9.9 Z" fill="#3a3a3a"/>`),
     call:[[900,880,.03],[900,880,.03],[900,880,.03],[900,880,.03],[900,880,.03]],wave:'square',gap:.03},
  quail:{key:'quail',name:'鵪鶉',role:'鳥蛋',place:'',rule:'格子角落的白蛋代表這格是奇數，藍蛋代表這格是偶數',ex:'白蛋：1、3、5…；藍蛋：2、4、6…',note:'（只放了一部分）',
     fact:'圓滾滾、尾巴很短，喜歡躲在草叢裡走來走去，不太愛飛。牠的蛋小小的，上面有一點一點的褐色斑紋。',
     svg:svgWrap(BODY.replace('FILL','#b48a5e')+`<ellipse cx="10.4" cy="15" rx="6" ry="3.4" fill="#e3c9a2"/><circle cx="6" cy="12" r=".8" fill="#5a3e2b"/><circle cx="8.4" cy="14.4" r=".8" fill="#5a3e2b"/><circle cx="5.6" cy="15" r=".7" fill="#5a3e2b"/><circle cx="11" cy="16.6" r=".7" fill="#5a3e2b"/><path d="M8.6 4.6 Q13.6 2.4 17.4 6.8" stroke="#5a3e2b" stroke-width="1.6" fill="none"/><path d="M11.4 9.2 Q14.6 8.6 17.6 9.4" stroke="#fff" stroke-width="1" fill="none"/><circle cx="14.4" cy="7.4" r=".95" class="eye-k"/><path d="M17.6 7.6 L19.8 8.4 L17.7 9.2 Z" fill="#555"/>`),
     call:[[1800,2600,.05],[2200,1600,.07],[1900,2700,.06]]},
  goose:{key:'goose',name:'鴻雁',role:'雁群斜線',place:'',rule:'兩條對角斜線上，也要 1 到 N 各一次',ex:'斜線就像雁群飛行時排成的 V 字',note:'',
     fact:'大型的雁，遷徙時會排成「人」字或 V 字隊形，輪流飛在最前面帶頭，可以節省力氣。在台灣是很少見的冬候鳥。',
     svg:svgWrap(TAIL.replace('FILL','#8a7a66')+BODY.replace('FILL','#a5947d')+`<ellipse cx="10.4" cy="15" rx="6" ry="3.6" fill="#e8dfd0"/><path d="M5 13.4 Q8.6 17.6 13.4 16.4" stroke="#6d5f4e" stroke-width="1" fill="none"/><path d="M9.6 2.6 Q12 2 14 3 Q13 8 12.4 12 Q10.6 8 9.6 2.6 Z" fill="#5a4636"/><path d="M14.6 9.8 Q16.6 11 15.6 13" stroke="#f4efe6" stroke-width="1.2" fill="none"/><circle cx="14.6" cy="7.4" r=".9" class="eye-k"/><path d="M17 7.6 L22.6 8.6 Q23.4 9.4 22.4 10 L17.2 10.2 Z" fill="#1b1b1b"/>`),
     call:[[520,460,.14],[560,480,.16]],wave:'sawtooth',gap:.1},
  starling:{key:'starling',name:'灰椋鳥',role:'鳥群總和',place:'',rule:'虛線圈起來的一群格子，加起來等於角落的數字，而且群裡的數字不能重複',ex:'總和 7 的兩格可以是 1+6、2+5、3+4',note:'（只圈了一部分）',
     fact:'臉頰白白的，嘴巴是橘色的。冬天會成群出現在台灣的農田和公園，一大群一起飛時，隊形不停變化，非常壯觀。',
     svg:svgWrap(TAIL.replace('FILL','#4a4f57')+BODY.replace('FILL','#5d636c')+`<ellipse cx="10.4" cy="15.4" rx="5.6" ry="3" fill="#8f949b"/><path d="M8.6 4 Q14 1.8 17.8 6.6 Q13 6.8 8.6 6.4 Z" fill="#2b2f36"/><ellipse cx="13.4" cy="9.6" rx="3.4" ry="2.4" fill="#fff"/><circle cx="14.4" cy="7.4" r=".95" class="eye-k"/><path d="M17.6 7.8 L21.6 8.8 L17.8 10 Z" fill="#f08a3c"/>`),
     call:[[2800,2200,.05],[2200,3000,.05],[3200,2600,.04],[2600,3400,.05]]},
  E:{key:'pheasant',name:'帝雉',role:'傳說',rule:'通過第 100 關才會出現',ex:'',
     fact:'台灣特有種，住在中高海拔的森林。雄鳥全身深藍黑色，眼睛周圍是紅色的，曾經被印在一千元鈔票上。',
     svg:svgWrap(`<path d="M3.4 12.4 L-7.4 15.2 L-7 17 L3.6 16.2 Z" fill="#1d2440" class="ln"/>
      <path d="M-1.6 13.6 L-1.2 16.6 M-4.4 14.4 L-4.1 16.9" stroke="#fff" stroke-width=".9"/>
      <circle cx="10" cy="11" r="8.4" class="ln" fill="#2c3460"/>
      <path d="M5 13 Q8.6 17.2 13.4 16" stroke="#9fb0e0" stroke-width=".9" fill="none"/>
      <ellipse cx="13.8" cy="7.6" rx="2.7" ry="2.1" fill="#e23b2e"/><circle cx="13.9" cy="7.6" r=".9" class="eye-k"/>
      <path d="M17.6 8.4 L20.6 9.4 L17.8 10.4 Z" fill="#d9d2c0"/>`),
     call:[[500,900,.18],[700,500,.14]],wave:'triangle'},
};
const SPECIES_ORDER=[1,2,3,4,5,'O',6,7,'weaver','woodpecker','quail','goose','starling','E'];
const birdSVG=t=>(SPECIES[t]||SPECIES[1]).svg;
// 頁面上靜態的 <span class="dot" data-bird="..."> 換成小鳥圖
function birdify(root=document){root.querySelectorAll('[data-bird]').forEach(d=>{if(!d.firstChild)d.innerHTML=birdSVG(isNaN(+d.dataset.bird)?d.dataset.bird:+d.dataset.bird);});}

// ---------- 叫聲：用 Web Audio 即時合成，不需要音檔 ----------
let AC=null;
function audio(){ if(!PROG.sound) return null;
  try{ if(!AC){const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; AC=new C();}
    if(AC.state==='suspended') AC.resume(); return AC; }catch(e){return null} }
function chirp(t,vol=.05){
  const ac=audio(); const sp=SPECIES[t]; if(!ac||!sp) return;
  let at=ac.currentTime+.01; const gap=sp.gap??.05;
  for(const [f0,f1,d] of sp.call){
    const o=ac.createOscillator(), g=ac.createGain();
    o.type=sp.wave||'sine'; o.frequency.setValueAtTime(f0,at); o.frequency.exponentialRampToValueAtTime(f1,at+d);
    g.gain.setValueAtTime(0,at); g.gain.linearRampToValueAtTime(sp.wave==='sawtooth'?vol*.4:vol,at+.01); g.gain.exponentialRampToValueAtTime(.0001,at+d);
    o.connect(g).connect(ac.destination); o.start(at); o.stop(at+d+.02); at+=d+gap;
  }
}
function blip(f=660,d=.06,vol=.04,type='triangle'){const ac=audio(); if(!ac) return;
  const o=ac.createOscillator(),g=ac.createGain(),at=ac.currentTime+.005; o.type=type; o.frequency.setValueAtTime(f,at);
  g.gain.setValueAtTime(vol,at); g.gain.exponentialRampToValueAtTime(.0001,at+d); o.connect(g).connect(ac.destination); o.start(at); o.stop(at+d+.02);}
