import glMatrix from "../libs/gl-matrix-min"

var Math = (function () {
    var rotateTranslateAndScale = function (x, y, w, h, r) {
        var matrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(matrix, matrix, glMatrix.vec3.fromValues(x, y, 0.0));
        glMatrix.mat4.scale(matrix, matrix, glMatrix.vec3.fromValues(w, h, 1.0));
        glMatrix.mat4.rotateZ(matrix, matrix, r);
        return matrix;
    }
    var mPublic = {
        rotateTranslateAndScale: rotateTranslateAndScale
    }
    return mPublic;
}())

export default Math