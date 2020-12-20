import { Point, add, sub, mul, dot, sq, Ray } from "./point.js";
import { Color } from "./color.js"
import CanvasRenderer from "./canvasrenderer.js"
import WebGLRenderer from "./webglrenderer.js"
import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";

let scene: Scene = {
    iterations: 5,
    camera: [
        [1.5, 0, 1],
        [-1, 0, 0]
    ],
    background: [0, 0, 0],
    light: [10, 10, -10],
    shapes: [
        {
            shape: "Ball",
            center: [1, 0, 6],
            radius: 4,
            diffuse: [0.2, 0.2, 0.2],
            shininess: 300,
            reflective: true,
        },
        {
            shape: "Ball",
            center: [-1, -1, 2],
            radius: .8,
            diffuse: [.3, 0, 0],
            shininess: 300,
            reflective: true
        },
        {
            shape: "Ball",
            center: [1, -1, 1],
            radius: .8,
            diffuse: [0, .3, 0],
            shininess: 300,
            reflective: true,
        },
        {
            shape: "Ball",
            center: [0, 1.2, 1],
            radius: .5,
            diffuse: [0, 0, .3],
            shininess: 300,
            reflective: true,
        },
        {
            shape: "Ball",
            center: [0, 0, .5],
            radius: .2,
            diffuse: [.2, .2, .2],
            shininess: 300,
            reflective: true,
        },
    ],
}

let renderer: Renderer = new CanvasRenderer(500, 500);
document.body.appendChild(renderer.canvas);
let time = Date.now()
renderer.render(scene);
console.log("2D rendered in: " + (Date.now() - time) + "ms");

let renderer2: Renderer = new WebGLRenderer(500, 500);
document.body.appendChild(renderer2.canvas);
time = Date.now();
renderer2.render(scene);
console.log("WebGL rendered in: " + (Date.now() - time) + "ms");