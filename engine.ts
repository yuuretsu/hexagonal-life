class World {
    readonly size: Vec;
    readonly hexRadius: number;
    readonly hexSize: Vec;
    readonly imgBorder: number;
    readonly cornerRadius: number;
    readonly imageSize: Vec;
    readonly gridImage: Canvas;
    readonly canvas: Canvas;
    camera: Vec;
    drawingPoint: Vec;
    /**
     * Мир.
     * @param size Размеры мира в ширину и высоту
     * @param hexRadius Радиус гексагона
     * @param canvas Холст, на котором будет графика
     */
    constructor(size: Vec, hexRadius: number, canvas: Canvas) {
        this.size = size;
        this.hexRadius = hexRadius;
        this.hexSize = new Vec(
            hexRadius * 2,
            hexRadius * Math.sqrt(3),
        );
        this.imgBorder = 10;
        this.cornerRadius = this.imgBorder + this.hexRadius;
        this.imageSize = new Vec(
            this.hexSize.x * size.x + hexRadius + this.imgBorder * 2,
            ((size.y - 1) * this.hexSize.y + this.hexSize.x) + this.imgBorder * 2,
        );
        this.camera = new Vec(
            this.imageSize.x / 2,
            this.imageSize.y / 2,
        );
        this.canvas = canvas;
        this.gridImage = new Canvas(this.imageSize);

        const radius = limitNumber(2, Infinity, hexRadius * 0.25);
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                const point = this.getLocalHexCenter(new Vec(x, y));
                this.gridImage.fillPath(
                    Canvas.circle(point, radius),
                    'rgba(200, 200, 200, 0.5)'
                );
            }
        }
    }
    /**
     * Возвращает центр гексагона на картинке.
     * @param coords Координаты гексагона
     */
    getLocalHexCenter(coords: Vec): Vec {
        const ifEven = coords.x * this.hexSize.x + this.hexRadius + this.imgBorder;
        const ifOdd = (coords.x + 1) * this.hexSize.x + this.imgBorder;
        const x = coords.y % 2 === 0 ? ifEven : ifOdd;
        const y = coords.y * this.hexSize.y + this.hexRadius + this.imgBorder;
        return new Vec(x, y);
    }
    updateDrawingPoint() {
        this.drawingPoint = new Vec(
            this.camera.x - this.imageSize.x + this.canvas.width / 2,
            this.camera.y - this.imageSize.y + this.canvas.height / 2,
        ).round();
    }
}

class HexImage {
    readonly world: World;
    readonly layers: any[];
    constructor(world: World) {
        this.world = world;
        this.layers = [];
        for (let x = 0; x < 2; x++) {
            this.layers[x] = [];
            for (let y = 0; y < 2; y++) {
                this.layers[x][y] = new Canvas(world.imageSize);
            }
        }
    }
    getLayer(coords: Vec): Canvas {
        return this.layers[coords.x % 2][coords.y % 2];
    }
    draw(): void {
        for (const x in this.layers) {
            for (const y in this.layers[x]) {
                this.world.canvas.drawImage(this.layers[x][y].node, this.world.drawingPoint);
            }
        }
    }
    fillCircle(coords: Vec, radius: number, style: DrawStyle) {
        const point = this.world.getLocalHexCenter(coords);
        const layer = this.getLayer(coords);
        layer.ctx.fillStyle = style;
        layer.ctx.beginPath();
        layer.ctx.arc(
            point.x,
            point.y,
            Math.min(radius, this.world.hexRadius),
            0,
            Math.PI * 2
        );
        layer.ctx.fill();
    }
    clearAt(coords: Vec) {
        const point = this.world.getLocalHexCenter(coords);
        const r = this.world.hexRadius * 1.5;
        this.getLayer(coords).clearRect(
            new Vec(point.x - r, point.y - r),
            new Vec(r * 2, r * 2)
        );
    }
}

class Grid<T> {
    readonly world: World;
    readonly size: Vec;
    readonly cells: T[][];
    constructor(world: World) {
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
    fixateCoords(coords: Vec): Vec {
        return new Vec(
            fixateNumber(0, this.size.x, coords.x),
            fixateNumber(0, this.size.y, coords.y)
        );
    }
    getAt(point: Vec): T {
        return this.cells[point.x][point.y];
    }
    setAt(point: Vec, obj: T): void {
        if (this.cells[point.x][point.y] == null) {
            this.cells[point.x][point.y] = obj;
        } else {
            throw `Клетка ${point} занята`;
        }
    }
    deleteAt(point: Vec) {
        this.cells[point.x][point.y] = null;
    }
    getRandom(): Vec {
        return new Vec(
            randInt(0, this.size.x),
            randInt(0, this.size.y)
        );
    }
    getRandomEmpty(): Vec {
        let point: Vec;
        do { point = this.getRandom(); } while (this.cells[point.x][point.y])
        return point;
    }
}

function start(
    world: World,
    update: () => void,
    draw: () => void,
) {
    (function loop() {
        world.updateDrawingPoint();
        update();
        world.canvas.clear();
        world.canvas.fillPath(
            Canvas.roundedRect(
                world.drawingPoint,
                world.imageSize,
                world.cornerRadius
            ),
            'rgb(240, 240, 240)'
        );
        world.canvas.drawImage(world.gridImage.node, world.drawingPoint);
        draw();
        requestAnimationFrame(loop);
    }());
}