import { FONT_FAMILY, BLOCK_SIZE, SCAFFOLD_ACTIVE_STROKE_COLOR, SCAFFOLD_ACTIVE_LINE_WIDTH, SCAFFOLD_ACTIVE_TEXT_COLOR, SCAFFOLD_ACTIVE_TEXT_STROKE_COLOR, SCAFFOLD_ACTIVE_TEXT_STROKE_WIDTH, SCAFFOLD_SOLID_FILL_COLOR_FALLBACK } from './config.js';

const SOLID_DURATION = 5000;
const scaffoldImage = new Image();
scaffoldImage.src = 'img/gakufu.png';

export class ScaffoldBlock {
    constructor(x, y, widthInBlocks, heightInBlocks, requiredKeys) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = heightInBlocks * BLOCK_SIZE;
        this.requiredKeys = requiredKeys; // 例: ['J'] または ['L']

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
            ctx.strokeStyle = SCAFFOLD_ACTIVE_STROKE_COLOR; // configから取得
            ctx.lineWidth = SCAFFOLD_ACTIVE_LINE_WIDTH; // configから取得
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // テキストの描画
            ctx.font = `${this.height * 0.7}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const keyText = this.requiredKeys.join(' + ');

            // 黒い縁取りを追加
            ctx.strokeStyle = SCAFFOLD_ACTIVE_TEXT_STROKE_COLOR; // configから取得
            ctx.lineWidth = SCAFFOLD_ACTIVE_TEXT_STROKE_WIDTH; // configから取得
            ctx.strokeText(keyText, this.x + this.width / 2, this.y + this.height / 2);

            // オレンジ色のテキストを描画
            ctx.fillStyle = SCAFFOLD_ACTIVE_TEXT_COLOR; // configから取得
            ctx.fillText(keyText, this.x + this.width / 2, this.y + this.height / 2);

        } else if (this.state === 'SOLID') {
            if (scaffoldImage.complete && scaffoldImage.naturalHeight !== 0) {
                ctx.drawImage(scaffoldImage, this.x, this.y, this.width, this.height);
            } else {
                // 画像が読み込まれるまでのフォールバック
                ctx.fillStyle = SCAFFOLD_SOLID_FILL_COLOR_FALLBACK; // configから取得
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
}