import Object2D from "./Object2D";

var Light = class extends Object2D {
    constructor(x = 0, y = 0, color = [1, 1, 1], near = 5, far = 10, intensity = 1) {
        super();
        this.isLight = true;
        this.transform.position = { x: x, y: y };
        this.near = near;
        this.far = far;
        this.intensity = intensity;
        this.color = color;
    }
}

export default Light