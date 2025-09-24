import { CANVAS_HEIGHT } from '../config.js';

// ゲーム設定
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 5;
const JUMP_POWER = 15;
const GRAVITY = 0.8;

export class Player {
    constructor(game) {
        this.game = game;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = 50;
        this.y = CANVAS_HEIGHT - this.height - 50; // 初期位置は地面から少し上
        this.vx = 0; // X方向の速度
        this.vy = 0; // Y方向の速度
        this.isJumping = false;

        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init() {
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

    update(platforms) {
        // 左右移動
        if (this.keys['ArrowLeft']) {
            this.vx = -MOVE_SPEED;
        } else if (this.keys['ArrowRight']) {
            this.vx = MOVE_SPEED;
        } else {
            this.vx = 0;
        }
        this.x += this.vx;

        // ジャンプ
        if (this.keys['Space'] && !this.isJumping) {
            this.vy = -JUMP_POWER;
            this.isJumping = true;
        }

        // 重力
        this.vy += GRAVITY;
        this.y += this.vy;

        // 地面との衝突判定
        let onGround = false;
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height + 10 && // 少し下にめり込んでもOK
                this.vy >= 0) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.isJumping = false;
                onGround = true;
            }
        });

        // 画面端の制限
        if (this.x < 0) {
            this.x = 0;
        }
        // 右端はカメラに依存するのでここでは制限しない
    }

    draw() {
        this.game.ctx.fillStyle = PLAYER_COLOR;
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
