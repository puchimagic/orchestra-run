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

// ★楽器ごとの設定を定義
export const INSTRUMENT_CONFIG = {
    'トライアングル': { name: 'トライアングル', keys: ['J'], maxChord: 1 },
    'タンバリン':   { name: 'タンバリン',   keys: ['J', 'L'], maxChord: 1 },
    '太鼓':         { name: '太鼓',         keys: ['J', 'K', 'L'], maxChord: 1 },
    'ドラム':       { name: 'ドラム',       keys: ['U', 'I', 'J', 'K', 'L'], maxChord: 1 },
    'ピアノ':       { name: 'ピアノ',       keys: ['U', 'I', 'O', 'J', 'K', 'L', ';'], maxChord: 1 },
    'ギター':       { name: 'ギター',       keys: ['U', 'I', 'O', 'J', 'K', 'L'], maxChord: 4 },
};

// 指定された順番
export const INSTRUMENT_ORDER = ['トライアングル', 'タンバリン', '太鼓', 'ドラム', 'ピアノ', 'ギター'];
