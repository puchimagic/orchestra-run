export class InputHandler {
    constructor() {
        this.activeKeyMap = {};
        this.pressedKeys = new Set();
        this.actionsDown = new Set();
        this.actionMap = {};
        this.gamepads = [];

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        window.addEventListener('gamepadconnected', e => {
            this.gamepads[e.gamepad.index] = e.gamepad;
        });

        window.addEventListener('gamepaddisconnected', e => {
            delete this.gamepads[e.gamepad.index];
        });

        this.pollGamepads();
    }

    // 演奏操作(足場生成・木の破壊)はキャラ操作の入力方法に関わらず常にキーボードの
    // キーで判定するため、ここではキーボード用のキーマップのみを組み立てる
    setInstrumentKeyMaps(instrumentConfig) {
        this.activeKeyMap = {};
        this.actionMap = {};

        if (instrumentConfig) {
            for (const instrumentName in instrumentConfig) {
                const instrument = instrumentConfig[instrumentName];
                instrument.keys.forEach(key => {
                    const physicalKey = `Key${key}`;
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
        const gamepadsFromAPI = navigator.getGamepads();
        for (let i = 0; i < this.gamepads.length; i++) {
            if (this.gamepads[i]) {
                const currentApiState = gamepadsFromAPI[this.gamepads[i].index];
                if (currentApiState) this.gamepads[i] = currentApiState;
            }
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
