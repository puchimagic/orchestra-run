import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class MainScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const btnWidth = 400;
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        this.startButton = new Button(cx - btnWidth / 2, cy - 100, btnWidth, btnHeight, 'ゲームスタート');
        this.rankingButton = new Button(cx - btnWidth / 2, cy, btnWidth, btnHeight, 'ランキング');
        this.descButton = new Button(cx - btnWidth / 2, cy + 100, btnWidth, btnHeight, 'あそびかた');
    }

    update() {
        if (this.startButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        }
        if (this.rankingButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.RANKING);
        }
        if (this.descButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.GAME_DESCRIPTION);
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
        ctx.fillText('スーパー ジェミニ ランナー', width / 2, height / 2 - 250);

        this.startButton.draw(ctx);
        this.rankingButton.draw(ctx);
        this.descButton.draw(ctx);
    }
}