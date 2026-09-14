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

        createCenteredText(sceneEl, '設定', { top: 70, fontSize: FONT_SIZE.MEDIUM });

        // --- 左セクション (音量) ---
        const leftColumnCenterX = columnWidth / 2;
        const sliderWidth = 500;
        const leftSectionStartX = leftColumnCenterX - sliderWidth / 2;

        let currentYLeft = 200 + mainTitleLineHeight + elementPadding / 2;
        createCenteredText(sceneEl, '音量調整', { top: currentYLeft, fontSize: FONT_SIZE.MEDIUM, width: 500, centerX: leftColumnCenterX });
        currentYLeft += sectionTitleLineHeight + elementPadding + sliderTextSpacing;

        this.bgmSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, 'BGM音量', soundPlayer.bgmVolume, (v) => {
            soundPlayer.setBgmVolume(v);
        });
        currentYLeft += 40 + elementPadding;

        this.instrumentSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, '楽器音量', soundPlayer.instrumentVolume, (v) => {
            soundPlayer.setInstrumentVolume(v);
            soundPlayer.playSound('ギター_track01');
        });
        currentYLeft += 40 + elementPadding;

        this.gameSoundSlider = new VolumeSlider(leftSectionStartX, currentYLeft, sliderWidth, '効果音量', soundPlayer.gameSoundVolume, (v) => {
            soundPlayer.setGameSoundVolume(v);
            soundPlayer.playGameSound('jump');
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
        currentYCenter += sectionTitleLineHeight + elementPadding + sliderTextSpacing;

        this.keyboardButton = new Button(centerSectionStartX, currentYCenter, buttonWidth, buttonHeight, 'キーボード');
        currentYCenter += buttonHeight + elementPadding;
        this.gamepadButton = new Button(centerSectionStartX, currentYCenter, buttonWidth, buttonHeight, 'ゲームパッド');

        this.keyboardButton.onClick = () => {
            this.game.inputMethod = 'keyboard';
            this.updateInputMethodHighlight();
        };
        this.gamepadButton.onClick = () => {
            this.game.inputMethod = 'gamepad';
            this.updateInputMethodHighlight();
        };
        this.keyboardButton.mount(sceneEl);
        this.gamepadButton.mount(sceneEl);
        this.updateInputMethodHighlight();

        // --- 右セクション (ユーザー名入力欄) ---
        const rightColumnCenterX = columnWidth * 2.5;
        const usernameInputWidth = 450;
        const usernameInputHeight = 76;
        const rightSectionStartX = rightColumnCenterX - usernameInputWidth / 2;

        let currentYRight = 200 + mainTitleLineHeight + elementPadding / 2;
        createCenteredText(sceneEl, 'ユーザー名', { top: currentYRight, fontSize: FONT_SIZE.MEDIUM, width: 500, centerX: rightColumnCenterX });
        currentYRight += sectionTitleLineHeight + elementPadding + sliderTextSpacing;

        this.usernameInput = document.createElement('input');
        this.usernameInput.type = 'text';
        this.usernameInput.maxLength = 7;
        this.usernameInput.className = 'text-input';
        this.usernameInput.style.left = `${rightSectionStartX}px`;
        this.usernameInput.style.top = `${currentYRight}px`;
        this.usernameInput.style.width = `${usernameInputWidth}px`;
        this.usernameInput.style.height = `${usernameInputHeight}px`;
        this.usernameInput.value = (this.game.username || '').slice(0, 7);
        this.usernameInput.addEventListener('input', this.handleUsernameInput);
        this.usernameInput.addEventListener('blur', this.handleUsernameBlur);
        sceneEl.appendChild(this.usernameInput);

        this.usernameNoteEl = document.createElement('div');
        this.usernameNoteEl.textContent = '※ユーザー名は7文字まで';
        this.usernameNoteEl.style.position = 'absolute';
        this.usernameNoteEl.style.left = `${rightSectionStartX}px`;
        this.usernameNoteEl.style.top = `${currentYRight + usernameInputHeight + 16}px`;
        this.usernameNoteEl.style.width = `${usernameInputWidth}px`;
        this.usernameNoteEl.style.textAlign = 'center';
        this.usernameNoteEl.style.fontSize = '26px';
        this.usernameNoteEl.style.color = 'var(--color-ink-soft)';
        sceneEl.appendChild(this.usernameNoteEl);

        // --- 戻るボタン・保存ボタン ---
        const backButtonWidth = 450;
        const backButtonHeight = 100;
        const bottomButtonGap = 60;
        const bottomButtonGroupWidth = backButtonWidth * 2 + bottomButtonGap;
        const bottomButtonY = height - backButtonHeight - 60;
        const backButtonX = width / 2 - bottomButtonGroupWidth / 2;
        const saveButtonX = backButtonX + backButtonWidth + bottomButtonGap;

        this.backButton = new Button(backButtonX, bottomButtonY, backButtonWidth, backButtonHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);
        this.backButton.mount(sceneEl);

        this.saveButton = new Button(saveButtonX, bottomButtonY, backButtonWidth, backButtonHeight, '保存');
        this.saveButton.onClick = () => this.handleSave();
        this.saveButton.mount(sceneEl);

        this.saveNoteEl = document.createElement('div');
        this.saveNoteEl.style.position = 'absolute';
        this.saveNoteEl.style.left = `${backButtonX}px`;
        this.saveNoteEl.style.top = `${bottomButtonY - 50}px`;
        this.saveNoteEl.style.width = `${bottomButtonGroupWidth}px`;
        this.saveNoteEl.style.textAlign = 'center';
        this.saveNoteEl.style.fontSize = '28px';
        this.saveNoteEl.style.color = 'var(--color-sky-deep)';
        this.saveNoteEl.style.opacity = '0';
        this.saveNoteEl.style.transition = 'opacity 0.2s ease';
        this.saveNoteEl.textContent = '保存しました';
        sceneEl.appendChild(this.saveNoteEl);
    }

    handleSave() {
        this.game.saveSettings();
        if (this.saveNoteTimeout) clearTimeout(this.saveNoteTimeout);
        this.saveNoteEl.style.opacity = '1';
        this.saveNoteTimeout = setTimeout(() => {
            this.saveNoteEl.style.opacity = '0';
        }, 1200);
    }

    updateInputMethodHighlight() {
        this.keyboardButton.setSelected(this.game.inputMethod === 'keyboard');
        this.gamepadButton.setSelected(this.game.inputMethod === 'gamepad');
    }

    handleUsernameInput() {
        // maxLength属性はIME変換確定時の一括挿入では効かないことがあるため、ここでも切り詰める
        if (this.usernameInput.value.length > 7) {
            this.usernameInput.value = this.usernameInput.value.slice(0, 7);
        }
        this.game.username = this.usernameInput.value;
    }

    handleUsernameBlur() {
        if (this.usernameInput.value.trim() === '') {
            this.usernameInput.value = 'guest';
            this.game.username = 'guest';
        }
    }

    destroy() {
        if (this.saveNoteTimeout) clearTimeout(this.saveNoteTimeout);
        this.usernameInput.removeEventListener('input', this.handleUsernameInput);
        this.usernameInput.removeEventListener('blur', this.handleUsernameBlur);
        this.game.sceneElements[SCENE.SETTINGS].innerHTML = '';
    }
}
