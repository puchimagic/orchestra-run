import {
    SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS,
    KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG,
    INSTRUMENT_FOLDER_MAP, INSTRUMENT_ICON_MAP,
    INITIAL_SCROLL_SPEED, SPEED_INCREASE_INTERVAL, PLAYER_MAX_JUMP_IN_BLOCKS
} from '../config.js';
import { Player } from '../player.js';
import { Stage, Tree } from '../stage.js';
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';
import { SoundPool, soundPlayer } from '../soundPlayer.js';
import { setSceneBackground } from '../ui/scene_utils.js';

export class GameScene {
    constructor(game, selectedInstrument) {
        this.game = game;
        this.selectedInstrument = selectedInstrument;
        this.instrumentInput = new InputHandler();
        this.activeInstrumentConfig = null;

        // 選択した楽器の演奏音専用の音源プール（BGM/固定効果音を管理するsoundPlayerとは別物）
        this.instrumentSounds = new SoundPool();

        this.instrumentDirName = null;
        this.instrumentImageSrc = null;

        // 木の必要キー表示用のDOM要素を Tree -> <span> でひもづけて管理する
        this.treeKeyEls = new Map();
    }

    init(data) {
        this.instrumentName = data?.instrument || this.selectedInstrument || 'トライアングル';

        const useGamepadForScaffold = this.game.inputMethod === 'gamepad';
        this.instrumentInput.setInstrumentKeyMaps(
            KEYBOARD_INSTRUMENT_CONFIG,
            GAMEPAD_INSTRUMENT_CONFIG,
            useGamepadForScaffold
        );

        // activeInstrumentConfigも同様に固定
        this.activeInstrumentConfig = useGamepadForScaffold ? GAMEPAD_INSTRUMENT_CONFIG : KEYBOARD_INSTRUMENT_CONFIG;
        this.instrument = this.activeInstrumentConfig[this.instrumentName];

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

        this.stage.init();

        this.player = new Player(this.game, this.game.playerInput);
        this.player.mount(this.stage.worldEl);
        this.player.init();

        this.instrumentInput.init();

        // --- 画面固定UI（スクロールしない） ---
        this.scoreEl = document.createElement('div');
        this.scoreEl.style.position = 'absolute';
        this.scoreEl.style.left = '20px';
        this.scoreEl.style.top = '20px';
        this.scoreEl.style.color = 'black';
        this.scoreEl.style.fontFamily = FONT_FAMILY;
        this.scoreEl.style.fontSize = `${FONT_SIZE.MEDIUM}px`;
        sceneEl.appendChild(this.scoreEl);

        this.instrumentImageSrc = INSTRUMENT_ICON_MAP[this.instrumentName] || '';

        this.instrumentIconEl = document.createElement('img');
        this.instrumentIconEl.src = this.instrumentImageSrc;
        this.instrumentIconEl.style.position = 'absolute';
        this.instrumentIconEl.style.left = `${this.game.baseWidth - 100 - 40}px`;
        this.instrumentIconEl.style.top = '20px';
        this.instrumentIconEl.style.width = '140px';
        this.instrumentIconEl.style.height = '150px';
        sceneEl.appendChild(this.instrumentIconEl);

        // カウントダウン用オーバーレイ
        this.countdownOverlayEl = document.createElement('div');
        this.countdownOverlayEl.style.position = 'absolute';
        this.countdownOverlayEl.style.left = '0';
        this.countdownOverlayEl.style.top = '0';
        this.countdownOverlayEl.style.width = '100%';
        this.countdownOverlayEl.style.height = '100%';
        this.countdownOverlayEl.style.background = 'rgba(0, 0, 0, 0.5)';
        this.countdownOverlayEl.style.display = 'flex';
        this.countdownOverlayEl.style.alignItems = 'center';
        this.countdownOverlayEl.style.justifyContent = 'center';
        this.countdownOverlayEl.style.color = 'white';
        this.countdownOverlayEl.style.fontFamily = FONT_FAMILY;
        this.countdownOverlayEl.style.fontSize = '128px';
        sceneEl.appendChild(this.countdownOverlayEl);

        // カウントダウンプロパティ
        this.isCountdown = true;
        this.countdownNumber = 3;
        this.countdownTimer = 0;

        // 連続入力を防ぐためのロックフラグ
        this.inputLocked = false;

        this.loadInstrumentSounds();
        this.updateView();
    }

