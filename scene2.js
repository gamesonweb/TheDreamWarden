import { SceneBase } from './scenebase.js';
import { Personnage } from './personnage.js';
import { lampion } from './lampion.js';
 
 
export class Scene2 extends SceneBase {
    constructor(engine, canvas) {
        super(engine, canvas);
        this.sceneName = "Scene2";
        this.roomSize = 48;
        this.arbresCharges = false; 
        this.isNearDoor = false;
        this.initScene();
    }
 
    async initScene() {
        super.initScene();
        this.scene.collisionsEnabled = true;
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.ground.checkCollisions = true;
 
        this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
        this.light.intensity = 0.1;

        // Permet de gérer les bugs de collision
        const targetingPlane = BABYLON.MeshBuilder.CreatePlane("targetPlane", { size: 100 }, this.scene);
        targetingPlane.rotation.x = Math.PI / 2; 
        targetingPlane.position.y = 1; 
        targetingPlane.isPickable = true;
        targetingPlane.visibility = 0; 
        targetingPlane.isVisible = false; 
 
 
        this.customizeScene();
       
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
        groundMaterial.diffuseTexture = new BABYLON.Texture("asset/solf.jpg", this.scene);
        groundMaterial.diffuseTexture.uScale = 5;
        groundMaterial.diffuseTexture.vScale = 5;
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;
 
 
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture("asset/murForet.jpeg", this.scene);
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
 
 
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                
                if ((kbInfo.event.key === "f" || kbInfo.event.key === "F") && this.isNearDoor && this.door.isEnabled()) {
                    this.teleportToScene2();
                }
            }
        });
 
        this.guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
 
        
        this.messageDoor = new BABYLON.GUI.TextBlock();
        this.messageDoor.text = "";
        this.messageDoor.color = "white";
        this.messageDoor.fontSize = 24;
        this.messageDoor.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.messageDoor.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.messageDoor.paddingBottom = 40;
        this.messageDoor.isVisible = false; 
 
        this.guiTexture.addControl(this.messageDoor);
 
        
        this.messageOpenDoor = new BABYLON.GUI.TextBlock();
        this.messageOpenDoor.text = "";
        this.messageOpenDoor.color = "white";
        this.messageOpenDoor.fontSize = 24;
        this.messageOpenDoor.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.messageOpenDoor.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.messageOpenDoor.isVisible = false;
 
        this.guiTexture.addControl(this.messageOpenDoor);
 
 
 
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.personnage || !this.personnage.mesh || !this.door) return;

            const distance = BABYLON.Vector3.Distance(this.personnage.mesh.position, this.door.position);
            this.isNearDoor = distance < 5 && this.door.isEnabled();
 
            
            if (this.isNearDoor) {
                this.messageDoor.text = "Appuyez sur F pour entrer !";
                this.messageDoor.isVisible = true;
            } else {
                this.messageDoor.isVisible = false;
            }
        });
 
        this.addCustomElements();
    }
 
    addCustomElements() {
        const roomSize = this.roomSize;
        this.personnage = new Personnage(this.scene, new BABYLON.Vector3(0, 1, 0));
        console.log("Personnage initialisé :", this.personnage);

    
    if (!this.personnage.mesh) {
        console.error("Erreur : Le mesh du personnage n'est pas chargé.");
    }
 
        // chargement de la lanterne
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
        });
 
        // chargement des arbres
        if (!this.arbresCharges) {
            this.arbresCharges = true;
            BABYLON.SceneLoader.ImportMesh("", "asset/", "arbre.glb", this.scene, (meshes) => {
                const arbreMeshes = meshes.filter(m => m instanceof BABYLON.Mesh && m.geometry);
                if (arbreMeshes.length === 0) return;
 
                const arbreRoot = new BABYLON.TransformNode("arbreRoot", this.scene);
                const positions = [
                    new BABYLON.Vector3(15, 0, 15),
                    new BABYLON.Vector3(-18, 0, 10),
                    new BABYLON.Vector3(-12, 0, -14),
                    new BABYLON.Vector3(5, 0, -20),
                    new BABYLON.Vector3(-20, 0, -6),
                    new BABYLON.Vector3(10, 0, -16),
                    new BABYLON.Vector3(-5, 0, 12),
                    new BABYLON.Vector3(20, 0, -8),
                    new BABYLON.Vector3(-15, 0, 18),
                    new BABYLON.Vector3(6, 0, 20),
                    new BABYLON.Vector3(-1, 0, -10),
                    new BABYLON.Vector3(18, 0, 0),
                    new BABYLON.Vector3(-8, 0, -18),
                    new BABYLON.Vector3(-3, 0, 2),
                    new BABYLON.Vector3(8, 0, -3),
                    new BABYLON.Vector3(0, 0, 5),
                    new BABYLON.Vector3(12, 0, -18)
                ];
 
                positions.forEach((pos, i) => {
                    const arbreInstance = new BABYLON.TransformNode("arbreInstance" + i, this.scene);
                    arbreInstance.position = pos;
                    arbreInstance.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
                    arbreInstance.parent = arbreRoot;
 
                    arbreMeshes.forEach((m, j) => {
                        const inst = m.createInstance(`arbre${i}_mesh${j}`);
                        inst.parent = arbreInstance;
                    });
                });
 
                arbreMeshes.forEach(m => m.setEnabled(false));
            });
        }
 
        // Chargement des Plantes
        BABYLON.SceneLoader.ImportMesh("", "asset/", "plant.glb", this.scene, (meshes) => {
            const plantMeshes = meshes.filter(m => m instanceof BABYLON.Mesh && m.geometry);
            if (plantMeshes.length === 0) return;
 
            const plantRoot = new BABYLON.TransformNode("plantRoot", this.scene);
            const plantPositions = [
                new BABYLON.Vector3(10, 0, 0),
                new BABYLON.Vector3(-10, 0, 5),
                new BABYLON.Vector3(0, 0, -10),
                new BABYLON.Vector3(8, 0, -8),
                new BABYLON.Vector3(-8, 0, 10),
                new BABYLON.Vector3(12, 0.1, 8),
                new BABYLON.Vector3(-12, 0.1, -3),
                new BABYLON.Vector3(3, 0.1, 12),
                new BABYLON.Vector3(-6, 0.1, -12),
                new BABYLON.Vector3(0, 0.1, 10),
                new BABYLON.Vector3(7, 0.1, 4),
                new BABYLON.Vector3(-9, 0.1, 7),
                new BABYLON.Vector3(23, 0.1, 23),
                new BABYLON.Vector3(20, 0.1, 19),
                new BABYLON.Vector3(-22, 0.1, 21),
                new BABYLON.Vector3(-19, 0.1, 23),
                new BABYLON.Vector3(21, 0.1, -20),
                new BABYLON.Vector3(24, 0.1, -22),
                new BABYLON.Vector3(-23, 0.1, -22),
                new BABYLON.Vector3(-20, 0.1, -19),
            ];
 
            plantPositions.forEach((pos, i) => {
                const plantInstance = new BABYLON.TransformNode("plantInstance" + i, this.scene);
                plantInstance.position = pos;
                plantInstance.scaling = new BABYLON.Vector3(2, 2, 2);
                plantInstance.parent = plantRoot;
 
                plantMeshes.forEach((m, j) => {
                    const inst = m.createInstance(`plant${i}_mesh${j}`);
                    inst.parent = plantInstance;
                });
            });
 
            plantMeshes.forEach(m => m.setEnabled(false));
        });
 
         // Porte
        this.door = BABYLON.MeshBuilder.CreateBox("porte", { width: 4, height: 6, depth: 0.3 }, this.scene);
        this.door.position = new BABYLON.Vector3(0, -4, this.roomSize / 2 - 0.2);
        this.door.checkCollisions = true;
        this.door.material = new BABYLON.StandardMaterial("doorMat", this.scene);
        this.door.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.door.setEnabled(false);
        this.doorOpened = false;
 
        //Lampions
        this.lampions = [];
        this.nbLampionsAllumes = 0;
        const lampionPositions = [
            new BABYLON.Vector3(-15, 0, 3),
            new BABYLON.Vector3(15, 0, 23),
            new BABYLON.Vector3(13, 0, -16.5)
        ];
 
        const onLampionAllume = () => {
            this.nbLampionsAllumes++;
            console.log(`Lampions allumés : ${this.nbLampionsAllumes}/3`);
 
            if (this.nbLampionsAllumes === 3 && !this.doorOpened) {
                this.doorOpened = true;
                console.log("Tous les lampions sont allumés !");
                this.door.setEnabled(true);
 
                const animation = new BABYLON.Animation("doorOpen", "position.y", 30,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
 
                const keys = [
                    { frame: 0, value: this.door.position.y },
                    { frame: 30, value: this.door.position.y + 7 }
                ];
 
                animation.setKeys(keys);
                this.door.animations = [animation];
                this.scene.beginAnimation(this.door, 0, 30, false);
                setTimeout(() => {
                this.showDoorTexts([
                        "Lanterne : Je me sens... puissante",
                        "Lanterne : les anciens DreamWardens nous donnent leur force.",
                        "Lanterne : Pour que les enfants puissent de nouveau rêver",
                        "Lanterne : nous devons aller tuer les cauchemars !",
                        "Lanterne : Je vais t'ouvrir un passage ",
                        "Lanterne : il te mènera dans un lieu dangereux",
                        "Lanterne : libérons tes ancêtres de leur emprise.",
                        "Lanterne : Sois prudent, le combat va être rude.",
                        "Une porte s'ouvre au loin..."
                    ]);
                }, 2000); 
                this.messageOpenDoor.isVisible = true;
 
                setTimeout(() => {
                    this.messageOpenDoor.isVisible = false;
                }, 4000); 
            }
        };
 
        lampionPositions.forEach((pos, index) => {
            const l = new lampion(this.scene, this.personnage, pos);
            l.onAllume = () => onLampionAllume();
            this.lampions.push(l);
        });
 
        setTimeout(() => {
            this.showIntroTexts([
                "Hein ? Mais que s'est-il passé ?",
                "Lanterne : Nous sommes dans la Lichterwald...",
                "Lanterne : Cet endroit est lié aux anciens DreamWardens",
                "Lanterne : plus précisément à leurs souvenirs...",
                "Lanterne : Retrouve leurs partenaires.",
                "Lanterne : Et ravive leurs flammes !",
                "Lanterne : Il devrait en avoir 3 dans ces bois.",
                "Lanterne : Je te prête mon pouvoir, sois prudent.",
                "Visez et tirez une boule de feu avec la souris "
            ]);
        }, 2000); 

    }
 
   
 
    teleportToScene2() {
        console.log("Téléportation vers la scène 2 !");
        setTimeout(() => {
            this.goToNextScene();
        }, 2000); 
    }
 
    showIntroTexts(lines) {
        let currentIndex = 0;
        if (this.personnage) this.personnage.controlsEnabled = false;
      
 
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.color = "white";
        textBlock.fontSize = 24;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        textBlock.paddingBottom = 80;
        this.guiTexture.addControl(textBlock);
 
        const showNextLine = () => {
            if (currentIndex < lines.length) {
                textBlock.text = lines[currentIndex];
                textBlock.isVisible = true;
                currentIndex++;
                setTimeout(showNextLine, 3000);
            } else {
                textBlock.isVisible = false;
                if (this.personnage) this.personnage.controlsEnabled = true;
                
            }
        };
 
        showNextLine();
        

    }

    showDoorTexts(lines) {
        let currentIndex = 0;
        this.personnage.controlsEnabled = false;
      
 
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.color = "white";
        textBlock.fontSize = 24;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        textBlock.paddingBottom = 80;
        this.guiTexture.addControl(textBlock);
 
        const showNextLine = () => {
            if (currentIndex < lines.length) {
                textBlock.text = lines[currentIndex];
                textBlock.isVisible = true;
                currentIndex++;
                setTimeout(showNextLine, 3000);
            } else {
                textBlock.isVisible = false;
                this.personnage.controlsEnabled = true;
                
            }
        };
 
        showNextLine();
        
    }


    async goToNextScene() {
        try {
            console.log("Passage à la scène 3...");
    
          
            this.engine.stopRenderLoop();
    
           
            this.scene.onBeforeRenderObservable.clear();
    
            
            const { Scene3 } = await import('./scene3.js');
            const scene3 = new Scene3(this.engine, this.canvas);
            await scene3.initScene();
    
            
            this.scene.dispose();
    
            
            this.engine.runRenderLoop(() => {
                if (scene3.scene) {
                    scene3.scene.render();
                }
            });
    
        } catch (error) {
            console.error("Erreur lors du passage à la scène 3 :", error);
        }

    }}