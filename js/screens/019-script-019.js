// === Nova Patch: Store Category Ordering & Colors ===
(function() {
  // Normalize Turkish variants and DB keys to display names we want
  function normalize(name) {
    if (!name) return "";
    const n = (""+name).trim();
    // Map common variants -> canonical labels
    const map = {
      "KizlarKösesi": "Kızlarköşesi",
      "KizlarKosesi": "Kızlarköşesi",
      "KızlarKösesi": "Kızlarköşesi",
      "KIZLARKÖŞESİ": "Kızlarköşesi",
      "KızlarKöşesi": "Kızlarköşesi",
      "KIZLARKOŞESİ": "Kızlarköşesi",
      "SüperLig": "Süperlig",
      "SÜPERLİG": "Süperlig",
      "SÜPERLİG": "Süperlig",
      "Dünya Devleri": "DünyaDevleri",
      "DÜNYADEVLERİ": "DünyaDevleri"
    };
    return map[n] || n;
  }

  const DESIRED_ORDER = ["TemelKarakterler","Kızlarköşesi","Süperlig","DünyaDevleri","EFSANE"];

  // Keep a reference to existing function (if any)
  const _oldRender = (typeof window.renderStoreCategoryButtons === "function") ? window.renderStoreCategoryButtons : null;

  // Override with strict deterministic renderer
  window.renderStoreCategoryButtons = function renderStoreCategoryButtons() {
    const area = document.querySelector('.profile-categories');
    if (!area) return;

    // Determine available categories from global photoCategories if present, otherwise use a fallback set
    let available = [];
    try {
      if (window.photoCategories && typeof window.photoCategories === 'object') {
        available = Object.keys(window.photoCategories);
      }
    } catch (e) {}

    if (!available.length) {
      available = ["TemelKarakterler","Kızlarköşesi","Süperlig","DünyaDevleri","EFSANE"];
    }

    // Build a normalized lookup: normalizedName -> originalKey
    const normToOrig = new Map();
    available.forEach(k => {
      const norm = normalize(k);
      if (!normToOrig.has(norm)) normToOrig.set(norm, k);
    });

    // Compose the final ordered list:
    // 1) take desired ones in the exact order if present
    const final = [];
    DESIRED_ORDER.forEach(label => {
      if (normToOrig.has(label)) final.push({display: label, key: normToOrig.get(label)});
    });

    // 2) append any other categories except duplicates, with EFSANE guaranteed last
    const used = new Set(final.map(x => x.key));
    const extras = [];
    normToOrig.forEach((orig, norm) => {
      if (!used.has(orig) && DESIRED_ORDER.indexOf(norm) === -1) {
        // keep extras for later (after EFSANE)
        extras.push({display: norm, key: orig});
      }
    });

    // If EFSANE was included earlier, ensure it's the last item by moving it to the end
    const eIndex = final.findIndex(x => normalize(x.display) === "EFSANE");
    if (eIndex > -1) {
      const e = final.splice(eIndex,1)[0];
      // push extras first, then efsane
      // But the user's spec says EFSANE should appear last overall; keep extras before it.
      final.push(...extras, e);
    } else {
      // No EFSANE among desired—append extras at end
      final.push(...extras);
    }

    // Render buttons
    area.style.display = 'flex';
    area.innerHTML = '';

    final.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = 'category-button' + (idx === 0 ? ' active' : '');
      // Use display label for consistency, but keep original key for data-category-raw
      btn.dataset.category = item.display;           // for styling via attribute
      btn.dataset.categoryRaw = item.key;            // for loader
      btn.textContent = item.display;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        document.querySelectorAll('.category-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const duelStore = document.getElementById('duelCreditsStore');
        const photosContainer = document.getElementById('profilePhotosContainer');
        const target = btn.dataset.categoryRaw || btn.dataset.category;
        if (duelStore && photosContainer) {
          if (target === 'duel') {
            duelStore.style.display='block'; 
            photosContainer.style.display='none';
          } else {
            duelStore.style.display='none'; 
            photosContainer.style.display='grid';
          }
        }
        // call existing loader if present
        if (typeof window.loadProfilePhotos === 'function') {
          window.loadProfilePhotos(target);
        }
      });
      area.appendChild(btn);
    });
  };

  // Style hook: add a mutation after DOM ready to ensure colors apply even if app lazy-renders
  document.addEventListener('DOMContentLoaded', function(){
    try { window.renderStoreCategoryButtons(); } catch(e){ if (typeof _oldRender === 'function') try{ _oldRender(); }catch(_){} }
  });
})();
