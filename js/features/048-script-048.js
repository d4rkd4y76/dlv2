/* === NOVA: Homework Diamond Rewards (one-time per HW/student) === */
async function awardHomeworkDiamonds(hwId, correct, total, sObj){
  try{
    const p = Math.round((Number(correct||0)/Math.max(1, Number(total||0))) * 100);
    let amount = 0;
    if (p >= 95) amount = 500;
    else if (p >= 80) amount = 250;
    else if (p >= 50) amount = 100;
    else if (p >= 40) amount = 20;
    else amount = 0;
    /* Mark first completion regardless of amount */
    const s = (sObj && sObj.studentId) ? sObj.studentId : (window.selectedStudent && selectedStudent.studentId);
    const c = (sObj && sObj.classId) ? sObj.classId : (window.selectedStudent && selectedStudent.classId);
    if(!s || !c) return;

    const rewardRef = database.ref('studentHomework/'+s+'/'+hwId+'/reward');
    let committed = false;
    await rewardRef.transaction(curr => {
      if (curr && curr.claimed) return curr;
      return { claimed: true, amount: amount, percent: p, claimedAt: Date.now() };
    }, function(err, commit, snap){
      committed = !!commit;
    });

    if (!committed) return; // already claimed earlier

    if (amount <= 0) { return; }

    const userRef = database.ref('classes/'+c+'/students/'+s);
    var finalAmount = amount;
    var finalMul = 1;
    await userRef.transaction(user => {
      user = user || {};
      var gain = computeChampionDiamondGain(amount, user);
      finalMul = Number(gain.multiplier || 1);
      finalAmount = Number(gain.total || amount);
      user.diamond = Math.min(25000, Number(user.diamond||0) + finalAmount);
      user.lastDiamondUpdate = Date.now();
      return user;
    });

    // Visual celebration (no DB writes)
    showHomeworkRewardOverlay(finalAmount, p, finalMul);

    // Try to refresh on-screen counters
    try{
      if (typeof updateDiamondCount === 'function') updateDiamondCount();
      else {
        const dv = document.getElementById('diamond-value');
        if (dv){
          const snap = await userRef.child('diamond').get();
          dv.textContent = String(snap && snap.val ? (snap.val()||0) : '');
        }
      }
    }catch(_){}

  }catch(e){
    console.warn('awardHomeworkDiamonds error', e);
  }
}

function showHomeworkRewardOverlay(amount, percent, multiplier){
  const id = 'nova-hw-reward-overlay';
  let el = document.getElementById(id);
  if (!el){
    el = document.createElement('div');
    el.id = id;
    el.className = 'reward-overlay'; // CSS already present in app
    el.innerHTML = `
      <div class="reward-card">
        <div class="reward-title">ÖDEV ÖDÜLÜ</div>
        <div class="reward-amount"><span class="num"></span> 💎</div>
        <div class="reward-sub">%<span class="pct"></span> başarıyla tamamladın!</div>
        <button class="reward-okay">Harika!</button>
      </div>
    `;
    document.body.appendChild(el);
    const style = document.createElement('style');
    style.textContent = `
      #${id}{ display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:99999; align-items:center; justify-content:center; }
      #${id} .reward-card{ background:linear-gradient(180deg,#0b1c3a,#071229); border:2px solid rgba(0,220,255,.35); color:#e9f4ff; border-radius:18px; padding:24px 28px; text-align:center; box-shadow:0 12px 40px rgba(0,0,0,.65), inset 0 0 24px rgba(0,200,255,.2); min-width: clamp(280px, 40vw, 520px); }
      #${id} .reward-title{ font-weight:900; letter-spacing:.5px; margin-bottom:8px; text-shadow:0 0 12px rgba(0,255,255,.5); }
      #${id} .reward-amount{ font-size: clamp(36px, 5vw, 72px); font-weight:900; margin: 6px 0 8px 0; filter: drop-shadow(0 0 14px rgba(0,255,255,.45)); }
      #${id} .reward-sub{ opacity:.9; margin-bottom:14px; }
      #${id} .reward-okay{ background:#10b981; border:none; color:#fff; font-weight:800; padding:10px 16px; border-radius:12px; cursor:pointer; }
      #${id} .float-diamond{ position:absolute; font-size: 24px; pointer-events:none; animation: floatUp 1100ms ease-out forwards; }
      @keyframes floatUp{ from{ transform: translateY(10px); opacity:.0;} to{ transform: translateY(-80px); opacity:0;} }
    `;
    document.head.appendChild(style);

    el.querySelector('.reward-okay').addEventListener('click', ()=> el.style.display='none');
  }
  el.querySelector('.num').textContent = String(amount);
  el.querySelector('.pct').textContent = String(percent);
  el.style.display = 'flex';
  // spawn a few floating diamonds
  for(let i=0;i<12;i++){
    const d = document.createElement('div');
    d.className = 'float-diamond';
    d.textContent = '💎';
    d.style.left = Math.round(30 + Math.random()*40)+'%';
    d.style.top = Math.round(40 + Math.random()*10)+'%';
    el.appendChild(d);
    setTimeout(()=> d.remove(), 1100+Math.random()*500);
  }
  // auto-hide after 3.5s if not clicked
  setTimeout(()=>{ if (el.style.display==='flex') el.style.display='none'; }, 3500);
}
