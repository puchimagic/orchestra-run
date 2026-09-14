import { SCENE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground } from '../ui/scene_utils.js';

export class MainScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.MAIN];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        const logoWidth = this.game.baseWidth * 0.5;
        const logoTop = this.game.baseHeight * 0.05;

        const logo = document.createElement('img');
        logo.src = 'assets/img/logo.png';
        logo.style.position = 'absolute';
        logo.style.left = `${(this.game.baseWidth - logoWidth) / 2}px`;
        logo.style.top = `${logoTop}px`;
        logo.style.width = `${logoWidth}px`;
        sceneEl.appendChild(logo);
        this.logo = logo;

        const btnWidth = 550;
        const btnHeight = 150;
        const gapX = 100;
        const gapY = 50;
        const cx = this.game.baseWidth / 2;

        // ボタン開始位置は常にロゴの実際の下端を基準にする（固定割合だと
        // ロゴとの間に余計な空白ができたり、逆に重なったりするため）
        const logoAspectRatio = 374 / 666; // assets/img/logo.png の height/width
        const logoHeight = logoWidth * logoAspectRatio;
        const logoBottom = logoTop + logoHeight;
        const buttonsStartY = logoBottom + 80;

        const leftColX = cx - btnWidth - gapX / 2;
        const rightColX = cx + gapX / 2;

        this.startButton = new Button(leftColX, buttonsStartY, btnWidth, btnHeight, '楽器選択');
        this.descButton = new Button(leftColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, 'あそびかた');
        this.rankingButton = new Button(rightColX, buttonsStartY, btnWidth, btnHeight, 'ランキング');
        this.settingsButton = new Button(rightColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, '設定');

        this.startButton.onClick = () => this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        this.descButton.onClick = () => this.game.changeScene(SCENE.GAME_DESCRIPTION);
        this.rankingButton.onClick = () => this.game.changeScene(SCENE.RANKING);
        this.settingsButton.onClick = () => this.game.changeScene(SCENE.SETTINGS);

        this.startButton.mount(sceneEl);
        this.descButton.mount(sceneEl);
        this.rankingButton.mount(sceneEl);
        this.settingsButton.mount(sceneEl);

        // BGM再生に必要な最初のユーザー操作待ちオーバーレイ。
        // isGameActiveの切り替え自体はGame.setupActivationHandler(main.js)が
        // window全体のpointerdownで一元管理しており、ここでは表示/非表示のみ担当する。
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.left = '0';
        this.overlay.style.top = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        this.overlay.style.color = 'white';
        this.overlay.style.display = 'flex';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.fontSize = '96px';
        this.overlay.style.cursor = 'pointer';
        this.overlay.textContent = '画面をクリックしてください';
        sceneEl.appendChild(this.overlay);

        this.updateOverlayVisibility();
    }

    updateOverlayVisibility() {
        if (this.game.isGameActive && this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    update() {
        this.updateOverlayVisibility();
    }

    destroy() {
        const sceneEl = this.game.sceneElements[SCENE.MAIN];
        sceneEl.innerHTML = '';
    }
}
