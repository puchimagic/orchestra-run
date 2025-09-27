import { SCENE, FONT_SIZE, FONT_FAMILY } from '../config.js';
import { Button } from '../ui/button.js';

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/title_rank_select.png');
        };
        this.inputHandler = this.game.inputHandler;

        this.currentPage = 0; // 0-indexed
        this.descriptionPages = [
            // ページ1: ゲーム概要
            [
                '■ ゲームの概要',
                'このゲームは、2人のプレイヤーが協力してハイスコアを目指すリズムアクションプラットフォーマーです。',
                'プレイヤー1はキャラクターを操作し、障害物を避けながら右方向へ進み続けます。',
                'プレイヤー2は音楽を奏でて足場を作り、プレイヤー1をサポートします。',
            ],
            // ページ2: プレイヤー1の説明
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
                '  ・木にぶつかるだけではゲームオーバーにはなりません。画面左端と木に挟まれるとゲームオーバーになります。',
            ],
            // ページ3: プレイヤー2の説明
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
            // ページ4: スコアとゲームオーバーの説明
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
        const btnWidth = 300;
        const btnHeight = 75;

        // メインに戻るボタンを画面下部に配置
        const backBtnY = this.game.canvas.height - btnHeight - 40; // 画面下部から少し上に配置
        const backBtnX = (this.game.canvas.width - btnWidth) / 2;
        this.backButton = new Button(backBtnX, backBtnY, btnWidth, btnHeight, 'メインに戻る');

        // ページ切り替えボタンをその上に配置
        const navBtnWidth = 80;
        const navBtnHeight = 60;
        const navBtnY = backBtnY - navBtnHeight - 40; // メインに戻るボタンより上に配置
        const navBtnMargin = 20; // ボタン間のマージン

        this.prevButton = new Button(
            this.game.canvas.width / 2 - navBtnWidth - navBtnMargin - 50, // ページ番号表示のために少し左にずらす
            navBtnY, navBtnWidth, navBtnHeight, '＜' // 三角記号に変更
        );
        this.nextButton = new Button(
            this.game.canvas.width / 2 + navBtnMargin + 50, // ページ番号表示のために少し右にずらす
            navBtnY, navBtnWidth, navBtnHeight, '＞' // 三角記号に変更
        );
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

        // ボタンの有効/無効状態を更新
        this.prevButton.isEnabled = (this.currentPage > 0);
        this.nextButton.isEnabled = (this.currentPage < this.totalPages - 1);
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

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
        ctx.fillText('あそびかた', width / 2, 80);

        const descriptionFontSize = 28;
        ctx.font = `${descriptionFontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        const lineHeight = 40;
        let currentY = 150;

        const maxTextWidth = 1000;
        const startX = (width - maxTextWidth) / 2;

        // 現在のページの内容を描画
        const currentPageContent = this.descriptionPages[this.currentPage];
        currentPageContent.forEach(line => {
            if (line.startsWith('■')) {
                ctx.font = `bold ${descriptionFontSize}px ${FONT_FAMILY}`;
            } else {
                ctx.font = `${descriptionFontSize}px ${FONT_FAMILY}`;
            }
            ctx.fillText(line, startX, currentY);
            currentY += lineHeight;
        });

        // ページ番号の表示
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#555';
        ctx.fillText(`${this.currentPage + 1} / ${this.totalPages}`, this.game.canvas.width / 2, this.prevButton.y + this.prevButton.height / 2 + 5);

        this.backButton.draw(ctx);
        this.prevButton.draw(ctx);
        this.nextButton.draw(ctx);
    }
}