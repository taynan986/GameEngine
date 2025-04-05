var Object2D = class {
    constructor() {
        this.isObject2D = true;
        this.parent = null;
        this.children = [];
        this.transform = new engine.Transform(this);
        this.scene = null;
    }
    setPosition(x, y) {
        this.transform.setPosition(x, y);
    }
    setScale(w, h) {
        this.transform.setScale(w, h);
    }
    setRotation(r) {
        this.transform.setRotation(r);
    }
    getPosition() {
        return this.transform.getPosition();
    }
    getScale() {
        return this.transform.getScale();
    }
    getRotation() {
        return this.transform.getRotation();
    }
}

export default Object2D;