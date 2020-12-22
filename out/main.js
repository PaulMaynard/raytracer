import WebGLRenderer from "./webglrenderer.js";
import { sub, norm } from "./point.js";
let scene = {
    iterations: 10,
    camera: [
        [0, 0, -5],
        [0, 0, 1]
    ],
    background: [0, 0, 0],
    light: [10, 10, -10],
    shapes: [
        {
            shape: "Ball",
            center: [0, 0, 0],
            radius: 2,
            diffuse: [0, 0.1, 0],
            roughness: .1,
            specular: [.9, .9, .9],
            reflectivity: 0.9,
        },
        {
            shape: "Ball",
            center: [-1, -1, -2],
            radius: .8,
            diffuse: [.1, 0, 0],
            roughness: .5,
            specular: [.9, .9, .9],
            reflectivity: 0.5,
        },
        {
            shape: "Ball",
            center: [1, .2, -3],
            radius: .5,
            diffuse: [0, 0, .6],
            roughness: .9,
            specular: [.4, .4, .4],
            reflectivity: 0.2,
        },
        {
            shape: "Plane",
            center: [0, -3, 0],
            normal: [0, 1, 0],
            diffuse: [.5, .5, .5],
            specular: [.1, .1, .1],
            roughness: 0.9,
            reflectivity: 0.1,
        }
    ],
};
// let renderer: Renderer = new CanvasRenderer(500, 500);
// document.body.appendChild(renderer.canvas);
// let time = Date.now()
// renderer.render(scene);
// console.log("2D rendered in: " + (Date.now() - time) + "ms");
let renderer2 = new WebGLRenderer(600, 600);
document.body.appendChild(renderer2.canvas);
// let time = Date.now();
let start = null;
function animate(time) {
    if (start == null) {
        start = time;
    }
    time = time - start;
    scene.camera[0][0] = 5 * Math.sin(time / 4000);
    scene.camera[0][2] = -5 * Math.cos(time / 4000);
    scene.camera[1] = norm(sub([0, 0, 0], scene.camera[0]));
    renderer2.render(scene);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// console.log("WebGL rendered in: " + (Date.now() - time) + "ms");
//# sourceMappingURL=main.js.map