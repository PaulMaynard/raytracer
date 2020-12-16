export type Color = [number, number, number];
export function sum(colors: Color[]) {
    let sum: Color = [0, 0, 0];
    for (let c of colors) {
        sum[0] += c[0];
        sum[1] += c[1];
        sum[2] += c[2];
    }
    return sum;
}