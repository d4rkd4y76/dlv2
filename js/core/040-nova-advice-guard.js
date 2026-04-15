(function(){
  if (window.__novaAdviceGuardInstalledV2) return;
  window.__novaAdviceGuardInstalledV2 = true;

  function isVisible(el){
    if(!el) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    if ((el.offsetWidth|0) === 0 && (el.offsetHeight|0) === 0) return false;
    return true;
  }

  function resultVisible(){
    var sc = document.getElementById('score-container') ||
             document.querySelector('.score-container, .result-screen, #resultScreen');
    return isVisible(sc);
  }

  function hideAdvice(){
    try{
      // Remove both id and class variants if exist
      var byId = document.getElementById('teacher-advice-card');
      if (byId) byId.remove();
      document.querySelectorAll('.teacher-advice-card').forEach(function(el){ el.remove(); });
    }catch(e){}
  }

  function enforce(){
    if (!resultVisible()) hideAdvice();
  }

  function observeRoots(){
    var roots = [
      document.body,
      document.querySelector('.question-container'),
      document.querySelector('.single-player-game-container'),
      document.querySelector('.duel-game-container'),
      document.querySelector('.matchmaking-screen'),
      document.getElementById('score-container')
    ].filter(Boolean);
    roots.forEach(function(el){
      try{
        var obs = new MutationObserver(enforce);
        obs.observe(el, { attributes:true, childList:true, subtree:true });
      }catch(_){}
    });
  }

  function hook(name){
    try{
      var fn = window[name];
      if (typeof fn === 'function' && !fn.__novaAdviceV2){
        var orig = fn;
        window[name] = function(){
          var r = orig.apply(this, arguments);
          setTimeout(enforce, 0);
          return r;
        };
        window[name].__novaAdviceV2 = true;
      }
    }catch(_){}
  }

  function boot(){
    enforce();
    observeRoots();
    [
      'displayCurrentQuestion','proceedToNextQuestion','startNow','startTimer','findStartButton',
      'startGame','startSinglePlayer','startCountdown','startDuelGame','endGame','showResults'
    ].forEach(hook);

    document.addEventListener('click', function(e){
      var t = e.target;
      if (t && (t.closest ? t.closest('.option-button, .option-btn, .answer-button, .next-question-button, .question-container, #start-game-button') : null)){
        enforce();
      }
    }, true);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
