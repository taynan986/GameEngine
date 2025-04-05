"use strict";
var engine = engine || {};

engine.Core = (function () {
    var canvas = null;
    var gl = null;
    var initialize = function (c) {
        canvas = c;
        gl = c.getContext("webgl", { engineialias: true });
        if (gl !== null) {
            Setup();
        } else {
            console.log("error loading webgl context.");
        }
    }

    var Setup = function () {
        var deviceWidth = window.innerWidth;
        var deviceHeight = window.innerHeight;
        canvas.width = deviceWidth; canvas.height = deviceHeight;

        engine.VertBuffer.initialize();
        engine.VertBuffer.bindBuffer();
        engine.VertBuffer.bufferData();
        engine.Renderer.createShaders();
        engine.GameLoop.startLoop();
    }

    var getGL = function () {
        return gl;
    }
    var getCanvas = function () {
        return canvas;
    }
    var clearGL = function (r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        var gl = getGL();
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    var pubs = {
        getGL: getGL,
        getCanvas: getCanvas,
        initialize: initialize,
        clearGL: clearGL
    }
    return pubs;
}());

engine.VertBuffer = (function () {
    var buffer = null;
    var gl = null;

    var initialize = function () {
        gl = engine.Core.getGL();
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
}());

engine.GameLoop = (function () {
    var isLoopRunning = false;
    var mLoop = function () {
        if (isLoopRunning) {
            engine.Renderer.renderScene();
        }

        window.requestAnimationFrame(mLoop);
    }

    var startLoop = function () {
        isLoopRunning = true;
    }

    var stopLoop = function () {
        isLoopRunning = false;
    }

    window.requestAnimationFrame(mLoop);

    var pubs = {
        startLoop: startLoop,
        stopLoop: stopLoop
    };
    return pubs;
}());

engine.Renderer = (function () {
    var scene = null;
    var camera = null;
    var shaders = [];
    var renderScene = function () {
        if (scene !== null) {
            scene.update();
            hierarchyLoop(scene);
        }
    }

    var hierarchyLoop = function (object) {
        for (var i = 0; i < object.children.length; i++) {
            var t = object.children[i];
            if (t.isCamera) {
                camera = t;
                t.setViewProjMatrix();
                t._setViewport();
                cameraRender();
            }
            if (t.children.length > 0)
                hierarchyLoop(object);
        }
    }

    var cameraRender = function () {
        for (var i = 0; i < scene.children.length; i++) {
            var t = scene.children[i];
            if (t.isRenderable)
                t.draw(camera);
        }
    }
    var bufferCanvas = document.createElement("canvas");

    var getBufferCanvasContext = function () {
        return bufferCanvas.getContext("2d");
    };

    var drawCanvasText = function (text) {
        var ctx = bufferCanvas.getContext("2d");
        ctx.canvas.width = 100;
        ctx.canvas.height = 100;
        ctx.fillStyle = "blue";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "100px serif-sans";
        ctx.fillText(text, 100 / 2, 100 / 2);
        return ctx.canvas;
    };

    var triangleVS = `
precision mediump float;
uniform mat4 u_vPTransform;
uniform mat4 u_Transform;
attribute vec4 a_Position;
void main(){
gl_Position=u_vPTransform*u_Transform*a_Position;
}`;
    var triangleFS = `
#define MAX_LIGHTS 5
precision mediump float;
uniform vec4 u_FragColor;
uniform vec4 u_ambientColor;
uniform float u_ambientIntensity;
struct Light {
vec4 Position;
vec4 Color;
float Near;
float Far;
float Intensity;
};
uniform Light u_lights[MAX_LIGHTS];

vec4 LightEffect(Light lgt) {
vec4 result = vec4(0);
float atten = 0.0;
//float dist = length(vec3((1080.0/2.0)+lgt.Position.x,(2400.0/2.0)-lgt.Position.y,lgt.Position.z) - gl_FragCoord.xyz);
float dist = length(lgt.Position.xyz - gl_FragCoord.xyz);
if (dist <= lgt.Far) {
if (dist <= lgt.Near)
atten = 1.0;
else {
float n = dist - lgt.Near;
float d = lgt.Far - lgt.Near;
atten = smoothstep(0.0, 1.0, 1.0-(n*n)/(d*d)); // blended attenuation
}
}
result = atten * lgt.Intensity * lgt.Color;
return result;
}

void main(){
vec4 lightColorData=u_ambientIntensity*u_ambientColor;
if (u_FragColor.a>0.0){
for (int i=0; i<MAX_LIGHTS; i++){
lightColorData+=LightEffect(u_lights[i]);
}
}
lightColorData*=u_FragColor;
gl_FragColor = vec4(lightColorData.rgb,u_FragColor.a);
}`;

    var textureVS = `
precision mediump float;
uniform mat4 u_vPTransform;
uniform mat4 u_Transform;
attribute vec4 a_Position;
varying vec2 v_TexCoord;
varying mat4 v_vPTransform;
attribute vec2 a_TexCoord;
void main(){
gl_Position=u_vPTransform*u_Transform*a_Position;
v_TexCoord=a_TexCoord;
v_vPTransform=u_vPTransform;
}`;
    var textureFS = `
#define MAX_LIGHTS 5
precision mediump float;
uniform sampler2D u_Sampler;
uniform vec4 u_PixelColor;
varying vec2 v_TexCoord;
varying mat4 v_vPTransform;
uniform vec4 u_ambientColor;
uniform float u_ambientIntensity;
struct Light {
vec4 Position;
vec4 Color;
float Near;
float Far;
float Intensity;
};
uniform Light u_lights[MAX_LIGHTS];

vec4 LightEffect(Light lgt) {
vec4 result = vec4(0);
float atten = 0.0;
//float dist = length(vec3((1080.0/2.0)+lgt.Position.x,(2400.0/2.0)-lgt.Position.y,lgt.Position.z) - gl_FragCoord.xyz);
float dist = length(lgt.Position.xyz - gl_FragCoord.xyz);
if (dist <= lgt.Far) {
if (dist <= lgt.Near)
atten = 1.0;
else {
float n = dist - lgt.Near;
float d = lgt.Far - lgt.Near;
atten = smoothstep(0.0, 1.0, 1.0-(n*n)/(d*d)); // blended attenuation
}
}
result = atten * lgt.Intensity * lgt.Color;
return result;
}

void main() {
vec4 lightColorData=u_ambientIntensity*u_ambientColor;
vec4 c = texture2D(u_Sampler, vec2(v_TexCoord.s, v_TexCoord.t));
/*vec3 r = vec3(c) * (1.0-u_PixelColor.a) + vec3(u_PixelColor) * u_PixelColor.a;
vec4 result = vec4(r, c.a);*/
if (c.a>0.0){
for (int i=0; i<MAX_LIGHTS; i++){
lightColorData+=LightEffect(u_lights[i]);
}
}
lightColorData*=c;
gl_FragColor = vec4(lightColorData.rgb,c.a);
}`;

    var createShaders = function () {
        var a = createProgram(triangleVS, triangleFS);
        var b = createProgram(textureVS, textureFS);
        shaders.push(a, b);
    };

    var compileShader = function (source, type) {
        var gl = engine.Core.getGL();
        var compiledShader = gl.createShader(type);
        gl.shaderSource(compiledShader, source);
        gl.compileShader(compiledShader);
        if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(compiledShader));
        } else
            return compiledShader;
    };

    var createProgram = function (vs, fs) {
        var gl = engine.Core.getGL();
        var vertShader = compileShader(vs, gl.VERTEX_SHADER);
        var fragShader = compileShader(fs, gl.FRAGMENT_SHADER);
        var program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        linkProgram(program);
        return program;
    }

    var linkProgram = function (program) {
        var gl = engine.Core.getGL();
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error linking shader" + "\n\n" + gl.getProgramInfoLog(program));
            return null;
        }
    }

    var setLightData = function (camera, program) {
        var gl = engine.Core.getGL();
        var canvas = engine.Core.getCanvas();
        for (var i = 0; i < scene.lightManager.lights.length; i++) {
            var cLight = scene.lightManager.lights[i];
            var viewport = camera.viewport;
            var cameraX = camera.getPosition().x;
            var cameraY = camera.getPosition().y;
            var position = gl.getUniformLocation(program, "u_lights[" + i + "].Position");
            var color = gl.getUniformLocation(program, "u_lights[" + i + "].Color");
            var near = gl.getUniformLocation(program, "u_lights[" + i + "].Near");
            var far = gl.getUniformLocation(program, "u_lights[" + i + "].Far");
            var intensity = gl.getUniformLocation(program, "u_lights[" + i + "].Intensity");

            var ration = 1;
            var ratiof = ((viewport.width / camera.getScale().x) + (viewport.height / camera.getScale().y)) / 2;
            var px = (((viewport.width / 2) + (viewport.x) + (cLight.getPosition().x) * ratiof)) - (ratiof * (camera.getPosition().x));
            var py = ((((canvas.height - viewport.height / 2) - viewport.y) + (-cLight.getPosition().y) * ratiof)) + ((ratiof * (camera.getPosition().y)));
            gl.uniform4f(position, px, py, 0.0, 1.0);
            gl.uniform4f(color, cLight.color[0], cLight.color[1], cLight.color[2], 1.0);
            gl.uniform1f(near, cLight.near * ratiof);
            gl.uniform1f(far, cLight.far * ratiof);
            gl.uniform1f(intensity, cLight.intensity);
        }
    }

    var drawTriangles = function (vertices, scene, camera, object, transform) {
        var gl = engine.Core.getGL();
        var canvas = engine.Core.getCanvas();
        var program = shaders[0];
        gl.useProgram(program);
        engine.VertBuffer.bufferSubData(new Float32Array(vertices));
        var position = gl.getAttribLocation(program, "a_Position");
        var fragColor = gl.getUniformLocation(program, "u_FragColor");
        var transformMatrix = gl.getUniformLocation(program, "u_Transform");
        var viewProjection = gl.getUniformLocation(program, "u_vPTransform");
        var ambientColor = gl.getUniformLocation(program, "u_ambientColor");
        var ambientIntensity = gl.getUniformLocation(program, "u_ambientIntensity");

        setLightData(camera, program);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(position);
        gl.uniform4f(fragColor, object.color[0], object.color[1], object.color[2], object.alpha);
        gl.uniform4f(ambientColor, scene.lightManager.ambientColor[0], scene.lightManager.ambientColor[1], scene.lightManager.ambientColor[2], 1.0);
        gl.uniform1f(ambientIntensity, scene.lightManager.ambientIntensity);
        gl.uniformMatrix4fv(transformMatrix, false, new Float32Array(transform));
        gl.uniformMatrix4fv(viewProjection, false, new Float32Array(camera.viewProjMatrix));
    }

    var drawTexture = function (scene, camera, object, transform) {
        var gl = engine.Core.getGL();
        var canvas = engine.Core.getCanvas();
        var program = shaders[1];
        gl.useProgram(program);

        var vertices = new Float32Array([
            -1.0, -1.0, 0.0, 1.0,
            -1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 0.0
        ]);
        engine.VertBuffer.bufferSubData(vertices);
        var position = gl.getAttribLocation(program, "a_Position");
        var fragColor = gl.getUniformLocation(program, "u_FragColor");
        var transformMatrix = gl.getUniformLocation(program, "u_Transform");
        var viewProjection = gl.getUniformLocation(program, "u_vPTransform");
        var ambientColor = gl.getUniformLocation(program, "u_ambientColor");
        var ambientIntensity = gl.getUniformLocation(program, "u_ambientIntensity");
        var texCoord = gl.getAttribLocation(program, "a_TexCoord");
        var pixelColor = gl.getUniformLocation(program, "u_PixelColor");
        var sampler = gl.getUniformLocation(program, "u_Sampler");
        setLightData(camera, program);
        var verticesBPE = vertices.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, verticesBPE * 4, 0);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, verticesBPE * 4, verticesBPE * 2);
        gl.enableVertexAttribArray(texCoord);
        //gl.uniform4f(fragColor,object.color[0],object.color[1],object.color[2],object.alpha);
        gl.uniform4f(ambientColor, scene.lightManager.ambientColor[0], scene.lightManager.ambientColor[1], scene.lightManager.ambientColor[2], 1.0);
        gl.uniform1f(ambientIntensity, scene.lightManager.ambientIntensity);
        gl.uniform1i(sampler, 0);
        gl.uniformMatrix4fv(transformMatrix, false, new Float32Array(transform));
        gl.uniformMatrix4fv(viewProjection, false, new Float32Array(camera.viewProjMatrix));
    }

    var setScene = function (s) {
        scene = s;
    }

    var mPublic = {
        setScene: setScene,
        renderScene: renderScene,
        drawTriangles: drawTriangles,
        drawTexture: drawTexture,
        createShaders: createShaders,
        drawCanvasText: drawCanvasText
    };
    return mPublic;
}());

