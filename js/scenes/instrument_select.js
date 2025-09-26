import { SCENE, FONT_SIZE, FONT_FAMILY, KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_ORDER } from '../config.js';
import { Button } from '../ui/button.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = INSTRUMENT_ORDER[0];
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        const row_margin = 20;

        // ★中央揃えの計算方法を修正
        const infoTextWidth = 250; // 説明テキスト用のおおよその幅
        const gap = 40; // ボタンとボタンの間の隙間
        const totalWidth = btnWidth + infoTextWidth + gap + btnWidth + infoTextWidth;
        const startX = cx - totalWidth / 2;
        
        const col1_x = startX;
        const col2_x = startX + btnWidth + infoTextWidth + gap;

        const y1 = cy - btnHeight - row_margin - 80;
        const y2 = cy - 80;
        const y3 = cy + btnHeight + row_margin - 80;

        this.instrumentButtons = {};
        INSTRUMENT_ORDER.forEach((name, i) => {
            let x, y;
            if (i < 3) {
                x = col1_x;
                y = [y1, y2, y3][i];
            } else {
                x = col2_x;
                y = [y1, y2, y3][i - 3];
            }
            this.instrumentButtons[name] = new Button(x, y, btnWidth, btnHeight, name);
        });

        const bottomButtonY = y3 + btnHeight + 80;
        this.startButton = new Button(cx - btnWidth / 2 - 170, bottomButtonY, btnWidth, btnHeight, 'ゲームスタート', '#4CAF50', '#66BB6A');
        this.backButton = new Button(cx - btnWidth / 2 + 170, bottomButtonY, btnWidth, btnHeight, 'メインに戻る');
    }

    update() {
        for (const instrument of INSTRUMENT_ORDER) {
            if (this.instrumentButtons[instrument].update(this.game.mouse)) {
                this.selectedInstrument = instrument;
            }
        }

        if (this.startButton.update(this.game.mouse)) {
            this.game.selectedInstrument = this.selectedInstrument; // Gameクラスに選択された楽器を保存
            this.game.changeScene(SCENE.GAME); // GameSceneのコンストラクタでselectedInstrumentを受け取るため、dataは不要
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
        ctx.fillText('楽器をえらんでね', width / 2, 100);

        for (const name of INSTRUMENT_ORDER) {
            const button = this.instrumentButtons[name];
            const instrument = KEYBOARD_INSTRUMENT_CONFIG[name]; // Use KEYBOARD_INSTRUMENT_CONFIG for display

            if (this.selectedInstrument === name) {
                button.color = '#333';
                button.hoverColor = '#555';
            } else {
                button.color = '#888';
                button.hoverColor = '#aaa';
            }
            button.draw(ctx);

            ctx.fillStyle = '#555';
            ctx.font = `24px ${FONT_FAMILY}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let infoText = `キー: ${instrument.keys.length}種`;
            if (instrument.maxChord > 1) {
                infoText += ` / 最大${instrument.maxChord}音`;
            }

            ctx.fillText(infoText, button.x + button.width + 20, button.y + button.height / 2);
        }

        ctx.textAlign = 'center';
        this.startButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}