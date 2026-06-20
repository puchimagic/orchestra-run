import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.lastInstrument = null;
        this.backgroundImage = loadImage('assets/img/bg_gameover.png');
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.lastInstrument = data.instrument || 'なし';

        this.game.scoreManager.addScore(this.finalScore, this.lastInstrument);

        const btnWidth = 500;
        const btnHeight = 100;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.continueButton = new Button(cx - btnWidth / 2, cy + 80, btnWidth, btnHeight, 'コンティニュー');
        this.backButton = new Button(cx - btnWidth / 2, cy + 200, btnWidth, btnHeight, 'メインに戻る');
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

        drawBackground(ctx, this.backgroundImage, width, height, '#a0a0a0');

        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 12;
        ctx.strokeText('ゲームオーバー', width / 2, height / 2 - 120);
        ctx.fillStyle = 'white';
        ctx.fillText('ゲームオーバー', width / 2, height / 2 - 120);

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;
        ctx.strokeText(`スコア: ${this.finalScore}`, width / 2, height / 2 - 30);
        ctx.fillStyle = 'white';
        ctx.fillText(`スコア: ${this.finalScore}`, width / 2, height / 2 - 30);

        this.continueButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}
