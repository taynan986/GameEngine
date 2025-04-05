var GameLoop = (function () {
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
}())

export default GameLoop