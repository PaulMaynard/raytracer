// code adapted from https://webglfundamentals.org/
export function createProgram(gl, vertexShader, fragmentShader) {
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
export function createShader(gl, type, source) {
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
;
export function uniformStruct(gl, program, name, struct) {
    for (let key of Object.keys(struct)) {
        let loc = gl.getUniformLocation(program, name + "." + key);
        let val = struct[key];
        if (typeof val == 'boolean') {
            gl.uniform1i(loc, val ? 1 : 0);
        }
        else if (typeof val == 'number') {
            gl.uniform1f(loc, val);
        }
        else if ('int' in val) {
            gl.uniform1i(loc, val.int);
        }
        else if (val.length == 2) {
            gl.uniform2fv(loc, val);
        }
        else if (val.length == 3) {
            gl.uniform3fv(loc, val);
        }
        else if (val.length == 4) {
            gl.uniform4fv(loc, val);
        }
    }
}
//# sourceMappingURL=glutils.js.map