import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class RankingScene {
    constructor(game) {
        this.game = game;
        this.scores = [];
    }

    async init() {
        this.scores = await this.game.scoreManager.getScores();

        const btnWidth = 300;
        const btnHeight = 75;
        const x = (this.game.canvas.width - btnWidth) / 2;
        const y = this.game.canvas.height - btnHeight - 75;
        this.backButton = new Button(x, y, btnWidth, btnHeight, 'メインに戻る');
    }

    update() {
        if (this.backButton && this.backButton.update(this.game.mouse)) {
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
        ctx.fillText('ランキング', width / 2, 120);

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        const lineHeight = 60;
        let currentY = 250;

        if (!this.scores || this.scores.length === 0) {
            ctx.textAlign = 'center';
            ctx.fillText('まだ記録がありません', width / 2, height / 2);
        } else {
            // ★各列の配置を画面幅からの割合で指定
            const rankX = width * 0.15;
            const scoreX = width * 0.4;
            const instrumentX = width * 0.45;
            const dateX = width * 0.85;

            this.scores.forEach((entry, index) => {
                const rank = `${index + 1}位`;
                const scoreText = `${entry.score.toLocaleString()} pt`;
                const instrumentText = `(${entry.instrument})`;
                const dateText = entry.date;

                // 順位 (左揃え)
                ctx.textAlign = 'left';
                ctx.fillText(rank, rankX, currentY);

                // スコア (右揃え)
                ctx.textAlign = 'right';
                ctx.fillText(scoreText, scoreX, currentY);

                // 楽器名 (左揃え)
                ctx.textAlign = 'left';
                ctx.fillText(instrumentText, instrumentX, currentY);

                // 日時 (右揃え)
                ctx.textAlign = 'right';
                ctx.fillText(dateText, dateX, currentY);
                
                currentY += lineHeight;
            });
        }

        ctx.textAlign = 'center';
        if (this.backButton) {
            this.backButton.draw(ctx);
        }
    }
}