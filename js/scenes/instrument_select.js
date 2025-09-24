import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = 'カスタネット'; // Default selection
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.instrumentButtons = {
            'カスタネット': new Button(cx - btnWidth / 2, cy - 150, btnWidth, btnHeight, 'カスタネット'),
            'ギター': new Button(cx - btnWidth / 2, cy - 50, btnWidth, btnHeight, 'ギター'),
            'ピアノ': new Button(cx - btnWidth / 2, cy + 50, btnWidth, btnHeight, 'ピアノ'),
        };

        this.startButton = new Button(cx - 150, cy + 200, btnWidth, btnHeight, 'ゲームスタート', '#4CAF50', '#66BB6A');
        this.backButton = new Button(cx - 150, cy + 290, btnWidth, btnHeight, 'メインに戻る');
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
        ctx.fillText('楽器をえらんでね', width / 2, 150);

        for (const [instrument, button] of Object.entries(this.instrumentButtons)) {
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
        this.backButton.draw(ctx);
    }
}