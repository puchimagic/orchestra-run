import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class TitleScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const buttonWidth = 200;
        const buttonHeight = 50;
        const x = (this.game.canvas.width - buttonWidth) / 2;
        const y = this.game.canvas.height / 2 + 50;
        this.startButton = new Button(x, y, buttonWidth, buttonHeight, 'START');
    }

    update() {
        if (this.startButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.INSTRUCTIONS);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('Super Gemini Runner', width / 2, height / 2 - 50);

        this.startButton.draw(ctx);
    }
}