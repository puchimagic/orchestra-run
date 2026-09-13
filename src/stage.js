import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, PLAYER_MAX_JUMP_IN_BLOCKS, INITIAL_SCROLL_SPEED, STUMP_WIDTH_IN_BLOCKS } from './config.js';
import { soundPlayer } from './soundPlayer.js';

const STUMP_HEIGHT_IN_BLOCKS = 4.4;

const MIN_PLATFORM_WIDTH_IN_BLOCKS = 5;
const MAX_PLATFORM_WIDTH_IN_BLOCKS = 15;
const MIN_GAP_IN_BLOCKS = 4;
const MAX_GAP_IN_BLOCKS = 40;

const GROUND_IMG = 'assets/img/ground.png';
const ENEMY_IMG = 'assets/img/enemy.png';
const TREE_IMG = 'assets/img/tree.png';
const STUMP_IMG = 'assets/img/stump.png';
const TREE_FALL_IMAGES = [2, 3, 4].map(i => `assets/img/tree${i}.png`);

class TemporaryAnimation {
    constructor(x, y, width, height, images, speed, offsets = [], displayDuration = 0.3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.images = images;
        this.animationSpeed = speed;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.holdTimer = 0;
        this.displayDuration = displayDuration;
        this.done = false;
        this.offsets = offsets;

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.backgroundSize = '100% 100%';
        this.el.style.backgroundRepeat = 'no-repeat';
        this.currentSrc = null;
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    update(deltaTime) {
        if (this.done) return;

        if (this.animationFrame >= this.images.length - 1) {
            this.holdTimer += deltaTime;
            if (this.holdTimer >= this.displayDuration) this.done = true;
        } else {
            this.animationTimer += deltaTime;
            if (this.animationTimer > this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = Math.min(this.animationFrame + 1, this.images.length - 1);
            }
        }

        this.updateView();
    }

    updateView() {
        if (this.done) {
            this.el.style.display = 'none';
            return;
        }

        const frameImage = this.images[this.animationFrame];

        let drawX = this.x;
        let drawY = this.y;
        let drawWidth = this.width;
        let drawHeight = this.height;

        const stumpHeightPixels = BLOCK_SIZE * STUMP_HEIGHT_IN_BLOCKS;
        const stumpPivotX = this.x + this.width / 2;
        const stumpPivotY = this.y + this.height - stumpHeightPixels;

        let currentOffsetX = 0;
        let currentOffsetY = 0;

        // フレームごとのオフセットを適用 (BLOCK_SIZEの倍数で受け取り、ここでピクセルに変換)
        if (this.offsets[this.animationFrame]) {
            currentOffsetX = this.offsets[this.animationFrame][0] * BLOCK_SIZE; // BLOCK_SIZE乗算を追加
            currentOffsetY = this.offsets[this.animationFrame][1] * BLOCK_SIZE; // BLOCK_SIZE乗算を追加
        }

        if (this.animationFrame === 0) { // ki2 (初期の傾き)
            drawX = stumpPivotX - drawWidth / 2;
            drawY = stumpPivotY - drawHeight;
        } else if (this.animationFrame === 1) { // ki3 (さらに傾く)
            drawX = stumpPivotX - drawWidth / 2;
            drawY = stumpPivotY - drawHeight;
        } else if (this.animationFrame === 2) { // ki4 (倒れた丸太)
            const fallenLogVisualWidth = drawHeight * 0.9;
            const fallenLogVisualHeight = drawWidth * 0.8;
            const groundLevelY = this.y + this.height;

            drawX = stumpPivotX + currentOffsetX - fallenLogVisualWidth / 2;
            drawY = groundLevelY - fallenLogVisualHeight + currentOffsetY;
            drawWidth = fallenLogVisualWidth;
            drawHeight = fallenLogVisualHeight;

            this.applyFrame(frameImage, drawX, drawY, drawWidth, drawHeight);
            return;
        }

        this.applyFrame(frameImage, drawX + currentOffsetX, drawY + currentOffsetY, drawWidth, drawHeight);
    }

    applyFrame(frameImage, x, y, width, height) {
        this.el.style.display = 'block';
        if (frameImage !== this.currentSrc) {
            this.el.style.backgroundImage = `url('${frameImage}')`;
            this.currentSrc = frameImage;
        }
        this.el.style.width = `${width}px`;
        this.el.style.height = `${height}px`;
        this.el.style.transform = `translate(${x}px, ${y}px)`;
    }
}

export class Tree {
    constructor(x, y, width, height, image, isBreakable = false, stumpImage = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.isBreakable = isBreakable;
        this.stumpImage = stumpImage;

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.backgroundSize = '100% 100%';
        this.el.style.backgroundRepeat = 'no-repeat';
        this.currentSrc = null;
        this.updateView();
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    break() {
        if (!this.isBreakable) return;
        soundPlayer.playGameSound('tree_fall');
        const newHeight = BLOCK_SIZE * STUMP_HEIGHT_IN_BLOCKS;
        const newWidth = BLOCK_SIZE * STUMP_WIDTH_IN_BLOCKS;
        const centerX = this.x + this.width / 2;
        this.x = centerX - (newWidth / 2);
        this.y = this.y + this.height - newHeight;
        this.height = newHeight;
        this.width = newWidth;
        this.image = this.stumpImage;
        this.isBreakable = false;
        this.updateView();
    }

    updateView() {
        if (this.image !== this.currentSrc) {
            this.el.style.backgroundImage = `url('${this.image}')`;
            this.currentSrc = this.image;
        }
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
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

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.backgroundImage = `url('${this.enemyImage}')`;
        this.el.style.backgroundSize = '100% 100%';
        this.el.style.backgroundRepeat = 'no-repeat';
        this.updateView();
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    update() {
        this.x += this.vx;
        if (this.x < this.minX || this.x > this.maxX) {
            this.vx *= -1;
        }
        this.updateView();
    }

    updateView() {
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
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

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.backgroundImage = `url('${this.groundImage}')`;
        this.el.style.backgroundRepeat = 'repeat';
        this.el.style.backgroundSize = `${BLOCK_SIZE}px ${BLOCK_SIZE}px`;
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
}

export class Stage {
    constructor(game, { onTreeSpawned, onGapCreated } = {}) {
        this.game = game;
        this.onTreeSpawned = onTreeSpawned || (() => {});
        this.onGapCreated = onGapCreated || (() => {});

        this.worldEl = document.createElement('div');
        this.worldEl.style.position = 'absolute';
        this.worldEl.style.left = '0';
        this.worldEl.style.top = '0';
        this.worldEl.style.width = '0';
        this.worldEl.style.height = '0';

        this.scrollSpeed = INITIAL_SCROLL_SPEED;
        this.elapsedTimeInSeconds = 0;
        this.animations = [];
        this.groundImage = GROUND_IMG;
        this.enemyImage = ENEMY_IMG;
        this.treeImage = TREE_IMG;
        this.stumpImage = STUMP_IMG;
        this.treeFallImages = TREE_FALL_IMAGES;
    }

    mount(parentEl) {
        parentEl.appendChild(this.worldEl);
    }

    destroy() {
        if (this.worldEl.parentNode) this.worldEl.parentNode.removeChild(this.worldEl);
    }

    init() {
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
        this.elapsedTimeInSeconds = 0;
        this.cameraX = 0;
        this.platforms = [];
        this.trees = [];
        this.enemies = [];
        this.animations = [];
        this.lastPlatformX = -50;
        const initialPlatformWidth = Math.ceil(this.game.baseWidth / BLOCK_SIZE) + 2;
        this.createPlatform(this.lastPlatformX, this.game.baseHeight - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE), initialPlatformWidth);
        while (this.lastPlatformX < this.cameraX + this.game.baseWidth * 2) {
            this.generateNext();
        }
        this.updateScroll();
    }

    setScrollSpeed(speed) { this.scrollSpeed = speed; }

    spawnFallingTreeAnimation(originalTree) {
        // 各フレームのオフセットを [X方向のBLOCK_SIZE倍, Y方向のBLOCK_SIZE倍] で指定
        const offsets = [
            [4.5, 1.5], // フレーム0 (ki2.png) のオフセット (BLOCK_SIZEの倍数)
            [3.5, 1.7], // フレーム1 (ki3.png) のオフセット (BLOCK_SIZEの倍数)
            [5.0, 0.0]  // フレーム2 (ki4.png) のオフセット (BLOCK_SIZEの倍数)
        ];
        const animationDisplayDuration = 0.3; // ここで秒数を設定できるようにする
        const anim = new TemporaryAnimation(originalTree.x, originalTree.y, originalTree.width, originalTree.height, this.treeFallImages, 0.15, offsets, animationDisplayDuration);
        anim.mount(this.worldEl);
        anim.updateView();
        this.animations.push(anim);
    }

    createPlatform(x, y, widthInBlocks) {
        const platform = new Platform(x, y, widthInBlocks, this.groundImage);
        platform.mount(this.worldEl);
        this.platforms.push(platform);
        this.lastPlatformX = x + platform.width;

        if (widthInBlocks > 8 && Math.random() < 0.8) {
            const t = this.elapsedTimeInSeconds;
            const treeThreshold = 0.45;
            const enemyChance = Math.min(0.8, 0.45 + (t / 150));
            const obstacleType = Math.random();

            if (obstacleType < treeThreshold) {
                const isHighTree = Math.random() < 0.5;
                if (isHighTree) {
                    const treeHeight = BLOCK_SIZE * 11;
                    const aspectRatio = 0.8;
                    const treeWidth = treeHeight * aspectRatio;
                    const treeX = (x + platform.width / 2) - (treeWidth / 2);
                    const tree = new Tree(treeX, y - treeHeight, treeWidth, treeHeight, this.treeImage, true, this.stumpImage);
                    tree.mount(this.worldEl);
                    this.trees.push(tree);
                    this.onTreeSpawned(tree);
                } else {
                    const treeHeight = BLOCK_SIZE * STUMP_HEIGHT_IN_BLOCKS;
                    const treeWidth = BLOCK_SIZE * STUMP_WIDTH_IN_BLOCKS;
                    const treeX = (x + platform.width / 2) - (treeWidth / 2);
                    const tree = new Tree(treeX, y - treeHeight, treeWidth, treeHeight, this.stumpImage, false, this.stumpImage);
                    tree.mount(this.worldEl);
                    this.trees.push(tree);
                }
            } else if (obstacleType < treeThreshold + enemyChance) {
                const enemy = new Enemy(x + platform.width / 2, y - BLOCK_SIZE * 1.5, platform.width / 4, this.enemyImage);
                enemy.mount(this.worldEl);
                this.enemies.push(enemy);
            }
        }
    }

    generateNext() {
        const t = this.elapsedTimeInSeconds;
        const currentMaxGap = Math.max(PLAYER_MAX_JUMP_IN_BLOCKS, MAX_GAP_IN_BLOCKS - (t / 10));
        const gapInBlocks = MIN_GAP_IN_BLOCKS + Math.floor(Math.random() * (currentMaxGap - MIN_GAP_IN_BLOCKS + 1));
        const widthInBlocks = MIN_PLATFORM_WIDTH_IN_BLOCKS + Math.floor(Math.random() * (MAX_PLATFORM_WIDTH_IN_BLOCKS - MIN_PLATFORM_WIDTH_IN_BLOCKS + 1));
        const gapInPixels = gapInBlocks * BLOCK_SIZE;
        const newX = this.lastPlatformX + gapInPixels;
        const newY = this.game.baseHeight - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE);
        if (gapInBlocks > PLAYER_MAX_JUMP_IN_BLOCKS) {
            this.onGapCreated(this.lastPlatformX, gapInPixels);
        }
        this.createPlatform(newX, newY, widthInBlocks);
    }

    update(deltaTime) {
        this.cameraX += this.scrollSpeed;
        if (this.lastPlatformX < this.cameraX + this.game.baseWidth + 200) {
            this.generateNext();
        }

        const goneOutPlatforms = this.platforms.filter(p => p.x + p.width <= this.cameraX);
        goneOutPlatforms.forEach(p => p.destroy());
        this.platforms = this.platforms.filter(p => p.x + p.width > this.cameraX);

        const goneOutTrees = this.trees.filter(t => t.x + t.width <= this.cameraX);
        goneOutTrees.forEach(t => t.destroy());
        this.trees = this.trees.filter(t => t.x + t.width > this.cameraX);

        const goneOutEnemies = this.enemies.filter(e => e.x + e.width <= this.cameraX);
        goneOutEnemies.forEach(e => e.destroy());
        this.enemies = this.enemies.filter(e => e.x + e.width > this.cameraX);
        this.enemies.forEach(e => e.update());

        this.animations.forEach(a => a.update(deltaTime));
        const doneAnimations = this.animations.filter(a => a.done);
        doneAnimations.forEach(a => a.destroy());
        this.animations = this.animations.filter(a => !a.done);

        this.updateScroll();
    }

    updateScroll() {
        this.worldEl.style.transform = `translate(${-this.cameraX}px, 0)`;
    }
}
