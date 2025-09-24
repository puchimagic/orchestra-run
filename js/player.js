import { BLOCK_SIZE } from './config.js';

const PLAYER_WIDTH_IN_BLOCKS = 1.5;
const PLAYER_HEIGHT_IN_BLOCKS = 2.5;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 11;
const JUMP_POWER = 34;
const GRAVITY = 1.7;

export class Player {
    constructor(game) {
        this.game = game;
        this.width = PLAYER_WIDTH_IN_BLOCKS * BLOCK_SIZE;
        this.height = PLAYER_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.x = 50;
        this.y = this.game.canvas.height - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;

        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init() {
        this.x = 50;
        this.y = this.game.canvas.height - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    update(platforms, walls) {
        // 左右移動
        if (this.keys['KeyA']) {
            this.vx = -MOVE_SPEED;
        } else if (this.keys['KeyD']) {
            this.vx = MOVE_SPEED;
        } else {
            this.vx = 0;
        }
        this.x += this.vx;

        // 壁との衝突判定 (横)
        walls.forEach(wall => {
            if (this.x < wall.x + wall.width && this.x + this.width > wall.x &&
                this.y < wall.y + wall.height && this.y + this.height > wall.y) {
                if (this.vx > 0) { 
                    this.x = wall.x - this.width;
                } else if (this.vx < 0) { 
                    this.x = wall.x + wall.width;
                }
            }
        });

        // 重力
        this.vy += GRAVITY;
        this.y += this.vy;

        this.onGround = false;
        const allGrounds = [...platforms, ...walls];
        allGrounds.forEach(ground => {
            if (this.x < ground.x + ground.width &&
                this.x + this.width > ground.x &&
                this.y + this.height > ground.y &&
                // ★着地判定の条件を修正 (より寛容に)
                this.y + this.height < ground.y + ground.height &&
                this.vy >= 0) {
                this.y = ground.y - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        });

        if (this.keys['Space'] && this.onGround) {
            this.vy = -JUMP_POWER;
            this.onGround = false;
        }

        if (this.x < this.game.currentScene.stage.cameraX) {
            this.x = this.game.currentScene.stage.cameraX;
        }
    }

    draw(ctx) {
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}