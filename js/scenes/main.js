import { SCENE, FONT_SIZE, FONT_FAMILY, CACHE_NAME } from '../config.js';
import { assetsToCache } from '../asset_list.js';
import { Button } from '../ui/button.js';
import { InputHandler } from '../input_handler.js';
import { soundPlayer } from '../../soundPlayer.js';

export class MainScene {
    constructor(game) {
        this.game = game;
        this.inputHandler = this.game.inputHandler;

        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/title_rank_select.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => { this.isBackgroundLoaded = true; };

        this.logoImage = new Image();
        this.logoImage.src = 'img/logo.png';
        this.isLogoLoaded = false;
        this.logoImage.onload = () => { this.isLogoLoaded = true; };

        // --- Mode-dependent logic ---
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isStandalone) {
            // PWA mode: strict cache verification
            this.cacheStatus = 'verifying';
            this.promptMessage = 'キャッシュを確認中...';
            this.verifyAssetCache();
            window.addEventListener('online', () => this.handleNetworkChange());
            window.addEventListener('offline', () => this.handleNetworkChange());
        } else {
            // Browser mode: skip cache check and start directly
            this.cacheStatus = 'complete';
            this.promptMessage = '画面を押してください';
        }
    }

    async verifyAssetCache() {
        if (!('caches' in window)) {
            this.promptMessage = 'このブラウザはオフライン非対応です';
            this.cacheStatus = 'complete';
            return;
        }

        try {
            const cache = await caches.open(CACHE_NAME);
            const promises = assetsToCache.map(url => cache.match(url).then(res => res !== undefined));
            const results = await Promise.all(promises);
            const allCached = results.every(result => result);

            if (allCached) {
                this.cacheStatus = 'complete';
                this.promptMessage = '画面を押してください';
            } else {
                if (navigator.onLine) {
                    this.cacheStatus = 'caching';
                    this.promptMessage = 'アセットを準備中です...';
                    setTimeout(() => this.verifyAssetCache(), 2000);
                } else {
                    this.cacheStatus = 'incomplete_offline';
                    this.promptMessage = 'ネットワークに繋いでください';
                }
            }
        } catch (error) {
            console.error('Cache verification failed:', error);
            this.cacheStatus = 'incomplete_offline';
            this.promptMessage = 'エラーが発生しました';
        }
    }

    handleNetworkChange() {
        if (this.cacheStatus !== 'complete') {
            this.verifyAssetCache();
        }
    }

    init() {
        this.onResize();
    }

    onResize() {
        const btnWidth = 300, btnHeight = 75, gapX = 50, gapY = 20;
        const cx = this.game.canvas.width / 2, cy = this.game.canvas.height / 2;
        const leftColX = cx - btnWidth - gapX / 2, rightColX = cx + gapX / 2;

        this.startButton = new Button(leftColX, cy - btnHeight - gapY / 2, btnWidth, btnHeight, 'ゲームスタート');
        this.descButton = new Button(leftColX, cy + gapY / 2, btnWidth, btnHeight, 'あそびかた');
        this.rankingButton = new Button(rightColX, cy - btnHeight - gapY / 2, btnWidth, btnHeight, 'ランキング');
        this.settingsButton = new Button(rightColX, cy + gapY / 2, btnWidth, btnHeight, '設定');
    }

    update() {
        if (!this.game.isGameActive) {
            if (this.cacheStatus === 'complete' && this.inputHandler.isActivated()) {
                this.game.isGameActive = true;
                soundPlayer.playBGM('home_bgm');
                if (this.game.canvas.requestFullscreen) {
                    this.game.canvas.requestFullscreen().catch(err => console.log(err));
                }
            }
            return;
        }

        if (this.startButton.update(this.game.mouse)) this.game.changeScene(SCENE.INSTRUMENT_SELECT);
        if (this.rankingButton.update(this.game.mouse)) this.game.changeScene(SCENE.RANKING);
        if (this.descButton.update(this.game.mouse)) this.game.changeScene(SCENE.GAME_DESCRIPTION);
        if (this.settingsButton.update(this.game.mouse)) this.game.changeScene(SCENE.SETTINGS);
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        if (this.isBackgroundLoaded) ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        else { ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, width, height); }

        if (this.isLogoLoaded) {
            const logoWidth = 600, logoHeight = this.logoImage.height * (logoWidth / this.logoImage.width);
            ctx.drawImage(this.logoImage, width / 2 - logoWidth / 2, height / 2 - 250 - logoHeight / 2, logoWidth, logoHeight);
        } else {
            ctx.fillStyle = 'black'; ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText('オケラン', width / 2, height / 2 - 250);
        }

        this.startButton.draw(ctx);
        this.rankingButton.draw(ctx);
        this.descButton.draw(ctx);
        this.settingsButton.draw(ctx);

        if (!this.game.isGameActive) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText(this.promptMessage, width / 2, height / 2 + 150);
        }
    }
}