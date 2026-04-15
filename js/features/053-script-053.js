// === NOVA: Homework Diamond Rewards (final override) ===
window.novaPlayDiamondRewardSfx = window.novaPlayDiamondRewardSfx || function(){
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = window.__novaRewardAudioCtx || new AC();
    window.__novaRewardAudioCtx = ctx;
    if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    const now = ctx.currentTime + 0.01;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    master.connect(ctx.destination);
    const notes = [880, 1174.66, 1567.98, 2093];
    notes.forEach((hz, i)=>{
      const t = now + i * 0.085;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(hz, t);
      o.frequency.exponentialRampToValueAtTime(hz * 1.04, t + 0.16);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.24);
    });
    // Shimmer tail
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2637, now + 0.25);
    shimmer.frequency.exponentialRampToValueAtTime(2349, now + 0.9);
    shimmerGain.gain.setValueAtTime(0.0001, now + 0.24);
    shimmerGain.gain.exponentialRampToValueAtTime(0.06, now + 0.32);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    shimmer.start(now + 0.24);
    shimmer.stop(now + 1.02);
  }catch(_){}
};

async function awardHomeworkDiamonds(hwId, correct, total, sObj){
  try{
    const p = Math.round((Number(correct||0)/Math.max(1, Number(total||0))) * 100);
    let amount = 0;
    if (p === 100) amount = 500;
    else if (p >= 80) amount = 250;
    else if (p >= 50) amount = 100;
    else if (p >= 40) amount = 20;
    else amount = 0;

    const s = (sObj && sObj.studentId) ? sObj.studentId : (window.selectedStudent && selectedStudent.studentId);
    const c = (sObj && sObj.classId) ? sObj.classId : (window.selectedStudent && selectedStudent.classId);
    if(!s || !c) return;

    // Transaction guard: mark first completion regardless of amount
    const rewardRef = database.ref('studentHomework/'+s+'/'+hwId+'/reward');
    let committed = false;
    await rewardRef.transaction(curr => {
      if (curr && curr.claimed) return curr;
      return { claimed:true, amount: amount, percent: p, claimedAt: Date.now() };
    }, function(err, commit, snap){ committed = !!commit; });

    if (!committed) return; // already completed earlier → no further action

    // If amount > 0, credit diamonds atomically and celebrate
    if (amount > 0){
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
      showHomeworkRewardOverlay(finalAmount, p, finalMul);
      try{
        if (typeof updateDiamondCount === 'function') updateDiamondCount();
      }catch(_){}
    }
  }catch(e){
    console.warn('awardHomeworkDiamonds error', e);
  }
}

