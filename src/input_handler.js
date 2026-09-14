export class InputHandler {
    constructor() {
        this.activeKeyMap = {};
        this.pressedKeys = new Set();
        this.actionsDown = new Set();
        this.actionMap = {};
        this.gamepads = [];

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // ゲームパッドの接続状態はupdateGamepads()がnavigator.getGamepads()から
        // 毎フレーム直接同期するため、gamepadconnected/disconnectedイベントの
        // 個別ハンドリングは不要
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
        // navigator.getGamepads()を直接ソースオブトゥルースとして毎フレーム同期する。
        // gamepad.indexは0とは限らないため、gamepadconnectedイベント経由の
        // 個別追跡はせず、常に配列全体をそのまま反映する。
        const gamepadsFromAPI = navigator.getGamepads();
        this.gamepads = Array.from(gamepadsFromAPI).map(gp => gp || undefined);

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

    // ブラウザが割り当てるgamepad.indexは0とは限らない（他のゲームパッドが
    // 過去に接続された形跡が残っている等の理由で1以上になることがある）。
    // このゲームは1台のゲームパッドしか想定していないため、接続されている
    // 最初の有効なゲームパッドを使う。
    getFirstConnectedGamepad() {
        return this.gamepads.find(gp => gp);
    }

    isGamepadButtonPressed(playerIndex, buttonIndex) {
        return this.getFirstConnectedGamepad()?.buttons[buttonIndex]?.pressed || false;
    }

    getGamepadAxis(playerIndex, axisIndex) {
        const axisValue = this.getFirstConnectedGamepad()?.axes[axisIndex];
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
