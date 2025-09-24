import { FONT_SIZE, FONT_FAMILY } from '../config.js';

export class Button {
    constructor(x, y, width, height, text, color = '#888', hoverColor = '#aaa') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.hoverColor = hoverColor;
        this.isHovered = false;
    }

    update(mouse) {
        if (mouse.x >= this.x && mouse.x <= this.x + this.width &&
            mouse.y >= this.y && mouse.y <= this.y + this.height) {
            this.isHovered = true;
            if (mouse.clicked) {
                return true; // Button was clicked
            }
        } else {
            this.isHovered = false;
        }
        return false; // Button was not clicked
    }

    draw(ctx) {
        // Draw button
        ctx.fillStyle = this.isHovered ? this.hoverColor : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw text
        ctx.fillStyle = '#fff';
        ctx.font = `${FONT_SIZE.SMALL}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}
