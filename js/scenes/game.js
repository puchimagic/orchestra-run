import { 
    SCENE, FONT_SIZE, FONT_FAMILY, BLOCK_SIZE, PLATFORM_HEIGHT_IN_BLOCKS, 
    KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, 
    INITIAL_SCROLL_SPEED, PLAYER_MAX_JUMP_IN_BLOCKS 
} from '../config.js';
import { Player } from '../player.js';
import { Stage, Wall } from '../stage.js'; 
import { ScaffoldBlock } from '../scaffold.js';
import { InputHandler } from '../input_handler.js';
import { SoundPlayer, soundPlayer } from '../../soundPlayer.js';

export class GameScene {
    constructor(game, selectedInstrument) {
        this.game = game;
        this.selectedInstrument = selectedInstrument;
        this.inputHandler = this.game.inputHandler; 
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
        this.instrumentDirName = null; // 初期化

        // 背景画像を読み込む
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/mein.png';
        this.isBackgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image: img/mein.png');
        };

        // 楽器アイコン画像用
        this.instrumentImage = null;
        this.isInstrumentLoaded = false;
    }

    init(data) {
        this.instrumentName = this.selectedInstrument || 'トライアングル';
        
        const useGamepadForScaffold = this.game.inputMethod === 'gamepad'; // 変更
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
        this.breakableWalls = new Map();

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

        // playerとstageをInputHandlerに設定し直す
        this.game.inputHandler.player = this.player;
        this.game.inputHandler.stage = this.stage;
        this.player2Input.init();

        // Countdown properties
        this.isCountdown = true;
        this.countdownNumber = 3;
        this.countdownTimer = 0;

        // 楽器名ごとに対応する画像URLをマッピング
        const instrumentImageMap = {
            "トライアングル": "https://github.com/puchimagic/oic_hack/blob/main/img/toraianguru.png?raw=true",
            "タンバリン": "https://github.com/puchimagic/oic_hack/blob/main/img/tanbarin.png?raw=true",
            "太鼓": "https://github.com/puchimagic/oic_hack/blob/main/img/taiko.png?raw=true",
            "ドラム": "https://github.com/puchimagic/oic_hack/blob/main/img/doramu.png?raw=true",
            "ピアノ": "https://github.com/puchimagic/oic_hack/blob/main/img/piano.png?raw=true",
            "ギター": "https://github.com/puchimagic/oic_hack/blob/main/img/gita.png?raw=true"
        };

        // 楽器アイコンをロード
        this.instrumentImage = new Image();
        this.instrumentImage.src = instrumentImageMap[this.instrumentName] || "";
        this.instrumentImage.onload = () => {
            this.isInstrumentLoaded = true;
        };
        this.instrumentImage.onerror = () => {
            console.error(`Failed to load instrument image for: ${this.instrumentName}`);
        };

        this.loadInstrumentSounds(); // 楽器の音源をロード
        soundPlayer.playBGM('game_bgm');
    }

    // 楽器の音源をロードするメソッド
    loadInstrumentSounds() {
        const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName];
        if (!instrumentConfig) {
            console.warn(`Instrument config not found for: ${this.instrumentName}`);
            return;
        }

        this.instrumentDirName = this.instrumentDirMap[this.instrumentName]; // プロパティに設定
        if (!this.instrumentDirName) {
            console.warn(`Instrument directory name not found for: ${this.instrumentName}`);
            return;
        }

        if (this.instrumentName === 'ギター') {
            // ギターの場合、maxChordの数だけ音源をロード
            for (let i = 0; i < instrumentConfig.maxChord; i++) {
                const soundName = `${this.instrumentDirName}_track${i + 1}`;
                const soundPath = `sound/${this.instrumentDirName}/track0${i + 1}.wav`;
                this.instrumentSoundPlayer.loadSound(soundName, soundPath);
            }
        } else {
            // その他の楽器の場合 (既存のロジック)
            instrumentConfig.keys.forEach((key, index) => {
                const soundName = `${this.instrumentDirName}_track${index + 1}`;
                const soundPath = `sound/${this.instrumentDirName}/track0${index + 1}.wav`;
                this.instrumentSoundPlayer.loadSound(soundName, soundPath);
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

    requestWallBreakEvent(wall) {
        const requiredKeys = this.generateRequiredKeys();
        this.breakableWalls.set(wall, { requiredKeys });
    }

    generateRequiredKeys() {
        const availableKeys = this.instrument.keys;
        let numKeysToPress;
        if (this.instrument.name === 'ギター') {
            // 2から5の範囲でランダムな数を生成
            numKeysToPress = 2 + Math.floor(Math.random() * 4); // 2, 3, 4, 5
        } else {
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
                    this.startTime = Date.now(); // Reset start time after countdown
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

        const speedIncreaseInterval = 30;
        const speedIncreaseAmount = 0.5;
        const newScrollSpeed = INITIAL_SCROLL_SPEED + Math.floor(elapsedTimeInSeconds / speedIncreaseInterval) * speedIncreaseAmount;
        this.stage.setScrollSpeed(newScrollSpeed);

        this.stage.elapsedTimeInSeconds = elapsedTimeInSeconds; // 経過時間をStageに渡す
        this.stage.update(deltaTime);
        this.scaffolds.forEach(s => s.update());

        this.handlePlayer2Input();

        const solidScaffolds = this.scaffolds.filter(s => s.state === 'SOLID');
        const allPlatforms = [...this.stage.platforms, ...solidScaffolds];
        this.player.update(allPlatforms, this.stage.walls);

        this.scaffolds = this.scaffolds.filter(s => s.state !== 'EXPIRED' && s.x + s.width > this.stage.cameraX);

        this.checkGameOver();
        this.player2Input.clearPressedActions();
    }

    handlePlayer2Input() {
        // ゲームパッドが選択されている場合は楽器演奏を行わない
        if (this.game.inputMethod === 'gamepad') {
            // ただし、足場生成や壁破壊のロジックは引き続き実行する
            // 楽器音を鳴らす部分だけをスキップする
            const activeScaffolds = this.scaffolds.filter(s => 
                s.state === 'ACTIVE' && 
                s.x < this.stage.cameraX + this.game.canvas.width && 
                s.x + s.width > this.stage.cameraX
            );
            const activeWalls = Array.from(this.breakableWalls.keys()).filter(w => 
                w.x < this.stage.cameraX + this.game.canvas.width && 
                w.x + w.width > this.stage.cameraX
            );
            const allInteractiveObjects = [...activeScaffolds, ...activeWalls];
    
            if (allInteractiveObjects.length === 0) return;
    
            const target = allInteractiveObjects.reduce((prev, curr) => prev.x < curr.x ? prev : curr);
    
            if (target instanceof ScaffoldBlock) {
                const requiredActions = target.requiredKeys.map(key => `ACTION_${key}`);
                
                let isPerfectMatch = true;
                const requiredPhysicalKeys = new Set();
                requiredActions.forEach(action => {
                    const physicalKey = this.player2Input.actionMap[action];
                    if (physicalKey) {
                        requiredPhysicalKeys.add(physicalKey);
                    }
                });
    
                const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();
    
                const currentlyPressedInstrumentKeys = new Set();
                for (const pressedKey of this.player2Input.pressedKeys) {
                    if (instrumentPhysicalKeys.has(pressedKey)) {
                        currentlyPressedInstrumentKeys.add(pressedKey);
                    }
                }
    
                if (currentlyPressedInstrumentKeys.size !== requiredPhysicalKeys.size) {
                    isPerfectMatch = false;
                } else {
                    for (const requiredKey of requiredPhysicalKeys) {
                        if (!currentlyPressedInstrumentKeys.has(requiredKey)) {
                            isPerfectMatch = false;
                            break;
                        }
                    }
                }
    
                if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                    requiredActions.some(action => this.player2Input.isActionPressed(action)) &&
                    isPerfectMatch
                ) {
                    target.solidify();
                    // ゲームパッド選択時は楽器音を鳴らさない
                }
            }
            else if (target instanceof Wall) {
                const wallData = this.breakableWalls.get(target);
                const requiredActions = wallData.requiredKeys.map(key => `ACTION_${key}`);
    
                let isPerfectMatch = true;
                const requiredPhysicalKeys = new Set();
                requiredActions.forEach(action => {
                    const physicalKey = this.player2Input.actionMap[action];
                    if (physicalKey) {
                        requiredPhysicalKeys.add(physicalKey);
                    }
                });
    
                const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();
    
                const currentlyPressedInstrumentKeys = new Set();
                for (const pressedKey of this.player2Input.pressedKeys) {
                    if (instrumentPhysicalKeys.has(pressedKey)) {
                        currentlyPressedInstrumentKeys.add(pressedKey);
                    }
                }
    
                if (currentlyPressedInstrumentKeys.size !== requiredPhysicalKeys.size) {
                    isPerfectMatch = false;
                } else {
                    for (const requiredKey of requiredPhysicalKeys) {
                        if (!currentlyPressedInstrumentKeys.has(requiredKey)) {
                            isPerfectMatch = false;
                            break;
                        }
                    }
                }
    
                if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                    requiredActions.some(action => this.player2Input.isActionPressed(action)) &&
                    isPerfectMatch
                ) {
                    this.stage.spawnFallingTreeAnimation(target);
                    target.break();
                    this.breakableWalls.delete(target);
                }
            }
            return; // ゲームパッド選択時は楽器音を鳴らさないため、ここで処理を終了
        }

        // キーボード選択時、またはゲームパッド選択時でも楽器音以外の処理は続行
        const activeScaffolds = this.scaffolds.filter(s => 
            s.state === 'ACTIVE' && 
            s.x < this.stage.cameraX + this.game.canvas.width && 
            s.x + s.width > this.stage.cameraX
        );
        const activeWalls = Array.from(this.breakableWalls.keys()).filter(w => 
            w.x < this.stage.cameraX + this.game.canvas.width && 
            w.x + w.width > this.stage.cameraX
        );
        const allInteractiveObjects = [...activeScaffolds, ...activeWalls];

        if (allInteractiveObjects.length === 0) return;

        const target = allInteractiveObjects.reduce((prev, curr) => prev.x < curr.x ? prev : curr);

        if (target instanceof ScaffoldBlock) {
            const requiredActions = target.requiredKeys.map(key => `ACTION_${key}`);
            
            let isPerfectMatch = true;
            const requiredPhysicalKeys = new Set();
            requiredActions.forEach(action => {
                const physicalKey = this.player2Input.actionMap[action];
                if (physicalKey) {
                    requiredPhysicalKeys.add(physicalKey);
                }
            });

            const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();

            const currentlyPressedInstrumentKeys = new Set();
            for (const pressedKey of this.player2Input.pressedKeys) {
                if (instrumentPhysicalKeys.has(pressedKey)) {
                    currentlyPressedInstrumentKeys.add(pressedKey);
                }
            }

            if (currentlyPressedInstrumentKeys.size !== requiredPhysicalKeys.size) {
                isPerfectMatch = false;
            } else {
                for (const requiredKey of requiredPhysicalKeys) {
                    if (!currentlyPressedInstrumentKeys.has(requiredKey)) {
                        isPerfectMatch = false;
                        break;
                    }
                }
            }

            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                requiredActions.some(action => this.player2Input.isActionPressed(action)) &&
                isPerfectMatch
            ) {
                target.solidify();
                // 足場が生成されたときに音を鳴らす
                if (this.instrumentName === 'ピアノ') {
                    const availableTracks = KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName].keys.length;
                    const numSoundsToPlay = requiredActions.length;
                    if (availableTracks >= numSoundsToPlay) {
                        const startIndex = Math.floor(Math.random() * (availableTracks - numSoundsToPlay + 1));
                        for (let i = 0; i < numSoundsToPlay; i++) {
                            const trackNumber = startIndex + i + 1;
                            const soundName = `${this.instrumentDirName}_track${trackNumber}`;
                            console.log(`Attempting to play piano sound: ${soundName}`);
                            this.instrumentSoundPlayer.playSound(soundName);
                        }
                    }
                    else {
                        console.warn(`Not enough piano tracks for ${numSoundsToPlay} required actions.`);
                        for (let i = 0; i < numSoundsToPlay; i++) {
                            const trackNumber = (startIndex + i) % availableTracks + 1;
                            const soundName = `${this.instrumentDirName}_track${trackNumber}`;
                            console.log(`Attempting to play piano sound (looped): ${soundName}`);
                            this.instrumentSoundPlayer.playSound(soundName);
                        }
                    }
                }
                else if (this.instrumentName === 'ギター') {
                    const numPressedKeys = requiredActions.length;
                    const trackNumber = Math.floor(Math.random() * KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName].maxChord);
                    
                    if (trackNumber >= 0 && trackNumber < KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName].maxChord) {
                        const soundName = `${this.instrumentDirName}_track${trackNumber + 1}`;
                        console.log(`Attempting to play guitar sound: ${soundName}`);
                        this.instrumentSoundPlayer.playSound(soundName);
                    }
                    else {
                        console.warn(`No guitar sound for track number ${trackNumber + 1}.`);
                    }
                }
                else {
                    requiredActions.forEach(action => {
                        const key = action.replace('ACTION_', '');
                        const instrumentConfig = KEYBOARD_INSTRUMENT_CONFIG[this.instrumentName];
                        const keyIndex = instrumentConfig.keys.indexOf(key);
                        if (keyIndex !== -1) {
                            const soundName = `${this.instrumentDirName}_track${keyIndex + 1}`;
                            console.log(`Attempting to play sound: ${soundName}`);
                            this.instrumentSoundPlayer.playSound(soundName);
                        }
                    });
                }
            }
        }
        else if (target instanceof Wall) {
            const wallData = this.breakableWalls.get(target);
            const requiredActions = wallData.requiredKeys.map(key => `ACTION_${key}`);

            let isPerfectMatch = true;
            const requiredPhysicalKeys = new Set();
            requiredActions.forEach(action => {
                const physicalKey = this.player2Input.actionMap[action];
                if (physicalKey) {
                    requiredPhysicalKeys.add(physicalKey);
                }
            });

            const instrumentPhysicalKeys = this.player2Input.getInstrumentPhysicalKeys();

            const currentlyPressedInstrumentKeys = new Set();
            for (const pressedKey of this.player2Input.pressedKeys) {
                if (instrumentPhysicalKeys.has(pressedKey)) {
                    currentlyPressedInstrumentKeys.add(pressedKey);
                }
            }

            if (currentlyPressedInstrumentKeys.size !== requiredPhysicalKeys.size) {
                isPerfectMatch = false;
            } else {
                for (const requiredKey of requiredPhysicalKeys) {
                    if (!currentlyPressedInstrumentKeys.has(requiredKey)) {
                        isPerfectMatch = false;
                        break;
                    }
                }
            }

            if (requiredActions.every(action => this.player2Input.isActionDown(action)) && 
                requiredActions.some(action => this.player2Input.isActionPressed(action)) &&
                isPerfectMatch
            ) {
                this.stage.spawnFallingTreeAnimation(target);
                target.break();
                this.breakableWalls.delete(target);
            }
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

        if (this.isBackgroundLoaded) {
            ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        }
        else {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#d0d0d0';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.save();
        ctx.translate(-this.stage.cameraX, 0);

        this.stage.draw(ctx);
        this.player.draw(ctx);
        this.scaffolds.forEach(s => s.draw(ctx));

        this.breakableWalls.forEach((data, wall) => {
            const keyText = data.requiredKeys.join(' + ');
            ctx.font = `${BLOCK_SIZE}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // テキストに黒い縁取りを追加
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText(keyText, wall.x + wall.width / 2, wall.y + wall.height / 2);
            
            ctx.fillStyle = 'white';
            ctx.fillText(keyText, wall.x + wall.width / 2, wall.y + wall.height / 2);
        });

        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.fillText(`スコア: ${this.score}`, 20, 50);

        // 楽器アイコンを右上に描画
        if (this.isInstrumentLoaded) {
            const x = width - 100 - 10;
            const y = 10;
            ctx.drawImage(this.instrumentImage, x, y, 100, 110);
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
                ctx.font = `96px ${FONT_FAMILY}`;                ctx.fillText("Start!", width / 2, height / 2);
            }
        }
    }
}