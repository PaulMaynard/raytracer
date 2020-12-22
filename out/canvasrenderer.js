import { clamp } from "./color.js";
import { add, sub, mul, dot, sq, norm } from "./point.js";
export default class CanvasRenderer {
    constructor(width, height, canvas) {
        this.canvas = canvas !== null && canvas !== void 0 ? canvas : document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.data = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    }
    set(x, y, color) {
        let i = (y * (this.canvas.width) + x) * 4;
        color.forEach((c, j) => {
            this.data.data[i + j] = Math.floor(c * 256);
        });
        this.data.data[i + 3] = 255;
    }
    render(scene) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        let dx = norm([-scene.camera[1][2], 0, scene.camera[1][0]]);
        let dy = norm([
            -scene.camera[1][1] * scene.camera[1][0],
            scene.camera[0][0] * scene.camera[0][0] + scene.camera[1][2] * scene.camera[1][2],
            -scene.camera[1][1] * scene.camera[1][2],
        ]);
        let start = add(add(scene.camera[1], dx), dy);
        console.log(start);
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let dir = add(start, add(mul(-2 * i / w, dx), mul(-2 * j / h, dy)));
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
function cast(scene, ray, exclude) {
    let intersect = Infinity;
    let shape = null;
    let a = sq(ray[1]);
    for (let s of scene.shapes) {
        if (s == exclude)
            continue;
        let b = 2 * dot(sub(ray[0], s.center), ray[1]);
        let c = sq(sub(ray[0], s.center)) - s.radius * s.radius;
        let D = b * b - 4 * a * c;
        if (D >= 0) {
            for (let t of [
                (-b - Math.sqrt(D)) / (2 * a),
                (-b + Math.sqrt(D)) / (2 * a)
            ]) {
                if (t > 0 && t < intersect) {
                    intersect = t;
                    shape = s;
                }
            }
        }
    }
    if (intersect != Infinity) {
        return [
            add(ray[0], mul(intersect, ray[1])),
            shape,
        ];
    }
}
function getColor(scene, ray, iters, exclude) {
    // find intercept
    let ic = cast(scene, ray, exclude);
    if (!ic) {
        // TODO: lighting (specular)
        let mag = Math.sqrt(sq(ray[1]));
        // return add(mul(1/(2*mag), ray[1]), [.5, .5, .5]);
        return [0, 0, 0];
    }
    let [intercept, shape] = ic;
    let normal = norm(sub(intercept, shape.center));
    let reflectionColor = [0, 0, 0];
    let reflectionRay = sub(ray[1], mul(2 * dot(normal, ray[1]) / sq(normal), normal));
    if (iters > 0 && shape.reflectivity > 0) {
        // get reflection ray
        reflectionColor = mul(shape.reflectivity, getColor(scene, [intercept, reflectionRay], iters - 1, shape));
    }
    // TODO: lighting (ambient)
    let lightingColor = [0, 0, 0];
    let shadowRay = norm(sub(scene.light, intercept));
    let shadowed = cast(scene, [intercept, shadowRay], shape);
    if (!shadowed) {
        let diffuse = clamp(mul(dot(shadowRay, normal), shape.diffuse));
        // no specular colors for now
        let shine = dot(norm(reflectionRay), shadowRay);
        let specular = shine > 0 ? clamp(mul(Math.pow(shine, shape.shininess), [1, 1, 1])) : [0, 0, 0];
        lightingColor = add(diffuse, specular);
    }
    return add(reflectionColor, lightingColor);
}
//# sourceMappingURL=canvasrenderer.js.map