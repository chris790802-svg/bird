// ===================== 08 新手教學 =====================
const B_INLINE=t=>`<span class="dot" data-bird="${t}" style="position:relative;transform:none;width:22px;--n:1"></span>`;
const LESSONS=[
 {t:'目標：把 1 到 6 填滿每一列',
  html:'<p>先用 6×6 的棋盤當例子，它有 6 列 6 行。每一<b>橫列</b>都要剛好出現 1、2、3、4、5、6 各一次，每一<b>直行</b>也一樣。</p><p>這一題先不看鳥，只看數字。</p>',
  row:[1,2,'?',4,5,6], dots:null, q:'這一列還缺哪個數字？', opts:[3,5,6], ans:3,
  ok:'對！一列裡每個數字只能出現一次，所以缺的就是 3。', no:'這個數字已經在這一列出現過了，再找找看少了誰。'},
 {t:'鸚鵡：相鄰兩格差 1',
  html:`<p>兩格中間站了一隻<b>玄鳳鸚鵡</b> ${B_INLINE(1)}，代表這兩個數字<b>相差 1</b>，例如 2 和 3、5 和 4。</p>`,
  row:[6,'?'], dots:[1], q:'左邊是 6，右邊是多少？', opts:[3,4,5], ans:5,
  ok:'對！和 6 相差 1 的有 5 和 7，這題是 6×6，最大只到 6，所以是 5。', no:'鸚鵡代表相差 1 喔。6 減 1 是多少？'},
 {t:'沒有鸚鵡，也是線索',
  html:'<p>棋盤上<b>所有的鸚鵡都畫出來了</b>。所以兩格之間如果<b>沒有鸚鵡</b>，就代表它們<b>不是</b>連續數。</p><p>下面這一列還缺 2 和 4，要放進兩個問號裡。</p>',
  row:[1,'?',3,5,'?',6], dots:[0,1,0,0,0], q:'第二格（1 的右邊）應該填 2 還是 4？', opts:[2,4], ans:4, fill:{4:2},
  ok:'對！1 和 2 是連續數，中間應該要有鸚鵡，但這裡沒有，所以不能放 2，只能放 4。另一格自然就是 2。', no:'看看 1 和第二格之間有沒有鸚鵡？如果填 2，和 1 是連續數，應該要有鸚鵡才對。'},
 {t:'山雀：一格是另一格的兩倍',
  html:`<p>到了第二章會多出<b>青背山雀</b> ${B_INLINE(2)}，代表其中一個數字<b>剛好是另一個的兩倍</b>，例如 2 和 4、3 和 6。山雀也是全部畫出來的。</p><p>1 和 2 同時差 1 又是兩倍，這種情況一律畫山雀。</p>`,
  row:[3,'?'], dots:[2], q:'左邊是 3，右邊是多少？', opts:[1,4,6], ans:6,
  ok:'對！3 的兩倍是 6。3 的一半是 1.5，不是整數，所以只能是 6。', no:'山雀是兩倍關係。3 乘以 2 是多少？'},
 {t:'怎麼玩',
  html:'<ol class="howto"><li>點一下空格選中它，再按下方的數字填進去。</li><li>不確定的時候打開「筆記」，可以在格子裡記下可能的數字；打開「排除」，則是把確定不可能的數字劃掉。</li><li>卡住了按「提示」，小麻雀會告訴你下一步該看哪裡、為什麼。</li><li>越後面的章節會有新的鳥登場，每隻鳥都是一條新規則，遇到時會先介紹給你。</li></ol><p>從<b>闖關第 1 關</b>開始吧！</p>',
  final:true}
];
const T={i:0,solved:new Set()};
function tutRender(){
  const L=LESSONS[T.i];
  const st=$('tut-step'); st.innerHTML=LESSONS.map((_,k)=>`<i class="${k===T.i?'on':''}"></i>`).join('');
  st.setAttribute('aria-label',`第 ${T.i+1} 步，共 ${LESSONS.length} 步`);
  $('tut-title').textContent=L.t;
  const body=$('tut-body'); let h=L.html; const done=T.solved.has(T.i);
  if(L.row){
    const firstQ=L.row.indexOf('?');
    h+='<div class="mini">'+L.row.map((v,k)=>{
      let cell; if(v==='?'){ const f=done?(k===firstQ?L.ans:(L.fill&&L.fill[k])):''; cell=`<div class="mc ask${done?' ok':''}">${f||'?'}</div>`; }
      else cell=`<div class="mc">${v}</div>`;
      const g=k<L.row.length-1?`<div class="gap">${L.dots&&L.dots[k]?`<span class="dot" data-bird="${L.dots[k]}"></span>`:''}</div>`:'';
      return cell+g;}).join('')+'</div>';
    h+=`<p class="q">${L.q}</p><div class="opts">`+L.opts.map(o=>`<button data-o="${o}" class="${done&&o===L.ans?'right':''}">${o}</button>`).join('')+'</div>';
  }
  body.innerHTML=h; birdify(body);
  const fb=$('tut-fb'); fb.className='fb'; fb.textContent=done&&L.ok?L.ok:''; if(done) fb.classList.add('good');
  body.querySelectorAll('.opts button').forEach(b=>b.onclick=()=>{
    if(+b.dataset.o===L.ans){T.solved.add(T.i); tutRender(); chirp(L.dots&&L.dots[0]?L.dots[0]:1,.05);}
    else{b.classList.add('wrong'); fb.className='fb bad'; fb.textContent=L.no; blip(220,.12,.035,'sine');}
  });
  $('tut-prev').disabled=T.i===0;
  const nx=$('tut-next'); nx.textContent=L.final?'開始第 1 關':'下一步'; nx.disabled=!!L.row&&!done;
}
function tutOpen(){T.i=0;T.solved.clear();openSheet('tut');tutRender();$('tut-next').focus();}
function tutClose(){closeSheet('tut');try{localStorage.setItem('kp4-tut','1')}catch(e){}}
$('learn').onclick=tutOpen;
$('tut-close').onclick=tutClose;
$('tut-prev').onclick=()=>{if(T.i>0){T.i--;tutRender();}};
$('tut-next').onclick=()=>{ if(LESSONS[T.i].final){tutClose(); switchTo('level',()=>startLevel(1));} else {T.i++;tutRender();} };
