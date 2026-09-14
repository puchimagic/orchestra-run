import {
    SCENE, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS,
    KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG,
    INSTRUMENT_ICON_MAP,
    INITIAL_SCROLL_SPEED, SPEED_INCREASE_INTERVAL, PLAYER_MAX_JUMP_IN_BLOCKS
} from '../config.js';
import { Player } from '../player.js';
import { Stage, Tree } from '../stage.js';
import { ScaffoldBlock } from '../scaffold.js';
import { soundPlayer } from '../soundPlayer.js';
import { setSceneBackground } from '../ui/scene_utils.js';
import { InstrumentPlayer } from '../instrument_player.js';
import { GameHud } from '../ui/game_hud.js';

export class GameScene {
    constructor(game, selectedInstrument) {
        this.game = game;
        this.selectedInstrument = selectedInstrument;
        this.instrumentPlayer = new InstrumentPlayer();

        // 木の必要キー表示用のDOM要素を Tree -> <span> でひもづけて管理する
        this.treeKeyEls = new Map();
    }

    init(data) {
        this.instrumentName = data?.instrument || this.selectedInstrument || 'トライアングル';

        const useGamepadForScaffold = this.game.inputMethod === 'gamepad';

        const activeInstrumentConfig = useGamepadForScaffold ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;
        this.instrument = activeInstrumentConfig[this.instrumentName];

        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.baseScore = 0;
        this.score = 0;
        this.scoreMultiplier = this.instrument.multiplier;

        // --- DOM構築 ---
        const sceneEl = this.game.sceneElements[SCENE.GAME];
        sceneEl.innerHTML = '';
        setSceneBackground(sceneEl, 'assets/img/bg_game.png');

        // ワールドコンテナ（スクロールする領域）
        this.stage = new Stage(this.game, {
            onTreeSpawned: (tree) => this.requestTreeBreakEvent(tree),
            onGapCreated: (holeX, holeWidth) => this.requestScaffold(holeX, holeWidth),
        });
        this.stage.mount(sceneEl);

        this.scaffolds = [];
        this.breakableTrees = new Map();
        this.treeKeyEls.clear();

        // stage.init()内で足場生成・木の破壊イベントが同期的に発火し得るため、
        // requestScaffold/requestTreeBreakEventが参照するinstrumentPlayerを先に初期化しておく
        this.instrumentPlayer.init(this.instrumentName, this.instrument, useGamepadForScaffold);

        this.stage.init();

        this.player = new Player(this.game, this.game.playerInput);
        this.player.mount(this.stage.worldEl);
        this.player.init();

        // --- 画面固定UI（スクロールしない） ---
        this.hud = new GameHud(this.game, sceneEl);
        this.hud.setInstrumentIcon(INSTRUMENT_ICON_MAP[this.instrumentName] || '');

        // カウントダウンプロパティ
        this.isCountdown = true;
        this.countdownNumber = 3;
        this.countdownTimer = 0;

        // 連続入力を防ぐためのロックフラグ
        this.inputLocked = false;

        this.updateView();
    }

    requestScaffold(holeX, holeWidth) {
        const holeWidthInBlocks = holeWidth / BLOCK_SIZE;
        const numScaffolds = Math.ceil(holeWidthInBlocks / PLAYER_MAX_JUMP_IN_BLOCKS) - 1;
        if (numScaffolds <= 0) return;

        const scaffoldWidthInBlocks = 7;
        const totalScaffoldWidthInBlocks = numScaffolds * scaffoldWidthInBlocks;
        const totalGapWidthInBlocks = holeWidthInBlocks - totalScaffoldWidthInBlocks;
        const gapWidthInBlocks = totalGapWidthInBlocks / (numScaffolds + 1);
        let currentX = holeX;
        const scaffoldHeightInBlocks = 1;
        const scaffoldY = this.game.baseHeight - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;

        for (let i = 0; i < numScaffolds; i++) {
            currentX += gapWidthInBlocks * BLOCK_SIZE;
            let requiredKeys = this.instrumentPlayer.generateRequiredKeys();
            const scaffold = new ScaffoldBlock(currentX, scaffoldY, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys);
            scaffold.mount(this.stage.worldEl);
            this.scaffolds.push(scaffold);
            currentX += scaffoldWidthInBlocks * BLOCK_SIZE;
        }
    }

    requestTreeBreakEvent(tree) {
        const requiredKeys = this.instrumentPlayer.generateRequiredKeys();
        this.breakableTrees.set(tree, { requiredKeys });

        const keyText = requiredKeys.join(' + ');
        const el = document.createElement('div');
        el.className = 'tree-key-text';
        el.style.fontSize = `${BLOCK_SIZE}px`;
        el.textContent = keyText;
        this.stage.worldEl.appendChild(el);
        this.treeKeyEls.set(tree, el);
        this.updateTreeKeyPosition(tree, el);
    }

    updateTreeKeyPosition(tree, el) {
        el.style.transform = `translate(${tree.x + tree.width / 2}px, ${tree.y + tree.height / 2}px)`;
    }

