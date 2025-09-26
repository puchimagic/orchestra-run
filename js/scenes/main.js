import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { InputHandler } from '../input_handler.js';
import { soundPlayer } from '../../soundPlayer.js';

export class MainScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler;

        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/title_rank_select.png');
        };

        // ロゴ画像を読み込む
        this.logoImage = new Image();
        this.logoImage.src = 'img/logo.png';
        this.isLogoLoaded = false;
        this.logoImage.onload = () => {
            this.isLogoLoaded = true;
        };
        this.logoImage.onerror = () => {
            console.error('Failed to load logo image: img/logo.png');
        };
    }

    init() {
        this.onResize();
    }

    onResize() {
        const btnWidth = 300; // ボタンの幅を少し狭める
        const btnHeight = 75;
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        const gapX = 50; // 列間のギャップ
        const gapY = 20; // 行間のギャップ

        // 左列
        const leftColX = cx - btnWidth - gapX / 2;
        this.startButton = new Button(leftColX, cy - btnHeight - gapY / 2, btnWidth, btnHeight, 'ゲームスタート');
        this.descButton = new Button(leftColX, cy + gapY / 2, btnWidth, btnHeight, 'あそびかた');

        // 右列
        const rightColX = cx + gapX / 2;
        this.rankingButton = new Button(rightColX, cy - btnHeight - gapY / 2, btnWidth, btnHeight, 'ランキング');
        this.volumeSettingsButton = new Button(rightColX, cy + gapY / 2, btnWidth, btnHeight, '音量設定');
    }

    update() {
        if (!this.game.isGameActive) {
            if (this.inputHandler.isKeyPressed('KeyF')) {
                this.game.isGameActive = true;
                soundPlayer.playBGM('home_bgm');
                if (this.game.canvas.requestFullscreen) {
                    this.game.canvas.requestFullscreen();
                }
            }
            return; // Fキーが押されるまで他の操作をブロック
        }

        if (this.startButton.update(this.game.mouse)) {
            this.game.isGamepadConnectedAtStart = this.inputHandler.isGamepadConnected();
            this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        }
        if (this.rankingButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.RANKING);
        }
        if (this.descButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.GAME_DESCRIPTION);
        }
        if (this.volumeSettingsButton.update(this.game.mouse)) { // ★追加
            this.game.changeScene(SCENE.VOLUME_SETTINGS);
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

        if (this.isLogoLoaded) {
            // 画像のサイズと位置を調整して中央に配置
            const logoWidth = 600; // 適当な幅、調整が必要
            const logoHeight = this.logoImage.height * (logoWidth / this.logoImage.width); // アスペクト比を維持
            const logoX = width / 2 - logoWidth / 2;
            const logoY = height / 2 - 250 - logoHeight / 2; // 元のテキストのY座標を基準に中央寄せ
            ctx.drawImage(this.logoImage, logoX, logoY, logoWidth, logoHeight);
        } else {
            // 画像が読み込まれていない場合は、元のテキストを表示
            ctx.fillStyle = 'black';
            ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText('オケラン', width / 2, height / 2 - 250);
        }

        this.startButton.draw(ctx);
        this.rankingButton.draw(ctx);
        this.descButton.draw(ctx);
        this.volumeSettingsButton.draw(ctx); // ★追加

        if (!this.game.isGameActive) {
            ctx.fillStyle = 'black';
            ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText('Fキーを押してください。', width / 2, this.descButton.y + this.descButton.height + 60);
        }

        if (this.inputHandler.isGamepadConnected()) {
            ctx.fillStyle = 'green';
            ctx.font = `${FONT_SIZE.SMALL / 2}px ${FONT_FAMILY}`;
            ctx.textAlign = 'right';
            ctx.fillText('コントローラー接続済み', width - 20, height - 20);
        }
    }
}