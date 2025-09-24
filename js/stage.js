import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS } from './config.js';

// ★スクロール速度を調整
const SCROLL_SPEED = 5; // 3 -> 5
const PLATFORM_COLOR = 'black';

const MIN_PLATFORM_WIDTH_IN_BLOCKS = 5;
const MAX_PLATFORM_WIDTH_IN_BLOCKS = 15;
const MIN_GAP_IN_BLOCKS = 4;
const MAX_GAP_IN_BLOCKS = 25;

const PLAYER_MAX_JUMP_IN_BLOCKS = 8;

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
    }

    init() {
        this.cameraX = 0;
        this.platforms = [];
        this.lastPlatformX = -50;
        const initialPlatformWidth = Math.ceil(this.game.canvas.width / BLOCK_SIZE) + 2;
        this.createPlatform(this.lastPlatformX, this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE), initialPlatformWidth);
        
        while (this.lastPlatformX < this.cameraX + this.game.canvas.width * 2) {
            this.generateNext();
        }
    }

    createPlatform(x, y, widthInBlocks) {
        const platform = new Platform(x, y, widthInBlocks);
        this.platforms.push(platform);
        this.lastPlatformX = x + platform.width;
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
        this.cameraX += SCROLL_SPEED;

        if (this.lastPlatformX < this.cameraX + this.game.canvas.width + 200) {
            this.generateNext();
        }

        this.platforms = this.platforms.filter(p => p.x + p.width > this.cameraX);
    }

    draw(ctx) {
        this.platforms.forEach(p => p.draw(ctx));
    }
}