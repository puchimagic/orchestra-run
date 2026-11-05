import { BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, PLAYER_INITIAL_SPEED, PLAYER_SPEED_INCREASE_RATE, INITIAL_SCROLL_SPEED } from './config.js';
import { soundPlayer } from "./soundPlayer.js";

const PLAYER_WIDTH_IN_BLOCKS = 2.0;
const PLAYER_HEIGHT_IN_BLOCKS = 2.5;
const JUMP_POWER = 34;
const GRAVITY = 1.7;

const WAIT_IMG = 'assets/img/character_wait.png';
const JUMP_IMG = 'assets/img/character_jump.png';
const WALK_IMG = 'assets/img/character_woke.png';
const WALK_IMG2 = 'assets/img/character_woke2.png';

export class Player {
    constructor(game, inputHandler) {
        this.game = game;
        this.input = inputHandler;
        this.width = PLAYER_WIDTH_IN_BLOCKS * BLOCK_SIZE;
        this.height = PLAYER_HEIGHT_IN_BLOCKS * BLOCK_SIZE;
        this.x = 50;
        this.y = this.game.baseHeight - this.height - 50;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.moveSpeed = PLAYER_INITIAL_SPEED;

        this.walkFrame = 0;
        this.walkAnimationSpeed = 10;

        this.isJumping = false;
        this.isMoving = false;
        this.facingDirection = 1;

        this.isCrushed = false;

        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.left = '0';
        this.el.style.top = '0';
        this.el.style.width = `${this.width}px`;
        this.el.style.height = `${this.height}px`;

        // background-imageの都度差し替えは、切り替え時にブラウザが
        // 一瞬デコードし直すことがあり歩行アニメーション中にキャラが
        // ちらつく原因になっていた。4枚の<img>を全部常時DOMに置いたまま
        // display切り替えだけで見た目を変える方式にして、デコードの
        // やり直しが起きないようにする。
        this.imageEls = {};
        [
            ['wait', WAIT_IMG], ['jump', JUMP_IMG], ['walk', WALK_IMG], ['walk2', WALK_IMG2],
        ].forEach(([key, src]) => {
            const img = document.createElement('img');
            img.src = src;
            img.style.position = 'absolute';
            img.style.left = '0';
            img.style.top = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.display = 'none';
            this.el.appendChild(img);
            this.imageEls[key] = img;
        });
        this.currentImageKey = null;
    }

    mount(parentEl) {
        parentEl.appendChild(this.el);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }

    init() {
        this.x = 50;
        this.y = this.game.baseHeight - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - this.height;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.isCrushed = false;
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.updateView();
    }

    handleKeyDown(e) { this.keys[e.code] = true; }
    handleKeyUp(e) { this.keys[e.code] = false; }

