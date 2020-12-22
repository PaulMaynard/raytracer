import { Renderer } from "./renderer.js";
import { Scene } from "./scene.js";
import { createProgram, createShader, uniformStruct, Struct } from "./glutils.js"
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
let cached_length: number = -1;
let cached_shader: WebGLShader = null;
function makeFragmentShader(gl: WebGLRenderingContext, scene: Scene): WebGLShader {
    if (cached_shader == null || cached_length != scene.shapes.length) {
        // we need to make a new shader
        cached_length = scene.shapes.length;
        cached_shader = createShader(gl, gl.FRAGMENT_SHADER, glsl`
            precision mediump float;

            #define PI 3.1415926

            varying vec3 v_ray;

            uniform vec3 u_camera;
            uniform vec3 u_light;

            #define SPHERE 0
            #define PLANE 1
            uniform struct Shape {
                int shape;
                vec3 center;
                float radius;
                vec3 normal;
                vec3 diffuse;
                vec3 specular;
                float reflectivity;
                float roughness;
            } u_shapes[${scene.shapes.length}];


            float intersection(in vec3 pos, in vec3 ray, in Shape shape) {
                if (shape.shape == SPHERE) {
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
                } else if (shape.shape == PLANE) { // shape is plane
                    // solve:
                    // n * (tv + p) = n * c
                    // t = (n * (c - p))/(n * v)
                    float t = dot(shape.normal, shape.center - pos) / dot(shape.normal, ray);
                    if (t > 0.) {
                        return t;
                    } else {
                        return 0.;
                    }
                }
            }
            
            float cast_ray(in vec3 pos, in vec3 ray, in int exclude, out Shape shape, out int idx, out vec3 i_pos, out vec3 normal) {
                float t = 0.;
                    
                for (int i = 0; i < ${scene.shapes.length}; i++) {
                    if (i != exclude) {
                        float t_i = intersection(pos, ray, u_shapes[i]);
                        if (t_i > 0. && (t == 0. || t_i < t)) {
                            t = t_i;
                            shape = u_shapes[i];
                            idx = i;
                        }
                    }
                }
                i_pos = pos + t * ray;
                if (shape.shape == SPHERE) {
                    normal = normalize(i_pos - shape.center);
                } else if (shape.shape == PLANE) {
                    normal = shape.normal;
                }
                return t;
            }
            float cast_ray(in vec3 pos, in vec3 ray, in int exclude) {
                vec3 i_pos;
                vec3 normal;
                Shape shape;
                int idx;
                return cast_ray(pos, ray, exclude, shape, idx, i_pos, normal);
            }

            void main() {
                // ray currently being cast. Gets updated in the loop for reflection rays
                vec3 pos = u_camera;
                vec3 ray = normalize(v_ray); // set up camera grid

                // cumulative color of pixel, made up of contributions of each bounce
                vec3 color = vec3(0, 0, 0);

                // amount to reduce reflection by (product of each shape's reflectivity)
                vec3 reflection_factor = vec3(1, 1, 1);

                // do not include the current shape in casting rays
                // this means we can't have self-reflections, but shapes are convex so it doesn't matter
                int exclude = -1;

                // do some number of times for reflections
                for (int i = 0; i < ${scene.iterations}; i++) {
                    // cast the ray and see if it hits anything
                    Shape shape;
                    int idx;
                    vec3 hit_pos;
                    vec3 normal;
                    float t = cast_ray(pos, ray, exclude, shape, idx, hit_pos, normal);
                    if (t > 0.) { // ray hit shape
                        vec3 lighting = vec3(0, 0, 0);
                        vec3 shadow_ray = normalize(u_light - hit_pos);
                        vec3 reflection_ray = ray - 2. * dot(ray, normal) * normal;

                        // excude the current shape from shadow calcs to avoid shadow acne
                        if (cast_ray(hit_pos, shadow_ray, idx) <= 0.) {
                            float lambert = dot(normal, shadow_ray);
                            if (lambert > 0.) {
                                // checkerboard pattern
                                float checker = 1.;
                                bool cx = mod(hit_pos.x, 2.) < 1.;
                                bool cy = mod(hit_pos.z, 2.) < 1.;
                                if (shape.shape == PLANE && !(cx && cy) && (cx || cy)) {
                                    checker = .5;
                                }
                                vec3 diffuse = checker * shape.diffuse * lambert;
        
                                // old, busted: blinn specular
                                // float shine = dot(reflection_ray, shadow_ray);
                                // vec3 specular = shine > 0. ? pow(shine, shape.shininess) * shape.specular : vec3(0, 0, 0);

                                // new hotness: cook-torrance specular
                                vec3 halfway = normalize(normalize(shadow_ray) - normalize(ray));

                                float alpha2 = pow(shape.roughness, 4.);
                                float shine = dot(halfway, normal);
                                float distribution = shine > 0. ? pow(shine, 2./alpha2 - 2.) / (alpha2 * PI) : 0.;

                                float attenuation = min(
                                    1.,
                                    min(
                                        dot(normal, -ray),
                                        dot(normal, shadow_ray)
                                    ) * 2. * shine / dot(-ray, halfway)
                                );

                                // schlicks approximation
                                float fresnel = shape.reflectivity + (1. - shape.reflectivity) * pow(1. + dot(ray, halfway), 5.);

                                lighting = diffuse + shape.specular * distribution * attenuation * fresnel / (4. * dot(-ray, normal));
                            }
                        }
                        color += reflection_factor * lighting;
                        // set up for the next iteration to do reflection calculations:
                        // use fresnel for the reflection
                        reflection_factor *= shape.reflectivity + (1. - shape.reflectivity) * pow(1. - 2. * dot(ray, normal) * dot(ray, normal), 5.);
                        pos = hit_pos;
                        ray = reflection_ray;
                        exclude = idx;
                    } else {
                        break; // no shape hit, end loop (doesn't really end because of unrolling but whatever)
                    }
                }
                gl_FragColor = vec4(color, 1);
            }
        `);
    }
    return cached_shader;
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
        let fragment = makeFragmentShader(gl, scene);
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

        // light placement
        let u_light = gl.getUniformLocation(program, "u_light");
        gl.uniform3fv(u_light, scene.light);

        for (let i = 0; i < scene.shapes.length; i++) {
            let shape = scene.shapes[i];
            let struct: Struct = {
                diffuse: shape.diffuse,
                specular: shape.specular,
                roughness: shape.roughness,
                reflectivity: shape.reflectivity,
            }
            if (shape.shape == "Ball") {
                struct.shape = {int: 0};
                struct.center = shape.center;
                struct.radius = shape.radius;
            } else if (shape.shape == "Plane") {
                struct.shape = {int: 1};
                struct.center = shape.center;
                struct.normal = shape.normal;
            }
            uniformStruct(gl, program, `u_shapes[${i}]`, struct);
        }

        let time = Date.now();
        gl.drawArrays(gl.TRIANGLE_STRIP,0, 4);
        console.log("Shader code run in " + (Date.now() - time) + "ms")
    }
}