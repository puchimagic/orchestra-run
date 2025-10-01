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
        this.usernameTitleY = 0;
        this.volumeTitleX = 0;
        this.inputTitleX = 0;
        this.usernameTitleX = 0;

        // ユーザー名関連
        this.username = 'Guest';
        this.isEditingUsername = false;
        this.inputRect = { x: 0, y: 0, width: 0, height: 0 };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => { this.isBackgroundLoaded = true; };

        // gameオブジェクトから現在のユーザー名を取得して初期化
        this.username = this.game.username;

        // 音量スライダー (3種類に修正)
        this.bgmSlider = new VolumeSlider(0, 0, 500, 40, 'BGM音量', soundPlayer.bgmVolume, (v) => { // サイズ変更
            soundPlayer.setBgmVolume(v);
            this.game.saveSettings();
        });
        this.instrumentSlider = new VolumeSlider(0, 0, 500, 40, '楽器音量', soundPlayer.instrumentVolume, (v) => { // サイズ変更
            soundPlayer.setInstrumentVolume(v);
            soundPlayer.playSound('ギター_track01'); // プレビュー音を再生
            this.game.saveSettings();
        });
        this.gameSoundSlider = new VolumeSlider(0, 0, 500, 40, '効果音量', soundPlayer.gameSoundVolume, (v) => { // サイズ変更
            soundPlayer.setGameSoundVolume(v);
            soundPlayer.playGameSound('jump'); // プレビュー音を再生
            this.game.saveSettings();
        });

        // 入力方法ボタン
        this.keyboardButton = new Button(0, 0, 450, 100, 'キーボード'); // サイズ変更
        this.gamepadButton = new Button(0, 0, 450, 100, 'ゲームパッド'); // サイズ変更

        // 戻るボタン
        this.backButton = new Button(0, 0, 500, 100, '戻る'); // サイズ変更とテキスト変更

        // キーボードイベントリスナー
        document.addEventListener('keydown', this.handleKeyDown);

        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;
        const columnWidth = width / 3; // 3カラムの幅
        const elementPadding = 70;
        const sectionPadding = 140;
        const mainTitleLineHeight = 60;
        const sectionTitleLineHeight = 40;

        // --- 左セクション (音量) ---
        const leftColumnCenterX = columnWidth / 2;
        const sliderWidth = 500;
        const leftSectionStartX = leftColumnCenterX - sliderWidth / 2;

        let currentYLeft = 200 + mainTitleLineHeight + elementPadding / 2;
        this.volumeTitleY = currentYLeft;
        this.volumeTitleX = leftColumnCenterX;
        currentYLeft += sectionTitleLineHeight + elementPadding;

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
        const usernameInputHeight = 50;
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

        // --- 戻るボタン (下部中央) ---
        const backButtonWidth = 500;
        const backButtonHeight = 100;
        const maxSectionY = Math.max(
            currentYLeft + this.gameSoundSlider.height,
            currentYCenter + this.gamepadButton.height,
            currentYRight + usernameInputHeight // ユーザー名入力欄の高さも考慮
        );
        this.backButton.x = width / 2 - backButtonWidth / 2;
        this.backButton.y = maxSectionY + sectionPadding;
        this.backButton.width = backButtonWidth;
        this.backButton.height = backButtonHeight;
    }

    update() {
        const mouse = this.game.mouse;

        if (mouse.clicked) {
            if (this.bgmSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.bgmSlider;
            else if (this.instrumentSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.instrumentSlider;
            else if (this.gameSoundSlider.handleMouseDown(mouse.x, mouse.y)) this.activeSlider = this.gameSoundSlider;
            // ユーザー名入力欄のクリック判定
            else if (mouse.x >= this.inputRect.x && mouse.x <= this.inputRect.x + this.inputRect.width &&
                     mouse.y >= this.inputRect.y && mouse.y <= this.inputRect.y + this.inputRect.height) {
                this.isEditingUsername = true;
            } else {
                // スライダーでも入力欄でもない場所がクリックされたら、入力モードを解除
                this.isEditingUsername = false;
            }
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
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillText('ユーザー名', this.usernameTitleX, this.usernameTitleY);

        // ユーザー名入力ボックス
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.inputRect.x, this.inputRect.y, this.inputRect.width, this.inputRect.height);

        ctx.fillStyle = 'black';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        let displayText = this.username;
        if (this.isEditingUsername && Math.floor(Date.now() / 500) % 2 === 0) {
            displayText += '|'; // カーソル
        }
        ctx.fillText(displayText, this.inputRect.x + 10, this.inputRect.y + this.inputRect.height / 2);

        // --- 戻るボタン (中央揃え) ---
        this.backButton.draw(ctx);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (!this.isEditingUsername) return;

        let changed = false; // 変更があったかどうかのフラグ

        if (e.key === 'Backspace') {
            if (this.username.length > 0) {
                this.username = this.username.slice(0, -1);
                changed = true;
            }
        } else if (e.key.length === 1 && e.key.match(/^[a-zA-Z0-9_]$/)) { // 英数字とアンダースコアのみ許可
            if (this.username.length < 15) { // 最大文字数制限
                this.username += e.key;
                changed = true;
            }
        } else if (e.key === 'Enter') {
            // Enterキーでの登録処理は不要になるため、入力モードを解除するのみ
            this.isEditingUsername = false;
        }

        if (changed) {
            // gameオブジェクトのユーザー名を更新し、保存
            this.game.username = this.username;
            this.game.saveSettings();
        }
    }
}
