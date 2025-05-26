// game.js


import { Scene1 } from './scene1.js';
import { SceneWelcome } from './sceneWelcome.js';
import { Scene2 } from './scene2.js';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);


let welcomeScene = new SceneWelcome(engine, canvas);


welcomeScene.renderScene();


window.addEventListener("resize", () => {
    engine.resize();
});