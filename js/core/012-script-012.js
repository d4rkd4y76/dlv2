// === NOVA: Sürpriz Kutu Mantığı (tek galibiyet) ===
let sbListenersAttached = false;
function initSurpriseBox(){
  try{
    if(!selectedStudent?.studentId) return;
    const box = document.getElementById('surprise-box');
    const counterEl = document.getElementById('surprise-box-counter');
    if(!box || !counterEl) return;

    // Kullanıcı düğümü
    const userRef = database.ref(`classes/${selectedStudent.classId}/students/${selectedStudent.studentId}`);

    // UI sadece surpriseReady ile beslensin (tam öğrenci düğümünü çekmeyelim).
    const updateUI = (snap)=>{
      const ready = !!(snap && snap.exists && snap.exists() ? snap.val() : false);
      counterEl.textContent = ready ? "Hazır!" : "Hazır değil";
      box.classList.toggle('active', ready);
      box.classList.toggle('locked', !ready);
    };
    userRef.child('surpriseReady').on('value', updateUI);

    if(!window.__sbListenersAttached){
      window.__sbListenersAttached = true;
      box.addEventListener('click', async ()=>{
        const snap = await userRef.once('value');
        const data = snap.val() || {};
        const ready = !!data.surpriseReady;

        if(!ready){
          await showAlert("Kutuyu açmanız için 1 düello galibiyeti gereklidir.");
          return;
        }

        // Ödül RNG (istediğiniz dağılımı koruyorum)
        const r = Math.random() * 100;
        let reward = 10;
        if(r < 5){ reward = 100; }
        else if(r < 15){ reward = 50; }
        else if(r < 45){ reward = 30; }
        else if(r < 95){ reward = 20; }

        // Hakkı tüket + ödülü ver (tek transaction)
        await userRef.transaction(u=>{
          if(!u) u = {};
          if(!u.surpriseReady) return u; // yeniden okuma/yarış durumu
          u.surpriseReady = false;
          u.surpriseOpenedCount = (u.surpriseOpenedCount||0) + 1;
          u.diamond = (u.diamond||0) + reward;
          u.lastSurpriseAt = Date.now();
          return u;
        });

        playSurpriseAnimation(reward);
        document.getElementById('diamond-value')?.textContent && updateDiamondCount?.();
        await showAlert(`🎁 Tebrikler! ${reward} 💎 kazandınız!`);
      });
    }
  }catch(e){ console.error("Sürpriz kutu init hatası:", e); }
}




function playSurpriseAnimation(amount){
  const overlay = document.createElement('div');
  overlay.className = 'reward-overlay';
  const panel = document.createElement('div');
  panel.className = 'reward-chest';
  const title = document.createElement('div');
  title.className = 'reward-caption';
  title.textContent = 'Sürpriz Kutu';
  const amt = document.createElement('div');
  amt.className = 'reward-amount';
  amt.textContent = `+${amount} 💎`;
  const ok = document.createElement('button');
  ok.textContent = 'Tamam';
  ok.className = 'start-game-button active';
  ok.style.marginTop = '6px';
  ok.addEventListener('click', ()=> document.body.removeChild(overlay));

  panel.appendChild(title);
  panel.appendChild(amt);
  panel.appendChild(ok);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // particles
  for(let i=0;i<26;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = i%3===0 ? '💎' : (i%3===1 ? '✨' : '🪙');
    const x = window.innerWidth/2, y = window.innerHeight/2;
    p.style.left = x+'px'; p.style.top = y+'px';
    document.body.appendChild(p);
    const angle = (Math.random()*Math.PI*2);
    const dist = 120 + Math.random()*220;
    const dx = Math.cos(angle)*dist;
    const dy = Math.sin(angle)*dist;
    p.animate([
      { transform:`translate(-50%,-50%) translate(0,0) scale(1)`, opacity:1 },
      { transform:`translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(.6)`, opacity:0 }
    ], { duration: 1100 + Math.random()*600, easing:'ease-out'}).onfinish = ()=> p.remove();
  }
}
// === /NOVA: Sürpriz Kutu ===

// === NOVA: Eski +2 düello kredisi kaldırıldı; puanlar updateDuelScore('GAME_END') ile veriliyor ===
async function novaSafeIncrementMatchCountOnce(){
  return;
}
