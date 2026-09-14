// ゲームパッド用の表示ラベル(config.jsのGAMEPAD_INSTRUMENT_CONFIG内のkeys配列の値)を
// 標準ゲームパッド(Gamepad API mapping: 'standard')の実際のボタン番号に変換するテーブル。
// ラベル自体は画面表示にも使うため文字列のまま保持し、判定にはこちらを使う。
const GAMEPAD_LABEL_TO_BUTTON_INDEX = {
    'A': 0, 'S': 1, 'D': 2, 'F': 3, 'J': 4, 'K': 5, 'L': 6,
};

export class InputHandler {
    constructor() {
        this.keyboardInstrumentConfig = null;
        this.gamepadInstrumentConfig = null;
        this.activeKeyMap = {};
        this.pressedKeys = new Set();
        this.actionsDown = new Set();
        this.actionMap = {};
        this.gamepads = [];
        this.lastGamepadConnectedStatus = false;
        this.fixedGamepadConnectedStatus = null;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // ゲームパッドの接続状態はupdateGamepads()がnavigator.getGamepads()から
        // 毎フレーム直接同期するため、gamepadconnected/disconnectedイベントの
        // 個別ハンドリングは不要（インスタンス生成タイミングに依存する取りこぼしを防ぐため）
        this.pollGamepads();
    }

    setInstrumentKeyMaps(keyboardConfig, gamepadConfig, fixedConnectedStatus = null) {
        this.keyboardInstrumentConfig = keyboardConfig;
        this.gamepadInstrumentConfig = gamepadConfig;
        this.fixedGamepadConnectedStatus = fixedConnectedStatus;
        this._updateActiveKeyMap();
    }

    _updateActiveKeyMap() {
        const isConnected = this.fixedGamepadConnectedStatus !== null ? this.fixedGamepadConnectedStatus : this.isGamepadConnected();
        const currentInstrumentConfig = isConnected ? this.gamepadInstrumentConfig : this.keyboardInstrumentConfig;

        this.activeKeyMap = {};
        this.actionMap = {};

        if (currentInstrumentConfig) {
            for (const instrumentName in currentInstrumentConfig) {
                const instrument = currentInstrumentConfig[instrumentName];
                instrument.keys.forEach(key => {
                    // isConnected(ゲームパッド設定を使用中)なら、表示ラベルを実際の
                    // ボタン番号に変換する。キーボード設定時は従来通りKey+ラベル。
                    const physicalKey = isConnected
                        ? `GamepadButton${GAMEPAD_LABEL_TO_BUTTON_INDEX[key]}`
                        : `Key${key}`;
                    const action = `ACTION_${key}`;
                    this.activeKeyMap[physicalKey] = action;
                    this.actionMap[action] = physicalKey;
                });
            }
        }
    }

    init() {}
    destroy() {}

    handleKeyDown(e) {
        if (this.pressedKeys.has(e.code)) return;
        this.pressedKeys.add(e.code);
        const action = this.activeKeyMap[e.code];
        if (action) this.actionsDown.add(action);
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);
    }

    getInstrumentPhysicalKeys() {
        return new Set(Object.keys(this.activeKeyMap));
    }

    clearPressedActions() {
        this.actionsDown.clear();
    }

    updateGamepads() {
        // gamepadconnectedイベントは接続時に一度しかwindowに発火しないため、
        // このInputHandlerインスタンスが生成される前に既に接続済みだった
        // ゲームパッドを取りこぼす（インスタンスごとにgamepadsが空のまま
        // 固定されてしまう）。navigator.getGamepads()を直接ソースオブトゥルースとして
        // 毎フレーム全件同期することで、生成タイミングに関係なく正しく反映する。
        const gamepadsFromAPI = navigator.getGamepads();
        this.gamepads = Array.from(gamepadsFromAPI).map(gp => gp || undefined);

        const currentGamepadConnectedStatus = this.isGamepadConnected();
        if (currentGamepadConnectedStatus !== this.lastGamepadConnectedStatus) {
            this._updateActiveKeyMap();
            this.lastGamepadConnectedStatus = currentGamepadConnectedStatus;
        }

        this.processGamepadButtons();
    }

    processGamepadButtons() {
        if (!this.isGamepadConnected()) return;
        this.gamepads.forEach((gamepad) => {
            if (!gamepad) return;
            gamepad.buttons.forEach((button, buttonIndex) => {
                const physicalKey = `GamepadButton${buttonIndex}`;
                const action = this.activeKeyMap[physicalKey];
                if (button.pressed) {
                    if (!this.pressedKeys.has(physicalKey)) {
                        this.pressedKeys.add(physicalKey);
                        if (action) this.actionsDown.add(action);
                    }
                } else {
                    if (this.pressedKeys.has(physicalKey)) {
                        this.pressedKeys.delete(physicalKey);
                    }
                }
            });
        });
    }

    isGamepadButtonPressed(playerIndex, buttonIndex) {
        return this.gamepads[playerIndex]?.buttons[buttonIndex]?.pressed || false;
    }

    getGamepadAxis(playerIndex, axisIndex) {
        const axisValue = this.gamepads[playerIndex]?.axes[axisIndex];
        if (axisValue !== undefined && Math.abs(axisValue) > 0.1) {
            return axisValue;
        }
        return 0;
    }

    pollGamepads() {
        this.updateGamepads();
        requestAnimationFrame(() => this.pollGamepads());
    }

    isGamepadConnected() {
        return this.gamepads.some(gp => gp);
    }
}
