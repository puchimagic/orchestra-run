import { SCENE } from './config.js';
import { MainScene } from './scenes/main.js';
import { GameDescriptionScene } from './scenes/game_description.js';
import { RankingScene } from './scenes/ranking.js';
import { InstrumentSelectScene } from './scenes/instrument_select.js';
import { GameScene } from './scenes/game.js';
import { GameOverScene } from './scenes/game_over.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scenes = {};
        this.currentScene = null;
        this.mouse = { x: 0, y: 0, clicked: false };

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.init();
        this.setupMouseHandlers();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.currentScene && this.currentScene.draw) {
            this.currentScene.draw();
        }
    }

    setupMouseHandlers() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.clicked = true;
        });
    }

    init() {
        this.scenes[SCENE.MAIN] = new MainScene(this);
        this.scenes[SCENE.GAME_DESCRIPTION] = new GameDescriptionScene(this);
        this.scenes[SCENE.RANKING] = new RankingScene(this);
        this.scenes[SCENE.INSTRUMENT_SELECT] = new InstrumentSelectScene(this);
        this.scenes[SCENE.GAME] = new GameScene(this);
        this.scenes[SCENE.GAME_OVER] = new GameOverScene(this);
        this.changeScene(SCENE.MAIN);
        this.gameLoop();
    }

    changeScene(sceneName, data = {}) {
        this.currentScene = this.scenes[sceneName];
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
