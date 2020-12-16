import { Point, add, sub, mul, dot, sq, Ray } from "./point.js";
import { Color } from "./color.js"
import CanvasRenderer from "./canvasrenderer.js"
import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";

let scene: Scene = {
    iterations: 5,
    camera: [
        [0, 0, -1],
        [0, 0, 1]
    ],
    background: [0, 0, 0],
    light: [10, 10, -10],
    shapes: [
        {
            shape: "Ball",
            center: [0, 0, 6],
            radius: 4,
        },
        {
            shape: "Ball",
            center: [-1, -1, 2],
            radius: .8,
        },
        {
            shape: "Ball",
            center: [1, -1, 1],
            radius: .8,
        },
        {
            shape: "Ball",
            center: [0, 1.2, 1],
            radius: .5,
        },
    ],
}

let renderer: Renderer = new CanvasRenderer(300, 300);
document.body.appendChild(renderer.canvas);
renderer.render(scene);