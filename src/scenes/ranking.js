import { SCENE, FONT_SIZE } from '../config.js';
import { Button } from '../ui/button.js';
import { setSceneBackground, createCenteredText } from '../ui/scene_utils.js';

const MAX_DISPLAY_COUNT = 50;

export class RankingScene {
    constructor(game) {
        this.game = game;
        this.scores = [];
    }

    init() {
        const sceneEl = this.game.sceneElements[SCENE.RANKING];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_title.png');

        createCenteredText(sceneEl, 'ランキング', { top: 70, fontSize: FONT_SIZE.MEDIUM });

        const btnWidth = 400;
        const btnHeight = 100;
        const backBtnX = (this.game.baseWidth - btnWidth) / 2;
        const backBtnY = this.game.baseHeight - btnHeight - 60;
        this.backButton = new Button(backBtnX, backBtnY, btnWidth, btnHeight, '戻る');
        this.backButton.onClick = () => this.game.changeScene(SCENE.MAIN);
        this.backButton.mount(sceneEl);

        const areaTop = 170;
        const areaBottom = backBtnY - 50;
        const areaWidth = 1480; // content-panelの左右パディング分を確保
        const areaX = (this.game.baseWidth - areaWidth) / 2;

        this.listEl = document.createElement('div');
        this.listEl.className = 'content-panel';
        this.listEl.style.position = 'absolute';
        this.listEl.style.left = `${areaX}px`;
        this.listEl.style.top = `${areaTop}px`;
        this.listEl.style.width = `${areaWidth}px`;
        this.listEl.style.height = `${areaBottom - areaTop}px`;
        this.listEl.style.overflowY = 'auto';
        this.listEl.style.fontSize = `${FONT_SIZE.SMALL}px`;
        this.listEl.style.color = 'var(--color-ink)';
        sceneEl.appendChild(this.listEl);

        this.renderLoading();
        this.loadScores();
    }

    renderLoading() {
        this.listEl.innerHTML = '';
        const msg = document.createElement('div');
        msg.textContent = '読み込み中...';
        msg.style.textAlign = 'center';
        msg.style.padding = '40px 0';
        this.listEl.appendChild(msg);
    }

    async loadScores() {
        const scores = await this.game.scoreManager.getScores();
        this.scores = scores.map(s => ({
            ...s,
            username: s.username && s.username.trim() !== '' ? s.username : 'guest',
        }));
        this.render();
    }

    render() {
        this.listEl.innerHTML = '';

        if (!this.scores || this.scores.length === 0) {
            const msg = document.createElement('div');
            msg.textContent = 'まだ記録がありません';
            msg.style.textAlign = 'center';
            msg.style.padding = '40px 0';
            this.listEl.appendChild(msg);
            return;
        }

        const count = Math.min(this.scores.length, MAX_DISPLAY_COUNT);
        for (let i = 0; i < count; i++) {
            const entry = this.scores[i];
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.height = '60px';
            row.style.flexShrink = '0';
            row.style.gap = '20px';

            const rankEl = document.createElement('div');
            rankEl.textContent = `${i + 1}位`;
            rankEl.style.flex = '0 0 100px';

            const usernameEl = document.createElement('div');
            usernameEl.textContent = entry.username || 'guest';
            usernameEl.style.flex = '0 0 320px';
            usernameEl.style.whiteSpace = 'nowrap';
            usernameEl.style.overflow = 'hidden';
            usernameEl.style.textOverflow = 'ellipsis';

            const scoreEl = document.createElement('div');
            scoreEl.textContent = `${entry.score.toLocaleString()} pt`;
            scoreEl.style.flex = '0 0 240px';
            scoreEl.style.textAlign = 'right';

            const instrumentEl = document.createElement('div');
            instrumentEl.textContent = entry.instrument ? `(${entry.instrument})` : '';
            instrumentEl.style.flex = '1 1 auto';
            instrumentEl.style.whiteSpace = 'nowrap';
            instrumentEl.style.overflow = 'hidden';
            instrumentEl.style.textOverflow = 'ellipsis';

            const dateEl = document.createElement('div');
            dateEl.textContent = entry.date || '';
            dateEl.style.flex = '0 0 260px';
            dateEl.style.textAlign = 'right';
            dateEl.style.whiteSpace = 'nowrap';

            row.append(rankEl, usernameEl, scoreEl, instrumentEl, dateEl);
            this.listEl.appendChild(row);
        }
    }

    destroy() {
        this.game.sceneElements[SCENE.RANKING].innerHTML = '';
    }
}
