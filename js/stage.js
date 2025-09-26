import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, PLAYER_MAX_JUMP_IN_BLOCKS, INITIAL_SCROLL_SPEED, STUMP_WIDTH_IN_BLOCKS } from './config.js';
import { soundPlayer } from '../../soundPlayer.js';

const STUMP_HEIGHT_IN_BLOCKS = 4.4;

const MIN_PLATFORM_WIDTH_IN_BLOCKS = 5;
const MAX_PLATFORM_WIDTH_IN_BLOCKS = 15;
const MIN_GAP_IN_BLOCKS = 4;
const MAX_GAP_IN_BLOCKS = 40;

class TemporaryAnimation {
    constructor(x, y, width, height, images, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.images = images;
        this.animationSpeed = speed;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.isFinished = false;
    }

    update(deltaTime) {
        this.animationTimer += deltaTime;
        if (this.animationTimer > this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            if (this.animationFrame >= this.images.length - 1) {
                this.animationFrame = this.images.length - 1; // Stay on the last frame
                this.isFinished = true; // Mark as finished
            }
        }
    }

    draw(ctx) {
        const frameImage = this.images[this.animationFrame];
        if (frameImage && frameImage.complete) {
            let drawX = this.x;
            let drawY = this.y;
            const drawWidth = this.width; // アニメーション生成時に渡された元の木の幅
            const drawHeight = this.height; // アニメーション生成時に渡された元の木の高さ

            // 切り株の上辺中央を起点として計算
            const stumpHeightPixels = BLOCK_SIZE * STUMP_HEIGHT_IN_BLOCKS;
            const stumpPivotX = this.x + this.width / 2; // 元の木の中心X座標
            const stumpPivotY = this.y + this.height - stumpHeightPixels; // 切り株の上辺Y座標

            let offsetX = 0;
            let offsetY = 0;

            if (this.animationFrame === 0) { // ki2 (初期の傾き)
                // 画像の描画開始位置を切り株のピボットに合わせる
                drawX = stumpPivotX - drawWidth / 2;
                drawY = stumpPivotY - drawHeight;

                // わずかに右下へ移動
                offsetX = BLOCK_SIZE * 0.2;
                offsetY = BLOCK_SIZE * 0.2;

            } else if (this.animationFrame === 1) { // ki3 (さらに傾く)
                // 画像の描画開始位置を切り株のピボットに合わせる
                drawX = stumpPivotX - drawWidth / 2;
                drawY = stumpPivotY - drawHeight;

                // さらに右下へ移動
                offsetX = BLOCK_SIZE * 0.8;
                offsetY = BLOCK_SIZE * 0.8;

            } else if (this.animationFrame === 2) { // ki4 (倒れた丸太)
                // ki4.pngは横倒しになっているため、元の木の高さが横幅、元の木の幅が高さになる
                const fallenLogVisualWidth = drawHeight * 0.9;
                const fallenLogVisualHeight = drawWidth * 0.8;

                // 地面に着地する位置を計算 (元の木の地面の高さ)
                const groundLevelY = this.y + this.height;

                // 最終的な右下への移動量
                offsetX = BLOCK_SIZE * 2.5;
                offsetY = BLOCK_SIZE * 2.5;

                // 描画位置を調整
                drawX = stumpPivotX + offsetX - fallenLogVisualWidth / 2;
                drawY = groundLevelY - fallenLogVisualHeight; // 地面に着地

                ctx.drawImage(frameImage, drawX, drawY, fallenLogVisualWidth, fallenLogVisualHeight);
                return; // このフレームは個別に描画したので、デフォルトの描画はスキップ
            }

            // フレーム0と1にオフセットを適用して描画
            ctx.drawImage(frameImage, drawX + offsetX, drawY + offsetY, drawWidth, drawHeight);
        }
    }
}

export class Wall {
    constructor(x, y, width, height, image, isBreakable = false, stumpImage = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.isBreakable = isBreakable;
        this.stumpImage = stumpImage;
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
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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
        this.elapsedTimeInSeconds = 0;
        this.animations = [];
        this.groundImage = new Image(); this.groundImage.src = 'img/ground.png';
        this.enemyImage = new Image(); this.enemyImage.src = 'img/teki.png';
        this.playerWaitImage = new Image(); this.playerWaitImage.src = 'img/character_wait.png';
        this.playerJumpImage = new Image(); this.playerJumpImage.src = 'img/character_jump.png';
        this.playerWalkImage = new Image(); this.playerWalkImage.src = 'img/character_woke.png';
        this.playerWalkImage2 = new Image(); this.playerWalkImage2.src = 'img/character_woke2.png';
        this.treeImage = new Image(); this.treeImage.src = 'img/ki.png';
        this.stumpImage = new Image(); this.stumpImage.src = 'img/kirikabu.png';
        this.treeFallImages = [];
        for (let i = 2; i <= 4; i++) {
            const img = new Image();
            img.src = `img/ki${i}.png`;
            this.treeFallImages.push(img);
        }
    }

