import { SCENE, FONT_SIZE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground } from '../ui/scene_utils.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.finalScore = 0;
        this.lastInstrument = null;
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.lastInstrument = data.instrument || 'なし';

        this.game.scoreManager.addScore(this.finalScore, this.lastInstrument);

        const sceneEl = this.game.sceneElements[SCENE.GAME_OVER];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_gameover.png');

        const cx = this.game.baseWidth / 2;
        const cy = this.game.baseHeight / 2;

        const titleEl = document.createElement('div');
        titleEl.textContent = 'ゲームオーバー';
        titleEl.style.position = 'absolute';
        titleEl.style.left = '0';
        titleEl.style.top = `${cy - 120 - FONT_SIZE.LARGE / 2}px`;
        titleEl.style.width = '100%';
        titleEl.style.textAlign = 'center';
        titleEl.style.fontSize = `${FONT_SIZE.LARGE}px`;
        titleEl.style.color = 'white';
        titleEl.style.webkitTextStroke = '4px black';
        sceneEl.appendChild(titleEl);

        const scoreEl = document.createElement('div');
        scoreEl.textContent = `スコア: ${this.finalScore}`;
        scoreEl.style.position = 'absolute';
        scoreEl.style.left = '0';
        scoreEl.style.top = `${cy - 30 - FONT_SIZE.MEDIUM / 2}px`;
        scoreEl.style.width = '100%';
        scoreEl.style.textAlign = 'center';
        scoreEl.style.fontSize = `${FONT_SIZE.MEDIUM}px`;
        scoreEl.style.color = 'white';
        scoreEl.style.webkitTextStroke = '3px black';
        sceneEl.appendChild(scoreEl);

        const btnWidth = 450;
        const btnHeight = 100;
        this.continueButton = new Button(cx - btnWidth / 2, cy + 80, btnWidth, btnHeight, 'コンティニュー');
        this.backButton = new Button(cx - btnWidth / 2, cy + 200, btnWidth, btnHeight, 'メインに戻る');

        this.continueButton.onClick = () => this.game.changeScene(SCENE.GAME, { instrument: this.lastInstrument });
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);

        this.continueButton.mount(sceneEl);
        this.backButton.mount(sceneEl);
    }

    destroy() {
        this.game.sceneElements[SCENE.GAME_OVER].innerHTML = '';
    }
}
