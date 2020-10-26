class Vec {
    readonly x: number;
    readonly y: number;
    /**
     * 2D-вектор.
     * @param x Координата X
     * @param y Координата Y
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `${~~this.x}x${~~this.y}`;
    }
}

class Point extends Vec {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        super(x, y);
    }
}

function limitNumber(min: number, max: number, number: number): number {
    return Math.min(Math.max(number , min), max)
}

function fixateNumber(min: number, max: number, number: number): number {
    return number >= min ? number % max : max - (-number % max);
}

/**
 * Возвращает целое число в диапазоне от bottom до top, но не включительно.
 * @param bottom Нижняя граница
 * @param top Верхняя граница
 */
function randInt(bottom: number, top: number) {
    return Math.floor(Math.random() * (top - bottom)) + bottom;
}