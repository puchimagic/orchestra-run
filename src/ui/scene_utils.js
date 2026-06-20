export function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

export function drawBackground(ctx, image, width, height, fallbackColor = '#f0f0f0') {
    if (image.complete && image.naturalHeight !== 0) {
        ctx.drawImage(image, 0, 0, width, height);
    } else {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(0, 0, width, height);
    }
}
