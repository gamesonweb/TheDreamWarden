import { SceneBase } from './scenebase.js';
import { Personnage } from './personnage.js';
import { Enemy } from './enemy.js';
 
 
export class Scene3 extends SceneBase {
    constructor(engine, canvas) {
        super(engine, canvas);
        this.sceneName = "Scene3";
        this.roomSize = 24;
        this.tombeCharges = false;
        this.herbeCharges = false;
        this.initScene();
    }
 
    async initScene() {
           
        super.initScene();
		this.scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2); 
        this.scene.collisionsEnabled = true;
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.ground.checkCollisions = true;
 
 
        this.light.intensity = 0.1;
        
        const targetingPlane = BABYLON.MeshBuilder.CreatePlane("targetPlane", { size: 100 }, this.scene);
        targetingPlane.rotation.x = Math.PI / 2; 
        targetingPlane.position.y = 1; 
        targetingPlane.isPickable = true;
        targetingPlane.visibility = 0; 
        targetingPlane.isVisible = false; 
 
        this.customizeScene();
        this.showIntroText(); 
       
    }
 
    customizeScene() {
        const roomSize = this.roomSize;
        const wallHeight = 15;
        const wallThickness = 0.5;
 
        
        const wallsToRemove = ["backWall", "frontWall", "leftWall", "rightWall", "collisionWall"];
        wallsToRemove.forEach(wallName => {
            const wall = this.scene.getMeshByName(wallName);
            if (wall) wall.dispose();
        });
 
        if (this.ground) this.ground.dispose();
 
        
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: roomSize, height: roomSize }, this.scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("asset/solCim.png", this.scene); // A CHANGER 
        groundMaterial.diffuseTexture.uScale = 5;
        groundMaterial.diffuseTexture.vScale = 5;

        
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;
 
        
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture("asset/murCim.png", this.scene);
        wallMaterial.diffuseTexture.uScale = 2;
        wallMaterial.diffuseTexture.vScale = 2;
 
        const createWall = (name, position, rotationY = 0, isTransparent = false) => {
            const wall = BABYLON.MeshBuilder.CreateBox(name, {
                width: roomSize,
                height: wallHeight,
                depth: wallThickness
            }, this.scene);
            wall.position = position;
            wall.rotation.y = rotationY;
            wall.checkCollisions = true;
 
            if (isTransparent) {
                const transparentMaterial = new BABYLON.StandardMaterial("transparentMaterial", this.scene);
                transparentMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
                transparentMaterial.alpha = 0.05;
                wall.material = transparentMaterial;
            } else {
                wall.material = wallMaterial;
            }
 
            return wall;
        };
 
        createWall("backWall", new BABYLON.Vector3(0, wallHeight / 2, roomSize / 2));
        createWall("collisionWall", new BABYLON.Vector3(0, wallHeight / 2, roomSize / 2 - 1.5)).isVisible = false;
        createWall("frontWall", new BABYLON.Vector3(0, wallHeight / 2, -roomSize / 2), 0, true);
        createWall("leftWall", new BABYLON.Vector3(-roomSize / 2, wallHeight / 2, 0), Math.PI / 2);
        createWall("rightWall", new BABYLON.Vector3(roomSize / 2, wallHeight / 2, 0), Math.PI / 2);


 
        this.addCustomElements();
    }
 
    addCustomElements() {
        const roomSize = this.roomSize;
        this.personnage = new Personnage(this.scene, new BABYLON.Vector3(0, 1, 0));

        
        this.addEnemies();

        
        this.addLamp();

        
    }

    addEnemies() {
        
        this.enemies = [];

        // Ajouter des ennemis
        const enemyPosition1 = new BABYLON.Vector3(5, 1, 5);
        const enemyPosition2 = new BABYLON.Vector3(-5, 1, 5);
        const enemyPosition3 = new BABYLON.Vector3(7, 1, 5);

        const enemy1 = new Enemy(this.scene, this.personnage, enemyPosition1, 1, 3);
        const enemy2 = new Enemy(this.scene, this.personnage, enemyPosition2, 1, 3);
        const enemy3 = new Enemy(this.scene, this.personnage, enemyPosition3, 3, 3);

        
        this.enemies.push(enemy1, enemy2, enemy3);

        
        this.scene.onBeforeRenderObservable.add(() => {
            this.checkEnemiesStatus();
        });

        //Chargement des tombes
        if (!this.tombeCharges) {
            this.tombeCharges = true;
            BABYLON.SceneLoader.ImportMesh("", "asset/", "tombe.glb", this.scene, (meshes) => {
                console.log(" Fichier GLB chargé, meshes :", meshes);
                const tombeMeshes = meshes.filter(m => m instanceof BABYLON.Mesh && m.geometry);
                console.log(" Meshes filtrés (avec géométrie) :", tombeMeshes);
                if (tombeMeshes.length === 0) return;

                const tombeRoot = new BABYLON.TransformNode("tombeRoot", this.scene);
                const positions = [
                    
                    new BABYLON.Vector3(-4, 4, -10),
                    new BABYLON.Vector3(-8, 4, -6),
                    new BABYLON.Vector3(-4, 4, -2),

                    new BABYLON.Vector3(-8, 4, 2),
                    new BABYLON.Vector3(-4, 4, 6),
                    new BABYLON.Vector3(-8, 4, 10),

                    
                    new BABYLON.Vector3(4, 4, -10),
                    new BABYLON.Vector3(8, 4, -6),
                    new BABYLON.Vector3(4, 4, -2),
                    new BABYLON.Vector3(8, 4, 2),
                    new BABYLON.Vector3(4, 4, 6),
                    new BABYLON.Vector3(8, 4, 10),
                ];

                positions.forEach((pos, i) => {
                    console.log(` Création de la tombe ${i} à la position`, pos);
                    const tombeInstance = new BABYLON.TransformNode("tombeInstance" + i, this.scene);
                    tombeInstance.position = pos;
                    tombeInstance.scaling = new BABYLON.Vector3(1, 1, 1);
                    tombeInstance.parent = tombeRoot;

                    tombeMeshes.forEach((m, j) => {
                        const inst = m.createInstance(`tombe${i}_mesh${j}`);
                        inst.parent = tombeInstance;
                    });
                });

                tombeMeshes.forEach(m => m.setEnabled(false)); 
            });

        }

        //Chargement de l'herbe 
        if (!this.HerbesCharges) {
            this.HerbesCharges = true;

            BABYLON.SceneLoader.ImportMesh("", "asset/", "herbeM.glb", this.scene, (meshes) => {
                console.log(" Fichier GLB herbes chargé, meshes :", meshes);

                const herbeMeshes = meshes.filter(m => m instanceof BABYLON.Mesh && m.geometry);
                console.log(" Meshes filtrés (herbes avec géométrie) :", herbeMeshes);
                if (herbeMeshes.length === 0) return;

                const herbeRoot = new BABYLON.TransformNode("herbeRoot", this.scene);

                const positions = [
                    new BABYLON.Vector3(-7.5, 1, -8.5),
                    new BABYLON.Vector3(-2.5, 1, -5.3),
                    new BABYLON.Vector3(0.8, 1, -3.9),
                    new BABYLON.Vector3(6.6, 1, -1.1),
                    new BABYLON.Vector3(2.9, 1, 1.7),
                    new BABYLON.Vector3(-6.2, 1, 3.3),
                    new BABYLON.Vector3(1.5, 1, 6.9),
                    new BABYLON.Vector3(9, 1, -11),
                ];

                positions.forEach((pos, i) => {
                    console.log(` Création de l'herbe ${i} à la position`, pos);

                    const herbeInstance = new BABYLON.TransformNode("herbeInstance" + i, this.scene);
                    herbeInstance.position = pos;
                    herbeInstance.scaling = new BABYLON.Vector3(1, 1, 1);
                    herbeInstance.parent = herbeRoot;

                    herbeMeshes.forEach((mesh, j) => {
                        const inst = mesh.createInstance(`herbe${i}_mesh${j}`);
                        inst.parent = herbeInstance;
                    });
                });

        
        herbeMeshes.forEach(m => m.setEnabled(false));
    });
}




        
        BABYLON.SceneLoader.ImportMesh("", "asset/", "crane.glb", this.scene, (meshes) => {
            console.log(" Crâne chargé :", meshes);
            const craneRoot = new BABYLON.TransformNode("craneRoot", this.scene);
            
            meshes.forEach((mesh, i) => {
                mesh.parent = craneRoot;
            });

            craneRoot.position = new BABYLON.Vector3(-4.75, 1, 5.5); 
            craneRoot.scaling = new BABYLON.Vector3(0.003, 0.003, 0.003);  
            craneRoot.rotation = new BABYLON.Vector3(0, Math.PI * -0.85, 0); 

        });

        // Chargement du pot de fleurs
        BABYLON.SceneLoader.ImportMesh("", "asset/", "flower_pot.glb", this.scene, (meshes) => {
            console.log(" Pot de fleurs chargé :", meshes);
            const potRoot = new BABYLON.TransformNode("potRoot", this.scene);
            
            meshes.forEach((mesh, i) => {
                mesh.parent = potRoot;
            });

            potRoot.position = new BABYLON.Vector3(4.75, 1, -3.25); 
            potRoot.scaling = new BABYLON.Vector3(5, 5, 5); 

        });

        
        BABYLON.SceneLoader.ImportMesh("", "asset/", "arbreMort.glb", this.scene, (meshes) => {
            console.log(" Arbre mort chargé :", meshes);
            const arbreRoot = new BABYLON.TransformNode("arbreRoot", this.scene);
            
            meshes.forEach((mesh, i) => {
                mesh.parent = arbreRoot;
            });

            arbreRoot.position = new BABYLON.Vector3(-8, 1, -5); 
            arbreRoot.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);  
        });
    }

    addLamp() {
        // Charger le modèle de la lampe
        BABYLON.SceneLoader.ImportMesh("", "asset/", "lanterne.glb", this.scene, (meshes) => {
            const lantern = meshes[0];
            lantern.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

            
            const lanternLight = new BABYLON.PointLight("lanternLight", new BABYLON.Vector3(0, 0, 0), this.scene);
            lanternLight.intensity = 2;
            lanternLight.range = 10;
            lanternLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);

            
            const lanternMaterial = lantern.material || new BABYLON.StandardMaterial("lanternMaterial", this.scene);
            lanternMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
            lantern.material = lanternMaterial;

           
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.personnage.mesh && lantern) {
                    lantern.position.copyFrom(this.personnage.mesh.position.add(new BABYLON.Vector3(0.5, 1, 0)));
                    lanternLight.position.copyFrom(lantern.position);
                }
            });

            console.log("Lampe ajoutée à la scène 3.");
        });
    }

    checkEnemiesStatus() {
        
        const allEnemiesDead = this.enemies.every(enemy => enemy.health <= 0);

        if (allEnemiesDead) {
            this.showEndCredits();
        }
    }

    showEndCredits() {
        
        if (this.endScreenDisplayed) return;
        this.endScreenDisplayed = true;

        
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        
        const endImage = new BABYLON.GUI.Image("endImage", "asset/fin.png");
        endImage.width = "100%";
        endImage.height = "100%";
        advancedTexture.addControl(endImage);

        
        const creditsText = new BABYLON.GUI.TextBlock();
        creditsText.text = "Vous avez sauvé le monde des rêves !\n\n\n\nMerci d'avoir joué à notre jeu !\n\n\n Lucie DEGUISNE et Mathis PILON \nL3 MIAGE Université de TOULOUSE \n\n\n\nÀ bientôt pour de nouvelles aventures !";
        creditsText.color = "white";
        creditsText.fontSize = 35;
        creditsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        creditsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        creditsText.top = "100%"; 
        advancedTexture.addControl(creditsText);

        // Faire défiler le texte
        const scrollSpeed = 1; 
        const interval = setInterval(() => {
            const currentTop = parseFloat(creditsText.top);
            creditsText.top = `${currentTop - scrollSpeed}px`; 

            
            if (currentTop <= -advancedTexture.getSize().height) {
                clearInterval(interval);
                console.log("Défilement des crédits terminé.");
            }
        }, 30); 

        console.log("Tous les ennemis sont morts. Affichage de l'écran de fin avec crédits.");
    }
	

    //pas utilisé pour le moment 
	_restartScene() {
        console.log("✝️  Le joueur est mort – redémarrage de la scène 2");
        
        this.scene.dispose();

        
        const engine = this.getEngine();
        const canvas = engine.getRenderingCanvas();
        const newScene = new Scene2(engine, canvas);   
    }
    
    showIntroText() {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = "Lanterne : Nous y voilà... les cauchemars...\nLanterne : Utilise mon pouvoir, tue les et tu seras libre !\nLanterne : Et le monde des rêves sera sauvé !";
    textBlock.color = "white";
    textBlock.fontSize = 24;
    textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    textBlock.paddingBottom = 80;
    textBlock.paddingTop = "20px";

    advancedTexture.addControl(textBlock);

    
    setTimeout(() => {
        advancedTexture.removeControl(textBlock);
    }, 5000); 
}




	
}