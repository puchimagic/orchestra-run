export class Scrollbar {
    constructor(x, y, width, height, contentHeight) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; // スクロールバーの高さ (表示領域の高さ)
        this.contentHeight = contentHeight; // スクロール可能なコンテンツの総高さ

        this.scrollPosition = 0; // 現在のスクロール位置 (0から1の範囲)
        this.isDragging = false;
        this.dragOffsetY = 0; // ドラッグ開始時のオフセット
    }

    // スクロール可能なコンテンツの総高さを更新
    updateContentHeight(newContentHeight) {
        this.contentHeight = newContentHeight;
        this.scrollPosition = Math.max(0, Math.min(1, this.scrollPosition)); // 範囲内にクランプ
    }

    // スクロールバーのつまみの高さを計算
    getThumbHeight() {
        if (this.contentHeight <= this.height) return this.height; // コンテンツが短い場合はスクロールバー全体
        return Math.max(40, this.height * (this.height / this.contentHeight)); // 最小高さを40に設定
    }

    // スクロールバーのつまみのY座標を計算
    getThumbY() {
        const thumbHeight = this.getThumbHeight();
        return this.y + (this.height - thumbHeight) * this.scrollPosition;
    }

    // マウスがスクロールバーのつまみの上にあるか
    isMouseOverThumb(mouseX, mouseY) {
        const thumbY = this.getThumbY();
        const thumbHeight = this.getThumbHeight();
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= thumbY && mouseY <= thumbY + thumbHeight;
    }

    // マウスがスクロールバーのバーの上にあるか
    isMouseOverBar(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
               mouseY >= this.y && mouseY <= this.y + this.height;
    }

    handleMouseDown(mouseX, mouseY) {
        if (this.isMouseOverThumb(mouseX, mouseY)) {
            this.isDragging = true;
            this.dragOffsetY = mouseY - this.getThumbY();
            return true;
        }
        if (this.isMouseOverBar(mouseX, mouseY)) {
            // バーをクリックした場合、クリック位置につまみを移動
            const clickY = mouseY - this.y;
            const thumbHeight = this.getThumbHeight();
            this.scrollPosition = (clickY - thumbHeight / 2) / (this.height - thumbHeight);
            this.scrollPosition = Math.max(0, Math.min(1, this.scrollPosition));
            return true;
        }
        return false;
    }

    handleMouseMove(mouseX, mouseY) {
        if (this.isDragging) {
            const newThumbY = mouseY - this.dragOffsetY;
            const thumbHeight = this.getThumbHeight();
            this.scrollPosition = (newThumbY - this.y) / (this.height - thumbHeight);
            this.scrollPosition = Math.max(0, Math.min(1, this.scrollPosition));
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    // スクロール量をピクセル単位で受け取り、scrollPosition を更新
    scrollBy(deltaY) {
        if (this.contentHeight <= this.height) return; // スクロール不要

        const scrollableHeight = this.contentHeight - this.height;
        const currentScrollOffset = this.getScrollOffset();
        let newScrollOffset = currentScrollOffset + deltaY;

        // 範囲内にクランプ
        newScrollOffset = Math.max(0, Math.min(scrollableHeight, newScrollOffset));

        this.scrollPosition = newScrollOffset / scrollableHeight;
    }

    // スクロールオフセットをピクセル単位で取得
    getScrollOffset() {
        if (this.contentHeight <= this.height) return 0;
        return (this.contentHeight - this.height) * this.scrollPosition;
    }

    draw(ctx) {
        if (this.contentHeight <= this.height) return; // スクロール不要なら描画しない (コメントアウトを解除)

        // スクロールバーの背景
        ctx.fillStyle = '#eee';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // スクロールバーのつまみ
        ctx.fillStyle = '#ccc';
        ctx.fillRect(this.x, this.getThumbY(), this.width, this.getThumbHeight());
    }
}