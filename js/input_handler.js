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
        this.touched = false; // ★追加: タッチされたかどうか

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // ★追加: タッチイベント
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });

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

    // ★追加: タッチ開始ハンドラ
    handleTouchStart(e) {
        e.preventDefault(); // デフォルトのタッチ操作（スクロールなど）を無効化
        this.touched = true;
    }

    // ★追加: タッチ状態をチェックするメソッド
    isTouch() {
        const touchState = this.touched;
        this.touched = false; // 状態を一度読んだらリセット
        return touchState;
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

        console.log('Updating active key map. Gamepad connected:', isConnected);
        console.log('Current instrument config:', currentInstrumentConfig);

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
        
        console.log('Active key map:', this.activeKeyMap);
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
            // This is handled by clearPressedActions
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

    // ★特定のキーが押されているか？ (新設)
    isKeyPressed(keyCode) {
        return this.pressedKeys.has(keyCode);
    }

    // 現在選択されている楽器のアクションキーに対応する物理キーのSetを返す
    getInstrumentPhysicalKeys() {
        const instrumentPhysicalKeys = new Set();
        // activeKeyMapのキーは物理キーコードなので、そのまま追加
        for (const physicalKey in this.activeKeyMap) {
            instrumentPhysicalKeys.add(physicalKey);
        }
        return instrumentPhysicalKeys;
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
        this.processGamepadButtons();
    }

    // ゲームパッドのボタン状態を処理する
    processGamepadButtons() {
        if (!this.isGamepadConnected()) return;

        // 接続されているゲームパッドを処理
        this.gamepads.forEach((gamepad, index) => {
            if (!gamepad) return;

            // 各ボタンをチェック
            gamepad.buttons.forEach((button, buttonIndex) => {
                const physicalKey = `GamepadButton${buttonIndex}`;
                const action = this.activeKeyMap[physicalKey];

                if (button.pressed) {
                    // ボタンが押されている
                    if (!this.pressedKeys.has(physicalKey)) {
                        // 新しく押された
                        this.pressedKeys.add(physicalKey);
                        if (action) {
                            this.actionsDown.add(action);
                        }
                    }
                } else {
                    // ボタンが離されている
                    if (this.pressedKeys.has(physicalKey)) {
                        // 離された
                        this.pressedKeys.delete(physicalKey);
                    }
                }
            });
        });
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