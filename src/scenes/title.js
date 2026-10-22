import { SCENE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground } from '../ui/scene_utils.js';

export class TitleScene {
    constructor(game) {
        this.game = game;
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.MAIN];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        const logoWidth = this.game.baseWidth * 0.8;
        const logoTop = 0;

        const logo = document.createElement('img');
        logo.src = 'assets/img/logo.png';
        logo.style.position = 'absolute';
        logo.style.left = `${(this.game.baseWidth - logoWidth) / 2}px`;
        logo.style.top = `${logoTop}px`;
        logo.style.width = `${logoWidth}px`;
        sceneEl.appendChild(logo);
        this.logo = logo;

        const btnWidth = 520;
        const btnHeight = 125;
        const gapX = 80;
        const gapY = 24;
        const cx = this.game.baseWidth / 2;

        const logoAspectRatio = 374 / 666;
        const logoHeight = logoWidth * logoAspectRatio;
        const logoBottom = logoTop + logoHeight;
        const buttonsStartY = logoBottom - 235;

        const leftColX = cx - btnWidth - gapX / 2;
        const rightColX = cx + gapX / 2;

        this.startButton = new Button(leftColX, buttonsStartY, btnWidth, btnHeight, '楽器選択');
        this.rankingButton = new Button(rightColX, buttonsStartY, btnWidth, btnHeight, 'ランキング');

        const row2Y = buttonsStartY + btnHeight + gapY;
        this.descButton = new Button(leftColX, row2Y, btnWidth, btnHeight, 'あそびかた');
        this.settingsButton = new Button(rightColX, row2Y, btnWidth, btnHeight, '設定');

        const row3Y = row2Y + btnHeight + gapY;
        const creditBtnWidth = 480;
        const creditBtnHeight = 105;
        const creditBtnX = cx - creditBtnWidth / 2;
        this.creditsButton = new Button(creditBtnX, row3Y, creditBtnWidth, creditBtnHeight, 'クレジット');

        this.startButton.onClick = () => this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        this.descButton.onClick = () => this.game.changeScene(SCENE.GAME_DESCRIPTION);
        this.rankingButton.onClick = () => this.game.changeScene(SCENE.RANKING);
        this.settingsButton.onClick = () => this.game.changeScene(SCENE.SETTINGS);
        this.creditsButton.onClick = () => this.game.changeScene(SCENE.CREDITS);

        this.startButton.mount(sceneEl);
        this.descButton.mount(sceneEl);
        this.rankingButton.mount(sceneEl);
        this.settingsButton.mount(sceneEl);
        this.creditsButton.mount(sceneEl);

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

// 後方互換エイリアス
export const MainScene = TitleScene;
