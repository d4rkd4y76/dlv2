(function(){
  // Helper: escape HTML
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, m=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }
  function cleanupExplanation(s){
    return String(s||'').replace(/^\s*Açıklama[:：]\s*/i,'').trim();
  }
  // Robust question finder
  function findQuestionText(){
    const root = document.querySelector('.question-container, #question-container, .soru-container, .quiz-question, .game-question, .question-area, .questionWrap, .question-wrapper') || document;
    const selectors = [
  '.question-actual-text',
  '.question-text', '.question-title', '.question', '#question', '#question-text',
  '.soru-text', '.soruMetni', '.soru', '.prompt', '.quiz-question h2', '.quiz-question h3'
];
    for (const sel of selectors){
      const el = root.querySelector(sel);
      if (el && (el.innerText||el.textContent||'').trim().length>8){
        return (el.innerText||el.textContent).trim();
      }
    }
    // Fallback: take the longest textual node inside root but not within options
    const options = new Set(Array.from(root.querySelectorAll('.options, .choices, .answers, .option, .option-button, button, .answer-option, .choice, .secenek'))
      .map(e=>e));
    function isInsideInfo(node){
  try { return node && node.closest && node.closest('.question-info-text'); }
  catch(_) { return null; }
}
function isInsideOptions(node){
      let p=node; while(p){ if(options.has(p)) return true; p=p.parentNode; }
      return false;
    }
    let longest='';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()){
      const txt = (walker.currentNode.nodeValue||'').trim();
      if (txt.length>8 && txt.length<400 && !isInsideOptions(walker.currentNode.parentNode)){
        if (txt.length>longest.length) longest=txt;
      }
    }
    return longest || 'Soru metni bulunamadı';
  }

  // ====== Data tracker ======
  const NovaTracker = (function(){
    const state = { items: [], total:0, correctCount:0, finished:false };
    // === Nova: Reset wrong-answers tracker for each NEW game ===
    function resetTrackerState(){
      state.items = [];
      state.total = 0;
      state.correctCount = 0;
      state.finished = false;
    }
    // Capture clicks on start buttons to reset before a new game begins
    document.addEventListener('click', function(ev){
      var t = ev.target && (ev.target.closest ? ev.target.closest('#start-game-button, .start-game-button, .single-start-button, #startSinglePlayerButton, .start-button, #startButton') : null);
      if (t) { try{ resetTrackerState(); }catch(_){} }
    }, true);
    // Wrap common start functions as extra safety
    ;(function wrapStarts(names){
      (names||[]).forEach(function(name){
        try{
          var fn = window[name];
          if (typeof fn === 'function' && !fn.__novaResetWrap){
            var orig = fn;
            window[name] = function(){
              try{ resetTrackerState(); }catch(_){}
              return orig.apply(this, arguments);
            };
            window[name].__novaResetWrap = true;
          }
        }catch(_){}
      });
    })(['startGame','startSinglePlayer','startCountdown','startNow']);
    
    document.addEventListener('click', function(e){
      const btn = e.target.closest('.option-button, .answer-option, .option, .choice');
      if(!btn) return;
      setTimeout(()=>{
        try {
          const qText = findQuestionText();
          const opts = Array.from(document.querySelectorAll('.option-button, .answer-option, .option, .choice'));
          const correctBtn = opts.find(b => b.classList.contains('correct') || b.dataset.correct==='true');
          const chosenText = (btn.innerText||btn.textContent||'').trim();
          const correctText = (correctBtn && (correctBtn.innerText||correctBtn.textContent||'').trim()) || '';
          const expEl = document.querySelector('.explanation-text, .explanation-container, .explanation-card, #explanation, .explanation');
          const explanation = cleanupExplanation((expEl && (expEl.innerText||expEl.textContent)||'').trim());
          const isCorrect = btn.classList.contains('correct') || (btn===correctBtn);

          state.total += 1;
          if(isCorrect){ state.correctCount += 1; }
          else { (function(){
  const infoImgEl = document.querySelector('.question-info-image');
  const infoTextEl = document.querySelector('.question-info-text');
  const infoImage = infoImgEl ? infoImgEl.src : '';
  const infoText = (!infoImgEl && infoTextEl) ? ((infoTextEl.innerText||infoTextEl.textContent)||'').trim() : '';
  state.items.push({ q:qText, chosen:chosenText, correct:correctText, explanation, infoImage, infoText, isCorrect:false });
})(); }
        } catch(err){ console.warn('NovaTracker capture error:', err); }
      }, 250);
    }, true);

    function getBadge(rate){ if(rate>=90) return 'ELMAS'; if(rate>=75) return 'ALTIN'; if(rate>=60) return 'GÜMÜŞ'; return 'BRONZ'; }

    function drawGauge(rate){
      const canvas = document.getElementById('nzGauge'); if(!canvas) return;
      const ctx = canvas.getContext('2d'); const w=canvas.width, h=canvas.height; const cx=w/2, cy=h/2, r=Math.min(w,h)/2-10;
      ctx.clearRect(0,0,w,h);
      ctx.lineWidth=16; ctx.strokeStyle='#e5e7eb'; ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,2*Math.PI); ctx.stroke();
      const end=Math.PI+(rate/100)*Math.PI; ctx.strokeStyle= rate>=75 ? '#10b981' : (rate>=60 ? '#f59e0b' : '#ef4444');
      ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,end); ctx.stroke();
      ctx.fillStyle='#111827'; ctx.font='800 28px system-ui,Segoe UI,Roboto'; ctx.textAlign='center'; ctx.fillText(`${Math.round(rate)}%`,cx,cy+8);
    }

    function renderSummary(){
      const wrap=document.getElementById('nova-summary'); if(!wrap) return;
      const {total, correctCount, items}=state; const rate= total>0 ? (correctCount/total)*100 : 0;
      const rateEl=document.getElementById('nz-kpi-rate');
      document.getElementById('nz-kpi-correct').textContent=String(correctCount);
      document.getElementById('nz-kpi-total').textContent=String(total);
      rateEl.textContent=`${Math.round(rate)}%`;
      rateEl.className = rate>=75 ? 'value ok' : (rate>=60 ? 'value warn' : 'value bad');
      drawGauge(rate); document.getElementById('nzBadge').textContent=getBadge(rate);

      const list=document.getElementById('nzWrongList'); list.innerHTML='';
      items.slice(0,8).forEach((it,idx)=>{
        const div=document.createElement('div'); div.className='nz-item';
        div.innerHTML=`
          <div class="nz-q">${idx+1}. ${escapeHtml(it.q)}</div>
          ${it.infoImage ? `<div class="nz-info"><img class="nz-info-img" src="${escapeHtml(it.infoImage)}" alt="Öncül"/></div>` : (it.infoText ? `<div class="nz-info nz-info-text">${escapeHtml(it.infoText)}</div>` : ``)}
          <div class="nz-pair"><span class="nz-pill nz-you">Senin Cevabın</span><span>${escapeHtml(it.chosen||'-')}</span></div>
          <div class="nz-pair"><span class="nz-pill nz-true">Doğru Cevap</span><span>${escapeHtml(it.correct||'-')}</span></div>
          ${it.explanation?`<div class="nz-exp">${escapeHtml(it.explanation)}</div>`:''}
        `;
        list.appendChild(div);
      });
      wrap.classList.add('nz-show');
    }

    function openModal(){
      const modal=document.getElementById('nova-modal'); const list=document.getElementById('nzModalList');
      list.innerHTML='';
      state.items.forEach((it,idx)=>{
        const div=document.createElement('div'); div.className='nz-item';
        div.innerHTML=`
          <div class="nz-q">${idx+1}. ${escapeHtml(it.q)}</div>
          ${it.infoImage ? `<div class="nz-info"><img class="nz-info-img" src="${escapeHtml(it.infoImage)}" alt="Öncül"/></div>` : (it.infoText ? `<div class="nz-info nz-info-text">${escapeHtml(it.infoText)}</div>` : ``)}
          <div class="nz-pair"><span class="nz-pill nz-you">Senin Cevabın</span><span>${escapeHtml(it.chosen||'-')}</span></div>
          <div class="nz-pair"><span class="nz-pill nz-true">Doğru Cevap</span><span>${escapeHtml(it.correct||'-')}</span></div>
          ${it.explanation?`<div class="nz-exp">${escapeHtml(it.explanation)}</div>`:''}
        `;
        list.appendChild(div);
      });
      modal.style.display='flex';
    }

    return { state, renderSummary, openModal };
  })();

  // Observe score container visibility
  function observeScoreContainer(){
    const sc=document.querySelector('.score-container, #score-container');
    if(!sc) return;
    const obs=new MutationObserver(()=>{
      const visible=(getComputedStyle(sc).display!=='none' && sc.offsetParent!==null) || sc.classList.contains('show') || sc.classList.contains('active');
      if(visible && !NovaTracker.state.finished){
        NovaTracker.state.finished=true;
        try{
          var totalQ = Number(NovaTracker.state.total || 0);
          var correctQ = Number(NovaTracker.state.correctCount || 0);
          var isHw = !!window.NOVA_ACTIVE_HOMEWORK;
          if(typeof window.novaQuestRecord === 'function'){
            window.novaQuestRecord('single_played', { total: totalQ, correct: correctQ, isHomework: isHw });
            if(correctQ >= 8) window.novaQuestRecord('single_8plus', { total: totalQ, correct: correctQ, isHomework: isHw });
          }
        }catch(_){}
        mountSummary(sc);
        
        try {
          var backBtn = document.getElementById('result-back-btn');
          if (backBtn) { backBtn.style.display = 'inline-flex'; }
        } catch(_) {}
        // Also remove legacy area if present
        const wb=document.querySelector('.wrong-block'); if(wb) wb.style.display='none';
        const actLesson=document.getElementById('act-lesson'); if(actLesson) actLesson.style.display='none';
        const actReview=document.getElementById('act-review'); if(actReview) actReview.style.display='none';
        const actPrint=document.getElementById('act-print'); if(actPrint) actPrint.style.display='none';
        const lessonBtn=document.getElementById('lesson-video-button'); if(lessonBtn) lessonBtn.style.display='none';
        NovaTracker.renderSummary();
      }
    });
    obs.observe(sc,{attributes:true,attributeFilter:['style','class']});
  }
  function mountSummary(sc){
    const nova=document.getElementById('nova-summary');
    if(nova){ sc.insertAdjacentElement('afterend', nova); }
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const sc=document.querySelector('.score-container, #score-container');
    const nova=document.getElementById('nova-summary'); if(sc && nova){ sc.insertAdjacentElement('afterend', nova); }
    observeScoreContainer();

    const rpt=document.getElementById('nzRepeatBtn');
    const vid=document.getElementById('nzVideoBtn');
    if(rpt) rpt.addEventListener('click', NovaTracker.openModal);
    if(vid) vid.addEventListener('click', ()=>{
      // Prefer native lesson video action if present
      try{ document.getElementById('lesson-video-button')?.click(); }catch(_){}
      // Direct Nova fallback (NEW clears legacy btn)
      try{ if (window.NovaLessonVideo && typeof window.NovaLessonVideo.open==='function'){ window.NovaLessonVideo.open(); } }catch(_){}
      // Fire integration event with analysis payload
      try{ window.dispatchEvent(new CustomEvent('nova:open-lesson-video', { detail: { tracker: 'nova', data: (window.NovaTracker && window.NovaTracker.state) || null } })); }catch(_){}
    });
  });
})();
