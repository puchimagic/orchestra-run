import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, PLAYER_MAX_JUMP_IN_BLOCKS, INITIAL_SCROLL_SPEED } from './config.js';

const WALL_COLOR = '#555';

const MIN_PLATFORM_WIDTH_IN_BLOCKS = 5;
const MAX_PLATFORM_WIDTH_IN_BLOCKS = 15;
const MIN_GAP_IN_BLOCKS = 4;
const MAX_GAP_IN_BLOCKS = 40;

export class Wall {
    constructor(x, y, width, height, isBreakable = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isBreakable = isBreakable;
    }
    draw(ctx) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, moveRange, enemyImage) {
        this.x = x;
        this.y = y;
        this.width = BLOCK_SIZE * 1.5;
        this.height = BLOCK_SIZE * 1.5;
        this.vx = -2;
        this.minX = x - moveRange;
        this.maxX = x + moveRange;
        this.enemyImage = enemyImage;
    }
    update() {
        this.x += this.vx;
        if (this.x < this.minX || this.x > this.maxX) {
            this.vx *= -1;
        }
    }
    draw(ctx) {
        ctx.drawImage(this.enemyImage, this.x, this.y, this.width, this.height);
    }
}

class Platform {
    constructor(x, y, widthInBlocks, groundImage) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.widthInBlocks = widthInBlocks;
        this.groundImage = groundImage;
    }

    draw(ctx) {
        for (let i = 0; i < this.widthInBlocks; i++) {
            for (let j = 0; j < PLATFORM_HEIGHT_IN_BLOCKS; j++) {
                const blockX = this.x + i * BLOCK_SIZE;
                const blockY = this.y + j * BLOCK_SIZE;
                ctx.drawImage(this.groundImage, blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

export class Stage {
    constructor(game) {
        this.game = game;
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
        this.elapsedTimeInSeconds = 0; // 経過時間を保持
        this.groundImage = new Image();
        this.groundImage.src = 'https://github.com/puchimagic/oic_hack/blob/main/img/ground.png?raw=true';
        this.enemyImage = new Image();
        this.enemyImage.src = 'https://github.com/puchimagic/oic_hack/blob/main/img/teki.png?raw=true';
        this.playerWaitImage = new Image();
        this.playerWaitImage.src = 'https://github.com/puchimagic/oic_hack/blob/main/img/character_wait.png?raw=true';
        this.playerJumpImage = new Image();
        this.playerJumpImage.src = 'https://github.com/puchimagic/oic_hack/blob/main/img/character_jump.png?raw=true';
        this.playerWalkImage = new Image();
        this.playerWalkImage.src = 'https://github.com/puchimagic/oic_hack/blob/main/img/character_woke.png?raw=true';
    }

    init() {
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
        this.elapsedTimeInSeconds = 0;
        this.cameraX = 0;
        this.platforms = [];
        this.walls = [];
        this.enemies = [];
        this.lastPlatformX = -50;
        const initialPlatformWidth = Math.ceil(this.game.canvas.width / BLOCK_SIZE) + 2;
        this.createPlatform(this.lastPlatformX, this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE), initialPlatformWidth);
        
        while (this.lastPlatformX < this.cameraX + this.game.canvas.width * 2) {
            this.generateNext();
        }
    }

    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }

    createPlatform(x, y, widthInBlocks) {
        const platform = new Platform(x, y, widthInBlocks, this.groundImage);
        this.platforms.push(platform);
        this.lastPlatformX = x + platform.width;

        // 8ブロックより大きい足場に障害物を生成
        if (widthInBlocks > 8 && Math.random() < 0.8) { // 80%の確率で何らかの障害物を生成
            const t = this.elapsedTimeInSeconds;
            const wallThreshold = 0.45; // 壁の出現確率は45%で固定
            // 敵の出現率は45%からスタートし、30秒ごとに約10%上昇(最大80%)
            const enemyChance = Math.min(0.8, 0.45 + (t / 150));
            
            const obstacleType = Math.random(); // 0-1の乱数

            if (obstacleType < wallThreshold) {
                const isHighWall = Math.random() < 0.5;
                const wallHeight = isHighWall ? BLOCK_SIZE * 6 : BLOCK_SIZE * 2.5;
                const wall = new Wall(x + platform.width / 2, y - wallHeight, BLOCK_SIZE, wallHeight, isHighWall);
                this.walls.push(wall);
                if (isHighWall) {
                    this.game.currentScene.requestWallBreakEvent(wall);
                }
            } else if (obstacleType < wallThreshold + enemyChance) {
                const enemy = new Enemy(x + platform.width / 2, y - BLOCK_SIZE * 1.5, platform.width / 4, this.enemyImage);
                this.enemies.push(enemy);
            }
        }
    }

    generateNext() {
        const t = this.elapsedTimeInSeconds;
        // 穴の最大幅を時間経過で狭くする (40 -> 8)
        const currentMaxGap = Math.max(PLAYER_MAX_JUMP_IN_BLOCKS, MAX_GAP_IN_BLOCKS - (t / 10));
        const gapInBlocks = MIN_GAP_IN_BLOCKS + Math.floor(Math.random() * (currentMaxGap - MIN_GAP_IN_BLOCKS + 1));
        
        const widthInBlocks = MIN_PLATFORM_WIDTH_IN_BLOCKS + Math.floor(Math.random() * (MAX_PLATFORM_WIDTH_IN_BLOCKS - MIN_PLATFORM_WIDTH_IN_BLOCKS + 1));
        
        const gapInPixels = gapInBlocks * BLOCK_SIZE;
        const newX = this.lastPlatformX + gapInPixels;
        const newY = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE);

        if (gapInBlocks > PLAYER_MAX_JUMP_IN_BLOCKS) {
            this.game.currentScene.requestScaffold(this.lastPlatformX, gapInPixels);
        }

        this.createPlatform(newX, newY, widthInBlocks);
    }

    update() {
        this.cameraX += this.scrollSpeed;

        if (this.lastPlatformX < this.cameraX + this.game.canvas.width + 200) {
            this.generateNext();
        }

        this.platforms = this.platforms.filter(p => p.x + p.width > this.cameraX);
        this.walls = this.walls.filter(w => w.x + w.width > this.cameraX);
        this.enemies = this.enemies.filter(e => e.x + e.width > this.cameraX);

        this.enemies.forEach(e => e.update());
    }

    draw(ctx) {
        this.platforms.forEach(p => p.draw(ctx));
        this.walls.forEach(w => w.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
    }
}