engine.CameraManager = (function () {
    var cameras = [];

    var Public = {
    }
    return Public;
}());

engine.SceneManager = (function () {
    var scenes = [];

    var Public = {
    }
    return Public;
}());

engine.Math = (function () {
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
}());

engine.Transform = class {
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
};

engine.Object2D = class {
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

engine.Scene = class extends engine.Object2D {
    constructor() {
        super();
        this.isScene = true;
        this.ambientColor = [1, 1, 1];
        this.ambientIntensity = 1;
        this.lightManager = new engine.LightManager(this);
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

engine.LightManager = class {
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
};

engine.Light = class extends engine.Object2D {
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

engine.Camera = class extends engine.Object2D {
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
        //alert(this.viewProjMatrix);
    }
    draw() {
    }
    _setViewport() {
        var gl = engine.Core.getGL();
        var canvas = engine.Core.getCanvas();
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

engine.Shader = class {
    constructor(v, f) {
        var gl = engine.Core.getGL();
        this.shaderSource = [v, f];
        this.vertShader = compileShader(gl.VERTEX_SHADER, v);
        this.fragShader = compileShader(gl.FRAGMENT_SHADER, f);
        this.program = createProgram(this.vertShader, this.fragShader);
    }
    compileShader(type, source) {
        var gl = engine.Core.getGL();
        var compiledShader = gl.createShader(type);
        gl.shaderSource(compiledShader, source);
        gl.compileShader(compiledShader);
        if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(compiledShader));
            return null;
        }
        return compiledShader;
    }
    createProgram() {
        var gl = engine.Core.getGL();
        var vertShader = compileShader(this.vertShader, gl.VERTEX_SHADER);
        var fragShader = compileShader(this.fragShader, gl.FRAGMENT_SHADER);
        var program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error linking shader" + "\n\n" + gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }
}

engine.Renderable = class extends engine.Object2D {
    constructor(shader) {
        this.shader = shader;
    }
}

engine.Rectangle = class extends engine.Object2D {
    constructor() {
        super();
        this.isRenderable = true;
        this.color = [0, 0, 0];
        this.alpha = 1;
    }
    draw(camera) {
        var gl = engine.Core.getGL();
        var tMatrix = this.transform.getTransform();//engine.Math.rotateTranslateAndScale(this.position.x,this.position.y,this.width,this.height,this.rotation);
        var vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
        engine.Renderer.drawTriangles(vertices, this.scene, camera, this, tMatrix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

engine.Texture = class {
    constructor(image = null) {
        this.texture = null;
        this.image = new Image();
        this.image.src = image;
        this.image.onload = this.load.call(this);
    }
    load() {
        var gl = engine.Core.getGL();
        this.texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    activate() {
        var gl = engine.Core.getGL();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

engine.Sprite = class extends engine.Object2D {
    constructor(tex) {
        super();
        this.isRenderable = true;
        this.texture = tex;
    }
    draw(camera) {
        var gl = engine.Core.getGL();
        this.texture.activate();
        engine.Renderer.drawTexture(this.scene, camera, this, this.transform.getTransform());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

engine.setScene = function (scene) {
    engine.Renderer.setScene(scene);
}