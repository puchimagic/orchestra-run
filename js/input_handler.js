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

        this.activated = false;
        this.mouseDown = false; // マウスボタンの状態を追加

        const activateOnce = () => {
            this.activated = true;
            // window.removeEventListener('keydown', activateOnce); // 削除
            window.removeEventListener('mousedown', activateOnce);
            window.removeEventListener('touchstart', activateOnce);
        };
        // window.addEventListener('keydown', activateOnce); // この行を削除
        window.addEventListener('mousedown', activateOnce);
        window.addEventListener('touchstart', activateOnce);

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // マウスイベントをInputHandlerで管理
        window.addEventListener('mousedown', () => { this.mouseDown = true; });
        window.addEventListener('mouseup', () => { this.mouseDown = false; });

        window.addEventListener('gamepadconnected', e => {
            this.gamepads[e.gamepad.index] = e.gamepad;
        });

        window.addEventListener('gamepaddisconnected', e => {
            delete this.gamepads[e.gamepad.index];
        });

        this.pollGamepads();
    }

    isActivated() {
        return this.activated;
    }

    // マウスボタンが押されているか
    isMouseDown() {
        return this.mouseDown;
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
                    let physicalKey;
                    if (typeof key === 'string') physicalKey = `Key${key}`;
                    else physicalKey = `GamepadButton${key}`;
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

    isActionPressed(action) {
        return this.actionsDown.has(action);
    }

    isActionDown(action) {
        const physicalKey = this.actionMap[action];
        return this.pressedKeys.has(physicalKey);
    }

    isKeyPressed(keyCode) {
        return this.pressedKeys.has(keyCode);
    }

    getInstrumentPhysicalKeys() {
        return new Set(Object.keys(this.activeKeyMap));
    }

    clearPressedActions() {
        this.actionsDown.clear();
    }

    updateGamepads() {
        const gamepadsFromAPI = navigator.getGamepads();
        for (let i = 0; i < this.gamepads.length; i++) {
            if (this.gamepads[i]) {
                const currentApiState = gamepadsFromAPI[this.gamepads[i].index];
                if (currentApiState) this.gamepads[i] = currentApiState;
            }
        }

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
