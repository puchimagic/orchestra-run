import { FONT_FAMILY } from '../config.js';

export class VolumeSlider {
    constructor(x, y, width, height, label, initialValue, setterFunction) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.label = label;
        this.value = initialValue; // 0.0 to 1.0
        this.setterFunction = setterFunction;

        this.isDragging = false;
        this.thumbRadius = height / 2; // つまみの半径
    }

    draw(ctx) {
        // スライダーの背景バー
        ctx.fillStyle = '#ccc';
        ctx.fillRect(this.x, this.y + this.height / 4, this.width, this.height / 2);

        // スライダーの進捗バー
        ctx.fillStyle = '#007bff';
        ctx.fillRect(this.x, this.y + this.height / 4, this.width * this.value, this.height / 2);

        // つまみ
        const thumbX = this.x + this.width * this.value;
        const thumbY = this.y + this.height / 2;
        ctx.beginPath();
        ctx.arc(thumbX, thumbY, this.thumbRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.isDragging ? '#0056b3' : '#007bff';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ラベルと値
        ctx.fillStyle = 'black';
        ctx.font = `24px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, this.x, this.y - 15); // スライダーの上にラベル

        ctx.textAlign = 'right';
        ctx.fillText(`${(this.value * 100).toFixed(0)}%`, this.x + this.width, this.y - 15); // スライダーの上に値
    }

    // マウスがスライダーのつまみの上にあるか
    isMouseOverThumb(mouseX, mouseY) {
        const thumbX = this.x + this.width * this.value;
        const thumbY = this.y + this.height / 2;
        const distance = Math.sqrt(Math.pow(mouseX - thumbX, 2) + Math.pow(mouseY - thumbY, 2));
        return distance < this.thumbRadius;
    }

    // マウスがスライダーのバーの上にあるか
    isMouseOverBar(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y + this.height / 4 && mouseY <= this.y + this.height * 3 / 4;
    }

    handleMouseDown(mouseX, mouseY) {
        if (this.isMouseOverThumb(mouseX, mouseY) || this.isMouseOverBar(mouseX, mouseY)) {
            this.isDragging = true;
            this.updateValueFromMouse(mouseX);
            return true; // イベントを処理したことを示す
        }
        return false;
    }

    handleMouseMove(mouseX) {
        if (this.isDragging) {
            this.updateValueFromMouse(mouseX);
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    updateValueFromMouse(mouseX) {
        let newValue = (mouseX - this.x) / this.width;
        newValue = Math.max(0, Math.min(1, newValue)); // 0から1の範囲にクランプ
        // newValue = Math.round(newValue * 100) / 100; // ★削除
        this.value = newValue; // ★条件を削除し、常に更新
        this.setterFunction(this.value);
    }
}