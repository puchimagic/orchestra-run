import { SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, INITIAL_SCROLL_SPEED, PLAYER_MAX_JUMP_IN_BLOCKS } from '../config.js';
import { Player } from '../player.js';
import { Stage, Wall } from '../stage.js'; // ★Wallクラスをインポート
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.playerInput = new InputHandler(); // プレイヤー1用のInputHandler
        this.player2Input = new InputHandler(); // 足場・壁操作用のInputHandler
        this.activeInstrumentConfig = null; // To store the currently active instrument config (keyboard or gamepad)
    }

    init(data) {
        this.instrumentName = data.instrument || 'トライアングル';
        this.player2Input.setInstrumentKeyMaps(KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG);

        // Initialize activeInstrumentConfig based on current gamepad status
        const isGamepadConnected = this.player2Input.isGamepadConnected();
        this.activeInstrumentConfig = isGamepadConnected ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;
        this.instrument = this.activeInstrumentConfig[this.instrumentName];

        // The keyMap is now managed internally by player2Input, but we need to ensure
        // the initial instrument is correctly set for generateRequiredKeys
        // The actual keyMap for player2Input is set by setInstrumentKeyMaps

        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.baseScore = 0;
        this.score = 0;
        this.scoreMultiplier = this.instrument.multiplier;

        this.stage = new Stage(this.game);
        this.scaffolds = [];
        this.breakableWalls = new Map();

        this.stage.init();
        this.player = new Player(this.game, this.playerInput, this.stage.playerWaitImage, this.stage.playerJumpImage, this.stage.playerWalkImage);
        this.player.init();
        this.player2Input.init();
    }

    requestScaffold(holeX, holeWidth) {
        const holeWidthInBlocks = holeWidth / BLOCK_SIZE;
        const numScaffolds = Math.ceil(holeWidthInBlocks / PLAYER_MAX_JUMP_IN_BLOCKS) - 1;
        if (numScaffolds <= 0) return;

        const scaffoldWidthInBlocks = 7;
        const totalScaffoldWidthInBlocks = numScaffolds * scaffoldWidthInBlocks;
        const totalGapWidthInBlocks = holeWidthInBlocks - totalScaffoldWidthInBlocks;
        const gapWidthInBlocks = totalGapWidthInBlocks / (numScaffolds + 1);
        let currentX = holeX;
        const scaffoldHeightInBlocks = 1;
        const scaffoldY = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;

        for (let i = 0; i < numScaffolds; i++) {
            currentX += gapWidthInBlocks * BLOCK_SIZE;
            let requiredKeys = this.generateRequiredKeys();
            this.scaffolds.push(new ScaffoldBlock(currentX, scaffoldY, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys));
            currentX += scaffoldWidthInBlocks * BLOCK_SIZE;
        }
    }

    requestWallBreakEvent(wall) {
        const requiredKeys = this.generateRequiredKeys();
        this.breakableWalls.set(wall, { requiredKeys });
    }

    generateRequiredKeys() {
        let requiredKeys = [];
        const availableKeys = this.instrument.keys;
        const numKeysToPress = (this.instrument.name === 'ギター') 
            ? 1 + Math.floor(Math.random() * this.instrument.maxChord)
            : 1;
        const shuffledKeys = [...availableKeys].sort(() => 0.5 - Math.random());
        return shuffledKeys.slice(0, numKeysToPress);
    }

    update() {
        // Check if the active instrument config needs to be updated (due to gamepad connection change)
        const isGamepadConnected = this.player2Input.isGamepadConnected();
        const currentInputConfig = isGamepadConnected ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;

        if (this.activeInstrumentConfig !== currentInputConfig) {
            this.activeInstrumentConfig = currentInputConfig;
            this.instrument = this.activeInstrumentConfig[this.instrumentName];
            // player2Input's internal keyMap is already updated by its own updateGamepads/pollGamepads
            // We just need to ensure this.instrument reflects the current config for generateRequiredKeys
        }

        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        const elapsedTimeInSeconds = (now - this.startTime) / 1000;
        const scorePerSecond = 1;
        const timeBonus = 1 + (elapsedTimeInSeconds / 120);
        this.baseScore += scorePerSecond * timeBonus * deltaTime;
        this.score = Math.floor(this.baseScore * this.scoreMultiplier);
        const speedIncreaseInterval = 30;
        const speedIncreaseAmount = 0.5;
        const newScrollSpeed = INITIAL_SCROLL_SPEED + Math.floor(elapsedTimeInSeconds / speedIncreaseInterval) * speedIncreaseAmount;
        this.stage.setScrollSpeed(newScrollSpeed);

        this.stage.update();
        this.scaffolds.forEach(s => s.update());

        // ★入力処理を単一ターゲット方式に修正
        this.handlePlayer2Input();

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms, this.stage.walls);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    handlePlayer2Input() {
        // 画面上の全インタラクティブオブジェクトをリストアップ
        const activeScaffolds = this.scaffolds.filter(s => s.state === 'ACTIVE' && s.x < this.stage.cameraX + this.game.canvas.width && s.x + s.width > this.stage.cameraX);
        const activeWalls = Array.from(this.breakableWalls.keys()).filter(w => w.x < this.stage.cameraX + this.game.canvas.width && w.x + w.width > this.stage.cameraX);
        const allInteractiveObjects = [...activeScaffolds, ...activeWalls];

        if (allInteractiveObjects.length === 0) return;

        // 一番手前のターゲットを一つだけ選ぶ
        const target = allInteractiveObjects.reduce((prev, curr) => prev.x < curr.x ? prev : curr);

        // ターゲットの種類に応じて入力処理
        if (target instanceof ScaffoldBlock) {
            const requiredActions = target.requiredKeys.map(key => `ACTION_${key}`);
            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && requiredActions.some(action => this.player2Input.isActionPressed(action))) {
                target.solidify();
            }
        } else if (target instanceof Wall) {
            const wallData = this.breakableWalls.get(target);
            const requiredActions = wallData.requiredKeys.map(key => `ACTION_${key}`);
            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && requiredActions.some(action => this.player2Input.isActionPressed(action))) {
                this.stage.walls = this.stage.walls.filter(w => w !== target);
                this.breakableWalls.delete(target);
            }
        }
    }

    checkGameOver() {
        if (this.player.y > this.game.canvas.height) this.gameOver();
        if (this.player.x < this.stage.cameraX) this.gameOver();
        this.stage.enemies.forEach(enemy => {
            if (this.player.x < enemy.x + enemy.width && this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height && this.player.y + this.player.height > enemy.y) {
                this.gameOver();
            }
        });
    }

    gameOver() {
        this.player.destroy();
        this.player2Input.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.instrumentName });
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(-this.stage.cameraX, 0);

        this.stage.draw(ctx);
        this.player.draw(ctx);
        this.scaffolds.forEach(s => s.draw(ctx));

        this.breakableWalls.forEach((data, wall) => {
            const keyText = data.requiredKeys.join(' + ');
            ctx.fillStyle = '#f0ad4e';
            ctx.font = `${BLOCK_SIZE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(keyText, wall.x + wall.width / 2, wall.y + wall.height / 2);
        });

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);
        ctx.fillText(`楽器: ${this.instrumentName}`, 20, 100);
    }
}