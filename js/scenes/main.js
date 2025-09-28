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

        this.logoX = 0; // ロゴのX座標
        this.logoY = 0; // ロゴのY座標
        this.logoWidth = 0; // ロゴの幅
        this.logoHeight = 0; // ロゴの高さ

        // --- モード依存ロジック ---
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isStandalone) {
            // PWAモード: 厳密なキャッシュ検証
            this.cacheStatus = 'verifying';
            this.promptMessage = 'キャッシュを確認中...';
            this.verifyAssetCache();
            window.addEventListener('online', () => this.handleNetworkChange());
            window.addEventListener('offline', () => this.handleNetworkChange());
        } else {
            // ブラウザモード: キャッシュチェックをスキップして直接開始
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
            }
            else {
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
            console.error('キャッシュ検証に失敗しました:', error);
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
        const { width, height } = this.game.canvas;
        const cx = width / 2;

        // --- ロゴの配置 --- 
        // ロゴの幅を画面幅の約70%に設定
        const logoDisplayWidth = width * 0.7;
        // ロゴの高さをアスペクト比を維持して計算
        const logoDisplayHeight = this.logoImage.height * (logoDisplayWidth / this.logoImage.width);
        // ロゴを画面上部から約5%の位置に配置 (0.1 -> 0.05)
        const logoY = height * 0.05;

        // ロゴの描画位置を更新 (draw メソッドで使用するため、プロパティとして保存)
        this.logoX = cx - logoDisplayWidth / 2;
        this.logoY = logoY;
        this.logoWidth = logoDisplayWidth;
        this.logoHeight = logoDisplayHeight;


        // --- ボタンの配置 --- 
        // ボタンのサイズをさらに大きくする
        const btnWidth = 550; // 450 -> 550
        const btnHeight = 150; // 120 -> 150

        // ボタン間のギャップを調整
        const gapX = 100; // 80 -> 100
        const gapY = 50; // 40 -> 50

        // ボタンのY座標の基準点を画面の高さの約55%あたりに調整 (より上から開始してスペースを確保)
        const buttonsStartY = height * 0.55;

        // 2列のボタン配置
        const leftColX = cx - btnWidth - gapX / 2;
        const rightColX = cx + gapX / 2;

        this.startButton = new Button(leftColX, buttonsStartY, btnWidth, btnHeight, '楽器選択'); // テキストを「楽器選択」に変更
        this.descButton = new Button(leftColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, 'あそびかた');
        this.rankingButton = new Button(rightColX, buttonsStartY, btnWidth, btnHeight, 'ランキング');
        this.settingsButton = new Button(rightColX, buttonsStartY + btnHeight + gapY, btnWidth, btnHeight, '設定');
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

        // 1. 背景画像を描画
        if (this.isBackgroundLoaded) ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        else { ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, width, height); }

        // 2. ロゴを常に描画
        if (this.isLogoLoaded) {
            // onResizeで計算したプロパティを使用
            ctx.drawImage(this.logoImage, this.logoX, this.logoY, this.logoWidth, this.logoHeight);
        } else {
            ctx.fillStyle = 'black'; ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText('オケラン', width / 2, height / 2 - 250); // フォールバックテキストの位置も調整が必要な場合あり
        }

        // 3. ゲームの状態に応じてプロンプトかボタンを描画
        if (!this.game.isGameActive) {
            // ゲームがアクティブでない場合、オーバーレイとプロンプトメッセージを表示
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 半透明のオーバーレイ
            ctx.fillRect(0, 0, width, height); // 画面全体を覆う

            ctx.fillStyle = 'white';
            ctx.font = `${FONT_SIZE.LARGE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.fillText(this.promptMessage, width / 2, height / 2); // 画面中央に配置
        }
        else {
            // ゲームがアクティブな場合、ボタンを描画
            this.startButton.draw(ctx);
            this.rankingButton.draw(ctx);
            this.descButton.draw(ctx);
            this.settingsButton.draw(ctx);
        }
    }
}
