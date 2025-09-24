export class InputHandler {
    constructor() {
        this.keyMap = {};
        this.pressedKeys = new Set(); // 現在押されているキー
        this.actionsDown = new Set();   // このフレームで押されたアクション
        this.actionMap = {}; // 逆引き用
    }

    setKeyMap(keyMap) {
        this.keyMap = keyMap;
        this.actionMap = {};
        for (const key in keyMap) {
            this.actionMap[keyMap[key]] = key;
        }
    }

    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
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
}
