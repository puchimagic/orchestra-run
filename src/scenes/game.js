import { 
    SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, 
    KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, 
    INITIAL_SCROLL_SPEED, SPEED_INCREASE_INTERVAL, PLAYER_MAX_JUMP_IN_BLOCKS, 
    TREE_TEXT_COLOR, TREE_TEXT_STROKE_COLOR, TREE_TEXT_STROKE_WIDTH, 
    TREE_TEXT_BACKGROUND_COLOR, TREE_TEXT_BACKGROUND_PADDING 
} from '../config.js';
import { Player } from '../player.js';
import { Stage, Tree } from '../stage.js'; 
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';
import { SoundPlayer, soundPlayer } from '../soundPlayer.js';
import { loadImage, drawBackground } from '../ui/scene_utils.js';

export class GameScene {
    constructor(game, selectedInstrument) {
        this.game = game;
        this.selectedInstrument = selectedInstrument;
        this.player2Input = new InputHandler();
        this.activeInstrumentConfig = null;

        // SoundPlayerのインスタンスを生成
        this.instrumentSoundPlayer = new SoundPlayer();

        // 日本語の楽器名と英語のディレクトリ名のマッピングをプロパティとして保持
        this.instrumentDirMap = {
            "トライアングル": "triangle",
            "タンバリン": "tambourie",
            "太鼓": "taiko",
            "ドラム": "drum",
            "ピアノ": "piano",
            "ギター": "guitar"
        };
        this.instrumentDirName = null;

        this.backgroundImage = loadImage('assets/img/bg_game.png');
        this.instrumentImage = null;
    }

