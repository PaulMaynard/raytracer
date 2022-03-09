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
        },
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
// let log: [number, string][] = [];
let start = null;
function animate(time) {
    if (start == null) {
        start = time;
    }
    time = time - start;
    let angle = time / 4000;
    scene.camera[0][0] = 5 * Math.sin(angle);
    scene.camera[0][2] = -5 * Math.cos(angle);
    scene.camera[1] = norm(sub([0, 0, 0], scene.camera[0]));
    // animation
    scene.shapes[0].center[1] = Math.sin(10 * angle) * .5;
    scene.shapes[1].center[0] = Math.sin(5 * angle) * 4;
    scene.shapes[1].center[2] = Math.cos(5 * angle) * 4;
    scene.shapes[2].center[0] = Math.sin(-5 * angle) * 3;
    scene.shapes[2].center[2] = Math.cos(-5 * angle) * 3;
    scene.light[0] = Math.sin(-5 * angle) * 10;
    // scene.light[1] = 5 * Math.sin(2 * angle) + 10;
    scene.light[2] = Math.cos(-5 * angle) * 10;
    renderer2.render(scene);
    // log.push([angle, renderer2.canvas.toDataURL("image/png")]);
    // if (angle <= Math.PI * 2) {
    requestAnimationFrame(animate);
    // } else {
    //     document.body.innerHTML += JSON.stringify(log);
    // }
}
requestAnimationFrame(animate);
// console.log("WebGL rendered in: " + (Date.now() - time) + "ms");
//# sourceMappingURL=main.js.map