export class InputHandler {
    constructor(keyMap) {
        this.keyMap = keyMap; // e.g., { 'KeyJ': 'ACTION_1', 'KeyK': 'ACTION_2' }
        this.pressedKeys = new Set();
        this.actionsDown = new Set(); // 現在フレームで押されたアクション

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (this.pressedKeys.has(e.code)) return; // 長押しによる連続発火を防ぐ
        this.pressedKeys.add(e.code);

        const action = this.keyMap[e.code];
        if (action) {
            this.actionsDown.add(action);
        }
    }

    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);
    }

    // アクションがこのフレームで押されたか？
    isActionPressed(action) {
        return this.actionsDown.has(action);
    }

    // ゲームループの最後に呼ぶ
    clearPressedActions() {
        this.actionsDown.clear();
    }
}
