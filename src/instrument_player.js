import { KEYBOARD_INSTRUMENT_CONFIG, INSTRUMENT_FOLDER_MAP } from './config.js';
import { InputHandler } from './input_handler.js';
import { SoundPool } from './soundPlayer.js';

// ギターは、押したキーごとに決まったコードを鳴らす（ピアノの「キーごとに決まった音」と同じ考え方）。
// 以前は4つのコードからランダムに選んでいたため、違うキーで同じ音・同じキーで違う音が鳴っていた。
// 録音は Am / C / Em / F の4つ(track01〜04)なので、足りない Dm と G は録音の音の高さを変えて作る。
// キーの並び U I O P J K → C Dm Em F G Am（ハ長調の基本の和音を、ピアノと同じく U=ド から順に）
const GUITAR_KEY_CHORDS = {
    U: { track: 2, semitones: 0 },   // C
    I: { track: 1, semitones: 5 },   // Dm（Amを4度上げる）
    O: { track: 3, semitones: 0 },   // Em
    P: { track: 4, semitones: 0 },   // F
    J: { track: 2, semitones: -5 },  // G（Cを4度下げる）
    K: { track: 1, semitones: 0 },   // Am
};

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

    // instrumentName: 楽器の日本語名, instrument: KEYBOARD_INSTRUMENT_CONFIG[instrumentName]
    // 演奏操作(足場生成・木の破壊)は、キャラ操作の入力方法(キーボード/ゲームパッド)に
    // 関わらず常にキーボードのキーで行う仕様のため、ここでは常にキーボード設定を使う
    init(instrumentName, instrument) {
        this.instrumentName = instrumentName;
        this.instrument = instrument;

        this.input.setInstrumentKeyMaps(KEYBOARD_INSTRUMENT_CONFIG, KEYBOARD_INSTRUMENT_CONFIG, false);
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
            // ギターの場合、キーごとに割り当てたコードを（必要なら音の高さを変えて）ロード
            instrumentConfig.keys.forEach(key => {
                const chord = GUITAR_KEY_CHORDS[key];
                if (!chord) return;
                const soundName = `${this.instrumentDirName}_${key}`;
                const soundPath = `assets/sound/${this.instrumentDirName}/track0${chord.track}.wav`;
                this.sounds.loadSound(soundName, soundPath, volumeMultiplier, Math.pow(2, chord.semitones / 12));
            });
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
        const maxSimultaneousKeys = this.instrument.maxSimultaneousKeys || 1;
        const numKeysToPress = 1 + Math.floor(Math.random() * maxSimultaneousKeys);
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

    // 一致成功時の効果音再生
    playSuccessSound(requiredKeys) {
        if (this.instrumentName === 'ギター') {
            // 押したキーそれぞれのコードを鳴らす（2つ同時押しなら2つのコード）
            requiredKeys.forEach(key => this.sounds.playSound(`${this.instrumentDirName}_${key}`));
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
