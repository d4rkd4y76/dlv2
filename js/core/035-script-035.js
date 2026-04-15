// === NOVA VS HUD logic ===
(function(){
  function clamp(v,min,max){ return v<min?min:(v>max?max:v); }
  window.novaInitDuelHud = function(data){
    try{
      const hud = document.getElementById('nova-vs-hud');
      if(!hud) return;
      setNameWithFrame(
        document.getElementById('novaLeftName'),
        (data && data.inviter && data.inviter.name) ? data.inviter.name : 'Oyuncu 1',
        (data && data.inviter && data.inviter.nameFrame) ? data.inviter.nameFrame : 'default'
      );
      setNameWithFrame(
        document.getElementById('novaRightName'),
        (data && data.invited && data.invited.name) ? data.invited.name : 'Oyuncu 2',
        (data && data.invited && data.invited.nameFrame) ? data.invited.nameFrame : 'default'
      );
      document.getElementById('novaLeftHP').style.width = '50%';
      document.getElementById('novaRightHP').style.width = '50%';
      try{ document.getElementById('novaLeftCount').textContent='0'; document.getElementById('novaRightCount').textContent='0'; }catch(e){}
    }catch(e){ console.warn('HUD init error', e); }
  };
  window.novaUpdateDuelHud = function(leftScore, rightScore, leftOld, rightOld){
    try{
      const left = document.getElementById('novaLeftHP');
      const right = document.getElementById('novaRightHP');
      if(!left || !right) return;
      const diff = (Number(leftScore)||0) - (Number(rightScore)||0);
      const leftPct = Math.max(0, Math.min(100, 50 + diff*5));
      const rightPct = 100 - leftPct;
      left.style.width  = leftPct + '%';
      right.style.width = rightPct + '%';
      const lc = document.getElementById('novaLeftCount'); const rc = document.getElementById('novaRightCount');
      if(lc) lc.textContent = String(leftScore||0);
      if(rc) rc.textContent = String(rightScore||0);
      const leftGain  = (Number(leftScore)||0)  > (Number(leftOld)||0);
      const rightGain = (Number(rightScore)||0) > (Number(rightOld)||0);
      const leftEl  = document.querySelector('.nova-hud-side.left .nova-hp');
      const rightEl = document.querySelector('.nova-hud-side.right .nova-hp');
      if(leftEl && rightEl){
        if(leftGain && !rightGain){ leftEl.classList.add('nova-boost'); rightEl.classList.add('nova-hit');
          setTimeout(()=>{ leftEl.classList.remove('nova-boost'); rightEl.classList.remove('nova-hit'); }, 800);
        }else if(rightGain && !leftGain){ rightEl.classList.add('nova-boost'); leftEl.classList.add('nova-hit');
          setTimeout(()=>{ rightEl.classList.remove('nova-boost'); leftEl.classList.remove('nova-hit'); }, 800);
        }else{
          [leftEl,rightEl].forEach(el=>{ el.classList.add('nova-boost'); setTimeout(()=>el.classList.remove('nova-boost'), 600); });
        }
      }
    }catch(e){ console.warn('HUD update error', e); }
  };
})();
// === /NOVA VS HUD logic ===
