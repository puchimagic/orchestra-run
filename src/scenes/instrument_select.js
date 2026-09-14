import { SCENE, FONT_SIZE, KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_ORDER } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground, createCenteredText } from '../ui/scene_utils.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = INSTRUMENT_ORDER[0];
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.INSTRUMENT_SELECT];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        createCenteredText(sceneEl, '楽器をえらんでね', { top: 70, fontSize: FONT_SIZE.MEDIUM });

        const btnWidth = 500;
        const btnHeight = 100;
        const cx = this.game.baseWidth / 2;
        const cy = this.game.baseHeight / 2;
        const row_margin = 30;
        const col_gap = 60;
        const infoTextWidth = 250;

        const instrumentBlockWidth = (btnWidth + infoTextWidth) * 2 + col_gap;
        const instrumentBlockStartX = cx - instrumentBlockWidth / 2;
        const col1_x = instrumentBlockStartX;
        const col2_x = instrumentBlockStartX + btnWidth + infoTextWidth + col_gap;

        const y1 = cy - btnHeight - row_margin - 100;
        const y2 = cy - 10;
        const y3 = cy + btnHeight + row_margin + 80;

        this.instrumentButtons = {};
        INSTRUMENT_ORDER.forEach((name, i) => {
            const x = i < 3 ? col1_x : col2_x;
            const y = [y1, y2, y3][i < 3 ? i : i - 3];
            const button = new Button(x, y, btnWidth, btnHeight, name, {
                clickSoundKey: `${name}_track01`,
                clickSoundType: 'instrumentSound',
            });
            button.onClick = () => this.selectInstrument(name);
            button.mount(sceneEl);
            this.instrumentButtons[name] = button;

            const config = KEYBOARD_INSTRUMENT_CONFIG[name];
            let infoText = `キー: ${config.keys.length}種`;
            if (config.maxSimultaneousKeys > 1) infoText += ` / 最大${config.maxSimultaneousKeys}音同時`;

            const infoEl = document.createElement('div');
            infoEl.textContent = infoText;
            infoEl.style.position = 'absolute';
            infoEl.style.left = `${x + btnWidth + 20}px`;
            infoEl.style.top = `${y}px`;
            infoEl.style.height = `${btnHeight}px`;
            infoEl.style.display = 'flex';
            infoEl.style.alignItems = 'center';
            infoEl.style.fontSize = '40px';
            infoEl.style.color = '#555';
            sceneEl.appendChild(infoEl);
        });

        const bottomButtonY = y3 + btnHeight + 50;
        const buttonGroupWidth = btnWidth * 2 + col_gap;
        const buttonGroupStartX = cx - buttonGroupWidth / 2;

        this.backButton = new Button(buttonGroupStartX, bottomButtonY, btnWidth, btnHeight, '戻る');
        this.startButton = new Button(buttonGroupStartX + btnWidth + col_gap, bottomButtonY, btnWidth, btnHeight, 'スタート');
        this.startButton.onClick = () => {
            this.game.selectedInstrument = this.selectedInstrument;
            this.game.changeScene(SCENE.GAME);
        };
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);
        this.startButton.mount(sceneEl);
        this.backButton.mount(sceneEl);

        this.updateSelectionHighlight();
    }

    selectInstrument(name) {
        this.selectedInstrument = name;
        this.updateSelectionHighlight();
    }

    updateSelectionHighlight() {
        for (const name of INSTRUMENT_ORDER) {
            this.instrumentButtons[name].setSelected(this.selectedInstrument === name);
        }
    }

    destroy() {
        this.game.sceneElements[SCENE.INSTRUMENT_SELECT].innerHTML = '';
    }
}
