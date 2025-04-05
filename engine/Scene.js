import Object2D from "./Object2D"
import LightManager from "./LightManager";

var Scene = class extends Object2D {
    constructor() {
        super();
        this.isScene = true;
        this.ambientColor = [1, 1, 1];
        this.ambientIntensity = 1;
        this.lightManager = new LightManager(this);
    }
    update() {
    }
    addObject(object) {
        if (object.parent !== null) {
            object.parent.removeObject(object);
        }
        object.parent = this;
        object.transform.parent = this.transform;
        object.scene = this;
        if (object.isLight) {
            this.lightManager.addLight(object);
        }
        this.children.push(object);
    }
    removeObject(object) {
        if (object.isLight) {
            this.lightManager.removeLight(object);
        } else {
            this.children.splice(this.children.indexOf(object), 1);
            object.parent = null;
            object.transform.parent = null;
        }
    }
    draw() {
    }
}

export default Scene