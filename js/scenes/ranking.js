import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class RankingScene {
    constructor(game) {
        this.game = game;
        this.scores = [];

        // 背景画像を読み込む
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/title_rank_select.png');
        };

        this.onResize();
        this.loadScores();
    }

    async loadScores() {
        this.scores = await this.game.scoreManager.getScores();
    }

    onResize() {
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

        //背景設定
        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('ランキング', width / 2, 120);

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        const lineHeight = 60;
        let currentY;

        // ランキングリストの表示領域の開始Yと終了Yを定義
        const rankingContentStartY = 120 + 50; // タイトルY + タイトルからのマージン
        const backButtonY = this.backButton ? this.backButton.y : this.game.canvas.height - 75 - 75; // backButtonが未定義の場合のフォールバック
        const rankingContentEndY = backButtonY - 50;
        const availableHeight = rankingContentEndY - rankingContentStartY;

        if (!this.scores || this.scores.length === 0) {
            ctx.textAlign = 'center';
            // 「まだ記録がありません」を中央に配置
            currentY = rankingContentStartY + availableHeight / 2;
            ctx.fillText('まだ記録がありません', width / 2, currentY);
        } else {
            const maxDisplayWidth = 900; // 全体をコンパクトにする
            const displayStartX = (width - maxDisplayWidth) / 2;

            // 各列の配置をdisplayStartXからのオフセットで指定
            const rankX = displayStartX + maxDisplayWidth * 0.02; // 順位をかなり左に寄せる
            const scoreX = displayStartX + maxDisplayWidth * 0.25; // スコアを左に寄せ、順位との間隔を調整
            const instrumentX = displayStartX + maxDisplayWidth * 0.3; // 楽器名を左に寄せ、スコアとの間隔を調整
            const dateX = displayStartX + maxDisplayWidth * 0.98; // 日付は右端に近く配置

            const numScores = this.scores.length;
            const totalScoresHeight = numScores * lineHeight;

            // ランキングリスト全体を中央に配置するための開始Y座標
            currentY = rankingContentStartY + (availableHeight - totalScoresHeight) / 2;
            if (currentY < rankingContentStartY) { // 最小値チェック（リストが長すぎて領域に収まらない場合）
                currentY = rankingContentStartY;
            }

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
