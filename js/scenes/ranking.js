import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class RankingScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 75;
        const x = (this.game.canvas.width - btnWidth) / 2;
        const y = this.game.canvas.height - btnHeight - 75;
        this.backButton = new Button(x, y, btnWidth, btnHeight, 'メインに戻る');
    }

    update() {
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('ランキング', width / 2, 150);

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText('1位: 9999', width / 2, height / 2 - 50);
        ctx.fillText('2位: 8888', width / 2, height / 2);
        ctx.fillText('3位: 7777', width / 2, height / 2 + 50);
        ctx.fillText('（この機能は開発中です）', width / 2, height / 2 + 150);

        this.backButton.draw(ctx);
    }
}