// シーンのdiv要素に背景画像を設定する
export function setSceneBackground(sceneEl, src) {
    sceneEl.style.backgroundImage = `url('${src}')`;
}

// 中央揃えのテキスト要素を生成してsceneElに追加する（画面タイトル、セクション見出し等で共通利用）。
// widthを省略すると画面幅いっぱい(100%)、指定するとその幅のブロックをcenterX中心に配置する。
export function createCenteredText(sceneEl, text, { top, fontSize, color = 'black', width = null, centerX = null }) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.top = `${top}px`;
    el.style.fontSize = `${fontSize}px`;
    el.style.color = color;
    el.style.textAlign = 'center';

    if (width === null) {
        el.style.left = '0';
        el.style.width = '100%';
    } else {
        el.style.left = `${centerX - width / 2}px`;
        el.style.width = `${width}px`;
    }

    sceneEl.appendChild(el);
    return el;
}

// タイトル・メニュー画面の背景で、音符をふわふわ浮かばせて動かす。
// ゲームの乱数(Math.random)を使うとステージ生成に影響するため、位置や速さは番号から決める。
const FLOATING_NOTE_COLORS = [['#6fd0e8', '#d9f6ff'], ['#ff9ec4', '#ffe3ee'], ['#ffcf5c', '#fff1cc']];
const FLOATING_NOTE_SHAPES = [
    (s, f) => `<svg viewBox="0 0 64 84" width="100%" height="100%"><g stroke="${s}" stroke-width="5" stroke-linejoin="round" fill="${f}"><path d="M33 10 L39 10 L39 62 L33 62 Z"/><path d="M39 10 C52 16 60 26 54 42 C53 32 47 27 39 25 Z"/><ellipse cx="24" cy="64" rx="15" ry="11" transform="rotate(-22 24 64)"/></g></svg>`,
    (s, f) => `<svg viewBox="0 0 84 84" width="100%" height="100%"><g stroke="${s}" stroke-width="5" stroke-linejoin="round" fill="${f}"><path d="M25 14 L71 6 L71 17 L25 25 Z"/><rect x="25" y="18" width="6" height="46"/><rect x="65" y="10" width="6" height="46"/><ellipse cx="18" cy="64" rx="13" ry="10" transform="rotate(-22 18 64)"/><ellipse cx="58" cy="57" rx="13" ry="10" transform="rotate(-22 58 57)"/></g></svg>`,
];
export function addFloatingNotes(sceneEl, count = 14) {
    const wrap = document.createElement('div');
    wrap.className = 'floating-notes';
    for (let i = 0; i < count; i++) {
        const r = (k) => ((i + 1) * k) % 1;
        const size = 44 + Math.round(r(0.437) * 46);
        const duration = 16 + r(0.271) * 12;
        const note = document.createElement('div');
        note.className = 'floating-note';
        note.style.left = `${Math.round(r(0.618034) * 1860)}px`;
        note.style.width = `${size}px`;
        note.style.height = `${size}px`;
        note.style.animationDuration = `${duration.toFixed(1)}s`;
        note.style.animationDelay = `${(-r(0.733) * duration).toFixed(1)}s`;
        const inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.animationDuration = `${(3 + r(0.391) * 2.5).toFixed(1)}s`;
        const [stroke, fill] = FLOATING_NOTE_COLORS[i % FLOATING_NOTE_COLORS.length];
        inner.innerHTML = FLOATING_NOTE_SHAPES[i % FLOATING_NOTE_SHAPES.length](stroke, fill);
        note.appendChild(inner);
        wrap.appendChild(note);
    }
    sceneEl.appendChild(wrap);
    return wrap;
}
