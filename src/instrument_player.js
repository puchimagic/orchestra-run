import { KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, INSTRUMENT_FOLDER_MAP } from './config.js';
import { InputHandler } from './input_handler.js';
import { SoundPool } from './soundPlayer.js';

// 楽器演奏サブシステム: キー入力の判定・和音一致判定・音源ロード/再生を担当する。
export class InstrumentPlayer {
    constructor() {
        this.input = new InputHandler();

        // 選択した楽器の演奏音専用の音源プール（BGM/固定効果音を管理するsoundPlayerとは別物）
        this.sounds = new SoundPool();

        this.instrumentDirName = null;
        this.instrumentName = null;
        this.instrument = null;
    }

    // instrumentName: 楽器の日本語名, instrument: activeInstrumentConfig[instrumentName]
    // useGamepad: ゲームパッド入力を使うかどうか（GameScene側のinputMethodから決定）
    init(instrumentName, instrument, useGamepad) {
        this.instrumentName = instrumentName;
        this.instrument = instrument;

        this.input.setInstrumentKeyMaps(KEYBOARD_INSTRUMENT_CONFIG, GAMEPAD_INSTRUMENT_CONFIG, useGamepad);
        this.input.init();

        this.instrumentDirName = INSTRUMENT_FOLDER_MAP[instrumentName];
        this.loadSounds();
    }

    loadSounds() {
        const instrumentConfig = this.instrument;
        if (!instrumentConfig) {
            console.warn(`楽器設定が見つかりません: ${this.instrumentName}`);
            return;
        }

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
                this.sounds.loadSound(soundName, soundPath, volumeMultiplier);
            }
        } else {
            // その他の楽器の場合 (既存のロジック)
            instrumentConfig.keys.forEach((key, index) => {
                const soundName = `${this.instrumentDirName}_track${index + 1}`;
                const soundPath = `assets/sound/${this.instrumentDirName}/track0${index + 1}.wav`;
                this.sounds.loadSound(soundName, soundPath, volumeMultiplier);
            });
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

    hasAnyKeyPressed() {
        const instrumentPhysicalKeys = this.input.getInstrumentPhysicalKeys();
        return Array.from(this.input.pressedKeys).some(key => instrumentPhysicalKeys.has(key));
    }

    // 要求されたキー入力が過不足なく行われているかをチェックするヘルパーメソッド
    isMatched(requiredKeys) {
        const requiredPhysicalKeys = new Set(
            requiredKeys.map(key => this.input.actionMap[`ACTION_${key}`]).filter(Boolean)
        );
        const instrumentPhysicalKeys = this.input.getInstrumentPhysicalKeys();
        const pressedInstrumentKeys = new Set(
            [...this.input.pressedKeys].filter(k => instrumentPhysicalKeys.has(k))
        );
        return pressedInstrumentKeys.size === requiredPhysicalKeys.size &&
               [...requiredPhysicalKeys].every(k => pressedInstrumentKeys.has(k));
    }

    // 一致成功時の効果音再生（ゲームパッド選択時は楽器音を鳴らさない）
    playSuccessSound(requiredKeys, gamepadSelected) {
        if (gamepadSelected) return;

        if (this.instrumentName === 'ギター') {
            const trackNumber = Math.floor(Math.random() * this.instrument.maxChord);
            if (trackNumber >= 0 && trackNumber < this.instrument.maxChord) {
                const soundName = `${this.instrumentDirName}_track${trackNumber + 1}`;
                this.sounds.playSound(soundName);
            }
        } else {
            // 押されたキーのインデックスに対応するトラックを再生（ピアノ含む全楽器共通）
            requiredKeys.forEach(key => {
                const keyIndex = this.instrument.keys.indexOf(key);
                if (keyIndex !== -1) {
                    const soundName = `${this.instrumentDirName}_track${keyIndex + 1}`;
                    this.sounds.playSound(soundName);
                }
            });
        }
    }

    clearPressedActions() {
        this.input.clearPressedActions();
    }

    destroy() {
        this.input.destroy();
    }
}