    // 楽器の音源をロードするメソッド
    loadInstrumentSounds() {
        const instrumentConfig = this.instrument;
        if (!instrumentConfig) {
            console.warn(`楽器設定が見つかりません: ${this.instrumentName}`);
            return;
        }

        this.instrumentDirName = INSTRUMENT_FOLDER_MAP[this.instrumentName];
        if (!this.instrumentDirName) {
            console.warn(`楽器のディレクトリ名が見つかりません: ${this.instrumentName}`);
            return;
        }

        const volumeMultiplier = instrumentConfig.volumeMultiplier || 1.0;

        if (this.instrumentName === 'ギター') {
            // ギターの場合、maxChordの数だけ音源をロード
            for (let i = 0; i < instrumentConfig.maxChord; i++) {
                const soundName = `${this.instrumentDirName}_track${i + 1}`;
                const soundPath = `assets/sound/${this.instrumentDirName}/track0${i + 1}.wav`;
                this.instrumentSounds.loadSound(soundName, soundPath, volumeMultiplier);
            }
        } else {
            // その他の楽器の場合 (既存のロジック)
            instrumentConfig.keys.forEach((key, index) => {
                const soundName = `${this.instrumentDirName}_track${index + 1}`;
                const soundPath = `assets/sound/${this.instrumentDirName}/track0${index + 1}.wav`;
                this.instrumentSounds.loadSound(soundName, soundPath, volumeMultiplier);
            });
        }
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
            let requiredKeys = this.generateRequiredKeys();
            const scaffold = new ScaffoldBlock(currentX, scaffoldY, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys);
            scaffold.mount(this.stage.worldEl);
            this.scaffolds.push(scaffold);
            currentX += scaffoldWidthInBlocks * BLOCK_SIZE;
        }
    }

    requestTreeBreakEvent(tree) {
        const requiredKeys = this.generateRequiredKeys();
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

    generateRequiredKeys() {
        const availableKeys = this.instrument.keys;
        let numKeysToPress;
        if (this.instrument.name === 'ギター') {
            // 2から5の範囲でランダムな数を生成
            numKeysToPress = 1 + Math.floor(Math.random() * 4); // 2, 3, 4, 5
        }
        else {
            numKeysToPress = 1;
        }
        const shuffledKeys = [...availableKeys].sort(() => 0.5 - Math.random());
        return shuffledKeys.slice(0, numKeysToPress);
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
        this.instrumentInput.clearPressedActions();

        this.updateView();
    }

    // 要求されたキー入力が過不足なく行われているかをチェックするヘルパーメソッド
    isChordPerfectlyMatched(requiredKeys) {
        const requiredPhysicalKeys = new Set(
            requiredKeys.map(key => this.instrumentInput.actionMap[`ACTION_${key}`]).filter(Boolean)
        );
        const instrumentPhysicalKeys = this.instrumentInput.getInstrumentPhysicalKeys();
        const pressedInstrumentKeys = new Set(
            [...this.instrumentInput.pressedKeys].filter(k => instrumentPhysicalKeys.has(k))
        );
        return pressedInstrumentKeys.size === requiredPhysicalKeys.size &&
               [...requiredPhysicalKeys].every(k => pressedInstrumentKeys.has(k));
    }

    handleInstrumentInput() {
        // 1. 楽器キーが何か押されているかをチェック
        const instrumentPhysicalKeys = this.instrumentInput.getInstrumentPhysicalKeys();
        const instrumentKeysPressed = Array.from(this.instrumentInput.pressedKeys).some(key => instrumentPhysicalKeys.has(key));

        // 2. 楽器キーが一つも押されていなければ、ロックを解除して処理を終了
        if (!instrumentKeysPressed) {
            this.inputLocked = false;
            return;
        }

        // 3. 入力がロックされている場合は、処理を終了
        if (this.inputLocked) {
            return;
        }

        // 4. 操作対象のターゲットを決定
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

        // 5. キー入力がターゲットの要求と一致するかチェック
        const requiredKeys = (target instanceof ScaffoldBlock) ? target.requiredKeys : this.breakableTrees.get(target)?.requiredKeys;
        if (!requiredKeys) return;

        const isMatched = this.isChordPerfectlyMatched(requiredKeys);

        // 6. 一致した場合、成功処理を行い、入力をロックする
        if (isMatched) {
            if (target instanceof ScaffoldBlock) {
                target.solidify();

                // ゲームパッド選択時は楽器音を鳴らさない
                if (this.game.inputMethod !== 'gamepad') {
                    if (this.instrumentName === 'ギター') {
                        const trackNumber = Math.floor(Math.random() * this.instrument.maxChord);
                        if (trackNumber >= 0 && trackNumber < this.instrument.maxChord) {
                            const soundName = `${this.instrumentDirName}_track${trackNumber + 1}`;
                            this.instrumentSounds.playSound(soundName);
                        }
                    } else {
                        // 押されたキーのインデックスに対応するトラックを再生（ピアノ含む全楽器共通）
                        requiredKeys.forEach(key => {
                            const keyIndex = this.instrument.keys.indexOf(key);
                            if (keyIndex !== -1) {
                                const soundName = `${this.instrumentDirName}_track${keyIndex + 1}`;
                                this.instrumentSounds.playSound(soundName);
                            }
                        });
                    }
                }
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
        this.instrumentInput.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.instrumentName });
    }

    updateView() {
        this.scoreEl.textContent = `スコア: ${this.score}`;

        if (this.isCountdown) {
            this.countdownOverlayEl.style.display = 'flex';
            if (this.countdownNumber > 0) {
                this.countdownOverlayEl.textContent = this.countdownNumber;
            } else if (this.countdownNumber === 0) {
                this.countdownOverlayEl.textContent = 'Start!';
            } else {
                this.countdownOverlayEl.textContent = '';
            }
        } else {
            this.countdownOverlayEl.style.display = 'none';
        }
    }

    destroy() {
        const sceneEl = this.game.sceneElements[SCENE.GAME];
        sceneEl.innerHTML = '';
    }
}
