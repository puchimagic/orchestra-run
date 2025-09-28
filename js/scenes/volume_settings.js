import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js';
import { soundPlayer } from '../../soundPlayer.js';

export class VolumeSettingsScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler; // 入力ハンドラへの参照を取得
        this.activeSlider = null;
    }

    init() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => { this.isBackgroundLoaded = true; };

        this.bgmSlider = new VolumeSlider(0, 0, 300, 30, 'BGM音量', soundPlayer.bgmVolume, (v) => soundPlayer.setBgmVolume(v));
        this.instrumentSlider = new VolumeSlider(0, 0, 300, 30, '楽器音量', soundPlayer.instrumentVolume, (v) => soundPlayer.setInstrumentVolume(v));
        this.gameSoundSlider = new VolumeSlider(0, 0, 300, 30, '効果音量', soundPlayer.gameSoundVolume, (v) => soundPlayer.setGameSoundVolume(v));
        this.backButton = new Button(0, 0, 400, 75, 'メイン画面に戻る');

        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;
        const sliderWidth = 300;
        const sliderX = width / 2 - sliderWidth / 2;
        let sliderYOffset = height / 2 - 150;

        this.bgmSlider.x = sliderX; this.bgmSlider.y = sliderYOffset; sliderYOffset += 100;
        this.instrumentSlider.x = sliderX; this.instrumentSlider.y = sliderYOffset; sliderYOffset += 100;
        this.gameSoundSlider.x = sliderX; this.gameSoundSlider.y = sliderYOffset;

        const btnWidth = 400;
        this.backButton.x = width / 2 - btnWidth / 2;
        this.backButton.y = height / 2 + 150;
    }

    update() {
        const mouse = this.game.mouse;

        // マウスが押された瞬間の処理
        if (mouse.clicked) {
            if (this.bgmSlider.handleMouseDown(mouse.x, mouse.y)) {
                this.activeSlider = this.bgmSlider;
            } else if (this.instrumentSlider.handleMouseDown(mouse.x, mouse.y)) {
                this.activeSlider = this.instrumentSlider;
            } else if (this.gameSoundSlider.handleMouseDown(mouse.x, mouse.y)) {
                this.activeSlider = this.gameSoundSlider;
            }
        }

        // マウスボタンが離されたら、ドラッグを終了
        if (!this.inputHandler.isMouseDown() && this.activeSlider) {
            this.activeSlider.handleMouseUp();
            this.activeSlider = null;
        }

        // ドラッグ中の処理
        if (this.activeSlider) {
            this.activeSlider.handleMouseMove(mouse.x);
        }

        // 戻るボタンの処理 (スライダー操作中でない場合のみ)
        if (!this.activeSlider && this.backButton.update(mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        if (this.isBackgroundLoaded) ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        else { ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, width, height); }

        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('音量設定', width / 2, 120);

        this.bgmSlider.draw(ctx);
        this.instrumentSlider.draw(ctx);
        this.gameSoundSlider.draw(ctx);
        this.backButton.draw(ctx);
    }

    destroy() {
        // constructorでイベントリスナーを追加しなくなったので、クリーンアップは不要
    }
}