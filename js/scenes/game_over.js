import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
    }

    init(data) {
        this.finalScore = data.score || 0;

        const btnWidth = 200;
        const btnHeight = 50;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.continueButton = new Button(cx - btnWidth / 2, cy + 20, btnWidth, btnHeight, 'CONTINUE');
        this.exitButton = new Button(cx - btnWidth / 2, cy + 90, btnWidth, btnHeight, 'EXIT');
    }

    update() {
        if (this.continueButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        }
        if (this.exitButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.TITLE);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#a0a0a0'; // 背景色を少し変える
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'white';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 80);

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText(`Score: ${this.finalScore}`, width / 2, height / 2 - 20);

        this.continueButton.draw(ctx);
        this.exitButton.draw(ctx);
    }
}
