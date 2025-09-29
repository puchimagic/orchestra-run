import { SCENE, FONT_SIZE, FONT_FAMILY, KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_ORDER, DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_HOVER_COLOR } from '../config.js';
import { Button } from '../ui/button.js';

export class InstrumentSelectScene {
    constructor(game) {
        this.game = game;
        this.selectedInstrument = INSTRUMENT_ORDER[0];

         // 背景画像を読み込む
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('背景画像の読み込みに失敗しました: img/title_rank_select.png');
        };
    }

    init() {
        this.onResize();
    }

    onResize() {
        const btnWidth = 500; // 400から増加
        const btnHeight = 100; // 75から増加
        const cx = this.game.canvas.width / 2;
        const cy = this.game.canvas.height / 2;
        const row_margin = 30; // 20から増加
        const col_gap = 60; // 40から増加
        const infoTextWidth = 250; // ボタン横の情報テキストの推定幅

        // 楽器ボタン2列 + 情報テキスト + ギャップの合計幅を計算
        const instrumentBlockWidth = (btnWidth + infoTextWidth) * 2 + col_gap;
        const instrumentBlockStartX = cx - instrumentBlockWidth / 2;

        const col1_x = instrumentBlockStartX;
        const col2_x = instrumentBlockStartX + btnWidth + infoTextWidth + col_gap;

        // Y座標を調整して間隔を広げる
        const y1 = cy - btnHeight - row_margin - 100; // -80から調整
        const y2 = cy - 10; // -80から調整
        const y3 = cy + btnHeight + row_margin + 80; // -80から調整

        this.instrumentButtons = {};
        INSTRUMENT_ORDER.forEach((name, i) => {
            let x, y;
            if (i < 3) {
                x = col1_x;
                y = [y1, y2, y3][i];
            } else {
                x = col2_x;
                y = [y1, y2, y3][i - 3];
            }
            this.instrumentButtons[name] = new Button(x, y, btnWidth, btnHeight, name, DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_HOVER_COLOR, `${name}_track01`, "instrumentSound");
        });

        // スタートボタンと戻るボタンをグループとして中央に配置
        const bottomButtonY = y3 + btnHeight + 100; // 80から調整
        const buttonGroupWidth = btnWidth * 2 + col_gap; // ボタン2つ + ギャップ
        const buttonGroupStartX = cx - buttonGroupWidth / 2;

        this.startButton = new Button(buttonGroupStartX, bottomButtonY, btnWidth, btnHeight, 'スタート', '#4CAF50', '#66BB6A'); // テキストを「スタート」に変更
        this.backButton = new Button(buttonGroupStartX + btnWidth + col_gap, bottomButtonY, btnWidth, btnHeight, '戻る');
    }

    update() {
        for (const instrument of INSTRUMENT_ORDER) {
            if (this.instrumentButtons[instrument].update(this.game.mouse)) {
                this.selectedInstrument = instrument;
            }
        }

        if (this.startButton.update(this.game.mouse)) {
            this.game.selectedInstrument = this.selectedInstrument; // Gameクラスに選択された楽器を保存
            this.game.changeScene(SCENE.GAME); // GameSceneのコンストラクタでselectedInstrumentを受け取るため、dataは不要
        }
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

           //背景設定
        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('楽器をえらんでね', width / 2, 120);

        for (const name of INSTRUMENT_ORDER) {
            const button = this.instrumentButtons[name];
            const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[name]; // 表示用にKEYBOARD_INSTRUMENT_CONFIGを使用

            // 選択された楽器をハイライト
            button.isHighlighted = (this.selectedInstrument === name);

            button.draw(ctx);

            // 楽器情報の表示
            ctx.fillStyle = '#555';
            ctx.font = `40px ${FONT_FAMILY}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let infoText = `キー: ${instrumentConfig.keys.length}種`;
            if (instrumentConfig.maxChord > 1) {
                infoText += ` / 最大${instrumentConfig.maxChord}音`;
            }

            ctx.fillText(infoText, button.x + button.width + 20, button.y + button.height / 2);
        }

        ctx.textAlign = 'center';
        this.startButton.draw(ctx);
        this.backButton.draw(ctx);
    }
}