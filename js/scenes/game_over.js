import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.lastInstrument = null;

         // 背景画像を読み込む
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/gameover.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('背景画像の読み込みに失敗しました: img/gameover.png');
        };
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.lastInstrument = data.instrument || 'なし';

        this.game.scoreManager.addScore(this.finalScore, this.lastInstrument);

        const btnWidth = 500; // 400から増加
        const btnHeight = 100; // 75から増加
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;

        // より大きなボタンと広い間隔のためにY座標を調整
        this.continueButton = new Button(cx - btnWidth / 2, cy + 80, btnWidth, btnHeight, 'コンティニュー'); // +50から調整
        this.backButton = new Button(cx - btnWidth / 2, cy + 200, btnWidth, btnHeight, 'メインに戻る'); // +140から調整
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

        //背景設定
        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        }
        else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#a0a0a0';
            ctx.fillRect(0, 0, width, height);
        }

        // ゲームオーバーテキスト
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black'; // 枠の色を黒に
        ctx.lineWidth = 12;
        ctx.strokeText('ゲームオーバー', width / 2, height / 2 - 120);
        ctx.fillStyle = 'white';   // 文字の色を白に
        ctx.fillText('ゲームオーバー', width / 2, height / 2 - 120);

        // スコアテキスト
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.strokeStyle = 'black'; // 枠の色を黒に
        ctx.lineWidth = 10;
        ctx.strokeText(`スコア: ${this.finalScore}`, width / 2, height / 2 - 30);
        ctx.fillStyle = 'white';   // 文字の色を白に
        ctx.fillText(`スコア: ${this.finalScore}`, width / 2, height / 2 - 30);

        this.continueButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}