import { SCENE, FONT_SIZE, KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_ORDER, INSTRUMENT_ICON_MAP } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground, addFloatingNotes, createCenteredText } from '../ui/scene_utils.js';

const IMG = 'assets/img/';

// 小さなDOM組み立て用ヘルパー
function el(tag, className, parent, style, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (style) Object.assign(e.style, style);
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
}
// 絵を重ねて置く箱の中に、画像を位置・大きさ指定で置く
function pic(parent, src, x, y, w, h) {
    const e = el('img', '', parent, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    e.src = IMG + src;
    return e;
}
function ground(parent, x, y, w) {
    return el('div', 'howto-abs howto-ground', parent, { left: `${x}px`, top: `${y}px`, width: `${w}px` });
}
function keys(parent, list) {
    list.forEach((k, i) => {
        if (i > 0) el('span', 'howto-plus', parent, null, '+');
        el('span', 'howto-key' + (k === 'SPACE' ? ' wide' : ''), parent, null, k);
    });
}

// ゲームパッドの図（左スティックと△/Yボタンを色付きで示す）
const GAMEPAD_SVG = `
<svg viewBox="0 0 760 470" width="380" height="235">
 <path d="M150 90 Q380 50 610 90 Q720 110 735 260 Q750 420 650 440 Q590 450 540 360 L220 360 Q170 450 110 440 Q10 420 25 260 Q40 110 150 90 Z" fill="#fffdf8" stroke="#4a3f35" stroke-width="12" stroke-linejoin="round"/>
 <circle cx="240" cy="270" r="62" fill="#ffcf5c" stroke="#4a3f35" stroke-width="10"/>
 <circle cx="240" cy="270" r="30" fill="#fff6e0" stroke="#4a3f35" stroke-width="8"/>
 <circle cx="520" cy="270" r="50" fill="#e9e1d3" stroke="#4a3f35" stroke-width="8"/>
 <circle cx="185" cy="170" r="30" fill="#e9e1d3" stroke="#4a3f35" stroke-width="7"/>
 <g stroke="#4a3f35" stroke-width="7"><circle cx="580" cy="150" r="30" fill="#ff9ec4"/><circle cx="640" cy="205" r="28" fill="#e9e1d3"/><circle cx="520" cy="205" r="28" fill="#e9e1d3"/></g>
 <path d="M565 162 L580 136 L595 162 Z" fill="none" stroke="#4a3f35" stroke-width="6" stroke-linejoin="round"/>
</svg>`;

export class GameDescriptionScene {
    constructor(game) {
        this.game = game;
        this.currentPage = 0;
        // 各ページは絵や図を使って説明する（文字だけの説明より分かりやすくするため）
        this.pages = [
            { title: 'ゲームの概要', build: (b) => this.buildOverview(b) },
            { title: 'キャラクターの操作', build: (b) => this.buildControls(b) },
            { title: '演奏で足場をつくる', build: (b) => this.buildPlaying(b) },
            { title: '楽器によるちがい', build: (b) => this.buildInstruments(b) },
            { title: 'スコアとゲームオーバー', build: (b) => this.buildScore(b) },
        ];
        this.totalPages = this.pages.length;
    }

    init() {
        this.currentPage = 0;
        const sceneEl = this.game.sceneElements[SCENE.GAME_DESCRIPTION];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');
        addFloatingNotes(sceneEl);

        createCenteredText(sceneEl, 'あそびかた', { top: 70, fontSize: FONT_SIZE.MEDIUM });

        this.panelEl = el('div', 'content-panel howto-panel', sceneEl);

        this.pageIndicator = el('div', '', sceneEl, {
            position: 'absolute', left: '0', width: '100%', textAlign: 'center',
            fontSize: `${FONT_SIZE.SMALL}px`, color: '#555',
        });

        const btnWidth = 450;
        const btnHeight = 100;
        const bottomBtnY = this.game.baseHeight - btnHeight - 60;
        const sideMargin = 200;
        this.backButton = new Button(sideMargin, bottomBtnY, btnWidth, btnHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);

        const navBtnWidth = 100;
        const navBtnHeight = 100;
        const navBtnMargin = 30;
        const nextBtnX = this.game.baseWidth - sideMargin - navBtnWidth;
        const prevBtnX = nextBtnX - navBtnMargin - navBtnWidth;
        this.prevButton = new Button(prevBtnX, bottomBtnY, navBtnWidth, navBtnHeight, '＜', { compact: true });
        this.nextButton = new Button(nextBtnX, bottomBtnY, navBtnWidth, navBtnHeight, '＞', { compact: true });
        this.prevButton.onClick = () => { if (this.currentPage > 0) { this.currentPage--; this.render(); } };
        this.nextButton.onClick = () => { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.render(); } };

        this.pageIndicator.style.top = `${bottomBtnY + navBtnHeight / 2 - 20}px`;

        this.backButton.mount(sceneEl);
        this.prevButton.mount(sceneEl);
        this.nextButton.mount(sceneEl);

        this.render();
    }

    render() {
        this.panelEl.innerHTML = '';
        const page = this.pages[this.currentPage];
        el('div', 'howto-heading', this.panelEl, null, page.title);
        const body = el('div', 'howto-body', this.panelEl);
        page.build(body);
        this.pageIndicator.textContent = `${this.currentPage + 1} / ${this.totalPages}`;
        this.prevButton.setEnabled(this.currentPage > 0);
        this.nextButton.setEnabled(this.currentPage < this.totalPages - 1);
    }

    // 1. ゲームの概要: 足場の上を歩くキャラの図と、3つのステップ、1人/2人プレイ
    buildOverview(body) {
        body.classList.add('howto-col');
        const top = el('div', 'howto-flex', body);
        const p = el('div', 'howto-pic howto-box', top, { width: '560px', height: '340px' });
        ground(p, 0, 280, 200);
        ground(p, 380, 280, 180);
        pic(p, 'scaffold.png', 196, 196, 188, 38);
        pic(p, 'character_woke.png', 244, 92, 96, 104);
        pic(p, 'tree.png', 418, 50, 150, 230);

        const steps = el('div', 'howto-steps', top);
        [
            ['キャラクターを操作して、右へ右へ進む', 'var(--color-sky)'],
            ['画面に出たキーを押して、楽器を演奏する', 'var(--color-pink)'],
            ['演奏すると、足場ができる・木がたおれる', 'var(--color-yellow)'],
        ].forEach(([text, color], i) => {
            const row = el('div', 'howto-row', steps);
            el('div', 'howto-num', row, { background: color }, String(i + 1));
            el('div', '', row, null, text);
        });

        const players = el('div', 'howto-flex howto-players', body);
        [
            ['1P', 'var(--color-sky)', '<b>1人プレイ</b>：キャラ操作も演奏も、ひとりで'],
            ['2P', 'var(--color-pink)', '<b>2人プレイ</b>：キャラ担当と演奏担当に分かれて協力'],
        ].forEach(([label, color, text]) => {
            const row = el('div', 'howto-row howto-small', players);
            el('div', 'howto-num howto-badge', row, { background: color }, label);
            el('div', '', row, null, text);
        });
    }

    // 2. キャラクターの操作: キーボードとゲームパッド
    buildControls(body) {
        body.classList.add('howto-col');
        const top = el('div', 'howto-flex', body, { alignItems: 'stretch' });

        const kb = el('div', 'howto-box howto-center', top, { width: '600px' });
        el('div', 'howto-box-title', kb, null, 'キーボード');
        const row1 = el('div', 'howto-keys', kb);
        [['A', '◀ 左へ'], ['D', '右へ ▶']].forEach(([k, label]) => {
            const c = el('div', 'howto-keycol', row1);
            keys(c, [k]);
            el('div', 'howto-caption', c, null, label);
        });
        const row2 = el('div', 'howto-keycol', kb);
        keys(row2, ['SPACE']);
        el('div', 'howto-caption', row2, null, 'ジャンプ');

        const pad = el('div', 'howto-box howto-center', top, { width: '600px' });
        el('div', 'howto-box-title', pad, { background: 'var(--color-pink)' }, 'ゲームパッド');
        el('div', '', pad, { marginTop: '6px' }, GAMEPAD_SVG);
        const labels = el('div', 'howto-flex', pad, { gap: '16px' });
        el('div', 'howto-chip', labels, { background: 'var(--color-yellow)' }, '左スティック：移動');
        el('div', 'howto-chip', labels, { background: 'var(--color-pink)' }, '△ / Y：ジャンプ');
        el('div', 'howto-caption', pad, { fontSize: '22px' }, '※ 設定画面でゲームパッドをえらんでね');

        el('div', 'howto-footer', body, null, '目標：画面の右へ進みつづけて、<em>できるだけ長く 生きのころう！</em>');
    }

    // 3. 演奏で足場をつくる: ①枠とキー → ②キーを押す → ③足場ができる、木もたおせる
    buildPlaying(body) {
        body.classList.add('howto-col');
        const flow = el('div', 'howto-flex howto-flow', body);

        const s1 = el('div', 'howto-step', flow);
        const p1 = el('div', 'howto-pic howto-box', s1, { width: '360px', height: '220px' });
        ground(p1, 0, 160, 110);
        ground(p1, 250, 160, 110);
        el('div', 'howto-abs howto-frame', p1, { left: '110px', top: '92px', width: '140px', height: '44px', fontSize: '28px' }, 'U + P');
        pic(p1, 'character_wait.png', 10, 62, 84, 98);
        el('div', 'howto-caption', s1, null, '① 穴の上に オレンジの枠と<br>押すキーが出る');

        el('div', 'howto-arrow', flow, null, '▶');

        const s2 = el('div', 'howto-step', flow);
        const k2 = el('div', 'howto-box howto-center', s2, { width: '300px', height: '220px', justifyContent: 'center' });
        const kr = el('div', 'howto-keys', k2);
        keys(kr, ['U', 'P']);
        el('div', 'howto-caption', k2, { fontSize: '22px' }, '2つなら 同時に押す');
        el('div', 'howto-caption', s2, null, '② 表示されたキーを<br>押して演奏！');

        el('div', 'howto-arrow', flow, null, '▶');

        const s3 = el('div', 'howto-step', flow);
        const p3 = el('div', 'howto-pic howto-box', s3, { width: '360px', height: '220px' });
        ground(p3, 0, 160, 110);
        ground(p3, 250, 160, 110);
        pic(p3, 'scaffold.png', 110, 100, 140, 30);
        pic(p3, 'character_woke.png', 136, 4, 88, 96);
        el('div', 'howto-caption', s3, null, '③ 足場ができて<br>わたれる！');

        const bottom = el('div', 'howto-flex', body, { gap: '40px' });
        const tree = el('div', 'howto-flex howto-box', bottom, { gap: '14px', padding: '14px 24px' });
        const t1 = el('div', 'howto-pic', tree, { width: '120px', height: '170px' });
        pic(t1, 'tree.png', 0, 0, 120, 170);
        el('div', 'howto-abs howto-treekey', t1, { left: '24px', top: '84px' }, 'O + U');
        el('div', 'howto-arrow', tree, { fontSize: '40px' }, '▶');
        const t2 = el('div', 'howto-pic', tree, { width: '90px', height: '170px' });
        pic(t2, 'stump.png', 0, 70, 90, 100);
        el('div', 'howto-caption', tree, { textAlign: 'left' }, '道をふさぐ大きな木も、<br>演奏でたおせる！');

        const notes = el('div', 'howto-notes', bottom);
        [
            'キーを押しまちがえたり、おそかったりすると足場ができない',
            'できた足場は しばらくすると消えてしまう',
            '演奏はいつもキーボードで（ゲームパッドのときも）',
        ].forEach(t => el('div', 'howto-note', notes, null, t));
    }

    // 4. 楽器によるちがい: 6つの楽器のカード（数値はゲームの設定から表示する）
    buildInstruments(body) {
        body.classList.add('howto-col');
        const grid = el('div', 'howto-grid', body);
        INSTRUMENT_ORDER.forEach((name, i) => {
            const config = KEYBOARD_INSTRUMENT_CONFIG[name];
            const card = el('div', 'howto-card', grid);
            el('img', '', card).src = INSTRUMENT_ICON_MAP[name];
            const info = el('div', '', card);
            el('div', 'howto-card-name', info, null, name);
            el('div', 'howto-stars', info, null, '★'.repeat(i + 1) + `<span style="color:#e9e1d3">${'★'.repeat(INSTRUMENT_ORDER.length - i - 1)}</span>`);
            const lines = [`キー：${config.keys.length}種`];
            lines.push(config.maxSimultaneousKeys > 1 ? `同時押し：最大${config.maxSimultaneousKeys}つ` : '同時押し：なし');
            el('div', 'howto-card-info', info, null, lines.join('<br>'));
            el('div', 'howto-mult', info, null, `スコア ×${config.multiplier.toFixed(1)}`);
        });
        el('div', 'howto-footer', body, null, 'むずかしい楽器ほど、<em>スコア倍率が高い！</em>');
    }

    // 5. スコアとゲームオーバー: スコアの決まり方と、ゲームオーバーになる3パターン
    buildScore(body) {
        body.classList.add('howto-col');
        const rules = el('div', 'howto-flex', body, { gap: '24px' });
        [
            ['character_woke.png', null, '進めば進むほど<br>スコアが増える'],
            [null, '▶▶', '時間がたつと<br>スピードアップ'],
            ['instrument_piano.png', null, 'えらんだ楽器の<br>倍率がかかる'],
        ].forEach(([image, mark, text]) => {
            const r = el('div', 'howto-box howto-rule', rules);
            const icon = el('div', 'howto-rule-icon', r, null, mark);
            if (image) el('img', '', icon).src = IMG + image;
            el('div', '', r, null, text);
        });

        el('div', 'howto-subheading', body, null, 'こんなときは ゲームオーバー');
        const fails = el('div', 'howto-flex', body, { gap: '30px' });
        const fail = (caption, draw) => {
            const f = el('div', 'howto-step', fails);
            const p = el('div', 'howto-pic howto-box', f, { width: '360px', height: '180px' });
            draw(p);
            el('div', 'howto-abs howto-cross', p, { right: '14px', top: '8px' }, '✕');
            el('div', 'howto-caption', f, null, caption);
        };
        fail('① 穴に落ちる', (p) => {
            ground(p, 0, 120, 120);
            ground(p, 250, 120, 110);
            pic(p, 'character_jump.png', 132, 70, 76, 80);
        });
        fail('② 音符のてきに ぶつかる', (p) => {
            ground(p, 0, 120, 360);
            pic(p, 'character_wait.png', 100, 30, 80, 90);
            pic(p, 'enemy.png', 178, 64, 56, 56);
        });
        fail('③ 画面の左はしと 木に はさまれる', (p) => {
            ground(p, 0, 120, 360);
            el('div', 'howto-abs howto-edge', p, { left: '18px', top: '6px', height: '114px' });
            pic(p, 'character_wait.png', 24, 30, 80, 90);
            pic(p, 'tree.png', 70, 0, 110, 120);
        });
        el('div', 'howto-footer howto-small', body, null, '木に ぶつかるだけなら だいじょうぶ ／ ゲームオーバーになるとスコアが決まり、ランキングに登録されます');
    }

    destroy() {
        this.game.sceneElements[SCENE.GAME_DESCRIPTION].innerHTML = '';
    }
}
