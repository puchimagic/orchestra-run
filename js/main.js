import { SCENE } from './config.js';
import { MainScene } from './scenes/main.js';
import { GameDescriptionScene } from './scenes/game_description.js';
import { RankingScene } from './scenes/ranking.js';
import { InstrumentSelectScene } from './scenes/instrument_select.js';
import { GameScene } from './scenes/game.js';
import { GameOverScene } from './scenes/game_over.js';
import { SettingsScene } from './scenes/settings.js'; // VolumeSettingsScene を SettingsScene に変更
import { ScoreManager } from './score_manager.js';
import { InputHandler } from './input_handler.js';
import { soundPlayer } from '../soundPlayer.js';

const SCENE_BGM_MAP = {
    [SCENE.MAIN]: 'home_bgm',
    [SCENE.INSTRUMENT_SELECT]: 'home_bgm',
    [SCENE.RANKING]: 'home_bgm',
    [SCENE.GAME_DESCRIPTION]: 'home_bgm',
    [SCENE.SETTINGS]: 'home_bgm', // VOLUME_SETTINGS を SETTINGS に変更
    [SCENE.GAME]: 'game_bgm',
    [SCENE.GAME_OVER]: 'gameover_bgm',
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.baseWidth = 1920;
        this.baseHeight = 1080;
        this.scale = 1;
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;

        this.scenes = {};
        this.currentScene = null;
        this.mouse = { x: 0, y: 0, clicked: false };
        this.isGameActive = false;

        this.scoreManager = new ScoreManager();
        this.selectedInstrument = null;
        this.inputMethod = 'keyboard'; // 追加

        this.loadSettings(); // 追加

        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        this.init();
        this.setupMouseHandlers();
    }

    // 追加: 設定の読み込み
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('okerun-settings'));
            if (settings) {
                this.inputMethod = settings.inputMethod || 'keyboard';
                soundPlayer.setBgmVolume(settings.bgmVolume !== undefined ? settings.bgmVolume : 0.5);
                soundPlayer.setInstrumentVolume(settings.instrumentVolume !== undefined ? settings.instrumentVolume : 1.0);
                soundPlayer.setGameSoundVolume(settings.gameSoundVolume !== undefined ? settings.gameSoundVolume : 0.7);
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
            this.inputMethod = 'keyboard';
        }
    }

    // 追加: 設定の保存
    saveSettings() {
        try {
            const settings = {
                inputMethod: this.inputMethod,
                bgmVolume: soundPlayer.bgmVolume,
                instrumentVolume: soundPlayer.instrumentVolume,
                gameSoundVolume: soundPlayer.gameSoundVolume,
            };
            localStorage.setItem('okerun-settings', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    resizeCanvas() {
        const aspectRatio = this.baseWidth / this.baseHeight;
        let newWidth, newHeight;

        if (window.innerWidth / window.innerHeight > aspectRatio) {
            newHeight = window.innerHeight;
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = window.innerWidth;
            newHeight = newWidth / aspectRatio;
        }

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;

        this.scale = newWidth / this.baseWidth;

        if (this.currentScene && this.currentScene.onResize) {
            this.currentScene.onResize();
        }
    }

    getScaledMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    setupMouseHandlers() {
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getScaledMousePos(e);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
        });
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getScaledMousePos(e);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
            this.mouse.clicked = true;
        });
    }

    init() {
        this.inputHandler = new InputHandler(null, null);
        this.scenes[SCENE.MAIN] = new MainScene(this);
        this.scenes[SCENE.GAME_DESCRIPTION] = new GameDescriptionScene(this);
        this.scenes[SCENE.RANKING] = new RankingScene(this);
        this.scenes[SCENE.INSTRUMENT_SELECT] = new InstrumentSelectScene(this);
        this.scenes[SCENE.GAME_OVER] = new GameOverScene(this);
        this.scenes[SCENE.SETTINGS] = new SettingsScene(this); // VOLUME_SETTINGS を SETTINGS に変更
        
        this.changeScene(SCENE.MAIN);
        this.gameLoop();
    }

    changeScene(sceneName, data = {}) {
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }

        if (this.isGameActive) {
            const targetBGM = SCENE_BGM_MAP[sceneName];
            if (targetBGM) {
                soundPlayer.playBGM(targetBGM);
            } else {
                soundPlayer.stopBGM();
            }
        }

        if (sceneName === SCENE.GAME) {
            this.currentScene = new GameScene(this, this.selectedInstrument);
        } else {
            this.currentScene = this.scenes[sceneName];
        }

        if (this.currentScene.init) {
            this.currentScene.init(data);
        }
    }

    gameLoop() {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update();
        }
        if (this.currentScene && this.currentScene.draw) {
            this.currentScene.draw();
        }
        this.mouse.clicked = false;
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => new Game());