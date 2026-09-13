import { SCENE, FONT_SIZE } from '../config.js';
import { Button } from '../ui/button.js';
import { VolumeSlider } from '../ui/volume_slider.js';
import { soundPlayer } from '../soundPlayer.js';
import { setSceneBackground, createCenteredText } from '../ui/scene_utils.js';

export class SettingsScene {
    constructor(game) {
        this.game = game;
        this.handleUsernameInput = this.handleUsernameInput.bind(this);
        this.handleUsernameBlur = this.handleUsernameBlur.bind(this);
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.SETTINGS];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        const width = this.game.baseWidth;
        const height = this.game.baseHeight;
        const columnWidth = width / 3;
        const elementPadding = 90;
        const mainTitleLineHeight = 60;
        const sectionTitleLineHeight = 40;
        const sliderTextSpacing = 40;

        createCenteredText(sceneEl, '設定', { top: 70, fontSize: FONT_SIZE.LARGE });

        // --- 左セクション (音量) ---
        const leftColumnCenterX = columnWidth / 2;
        const sliderWidth = 500;
        const leftSectionStartX = leftColumnCenterX - sliderWidth / 2;

        let currentYLeft = 200 + mainTitleLineHeight + elementPadding / 2;
        createCenteredText(sceneEl, '音量調整', { top: currentYLeft, fontSize: FONT_SIZE.MEDIUM, width: 500, centerX: leftColumnCenterX });
        currentYLeft += sectionTitleLineHeight + elementPadding + sliderTextSpacing;

        this.bgmSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, 'BGM音量', soundPlayer.bgmVolume, (v) => {
            soundPlayer.setBgmVolume(v);
            this.game.saveSettings();
        });
        currentYLeft += 40 + elementPadding;

        this.instrumentSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, '楽器音量', soundPlayer.instrumentVolume, (v) => {
            soundPlayer.setInstrumentVolume(v);
            soundPlayer.playSound('ギター_track01');
            this.game.saveSettings();
        });
        currentYLeft += 40 + elementPadding;

        this.gameSoundSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, '効果音量', soundPlayer.gameSoundVolume, (v) => {
            soundPlayer.setGameSoundVolume(v);
            soundPlayer.playGameSound('jump');
            this.game.saveSettings();
        });

        this.bgmSlider.mount(sceneEl);
        this.instrumentSlider.mount(sceneEl);
        this.gameSoundSlider.mount(sceneEl);

        // --- 中央セクション (入力方法) ---
        const centerColumnCenterX = columnWidth * 1.5;
        const buttonWidth = 450;
        const buttonHeight = 100;
        const centerSectionStartX = centerColumnCenterX - buttonWidth / 2;

        let currentYCenter = 200 + mainTitleLineHeight + elementPadding / 2;
        createCenteredText(sceneEl, '入力方法', { top: currentYCenter, fontSize: FONT_SIZE.MEDIUM, width: 500, centerX: centerColumnCenterX });
        currentYCenter += sectionTitleLineHeight + elementPadding;

        this.keyboardButton = new Button(centerSectionStartX, currentYCenter, buttonWidth, buttonHeight, 'キーボード');
        currentYCenter += buttonHeight + elementPadding;
        this.gamepadButton = new Button(centerSectionStartX, currentYCenter, buttonWidth, buttonHeight, 'ゲームパッド');

        this.keyboardButton.onClick = () => {
            this.game.inputMethod = 'keyboard';
            this.game.saveSettings();
            this.updateInputMethodHighlight();
        };
        this.gamepadButton.onClick = () => {
            this.game.inputMethod = 'gamepad';
            this.game.saveSettings();
            this.updateInputMethodHighlight();
        };
        this.keyboardButton.mount(sceneEl);
        this.gamepadButton.mount(sceneEl);
        this.updateInputMethodHighlight();

        // --- 右セクション (ユーザー名入力欄) ---
        const rightColumnCenterX = columnWidth * 2.5;
        const usernameInputWidth = 450;
        const usernameInputHeight = 60;
        const rightSectionStartX = rightColumnCenterX - usernameInputWidth / 2;

        let currentYRight = 200 + mainTitleLineHeight + elementPadding / 2;
        createCenteredText(sceneEl, 'ユーザー名', { top: currentYRight, fontSize: FONT_SIZE.MEDIUM, width: 500, centerX: rightColumnCenterX });
        currentYRight += sectionTitleLineHeight + elementPadding;

        this.usernameInput = document.createElement('input');
        this.usernameInput.type = 'text';
        this.usernameInput.className = 'text-input';
        this.usernameInput.style.left = `${rightSectionStartX}px`;
        this.usernameInput.style.top = `${currentYRight}px`;
        this.usernameInput.style.width = `${usernameInputWidth}px`;
        this.usernameInput.style.height = `${usernameInputHeight}px`;
        this.usernameInput.value = this.game.username;
        this.usernameInput.addEventListener('input', this.handleUsernameInput);
        this.usernameInput.addEventListener('blur', this.handleUsernameBlur);
        sceneEl.appendChild(this.usernameInput);

        // --- 戻るボタン ---
        const backButtonWidth = 400;
        const backButtonHeight = 100;
        this.backButton = new Button(
            width / 2 - backButtonWidth / 2,
            height - backButtonHeight - 60,
            backButtonWidth,
            backButtonHeight,
            '戻る'
        );
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);
        this.backButton.mount(sceneEl);
    }

    updateInputMethodHighlight() {
        this.keyboardButton.setSelected(this.game.inputMethod === 'keyboard');
        this.gamepadButton.setSelected(this.game.inputMethod === 'gamepad');
    }

    handleUsernameInput() {
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

    destroy() {
        this.usernameInput.removeEventListener('input', this.handleUsernameInput);
        this.usernameInput.removeEventListener('blur', this.handleUsernameBlur);
        this.game.sceneElements[SCENE.SETTINGS].innerHTML = '';
    }
}
