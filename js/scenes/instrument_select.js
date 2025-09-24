import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

const INSTRUMENTS = ['トライアングル', 'タンバリン', 'ピアノ', 'ギター', 'ドラム'];

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = INSTRUMENTS[0]; // Default selection
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        const col_margin = 20;
        const row_margin = 20;

        // 2列レイアウト
        const col1_x = cx - btnWidth - col_margin;
        const col2_x = cx + col_margin;
        const y1 = cy - btnHeight - row_margin - 50;
        const y2 = cy - 50;
        const y3 = cy + btnHeight + row_margin - 50;

        this.instrumentButtons = {};
        this.instrumentButtons[INSTRUMENTS[0]] = new Button(col1_x, y1, btnWidth, btnHeight, INSTRUMENTS[0]);
        this.instrumentButtons[INSTRUMENTS[1]] = new Button(col1_x, y2, btnWidth, btnHeight, INSTRUMENTS[1]);
        this.instrumentButtons[INSTRUMENTS[2]] = new Button(col1_x, y3, btnWidth, btnHeight, INSTRUMENTS[2]);
        this.instrumentButtons[INSTRUMENTS[3]] = new Button(col2_x, y1, btnWidth, btnHeight, INSTRUMENTS[3]);
        this.instrumentButtons[INSTRUMENTS[4]] = new Button(col2_x, y2, btnWidth, btnHeight, INSTRUMENTS[4]);

        const bottomButtonY = y3 + btnHeight + 80;
        this.startButton = new Button(cx - btnWidth - col_margin, bottomButtonY, btnWidth, btnHeight, 'ゲームスタート', '#4CAF50', '#66BB6A');
        this.backButton = new Button(cx + col_margin, bottomButtonY, btnWidth, btnHeight, 'メインに戻る');
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
