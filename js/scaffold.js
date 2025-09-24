import { FONT_FAMILY, BLOCK_SIZE } from './config.js';

const SOLID_DURATION = 5000;

export class ScaffoldBlock {
    constructor(x, y, widthInBlocks, heightInBlocks, requiredKeys) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = heightInBlocks * BLOCK_SIZE;
        this.requiredKeys = requiredKeys; // e.g., ['J'] or ['J', 'L']

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
            ctx.font = `${this.height * 0.7}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 複数のキーを並べて表示
            const keyText = this.requiredKeys.join(' + ');
            ctx.fillText(keyText, this.x + this.width / 2, this.y + this.height / 2);

        } else if (this.state === 'SOLID') {
            ctx.fillStyle = '#f0ad4e';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
