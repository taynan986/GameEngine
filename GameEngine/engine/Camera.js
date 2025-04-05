import Object2D from "./Object2D";
import glMatrix from "../libs/gl-matrix-min"

var Camera = class extends Object2D {
    constructor(width, height, near = 0, far = 1000) {
        super();
        this.isCamera = true;
        this.viewProjMatrix = null;
        this.near = near;
        this.far = far;
        this.width = 0;
        this.height = 0;
        this.bgColor = [0, 0, 0];
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
    }
    setViewProjMatrix() {
        var viewMatrix = glMatrix.mat4.create();
        var projMatrix = glMatrix.mat4.create();

        glMatrix.mat4.lookAt(viewMatrix,
            [this.transform.getPosition().x, (this.transform.getPosition().y), 10],
            [this.transform.getPosition().x, (this.transform.getPosition().y), 0],
            [0, 1, 0]);

        glMatrix.mat4.ortho(projMatrix,
            -(this.transform.getScale().x / 2),
            this.transform.getScale().x / 2,
            this.transform.getScale().y / 2,
            -(this.transform.getScale().y / 2),
            this.near,
            this.far
        );

        var viewProjMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);
        this.viewProjMatrix = viewProjMatrix;
    }
    draw() {
    }
    _setViewport() {
        var gl = Core.getGL();
        var canvas = Core.getCanvas();
        gl.viewport(this.viewport.x, (canvas.height - this.viewport.height) - this.viewport.y, this.viewport.width, this.viewport.height);
        gl.scissor(this.viewport.x, (canvas.height - this.viewport.height) - this.viewport.y, this.viewport.width, this.viewport.height);
        gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], 1.0);
        gl.enable(gl.SCISSOR_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.SCISSOR_TEST);
    }
    setViewport(posX, posY, width, height) {
        this.viewport.x = posX; this.viewport.y = posY;
        this.viewport.width = width; this.viewport.height = height;
    }
}

export default Camera;