    update(platforms, trees, currentScrollSpeed, cameraX) {
        if (typeof currentScrollSpeed !== 'undefined') {
            const speedOffset = currentScrollSpeed - INITIAL_SCROLL_SPEED;
            this.moveSpeed = PLAYER_INITIAL_SPEED + (speedOffset * PLAYER_SPEED_INCREASE_RATE);
        }

        const useGamepadForPlayer = this.game.inputMethod === 'gamepad'; // 変更
        if (useGamepadForPlayer) {
            const gamepadXAxis = this.input.getGamepadAxis(0, 0);
            this.vx = gamepadXAxis !== 0 ? this.moveSpeed * gamepadXAxis : 0;
            if (this.input.isGamepadButtonPressed(0, 3) && this.onGround) {
                this.vy = -JUMP_POWER;
                this.onGround = false;
                soundPlayer.playGameSound("jump"); // 変更
            }
        }
        else {
            if (this.keys['KeyA']) this.vx = -this.moveSpeed;
            else if (this.keys['KeyD']) this.vx = this.moveSpeed;
            else this.vx = 0;
            if (this.keys['Space'] && this.onGround) {
                soundPlayer.playGameSound("jump");
                this.vy = -JUMP_POWER;
                this.onGround = false;
            }
        }

        // ステージ左端との衝突チェック
        if (this.x + this.vx < cameraX) {
            this.vx = 0; // 左端にいる場合は左への移動をキャンセル
            this.x = cameraX; // 左端に固定
        }

        // 木・切り株の当たり判定は、画像の見た目の形に合わせた長方形の集まり(Tree.getHitboxes)で行う
        const treeBoxes = trees.flatMap(tree => tree.getHitboxes());
        const overlapsX = (b) => this.x < b.x + b.width && this.x + this.width > b.x;
        const overlapsY = (b) => this.y < b.y + b.height && this.y + this.height > b.y;

        // 左右の移動: 木の形にめり込む手前でぴったり止める
        treeBoxes.forEach(b => {
            if (!overlapsY(b)) return;
            if (this.vx > 0 && this.x + this.width <= b.x && this.x + this.width + this.vx > b.x) {
                this.vx = b.x - (this.x + this.width);
            }
            if (this.vx < 0 && this.x >= b.x + b.width && this.x + this.vx < b.x + b.width) {
                this.vx = (b.x + b.width) - this.x;
            }
        });

        this.x += this.vx; // 調整されたvxでx座標を更新

        if (this.vx > 0) this.facingDirection = 1;
        else if (this.vx < 0) this.facingDirection = -1;
        this.isMoving = this.vx !== 0;

        // isCrushed の判定は、ステージ左端と右側の木に挟まれた場合にのみ行う
        const leftTreeCollision = this.x <= cameraX;
        const rightTreeCollision = treeBoxes.some(b => overlapsX(b) && overlapsY(b));

        if (leftTreeCollision && rightTreeCollision) {
            this.isCrushed = true;
            this.updateView();
            return;
        }

        const prevTop = this.y;
        const prevBottom = this.y + this.height;
        this.vy += GRAVITY;
        this.y += this.vy;
        this.onGround = false;
        platforms.forEach(ground => {
            if (this.x < ground.x + ground.width &&
                this.x + this.width > ground.x &&
                this.y + this.height > ground.y &&
                this.y + this.height < ground.y + ground.height &&
                this.vy >= 0) {
                this.y = ground.y - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        });

        // 木・切り株: 上から乗る（このフレームで上面を通り過ぎたもののうち一番高い面に着地）
        if (this.vy >= 0) {
            let landY = null;
            treeBoxes.forEach(b => {
                if (overlapsX(b) && prevBottom <= b.y + 0.01 && this.y + this.height >= b.y) {
                    if (landY === null || b.y < landY) landY = b.y;
                }
            });
            if (landY !== null) {
                this.y = landY - this.height;
                this.vy = 0;
                this.onGround = true;
            }
        } else {
            // 下からぶつかった場合（木の葉の下でジャンプした時など）は頭を止める
            let ceilY = null;
            treeBoxes.forEach(b => {
                const bottom = b.y + b.height;
                if (overlapsX(b) && prevTop >= bottom - 0.01 && this.y < bottom) {
                    if (ceilY === null || bottom > ceilY) ceilY = bottom;
                }
            });
            if (ceilY !== null) {
                this.y = ceilY;
                this.vy = 0;
            }
        }

        this.isJumping = !this.onGround;

        this.updateView();
    }

    updateView() {
        let currentKey;
        if (this.isJumping) {
            currentKey = 'jump';
        }
        else if (this.isMoving) {
            this.walkFrame++;
            currentKey = Math.floor(this.walkFrame / this.walkAnimationSpeed) % 2 === 0 ? 'walk' : 'walk2';
        }
        else {
            currentKey = 'wait';
            this.walkFrame = 0;
        }

        if (currentKey !== this.currentImageKey) {
            if (this.currentImageKey) this.imageEls[this.currentImageKey].style.display = 'none';
            this.imageEls[currentKey].style.display = 'block';
            this.currentImageKey = currentKey;
        }

        const flip = this.facingDirection === -1 ? ' scaleX(-1)' : '';
        this.el.style.transform = `translate(${this.x}px, ${this.y}px)${flip}`;
        this.el.style.transformOrigin = 'center';
    }
}
