export function sum(colors) {
    let sum = [0, 0, 0];
    for (let c of colors) {
        sum[0] += c[0];
        sum[1] += c[1];
        sum[2] += c[2];
    }
    return sum;
}
export function clamp(color) {
    return [
        Math.max(0, Math.min(color[0], 1)),
        Math.max(0, Math.min(color[1], 1)),
        Math.max(0, Math.min(color[2], 1)),
    ];
}
//# sourceMappingURL=color.js.map