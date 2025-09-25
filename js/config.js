export const SCENE = {
    MAIN: 'main',
    GAME_DESCRIPTION: 'game_description',
    RANKING: 'ranking',
    INSTRUMENT_SELECT: 'instrument_select',
    GAME: 'game',
    GAME_OVER: 'game_over',
};

export const FONT_FAMILY = 'Arial';
export const FONT_SIZE = {
    SMALL: 36,
    MEDIUM: 72,
    LARGE: 96,
};

export const BLOCK_SIZE = 60;
export const PLATFORM_HEIGHT_IN_BLOCKS = 1;

export const INITIAL_SCROLL_SPEED = 5;

// ★プレイヤーのジャンプ力を共通設定に
export const PLAYER_MAX_JUMP_IN_BLOCKS = 8;

export const KEYBOARD_INSTRUMENT_CONFIG = {
    'トライアングル': { name: 'トライアングル', keys: ['J'], maxChord: 1, multiplier: 1.0 },
    'タンバリン':   { name: 'タンバリン',   keys: ['J', 'L'], maxChord: 1, multiplier: 1.1 },
    '太鼓':         { name: '太鼓',         keys: ['J', 'K', 'L'], maxChord: 1, multiplier: 1.2 },
    'ドラム':       { name: 'ドラム',       keys: ['U', 'I', 'J', 'K', 'L'], maxChord: 1, multiplier: 1.4 },
    'ピアノ':       { name: 'ピアノ',       keys: ['U', 'I', 'O', 'J', 'K', 'L', 'P'], maxChord: 1, multiplier: 1.6 },
    'ギター':       { name: 'ギター',       keys: ['U', 'I', 'O', 'J', 'K', 'L'], maxChord: 4, multiplier: 1.5 },
};

export const GAMEPAD_INSTRUMENT_CONFIG = {
    'トライアングル': { name: 'トライアングル', keys: ['A'], maxChord: 1, multiplier: 1.0 },
    'タンバリン':   { name: 'タンバリン',   keys: ['A', 'S'], maxChord: 1, multiplier: 1.1 },
    '太鼓':         { name: '太鼓',         keys: ['A', 'S', 'D'], maxChord: 1, multiplier: 1.2 },
    'ドラム':       { name: 'ドラム',       keys: ['A', 'S', 'D', 'F', 'J'], maxChord: 1, multiplier: 1.4 },
    'ピアノ':       { name: 'ピアノ',       keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'], maxChord: 1, multiplier: 1.6 },
    'ギター':       { name: 'ギター',       keys: ['A', 'S', 'D', 'F', 'J', 'K'], maxChord: 4, multiplier: 1.5 },
};

export const INSTRUMENT_ORDER = ['トライアングル', 'タンバリン', '太鼓', 'ドラム', 'ピアノ', 'ギター'];
