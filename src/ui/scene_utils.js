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
