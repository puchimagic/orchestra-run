import { BLOCK_SIZE, STUMP_WIDTH_IN_BLOCKS, PLATFORM_HEIGHT_IN_BLOCKS } from './config.js'; // ★STUMP_WIDTH_IN_BLOCKSをインポート
import { soundPlayer } from "../soundPlayer.js";

const PLAYER_WIDTH_IN_BLOCKS = 2.0;
const PLAYER_HEIGHT_IN_BLOCKS = 2.5;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 11;
const JUMP_POWER = 34;
const GRAVITY = 1.7;

export class Player {
    constructor(game, inputHandler, waitImage, jumpImage, walkImage, walkImage2) {
        this.game = game;
        this.input = inputHandler;
        this.width = PLAYER_WIDTH_IN_BLOCKS * BLOCK_SIZE;
        this.height = PLAYER_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.x = 50;
        this.y = this.game.canvas.height - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;

        this.waitImage = waitImage;
        this.jumpImage = jumpImage;
        this.walkImage = walkImage;
        this.walkImage2 = walkImage2;
        this.walkFrame = 0;
        this.walkAnimationSpeed = 10;

        this.isJumping = false;
        this.isMoving = false;
        this.facingDirection = 1;

        this.isCrushed = false;

        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init() {
        this.x = 50;
        this.y = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - this.height;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.isCrushed = false;
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) { this.keys[e.code] = true; }
    handleKeyUp(e) { this.keys[e.code] = false; }

    update(platforms, walls) {
        const useGamepadForPlayer = this.game.isGamepadConnectedAtStart;
        if (useGamepadForPlayer) {
            const gamepadXAxis = this.input.getGamepadAxis(0, 0);
            this.vx = gamepadXAxis !== 0 ? MOVE_SPEED * gamepadXAxis : 0;
            if (this.input.isGamepadButtonPressed(0, 3) && this.onGround) {
                this.vy = -JUMP_POWER;
                this.onGround = false;
            }
        }
        else {
            if (this.keys['KeyA']) this.vx = -MOVE_SPEED;
            else if (this.keys['KeyD']) this.vx = MOVE_SPEED;
            else this.vx = 0;
            if (this.keys['Space'] && this.onGround) {
                soundPlayer.playGameSound("jump");
                this.vy = -JUMP_POWER;
                this.onGround = false;
            }
        }

        this.x += this.vx;

        if (this.vx > 0) this.facingDirection = 1;
        else if (this.vx < 0) this.facingDirection = -1;
        this.isMoving = this.vx !== 0;

        let isCollidingLeft = false;
        let isCollidingRight = false;

        if (this.x < this.game.currentScene.stage.cameraX) {
            isCollidingLeft = true;
        }

        walls.forEach(wall => {
            let cbox = { x: wall.x, width: wall.width };
            if (wall.isBreakable) { // ★木なら当たり判定を幹の幅に
                cbox.width = STUMP_WIDTH_IN_BLOCKS * BLOCK_SIZE;
                cbox.x = wall.x + (wall.width - cbox.width) / 2;
            }
            if (this.x < cbox.x + cbox.width && this.x + this.width > cbox.x &&
                this.y < wall.y + wall.height && this.y + this.height > wall.y) {
                if (this.vx >= 0) {
                    isCollidingRight = true;
                }
            }
        });

        if (isCollidingLeft && isCollidingRight) {
            this.isCrushed = true;
            return;
        }

        walls.forEach(wall => {
            let cbox = { x: wall.x, width: wall.width };
            if (wall.isBreakable) { // ★木なら当たり判定を幹の幅に
                cbox.width = STUMP_WIDTH_IN_BLOCKS * BLOCK_SIZE;
                cbox.x = wall.x + (wall.width - cbox.width) / 2;
            }
            if (this.x < cbox.x + cbox.width && this.x + this.width > cbox.x &&
                this.y < wall.y + wall.height && this.y + this.height > wall.y) {
                if (this.vx > 0) this.x = cbox.x - this.width;
                else if (this.vx < 0) this.x = cbox.x + cbox.width;
            }
        });

        if (this.x < this.game.currentScene.stage.cameraX) {
            this.x = this.game.currentScene.stage.cameraX;
        }

        this.vy += GRAVITY;
        this.y += this.vy;
        this.onGround = false;
        const allGrounds = [...platforms, ...walls];
        allGrounds.forEach(ground => {
            let cbox = { x: ground.x, width: ground.width };
            if (ground.isBreakable) { // ★木なら当たり判定を幹の幅に
                cbox.width = STUMP_WIDTH_IN_BLOCKS * BLOCK_SIZE;
                cbox.x = ground.x + (ground.width - cbox.width) / 2;
            }
            if (this.x < cbox.x + cbox.width &&
                this.x + this.width > cbox.x &&
                this.y + this.height > ground.y &&
                this.y + this.height < ground.y + ground.height &&
                this.vy >= 0) {
                this.y = ground.y - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        });

        this.isJumping = !this.onGround;
    }

    draw(ctx) {
        let currentImage;
        if (this.isJumping) {
            currentImage = this.jumpImage;
        }
        else if (this.isMoving) {
            this.walkFrame++;
            if (Math.floor(this.walkFrame / this.walkAnimationSpeed) % 2 === 0) {
                currentImage = this.walkImage;
            }
            else {
                currentImage = this.walkImage2;
            }
        }
        else {
            currentImage = this.waitImage;
            this.walkFrame = 0;
        }

        ctx.save();
        if (this.facingDirection === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(currentImage, 0, 0, this.width, this.height);
        }
        else {
            ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}