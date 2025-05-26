import { Personnage } from './personnage.js';

export class SceneBase {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.scene = new BABYLON.Scene(engine);
        this.camera = null;
        this.light = null;
        this.ground = null;
        this.personnage = null;  
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); // Interface utilisateur globale
    }

    
    initScene() {
        
        this.camera = new BABYLON.FreeCamera("FixedCamera", new BABYLON.Vector3(0, 5, -5), this.scene);
        this.camera.setTarget(new BABYLON.Vector3(0, 1.25, 0));
        this.camera.attachControl(this.canvas, false);

       
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
        this.light.intensity = 0.7;

        
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, this.scene);

       
    }

    
    createWall(name, width, height, position, rotation, thickness = 1) {
        const wall = BABYLON.MeshBuilder.CreateBox(name, { width, height, depth: thickness }, this.scene);
        wall.position = position;
        wall.rotation = rotation;
        return wall;
    }

    
    createInvisibleWall(name, width, height, position, rotation, thickness = 1) {
        const wall = BABYLON.MeshBuilder.CreateBox(name, { width: width / 2, height: height / 2, depth: thickness }, this.scene);
        wall.position = position;
        wall.rotation = rotation;
        wall.isVisible = false; 
        wall.checkCollisions = true; 
        return wall;
    }

    
    renderScene() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    
    resizeScene() {
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    
    applyTextures(wallTexture) {
        const wallMaterial = new BABYLON.StandardMaterial("wallMat", this.scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture(wallTexture, this.scene);
        wallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

        
        this.scene.getMeshByName("backWall").material = wallMaterial;
        this.scene.getMeshByName("leftWall").material = wallMaterial;
        this.scene.getMeshByName("rightWall").material = wallMaterial;
    }

}