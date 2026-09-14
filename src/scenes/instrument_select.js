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

        const btnWidth = 560;
        const btnHeight = 130;
        const cx = this.game.baseWidth / 2;
        const row_margin = 20;
        const col_gap = 60;
        const infoTextWidth = 280;

        const instrumentBlockWidth = (btnWidth + infoTextWidth) * 2 + col_gap;
        const instrumentBlockStartX = cx - instrumentBlockWidth / 2;
        const col1_x = instrumentBlockStartX;
        const col2_x = instrumentBlockStartX + btnWidth + infoTextWidth + col_gap;

        // 見出し下端〜戻るボタン上端の範囲の縦中央に、楽器ボタン3行分のブロックを配置する
        const areaTop = 150;
        const areaBottom = this.game.baseHeight - 100 - 60;
        const rowsBlockHeight = btnHeight * 3 + row_margin * 2;
        const blockStartY = areaTop + (areaBottom - areaTop - rowsBlockHeight) / 2;

        const y1 = blockStartY;
        const y2 = blockStartY + btnHeight + row_margin;
        const y3 = blockStartY + (btnHeight + row_margin) * 2;

        this.instrumentButtons = {};
        INSTRUMENT_ORDER.forEach((name, i) => {
            const x = i < 3 ? col1_x : col2_x;
            const y = [y1, y2, y3][i < 3 ? i : i - 3];
            const button = new Button(x, y, btnWidth, btnHeight, name, {
                clickSoundKey: `${name}_track01`,
                clickSoundType: 'instrumentSound',
            });
            button.el.style.fontSize = '50px';
            button.onClick = () => this.selectInstrument(name);
            button.mount(sceneEl);
            this.instrumentButtons[name] = button;

            const config = KEYBOARD_INSTRUMENT_CONFIG[name];
            const infoLines = [`キー: ${config.keys.length}種`];
            if (config.maxSimultaneousKeys > 1) infoLines.push(`最大${config.maxSimultaneousKeys}音同時`);

            const infoEl = document.createElement('div');
            infoEl.style.position = 'absolute';
            infoEl.style.left = `${x + btnWidth + 20}px`;
            infoEl.style.top = `${y}px`;
            infoEl.style.height = `${btnHeight}px`;
            infoEl.style.display = 'flex';
            infoEl.style.flexDirection = 'column';
            infoEl.style.justifyContent = 'center';
            infoEl.style.fontSize = '40px';
            infoEl.style.lineHeight = '1.3';
            infoEl.style.color = '#555';
            infoLines.forEach(line => {
                const lineEl = document.createElement('div');
                lineEl.textContent = line;
                infoEl.appendChild(lineEl);
            });
            sceneEl.appendChild(infoEl);
        });

        const bottomBtnWidth = 450;
        const bottomBtnHeight = 100;
        // 他の画面（あそびかた・設定・ランキング）の「戻る」ボタンとサイズ・縦位置を揃える
        const bottomButtonY = this.game.baseHeight - bottomBtnHeight - 60;
        const buttonGroupWidth = bottomBtnWidth * 2 + col_gap;
        const buttonGroupStartX = cx - buttonGroupWidth / 2;

        this.backButton = new Button(buttonGroupStartX, bottomButtonY, bottomBtnWidth, bottomBtnHeight, '戻る');
        this.startButton = new Button(buttonGroupStartX + bottomBtnWidth + col_gap, bottomButtonY, bottomBtnWidth, bottomBtnHeight, 'スタート');
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