function showHomeworkRewardOverlay(amount, percent, multiplier){
  const styleId = 'nova-hw-reward-overlay-style';
  const id = 'nova-hw-reward-overlay-final';
  if (!document.getElementById(styleId)){
    const st = document.createElement('style');
    st.id = styleId;
    st.textContent = `
      #${id}{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(2,6,14,.62);backdrop-filter:blur(4px)}
      #${id}.open{display:flex}
      #${id} .reward-card{position:relative;overflow:hidden;width:min(620px,92vw);border-radius:22px;padding:24px 24px 20px;
        background:linear-gradient(165deg,#172554,#0f172a 62%, #3f2b06 120%);border:1px solid rgba(147,197,253,.48);
        box-shadow:0 24px 58px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.18), 0 0 60px rgba(245,158,11,.2)}
      #${id} .reward-card::before{content:'';position:absolute;inset:-25% auto auto -20%;width:260px;height:260px;border-radius:999px;background:radial-gradient(circle,rgba(96,165,250,.35),transparent 70%);pointer-events:none}
      #${id} .reward-card::after{content:'';position:absolute;inset:auto -18% -35% auto;width:280px;height:280px;border-radius:999px;background:radial-gradient(circle,rgba(250,204,21,.32),transparent 72%);pointer-events:none}
      #${id} .reward-title{font-size:13px;font-weight:900;letter-spacing:1px;color:#c7d2fe;text-transform:uppercase}
      #${id} .reward-main{margin-top:8px;font-size:clamp(40px,8vw,72px);font-weight:900;color:#fef08a;text-shadow:0 0 20px rgba(250,204,21,.55)}
      #${id} .reward-meta{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:10px 0 16px}
      #${id} .meta-chip{
        padding:8px 12px;
        border-radius:999px;
        border:1px solid rgba(191,219,254,.42);
        background:rgba(15,23,42,.55);
        font-weight:750;
        color:#e2e8f0 !important;
      }
      #${id} .meta-chip,
      #${id} .meta-chip span,
      #${id} .meta-chip strong{
        color:#f8fafc !important;
        -webkit-text-fill-color:#f8fafc !important;
        text-shadow:0 1px 2px rgba(0,0,0,.35);
      }
      #${id} .meta-chip.bonus-chip{
        border-color: rgba(253,224,71,.78);
        color:#fef3c7;
        background: linear-gradient(90deg, rgba(120,53,15,.72), rgba(245,158,11,.58));
        box-shadow: 0 0 12px rgba(250,204,21,.36);
      }
      #${id}.champion-bonus .reward-card{
        box-shadow:0 24px 58px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.18), 0 0 88px rgba(250,204,21,.34);
      }
      #${id}.champion-bonus .reward-title{
        color:#fde68a;
        text-shadow:0 0 14px rgba(250,204,21,.45);
      }
      #${id} .reward-sub{font-size:14px;color:#dbeafe;opacity:.96;margin-bottom:14px}
      #${id} .reward-okay{border:none;border-radius:12px;padding:10px 16px;background:linear-gradient(180deg,#22c55e,#16a34a);color:#fff;font-weight:850;cursor:pointer}
      #${id} .conf{position:absolute;left:50%;top:46%;width:10px;height:16px;border-radius:5px;opacity:0;transform:translate(-50%,-50%);animation:novaConf 1.3s ease-out forwards}
      @keyframes novaConf{0%{opacity:0;transform:translate(-50%,-50%) scale(.7) rotate(0deg)}8%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(1) rotate(var(--r))}}
    `;
    document.head.appendChild(st);
  }
  let el = document.getElementById(id);
  if (!el){
    el = document.createElement('div');
    el.id = id;
    el.innerHTML = `
      <div class="reward-card">
        <div class="reward-title">Ödev Ödülü Kazandın</div>
        <div class="reward-main"><span class="num">+0</span> 💎</div>
        <div class="reward-meta">
          <div class="meta-chip">Başarı Oranı: <strong>%<span class="pct">0</span></strong></div>
          <div class="meta-chip">Performans: <strong class="grade">-</strong></div>
          <div class="meta-chip bonus-chip" style="display:none">Rozet Bonusu: <strong>x<span class="mul">1</span></strong></div>
        </div>
        <div class="reward-sub">Elmas ödülün hesabına eklendi. Böyle devam!</div>
        <button class="reward-okay" type="button">Harika!</button>
      </div>
    `;
    document.body.appendChild(el);
    el.querySelector('.reward-okay').addEventListener('click', ()=> el.classList.remove('open'));
  }
  const p = Math.max(0, Math.min(100, Number(percent || 0)));
  const mul = Math.max(1, Number(multiplier || 1));
  const grade = p >= 90 ? 'Efsane' : p >= 75 ? 'Çok İyi' : p >= 50 ? 'İyi' : 'Gelişimde';
  el.querySelector('.pct').textContent = String(Math.round(p));
  el.querySelector('.grade').textContent = grade;
  const bonusChip = el.querySelector('.bonus-chip');
  const mulEl = el.querySelector('.mul');
  if (bonusChip && mulEl){
    mulEl.textContent = String(mul);
    bonusChip.style.display = mul > 1 ? 'inline-flex' : 'none';
  }
  el.classList.toggle('champion-bonus', mul > 1);
  el.classList.add('open');
  if (typeof window.novaPlayDiamondRewardSfx === 'function'){
    window.novaPlayDiamondRewardSfx();
  }

  const numEl = el.querySelector('.num');
  const total = Math.max(0, Number(amount || 0));
  const t0 = performance.now();
  const dur = 900;
  const run = (now)=>{
    const progress = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - progress, 3);
    const cur = Math.round(total * eased);
    numEl.textContent = `+${cur}`;
    if (progress < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);

  const colors = ['#fde047','#34d399','#60a5fa','#f472b6','#f97316','#a78bfa'];
  for(let i=0;i<36;i++){
    const c = document.createElement('span');
    c.className = 'conf';
    c.style.background = colors[i % colors.length];
    const ang = (Math.PI * 2 * i) / 36;
    const dist = 130 + Math.random() * 120;
    c.style.setProperty('--x', `${Math.cos(ang) * dist}px`);
    c.style.setProperty('--y', `${Math.sin(ang) * dist}px`);
    c.style.setProperty('--r', `${(Math.random() * 540 - 270).toFixed(0)}deg`);
    c.style.animationDelay = `${(Math.random() * 0.2).toFixed(2)}s`;
    el.appendChild(c);
    setTimeout(()=> c.remove(), 1500);
  }

  const diamondValueEl = document.getElementById('diamond-value');
  const diamondHeaderEl = document.getElementById('currentDiamonds');
  [diamondValueEl, diamondHeaderEl].forEach(node=>{
    if(!node) return;
    node.style.transition = 'transform .2s ease, text-shadow .2s ease';
    node.style.transform = 'scale(1.18)';
    node.style.textShadow = '0 0 16px rgba(250,204,21,.8)';
    setTimeout(()=>{ node.style.transform=''; node.style.textShadow=''; }, 550);
  });

  // Otomatik kapanma yok: ogrenci kendisi "Harika!" ile kapatir.
}
