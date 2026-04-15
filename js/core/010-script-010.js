(function(){
  function ensureBanner(container){
    if(!container) return null;
    let banner = container.querySelector('.resimli-soru-banner');
    if(!banner){
      banner = document.createElement('div');
      banner.className = 'resimli-soru-banner';
      banner.textContent = '📷 RESİMLİ SORU';
      container.insertBefore(banner, container.firstChild);
    }
    return banner;
  }

  function containerHasImage(container){
    if(!container) return false;
    // 1) Any <img> inside (regardless of class)
    if(container.querySelector('img')) return true;
    // 2) Inline background url (cheap check before full scan)
    if(container.querySelector('[style*="url("]')) return true;
    // 3) Any element with background-image url()
    const nodes = container.querySelectorAll('*');
    for(const el of nodes){
      const bg = getComputedStyle(el).backgroundImage;
      if(bg && bg !== 'none' && bg.includes('url(')) return true;
      // data attributes commonly used
      if(el.dataset){
        if(el.dataset.info || el.dataset.image || el.dataset.img) return true;
      }
    }
    // 4) Try global question object patterns
    try {
      if(window.currentQuestion){
        const cq = window.currentQuestion;
        if(cq.info || (cq.question && cq.question.info)) return true;
      }
      if(window.activeQuestion && (activeQuestion.info || (activeQuestion.question && activeQuestion.question.info))) return true;
    } catch(e){}
    return false;
  }

  function updateAllBanners(){
    document.querySelectorAll('.question-container').forEach(container => {
      const banner = ensureBanner(container);
      const hasImg = containerHasImage(container);
      banner.style.display = hasImg ? 'block' : 'none';
    });
  }

  var _bannerDebounce = null;
  function scheduleUpdateAllBanners(){
    if (_bannerDebounce !== null) clearTimeout(_bannerDebounce);
    _bannerDebounce = setTimeout(function(){
      _bannerDebounce = null;
      updateAllBanners();
    }, 150);
  }

  // Public hook so you can call after DB fetch
  window.onNewQuestionLoaded = function(){ updateAllBanners(); };

  // Initial
  document.addEventListener('DOMContentLoaded', updateAllBanners, {once:true});

  // Observe DOM changes (new questions, attribute changes incl. src/style)
  const obs = new MutationObserver(function(){ scheduleUpdateAllBanners(); });
  obs.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src','style','data-info','data-image','data-img']});

  // Nadir yedek (async img load vb.; saniyelik tarama kaldırıldı — lag azaltır)
  setInterval(updateAllBanners, 8000);
})();
