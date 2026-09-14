// ネイティブのinput[type=range]を使う音量スライダー。
// ドラッグ処理・当たり判定は全部ブラウザ標準機能に任せる。
export class VolumeSlider {
    constructor(x, y, width, label, initialValue, onChange) {
        this.el = document.createElement('div');
        this.el.className = 'volume-slider';

        this.labelEl = document.createElement('span');
        this.labelEl.className = 'volume-label';
        this.labelEl.textContent = label;

        this.valueEl = document.createElement('span');
        this.valueEl.className = 'volume-value';

        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.min = '0';
        this.input.max = '100';
        this.input.value = String(Math.round(initialValue * 100));

        this.input.addEventListener('input', () => {
            const value = Number(this.input.value) / 100;
            this.updateValueLabel(value);
            this.updateTrackFill(value);
            onChange(value);
        });

        this.el.append(this.labelEl, this.valueEl, this.input);
        this.updateValueLabel(initialValue);
        this.updateTrackFill(initialValue);
        this.setRect(x, y, width);
    }

    updateValueLabel(value) {
        this.valueEl.textContent = `${Math.round(value * 100)}%`;
    }

    // ::-webkit-slider-runnable-trackはCSSからしか塗り分けられないため、
    // CSS変数--fill-percentを更新して、つまみの位置までを色分けする
    updateTrackFill(value) {
        const percent = Math.round(value * 100);
        this.input.style.setProperty('--fill-percent', `${percent}%`);
    }

    setRect(x, y, width) {
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
        this.el.style.width = `${width}px`;
    }

    mount(parent) {
        parent.appendChild(this.el);
    }

    destroy() {
        this.el.remove();
    }
}
