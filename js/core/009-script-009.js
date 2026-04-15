// Ceza sistemi KALDIRILDI: Nova


// --- Nova: Yıldız yardımcıları ---
function getStars(count){
    let n = 0;
    if (count >= 100 && count < 300) n = 1;
    else if (count >= 300 && count < 500) n = 2;
    else if (count >= 500 && count < 800) n = 3;
    else if (count >= 800 && count < 1000) n = 4;
    else if (count >= 1000) n = 5;

    if (n === 0) return '';
    const bright = (n >= 3) ? ' bright' : '';
    const flame = (n === 5) ? ' flame' : '';
    let html = '<span class="star-badges">';
    for (let i=0;i<n;i++){
        const extra = (n === 5) ? flame : bright;
        html += `<span class="star${extra}">⭐</span>`;
    }
    html += '</span>';
    return html;
}


// --- Nova: Rank helpers ---
function _starLevelFromCount(count){
    let n = 0;
    if (count >= 100 && count < 300) n = 1;
    else if (count >= 300 && count < 500) n = 2;
    else if (count >= 500 && count < 800) n = 3;
    else if (count >= 800 && count < 1000) n = 4;
    else if (count >= 1000) n = 5;
    return n;
}
function _rankTextFromLevel(n){
    switch(n){
        case 1: return 'Çırak';
        case 2: return 'Gözcü';
        case 3: return 'Lider';
        case 4: return 'Kaptan';
        case 5: return 'PRO';
        default: return 'acemi';
    }
}
function getRankHTML(count){
    const lvl = _starLevelFromCount(Number(count)||0);
    const txt = _rankTextFromLevel(lvl);
    return `<div class="rank-label rank-${lvl}">${txt}</div>`;
}
