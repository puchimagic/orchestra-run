export class InputHandler {
    constructor() {
        this.keyMap = {};
        this.pressedKeys = new Set(); // 現在押されているキー
        this.actionsDown = new Set();   // このフレームで押されたアクション
        this.actionMap = {}; // 逆引き用
        this.gamepads = []; // ゲームパッドを格納する配列

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

    setKeyMap(keyMap) {
        this.keyMap = keyMap;
        this.actionMap = {};
        for (const key in keyMap) {
            this.actionMap[keyMap[key]] = key;
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

        const action = this.keyMap[e.code];
        if (action) {
            this.actionsDown.add(action);
        }
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);
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
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                this.gamepads[i] = gamepads[i];
            }
        }
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
}