import { SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, INSTRUMENT_CONFIG, INITIAL_SCROLL_SPEED, PLAYER_MAX_JUMP_IN_BLOCKS } from '../config.js';
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
        const holeWidthInBlocks = holeWidth / BLOCK_SIZE;
        
        // ★ご指摘に基づき、穴の長さごとに足場の数を明示的に決定するロジックに変更
        let numScaffolds = 0;
        if (holeWidthInBlocks > 32) { // 33ブロック以上
            numScaffolds = 4;
        } else if (holeWidthInBlocks > 24) { // 25〜32ブロック
            numScaffolds = 3;
        } else if (holeWidthInBlocks > 16) { // 17〜24ブロック
            numScaffolds = 2;
        } else if (holeWidthInBlocks > PLAYER_MAX_JUMP_IN_BLOCKS) { // 9〜16ブロック
            numScaffolds = 1;
        }

        if (numScaffolds <= 0) return;

        const spacing = holeWidth / (numScaffolds + 1);
        const scaffoldWidthInBlocks = 7;
        const scaffoldWidthInPixels = scaffoldWidthInBlocks * BLOCK_SIZE;

        for (let i = 0; i < numScaffolds; i++) {
            let requiredKeys = [];
            const availableKeys = this.instrument.keys;
            const numKeysToPress = (this.instrument.name === 'ギター') 
                ? 1 + Math.floor(Math.random() * this.instrument.maxChord)
                : 1;
            const shuffledKeys = [...availableKeys].sort(() => 0.5 - Math.random());
            requiredKeys = shuffledKeys.slice(0, numKeysToPress);

            const scaffoldX = holeX + (i + 1) * spacing - (scaffoldWidthInPixels / 2);
            const scaffoldHeightInBlocks = 1;
            const scaffoldY = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;
            
            this.scaffolds.push(new ScaffoldBlock(scaffoldX, scaffoldY, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys));
        }
    }

    update() {
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
        this.game.scoreManager.addScore(this.score, this.instrumentName); // ★スコアを記録
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