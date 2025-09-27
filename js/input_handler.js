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

        // --- ▼ First Interaction Logic ▼ ---
        this.activated = false;
        const activateOnce = () => {
            this.activated = true;
            // Remove listeners after first activation
            window.removeEventListener('keydown', activateOnce);
            window.removeEventListener('mousedown', activateOnce);
            window.removeEventListener('touchstart', activateOnce);
        };
        window.addEventListener('keydown', activateOnce);
        window.addEventListener('mousedown', activateOnce);
        window.addEventListener('touchstart', activateOnce);
        // --- ▲ First Interaction Logic ▲ ---

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        window.addEventListener('gamepadconnected', e => {
            console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);
            this.gamepads[e.gamepad.index] = e.gamepad;
        });

        window.addEventListener('gamepaddisconnected', e => {
            console.log('Gamepad disconnected from index %d: %s',
                e.gamepad.index, e.gamepad.id);
            delete this.gamepads[e.gamepad.index];
        });

        this.pollGamepads();
    }

    // --- ▼ First Interaction Logic ▼ ---
    isActivated() {
        return this.activated;
    }
    // --- ▲ First Interaction Logic ▲ ---

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
                    if (typeof key === 'string') {
                        physicalKey = `Key${key}`;
                    } else { 
                        physicalKey = `GamepadButton${key}`;
                    }
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
        if (action) {
            this.actionsDown.add(action);
        }
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
        const instrumentPhysicalKeys = new Set();
        for (const physicalKey in this.activeKeyMap) {
            instrumentPhysicalKeys.add(physicalKey);
        }
        return instrumentPhysicalKeys;
    }

    clearPressedActions() {
        this.actionsDown.clear();
    }

    updateGamepads() {
        const gamepadsFromAPI = navigator.getGamepads();
        for (let i = 0; i < this.gamepads.length; i++) {
            const gamepadInArray = this.gamepads[i];
            if (gamepadInArray) {
                const currentApiState = gamepadsFromAPI[gamepadInArray.index];
                if (currentApiState) {
                    this.gamepads[i] = currentApiState;
                }
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

        this.gamepads.forEach((gamepad, index) => {
            if (!gamepad) return;

            gamepad.buttons.forEach((button, buttonIndex) => {
                const physicalKey = `GamepadButton${buttonIndex}`;
                const action = this.activeKeyMap[physicalKey];

                if (button.pressed) {
                    if (!this.pressedKeys.has(physicalKey)) {
                        this.pressedKeys.add(physicalKey);
                        if (action) {
                            this.actionsDown.add(action);
                        }
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
        if (this.gamepads[playerIndex] && this.gamepads[playerIndex].buttons[buttonIndex]) {
            return this.gamepads[playerIndex].buttons[buttonIndex].pressed;
        }
        return false;
    }

    getGamepadAxis(playerIndex, axisIndex) {
        if (this.gamepads[playerIndex] && this.gamepads[playerIndex].axes[axisIndex] !== undefined) {
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

    isGamepadConnected() {
        return this.gamepads.some(gamepad => gamepad !== undefined && gamepad !== null);
    }
}