import glMatrix from "../libs/gl-matrix-min"

var Transform = class {
    constructor(object) {
        this.parent = null;
        this.children = [];
        this.position = { x: 0, y: 0 };
        this.scale = { x: 0, y: 0 };
        this.rotation = 0;
    }
    setPosition(x, y) {
        this.position = { x: x, y: y };
    }
    setScale(x, y) {
        this.scale = { x: x, y: y };
    }
    setRotation(rot) {
        this.rotation = rot;
    }
    getPosition() {
        return this.position;
    }
    getScale() {
        return this.scale;
    }
    getRotation() {
        return this.rotation;
    }
    getTransform() {
        var matrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(matrix, matrix, glMatrix.vec3.fromValues(this.position.x, this.position.y, 0.0));
        glMatrix.mat4.scale(matrix, matrix, glMatrix.vec3.fromValues(this.scale.x, this.scale.y, 1.0));
        glMatrix.mat4.rotateZ(matrix, matrix, this.rotation);
        return matrix;
    }
    setParent(parent) {
        this.transform.parent = parent;
        parent.children.push(object);
    }
    addChild(child) {

    }
    removeChild(child) {
        this.children.splice(getChild(child), 1);
        child.parent = null;
    }
    getChild(index) {
        return this.children[index];
    }
    getChildren() {
        return this.children;
    }
}

export default Transform