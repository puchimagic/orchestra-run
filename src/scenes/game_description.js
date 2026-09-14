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
                '走るキャラクターを操作しながら、音楽を演奏して足場を作る',
                'リズムアクションゲームです。',
                '',
                '1人でも2人でも遊べます。',
                '  ・1人プレイ: キャラクター操作と演奏を、ひとりで両方おこないます。',
                '  ・2人プレイ: ひとりがキャラクターを操作し、',
                '    もうひとりが演奏を担当します。',
            ],
            [
                '■ キャラクターの操作',
                '目的: 画面右方向へ進み続け、できるだけ長く生き残ること。',
                '',
                'キーボードの場合:',
                '  Aキー：左に移動',
                '  Dキー：右に移動',
                '  スペースキー：ジャンプ',
                '',
                'ゲームパッド（コントローラー）の場合:',
                '  左スティック：左右に移動',
                '  上ボタン（△ / Y）：ジャンプ',
                '',
                '注意点:',
                '  ・穴に落ちる、敵にぶつかるとゲームオーバーです。',
                '  ・木にぶつかるだけではゲームオーバーになりません。',
                '  ・画面左端と木に挟まれるとゲームオーバーになります。',
            ],
            [
                '■ 演奏で足場を作る',
                '役割: キャラクターが安全に進めるように、足場を生成したり、',
                '道をふさぐ木を破壊したりします。',
                '',
                '演奏の操作は、キーボードで固定です',
                '（ゲームパッドを使う場合でも、演奏はキーボードで行います）。',
                '',
                '操作の流れ:',
                '  ① 画面にオレンジ色の枠と、押すべきキーが表示される',
                '  ② 表示されたキーを正確に押す',
                '  ③ 足場が生成される、または木が破壊される',
                '',
                '注意点:',
                '  ・キーを押し間違えたり、タイミングが遅れたりすると',
                '    足場が生成されず、キャラクターが危険に晒されます。',
            ],
            [
                '■ 楽器によるちがい',
                '選んだ楽器によって、演奏の難しさやスコア倍率が変わります。',
                '',
                '  ・トライアングル、タンバリン、太鼓、ドラム、ピアノ',
                '    → その都度表示される1つのキーを押して、1つの音を奏でます。',
                '    → 楽器ごとに使うキーの種類数がちがい、1〜7種類あります。',
                '  ・ギター',
                '    → 複数のキー（最大4つ）を同時に押して、コードを奏でます。',
                '',
                '使うキーの種類が多い楽器や、同時押しが必要なギターほど',
                '演奏は難しくなりますが、その分スコア倍率も高くなります。',
                '（倍率が最も高いのはギター、次いでピアノです。）',
            ],
            [
                '■ スコアとゲームオーバー',
                'スコアについて:',
                '  ・進んだ距離に応じてスコアが加算されます。',
                '  ・足場生成や木破壊に成功するとボーナススコアが入ります。',
                '  ・選んだ楽器によってスコア倍率が変わります。',
                '  ・時間が経つほどスクロール速度が上がり、難しくなります。',
                '',
                'ゲームオーバーになる条件:',
                '  ・キャラクターが穴に落ちる',
                '  ・キャラクターが敵に衝突する',
                '  ・キャラクターが画面左端と木に挟まれる',
                '',
                'ゲームオーバー時には最終スコアが表示され、',
                'ランキングに登録できます。',
            ]
        ];
        this.totalPages = this.descriptionPages.length;
    }

    init() {
        this.currentPage = 0;
        const sceneEl = this.game.sceneElements[SCENE.GAME_DESCRIPTION];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        createCenteredText(sceneEl, 'あそびかた', { top: 40, fontSize: FONT_SIZE.MEDIUM });

        const panelTop = 150;
        const panelBottom = this.game.baseHeight - 100 - 60 - 40;

        this.contentEl = document.createElement('div');
        this.contentEl.className = 'content-panel';
        this.contentEl.style.position = 'absolute';
        this.contentEl.style.left = '320px';
        this.contentEl.style.top = `${panelTop}px`;
        this.contentEl.style.width = '1280px';
        this.contentEl.style.maxHeight = `${panelBottom - panelTop}px`;
        this.contentEl.style.overflowY = 'auto';
        this.contentEl.style.fontSize = '28px';
        this.contentEl.style.lineHeight = '38px';
        this.contentEl.style.color = 'var(--color-ink)';
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

        const btnWidth = 300;
        const btnHeight = 100;
        const bottomBtnY = this.game.baseHeight - btnHeight - 60;
        const sideMargin = 320;
        const backBtnX = sideMargin;
        this.backButton = new Button(backBtnX, bottomBtnY, btnWidth, btnHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);

        const navBtnWidth = 100;
        const navBtnHeight = 100;
        const navBtnMargin = 30;
        const navBtnY = bottomBtnY;
        this.navBtnY = navBtnY;
        this.navBtnHeight = navBtnHeight;

        const nextBtnX = this.game.baseWidth - sideMargin - navBtnWidth;
        const prevBtnX = nextBtnX - navBtnMargin - navBtnWidth;
        this.prevButton = new Button(prevBtnX, navBtnY, navBtnWidth, navBtnHeight, '＜', { compact: true });
        this.nextButton = new Button(nextBtnX, navBtnY, navBtnWidth, navBtnHeight, '＞', { compact: true });
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
