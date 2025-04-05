import Core from "./Core"
import Renderer from "./Renderer"

var Sprite = class extends engine.Object2D {
    constructor(tex) {
        super();
        this.isRenderable = true;
        this.texture = tex;
    }
    draw(camera) {
        var gl = Core.getGL();
        this.texture.activate();
        Renderer.drawTexture(this.scene, camera, this, this.transform.getTransform());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

export default Sprite