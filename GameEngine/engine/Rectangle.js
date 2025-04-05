import Renderer from "./Renderer";

var Rectangle = class extends engine.Object2D {
    constructor() {
        super();
        this.isRenderable = true;
        this.color = [0, 0, 0];
        this.alpha = 1;
    }
    draw(camera) {
        var gl = Core.getGL();
        var tMatrix = this.transform.getTransform();//engine.Math.rotateTranslateAndScale(this.position.x,this.position.y,this.width,this.height,this.rotation);
        var vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
        Renderer.drawTriangles(vertices, this.scene, camera, this, tMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

export default Rectangle