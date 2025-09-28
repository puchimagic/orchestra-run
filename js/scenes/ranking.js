import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { Scrollbar } from '../ui/scrollbar.js'; // Scrollbar をインポート

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
            console.error('背景画像の読み込みに失敗しました: img/title_rank_select.png');
        };

        // this.rankingDisplayArea と this.scrollbar をコンストラクタで完全に初期化する
        this.rankingDisplayArea = { x: 0, y: 0, width: 0, height: 0 };
        this.scrollbar = new Scrollbar(0, 0, 20, 100, 0); // 仮の値で初期化

        this.onResize();
        this.loadScores();
    }

    async loadScores() {
        this.scores = await this.game.scoreManager.getScores();
        // this.scores = this.scores.slice(0, 50); // ScoreManager 側で制限されるため削除
        this.onResize(); // スコアがロードされたら再計算
    }

    onResize() {
        const { width, height } = this.game.canvas;

        const btnWidth = 400;
        const btnHeight = 100;
        const x = (width - btnWidth) / 2;
        const y = height - btnHeight - 100;
        this.backButton = new Button(x, y, btnWidth, btnHeight, '戻る');

        // ランキングリストの表示領域を定義
        const rankingContentStartY = 120 + 50;
        const backButtonY = y; // backButton の y 座標を直接使用
        const rankingContentEndY = backButtonY - 50;
        const availableHeight = rankingContentEndY - rankingContentStartY;

        const maxDisplayWidth = 900;
        const displayStartX = (width - maxDisplayWidth) / 2;

        this.rankingDisplayArea = {
            x: displayStartX,
            y: rankingContentStartY,
            width: maxDisplayWidth,
            height: availableHeight
        };

        // スクロールバーの位置とサイズを設定
        const scrollbarWidth = 20;
        this.scrollbar.x = this.rankingDisplayArea.x + this.rankingDisplayArea.width - scrollbarWidth;
        this.scrollbar.y = this.rankingDisplayArea.y;
        this.scrollbar.width = scrollbarWidth;
        this.scrollbar.height = this.rankingDisplayArea.height;

        // スクロール可能なコンテンツの総高さを計算
        const lineHeight = 60;
        const maxDisplayCount = 50; // draw メソッドの maxDisplayCount と合わせる
        const totalScoresHeight = maxDisplayCount * lineHeight; // 常に50行分の高さを確保
        this.scrollbar.updateContentHeight(totalScoresHeight);

        console.log("totalScoresHeight:", totalScoresHeight); // デバッグ情報
        console.log("scrollbar.height (rankingDisplayArea.height):", this.scrollbar.height); // デバッグ情報
    }

    update() {
        const mouse = this.game.mouse;

        // スクロールバーの処理
        if (mouse.clicked) {
            if (this.scrollbar.handleMouseDown(mouse.x, mouse.y)) {
                // スクロールバーがクリックされたら、他のボタン処理は行わない
                return;
            }
        }

        // マウスボタンが離されたらドラッグ終了
        if (!mouse.isDown && this.scrollbar.isDragging) {
            this.scrollbar.handleMouseUp();
        }

        // ドラッグ中は常にマウス移動を処理
        if (this.scrollbar.isDragging) {
            this.scrollbar.handleMouseMove(mouse.x, mouse.y);
        }

        // 戻るボタンの処理
        if (this.backButton && this.backButton.update(mouse)) {
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
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('ランキング', width / 2, 120);

        // ランキングリストの描画
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        const lineHeight = 60;

        // クリッピング領域を設定
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

            const rankX = displayStartX + maxDisplayWidth * 0.02;
            const scoreX = displayStartX + maxDisplayWidth * 0.25;
            const instrumentX = displayStartX + maxDisplayWidth * 0.3;
            const dateX = displayStartX + maxDisplayWidth * 0.98;

            // スクロールオフセットを適用
            let currentY = this.rankingDisplayArea.y + lineHeight / 2 - this.scrollbar.getScrollOffset();

            // 最大50件まで表示し、足りない場合は「---」で埋める
            const maxDisplayCount = 50;
            for (let i = 0; i < maxDisplayCount; i++) {
                const entry = this.scores[i];
                const rank = `${i + 1}位`;
                let scoreText = '---';
                let instrumentText = '---';
                let dateText = '---';

                if (entry) {
                    scoreText = `${entry.score.toLocaleString()} pt`;
                    instrumentText = `(${entry.instrument})`;
                    dateText = entry.date;
                }

                // 描画範囲外のスコアはスキップ
                const textTop = currentY - lineHeight / 2;
                const textBottom = currentY + lineHeight / 2;

                if (textBottom < this.rankingDisplayArea.y || textTop > this.rankingDisplayArea.y + this.rankingDisplayArea.height) {
                    currentY += lineHeight;
                    continue; // スキップではなく continue に変更
                }

                ctx.textAlign = 'left';
                ctx.fillText(rank, rankX, currentY);

                ctx.textAlign = 'right';
                ctx.fillText(scoreText, scoreX, currentY);

                ctx.textAlign = 'left';
                ctx.fillText(instrumentText, instrumentX, currentY);

                ctx.textAlign = 'right';
                ctx.fillText(dateText, dateX, currentY);
                
                currentY += lineHeight;
            }
        }

        ctx.restore(); // クリッピング領域を解除

        // スクロールバーの描画
        this.scrollbar.draw(ctx);

        ctx.textAlign = 'center';
        if (this.backButton) {
            this.backButton.draw(ctx);
        }
    }

    destroy() {
        // シーンが破棄されるときにイベントリスナーを削除
        // this.game.canvas.removeEventListener('wheel', this.handleWheelBound); // 削除
        this.game.canvas.removeEventListener('wheel', this.handleWheel);
    }

    // handleWheel メソッドをアロー関数としてクラスプロパティで定義
    handleWheel = (event) => {
        // マウスがランキング表示領域内にある場合のみ処理 (一時的にコメントアウト)
        // const mouseX = this.game.mouse.x;
        // const mouseY = this.game.mouse.y;

        // if (mouseX >= this.rankingDisplayArea.x && mouseX <= this.rankingDisplayArea.x + this.rankingDisplayArea.width &&
        //     mouseY >= this.rankingDisplayArea.y && mouseY <= this.rankingDisplayArea.y + this.rankingDisplayArea.height) {
            event.preventDefault(); // デフォルトのスクロール動作を抑制
            this.scrollbar.scrollBy(event.deltaY * 0.5); // スクロール感度を調整

            console.log("deltaY:", event.deltaY); // デバッグ情報
            console.log("scrollPosition:", this.scrollbar.scrollPosition); // デバッグ情報
        // }
    }
}