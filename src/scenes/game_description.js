import { SCENE, FONT_SIZE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground, createCenteredText } from '../ui/scene_utils.js';

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
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
        this.currentPage = 0;
        const sceneEl = this.game.sceneElements[SCENE.GAME_DESCRIPTION];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        createCenteredText(sceneEl, 'あそびかた', { top: 70, fontSize: FONT_SIZE.MEDIUM });

        this.contentEl = document.createElement('div');
        this.contentEl.style.position = 'absolute';
        this.contentEl.style.left = '360px';
        this.contentEl.style.top = '200px';
        this.contentEl.style.width = '1200px';
        this.contentEl.style.fontSize = '30px';
        this.contentEl.style.lineHeight = '40px';
        this.contentEl.style.color = 'black';
        this.contentEl.style.whiteSpace = 'pre-wrap';
        sceneEl.appendChild(this.contentEl);

        this.pageIndicator = document.createElement('div');
        this.pageIndicator.style.position = 'absolute';
        this.pageIndicator.style.left = '0';
        this.pageIndicator.style.width = '100%';
        this.pageIndicator.style.textAlign = 'center';
        this.pageIndicator.style.fontSize = `${FONT_SIZE.SMALL}px`;
        this.pageIndicator.style.color = '#555';
        sceneEl.appendChild(this.pageIndicator);

        const btnWidth = 400;
        const btnHeight = 100;
        const backBtnY = this.game.baseHeight - btnHeight - 60;
        const backBtnX = (this.game.baseWidth - btnWidth) / 2;
        this.backButton = new Button(backBtnX, backBtnY, btnWidth, btnHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);

        const navBtnWidth = 100;
        const navBtnHeight = 80;
        const navBtnY = backBtnY - navBtnHeight - 60;
        const navBtnMargin = 30;
        this.navBtnY = navBtnY;
        this.navBtnHeight = navBtnHeight;

        this.prevButton = new Button(this.game.baseWidth / 2 - navBtnWidth - navBtnMargin - 50, navBtnY, navBtnWidth, navBtnHeight, '＜');
        this.nextButton = new Button(this.game.baseWidth / 2 + navBtnMargin + 50, navBtnY, navBtnWidth, navBtnHeight, '＞');
        this.prevButton.onClick = () => { if (this.currentPage > 0) { this.currentPage--; this.render(); } };
        this.nextButton.onClick = () => { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.render(); } };

        this.pageIndicator.style.top = `${navBtnY + navBtnHeight / 2 - 20}px`;

        this.backButton.mount(sceneEl);
        this.prevButton.mount(sceneEl);
        this.nextButton.mount(sceneEl);

        this.render();
    }

    render() {
        this.contentEl.innerHTML = '';
        for (const line of this.descriptionPages[this.currentPage]) {
            const lineEl = document.createElement('div');
            lineEl.textContent = line;
            if (line.startsWith('■')) lineEl.style.fontWeight = 'bold';
            this.contentEl.appendChild(lineEl);
        }
        this.pageIndicator.textContent = `${this.currentPage + 1} / ${this.totalPages}`;
        this.prevButton.setEnabled(this.currentPage > 0);
        this.nextButton.setEnabled(this.currentPage < this.totalPages - 1);
    }

    destroy() {
        this.game.sceneElements[SCENE.GAME_DESCRIPTION].innerHTML = '';
    }
}
