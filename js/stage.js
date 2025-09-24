import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, PLAYER_MAX_JUMP_IN_BLOCKS, INITIAL_SCROLL_SPEED } from './config.js';

const PLATFORM_COLOR = 'black';
const WALL_COLOR = '#555';
const ENEMY_COLOR = '#c00';

const MIN_PLATFORM_WIDTH_IN_BLOCKS = 5;
const MAX_PLATFORM_WIDTH_IN_BLOCKS = 15;
const MIN_GAP_IN_BLOCKS = 4;
const MAX_GAP_IN_BLOCKS = 40;

// ★Wallクラスをエクスポート
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
    constructor(x, y, moveRange) {
        this.x = x;
        this.y = y;
        this.width = BLOCK_SIZE * 1.5;
        this.height = BLOCK_SIZE * 1.5;
        this.vx = -2;
        this.minX = x - moveRange;
        this.maxX = x + moveRange;
    }
    update() {
        this.x += this.vx;
        if (this.x < this.minX || this.x > this.maxX) {
            this.vx *= -1;
        }
    }
    draw(ctx) {
        ctx.fillStyle = ENEMY_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Platform {
    constructor(x, y, widthInBlocks) {
        this.x = x;
        this.y = y;
        this.width = widthInBlocks * BLOCK_SIZE;
        this.height = PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.widthInBlocks = widthInBlocks;
    }

    draw(ctx) {
        for (let i = 0; i < this.widthInBlocks; i++) {
            const blockX = this.x + i * BLOCK_SIZE;
            ctx.fillStyle = PLATFORM_COLOR;
            ctx.fillRect(blockX, this.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(blockX, this.y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
}

export class Stage {
    constructor(game) {
        this.game = game;
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
    }

    init() {
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
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
        const platform = new Platform(x, y, widthInBlocks);
        this.platforms.push(platform);
        this.lastPlatformX = x + platform.width;

        if (widthInBlocks > 8 && Math.random() < 0.7) {
            const obstacleType = Math.random();
            if (obstacleType < 0.4) {
                const isHighWall = Math.random() < 0.5;
                const wallHeight = isHighWall ? BLOCK_SIZE * 4 : BLOCK_SIZE * 2.5;
                const wall = new Wall(x + platform.width / 2, y - wallHeight, BLOCK_SIZE, wallHeight, isHighWall);
                this.walls.push(wall);
                if (isHighWall) {
                    this.game.currentScene.requestWallBreakEvent(wall);
                }
            } else if (obstacleType < 0.7) {
                const enemy = new Enemy(x + platform.width / 2, y - BLOCK_SIZE * 1.5, platform.width / 4);
                this.enemies.push(enemy);
            }
        }
    }

    generateNext() {
        const gapInBlocks = MIN_GAP_IN_BLOCKS + Math.floor(Math.random() * (MAX_GAP_IN_BLOCKS - MIN_GAP_IN_BLOCKS + 1));
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