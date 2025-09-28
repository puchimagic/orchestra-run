import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js';
import { soundPlayer } from '../../soundPlayer.js';

export class SettingsScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler;
        this.activeSlider = null;
        this.volumeTitleY = 0;
        this.inputTitleY = 0;
        this.volumeTitleX = 0; // 左寄せタイトルの新しいプロパティ
        this.inputTitleX = 0;  // 右寄せタイトルの新しいプロパティ
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

        const mainTitleLineHeight = 60; // FONT_SIZE.LARGE の推定行の高さ
        const sectionTitleLineHeight = 40; // FONT_SIZE.MEDIUM の推定行の高さ

        const elementPadding = 60; // 要素間のパディング (スライダー、ボタン)
        const sectionPadding = 120; // 主要セクション間のパディング (音量、入力、戻るボタン) - 100から増加

        // --- 左セクション (音量) ---
        const sliderWidth = 400;
        // 左半分の中心に配置
        const leftSectionCenterX = width / 4;
        const leftSectionStartX = leftSectionCenterX - sliderWidth / 2;

        // メインタイトルの下から開始Y座標を調整 (より上から開始)
        let currentYLeft = 120 + mainTitleLineHeight + elementPadding / 2; // 開始Y座標を調整

        // 「音量調整」セクションタイトル
        this.volumeTitleY = currentYLeft;
        this.volumeTitleX = leftSectionCenterX; // タイトルは左半分の中心に
        currentYLeft += sectionTitleLineHeight + elementPadding;

        // 音量スライダー
        this.bgmSlider.x = leftSectionStartX;
        this.bgmSlider.y = currentYLeft;
        currentYLeft += this.bgmSlider.height + elementPadding;

        this.instrumentSlider.x = leftSectionStartX;
        this.instrumentSlider.y = currentYLeft;
        currentYLeft += this.instrumentSlider.height + elementPadding;

        this.gameSoundSlider.x = leftSectionStartX;
        this.gameSoundSlider.y = currentYLeft;

        // --- 右セクション (入力方法) ---
        const buttonWidth = this.keyboardButton.width; // 両方のボタンが同じ幅であると仮定
        // 右半分の中心に配置
        const rightSectionCenterX = width * 3 / 4;
        const rightSectionStartX = rightSectionCenterX - buttonWidth / 2;

        // メインタイトルの下から開始Y座標を調整 (より上から開始)
        let currentYRight = 120 + mainTitleLineHeight + elementPadding / 2; // 開始Y座標を調整

        // 「入力方法」セクションタイトル
        this.inputTitleY = currentYRight;
        this.inputTitleX = rightSectionCenterX; // タイトルは右半分の中心に
        currentYRight += sectionTitleLineHeight + elementPadding;

        // 入力方法ボタン
        // ボタンのX座標は rightSectionStartX を基準に
        this.keyboardButton.x = rightSectionStartX;
        this.keyboardButton.y = currentYRight;
        currentYRight += this.keyboardButton.height + elementPadding;

        this.gamepadButton.x = rightSectionStartX;
        this.gamepadButton.y = currentYRight;

        // --- 戻るボタン (下部中央) ---
        const maxSectionY = Math.max(currentYLeft, currentYRight);
        this.backButton.x = cx - this.backButton.width / 2;
        this.backButton.y = maxSectionY + sectionPadding; // sectionPadding を増加
    }

    update() {
        const mouse = this.game.mouse;

        if (mouse.clicked) {
            if (this.bgmSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.bgmSlider;
            else if (this.instrumentSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.instrumentSlider;
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

        // メインタイトル (中央揃え)
        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('設定', width / 2, 120);

        // --- 左セクション (音量) ---
        // セクションタイトル (左半分の中心に)
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center'; // 中央揃えに変更
        ctx.fillText('音量調整', this.volumeTitleX, this.volumeTitleY);

        // スライダー (x, y で既に配置済み)
        this.bgmSlider.draw(ctx);
        this.instrumentSlider.draw(ctx);
        this.gameSoundSlider.draw(ctx);

        // --- 右セクション (入力方法) ---
        // セクションタイトル (右半分の中心に)
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center'; // 中央揃えに変更
        ctx.fillText('入力方法', this.inputTitleX, this.inputTitleY);

        // 選択された入力方法をハイライト (このロジックはそのまま)
        this.keyboardButton.isHighlighted = (this.game.inputMethod === 'keyboard');
        this.gamepadButton.isHighlighted = (this.game.inputMethod === 'gamepad');

        // ボタン (x, y で既に配置済み)
        this.keyboardButton.draw(ctx);
        this.gamepadButton.draw(ctx);

        // --- 戻るボタン (中央揃え) ---
        this.backButton.draw(ctx);
    }

    destroy() {}}
