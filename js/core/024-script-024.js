(function(){
  // When score container becomes visible, move nova-summary INSIDE it and clear others
  function mountStrictlyInside(sc){
    const nova=document.getElementById('nova-summary');
    if(!nova) return;
    // wipe everything else so legacy UI disappears
    try { sc.innerHTML=''; } catch(_){}
    sc.appendChild(nova);
  }

  function observeAndMount(){
    const sc=document.querySelector('.score-container, #score-container');
    if(!sc) return;
    const once=()=>{
      mountStrictlyInside(sc);
      if(!window.__novaStrictMounted){
        window.__novaStrictMounted=true;
      }
    };
    // If already visible now, mount immediately
    const visible=(getComputedStyle(sc).display!=='none' && sc.offsetParent!==null) || sc.classList.contains('show') || sc.classList.contains('active');
    if(visible) once();
    const obs=new MutationObserver(()=>{
      const vis=(getComputedStyle(sc).display!=='none' && sc.offsetParent!==null) || sc.classList.contains('show') || sc.classList.contains('active');
      if(vis) once();
    });
    obs.observe(sc,{attributes:true,attributeFilter:['style','class']});
  }
  window.addEventListener('DOMContentLoaded', observeAndMount);
})();
