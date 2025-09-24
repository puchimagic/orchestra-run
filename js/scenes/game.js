import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = null;
    }

    init(data) {
        this.startTime = Date.now();
        this.score = 0;
        this.selectedInstrument = data.instrument || 'None';

        const buttonWidth = 300;
        const buttonHeight = 50;
        const x = (this.game.canvas.width - buttonWidth) / 2;
        const y = this.game.canvas.height / 2;
        this.gameOverButton = new Button(x, y, buttonWidth, buttonHeight, 'Go to Game Over');
    }

    update() {
        this.score = Math.floor((Date.now() - this.startTime) / 1000);

        if (this.gameOverButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.GAME_OVER, { score: this.score });
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#d0d0d0'; // 背景色を少し変える
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('Game Screen', width / 2, 100);

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`Score: ${this.score}`, width / 2, 200);
        ctx.fillText(`Instrument: ${this.selectedInstrument}`, width / 2, 240);

        this.gameOverButton.draw(ctx);
    }
}
