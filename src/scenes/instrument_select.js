import { SCENE, FONT_SIZE, FONT_FAMILY, KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_ORDER, DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_HOVER_COLOR } from '../config.js';
import { Button } from '../ui/button.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = INSTRUMENT_ORDER[0];
        this.backgroundImage = loadImage('assets/img/bg_title.png');
    }

    init() {
        this.onResize();
    }

    onResize() {
        const btnWidth = 500;
        const btnHeight = 100;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        const row_margin = 30;
        const col_gap = 60;
        const infoTextWidth = 250;

        const instrumentBlockWidth = (btnWidth + infoTextWidth) * 2 + col_gap;
        const instrumentBlockStartX = cx - instrumentBlockWidth / 2;
        const col1_x = instrumentBlockStartX;
        const col2_x = instrumentBlockStartX + btnWidth + infoTextWidth + col_gap;

        const y1 = cy - btnHeight - row_margin - 100;
        const y2 = cy - 10;
        const y3 = cy + btnHeight + row_margin + 80;

        this.instrumentButtons = {};
        INSTRUMENT_ORDER.forEach((name, i) => {
            const x = i < 3 ? col1_x : col2_x;
            const y = [y1, y2, y3][i < 3 ? i : i - 3];
            this.instrumentButtons[name] = new Button(x, y, btnWidth, btnHeight, name, DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_HOVER_COLOR, `${name}_track01`, "instrumentSound");
        });

        const bottomButtonY = y3 + btnHeight + 100;
        const buttonGroupWidth = btnWidth * 2 + col_gap;
        const buttonGroupStartX = cx - buttonGroupWidth / 2;

        this.startButton = new Button(buttonGroupStartX, bottomButtonY, btnWidth, btnHeight, 'スタート', '#4CAF50', '#66BB6A');
        this.backButton = new Button(buttonGroupStartX + btnWidth + col_gap, bottomButtonY, btnWidth, btnHeight, '戻る');
    }

    update() {
        for (const instrument of INSTRUMENT_ORDER) {
            if (this.instrumentButtons[instrument].update(this.game.mouse)) {
                this.selectedInstrument = instrument;
            }
        }
        if (this.startButton.update(this.game.mouse)) {
            this.game.selectedInstrument = this.selectedInstrument;
            this.game.changeScene(SCENE.GAME);
        }
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        drawBackground(ctx, this.backgroundImage, width, height);

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('楽器をえらんでね', width / 2, 120);

        for (const name of INSTRUMENT_ORDER) {
            const button = this.instrumentButtons[name];
            const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[name];

            button.isHighlighted = (this.selectedInstrument === name);
            button.draw(ctx);

            ctx.fillStyle = '#555';
            ctx.font = `40px ${FONT_FAMILY}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let infoText = `キー: ${instrumentConfig.keys.length}種`;
            if (instrumentConfig.maxChord > 1) infoText += ` / 最大${instrumentConfig.maxChord}音`;
            ctx.fillText(infoText, button.x + button.width + 20, button.y + button.height / 2);
        }

        ctx.textAlign = 'center';
        this.startButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}