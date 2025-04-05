import Core from "./Core";

var Renderer = (function () {
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
        var gl = Core.getGL();
        var compiledShader = gl.createShader(type);
        gl.shaderSource(compiledShader, source);
        gl.compileShader(compiledShader);
        if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(compiledShader));
        } else
            return compiledShader;
    };

    var createProgram = function (vs, fs) {
        var gl = Core.getGL();
        var vertShader = compileShader(vs, gl.VERTEX_SHADER);
        var fragShader = compileShader(fs, gl.FRAGMENT_SHADER);
        var program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        linkProgram(program);
        return program;
    }

    var linkProgram = function (program) {
        var gl = Core.getGL();
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error linking shader" + "\n\n" + gl.getProgramInfoLog(program));
            return null;
        }
    }

    var setLightData = function (camera, program) {
        var gl = Core.getGL();
        var canvas = Core.getCanvas();
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
        var gl = Core.getGL();
        var canvas = Core.getCanvas();
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
        var gl = Core.getGL();
        var canvas = Core.getCanvas();
        var program = shaders[1];
        gl.useProgram(program);

        var vertices = new Float32Array([
            -1.0, -1.0, 0.0, 1.0,
            -1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 0.0
        ]);
        VertBuffer.bufferSubData(vertices);
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

export default Renderer;