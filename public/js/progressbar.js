class ProgressBar {
    constructor(min, max, width, height) {
        this.min = min;
        this.max = max;
        this.width = width;
        this.height = height;
        this.value = 15;
    }

    setValue(x) {
        this.value = x;
    }

    draw(ctx, x, y, color) {
        const val = this.value * this.width / this.max;
        ctx.fillStyle = "#888888";
        ctx.fillRect(x - 2, y - 2, this.width + 4, this.height + 4);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, val, this.height);
    }
}