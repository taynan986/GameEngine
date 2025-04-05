import Core from "./Core";

var Shader = class {
    constructor(v, f) {
        var gl = Core.getGL();
        this.shaderSource = [v, f];
        this.vertShader = compileShader(gl.VERTEX_SHADER, v);
        this.fragShader = compileShader(gl.FRAGMENT_SHADER, f);
        this.program = createProgram(this.vertShader, this.fragShader);
    }
    compileShader(type, source) {
        var gl = Core.getGL();
        var compiledShader = gl.createShader(type);
        gl.shaderSource(compiledShader, source);
        gl.compileShader(compiledShader);
        if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(compiledShader));
            return null;
        }
        return compiledShader;
    }
    createProgram() {
        var gl = Core.getGL();
        var vertShader = compileShader(this.vertShader, gl.VERTEX_SHADER);
        var fragShader = compileShader(this.fragShader, gl.FRAGMENT_SHADER);
        var program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error linking shader" + "\n\n" + gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }
}

export default Shader

