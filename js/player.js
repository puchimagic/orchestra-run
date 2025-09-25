import { BLOCK_SIZE } from './config.js';

const PLAYER_WIDTH_IN_BLOCKS = 2.5;
const PLAYER_HEIGHT_IN_BLOCKS = 2.5;
const PLAYER_COLOR = 'blue';
const MOVE_SPEED = 11;
const JUMP_POWER = 34;
const GRAVITY = 1.7;

export class Player {
    constructor(game, inputHandler, waitImage, jumpImage, walkImage) { // InputHandlerのインスタンスを受け取る
        this.game = game;
        this.input = inputHandler; // InputHandlerのインスタンスを保持
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

        this.isJumping = false;
        this.isMoving = false;
        this.facingDirection = 1; // 1 for right, -1 for left

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
        // コントローラーが接続されているか確認
        const isGamepadConnected = this.input.isGamepadConnected();

        if (isGamepadConnected) {
            // 左右移動 (ゲームパッド - プレイヤー1を想定しplayerIndex 0)
            const gamepadXAxis = this.input.getGamepadAxis(0, 0); // 左スティックのX軸
            if (gamepadXAxis !== 0) {
                this.vx = MOVE_SPEED * gamepadXAxis;
            } else {
                this.vx = 0;
            }

            // ジャンプ (ゲームパッド - プレイヤー1を想定しplayerIndex 0, ボタン3)
            if (this.input.isGamepadButtonPressed(0, 3) && this.onGround) { // ボタン3をジャンプに割り当て
                this.vy = -JUMP_POWER;
                this.onGround = false;
            }
        } else {
            // 左右移動 (キーボード)
            if (this.keys['KeyA']) {
                this.vx = -MOVE_SPEED;
            } else if (this.keys['KeyD']) {
                this.vx = MOVE_SPEED;
            } else {
                this.vx = 0;
            }

            // ジャンプ (キーボード)
            if (this.keys['Space'] && this.onGround) {
                this.vy = -JUMP_POWER;
                this.onGround = false;
            }
        }

        this.x += this.vx;

        if (this.vx > 0) {
            this.facingDirection = 1;
        } else if (this.vx < 0) {
            this.facingDirection = -1;
        }

        this.isMoving = this.vx !== 0;

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

        this.isJumping = !this.onGround;

        if (this.x < this.game.currentScene.stage.cameraX) {
            this.x = this.game.currentScene.stage.cameraX;
        }
    }

    draw(ctx) {
        let currentImage;
        if (this.isJumping) {
            currentImage = this.jumpImage;
        } else if (this.isMoving) {
            currentImage = this.walkImage;
        } else {
            currentImage = this.waitImage;
        }

        ctx.save();
        if (this.facingDirection === -1) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(currentImage, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}