const PLAYER_WIDTH = 45;
const PLAYER_HEIGHT = 75;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 7;
const JUMP_POWER = 24;       // 22 -> 24 (ジャンプ力UP)
const GRAVITY = 1.2;

export class Player {
    constructor(game) {
        this.game = game;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = 50;
        this.y = this.game.canvas.height - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false; // 地面に足がついているか

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

    update(platforms) {
        // 左右移動
        if (this.keys['KeyA']) {
            this.vx = -MOVE_SPEED;
        } else if (this.keys['KeyD']) {
            this.vx = MOVE_SPEED;
        } else {
            this.vx = 0;
        }
        this.x += this.vx;

        // 重力
        this.vy += GRAVITY;
        this.y += this.vy;

        // ★接地判定の修正
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height + 20 &&
                this.vy >= 0) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        });

        // ★ジャンプ条件の修正
        if (this.keys['KeyS'] && this.onGround) {
            this.vy = -JUMP_POWER;
            this.onGround = false;
        }

        // 画面左端の制限 (カメラ位置を考慮)
        if (this.x < this.game.currentScene.stage.cameraX) {
            this.x = this.game.currentScene.stage.cameraX;
        }
    }

    draw(ctx) {
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}