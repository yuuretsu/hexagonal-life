class Vec {
    /**
     * 2D-вектор.
     * @param x Координата X
     * @param y Координата Y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `${~~this.x}x${~~this.y}`;
    }
}
class Point extends Vec {
    constructor(x, y) {
        super(x, y);
    }
}
function limitNumber(min, max, number) {
    return Math.min(Math.max(number, min), max);
}
function fixateNumber(min, max, number) {
    return number >= min ? number % max : max - (-number % max);
}
/**
 * Возвращает целое число в диапазоне от bottom до top, но не включительно.
 * @param bottom Нижняя граница
 * @param top Верхняя граница
 */
function randInt(bottom, top) {
    return Math.floor(Math.random() * (top - bottom)) + bottom;
}
class Canvas {
    constructor(size, node) {
        this.node = node ? node : document.createElement("canvas");
        this.ctx = this.node.getContext("2d");
        this.size = size;
    }
    static roundedRect(coords, size, radius) {
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
    static circle(point, radius) {
        const path = new Path2D();
        path.arc(point.x, point.y, radius, 0, Math.PI * 2);
        return path;
    }
    set size(size) {
        this.width = size.x;
        this.height = size.y;
    }
    get size() { return new Vec(this.node.width, this.node.height); }
    set width(width) { this.node.width = width; }
    get width() { return this.node.width; }
    set height(height) { this.node.height = height; }
    get height() { return this.node.height; }
    set fillStyle(style) { this.ctx.fillStyle = style; }
    get fillStyle() { return this.ctx.fillStyle; }
    set strokeStyle(style) { this.ctx.strokeStyle = style; }
    get strokeStyle() { return this.ctx.strokeStyle; }
    fillPath(path, style) {
        this.ctx.save();
        if (style)
            this.fillStyle = style;
        this.ctx.fill(path);
        this.ctx.restore();
    }
    strokePath(path, style) {
        this.ctx.save();
        if (style)
            this.strokeStyle = style;
        this.ctx.stroke(path);
        this.ctx.restore();
    }
    fill(style) {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, 1, 0, 0);
        if (style)
            this.fillStyle = style;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }
    clear() {
        this.ctx.save();
        this.ctx.transform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }
    clearRect(point, size) {
        this.ctx.clearRect(point.x, point.y, size.x, size.y);
    }
    drawImage(image, coords) {
        this.ctx.drawImage(image, coords.x, coords.y);
    }
    simpleText(point, text, style, type) {
        this.ctx.save();
        this.fillStyle = style;
        switch (type) {
            case "normal":
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "alphabetic";
                break;
            case "center":
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                break;
            case "top":
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = "top";
                break;
            case "right":
                this.ctx.textAlign = "right";
                this.ctx.textBaseline = "alphabetic";
                break;
        }
        this.ctx.font = '14px consolas';
        this.ctx.fillText(text, point.x, point.y);
        this.ctx.restore();
    }
    simpleTable(point, width, table) {
        point = new Vec(point.x + 10, point.y + 20);
        for (const i in table) {
            this.simpleText(new Vec(point.x, point.y + i * 20), table[i][0], "black", "normal");
        }
        for (const i in table) {
            this.simpleText(new Vec(point.x + width, point.y + i * 20), table[i][1], "black", "right");
        }
    }
}
class World {
    /**
     * Мир.
     * @param size Размеры мира в ширину и высоту
     * @param hexRadius Радиус гексагона
     * @param canvas Холст, на котором будет графика
     */
    constructor(size, hexRadius, canvas) {
        this.size = size;
        this.hexRadius = hexRadius;
        this.hexSize = new Vec(hexRadius * 2, hexRadius * Math.sqrt(3));
        this.imgBorder = 20;
        this.cornerRadius = this.imgBorder + this.hexRadius;
        this.imageSize = new Vec(this.hexSize.x * size.x + hexRadius + this.imgBorder * 2, ((size.y - 1) * this.hexSize.y + this.hexSize.x) + this.imgBorder * 2);
        this.camera = new Vec(this.imageSize.x / 2, this.imageSize.y / 2);
        this.canvas = canvas;
        this.gridImage = new Canvas(this.imageSize);
        const radius = limitNumber(2, Infinity, hexRadius * 0.25);
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                const point = this.getLocalHexCenter(new Vec(x, y));
                this.gridImage.fillPath(Canvas.circle(point, radius), 'rgba(200, 200, 200, 0.5)');
            }
        }
    }
    /**
     * Возвращает центр гексагона на картинке.
     * @param coords Координаты гексагона
     */
    getLocalHexCenter(coords) {
        const ifEven = coords.x * this.hexSize.x + this.hexRadius + this.imgBorder;
        const ifOdd = (coords.x + 1) * this.hexSize.x + this.imgBorder;
        const x = coords.y % 2 === 0 ? ifEven : ifOdd;
        const y = coords.y * this.hexSize.y + this.hexRadius + this.imgBorder;
        return new Vec(x, y);
    }
    updateDrawingPoint() {
        this.drawingPoint = new Vec(this.camera.x - this.imageSize.x + this.canvas.width / 2, this.camera.y - this.imageSize.y + this.canvas.height / 2);
    }
}
class HexImage {
    constructor(world) {
        this.world = world;
        this.layers = [];
        for (let x = 0; x < 2; x++) {
            this.layers[x] = [];
            for (let y = 0; y < 2; y++) {
                this.layers[x][y] = new Canvas(world.imageSize);
            }
        }
    }
    getLayer(coords) {
        return this.layers[coords.x % 2][coords.y % 2];
    }
    draw() {
        for (const x in this.layers) {
            for (const y in this.layers[x]) {
                this.world.canvas.drawImage(this.layers[x][y].node, this.world.drawingPoint);
            }
        }
    }
    fillCircle(coords, radius, style) {
        const point = this.world.getLocalHexCenter(coords);
        this.getLayer(coords).fillPath(Canvas.circle(point, Math.min(radius, this.world.hexRadius)), style);
    }
    clearAt(coords) {
        const point = this.world.getLocalHexCenter(coords);
        const r = this.world.hexRadius * 1.5;
        this.getLayer(coords).clearRect(new Vec(point.x - r, point.y - r), new Vec(r * 2, r * 2));
    }
}
class Grid {
    constructor(world) {
        this.world = world;
        this.size = world.size;
        this.cells = [];
        for (let x = 0; x < world.size.x; x++) {
            this.cells[x] = [];
            for (let y = 0; y < world.size.y; y++) {
                this.cells[x][y] = null;
            }
        }
    }
    fixateCoords(coords) {
        return new Vec(fixateNumber(0, this.size.x, coords.x), fixateNumber(0, this.size.y, coords.y));
    }
    getAt(point) {
        return this.cells[point.x][point.y];
    }
    setAt(point, obj) {
        if (this.cells[point.x][point.y] == null) {
            this.cells[point.x][point.y] = obj;
        }
        else {
            throw `Клетка ${point} занята`;
        }
    }
    deleteAt(point) {
        this.cells[point.x][point.y] = null;
    }
    getRandom() {
        return new Vec(randInt(0, this.size.x), randInt(0, this.size.y));
    }
    getRandomEmpty() {
        let point;
        do {
            point = this.getRandom();
        } while (this.cells[point.x][point.y]);
        return point;
    }
}
function start(world, update, draw) {
    (function loop() {
        world.updateDrawingPoint();
        update();
        world.canvas.clear();
        world.canvas.fillPath(Canvas.roundedRect(world.drawingPoint, world.imageSize, world.cornerRadius), 'rgb(240, 240, 240)');
        world.canvas.drawImage(world.gridImage.node, world.drawingPoint);
        draw();
        requestAnimationFrame(loop);
    }());
}
function update() {
    canvas.size = new Vec(innerWidth, innerHeight);
    grid = getNextWorld(grid);
}
function draw() {
    image.draw();
}
function randomize(grid) {
    const newGrid = new Grid(grid.world);
    for (let x = 0; x < grid.size.x; x++) {
        for (let y = 0; y < grid.size.y; y++) {
            const val = randInt(0, 2);
            const coords = new Vec(x, y);
            newGrid.setAt(coords, val);
            if (val === 1)
                image.fillCircle(coords, RADIUS, 'rgb(100, 100, 100)');
        }
    }
    return newGrid;
}
function getNextWorld(grid) {
    const newGrid = new Grid(grid.world);
    for (let x = 0; x < grid.size.x; x++) {
        for (let y = 0; y < grid.size.y; y++) {
            const coords = new Vec(x, y);
            const nowCell = grid.getAt(coords);
            const nextCell = getNextCell(nowCell, getAround(grid, coords));
            newGrid.setAt(coords, nextCell);
            if (nowCell === 0) {
                if (nextCell === 1)
                    image.fillCircle(coords, RADIUS, 'rgb(100, 100, 100)');
            }
            else {
                if (nextCell === 0)
                    image.clearAt(coords);
            }
        }
    }
    return newGrid;
}
function getNextCell(alive, around) {
    let next;
    if (alive === 0) {
        if (birthRule.includes(around)) {
            next = 1;
        }
        else {
            next = 0;
        }
    }
    else {
        if (surviveRule.includes(around)) {
            next = 1;
        }
        else {
            next = 0;
        }
    }
    return next;
}
function getLocalAroundCoords(coords) {
    return coords.y % 2 === 0 ? [
        new Vec(1, 0),
        new Vec(0, -1),
        new Vec(-1, -1),
        new Vec(-1, 0),
        new Vec(-1, 1),
        new Vec(0, 1),
    ] : [
        new Vec(1, 0),
        new Vec(1, -1),
        new Vec(0, -1),
        new Vec(-1, 0),
        new Vec(0, 1),
        new Vec(1, 1),
    ];
}
function getAround(world, coords) {
    let around = 0;
    for (const local of getLocalAroundCoords(coords)) {
        const globalCoords = world.fixateCoords(new Vec(coords.x + local.x, coords.y + local.y));
        around += world.getAt(globalCoords);
    }
    return around;
}
const worldSize = new Vec(150, 80);
const RADIUS = 4;
const canvas = new Canvas(new Vec(innerWidth, innerHeight), document.getElementById("canvas"));
const world = new World(worldSize, RADIUS, canvas);
let birthRule = [1];
let surviveRule = [2, 3];
let image;
let grid;
function restart() {
    image = new HexImage(world);
    grid = randomize(new Grid(world));
    getRules();
}
function getRules() {
    birthRule = [];
    for (let i = 0; i <= 6; i++) {
        const input = document.getElementById(`b${i}`);
        if (input.checked)
            birthRule.push(i);
    }
    surviveRule = [];
    for (let i = 0; i <= 6; i++) {
        const input = document.getElementById(`s${i}`);
        if (input.checked)
            surviveRule.push(i);
    }
    console.log(birthRule, surviveRule);
}
document.getElementById("restartButton").onclick = restart;
document.getElementById("setRulesButton").onclick = getRules;
restart();
start(world, update, draw);
