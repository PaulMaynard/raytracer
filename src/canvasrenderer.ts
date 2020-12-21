// @ts-nocheck
import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";
import { Color, clamp } from "./color.js";
import { Point, Ray, add, sub, mul, dot, sq, norm } from "./point.js";

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
        let dx: Point = norm([-scene.camera[1][2], 0, scene.camera[1][0]]);
        let dy: Point = norm([
            -scene.camera[1][1] * scene.camera[1][0],
            scene.camera[0][0] * scene.camera[0][0] + scene.camera[1][2] * scene.camera[1][2],
            -scene.camera[1][1] * scene.camera[1][2],
        ]);
        let start: Point = add(add(scene.camera[1], dx), dy);
        console.log(start);

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let dir: Point = add(
                    start,
                    add(
                        mul(-2 * i / w, dx),
                        mul(-2 * j / h, dy)
                    )
                )
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
        // return add(mul(1/(2*mag), ray[1]), [.5, .5, .5]);
        return [0, 0, 0]
    }
    let [intercept, shape] = ic;
    let normal = norm(sub(intercept, shape.center));

    let reflectionColor: Color = [0, 0, 0];
    let reflectionRay = sub(
        ray[1],
        mul(
            2 * dot(normal, ray[1]) / sq(normal),
            normal
        )
    );
    if (iters > 0 && shape.reflectivity > 0) {
        // get reflection ray
        reflectionColor = mul(shape.reflectivity, getColor(scene, [intercept, reflectionRay], iters-1, shape));
    }    
    // TODO: lighting (ambient)
    let lightingColor: Color = [0, 0, 0];
    let shadowRay = norm(sub(scene.light, intercept));
    let shadowed = cast(scene, [intercept, shadowRay], shape);
    if (!shadowed) {
        let diffuse = clamp(mul(dot(shadowRay, normal), shape.diffuse));
        // no specular colors for now
        let shine = dot(norm(reflectionRay), shadowRay);
        let specular: Color = shine > 0 ? clamp(mul(Math.pow(shine, shape.shininess), [1, 1, 1])) : [0, 0, 0];
        lightingColor = add(diffuse, specular);
    }

    return add(reflectionColor, lightingColor);
}
