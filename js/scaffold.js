import { FONT_SIZE, FONT_FAMILY } from './config.js';

const SOLID_DURATION = 5000; // 足場が固まっている時間 (5秒)

export class ScaffoldBlock {
    constructor(x, y, width, height, key) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.key = key; // 押すべきキー (e.g., 'J')

        this.state = 'ACTIVE'; // ACTIVE | SOLID | EXPIRED
        this.solidUntil = 0; // 固まった状態が終わる時間
    }

    // プレイヤー2によって具現化される
    solidify() {
        if (this.state === 'ACTIVE') {
            this.state = 'SOLID';
            this.solidUntil = Date.now() + SOLID_DURATION;
            return true;
        }
        return false;
    }

    update() {
        if (this.state === 'SOLID' && Date.now() > this.solidUntil) {
            this.state = 'EXPIRED';
        }
    }

    draw(ctx) {
        if (this.state === 'EXPIRED') return;

        if (this.state === 'ACTIVE') {
            // 枠線とキーを描画
            ctx.strokeStyle = '#f0ad4e';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#f0ad4e';
            ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.key, this.x + this.width / 2, this.y + this.height / 2);

        } else if (this.state === 'SOLID') {
            // 具現化した足場を描画
            ctx.fillStyle = '#f0ad4e';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
