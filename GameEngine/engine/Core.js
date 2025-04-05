import Renderer from "./Renderer"
import VertBuffer from "./VertBuffer"
import GameLoop from "./GameLoop";

var Core = (function(){
    var canvas=null;
    var gl=null;

    var initialize=function(c){
        canvas=c;
        gl=c.getContext("webgl",{engineialias:true});
        if (gl!==null){
            Setup();
        } else {
            console.log("error loading webgl context.");
        }
    }
    
    var Setup=function(){
        var deviceWidth=window.innerWidth;
        var deviceHeight=window.innerHeight;
        canvas.width=deviceWidth; canvas.height=deviceHeight;
    
        VertBuffer.initialize();
        VertBuffer.bindBuffer();
        VertBuffer.bufferData();
        Renderer.createShaders();
        GameLoop.startLoop();
    }
    
    var getGL=function(){
        return gl;
    }

    var getCanvas=function(){
        return canvas;
    }

    var setScene = function (scene) {
        Renderer.setScene(scene);
    }

    var clearGL = function (r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        var gl = getGL();
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    var pubs={
        getGL:getGL,
        getCanvas:getCanvas,
        initialize:initialize,
        setScene: setScene,
        clearGL: clearGL
    }
    return pubs;
}());

export default Core