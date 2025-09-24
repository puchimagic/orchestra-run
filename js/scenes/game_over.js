import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.lastInstrument = null;
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.lastInstrument = data.instrument || 'なし';

        const btnWidth = 300;
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.continueButton = new Button(cx - btnWidth / 2, cy + 50, btnWidth, btnHeight, 'コンティニュー');
        this.backButton = new Button(cx - btnWidth / 2, cy + 140, btnWidth, btnHeight, 'メインに戻る');
    }

    update() {
        if (this.continueButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.GAME, { instrument: this.lastInstrument });
        }
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'white';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('ゲームオーバー', width / 2, height / 2 - 120);

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.finalScore}`, width / 2, height / 2 - 30);

        this.continueButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}