    removeTreeKeyEl(tree) {
        const el = this.treeKeyEls.get(tree);
        if (el) {
            el.remove();
            this.treeKeyEls.delete(tree);
        }
    }

    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        if (this.isCountdown) {
            this.countdownTimer += deltaTime;
            if (this.countdownTimer >= 1) {
                this.countdownTimer = 0;
                this.countdownNumber--;
                if (this.countdownNumber < 0) {
                    this.isCountdown = false;
                    this.startTime = Date.now(); // カウントダウン後に開始時間をリセット
                    this.lastTime = this.startTime;
                }
            }
            this.updateView();
            return;
        }

        const elapsedTimeInSeconds = (now - this.startTime) / 1000;

        const scorePerSecond = 1;
        const timeBonus = 1 + (elapsedTimeInSeconds / 120);
        this.baseScore += scorePerSecond * timeBonus * deltaTime;
        this.score = Math.floor(this.baseScore * this.scoreMultiplier);

        const speedIncreaseAmount = 0.5;
        const newScrollSpeed = INITIAL_SCROLL_SPEED + Math.floor(elapsedTimeInSeconds / SPEED_INCREASE_INTERVAL) * speedIncreaseAmount;
        this.stage.setScrollSpeed(newScrollSpeed);

        this.stage.elapsedTimeInSeconds = elapsedTimeInSeconds; // 経過時間をStageに渡す
        this.stage.update(deltaTime);
        this.scaffolds.forEach(s => s.update());

        this.handleInstrumentInput();

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms, this.stage.trees, newScrollSpeed, this.stage.cameraX);

        const expiredScaffolds = this.scaffolds.filter(s => s.state === 'EXPIRED' || s.x + s.width <= this.stage.cameraX);
        expiredScaffolds.forEach(s => s.destroy());
        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        // 木の必要キー表示の位置を更新（画面外に流れた木のテキストも消す）
        this.breakableTrees.forEach((data, tree) => {
            const el = this.treeKeyEls.get(tree);
            if (el) this.updateTreeKeyPosition(tree, el);
        });

        this.checkGameOver();
        this.instrumentPlayer.clearPressedActions();

        this.updateView();
    }

    handleInstrumentInput() {
        // 1. 楽器キーが一つも押されていなければ、ロックを解除して処理を終了
        if (!this.instrumentPlayer.hasAnyKeyPressed()) {
            this.inputLocked = false;
            return;
        }

        // 2. 入力がロックされている場合は、処理を終了
        if (this.inputLocked) {
            return;
        }

        // 3. 操作対象のターゲットを決定
        const activeScaffolds = this.scaffolds.filter(s =>
            s.state === 'ACTIVE' &&
            s.x < this.stage.cameraX + this.game.baseWidth &&
            s.x + s.width > this.stage.cameraX
        );
        const activeTrees = Array.from(this.breakableTrees.keys()).filter(t =>
            t.x < this.stage.cameraX + this.game.baseWidth &&
            t.x + t.width > this.stage.cameraX
        );
        const allInteractiveObjects = [...activeScaffolds, ...activeTrees];

        if (allInteractiveObjects.length === 0) return;

        const target = allInteractiveObjects.reduce((prev, curr) => prev.x < curr.x ? prev : curr);

        // 4. キー入力がターゲットの要求と一致するかチェック
        const requiredKeys = (target instanceof ScaffoldBlock) ? target.requiredKeys : this.breakableTrees.get(target)?.requiredKeys;
        if (!requiredKeys) return;

        const isMatched = this.instrumentPlayer.isMatched(requiredKeys);

        // 5. 一致した場合、成功処理を行い、入力をロックする
        if (isMatched) {
            if (target instanceof ScaffoldBlock) {
                target.solidify();
                this.instrumentPlayer.playSuccessSound(requiredKeys, this.game.inputMethod === 'gamepad');
            }
            else if (target instanceof Tree) {
                this.stage.spawnFallingTreeAnimation(target);
                target.break();
                this.removeTreeKeyEl(target);
                this.breakableTrees.delete(target);
            }

            // 入力をロック
            this.inputLocked = true;
        }
    }

    checkGameOver() {
        if (this.player.isCrushed) {
            this.gameOver();
            return;
        }
        if (this.player.y > this.game.baseHeight) this.gameOver();
        if (this.player.x < this.stage.cameraX) this.gameOver();
        this.stage.enemies.forEach(enemy => {
            if (this.player.x < enemy.x + enemy.width && this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height && this.player.y + this.player.height > enemy.y) {
                this.gameOver();
            }
        });
    }

    gameOver() {
        soundPlayer.playGameSound("gameOver"); // ゲームオーバー音を再生
        // 木が倒れる音を停止
        if (soundPlayer.gameSounds.tree_fall) {
            soundPlayer.gameSounds.tree_fall.pause();
            soundPlayer.gameSounds.tree_fall.currentTime = 0;
        }

        this.player.destroy();
        this.instrumentPlayer.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.instrumentName });
    }

    updateView() {
        this.hud.updateScore(this.score);
        this.hud.updateCountdown(this.isCountdown, this.countdownNumber);
    }

    destroy() {
        const sceneEl = this.game.sceneElements[SCENE.GAME];
        sceneEl.innerHTML = '';
    }
}
