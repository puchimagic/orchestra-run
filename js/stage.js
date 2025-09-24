import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

// ステージ設定
const SCROLL_SPEED = 2;
const PLATFORM_COLOR = 'black';
const ENEMY_COLOR = 'red';
const PLATFORM_HEIGHT = 20;
const MIN_PLATFORM_WIDTH = 100;
const MAX_PLATFORM_WIDTH = 300;
const MIN_GAP = 80;
const MAX_GAP = 150;
const ENEMY_WIDTH = 25;
const ENEMY_HEIGHT = 40;

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = PLATFORM_COLOR;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = ENEMY_WIDTH;
        this.height = ENEMY_HEIGHT;
    }

    update() {
        // TODO: 敵の動き（例: 左右に往復）
    }

    draw(ctx, cameraX) {
        ctx.fillStyle = ENEMY_COLOR;
        ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
}

export class Stage {
    constructor(game) {
        this.game = game;
        this.cameraX = 0;
        this.platforms = [];
        this.enemies = [];
        this.lastPlatformX = 0;
    }

    init() {
        this.cameraX = 0;
        this.platforms = [];
        this.enemies = [];
        // 初期ステージを生成
        this.lastPlatformX = 0;
        this.createPlatform(0, CANVAS_HEIGHT - PLATFORM_HEIGHT, CANVAS_WIDTH + 50);
        while (this.lastPlatformX < CANVAS_WIDTH * 2) {
            this.generateNext();
        }
    }

    createPlatform(x, y, width) {
        const platform = new Platform(x, y, width);
        this.platforms.push(platform);
        this.lastPlatformX = x + width;
    }

    createEnemy(x, y) {
        const enemy = new Enemy(x, y);
        this.enemies.push(enemy);
    }

    generateNext() {
        const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        const width = MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH);
        const newX = this.lastPlatformX + gap;
        const newY = CANVAS_HEIGHT - PLATFORM_HEIGHT; // Y座標は固定

        this.createPlatform(newX, newY, width);

        // 確率で敵を配置
        if (Math.random() < 0.3) {
            this.createEnemy(newX + width / 2, newY - ENEMY_HEIGHT);
        }
    }

    update() {
        this.cameraX += SCROLL_SPEED;

        // 新しいステージ要素を生成
        if (this.lastPlatformX < this.cameraX + CANVAS_WIDTH + 200) {
            this.generateNext();
        }

        // 画面外の要素を削除
        this.platforms = this.platforms.filter(p => p.x + p.width > this.cameraX);
        this.enemies = this.enemies.filter(e => e.x + e.width > this.cameraX);

        this.enemies.forEach(enemy => enemy.update());
    }

    draw() {
        const ctx = this.game.ctx;
        this.platforms.forEach(p => p.draw(ctx, this.cameraX));
        this.enemies.forEach(e => e.draw(ctx, this.cameraX));
    }
}
