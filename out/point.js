export function add(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
    ];
}
export function sub(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ];
}
export function mul(c, a) {
    return [
        c * a[0],
        c * a[1],
        c * a[2],
    ];
}
export function dot(a, b) {
    return (a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2]);
}
export function sq(a) {
    return dot(a, a);
}
export function mag(a) {
    return Math.sqrt(sq(a));
}
export function norm(a) {
    return mul(1 / mag(a), a);
}
//# sourceMappingURL=point.js.map