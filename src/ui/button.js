import { soundPlayer } from '../soundPlayer.js';

// Canvas座標(x, y, width, height)をそのままpxとして使えるDOMボタンを生成する
export class Button {
    constructor(x, y, width, height, text, { clickSoundKey = 'score', clickSoundType = 'gameSound', compact = false } = {}) {
        this.el = document.createElement('button');
        this.el.className = compact ? 'game-button game-button--compact' : 'game-button';
        this.el.type = 'button';
        this.el.textContent = text;
        // マウス/タッチでの操作のみを想定しており、Tabキーでのフォーカス移動時に
        // 表示されるフォーカスリングが世界観に合わないため、タブ移動の対象から外す
        this.el.tabIndex = -1;
        this.setRect(x, y, width, height);

        this.el.addEventListener('click', () => {
            if (this.el.disabled) return;
            if (clickSoundType === 'gameSound') soundPlayer.playGameSound(clickSoundKey);
            else if (clickSoundType === 'instrumentSound') soundPlayer.playSound(clickSoundKey);
            if (this.onClick) this.onClick();
        });
    }

    setRect(x, y, width, height) {
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
        this.el.style.width = `${width}px`;
        this.el.style.height = `${height}px`;
    }

    setSelected(isSelected) {
        this.el.classList.toggle('selected', isSelected);
    }

    setEnabled(isEnabled) {
        this.el.disabled = !isEnabled;
    }

    mount(parent) {
        parent.appendChild(this.el);
    }

    destroy() {
        this.el.remove();
    }
}
