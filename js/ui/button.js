import { FONT_SIZE, FONT_FAMILY, SELECTED_BUTTON_COLOR, SELECTED_BUTTON_HOVER_COLOR, DEFAULT_BUTTON_COLOR, DEFAULT_BUTTON_HOVER_COLOR } from '../config.js';
import { soundPlayer } from '../../soundPlayer.js';

export class Button {
    constructor(x, y, width, height, text, color = DEFAULT_BUTTON_COLOR, hoverColor = DEFAULT_BUTTON_HOVER_COLOR, clickSoundKey = "score", clickSoundType = "gameSound") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.hoverColor = hoverColor;
        this.isHovered = false;
        this.isHighlighted = false; // 追加
        this.clickSoundKey = clickSoundKey;
        this.clickSoundType = clickSoundType; // 追加
    }

    update(mouse) {
        if (mouse.x >= this.x && mouse.x <= this.x + this.width &&
            mouse.y >= this.y && mouse.y <= this.y + this.height) {
            this.isHovered = true;
            if (mouse.clicked) {
                // clickSoundType に応じて適切なサウンド再生メソッドを呼び出す
                if (this.clickSoundType === "gameSound") {
                    soundPlayer.playGameSound(this.clickSoundKey);
                } else if (this.clickSoundType === "instrumentSound") {
                    soundPlayer.playSound(this.clickSoundKey);
                }
                return true; // ボタンがクリックされた
            }
        } else {
            this.isHovered = false;
        }
        return false; // ボタンはクリックされなかった
    }

    draw(ctx, scale = 1) {
        // ボタンを描画
        let currentColor = this.color;
        let currentHoverColor = this.hoverColor;

        if (this.isHighlighted) {
            currentColor = SELECTED_BUTTON_COLOR;
            currentHoverColor = SELECTED_BUTTON_HOVER_COLOR;
        }

        ctx.fillStyle = this.isHovered ? currentHoverColor : currentColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // テキストを描画
        ctx.fillStyle = '#fff';
        // フォントサイズにスケールを適用
        const scaledFontSize = FONT_SIZE.MEDIUM; // FONT_SIZE.SMALL から FONT_SIZE.MEDIUM に変更
        ctx.font = `${scaledFontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}