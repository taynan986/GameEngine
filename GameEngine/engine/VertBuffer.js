import Core from "./Core";

var VertBuffer = (function () {
    var buffer = null;
    var gl = null;

    var initialize = function () {
        gl = Core.getGL();
        buffer = gl.createBuffer();
    }
    var bindBuffer = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }
    var bufferData = function () {
        gl.bufferData(gl.ARRAY_BUFFER, 128, gl.DYNAMIC_DRAW);
    }
    var bufferSubData = function (vertices) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    }

    var pub = {
        bindBuffer: bindBuffer,
        bufferSubData: bufferSubData,
        bufferData: bufferData,
        initialize: initialize
    }
    return pub;
}())

export default VertBuffer