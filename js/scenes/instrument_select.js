import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = 'カスタネット'; // Default selection
    }

    init() {
        const btnWidth = 200;
        const btnHeight = 50;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.instrumentButtons = {
            'カスタネット': new Button(cx - btnWidth / 2, cy - 100, btnWidth, btnHeight, 'カスタネット'),
            'ギター': new Button(cx - btnWidth / 2, cy - 30, btnWidth, btnHeight, 'ギター'),
            'ピアノ': new Button(cx - btnWidth / 2, cy + 40, btnWidth, btnHeight, 'ピアノ'),
        };

        this.startButton = new Button(cx - btnWidth / 2, cy + 150, btnWidth, btnHeight, 'Start Game', '#4CAF50', '#66BB6A');
    }

    update() {
        for (const [instrument, button] of Object.entries(this.instrumentButtons)) {
            if (button.update(this.game.mouse)) {
                this.selectedInstrument = instrument;
            }
        }

        if (this.startButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.GAME, { instrument: this.selectedInstrument });
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
        ctx.fillText('Select an Instrument', width / 2, 100);

        for (const [instrument, button] of Object.entries(this.instrumentButtons)) {
            // Highlight selected button
            if (this.selectedInstrument === instrument) {
                button.color = '#333';
                button.hoverColor = '#555';
            } else {
                button.color = '#888';
                button.hoverColor = '#aaa';
            }
            button.draw(ctx);
        }

        this.startButton.draw(ctx);
    }
}
