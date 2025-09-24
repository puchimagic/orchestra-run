import { FONT_SIZE, FONT_FAMILY, BLOCK_SIZE } from './config.js';

const SOLID_DURATION = 5000; // 足場が固まっている時間 (5秒)

export class ScaffoldBlock {
    constructor(x, y, widthInBlocks, heightInBlocks, key) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = heightInBlocks * BLOCK_SIZE;
        this.key = key;

        this.state = 'ACTIVE';
        this.solidUntil = 0;
    }

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
            ctx.strokeStyle = '#f0ad4e';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#f0ad4e';
            ctx.font = `${this.height * 0.8}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.key, this.x + this.width / 2, this.y + this.height / 2);

        } else if (this.state === 'SOLID') {
            ctx.fillStyle = '#f0ad4e';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}