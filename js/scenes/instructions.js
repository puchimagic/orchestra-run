import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class InstructionsScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 50;
        const x = (this.game.canvas.width - btnWidth) / 2;
        const y = this.game.canvas.height - btnHeight - 50;
        this.nextButton = new Button(x, y, btnWidth, btnHeight, 'Go to Instrument Select');
    }

    update() {
        if (this.nextButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.INSTRUMENT_SELECT);
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
        ctx.fillText('How to Play', width / 2, 100);

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText('Player 1 (Character): Use A (left), S (jump), D (right) keys.', width / 2, height / 2 - 50);
        ctx.fillText('Player 2 (Music): Use keyboard to create platforms (Not implemented yet).', width / 2, height / 2);

        this.nextButton.draw(ctx);
    }
}