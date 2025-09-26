import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js'; // ★追加
import { soundPlayer } from '../../soundPlayer.js';

export class VolumeSettingsScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler;

        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png'; // メイン画面と同じ背景
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/title_rank_select.png');
        };

        // ボタンのサイズをメイン画面に合わせる
        const btnWidth = 400;
        const btnHeight = 75;
        this.backButton = new Button(
            this.game.canvas.width / 2 - btnWidth / 2,
            this.game.canvas.height - 100, // 仮のY座標、onResizeで調整
            btnWidth,
            btnHeight,
            'メイン画面に戻る'
        );

        // VolumeSliderのインスタンスを作成
        const sliderWidth = 300;
        const sliderHeight = 30;
        const sliderX = this.game.canvas.width / 2 - sliderWidth / 2;
        let sliderYOffset = this.game.canvas.height / 2 - 150;

        this.bgmSlider = new VolumeSlider(
            sliderX, sliderYOffset, sliderWidth, sliderHeight,
            'BGM音量', soundPlayer.bgmVolume, (value) => soundPlayer.setBgmVolume(value)
        );
        sliderYOffset += 100;

        this.instrumentSlider = new VolumeSlider(
            sliderX, sliderYOffset, sliderWidth, sliderHeight,
            '楽器音量', soundPlayer.instrumentVolume, (value) => soundPlayer.setInstrumentVolume(value)
        );
        sliderYOffset += 100;

        this.gameSoundSlider = new VolumeSlider(
            sliderX, sliderYOffset, sliderWidth, sliderHeight,
            '効果音量', soundPlayer.gameSoundVolume, (value) => soundPlayer.setGameSoundVolume(value)
        );

        this.activeSlider = null; // 現在ドラッグ中のスライダー
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    init() {
        this.onResize();
        // マウスイベントリスナーをCanvasに追加
        this.game.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.game.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.game.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.game.canvas.addEventListener('mouseleave', this.handleMouseUp); // Canvas外に出た場合もmouseup扱い
    }

    onResize() {
        // ボタンの位置を再調整
        const btnWidth = 400;
        const btnHeight = 75;
        this.backButton.x = this.game.canvas.width / 2 - btnWidth / 2;
        this.backButton.y = this.game.canvas.height / 2 + 150; 

        // スライダーの位置を再調整
        const sliderWidth = 300;
        const sliderX = this.game.canvas.width / 2 - sliderWidth / 2;
        let sliderYOffset = this.game.canvas.height / 2 - 150;

        this.bgmSlider.x = sliderX;
        this.bgmSlider.y = sliderYOffset;
        sliderYOffset += 100;

        this.instrumentSlider.x = sliderX;
        this.instrumentSlider.y = sliderYOffset;
        sliderYOffset += 100;

        this.gameSoundSlider.x = sliderX;
        this.gameSoundSlider.y = sliderYOffset;
    }

    handleMouseDown(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.bgmSlider.handleMouseDown(mouseX, mouseY)) {
            this.activeSlider = this.bgmSlider;
        } else if (this.instrumentSlider.handleMouseDown(mouseX, mouseY)) {
            this.activeSlider = this.instrumentSlider;
        } else if (this.gameSoundSlider.handleMouseDown(mouseX, mouseY)) {
            this.activeSlider = this.gameSoundSlider;
        }
    }

    handleMouseMove(e) {
        if (this.activeSlider) {
            const rect = this.game.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.activeSlider.handleMouseMove(mouseX);
        }
    }

    handleMouseUp() {
        if (this.activeSlider) {
            this.activeSlider.handleMouseUp();
            this.activeSlider = null;
        }
    }

    update() {
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        }
        else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('音量設定', width / 2, 120);

        this.bgmSlider.draw(ctx);
        this.instrumentSlider.draw(ctx);
        this.gameSoundSlider.draw(ctx);

        this.backButton.draw(ctx);
    }

    // シーンが非アクティブになる際にイベントリスナーとスライダーを削除
    destroy() {
        this.game.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.game.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.game.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.game.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    }
}
