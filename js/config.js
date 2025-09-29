export const CACHE_NAME = 'okerun-cache-v4'; // キャッシュ名を定義

export const SCENE = {
    MAIN: 'main',
    GAME_DESCRIPTION: 'game_description',
    RANKING: 'ranking',
    INSTRUMENT_SELECT: 'instrument_select',
    GAME: 'game',
    GAME_OVER: 'game_over',
    VOLUME_SETTINGS: 'volume_settings', // ★追加
};

export const FONT_FAMILY = 'Arial';
export const FONT_SIZE = {
    SMALL: 36,
    MEDIUM: 72,
    LARGE: 96,
};

export const BLOCK_SIZE = 60;
export const PLATFORM_HEIGHT_IN_BLOCKS = 1;

export const INITIAL_SCROLL_SPEED = 3; // スクロール速度の初期値
export const SPEED_INCREASE_INTERVAL = 15; // スクロール速度が上がる間隔（秒）

// ★プレイヤーのジャンプ力を共通設定に
export const PLAYER_MAX_JUMP_IN_BLOCKS = 8;
export const PLAYER_INITIAL_SPEED = 11; // キャラクターの歩行速度の初期値
// スクロール速度の上昇に合わせ、キャラクターの速度がどれだけ影響を受けるかの倍率。
// 1.0に設定すると、スクロール速度と同じだけキャラクターの速度が上がります。0.5なら、スクロール速度の半分の量だけ上がります。
export const PLAYER_SPEED_INCREASE_RATE = 1.0;

export const STUMP_WIDTH_IN_BLOCKS = 3.4; // ★追加：切り株の幅

// ボタンのハイライト色
export const SELECTED_BUTTON_COLOR = '#333';
export const SELECTED_BUTTON_HOVER_COLOR = '#555';
export const DEFAULT_BUTTON_COLOR = '#888';
export const DEFAULT_BUTTON_HOVER_COLOR = '#aaa';

// 足場ブロックの描画設定
export const SCAFFOLD_ACTIVE_STROKE_COLOR = '#f0ad4e'; // アクティブな足場の枠線の色 (現在 #f0ad4e)
export const SCAFFOLD_ACTIVE_LINE_WIDTH = 5; // アクティブな足場の枠線の太さ (現在 5)
export const SCAFFOLD_ACTIVE_TEXT_COLOR = '#f0ad4e'; // アクティブな足場のキーテキストの色 (現在 #f0ad4e)
export const SCAFFOLD_ACTIVE_TEXT_STROKE_COLOR = 'black'; // アクティブな足場のキーテキストの縁取りの色 (現在 black)
export const SCAFFOLD_ACTIVE_TEXT_STROKE_WIDTH = 4; // アクティブな足場のキーテキストの縁取りの太さ (現在 4)
export const SCAFFOLD_SOLID_FILL_COLOR_FALLBACK = '#f0ad4e'; // 固まった足場の画像がない場合の塗りつぶし色 (現在 #f0ad4e)

// 木のテキストの描画設定
export const TREE_TEXT_COLOR = 'white'; // 木に表示されるキーテキストの色 (現在 white)
export const TREE_TEXT_STROKE_COLOR = 'black'; // 木に表示されるキーテキストの縁取りの色 (現在 black)
export const TREE_TEXT_STROKE_WIDTH = 4; // 木に表示されるキーテキストの縁取りの太さ (現在 4)
export const TREE_TEXT_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.7)'; // 木に表示されるキーテキストの背景色 (現在 rgba(0, 0, 0, 0.7))
export const TREE_TEXT_BACKGROUND_PADDING = 10; // 木に表示されるキーテキストの背景のパディング (現在 10)


// --- 楽器設定 --- 

// 楽器ごとの共通設定
const INSTRUMENT_BASE_CONFIG = {
    'トライアングル': {
        name: 'トライアングル',      // 画面に表示される楽器名
        maxChord: 1,             // ギター演奏時に読み込む音声トラック数
        multiplier: 1.0,         // 獲得スコアの倍率
        volumeMultiplier: 1.0    // 音量の補正倍率 (1.0が基準)
    },
    'タンバリン':   { name: 'タンバリン',   maxChord: 1, multiplier: 1.1, volumeMultiplier: 1.8 },
    '太鼓':         { name: '太鼓',         maxChord: 1, multiplier: 1.2, volumeMultiplier: 1.0 },
    'ドラム':       { name: 'ドラム',       maxChord: 1, multiplier: 1.4, volumeMultiplier: 1.8 },
    'ピアノ':       { name: 'ピアノ',       maxChord: 1, multiplier: 1.6, volumeMultiplier: 1.0 },
    'ギター':       { name: 'ギター',       maxChord: 4, multiplier: 1.9, volumeMultiplier: 1.0 },
};

// キーボード演奏時のキー割り当て
const KEYBOARD_KEYS = {
    'トライアングル': { keys: ['U'] }, // 演奏に使用するキー
    'タンバリン':   { keys: ['U', 'I'] },
    '太鼓':         { keys: ['U', 'I', 'O'] },
    'ドラム':       { keys: ['U', 'I', 'O', 'P', 'J'] },
    'ピアノ':       { keys: ['U', 'I', 'O', 'P', 'J', 'K', 'L'] },
    'ギター':       { keys: ['U', 'I', 'O', 'P', 'J', 'K'] },
};

// ゲームパッド演奏時のボタン割り当て
const GAMEPAD_KEYS = {
    'トライアングル': { keys: ['A'] }, // 演奏に使用するボタン
    'タンバリン':   { keys: ['A', 'S'] },
    '太鼓':         { keys: ['A', 'S', 'D'] },
    'ドラム':       { keys: ['A', 'S', 'D', 'F', 'J'] },
    'ピアノ':       { keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'] },
    'ギター':       { keys: ['A', 'S', 'D', 'F', 'J', 'K'] },
};

// --- 設定を結合して最終的なコンフィグを生成 ---

// ヘルパー関数: 2つのオブジェクトをマージする
const mergeConfigs = (base, specific) => {
    const finalConfig = {};
    for (const key in base) {
        if (Object.hasOwnProperty.call(base, key) && Object.hasOwnProperty.call(specific, key)) {
            finalConfig[key] = { ...base[key], ...specific[key] };
        }
    }
    return finalConfig;
};

export const KEYBOARD_INSTRUMENT_CONFIG = mergeConfigs(INSTRUMENT_BASE_CONFIG, KEYBOARD_KEYS);
export const GAMEPAD_INSTRUMENT_CONFIG = mergeConfigs(INSTRUMENT_BASE_CONFIG, GAMEPAD_KEYS);


export const INSTRUMENT_ORDER = ['トライアングル', 'タンバリン', '太鼓', 'ドラム', 'ピアノ', 'ギター'];

// 日本語の楽器名とフォルダ名のマッピング
export const INSTRUMENT_FOLDER_MAP = {
    'トライアングル': 'triangle',
    'タンバリン': 'tambourie',
    '太鼓': 'taiko',
    'ドラム': 'drum',
    'ピアノ': 'piano',
    'ギター': 'guitar',
};