/* -------------------- NOVA: Güvenli kategori oluşturucu --------------------
   Hedefler:
   1) 'EFSANE' butonu DOM'da MUTLAKA en sonda yer alacak.
   2) 'EFSANE' butonu alevli/özel animasyonlu olacak.
   3) 'duel' kategorisi varsa açılışta ona geçiş desteklenecek.
   4) Mevcut loadProfilePhotos ve DOM yapını bozmadan çalışır.
---------------------------------------------------------------------------- */
(function(){
  function unique(arr){ const s = new Set(); return arr.filter(x => (x && !s.has(x) && s.add(x))); }

  function labelForKey(k){
    if (k === '__nameFrames') return 'İsim Çerçevesi';
    if (k === '__avatarFrames') return 'Avatar Çerçevesi';
    try{
      const m = window.storeCategoryMeta && window.storeCategoryMeta[k];
      if (m && m.label) return String(m.label);
    }catch(_){}
    return k;
  }

  function sortKeys(keys){
    keys = unique(keys);
    const meta = window.storeCategoryMeta || {};
    const hasDuel = keys.includes('duel');
    const hasEfsane = keys.includes('EFSANE');
    let rest = keys.filter(k => k !== 'duel' && k !== 'EFSANE');
    rest.sort((a,b) => {
      const oa = (meta[a] && meta[a].order != null) ? Number(meta[a].order) : 1e12;
      const ob = (meta[b] && meta[b].order != null) ? Number(meta[b].order) : 1e12;
      if (oa !== ob) return oa - ob;
      return labelForKey(a).localeCompare(labelForKey(b), 'tr');
    });
    const out = [];
    if (hasDuel) out.push('duel');
    out.push(...rest);
    if (hasEfsane) out.push('EFSANE');
    return out;
  }

  window.renderStoreCategoryButtons = function renderStoreCategoryButtons(){
    const area = document.querySelector('.profile-categories');
    if(!area) return;
    area.style.display = 'flex';
    area.innerHTML = '';

    let keys = [];
    try {
      if (typeof photoCategories === 'object' && photoCategories){
        keys = Object.keys(photoCategories);
      }
    } catch(e){}
    if(!keys.length){
      keys = ['duel','DünyaDevleri','cesur','TemelKarakterler','SüperLig','DünyaFutbolcuları','KizlarKösesi','EFSANE'];
    }
    keys = sortKeys(keys);
    if (!keys.includes('__nameFrames')) keys.unshift('__nameFrames');
    if (!keys.includes('__avatarFrames')) keys.unshift('__avatarFrames');

    keys.forEach((k, i) => {
      const btn = document.createElement('button');
      btn.className = 'category-button' + (i===0 ? ' active' : '');
      btn.dataset.category = k;
      btn.dataset.categoryRaw = k;
      btn.textContent = labelForKey(k);

      if (k === 'EFSANE'){
        btn.classList.add('legendary');
        btn.title = '🔥 Efsane Seçkisi';
      } else if (k === '__nameFrames' || k === '__avatarFrames'){
        btn.classList.add('legendary');
        btn.title = (k === '__avatarFrames') ? '✨ Avatar çerçeveleri' : '✨ İsim çerçeveleri';
      }

      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const duelStore = document.getElementById('duelCreditsStore');
        const photosContainer = document.getElementById('profilePhotosContainer');
        if (duelStore && photosContainer){
          if (k === 'duel'){
            duelStore.style.display = 'block';
            photosContainer.style.display = 'none';
          } else {
            duelStore.style.display = 'none';
            photosContainer.style.display = 'grid';
          }
        }
        if (typeof loadProfilePhotos === 'function' && k !== 'duel'){
          loadProfilePhotos(k);
        }
      });

      area.appendChild(btn);
    });
  };

  // Mağaza üst başlık hizalama (varsa uygula)
  document.addEventListener('DOMContentLoaded', function(){
    // Olası başlık-seçenek yapılarının kapsayıcısını yakala
    var title = document.querySelector('.store-title, .magaza-title, .shop-title');
    var diamond = document.querySelector('.diamond-value, .diamond-display, #diamondDisplay');
    var exchange = document.querySelector('.diamond-exchange, .diamond-takas, #diamondExchange');

    // Eğer üçlüden en az ikisi varsa grid uygula
    if (title || diamond || exchange){
      // En uygun kapsayıcıyı seç
      var host = (title && title.parentElement) || (diamond && diamond.parentElement) || (exchange && exchange.parentElement);
      if (host && !host.classList.contains('store-header-grid')){
        host.classList.add('store-header-grid');
        if (title) title.classList.add('store-title');
        if (diamond){
          var wrap = document.createElement('div');
          wrap.className = 'diamond-wrap';
          diamond.parentElement.insertBefore(wrap, diamond);
          wrap.appendChild(diamond);
          if (exchange) wrap.appendChild(exchange);
        }
      }
    }

    // Sayfa açılışında kategorileri güvenle çiz
    try { window.renderStoreCategoryButtons(); } catch(e){ console.warn('Kategori çizimi hatası:', e); }
  });
})();
