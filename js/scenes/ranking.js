import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { Scrollbar } from '../ui/scrollbar.js';

export class RankingScene {
    constructor(game) {
        this.game = game;
        this.scores = [];

        // 背景画像
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => { this.isBackgroundLoaded = true; };
        this.backgroundImage.onerror = () => {
            console.error('背景画像の読み込みに失敗しました: img/title_rank_select.png');
        };

        this.rankingDisplayArea = { x: 0, y: 0, width: 0, height: 0 };
        this.scrollbar = new Scrollbar(0, 0, 20, 100, 0);

        this.onResize();
        this.loadScores();

        this.handleWheelBound = this.handleWheel.bind(this);
        this.game.canvas.addEventListener('wheel', this.handleWheelBound);
    }

    // テキストを最大幅に合わせて省略（必要なら…で切る）
    truncateTextToWidth(ctx, text, maxWidth) {
        if (!text) return '';
        if (ctx.measureText(text).width <= maxWidth) return text;
        const ellipsis = '…';
        let low = 0;
        let high = text.length;
        while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            const candidate = text.slice(0, mid) + ellipsis;
            if (ctx.measureText(candidate).width <= maxWidth) low = mid;
            else high = mid - 1;
            // 防止無限ループ
            if (high - low <= 1) break;
        }
        // 最終調整（lowかlow-1）
        for (let len = low; len >= 0; len--) {
            const candidate = text.slice(0, len) + ellipsis;
            if (ctx.measureText(candidate).width <= maxWidth) return candidate;
        }
        return ellipsis;
    }

    async loadScores() {
        this.scores = await this.game.scoreManager.getScores();

        // username が無い場合は "guest" を補完
        this.scores = this.scores.map(s => ({
            ...s,
            username: s.username && s.username.trim() !== "" ? s.username : "guest"
        }));

        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;

        const btnWidth = 400;
        const btnHeight = 100;
        const x = (width - btnWidth) / 2;
        const y = height - btnHeight - 60;
        this.backButton = new Button(x, y, btnWidth, btnHeight, '戻る');

        const rankingContentStartY = 170; // タイトルから少し余白
        const rankingContentEndY = y - 50;
        const availableHeight = rankingContentEndY - rankingContentStartY;

        // ===== 幅の決定（画面幅の 85% を使う、過度に広くしない） =====
        const scrollbarWidth = 20;
        const scrollbarMarginRight = 12;
        const horizontalPadding = 40; // 左右合計での余白（内部余白）
        const MAX_RANKING_WIDTH = 1600;
        const MIN_RANKING_WIDTH = 800;

        let computedMaxWidth = Math.floor(width * 0.85);
        computedMaxWidth = Math.min(computedMaxWidth, MAX_RANKING_WIDTH);
        computedMaxWidth = Math.max(computedMaxWidth, Math.min(MIN_RANKING_WIDTH, width - scrollbarWidth - scrollbarMarginRight - 20));

        // ランキング領域とスクロールバーを含む全体幅を中央寄せ
        const totalBlockWidth = computedMaxWidth + scrollbarWidth + scrollbarMarginRight;
        const displayStartX = Math.floor((width - totalBlockWidth) / 2);

        this.rankingDisplayArea = {
            x: displayStartX,
            y: rankingContentStartY,
            width: computedMaxWidth,
            height: availableHeight
        };

        // スクロールバーの位置（ランキング表示領域の右に配置）
        this.scrollbar.x = this.rankingDisplayArea.x + this.rankingDisplayArea.width + scrollbarMarginRight;
        this.scrollbar.y = this.rankingDisplayArea.y;
        this.scrollbar.width = scrollbarWidth;
        this.scrollbar.height = this.rankingDisplayArea.height;

        const lineHeight = 60;
        const maxDisplayCount = 50;
        const totalScoresHeight = maxDisplayCount * lineHeight;
        this.scrollbar.updateContentHeight(totalScoresHeight);
    }

    update() {
        const mouse = this.game.mouse;

        if (mouse.clicked) {
            if (this.scrollbar.handleMouseDown(mouse.x, mouse.y)) {
                return;
            }
        }

        if (!mouse.isDown && this.scrollbar.isDragging) {
            this.scrollbar.handleMouseUp();
        }

        if (this.scrollbar.isDragging) {
            this.scrollbar.handleMouseMove(mouse.x, mouse.y);
        }

        if (this.backButton && this.backButton.update(mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

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

        // 小フォントをセット（これで measureText する）
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        const lineHeight = 60;

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.rankingDisplayArea.x, this.rankingDisplayArea.y, this.rankingDisplayArea.width, this.rankingDisplayArea.height);
        ctx.clip();

        if (!this.scores || this.scores.length === 0) {
            ctx.textAlign = 'center';
            ctx.fillText('まだ記録がありません', width / 2, this.rankingDisplayArea.y + this.rankingDisplayArea.height / 2);
        } else {
            const maxDisplayWidth = this.rankingDisplayArea.width;
            const displayStartX = this.rankingDisplayArea.x;

            // 列位置（広めに確保）
            const rankX = displayStartX + maxDisplayWidth * 0.02;
            const usernameX = displayStartX + maxDisplayWidth * 0.16;
            const scoreX = displayStartX + maxDisplayWidth * 0.48; // 右寄せでスコア
            const instrumentX = displayStartX + maxDisplayWidth * 0.55; // 楽器はここから左寄せ
            const dateX = displayStartX + maxDisplayWidth * 0.98; // 日付は右端

            // 楽器名の最大幅（date と重ならないように余裕を持たせる）
            const gapBetweenInstrumentAndDate = 14; // px
            let instrumentMaxWidth = dateX - instrumentX - gapBetweenInstrumentAndDate;
            if (instrumentMaxWidth < 60) instrumentMaxWidth = 60; // 最低幅確保

            // ユーザー名の最大幅（スコアと被らないように）
            const gapBetweenUsernameAndScore = 12;
            let usernameMaxWidth = scoreX - usernameX - gapBetweenUsernameAndScore;
            if (usernameMaxWidth < 80) usernameMaxWidth = 80;

            let currentY = this.rankingDisplayArea.y + lineHeight / 2 - this.scrollbar.getScrollOffset();

            const maxDisplayCount = 50;
            for (let i = 0; i < maxDisplayCount; i++) {
                const entry = this.scores[i];
                const rank = `${i + 1}位`;

                let scoreText = '---';
                let instrumentText = '---';
                let dateText = '---';
                let usernameText = 'guest';

                if (entry) {
                    scoreText = `${entry.score.toLocaleString()} pt`;
                    instrumentText = entry.instrument ? `(${entry.instrument})` : '';
                    dateText = entry.date || '';
                    usernameText = entry.username || 'guest';
                }

                const textTop = currentY - lineHeight / 2;
                const textBottom = currentY + lineHeight / 2;

                if (textBottom < this.rankingDisplayArea.y || textTop > this.rankingDisplayArea.y + this.rankingDisplayArea.height) {
                    currentY += lineHeight;
                    continue;
                }

                // 順位
                ctx.textAlign = 'left';
                ctx.fillText(rank, rankX, currentY);

                // ユーザー名（長ければ省略）
                ctx.textAlign = 'left';
                const usernameToDraw = this.truncateTextToWidth(ctx, usernameText, usernameMaxWidth);
                ctx.fillText(usernameToDraw, usernameX, currentY);

                // スコア（右寄せ）
                ctx.textAlign = 'right';
                ctx.fillText(scoreText, scoreX, currentY);

                // 楽器（長ければ省略）
                ctx.textAlign = 'left';
                const instrumentToDraw = this.truncateTextToWidth(ctx, instrumentText, instrumentMaxWidth);
                ctx.fillText(instrumentToDraw, instrumentX, currentY);

                // 日付（右寄せ）
                ctx.textAlign = 'right';
                ctx.fillText(dateText, dateX, currentY);

                currentY += lineHeight;
            }
        }

        ctx.restore();
        this.scrollbar.draw(ctx);

        ctx.textAlign = 'center';
        if (this.backButton) {
            this.backButton.draw(ctx);
        }
    }

    destroy() {
        this.game.canvas.removeEventListener('wheel', this.handleWheelBound);
    }

    handleWheel(event) {
        event.preventDefault();
        this.scrollbar.scrollBy(event.deltaY * 0.5);
    }
}