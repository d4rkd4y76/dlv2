// Fallback binding: Sezon Sıralaması button always opens panel
(function(){
  let __rankPanelOpenTs = 0;
  let __rankInfoShownTs = 0;
  window.openSeasonRankingPanel = async function(){
    var panel = document.getElementById('rankingPanel');
    if(!panel) return;
    var now = Date.now();
    if ((now - __rankPanelOpenTs) < 300) return;
    __rankPanelOpenTs = now;
    panel.style.display = 'flex';
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    panel.style.visibility = 'visible';
    panel.style.pointerEvents = 'auto';
    panel.style.transform = 'translate3d(0,0,0)';
    if ((now - __rankInfoShownTs) > (5 * 60 * 1000)){
      __rankInfoShownTs = now;
      try{
        if (typeof showAlert === 'function') {
          await showAlert("Sıralamalar her gün saat 00:00'da güncellenmektedir.");
        } else {
          alert("Sıralamalar her gün saat 00:00'da güncellenmektedir.");
        }
      }catch(_){}
    }
    try{ if(typeof loadRanking === 'function') requestAnimationFrame(()=>loadRanking()); }catch(_){}
  };
  window.closeSeasonRankingPanel = function(){
    var panel = document.getElementById('rankingPanel');
    if(!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';
    panel.style.visibility = '';
    panel.style.pointerEvents = '';
    panel.style.transform = '';
  };
  function bindSeasonRankingButton(){
    var btn = document.getElementById('kupa-siralama-button');
    var panel = document.getElementById('rankingPanel');
    var back = document.getElementById('rankingBackButton');
    if(!btn || !panel) return;

    if(!btn.dataset.novaRankBound){
      btn.dataset.novaRankBound = '1';
      btn.addEventListener('click', function(ev){
        try{ ev.preventDefault(); ev.stopPropagation(); }catch(_){}
        window.openSeasonRankingPanel();
      }, true);
    }

    if(back && !back.dataset.novaRankBound){
      back.dataset.novaRankBound = '1';
      back.addEventListener('click', function(){
        window.closeSeasonRankingPanel();
      }, true);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindSeasonRankingButton, { once:true });
  } else {
    bindSeasonRankingButton();
  }
  window.addEventListener('load', bindSeasonRankingButton, { once:true });
})();