    init(data) {
        this.instrumentName = this.selectedInstrument || 'トライアングル';
        
        const useGamepadForScaffold = this.game.inputMethod === 'gamepad';
        this.player2Input.setInstrumentKeyMaps(
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

        this.stage = new Stage(this.game);
        this.scaffolds = [];
        this.breakableTrees = new Map();

        this.stage.init();
        this.player = new Player(
            this.game, 
            this.game.inputHandler, 
            this.stage.playerWaitImage, 
            this.stage.playerJumpImage, 
            this.stage.playerWalkImage,
            this.stage.playerWalkImage2
        );
        this.player.init();

        this.player2Input.init();

        // カウントダウンプロパティ
        this.isCountdown = true;
        this.countdownNumber = 3;
        this.countdownTimer = 0;

        // 連続入力を防ぐためのロックフラグ
        this.inputLocked = false;

        // 楽器名ごとに対応する画像URLをマッピング
        const instrumentImageMap = {
            "トライアングル": "assets/img/instrument_triangle.png",
            "タンバリン": "assets/img/instrument_tambourine.png",
            "太鼓": "assets/img/instrument_taiko.png",
            "ドラム": "assets/img/instrument_drum.png",
            "ピアノ": "assets/img/instrument_piano.png",
            "ギター": "assets/img/gita.png"
        };

        this.instrumentImage = loadImage(instrumentImageMap[this.instrumentName] || "");

        this.loadInstrumentSounds();
    }

    // 楽器の音源をロードするメソッド
    loadInstrumentSounds() {
        const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName];
        if (!instrumentConfig) {
            console.warn(`楽器設定が見つかりません: ${this.instrumentName}`);
            return;
        }

        this.instrumentDirName = this.instrumentDirMap[this.instrumentName]; // プロパティに設定
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
                this.instrumentSoundPlayer.loadSound(soundName, soundPath, volumeMultiplier);
            }
        } else {
            // その他の楽器の場合 (既存のロジック)
            instrumentConfig.keys.forEach((key, index) => {
                const soundName = `${this.instrumentDirName}_track${index + 1}`;
                const soundPath = `assets/sound/${this.instrumentDirName}/track0${index + 1}.wav`;
                this.instrumentSoundPlayer.loadSound(soundName, soundPath, volumeMultiplier);
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
        const scaffoldY = this.game.canvas.height - (PLATFORM_HEIGHT_IN_BLOCKS * BLOCK_SIZE) - (scaffoldHeightInBlocks * BLOCK_SIZE) * 3;

        for (let i = 0; i < numScaffolds; i++) {
            currentX += gapWidthInBlocks * BLOCK_SIZE;
            let requiredKeys = this.generateRequiredKeys();
            this.scaffolds.push(new ScaffoldBlock(currentX, scaffoldY, scaffoldWidthInBlocks, scaffoldHeightInBlocks, requiredKeys));
            currentX += scaffoldWidthInBlocks * BLOCK_SIZE;
        }
    }

    requestTreeBreakEvent(tree) {
        const requiredKeys = this.generateRequiredKeys();
        this.breakableTrees.set(tree, { requiredKeys });
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

        this.handlePlayer2Input();

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms, this.stage.trees, newScrollSpeed);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    // 要求されたキー入力が過不足なく行われているかをチェックするヘルパーメソッド
    isChordPerfectlyMatched(requiredKeys) {
        const requiredPhysicalKeys = new Set(
            requiredKeys.map(key => this.player2Input.actionMap[`ACTION_${key}`]).filter(Boolean)
        );
        const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();
        const pressedInstrumentKeys = new Set(
            [...this.player2Input.pressedKeys].filter(k => instrumentPhysicalKeys.has(k))
        );
        return pressedInstrumentKeys.size === requiredPhysicalKeys.size &&
               [...requiredPhysicalKeys].every(k => pressedInstrumentKeys.has(k));
    }

    handlePlayer2Input() {
        // 1. 楽器キーが何か押されているかをチェック
        const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();
        const instrumentKeysPressed = Array.from(this.player2Input.pressedKeys).some(key => instrumentPhysicalKeys.has(key));

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
            s.x < this.stage.cameraX + this.game.canvas.width && 
            s.x + s.width > this.stage.cameraX
        );
        const activeTrees = Array.from(this.breakableTrees.keys()).filter(t => 
            t.x < this.stage.cameraX + this.game.canvas.width && 
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
                        const trackNumber = Math.floor(Math.random() * KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName].maxChord);
                        if (trackNumber >= 0 && trackNumber < KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName].maxChord) {
                            const soundName = `${this.instrumentDirName}_track${trackNumber + 1}`;
                            this.instrumentSoundPlayer.playSound(soundName);
                        }
                    } else {
                        // 押されたキーのインデックスに対応するトラックを再生（ピアノ含む全楽器共通）
                        requiredKeys.forEach(key => {
                            const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName];
                            const keyIndex = instrumentConfig.keys.indexOf(key);
                            if (keyIndex !== -1) {
                                const soundName = `${this.instrumentDirName}_track${keyIndex + 1}`;
                                this.instrumentSoundPlayer.playSound(soundName);
                            }
                        });
                    }
                }
            }
            else if (target instanceof Tree) {
                this.stage.spawnFallingTreeAnimation(target);
                target.break();
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
        if (this.player.y > this.game.canvas.height) this.gameOver();
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
        this.player2Input.destroy();
        this.game.changeScene(SCENE.GAME_OVER, { score: this.score, instrument: this.instrumentName });
    }

    draw() {
        const ctx = this.game.ctx;
        const { width, height } = this.game.canvas;

        {
            drawBackground(ctx, this.backgroundImage, width, height, '#d0d0d0');
        }

        ctx.save();
        ctx.translate(-this.stage.cameraX, 0);

        this.stage.draw(ctx);
        this.player.draw(ctx);
        this.scaffolds.forEach(s => s.draw(ctx));

        this.breakableTrees.forEach((data, tree) => {
            const keyText = data.requiredKeys.join(' + ');
            ctx.font = `${BLOCK_SIZE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // テキストの幅と高さを測定
            const textMetrics = ctx.measureText(keyText);
            const textWidth = textMetrics.width;
            const textHeight = BLOCK_SIZE; // フォントサイズと同じくらいと仮定

            const padding = TREE_TEXT_BACKGROUND_PADDING;
            const bgX = tree.x + tree.width / 2 - textWidth / 2 - padding;
            const bgY = tree.y + tree.height / 2 - textHeight / 2 - padding;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = textHeight + padding * 2;

            // 黒い背景を描画
            ctx.fillStyle = TREE_TEXT_BACKGROUND_COLOR;
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

            // テキストに黒い縁取りを追加
            ctx.strokeStyle = TREE_TEXT_STROKE_COLOR;
            ctx.lineWidth = TREE_TEXT_STROKE_WIDTH;
            ctx.strokeText(keyText, tree.x + tree.width / 2, tree.y + tree.height / 2);
            
            ctx.fillStyle = TREE_TEXT_COLOR;
            ctx.fillText(keyText, tree.x + tree.width / 2, tree.y + tree.height / 2);
        });

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.MEDIUM}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);

        // 楽器アイコンを右上に描画
        if (this.instrumentImage.complete && this.instrumentImage.naturalHeight !== 0) {
            const x = width - 100 - 40;
            const y = 20;
            ctx.drawImage(this.instrumentImage, x, y, 140, 150);
        }

        if (this.isCountdown) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, width, height);
    
            ctx.font = `128px ${FONT_FAMILY}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
    
            if (this.countdownNumber > 0) {
                ctx.fillText(this.countdownNumber, width / 2, height / 2);
            }
            else if (this.countdownNumber === 0) {
                ctx.fillText("Start!", width / 2, height / 2);
            }
        }
    }
}