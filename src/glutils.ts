// code adapted from https://webglfundamentals.org/

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export interface Struct {
    [key: string]: boolean | {int: number} | number | [number, number] | [number, number, number] | [number, number, number, number]
};

export function uniformStruct(gl: WebGLRenderingContext, program: WebGLProgram, name: string, struct: Struct) {
    for (let key of Object.keys(struct)) {
        let loc = gl.getUniformLocation(program, name + "." + key);
        let val = struct[key];
        if (typeof val == 'boolean') {
            gl.uniform1i(loc, val ? 1 : 0);
        } else if (typeof val == 'number') {
            gl.uniform1f(loc, val);
        } else if ('int' in val) {
            gl.uniform1i(loc, val.int);
        } else if (val.length == 2) {
            gl.uniform2fv(loc, val);
        } else if (val.length == 3) {
            gl.uniform3fv(loc, val);
        } else if (val.length == 4) {
            gl.uniform4fv(loc, val);
        }
    }
}