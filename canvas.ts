type DrawStyle = string | CanvasGradient | CanvasPattern;

class Canvas {
    readonly node: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    static roundedRect(coords: Vec, size: Vec, radius: number) {
        const path = new Path2D();
        radius = Math.min(radius, Math.min(size.x, size.y) / 2);
        path.moveTo(coords.x + radius, coords.y);
        path.moveTo(coords.x + radius, coords.y);
        path.arcTo(coords.x + size.x, coords.y, coords.x + size.x, coords.y + size.y, radius);
        path.arcTo(coords.x + size.x, coords.y + size.y, coords.x + radius, coords.y + size.y, radius);
        path.arcTo(coords.x, coords.y + size.y, coords.x, coords.y + radius, radius);
        path.arcTo(coords.x, coords.y, coords.x + radius, coords.y, radius);
        return path;
    }
    static circle(point: Vec, radius: number): Path2D {
        const path = new Path2D();
        path.arc(point.x, point.y, radius, 0, Math.PI * 2);
        return path;
    }
    constructor(size: Vec, node?: HTMLCanvasElement) {
        this.node = node ? node : document.createElement("canvas");
        this.ctx = this.node.getContext("2d");
        this.size = size;
    }
    set size(size: Vec) {
        this.width = size.x;
        this.height = size.y;
    }
    get size() { return new Vec(this.node.width, this.node.height); }
    set width(width) { this.node.width = width; }
    get width() { return this.node.width; }
    set height(height) { this.node.height = height; }
    get height() { return this.node.height; }
    set fillStyle(style: DrawStyle) { this.ctx.fillStyle = style; }
    get fillStyle() { return this.ctx.fillStyle; }
    set strokeStyle(style: DrawStyle) { this.ctx.strokeStyle = style; }
    get strokeStyle() { return this.ctx.strokeStyle; }
    fillPath(path: Path2D, style?: DrawStyle) {
        this.ctx.save();
        if (style) this.fillStyle = style;
        this.ctx.fill(path);
        this.ctx.restore();
    }
    strokePath(path: Path2D, style?: DrawStyle) {
        this.ctx.save();
        if (style) this.strokeStyle = style;
        this.ctx.stroke(path);
        this.ctx.restore();
    }
    fill(style?: DrawStyle) {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, 1, 0, 0);
        if (style) this.fillStyle = style;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }
    clear() {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }
    clearRect(point: Vec, size: Vec) {
        this.ctx.clearRect(point.x, point.y, size.x, size.y);
    }
    drawImage(image: CanvasImageSource, coords: Vec) {
        this.ctx.drawImage(image, coords.x, coords.y);
    }
    simpleText(
        point: Vec,
        text: string,
        style: DrawStyle,
        type: "normal" | "center" | "top" | "right"
    ) {
        this.ctx.save();
        this.fillStyle = style;
        switch (type) {
            case "normal":
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "alphabetic"
                break;
            case "center":
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle"
                break;
            case "top":
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "top"
                break;
            case "right":
                this.ctx.textAlign = "right";
                this.ctx.textBaseline = "alphabetic"
                break;
        }
        this.ctx.font = '14px consolas'
        this.ctx.fillText(text, point.x, point.y);
        this.ctx.restore();
    }
    simpleTable(point: Vec, width: number, table: string[][]) {
        point = new Vec(point.x + 10, point.y + 20);
        for (const i in table) {
            this.simpleText(
                new Vec(point.x, point.y + <number><unknown>i * 20),
                table[i][0],
                "black",
                "normal"
            );
        }
        for (const i in table) {
            this.simpleText(
                new Vec(point.x + width, point.y + <number><unknown>i * 20),
                table[i][1],
                "black",
                "right"
            );
        }
    }
}