export type Point = [number, number, number];

export function add(a: Point, b: Point): Point {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
    ];
}
export function sub(a: Point, b: Point): Point {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ];
}
export function mul(c: number, a: Point): Point {
    return [
        c*a[0],
        c*a[1],
        c*a[2],
    ];
}
export function dot(a: Point, b: Point): number {
    return (
        a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2]
    );
}
export function sq(a: Point): number {
    return dot(a, a);
}

export function mag(a: Point): number {
    return Math.sqrt(sq(a));
}

export function norm(a: Point): Point {
    return mul(1 / mag(a), a);
}

// export function cross(a: Point, b: Point): Point {
//     return [

//     ]
// }

export type Ray = [Point, Point] | [Point, Point, Point];
