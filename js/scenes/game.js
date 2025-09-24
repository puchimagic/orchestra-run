import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Player } from '../player.js';
import { Stage } from '../stage.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = null;
    }

    init(data) {
        this.startTime = Date.now();
        this.score = 0;
        this.selectedInstrument = data.instrument || 'なし';

        this.player = new Player(this.game);
        this.stage = new Stage(this.game);

        this.player.init();
        this.stage.init();
    }

    update() {
        this.score = Math.floor((Date.now() - this.startTime) / 1000);

        this.stage.update();
        this.player.update(this.stage.platforms);

        this.checkGameOver();
    }

    checkGameOver() {
        if (this.player.y > this.game.canvas.height) {
            this.gameOver();
        }
        if (this.player.x < this.stage.cameraX) {
            this.gameOver();
        }
    }

    gameOver() {
        this.player.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.selectedInstrument });
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(-this.stage.cameraX, 0);

        this.stage.draw(ctx);
        this.player.draw(ctx);

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);
        ctx.fillText(`楽器: ${this.selectedInstrument}`, 20, 100);
    }
}