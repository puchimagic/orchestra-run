import { SCENE } from './config.js';
import { TitleScene } from './scenes/title.js';
import { InstructionsScene } from './scenes/instructions.js';
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
        this.scenes[SCENE.TITLE] = new TitleScene(this);
        this.scenes[SCENE.INSTRUCTIONS] = new InstructionsScene(this);
        this.scenes[SCENE.INSTRUMENT_SELECT] = new InstrumentSelectScene(this);
        this.scenes[SCENE.GAME] = new GameScene(this);
        this.scenes[SCENE.GAME_OVER] = new GameOverScene(this);
        this.changeScene(SCENE.TITLE);
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
        // Reset click state
        this.mouse.clicked = false;
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => new Game());