import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";
import { Color } from "./color.js";
import { Point, Ray, add, sub, mul, dot, sq } from "./point.js";

export default class CanvasRenderer implements Renderer {
    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private data: ImageData;
    constructor(width: number, height: number, canvas?: HTMLCanvasElement) {
        this.canvas = canvas ?? document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.data = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    }

    private set(x: number, y: number, color: Color) {
        let i = (y * (this.canvas.width) + x) * 4;
        color.forEach((c, j) => {
            this.data.data[i + j] = Math.floor(c * 256);
        });
        this.data.data[i + 3] = 255;
    }

    render(scene: Scene) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        // bad grid math - only works pointing along z
        let dx: Point = [.007, 0, 0];
        let dy: Point = [0, .007, 0];
        let start: Point = add(add(scene.camera[1], mul(-w / 2, dx)), mul(-h / 2, dy));

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let dir: Point = [
                    start[0] + i * dx[0] + j * dy[0],
                    start[1] + i * dx[1] + j * dy[1],
                    start[2] + i * dx[2] + j * dy[2],
                ];
                // just check if there is an intersection
                let color = getColor(scene, [scene.camera[0], dir], scene.iterations);
                if (color) {
                    this.set(i, j, color);
                }
                
            }
        }
    
        this.ctx.putImageData(this.data, 0, 0);

    }
}


function cast(scene: Scene, ray: Ray, exclude?: Shape): [Point, Shape] | void {
    let intersect = Infinity;
    let shape = null;

    let a = sq(ray[1]);
    for (let s of scene.shapes) {
        if (s == exclude) continue;

        let b = 2 * dot(sub(ray[0], s.center), ray[1]);
        let c = sq(sub(ray[0], s.center)) - s.radius*s.radius;
        
        let D = b*b - 4*a*c
        if (D >= 0) {
            for (let t of [
                (-b - Math.sqrt(D)) / (2*a),
                (-b + Math.sqrt(D)) / (2*a)
            ]) {
                if (t > 0 && t < intersect) {
                    intersect = t;
                    shape = s
                }
            }
        }
    }
    if (intersect != Infinity) {
        return [
            add(ray[0], mul(intersect, ray[1])),
            <Shape> shape,
        ];
    }
}

function getColor(scene: Scene, ray: Ray, iters: number, exclude?: Shape): Color | null {
    // find intercept
    let ic = cast(scene, ray, exclude);
    if (!ic) {
        // TODO: lighting (specular)
        let mag = Math.sqrt(sq(ray[1]));
        return add(mul(1/(2*mag), ray[1]), [.5, .5, .5]);
    }
    let [intercept, shape] = ic;
    let normal = sub(intercept, shape.center);

    if (iters > 0) {
        let reflection = sub(
            ray[1],
            mul(
                2 * dot(normal, ray[1]) / sq(normal),
                normal
            )
        );
        let color = getColor(scene, [intercept, reflection], iters-1, shape);
        if (color) {
            return color;
        }
    }    
    // TODO: lighting (ambient)
    return <Color> [...ray[1].map(n => n > 0 ? 1 : 0)];
}
