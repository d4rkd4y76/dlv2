(function(){
  if (window.__novaWaitInstalled) return; window.__novaWaitInstalled = true;
  const ov = ()=> document.getElementById('duel-wait-overlay');
  window.showWaitOverlay = function(){ try{ const el = ov(); if(el) el.style.display = 'flex'; }catch(e){ console.warn(e);} };
  window.hideWaitOverlay = function(){ try{ const el = ov(); if(el) el.style.display = 'none'; }catch(e){ console.warn(e);} };
  // Fallback: in case something goes wrong, auto-hide after 12s
  window.addEventListener('nova:duelIntroDone', ()=>{ setTimeout(()=>hideWaitOverlay(), 12000); }, { once:false });
})();
