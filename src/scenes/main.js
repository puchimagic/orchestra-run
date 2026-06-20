import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { soundPlayer } from '../soundPlayer.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class MainScene {
    constructor(game) {
        this.game = game;

        this.backgroundImage = loadImage('assets/img/bg_title.png');
        this.logoImage = loadImage('assets/img/logo.png');
        this.logoImage.onload = () => this.onResize();

        this.logoX = 0;
        this.logoY = 0;
        this.logoWidth = 0;
        this.logoHeight = 0;
    }


    init() {
        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;
        const cx = width / 2;

        const logoDisplayWidth = width * 0.7;
        const logoDisplayHeight = this.logoImage.height * (logoDisplayWidth / this.logoImage.width);
        const logoY = height * 0.05;

        this.logoX = cx - logoDisplayWidth / 2;
        this.logoY = logoY;
        this.logoWidth = logoDisplayWidth;
        this.logoHeight = logoDisplayHeight;

        const btnWidth = 550;
        const btnHeight = 150;
        const gapX = 100;
        const gapY = 50;
        const buttonsStartY = height * 0.55;
        const leftColX = cx - btnWidth - gapX / 2;
        const rightColX = cx + gapX / 2;

        this.startButton = new Button(leftColX, buttonsStartY, btnWidth, btnHeight, '楽器選択');
        this.descButton = new Button(leftColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, 'あそびかた');
        this.rankingButton = new Button(rightColX, buttonsStartY, btnWidth, btnHeight, 'ランキング');
        this.settingsButton = new Button(rightColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, '設定');
    }

    update() {
        if (!this.game.isGameActive) {
            if (this.game.inputHandler.isActivated()) {
                this.game.isGameActive = true;
                soundPlayer.playBGM('home_bgm');
            }
            return;
        }

        if (this.startButton.update(this.game.mouse)) this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        if (this.rankingButton.update(this.game.mouse)) this.game.changeScene(SCENE.RANKING);
        if (this.descButton.update(this.game.mouse)) this.game.changeScene(SCENE.GAME_DESCRIPTION);
        if (this.settingsButton.update(this.game.mouse)) this.game.changeScene(SCENE.SETTINGS);
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        drawBackground(ctx, this.backgroundImage, width, height);

        if (!this.game.isGameActive) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText('画面をクリックしてください', width / 2, height / 2);
        } else {
            if (this.logoImage.complete && this.logoImage.naturalHeight !== 0) {
                ctx.drawImage(this.logoImage, this.logoX, this.logoY, this.logoWidth, this.logoHeight);
            }
            this.startButton.draw(ctx);
            this.rankingButton.draw(ctx);
            this.descButton.draw(ctx);
            this.settingsButton.draw(ctx);
        }
    }
}
