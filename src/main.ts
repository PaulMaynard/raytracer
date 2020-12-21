import WebGLRenderer from "./webglrenderer.js"
import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";

let scene: Scene = {
    iterations: 10,
    camera: [
        [0, 0, -1],
        [0, 0, 1]
    ],
    background: [0, 0, 0],
    light: [10, 10, -10],
    shapes: [
        {
            shape: "Ball",
            center: [0, 0, 4],
            radius: 2,
            diffuse: [0, 0.15, 0],
            shininess: 200,
            specular: [1, 1, 1],
            reflectivity: [0.4, 0.6, 0.6],
        },
        {
            shape: "Ball",
            center: [-1, -1, 2],
            radius: .8,
            diffuse: [.15, 0, 0],
            shininess: 200,
            specular: [1, 1, 1],
            reflectivity: [0.6, 0.4, 0.4],
        },
        {
            shape: "Ball",
            center: [1, .2, 1],
            radius: .5,
            diffuse: [0, 0, .15],
            shininess: 200,
            specular: [1, 1, 1],
            reflectivity: [0.4, 0.4, 0.6],
        },
        {
            shape: "Plane",
            center: [0, -3, 0],
            normal: [0, 1, 0],
            diffuse: [.5, .5, .5],
            specular: [.1, .1, .1],
            shininess: 1,
            reflectivity: [0.4, 0.4, 0.4],
        }
    ],
}

// let renderer: Renderer = new CanvasRenderer(500, 500);
// document.body.appendChild(renderer.canvas);
// let time = Date.now()
// renderer.render(scene);
// console.log("2D rendered in: " + (Date.now() - time) + "ms");

let renderer2: Renderer = new WebGLRenderer(600, 600);
document.body.appendChild(renderer2.canvas);
let time = Date.now();
renderer2.render(scene);
console.log("WebGL rendered in: " + (Date.now() - time) + "ms");