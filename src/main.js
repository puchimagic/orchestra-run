import { SCENE } from './config.js';
import { MainScene } from './scenes/main.js';
import { GameDescriptionScene } from './scenes/game_description.js';
import { RankingScene } from './scenes/ranking.js';
import { InstrumentSelectScene } from './scenes/instrument_select.js';
import { GameScene } from './scenes/game.js';
import { GameOverScene } from './scenes/game_over.js';
import { SettingsScene } from './scenes/settings.js';
import { ScoreManager } from './score_manager.js';
import { InputHandler } from './input_handler.js';
import { soundPlayer } from './soundPlayer.js';

// 旧PWA対応時代に登録されたService Workerが端末に残っていると、
// 更新後のファイルが反映されず古いキャッシュのまま表示され続けるため、
// 見つかり次第自動的に解除する（現在このサイトはService Workerを使用しない）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
    });
}

const SCENE_BGM_MAP = {
    [SCENE.MAIN]: 'home_bgm',
    [SCENE.INSTRUMENT_SELECT]: 'home_bgm',
    [SCENE.RANKING]: 'home_bgm',
    [SCENE.GAME_DESCRIPTION]: 'home_bgm',
    [SCENE.SETTINGS]: 'home_bgm',
    [SCENE.GAME]: 'game_bgm',
    [SCENE.GAME_OVER]: 'gameover_bgm',
};

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

class Game {
    constructor() {
        this.root = document.getElementById('gameRoot');
        this.baseWidth = BASE_WIDTH;
        this.baseHeight = BASE_HEIGHT;

        this.sceneElements = {};
        document.querySelectorAll('.scene').forEach(el => {
            const name = el.id.replace('scene-', '');
            this.sceneElements[name] = el;
        });

        this.scenes = {};
        this.currentScene = null;
        this.currentSceneName = null;
        this.isGameActive = false;

        this.scoreManager = new ScoreManager(this);
        this.selectedInstrument = null;
        this.inputMethod = 'keyboard';
        this.username = 'Guest';

        this.loadSettings();

        window.addEventListener('resize', () => this.resizeRoot());
        this.resizeRoot();

        this.init();
        this.setupActivationHandler();
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('okerun-settings'));
            if (settings) {
                this.inputMethod = settings.inputMethod || 'keyboard';
                soundPlayer.setBgmVolume(settings.bgmVolume !== undefined ? settings.bgmVolume : 0.5);
                soundPlayer.setInstrumentVolume(settings.instrumentVolume !== undefined ? settings.instrumentVolume : 1.0);
                soundPlayer.setGameSoundVolume(settings.gameSoundVolume !== undefined ? settings.gameSoundVolume : 0.7);
                this.username = settings.username || 'Guest';
            }
        } catch (e) {
            console.error('設定の読み込みに失敗しました:', e);
            this.inputMethod = 'keyboard';
            this.username = 'Guest';
        }
    }

    saveSettings() {
        try {
            const settings = {
                inputMethod: this.inputMethod,
                bgmVolume: soundPlayer.bgmVolume,
                instrumentVolume: soundPlayer.instrumentVolume,
                gameSoundVolume: soundPlayer.gameSoundVolume,
                username: this.username,
            };
            localStorage.setItem('okerun-settings', JSON.stringify(settings));
        } catch (e) {
            console.error('設定の保存に失敗しました:', e);
        }
    }

    // #gameRootを画面いっぱいに収まるようscaleする。中のDOM要素は全て
    // 1920x1080基準のpx値をそのまま使えるため、座標変換コードが一切不要になる。
    resizeRoot() {
        const scale = Math.min(window.innerWidth / this.baseWidth, window.innerHeight / this.baseHeight);
        this.scale = scale;
        this.root.style.transform = `scale(${scale})`;
        this.root.style.left = `${(window.innerWidth - this.baseWidth * scale) / 2}px`;
        this.root.style.top = `${(window.innerHeight - this.baseHeight * scale) / 2}px`;

        if (this.currentScene && this.currentScene.onResize) {
            this.currentScene.onResize();
        }
    }

    setupActivationHandler() {
        const activateOnce = () => {
            this.isGameActive = true;
            soundPlayer.playBGM('home_bgm');
            window.removeEventListener('pointerdown', activateOnce);
        };
        window.addEventListener('pointerdown', activateOnce);
    }

    init() {
        this.playerInput = new InputHandler();
        this.scenes[SCENE.MAIN] = new MainScene(this);
        this.scenes[SCENE.GAME_DESCRIPTION] = new GameDescriptionScene(this);
        this.scenes[SCENE.INSTRUMENT_SELECT] = new InstrumentSelectScene(this);
        this.scenes[SCENE.GAME_OVER] = new GameOverScene(this);
        this.scenes[SCENE.SETTINGS] = new SettingsScene(this);

        this.changeScene(SCENE.MAIN);
        this.gameLoop();
    }

    changeScene(sceneName, data = {}) {
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }
        if (this.currentSceneName) {
            this.sceneElements[this.currentSceneName].classList.remove('active');
        }

        const targetBGM = SCENE_BGM_MAP[sceneName];
        if (targetBGM !== SCENE_BGM_MAP[this.currentSceneName]) {
            soundPlayer.stopAllSounds();
            if (targetBGM) soundPlayer.playBGM(targetBGM);
        }
        this.currentSceneName = sceneName;

        if (sceneName === SCENE.GAME) {
            this.currentScene = new GameScene(this, this.selectedInstrument);
        } else if (sceneName === SCENE.RANKING) {
            this.currentScene = new RankingScene(this);
        } else {
            this.currentScene = this.scenes[sceneName];
        }

        this.sceneElements[sceneName].classList.add('active');

        if (this.currentScene.init) {
            this.currentScene.init(data);
        }
    }

    gameLoop() {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => new Game());
