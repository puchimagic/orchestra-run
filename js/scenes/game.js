import { SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, INSTRUMENT_CONFIG, INITIAL_SCROLL_SPEED } from '../config.js';
import { Player } from '../player.js';
import { Stage } from '../stage.js';
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.player2Input = new InputHandler();
    }

    init(data) {
        this.instrumentName = data.instrument || 'トライアングル';
        this.instrument = INSTRUMENT_CONFIG[this.instrumentName];

        const keyMap = {};
        this.instrument.keys.forEach(key => {
            keyMap[`Key${key}`] = `ACTION_${key}`;
        });
        this.player2Input.setKeyMap(keyMap);

        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.baseScore = 0;
        this.score = 0;
        this.scoreMultiplier = this.instrument.multiplier;

        this.player = new Player(this.game);
        this.stage = new Stage(this.game);
        this.scaffolds = [];

        this.player.init();
        this.stage.init();
        this.player2Input.init();
    }

    requestScaffold(holeX, holeWidth) {
        let requiredKeys = [];
        const availableKeys = this.instrument.keys;
        const numKeysToPress = (this.instrument.name === 'ギター') 
            ? 1 + Math.floor(Math.random() * this.instrument.maxChord)
            : 1;
        const shuffledKeys = [...availableKeys].sort(() => 0.5 - Math.random());
        requiredKeys = shuffledKeys.slice(0, numKeysToPress);

        const scaffoldWidthInBlocks = 7;
        const scaffoldHeightInBlocks = 1;
        const x = holeX + (holeWidth - (scaffoldWidthInBlocks * BLOCK_SIZE)) / 2;
        const y = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;
        
        this.scaffolds.push(new ScaffoldBlock(x, y, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys));
    }

    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        const elapsedTimeInSeconds = (now - this.startTime) / 1000;

        // ★スコア計算を「1秒1点」基準に修正
        const scorePerSecond = 1; // 1秒あたり1点
        const timeBonus = 1 + (elapsedTimeInSeconds / 120); // 2分でスコア上昇率が2倍になる
        this.baseScore += scorePerSecond * timeBonus * deltaTime;
        this.score = Math.floor(this.baseScore * this.scoreMultiplier);

        const speedIncreaseInterval = 30;
        const speedIncreaseAmount = 0.5;
        const newScrollSpeed = INITIAL_SCROLL_SPEED + Math.floor(elapsedTimeInSeconds / speedIncreaseInterval) * speedIncreaseAmount;
        this.stage.setScrollSpeed(newScrollSpeed);

        this.stage.update();
        this.scaffolds.forEach(s => s.update());

        let targetScaffold = this.findTargetScaffold();

        if (targetScaffold) {
            const requiredActions = targetScaffold.requiredKeys.map(key => `ACTION_${key}`);
            const allAreDown = requiredActions.every(action => this.player2Input.isActionDown(action));
            const anyIsNew = requiredActions.some(action => this.player2Input.isActionPressed(action));

            if (allAreDown && anyIsNew) {
                targetScaffold.solidify();
            }
        }

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    findTargetScaffold() {
        const activeScaffoldsOnScreen = this.scaffolds.filter(s => 
            s.state === 'ACTIVE' &&
            s.x < this.stage.cameraX + this.game.canvas.width &&
            s.x + s.width > this.stage.cameraX
        );
        if (activeScaffoldsOnScreen.length === 0) return null;
        return activeScaffoldsOnScreen.reduce((prev, curr) => prev.x < curr.x ? prev : curr);
    }

    checkGameOver() {
        if (this.player.y > this.game.canvas.height) this.gameOver();
        if (this.player.x < this.stage.cameraX) this.gameOver();
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

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);
        ctx.fillText(`楽器: ${this.instrumentName}`, 20, 100);
    }
}