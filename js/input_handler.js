export class InputHandler {
    constructor() {
        this.keyboardInstrumentConfig = null; // Store keyboard instrument config
        this.gamepadInstrumentConfig = null;   // Store gamepad instrument config
        this.activeKeyMap = {};    // Currently active key mappings (keyboard or gamepad)
        this.pressedKeys = new Set(); // 現在押されているキー
        this.actionsDown = new Set();   // このフレームで押されたアクション
        this.actionMap = {}; // 逆引き用 (physicalKey -> action)
        this.gamepads = []; // ゲームパッドを格納する配列
        this.lastGamepadConnectedStatus = false; // To track changes in gamepad connection status
        this.fixedGamepadConnectedStatus = null; // ★追加: ゲーム開始時に確定した接続状態

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Gamepad接続イベント
        window.addEventListener('gamepadconnected', e => {
            console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
            this.gamepads[e.gamepad.index] = e.gamepad;
        });

        // Gamepad切断イベント
        window.addEventListener('gamepaddisconnected', e => {
            console.log('Gamepad disconnected from index %d: %s',
                e.gamepad.index, e.gamepad.id);
            delete this.gamepads[e.gamepad.index];
        });

        this.pollGamepads(); // ゲームパッドの状態を常に更新する
    }

    setInstrumentKeyMaps(keyboardConfig, gamepadConfig, fixedConnectedStatus = null) { // ★引数を追加
        // Store the full instrument configurations
        this.keyboardInstrumentConfig = keyboardConfig;
        this.gamepadInstrumentConfig = gamepadConfig;
        this.fixedGamepadConnectedStatus = fixedConnectedStatus; // ★設定

        // Initialize activeKeyMap and actionMap based on current gamepad status
        this._updateActiveKeyMap();
    }

    _updateActiveKeyMap() {
        const isConnected = this.fixedGamepadConnectedStatus !== null ? this.fixedGamepadConnectedStatus : this.isGamepadConnected();
        const currentInstrumentConfig = isConnected ? this.gamepadInstrumentConfig : this.keyboardInstrumentConfig;

        this.activeKeyMap = {};
        this.actionMap = {};

        // Populate activeKeyMap and actionMap from the current instrument config
        if (currentInstrumentConfig) {
            for (const instrumentName in currentInstrumentConfig) {
                const instrument = currentInstrumentConfig[instrumentName];
                instrument.keys.forEach(key => {
                    let physicalKey;
                    if (typeof key === 'string') {
                        physicalKey = `Key${key}`;
                    } else { // Assuming number for gamepad button index
                        physicalKey = `GamepadButton${key}`;
                    }
                    const action = `ACTION_${key}`;
                    this.activeKeyMap[physicalKey] = action;
                    this.actionMap[action] = physicalKey;
                });
            }
        }
    }

    init() {
        // イベントリスナーはconstructorで設定済みなので不要
    }

    destroy() {
        // イベントリスナーはconstructorで設定済みなので不要
    }

    handleKeyDown(e) {
        if (this.pressedKeys.has(e.code)) return;
        this.pressedKeys.add(e.code);

        const action = this.activeKeyMap[e.code]; // Use activeKeyMap
        if (action) {
            this.actionsDown.add(action);
        }
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);

        const action = this.activeKeyMap[e.code]; // Use activeKeyMap
        if (action) {
            // If a key is released, ensure its action is no longer considered "down"
            // This is important for actions that might be held down
            // this.actionsDown.delete(action); // This is handled by clearPressedActions
        }
    }

    // ★このフレームで押されたか？
    isActionPressed(action) {
        return this.actionsDown.has(action);
    }

    // ★現在押されている状態か？ (新設)
    isActionDown(action) {
        const physicalKey = this.actionMap[action];
        return this.pressedKeys.has(physicalKey);
    }

    clearPressedActions() {
        this.actionsDown.clear();
    }

    // ゲームパッドの状態を更新する
    updateGamepads() {
        const gamepadsFromAPI = navigator.getGamepads();
        // Update properties of gamepads we know are connected (from event listeners)
        for (let i = 0; i < this.gamepads.length; i++) {
            const gamepadInArray = this.gamepads[i];
            if (gamepadInArray) {
                const currentApiState = gamepadsFromAPI[gamepadInArray.index];
                if (currentApiState) {
                    // Update the gamepad object in our array with the latest state
                    this.gamepads[i] = currentApiState;
                }
                // Do NOT remove from this.gamepads here. Let gamepaddisconnected event handle it.
            }
        }

        // Now, check for connection status change and update active key map
        const currentGamepadConnectedStatus = this.isGamepadConnected();
        if (currentGamepadConnectedStatus !== this.lastGamepadConnectedStatus) {
            this._updateActiveKeyMap();
            this.lastGamepadConnectedStatus = currentGamepadConnectedStatus;
        }

        // Process buttons for the currently active key map
        // This part remains similar to previous implementation, using this.activeKeyMap
        // and populating this.pressedKeys and this.actionsDown
        // (This part is not included in the old_string/new_string for brevity,
        // but it's implied to be after the connection status check)
    }

    // 指定されたプレイヤーのゲームパッドのボタンが押されているか
    isGamepadButtonPressed(playerIndex, buttonIndex) {
        if (this.gamepads[playerIndex] && this.gamepads[playerIndex].buttons[buttonIndex]) {
            return this.gamepads[playerIndex].buttons[buttonIndex].pressed;
        }
        return false;
    }

    // 指定されたプレイヤーのゲームパッドの軸の値を取得する
    getGamepadAxis(playerIndex, axisIndex) {
        if (this.gamepads[playerIndex] && this.gamepads[playerIndex].axes[axisIndex] !== undefined) {
            // デッドゾーンを設けることで、わずかな傾きを無視する
            const threshold = 0.1;
            if (Math.abs(this.gamepads[playerIndex].axes[axisIndex]) > threshold) {
                return this.gamepads[playerIndex].axes[axisIndex];
            }
        }
        return 0;
    }

    pollGamepads() {
        this.updateGamepads();
        requestAnimationFrame(() => this.pollGamepads());
    }

    // ゲームパッドが1つでも接続されているか
    isGamepadConnected() {
        return this.gamepads.some(gamepad => gamepad !== undefined && gamepad !== null);
    }
}