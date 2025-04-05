import Renderer from "./Renderer";
import GameLoop from "./GameLoop";
import Light from "./Light";
import LightManager from "./LightManager";
import SceneManager from "./SceneManager";
import Rectangle from "./Rectangle";
import Core from "./Core";
import Math from "./Math";
import Renderable from "./Renderable";
import Scene from "./Scene";
import Camera from "./Camera";
import Object2D from "./Object2D";
import Shader from "./Shader";
import Sprite from "./Sprite";
import Texture from "./Texture";
import Transform from "./Transform";
import VertBuffer from "./VertBuffer";

var Engine = {}

Engine.Renderer = Renderer
Engine.Core = Core
Engine.GameLoop = GameLoop
Engine.Light = Light
Engine.LightManager = LightManager
Engine.Object2D = Object2D
Engine.Rectangle = Rectangle
Engine.Renderable = Renderable
Engine.Scene = Scene
Engine.SceneManager = SceneManager
Engine.Shader = Shader
Engine.Sprite = Sprite
Engine.Texture = Texture
Engine.Transform = Transform
engine.VertBuffer = VertBuffer
Engine.Camera = Camera
Engine.Math = Math
Engine.Transform = Transform

export default Engine