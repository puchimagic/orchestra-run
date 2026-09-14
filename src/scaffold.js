import { BLOCK_SIZE } from './config.js';

const SOLID_DURATION = 5000;

export class ScaffoldBlock {
    constructor(x, y, widthInBlocks, heightInBlocks, requiredKeys) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = heightInBlocks * BLOCK_SIZE;
        this.requiredKeys = requiredKeys; // 例: ['J'] または ['L']

        this.state = 'ACTIVE';
        this.solidUntil = 0;

        this.el = document.createElement('div');
        this.el.className = 'scaffold';
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;

        this.keyTextEl = document.createElement('span');
        this.keyTextEl.className = 'scaffold-key-text';
        this.keyTextEl.style.fontSize = `${this.height * 0.7}px`;
        this.keyTextEl.textContent = this.requiredKeys.join(' + ');
        this.el.appendChild(this.keyTextEl);

        this.updateView();
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    solidify() {
        if (this.state === 'ACTIVE') {
            this.state = 'SOLID';
            this.solidUntil = Date.now() + SOLID_DURATION;
            this.updateView();
            return true;
        }
        return false;
    }

    update() {
        if (this.state === 'SOLID' && Date.now() > this.solidUntil) {
            this.state = 'EXPIRED';
            this.updateView();
        }
    }

    updateView() {
        this.el.classList.remove('active', 'solid', 'expired');
        if (this.state === 'ACTIVE') {
            this.el.classList.add('active');
        } else if (this.state === 'SOLID') {
            this.el.classList.add('solid');
        } else {
            this.el.classList.add('expired');
        }
        // 必要キーのテキストはACTIVE状態(まだ固まっていない足場)でのみ表示する
        this.keyTextEl.style.display = this.state === 'ACTIVE' ? '' : 'none';
    }
}
