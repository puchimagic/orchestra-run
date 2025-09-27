import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js';
import { soundPlayer } from '../../soundPlayer.js';

export class SettingsScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler;
        this.activeSlider = null;
    }

    init() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => { this.isBackgroundLoaded = true; };

        // Volume Sliders (3種類に修正)
        this.bgmSlider = new VolumeSlider(0, 0, 400, 30, 'BGM音量', soundPlayer.bgmVolume, (v) => {
            soundPlayer.setBgmVolume(v);
            this.game.saveSettings();
        });
        this.instrumentSlider = new VolumeSlider(0, 0, 400, 30, '楽器音量', soundPlayer.instrumentVolume, (v) => {
            soundPlayer.setInstrumentVolume(v);
            this.game.saveSettings();
        });
        this.gameSoundSlider = new VolumeSlider(0, 0, 400, 30, '効果音量', soundPlayer.gameSoundVolume, (v) => {
            soundPlayer.setGameSoundVolume(v);
            this.game.saveSettings();
        });

        // Input Method Buttons
        this.keyboardButton = new Button(0, 0, 250, 75, 'キーボード');
        this.gamepadButton = new Button(0, 0, 250, 75, 'ゲームパッド');

        // Back Button
        this.backButton = new Button(0, 0, 400, 75, 'メイン画面に戻る');

        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;
        const cx = width / 2;

        // Title and sections layout
        const titleY = 120;
        const volumeSectionStartY = height / 2 - 250; // 音量セクションの開始Y座標を調整
        const inputSectionStartY = volumeSectionStartY + 250; // 入力方法セクションの開始Y座標を調整
        const backButtonY = height - 150;

        // Volume Sliders
        const sliderWidth = 400;
        const sliderX = cx - sliderWidth / 2;
        this.bgmSlider.x = sliderX; this.bgmSlider.y = volumeSectionStartY;
        this.instrumentSlider.x = sliderX; this.instrumentSlider.y = volumeSectionStartY + 70; // 間隔を調整
        this.gameSoundSlider.x = sliderX; this.gameSoundSlider.y = volumeSectionStartY + 140; // 間隔を調整

        // Input Method Buttons
        const inputButtonGap = 30;
        this.keyboardButton.x = cx - this.keyboardButton.width - inputButtonGap / 2;
        this.keyboardButton.y = inputSectionStartY;
        this.gamepadButton.x = cx + inputButtonGap / 2;
        this.gamepadButton.y = inputSectionStartY;

        // Back Button
        this.backButton.x = cx - this.backButton.width / 2;
        this.backButton.y = backButtonY;
    }

    update() {
        const mouse = this.game.mouse;

        if (mouse.clicked) {
            if (this.bgmSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.bgmSlider;
            else if (this.instrumentSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.instrumentSlider; // 追加
            else if (this.gameSoundSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.gameSoundSlider;
        }

        if (!this.inputHandler.isMouseDown() && this.activeSlider) {
            this.activeSlider.handleMouseUp();
            this.activeSlider = null;
        }

        if (this.activeSlider) {
            this.activeSlider.handleMouseMove(mouse.x);
        }

        if (!this.activeSlider) {
            if (this.keyboardButton.update(mouse)) {
                this.game.inputMethod = 'keyboard';
                this.game.saveSettings();
            }
            if (this.gamepadButton.update(mouse)) {
                this.game.inputMethod = 'gamepad';
                this.game.saveSettings();
            }
            if (this.backButton.update(mouse)) {
                this.game.changeScene(SCENE.MAIN);
            }
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        if (this.isBackgroundLoaded) ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        else { ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, width, height); }

        // Title
        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('設定', width / 2, 120);

        // Section Titles
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('音量調整', width / 2, this.bgmSlider.y - 50);
        ctx.fillText('入力方法', width / 2, this.keyboardButton.y - 50);

        // Sliders
        this.bgmSlider.draw(ctx);
        this.instrumentSlider.draw(ctx); // 追加
        this.gameSoundSlider.draw(ctx); // seSlider を gameSoundSlider に変更

        // Highlight selected input method
        this.keyboardButton.isHighlighted = (this.game.inputMethod === 'keyboard');
        this.gamepadButton.isHighlighted = (this.game.inputMethod === 'gamepad');

        // Buttons
        this.keyboardButton.draw(ctx);
        this.gamepadButton.draw(ctx);
        this.backButton.draw(ctx);
    }

    destroy() {}
}