var LightManager = class {
    constructor(scene = null) {
        this.scene = scene;
        this.lights = [];
        this.ambientColor = [1, 1, 1];
        this.ambientIntensity = 1;
    }
    setAmbientColor(r, g, b) {
        this.ambientColor = [r, g, b];
    }
    setAmbientIntensity(i) {
        this.ambientIntensity = i;
    }
    addLight(o) {
        this.lights.push(o);
    }
    removeLight(o) {
        this.lights.splice(this.lights.indexOf(o), 1);
    }
}

export default LightManager