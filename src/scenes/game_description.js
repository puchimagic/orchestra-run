import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
        this.backgroundImage = loadImage('assets/img/bg_title.png');

        this.currentPage = 0;
        this.descriptionPages = [
            [
                '■ ゲームの概要',
                'このゲームは、2人のプレイヤーが協力してハイスコアを目指すリズムアクションプラットフォーマーです。',
                'プレイヤー1はキャラクターを操作し、障害物を避けながら右方向へ進み続けます。',
                'プレイヤー2は音楽を奏でて足場を作り、プレイヤー1をサポートします。',
            ],
            [
                '■ プレイヤー1：キャラクター操作',
                '目的: 画面右方向へ進み続け、できるだけ長く生き残ること。',
                '',
                '操作:',
                '  キーボード: Aキー (左移動), Dキー (右移動), スペースキー (ジャンプ)',
                '  ゲームパッド: 左スティック (左右移動), ボタン3 (ジャンプ)',
                '',
                '注意点:',
                '  ・穴に落ちたり、敵にぶつかるとゲームオーバーです。',
                '  ・木にぶつかるだけではゲームオーバーにはなりません。',
                '  ・画面左端と木に挟まれるとゲームオーバーになります。',
            ],
            [
                '■ プレイヤー2：音楽と足場作り',
                '役割: プレイヤー1が安全に進めるように、足場を生成したり、道を塞ぐ木を破壊したりします。',
                '',
                '操作:',
                '  画面にオレンジ色の枠と、押すべきキー（またはゲームパッドのボタン）が表示されます。',
                '  表示されたキー（またはボタン）を正確に押すことで、足場が生成されたり、木が破壊されたりします。',
                '',
                '楽器選択の影響:',
                '  ・選択した楽器によって、足場生成や木破壊に必要なキーの種類や数、同時押しのルールが変わります。',
                '  ・楽器ごとに異なる音色が鳴り、ゲームを彩ります。',
                '  ・例: トライアングル、タンバリン、太鼓、ドラム、ピアノ: 1つのキーを押すことで1つの音を奏でる。',
                '  ・例: ギター: 複数のキーを同時に押すことで、コードを奏でる。',
                '',
                '注意点:',
                '  ・キーの押し間違いや、タイミングが遅れると足場が生成されず、プレイヤー1が危険に晒されます。',
            ],
            [
                '■ スコアについて',
                '・進んだ距離に応じてスコアが加算されます。',
                '・足場生成や木破壊の成功でボーナススコアが得られます。',
                '・選択した楽器によってスコア倍率が変わります。',
                '・時間が経過するごとにスクロール速度が上がり、難易度が増します。',
                '',
                '■ ゲームオーバー',
                'プレイヤー1が穴に落ちる、敵に衝突する、画面左端と木に挟まれるとゲームオーバーです。',
                'ゲームオーバー時には最終スコアが表示され、ランキングに登録できます。',
            ]
        ];
        this.totalPages = this.descriptionPages.length;
    }

    init() {
        this.onResize();
    }

    onResize() {
        const { width, height } = this.game.canvas;

        const btnWidth = 400;
        const btnHeight = 100;
        const backBtnY = height - btnHeight - 60;
        const backBtnX = (width - btnWidth) / 2;
        this.backButton = new Button(backBtnX, backBtnY, btnWidth, btnHeight, '戻る');

        const navBtnWidth = 100;
        const navBtnHeight = 80;
        const navBtnY = backBtnY - navBtnHeight - 60;
        const navBtnMargin = 30;

        this.prevButton = new Button(width / 2 - navBtnWidth - navBtnMargin - 50, navBtnY, navBtnWidth, navBtnHeight, '＜');
        this.nextButton = new Button(width / 2 + navBtnMargin + 50, navBtnY, navBtnWidth, navBtnHeight, '＞');
    }

    update() {
        if (this.backButton.update(this.game.mouse)) {
            this.game.changeScene(SCENE.MAIN);
        }
        if (this.prevButton.update(this.game.mouse) && this.currentPage > 0) {
            this.currentPage--;
        }
        if (this.nextButton.update(this.game.mouse) && this.currentPage < this.totalPages - 1) {
            this.currentPage++;
        }
        this.prevButton.isEnabled = (this.currentPage > 0);
        this.nextButton.isEnabled = (this.currentPage < this.totalPages - 1);
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        drawBackground(ctx, this.backgroundImage, width, height);

        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText('あそびかた', width / 2, 120);

        const descriptionFontSize = 30;
        const lineHeight = 40;
        let currentY = 200;
        const startX = (width - 1000) / 2 - 200;

        ctx.textAlign = 'left';
        for (const line of this.descriptionPages[this.currentPage]) {
            ctx.font = line.startsWith('■')
                ? `bold ${descriptionFontSize}px ${FONT_FAMILY}`
                : `${descriptionFontSize}px ${FONT_FAMILY}`;
            ctx.fillText(line, startX, currentY);
            currentY += lineHeight;
        }

        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#555';
        ctx.fillText(`${this.currentPage + 1} / ${this.totalPages}`, width / 2, this.prevButton.y + this.prevButton.height / 2 + 5);

        this.backButton.draw(ctx);
        this.prevButton.draw(ctx);
        this.nextButton.draw(ctx);
    }
}
