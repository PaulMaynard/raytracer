"use strict";
function add(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
    ];
}
function sub(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ];
}
function mul(c, a) {
    return [
        c * a[0],
        c * a[1],
        c * a[2],
    ];
}
function dot(a, b) {
    return (a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2]);
}
function sq(a) {
    return dot(a, a);
}
let scene = {
    iterations: 10,
    camera: [
        [0, 0, -1],
        [0, 0, 1]
    ],
    light: [10, 10, -10],
    shapes: [
        {
            center: [0, 0, 6],
            radius: 4,
        },
        {
            center: [-1, -1, 2.5],
            radius: .8,
        },
        {
            center: [1, -1, 2.5],
            radius: .8,
        },
        {
            center: [0, 1.2, 2.2],
            radius: .5,
        },
        {
            center: [.8, 1, 2.2],
            radius: .5,
        },
        {
            center: [-.8, 1, 2.2],
            radius: .5,
        },
    ],
};
let canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.documentElement.appendChild(canvas);
let ctx = canvas.getContext('2d');
if (ctx == null) {
    throw Error("could not get context");
}
let data = ctx.createImageData(canvas.width, canvas.height);
function set(x, y, color) {
    let i = (y * (canvas.width) + x) * 4;
    color.forEach((c, j) => {
        data.data[i + j] = Math.floor(c * 256);
    });
}
let w = canvas.width;
let h = canvas.height;
// bad grid math - only works pointing along z
let dx = [.005, 0, 0];
let dy = [0, .005, 0];
let start = add(add(scene.camera[1], mul(-w / 2, dx)), mul(-h / 2, dy));
function cast(ray, exclude) {
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
function getColor(ray, iters, exclude) {
    // find intercept
    let ic = cast(ray, exclude);
    if (!ic) {
        // TODO: lighting (specular)
        return [...ray[1].map(c => (Math.tanh(c) + 1) / 2), 1];
    }
    let [intercept, shape] = ic;
    let normal = sub(intercept, shape.center);
    if (iters > 0) {
        let reflection = sub(ray[1], mul(2 * dot(normal, ray[1]) / sq(normal), normal));
        let color = getColor([intercept, reflection], iters - 1, shape);
        if (color) {
            return color;
        }
    }
    // TODO: lighting (ambient)
    return [...ray[1].map(n => n > 0 ? 1 : 0), 1];
}
for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
        let dir = [
            start[0] + i * dx[0] + j * dy[0],
            start[1] + i * dx[1] + j * dy[1],
            start[2] + i * dx[2] + j * dy[2],
        ];
        // just check if there is an intersection
        let color = getColor([scene.camera[0], dir], scene.iterations);
        if (color) {
            set(i, j, color);
        }
    }
    ctx.putImageData(data, 0, 0);
}
ctx.putImageData(data, 0, 0);
//# sourceMappingURL=main.js.map