const SCROLL_SPEED = 3;          // 2 -> 3
const PLATFORM_COLOR = 'black';
const PLATFORM_HEIGHT = 30;      // 20 -> 30
const MIN_PLATFORM_WIDTH = 150;  // 100 -> 150
const MAX_PLATFORM_WIDTH = 450;  // 300 -> 450
const MIN_GAP = 120;             // 80 -> 120
const MAX_GAP = 375;             // 250 -> 375

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = PLATFORM_HEIGHT;
    }

    draw(ctx) {
        ctx.fillStyle = PLATFORM_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
        this.createPlatform(this.lastPlatformX, this.game.canvas.height - PLATFORM_HEIGHT, this.game.canvas.width + 100);
        while (this.lastPlatformX < this.cameraX + this.game.canvas.width * 2) {
            this.generateNext();
        }
    }

    createPlatform(x, y, width) {
        const platform = new Platform(x, y, width);
        this.platforms.push(platform);
        this.lastPlatformX = x + width;
    }

    generateNext() {
        const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        const width = MIN_PLATFORM_WIDTH + Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH);
        const newX = this.lastPlatformX + gap;
        const newY = this.game.canvas.height - PLATFORM_HEIGHT;

        this.createPlatform(newX, newY, width);
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
