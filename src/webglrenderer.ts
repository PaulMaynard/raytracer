import { Renderer } from "./renderer.js";
import { Scene, Shape } from "./scene.js";
import { createProgram, createShader, uniformStruct } from "./glutils.js"
import { Point, norm, add, mul } from "./point.js";

// for syntax highlighting
const glsl = String.raw;

const vertexShader = glsl`
    attribute vec4 a_position;
    attribute vec3 a_ray;

    varying vec3 v_ray;


    void main() {
        v_ray = a_ray;
        gl_Position = a_position;
    }
`;
function makeFragmentShader(scene: Scene): string {
    return glsl`
        precision mediump float;

        varying vec3 v_ray;

        uniform vec3 u_camera;
        

        uniform struct Shape {
            vec3 center;
            float radius;
            vec3 diffuse;
        } u_shapes[${scene.shapes.length}];


        float intersection(in vec3 pos, in vec3 ray, in Shape shape) {
            // solve quadratic formula for intersection
            // solve for t
            // |tv + p - c|^2 = r^2
            // |v^2|t^2 + 2((p - c) * v)t + |p - c|^2 - r^2 = 0

            float a = dot(ray, ray);
            float b = 2. * dot(pos - shape.center, ray);
            float c = dot(pos - shape.center, pos - shape.center) - shape.radius * shape.radius;
            
            float D = b*b - 4.*a*c;

            float t1 = (-b - sqrt(D)) / (2. * a);
            float t2 = (-b + sqrt(D)) / (2. * a);
            if (t1 > 0. && t1 < t2) {
                return t1;
            } else if (t2 > 0.) {
                return t2;
            } else {
                return 0.;
            }
            // if (D >= 0.) {
            //     return true;
            // }
            // return false;
        }

        void main() {
            vec3 pos = u_camera;
            vec3 ray = v_ray; // set up camera grid

            gl_FragColor = vec4(0, 0, 0, 1);


            // cast the ray and see if it hits anything
            float t = 0.;
            Shape chosen;
            for (int i = 0; i < ${scene.shapes.length}; i++) {
                float t_i = intersection(pos, ray, u_shapes[i]);
                if (t_i > 0. && (t == 0. || t_i < t)) {
                    t = t_i;
                    chosen = u_shapes[i];
                }
            }
            if (t > 0.) {
                gl_FragColor = vec4(.3 * t * chosen.diffuse, 1);
            }

        }
    `;
}

const vertices = new Float32Array([
    -1, 1,
    1, 1,
    -1, -1,
    1, -1,
]);

export default class WebGLRenderer implements Renderer {
    public canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private vertex: WebGLShader;
    constructor(width: number, height: number, canvas?: HTMLCanvasElement) {
        this.canvas = canvas ?? document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl');

        this.vertex = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShader);
    }
    public render(scene: Scene) {
        const gl = this.gl;
        let fragment = createShader(gl, gl.FRAGMENT_SHADER, makeFragmentShader(scene));
        let program = createProgram(gl, this.vertex, fragment);

        // boilerplate setup
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        let a_position = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(a_position);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

        // camera setup
        let u_camera = gl.getUniformLocation(program, "u_camera");
        gl.uniform3fv(u_camera, scene.camera[0]);
        let dx: Point = norm([scene.camera[1][2], 0, -scene.camera[1][0]]);
        let dy: Point = norm([
            -scene.camera[1][1] * scene.camera[1][0],
            scene.camera[0][0] * scene.camera[0][0] + scene.camera[1][2] * scene.camera[1][2],
            -scene.camera[1][1] * scene.camera[1][2],
        ]);
        let corners = new Float32Array([
            ...add(scene.camera[1], add(mul(-1, dx), dy)),
            ...add(scene.camera[1], add(dx, dy)),
            ...add(scene.camera[1], add(mul(-1, dx), mul(-1, dy))),
            ...add(scene.camera[1], add(dx, mul(-1, dy)))
        ]);
        var cornerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
        let a_ray = gl.getAttribLocation(program, "a_ray");
        gl.enableVertexAttribArray(a_ray);
        // console.log(corners);
        gl.vertexAttribPointer(a_ray, 3, gl.FLOAT, false, 0, 0);


        for (let i = 0; i < scene.shapes.length; i++) {
            let shape = scene.shapes[i];
            uniformStruct(gl, program, `u_shapes[${i}]`, {
                center: shape.center,
                radius: shape.radius,
                diffuse: shape.diffuse,
            })
        }

        gl.drawArrays(gl.TRIANGLE_STRIP,0, 4);
    }
}