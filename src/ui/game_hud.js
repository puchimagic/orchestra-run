import { FONT_FAMILY, FONT_SIZE } from '../config.js';

// ゲーム画面の固定UI（スコア表示、楽器アイコン、カウントダウンオーバーレイ）を管理する。
export class GameHud {
    constructor(game, sceneEl) {
        this.game = game;

        this.scoreEl = document.createElement('div');
        this.scoreEl.style.position = 'absolute';
        this.scoreEl.style.left = '20px';
        this.scoreEl.style.top = '20px';
        this.scoreEl.style.color = 'black';
        this.scoreEl.style.fontFamily = FONT_FAMILY;
        this.scoreEl.style.fontSize = `${FONT_SIZE.MEDIUM}px`;
        sceneEl.appendChild(this.scoreEl);

        this.instrumentIconEl = document.createElement('img');
        this.instrumentIconEl.style.position = 'absolute';
        this.instrumentIconEl.style.left = `${this.game.baseWidth - 100 - 40}px`;
        this.instrumentIconEl.style.top = '20px';
        this.instrumentIconEl.style.width = '140px';
        this.instrumentIconEl.style.height = '150px';
        sceneEl.appendChild(this.instrumentIconEl);

        // カウントダウン用オーバーレイ
        this.countdownOverlayEl = document.createElement('div');
        this.countdownOverlayEl.style.position = 'absolute';
        this.countdownOverlayEl.style.left = '0';
        this.countdownOverlayEl.style.top = '0';
        this.countdownOverlayEl.style.width = '100%';
        this.countdownOverlayEl.style.height = '100%';
        this.countdownOverlayEl.style.background = 'rgba(0, 0, 0, 0.5)';
        this.countdownOverlayEl.style.display = 'flex';
        this.countdownOverlayEl.style.alignItems = 'center';
        this.countdownOverlayEl.style.justifyContent = 'center';
        this.countdownOverlayEl.style.color = 'white';
        this.countdownOverlayEl.style.fontFamily = FONT_FAMILY;
        this.countdownOverlayEl.style.fontSize = '128px';
        sceneEl.appendChild(this.countdownOverlayEl);
    }

    setInstrumentIcon(iconSrc) {
        this.instrumentIconEl.src = iconSrc;
    }

    updateScore(score) {
        this.scoreEl.textContent = `スコア: ${score}`;
    }

    updateCountdown(isCountdown, countdownNumber) {
        if (isCountdown) {
            this.countdownOverlayEl.style.display = 'flex';
            if (countdownNumber > 0) {
                this.countdownOverlayEl.textContent = countdownNumber;
            } else if (countdownNumber === 0) {
                this.countdownOverlayEl.textContent = 'Start!';
            } else {
                this.countdownOverlayEl.textContent = '';
            }
        } else {
            this.countdownOverlayEl.style.display = 'none';
        }
    }
}