    init() {
        this.scrollSpeed = INITIAL_SCROLL_SPEED;
        this.elapsedTimeInSeconds = 0;
        this.cameraX = 0;
        this.platforms = [];
        this.walls = [];
        this.enemies = [];
        this.animations = [];
        this.lastPlatformX = -50;
        const initialPlatformWidth = Math.ceil(this.game.canvas.width / BLOCK_SIZE) + 2;
        this.createPlatform(this.lastPlatformX, this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE), initialPlatformWidth);
        while (this.lastPlatformX < this.cameraX + this.game.canvas.width * 2) {
            this.generateNext();
        }
    }

    setScrollSpeed(speed) { this.scrollSpeed = speed; }

    spawnFallingTreeAnimation(originalWall) {
        const anim = new TemporaryAnimation(originalWall.x, originalWall.y, originalWall.width, originalWall.height, this.treeFallImages, 0.15);
        this.animations.push(anim);
    }

    createPlatform(x, y, widthInBlocks) {
        const platform = new Platform(x, y, widthInBlocks, this.groundImage);
        this.platforms.push(platform);
        this.lastPlatformX = x + platform.width;

        if (widthInBlocks > 8 && Math.random() < 0.8) {
            const t = this.elapsedTimeInSeconds;
            const wallThreshold = 0.45;
            const enemyChance = Math.min(0.8, 0.45 + (t / 150));
            const obstacleType = Math.random();

            if (obstacleType < wallThreshold) {
                const isHighWall = Math.random() < 0.5;
                if (isHighWall) {
                    const wallHeight = BLOCK_SIZE * 11;
                    const aspectRatio = 0.8;
                    const wallWidth = wallHeight * aspectRatio;
                    const wallX = (x + platform.width / 2) - (wallWidth / 2);
                    const wall = new Wall(wallX, y - wallHeight, wallWidth, wallHeight, this.treeImage, true, this.stumpImage);
                    this.walls.push(wall);
                    this.game.currentScene.requestWallBreakEvent(wall);
                } else {
                    const wallHeight = BLOCK_SIZE * STUMP_HEIGHT_IN_BLOCKS;
                    const wallWidth = BLOCK_SIZE * STUMP_WIDTH_IN_BLOCKS;
                    const wallX = (x + platform.width / 2) - (wallWidth / 2);
                    const wall = new Wall(wallX, y - wallHeight, wallWidth, wallHeight, this.stumpImage, false, this.stumpImage);
                    this.walls.push(wall);
                }
            } else if (obstacleType < wallThreshold + enemyChance) {
                const enemy = new Enemy(x + platform.width / 2, y - BLOCK_SIZE * 1.5, platform.width / 4, this.enemyImage);
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
        const newY = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE);
        if (gapInBlocks > PLAYER_MAX_JUMP_IN_BLOCKS) {
            this.game.currentScene.requestScaffold(this.lastPlatformX, gapInPixels);
        }
        this.createPlatform(newX, newY, widthInBlocks);
    }

    update(deltaTime) {
        this.cameraX += this.scrollSpeed;
        if (this.lastPlatformX < this.cameraX + this.game.canvas.width + 200) {
            this.generateNext();
        }
        this.platforms = this.platforms.filter(p => p.x + p.width > this.cameraX);
        this.walls = this.walls.filter(w => w.x + w.width > this.cameraX);
        this.enemies = this.enemies.filter(e => e.x + e.width > this.cameraX);
        this.enemies.forEach(e => e.update());

        this.animations.forEach(a => a.update(deltaTime));
        // this.animations = this.animations.filter(a => !a.isFinished); // Keep finished animations to display their last frame
    }

    draw(ctx) {
        this.platforms.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx)); // 敵は手前で良い
        
        // 倒れた木のアニメーションを先に描画する
        this.animations.forEach(a => a.draw(ctx));

        // その後に壁（切り株を含む）を描画する
        this.walls.forEach(w => w.draw(ctx));
    }
}
