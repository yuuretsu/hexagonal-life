function update() {
    canvas.size = new Vec(innerWidth, innerHeight);
    if (!isPaused() && Date.now() - lastFrame >= timeForFrame) {
        step();
        lastFrame = Date.now();
    }
}

function step() {
    grid = getNextWorld(grid);
}

function draw() {
    image.draw();
}

function randomize(grid: Grid<number>): Grid<number> {
    const newGrid = new Grid<number>(grid.world);
    for (let x = 0; x < grid.size.x; x++) {
        for (let y = 0; y < grid.size.y; y++) {
            const val = randInt(0, 2);
            const coords = new Vec(x, y);
            newGrid.setAt(coords, val);
            if (val === 1) drawCell(coords);
        }
    }
    return newGrid;
}

function drawCell(coords: Vec) {
    const color = `rgb(100, 100, 100)`;
    image.fillCircle(coords, RADIUS, color);
}

function getNextWorld(grid: Grid<number>): Grid<number> {
    const newGrid = new Grid<number>(grid.world);
    for (let x = 0; x < grid.size.x; x++) {
        for (let y = 0; y < grid.size.y; y++) {
            const coords = new Vec(x, y);
            const nowCell = grid.getAt(coords);
            const nextCell = getNextCell(nowCell, getAround(grid, coords));
            newGrid.setAt(coords, nextCell);
            if (nowCell === 0) {
                if (nextCell === 1) drawCell(coords);
            } else {
                if (nextCell === 0) image.clearAt(coords);
            }
        }
    }
    return newGrid;
}

function getNextCell(alive: number, around: number): 0 | 1 {
    let next: 0 | 1;
    if (alive === 0) {
        if (birthRule.includes(around)) {
            next = 1;
        } else {
            next = 0;
        }
    } else {
        if (surviveRule.includes(around)) {
            next = 1;
        } else {
            next = 0;
        }
    }
    return next;
}

function getLocalAroundCoords(coords: Vec): Vec[] {
    return coords.y % 2 === 0 ? [
        new Vec( 1, 0),
        new Vec( 0,-1),
        new Vec(-1,-1),
        new Vec(-1, 0),
        new Vec(-1, 1),
        new Vec( 0, 1),
    ] : [
        new Vec( 1, 0),
        new Vec( 1,-1),
        new Vec( 0,-1),
        new Vec(-1, 0),
        new Vec( 0, 1),
        new Vec( 1, 1),
    ];
}

function getAround(world: Grid<number>, coords: Vec): number {
    let around = 0;
    for (const local of getLocalAroundCoords(coords)) {
        const globalCoords = world.fixateCoords(new Vec(
            coords.x + local.x,
            coords.y + local.y
        ));
        around += world.getAt(globalCoords);
    }
    return around;
}

const RADIUS = 6;

const worldSize = new Vec(
    ~~(innerWidth / (RADIUS * 2)) - 10,
    ~~(innerHeight / (RADIUS * Math.sqrt(3))) - 10,
);

const canvas = new Canvas(
    new Vec(innerWidth, innerHeight),
    <HTMLCanvasElement>document.getElementById("canvas")
);

const world = new World(worldSize, RADIUS, canvas);

let birthRule: number[];
let surviveRule: number[];
let image: HexImage;
let grid: Grid<number>;

function restart() {
    image = new HexImage(world);
    grid = randomize(new Grid(world));
    birthRule = getBParameters();
    surviveRule = getSParameters();
}

let lastFrame = Date.now();

let timeForFrame = 26;

onApply(() => {
    birthRule = getBParameters();
    surviveRule = getSParameters();
});

onRestart(() => restart());

onStep(() => step());

restart();

start(world, update, draw);