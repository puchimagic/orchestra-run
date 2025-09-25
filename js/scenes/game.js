import { 
    SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, 
    KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, 
    INITIAL_SCROLL_SPEED, PLAYER_MAX_JUMP_IN_BLOCKS 
} from '../config.js';
import { Player } from '../player.js';
import { Stage, Wall } from '../stage.js'; 
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.playerInput = new InputHandler(); 
        this.player2Input = new InputHandler(); 
        this.activeInstrumentConfig = null; 

        // 背景画像を読み込む
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/mein.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/mein.png');
        };

        // 楽器アイコン画像用
        this.instrumentImage = null;
        this.isInstrumentLoaded = false;
    }

    init(data) {
        this.instrumentName = data.instrument || 'トライアングル';
        this.player2Input.setInstrumentKeyMaps(KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG);

        const isGamepadConnected = this.player2Input.isGamepadConnected();
        this.activeInstrumentConfig = isGamepadConnected ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;
        this.instrument = this.activeInstrumentConfig[this.instrumentName];

        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.baseScore = 0;
        this.score = 0;
        this.scoreMultiplier = this.instrument.multiplier;

        this.stage = new Stage(this.game);
        this.scaffolds = [];
        this.breakableWalls = new Map();

        this.stage.init();
        this.player = new Player(
            this.game, 
            this.playerInput, 
            this.stage.playerWaitImage, 
            this.stage.playerJumpImage, 
            this.stage.playerWalkImage
        );
        this.player.init();
        this.player2Input.init();

        // 楽器名ごとに対応する画像URLをマッピング
        const instrumentImageMap = {
            "トライアングル": "https://github.com/puchimagic/oic_hack/blob/main/img/%E3%83%88%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%82%B0%E3%83%AB.png?raw=true",
            "タンバリン": "https://github.com/puchimagic/oic_hack/blob/main/img/%E3%82%BF%E3%83%B3%E3%83%90%E3%83%AA%E3%83%B3.png?raw=true",
            "太鼓": "https://github.com/puchimagic/oic_hack/blob/main/img/%E5%A4%AA%E9%BC%93.png?raw=true",
            "ドラム": "https://github.com/puchimagic/oic_hack/blob/main/img/%E3%83%89%E3%83%A9%E3%83%A0.png?raw=true",
            "ピアノ": "https://github.com/puchimagic/oic_hack/blob/main/img/%E3%83%94%E3%82%A2%E3%83%8E.png?raw=true",
            "ギター": "https://github.com/puchimagic/oic_hack/blob/main/img/%E3%82%AE%E3%82%BF%E3%83%BC.png?raw=true"
        };

        // 楽器アイコンをロード
        this.instrumentImage = new Image();
        this.instrumentImage.src = instrumentImageMap[this.instrumentName] || "";
        this.instrumentImage.onload = () => {
            this.isInstrumentLoaded = true;
        };
        this.instrumentImage.onerror = () => {
            console.error(`Failed to load instrument image for: ${this.instrumentName}`);
        };
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
        const availableKeys = this.instrument.keys;
        const numKeysToPress = (this.instrument.name === 'ギター') 
            ? 1 + Math.floor(Math.random() * this.instrument.maxChord)
            : 1;
        const shuffledKeys = [...availableKeys].sort(() => 0.5 - Math.random());
        return shuffledKeys.slice(0, numKeysToPress);
    }

    update() {
        const isGamepadConnected = this.player2Input.isGamepadConnected();
        const currentInputConfig = isGamepadConnected ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;

        if (this.activeInstrumentConfig !== currentInputConfig) {
            this.activeInstrumentConfig = currentInputConfig;
            this.instrument = this.activeInstrumentConfig[this.instrumentName];
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

        this.handlePlayer2Input();

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms, this.stage.walls);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    handlePlayer2Input() {
        const activeScaffolds = this.scaffolds.filter(s => 
            s.state === 'ACTIVE' && 
            s.x < this.stage.cameraX + this.game.canvas.width && 
            s.x + s.width > this.stage.cameraX
        );
        const activeWalls = Array.from(this.breakableWalls.keys()).filter(w => 
            w.x < this.stage.cameraX + this.game.canvas.width && 
            w.x + w.width > this.stage.cameraX
        );
        const allInteractiveObjects = [...activeScaffolds, ...activeWalls];

        if (allInteractiveObjects.length === 0) return;

        const target = allInteractiveObjects.reduce((prev, curr) => prev.x < curr.x ? prev : curr);

        if (target instanceof ScaffoldBlock) {
            const requiredActions = target.requiredKeys.map(key => `ACTION_${key}`);
            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                requiredActions.some(action => this.player2Input.isActionPressed(action))) {
                target.solidify();
            }
        } else if (target instanceof Wall) {
            const wallData = this.breakableWalls.get(target);
            const requiredActions = wallData.requiredKeys.map(key => `ACTION_${key}`);
            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                requiredActions.some(action => this.player2Input.isActionPressed(action))) {
                this.stage.walls = this.stage.walls.filter(w => w !== target);
                this.breakableWalls.delete(target);
            }
        }
    }

    checkGameOver() {
        if (this.player.isCrushed) {
            this.gameOver();
            return;
        }
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

        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        } else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#d0d0d0';
            ctx.fillRect(0, 0, width, height);
        }

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

        // 楽器アイコンを右上に描画
        if (this.isInstrumentLoaded) {
            const x = width - 100 - 10;
            const y = 10;
            ctx.drawImage(this.instrumentImage, x, y, 100, 110);
        }
    }
}
