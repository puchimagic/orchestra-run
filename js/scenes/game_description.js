import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { soundPlayer } from '../../soundPlayer.js';

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const btnWidth = 300;
        const btnHeight = 75;
        const x = (this.game.canvas.width - btnWidth) / 2;
        const y = this.game.canvas.height - btnHeight - 75;
        this.backButton = new Button(x, y, btnWidth, btnHeight, 'メインに戻る');
        soundPlayer.playBGM('home_bgm');
    }

    update() {
        if (this.backButton.update(this.game.mouse)) {
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
        ctx.fillText('あそびかた', width / 2, 120);

        // ★レイアウト調整
        const descriptionFontSize = 32; // 文字サイズを少し小さく
        ctx.font = `${descriptionFontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        const lineHeight = 45; // 行間を詰める
        let currentY = 180;    // さらに開始位置を上げる
        const startX = width / 2 - 600;

        ctx.fillText('このゲームは、2人で協力してハイスコアを目指すゲームです。', startX, currentY);
        currentY += lineHeight * 2;

        ctx.fillText('■ プレイヤー1（キャラクター操作）', startX, currentY);
        currentY += lineHeight;
        ctx.fillText('   A: 左に移動,  D: 右に移動,  S: ジャンプ', startX, currentY);
        currentY += lineHeight * 2;

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