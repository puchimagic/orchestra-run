import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { soundPlayer } from '../../soundPlayer.js';

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
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
        this.inputHandler = this.game.inputHandler; // Create an instance of InputHandler
    }

    init() {
        this.onResize();
    }

    onResize() {
        const btnWidth = 300;
        const btnHeight = 75;
        const x = (this.game.canvas.width - btnWidth) / 2;
        const y = this.game.canvas.height - btnHeight - 75;
        this.backButton = new Button(x, y, btnWidth, btnHeight, 'メインに戻る');
    }

    update() {
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
        } else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('あそびかた', width / 2, 120); // タイトルはY=120

        // ★レイアウト調整
        const descriptionFontSize = 32; // 文字サイズを少し小さく
        ctx.font = `${descriptionFontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        const lineHeight = 45; // 行間を詰める
        let currentY;

        // 説明テキスト表示可能領域の縦方向の開始Yと終了Yを決定
        const descriptionContentStartY = 120 + 100; // タイトルY + タイトルからのマージンを増やす
        const backButtonY = this.backButton ? this.backButton.y : this.game.canvas.height - 75 - 75; // backButtonが未定義の場合のフォールバック
        const descriptionContentEndY = backButtonY - 50; // ボタンY - ボタンへのマージン
        const availableHeight = descriptionContentEndY - descriptionContentStartY;

        // 説明テキスト全体の高さを計算 (9行のテキスト + 間に挿入されるlineHeightの合計)
        const totalDescriptionHeight = 18 * lineHeight; // 9行のテキスト + 2*2 + 5*1 = 18行分の高さ

        // 説明テキスト全体を中央に配置するための開始Y座標
        currentY = descriptionContentStartY + (availableHeight - totalDescriptionHeight) / 2;
        if (currentY < descriptionContentStartY) { // 最小値チェック（テキストが長すぎて領域に収まらない場合）
            currentY = descriptionContentStartY;
        }

        const maxTextWidth = 1200; // Maximum width for the text block
        const startX = (width - maxTextWidth) / 2; // Center the text block

        ctx.fillText('このゲームは、2人で協力してハイスコアを目指すゲームです。', startX, currentY);
        currentY += lineHeight * 1.6;

        ctx.fillText('■ プレイヤー1（キャラクター操作）', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   A: 左に移動,  D: 右に移動,  S: ジャンプ', startX, currentY);
        currentY += lineHeight * 1.6;

        ctx.fillText('■ プレイヤー2（おんがく・足場作り）', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   すごく長い穴が来ると、オレンジ色の枠と押すべきキーが表示されます。', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   表示されたキーを押して、プレイヤー1のための足場を作りましょう！', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   (使用キーの例: U, I, O, J, K, L, P など)', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   ※選んだ楽器によって、使うキーの種類や数、同時押しルールが変わります。', startX, currentY);

        ctx.textAlign = 'center';
        this.backButton.draw(ctx);
    }
}