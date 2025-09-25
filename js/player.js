import { BLOCK_SIZE } from './config.js';

const PLAYER_WIDTH_IN_BLOCKS = 1.5;
const PLAYER_HEIGHT_IN_BLOCKS = 2.5;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 11;
const JUMP_POWER = 34;
const GRAVITY = 1.7;

export class Player {
    constructor(game, inputHandler) { // InputHandlerのインスタンスを受け取る
        this.game = game;
        this.input = inputHandler; // InputHandlerのインスタンスを保持
        this.width = PLAYER_WIDTH_IN_BLOCKS * BLOCK_SIZE;
        this.height = PLAYER_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.x = 50;
        this.y = this.game.canvas.height - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;

        this.keys = {}; // 既存のキーボード入力処理を残す
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
        // 左右移動 (キーボード)
        if (this.keys['KeyA']) {
            this.vx = -MOVE_SPEED;
        } else if (this.keys['KeyD']) {
            this.vx = MOVE_SPEED;
        } else {
            this.vx = 0;
        }

        // 左右移動 (ゲームパッド - プレイヤー1を想定しplayerIndex 0)
        const gamepadXAxis = this.input.getGamepadAxis(0, 0); // 左スティックのX軸
        if (gamepadXAxis !== 0) {
            this.vx = MOVE_SPEED * gamepadXAxis;
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

        // ジャンプ (キーボード)
        if (this.keys['Space'] && this.onGround) {
            this.vy = -JUMP_POWER;
            this.onGround = false;
        }

        // ジャンプ (ゲームパッド - プレイヤー1を想定しplayerIndex 0, ボタン3)
        if (this.input.isGamepadButtonPressed(0, 3) && this.onGround) { // ボタン3をジャンプに割り当て
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