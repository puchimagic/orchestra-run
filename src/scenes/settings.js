import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js';
import { soundPlayer } from '../soundPlayer.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class SettingsScene {
    constructor(game) {
        this.game = game;
        this.activeSlider = null;
        this.volumeTitleY = 0;
        this.inputTitleY = 0;
        this.usernameTitleY = 0;
        this.volumeTitleX = 0;
        this.inputTitleX = 0;
        this.usernameTitleX = 0;

        // ユーザー名関連（実際の入力欄はDOMのinputに任せ、IME変換等をブラウザに委譲する）
        this.inputRect = { x: 0, y: 0, width: 0, height: 0 };
        this.usernameInput = document.getElementById('usernameInput');
        this.handleUsernameInput = this.handleUsernameInput.bind(this);
        this.handleUsernameBlur = this.handleUsernameBlur.bind(this);
    }

    init() {
        this.backgroundImage = loadImage('assets/img/bg_title.png');

        // gameオブジェクトから現在のユーザー名を取得して初期化
        this.usernameInput.value = this.game.username;
        this.usernameInput.style.display = 'block';
        this.usernameInput.addEventListener('input', this.handleUsernameInput);
        this.usernameInput.addEventListener('blur', this.handleUsernameBlur);

        // 音量スライダー (3種類に修正)
        this.bgmSlider = new VolumeSlider(0, 0, 500, 40, 'BGM音量', soundPlayer.bgmVolume, (v) => {
            soundPlayer.setBgmVolume(v);
            this.game.saveSettings();
        });
        this.instrumentSlider = new VolumeSlider(0, 0, 500, 40, '楽器音量', soundPlayer.instrumentVolume, (v) => {
            soundPlayer.setInstrumentVolume(v);
            soundPlayer.playSound('ギター_track01'); // プレビュー音を再生
            this.game.saveSettings();
        });
        this.gameSoundSlider = new VolumeSlider(0, 0, 500, 40, '効果音量', soundPlayer.gameSoundVolume, (v) => {
            soundPlayer.setGameSoundVolume(v);
            soundPlayer.playGameSound('jump'); // プレビュー音を再生
            this.game.saveSettings();
        });

        // 入力方法ボタン
        this.keyboardButton = new Button(0, 0, 450, 100, 'キーボード');
        this.gamepadButton = new Button(0, 0, 450, 100, 'ゲームパッド');

        // 戻るボタン
        this.backButton = new Button(0, 0, 500, 100, '戻る');

        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;
        const columnWidth = width / 3; // 3カラムの幅
        const elementPadding = 90; // 70から90に増加
        const sectionPadding = 180; // 140から180に増加
        const mainTitleLineHeight = 60;
        const sectionTitleLineHeight = 40;
        const sliderTextSpacing = 40; // 30から40に増加

        // --- 左セクション (音量) ---
        const leftColumnCenterX = columnWidth / 2;
        const sliderWidth = 500;
        const leftSectionStartX = leftColumnCenterX - sliderWidth / 2;

        let currentYLeft = 200 + mainTitleLineHeight + elementPadding / 2;
        this.volumeTitleY = currentYLeft;
        this.volumeTitleX = leftColumnCenterX;
        currentYLeft += sectionTitleLineHeight + elementPadding + sliderTextSpacing;

        this.bgmSlider.x = leftSectionStartX;
        this.bgmSlider.y = currentYLeft;
        this.bgmSlider.width = sliderWidth;
        this.bgmSlider.height = 40;
        currentYLeft += this.bgmSlider.height + elementPadding;

        this.instrumentSlider.x = leftSectionStartX;
        this.instrumentSlider.y = currentYLeft;
        this.instrumentSlider.width = sliderWidth;
        this.instrumentSlider.height = 40;
        currentYLeft += this.instrumentSlider.height + elementPadding;

        this.gameSoundSlider.x = leftSectionStartX;
        this.gameSoundSlider.y = currentYLeft;
        this.gameSoundSlider.width = sliderWidth;
        this.gameSoundSlider.height = 40;

        // --- 中央セクション (入力方法) ---
        const centerColumnCenterX = columnWidth * 1.5;
        const buttonWidth = 450;
        const buttonHeight = 100;
        const centerSectionStartX = centerColumnCenterX - buttonWidth / 2;

        let currentYCenter = 200 + mainTitleLineHeight + elementPadding / 2;
        this.inputTitleY = currentYCenter;
        this.inputTitleX = centerColumnCenterX;
        currentYCenter += sectionTitleLineHeight + elementPadding;

        this.keyboardButton.x = centerSectionStartX;
        this.keyboardButton.y = currentYCenter;
        this.keyboardButton.width = buttonWidth;
        this.keyboardButton.height = buttonHeight;
        currentYCenter += this.keyboardButton.height + elementPadding;

        this.gamepadButton.x = centerSectionStartX;
        this.gamepadButton.y = currentYCenter;
        this.gamepadButton.width = buttonWidth;
        this.gamepadButton.height = buttonHeight;

        // --- 右セクション (ユーザー名入力欄) ---
        const rightColumnCenterX = columnWidth * 2.5;
        const usernameInputWidth = 450;
        const usernameInputHeight = 60; // 50から60に増加
        const rightSectionStartX = rightColumnCenterX - usernameInputWidth / 2;

        let currentYRight = 200 + mainTitleLineHeight + elementPadding / 2;
        this.usernameTitleY = currentYRight;
        this.usernameTitleX = rightColumnCenterX;
        currentYRight += sectionTitleLineHeight + elementPadding;

        // ユーザー名入力欄の矩形を更新
        this.inputRect = {
            x: rightSectionStartX,
            y: currentYRight,
            width: usernameInputWidth,
            height: usernameInputHeight
        };
        this.updateUsernameInputPosition();

        // --- 戻るボタン (下部中央) ---
        const backButtonWidth = 400;
        const backButtonHeight = 100;
        this.backButton.width = backButtonWidth;
        this.backButton.height = backButtonHeight;
        this.backButton.x = width / 2 - this.backButton.width / 2;
        this.backButton.y = height - this.backButton.height - 60;
    }

    // ユーザー名inputをCanvas上のinputRectの位置・サイズに追従させる
    updateUsernameInputPosition() {
        const screenRect = this.game.getScreenRect(
            this.inputRect.x, this.inputRect.y, this.inputRect.width, this.inputRect.height
        );
        const input = this.usernameInput;
        input.style.left = `${screenRect.left}px`;
        input.style.top = `${screenRect.top}px`;
        input.style.width = `${screenRect.width}px`;
        input.style.height = `${screenRect.height}px`;
        input.style.fontSize = `${FONT_SIZE.MEDIUM * this.game.scale}px`;
    }

    handleUsernameInput() {
        // 文字種の制限はブラウザのinput要素（IME変換含む）に委ね、ここでは保存のみ行う
        this.game.username = this.usernameInput.value;
        this.game.saveSettings();
    }

    handleUsernameBlur() {
        if (this.usernameInput.value.trim() === '') {
            this.usernameInput.value = 'guest';
            this.game.username = 'guest';
            this.game.saveSettings();
        }
    }

    update() {
        const mouse = this.game.mouse;
        this.updateUsernameInputPosition();

        if (mouse.clicked) {
            if (this.bgmSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.bgmSlider;
            else if (this.instrumentSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.instrumentSlider;
            else if (this.gameSoundSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.gameSoundSlider;
        }

        if (!mouse.isDown && this.activeSlider) {
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

        drawBackground(ctx, this.backgroundImage, width, height);

        // メインタイトル (中央揃え)
        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('設定', width / 2, 120);

        // --- 左セクション (音量) ---
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('音量調整', this.volumeTitleX, this.volumeTitleY);
        this.bgmSlider.draw(ctx);
        this.instrumentSlider.draw(ctx);
        this.gameSoundSlider.draw(ctx);

        // --- 中央セクション (入力方法) ---
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('入力方法', this.inputTitleX, this.inputTitleY);
        this.keyboardButton.isHighlighted = (this.game.inputMethod === 'keyboard');
        this.gamepadButton.isHighlighted = (this.game.inputMethod === 'gamepad');
        this.keyboardButton.draw(ctx);
        this.gamepadButton.draw(ctx);

        // --- 右セクション (ユーザー名入力欄) ---
        // 実際の入力ボックスはDOMのinput要素（updateUsernameInputPositionで追従）が描画するため、
        // ここではCanvas上に枠だけ描いて位置の目印にする
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('ユーザー名', this.usernameTitleX, this.usernameTitleY);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.inputRect.x, this.inputRect.y, this.inputRect.width, this.inputRect.height);

        // --- 戻るボタン (中央揃え) ---
        this.backButton.draw(ctx);
    }

    destroy() {
        this.usernameInput.removeEventListener('input', this.handleUsernameInput);
        this.usernameInput.removeEventListener('blur', this.handleUsernameBlur);
        this.usernameInput.blur();
        this.usernameInput.style.display = 'none';
    }
}