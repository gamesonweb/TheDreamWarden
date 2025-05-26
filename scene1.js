// scene1.js

import { SceneBase } from './scenebase.js';
import { Personnage } from './personnageSP.js';

export class Scene1 extends SceneBase {
    constructor(engine, canvas) {
        super(engine, canvas);
        this.sceneName = "Scene1";
        this.roomSize = 12;
        this.initScene();
        this.rightWall = null; 
        this.isInutScene = false;
        this.cinematicFinished = false;
       
        }
        
    

    async initScene() {
        super.initScene();
        this.scene.collisionsEnabled = true;
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;
        this.ground.checkCollisions = true;

        this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
        this.light.intensity = 0.1;

        this.customizeScene();
    }

    customizeScene() {
        const roomSize = this.roomSize;
        const wallHeight = 15;
        const wallThickness = 0.5;
    
        // 🧹 Étape 1 : SUPPRIMER les anciens murs et le sol
        const wallsToRemove = ["backWall", "frontWall", "leftWall", "rightWall", "collisionWall"];
        wallsToRemove.forEach(wallName => {
            const wall = this.scene.getMeshByName(wallName);
            if (wall) wall.dispose();
        });
    
        if (this.ground) this.ground.dispose();
    
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: roomSize, height: roomSize }, this.scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("asset/solEnf.png", this.scene);
        groundMaterial.diffuseTexture.uScale = 5;
        groundMaterial.diffuseTexture.vScale = 5;
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;
    
      
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture("asset/murEnf.png", this.scene);
        wallMaterial.diffuseTexture.uScale = 2;
        wallMaterial.diffuseTexture.vScale = 2;
    
  
        const backWall = BABYLON.MeshBuilder.CreateBox("backWall", { width: roomSize, height: wallHeight, depth: wallThickness }, this.scene);
        backWall.position = new BABYLON.Vector3(0, wallHeight / 2, roomSize / 2);
        backWall.material = wallMaterial;
        backWall.checkCollisions = true;
    
        const collisionWall = BABYLON.MeshBuilder.CreateBox("collisionWall", { width: roomSize, height: wallHeight, depth: wallThickness }, this.scene);
        collisionWall.position = new BABYLON.Vector3(0, wallHeight / 2, roomSize / 2 - 1.5);
        collisionWall.isVisible = false;
        collisionWall.checkCollisions = true;
    
    
        const frontWall = BABYLON.MeshBuilder.CreateBox("frontWall", { width: roomSize, height: wallHeight, depth: wallThickness }, this.scene);
        frontWall.position = new BABYLON.Vector3(0, wallHeight / 2, -roomSize / 2);
        const transparentMaterial = new BABYLON.StandardMaterial("transparentMaterial", this.scene);
        transparentMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        transparentMaterial.alpha = 0.05;
        frontWall.material = transparentMaterial;
        frontWall.checkCollisions = true;
    

        const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", { width: roomSize, height: wallHeight, depth: wallThickness }, this.scene);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position = new BABYLON.Vector3(-roomSize / 2, wallHeight / 2, 0);
        leftWall.material = wallMaterial;
        leftWall.checkCollisions = true;
    
 
        this.rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", { width: roomSize, height: wallHeight, depth: wallThickness }, this.scene);
        this.rightWall.rotation.y = Math.PI / 2;
        this.rightWall.position = new BABYLON.Vector3(roomSize / 2, wallHeight / 2, 0);
        this.rightWall.material = wallMaterial;
        this.rightWall.checkCollisions = true;
    
        
        this.addCustomElements();
    }

    
    
    
    addCustomElements() {
        const roomSize = this.roomSize;
        this.personnage = new Personnage(this.scene, new BABYLON.Vector3(0, 1, 0));
    
        BABYLON.SceneLoader.ImportMesh("", "asset/", "livres.glb", this.scene, (meshes) => {
            const livres = meshes[0];
            livres.position = new BABYLON.Vector3(0,0,0);
            livres.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        });
        
        BABYLON.SceneLoader.ImportMesh("", "asset/", "bureau.glb", this.scene, (meshes) => {
            const bureau = meshes[0];
            bureau.position = new BABYLON.Vector3(-4.9,-1,3.3);
            bureau.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
            bureau.position.y = 1.2;
        });

    
     
    
        // Variables
        let isLanternEquipped = false;
        let repliqueLampefini = false;
        let objetsRamasses = false;
        let nbObjetsRamasses = 0;
        let dialogueIndex = 0;
        let dialogueInProgress = false;
        let murOuvert = false;
        let rightWallHasOpening = false;
        

        this.scene.onBeforeRenderObservable.add(() => {
            if (!murOuvert && nbObjetsRamasses === 3 && !rightWallHasOpening) {
                console.log("Création porte déclenchée !");
                
                
                if (!this.advancedTexture) {
                    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                }
                const textBlock = new BABYLON.GUI.TextBlock();
                textBlock.text = "Un passage s'est ouvert dans le mur !";
                textBlock.color = "white";
                textBlock.fontSize = 24;
                textBlock.background = "rgba(0, 0, 0, 0.5)";
                textBlock.paddingTop = "10px";
                textBlock.paddingBottom = "10px";
                textBlock.paddingLeft = "20px";
                textBlock.paddingRight = "20px";
                textBlock.cornerRadius = 10;
                textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                this.advancedTexture.addControl(textBlock);
        
                setTimeout(() => {
                    this.advancedTexture.removeControl(textBlock);
                }, 5000);
        
                
                this.opening = BABYLON.MeshBuilder.CreateBox("opening", {
                    width: 2,
                    height: 3,
                    depth: 0.01
                }, this.scene);
        
                this.opening.position.x = 4;
                this.opening.position.y = 1.5; 
                this.opening.position.z = 5.7;
        
                const mat = new BABYLON.StandardMaterial("openingMat", this.scene);
                mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mat.alpha = 1;
                mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
                this.opening.material = mat;
        
                
                const light = new BABYLON.PointLight("openingLight", new BABYLON.Vector3(this.opening.position.x, this.opening.position.y + 1, this.opening.position.z), this.scene);
                light.diffuse = new BABYLON.Color3(1, 0.8, 0.4);
                light.intensity = 1.5;
        
                rightWallHasOpening = true;
                murOuvert = true;
            }
        });

        
        this.scene.onBeforeRenderObservable.add(() => {
            if (!murOuvert || this.cinematicFinished) return; 
            const openingPosition = new BABYLON.Vector3(4, 0, 5.7); 
            const distanceToOpening = BABYLON.Vector3.Distance(this.personnage.mesh.position, openingPosition);
        
            if (distanceToOpening < 2.5 && !this.isInCutscene) { 
                this.triggerDeathScreen(); 
            }
        });

        const lanternDialogues = [
            "Lanterne : Bon comme tu t'en doutes, cette cage n'est pas normale",
            "lanterne : elle s'ouvre grâce à l'énergie des enfants",
            "Lanterne : il faut que tu trouves des objets avec leur énergie ",
            "Lanterne : Fouille, il doit en avoir ici...",
        ];

        
        this.scene.onBeforeRenderObservable.add(() => {
            if (dialogueInProgress || repliqueLampefini) return;
        
            const lanternPosition = new BABYLON.Vector3(-roomSize / 2 + 1, 2.37, roomSize / 2 - 2);
            const distance = BABYLON.Vector3.Distance(this.personnage.mesh.position, lanternPosition);
        
            if (distance < 3) {
                dialogueInProgress = true;
        
                if (dialogueIndex < lanternDialogues.length) {
                    this.showLanternMessage(lanternDialogues[dialogueIndex]);
                    dialogueIndex++;
        
                    setTimeout(() => {
                        dialogueInProgress = false;
                        if (dialogueIndex === lanternDialogues.length) {
                            repliqueLampefini = true; 
                        }
                    }, 3000);
                }
            }
        });


        
        
    
        BABYLON.SceneLoader.ImportMesh("", "asset/", "lanterneCage.glb", this.scene, (meshes) => {
            const lantern = meshes[0];
            lantern.position = new BABYLON.Vector3(-roomSize / 2 + 1, 2.37, roomSize / 2 - 2);
            lantern.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    
            const lanternLight = new BABYLON.PointLight("lanternLight", new BABYLON.Vector3(0, 0, 0), this.scene);
            lanternLight.parent = lantern;
            lanternLight.intensity = 2;
            lanternLight.range = 10;
            lanternLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
    
            const lanternMaterial = lantern.material || new BABYLON.StandardMaterial("lanternMaterial", this.scene);
            lanternMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0.8);
            lantern.material = lanternMaterial;
    
            this.scene.onBeforeRenderObservable.add(() => {
                if (isLanternEquipped) return;
                const distance = BABYLON.Vector3.Distance(this.personnage.mesh.position, lantern.position);
                if (distance < 3 && nbObjetsRamasses === 3) {
                    this.showLanternMessage("Appuyez sur F libérer la lanterne ");
                }
             
                
            });
    
            window.addEventListener("keydown", (event) => {
                if (event.key.toLowerCase() === "f") {
                    const distance = BABYLON.Vector3.Distance(this.personnage.mesh.position, lantern.position);
                    if (distance < 3 && !isLanternEquipped && nbObjetsRamasses === 3) {
                        this.equipLantern(lantern, lanternLight);
                        isLanternEquipped = true;
                    }
                }
            });

            BABYLON.SceneLoader.ImportMesh("", "asset/", "lit.glb", this.scene, (meshes) => {
                const lit = meshes[0];
                lit.name = "lit";
                lit.scaling = new BABYLON.Vector3(2, 2, 2);
                lit.position = new BABYLON.Vector3(-4, 0, -4.5);
                lit.position.y = 2.2;
                lit.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
                lit.rotation.y = Math.PI / 2;
                lit.checkCollisions = true;
            
              
                BABYLON.SceneLoader.ImportMesh("", "asset/", "pyjama.glb", this.scene, (meshes) => {
                    const pyjama = meshes[0];
                    pyjama.name = "pyjama";
                    pyjama.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                    pyjama.position = new BABYLON.Vector3(lit.position.x, 2, lit.position.z);
                    pyjama.setEnabled(false);
            
                    let litFouille = false;
                    let pyjamaRamasse = false;
            
                    this.scene.onBeforeRenderObservable.add(() => {
                        const distanceToLit = BABYLON.Vector3.Distance(this.personnage.mesh.position, lit.position);
            
                        if (!litFouille && repliqueLampefini && distanceToLit < 3) {
                            this.showLanternMessage("Fouiller le lit avec F");
                        }
            
                        if (!litFouille) {
                            window.addEventListener("keydown", (event) => {
                                if ((event.key === "f" || event.key === "F") && distanceToLit < 3 && !litFouille && repliqueLampefini) {
                                    pyjama.setEnabled(true);
                                    litFouille = true;
                                    this.showLanternMessage("Un pyjama est apparu !");
                                }
                            });
                        }
            
                       
                        if (litFouille && !pyjamaRamasse) {
                            const distanceToPyjama = BABYLON.Vector3.Distance(this.personnage.mesh.position, pyjama.position);
            
                            if (distanceToPyjama < 3) {
                                this.showLanternMessage("Ramasser le pyjama avec F");
            
                                window.addEventListener("keydown", (event) => {
                                    if ((event.key === "f" || event.key === "F") && distanceToPyjama < 2 && !pyjamaRamasse) {
                                        pyjama.setEnabled(false);
                                        pyjamaRamasse = true;
                                        nbObjetsRamasses += 1;
                                        this.showLanternMessage("Vous avez ramassé le pyjama !");
                                    }
                                });
                            }
                        }
                    });
                });
            });
        });



        let doudou;
        let doudouRamasse = false;              
        BABYLON.SceneLoader.ImportMesh("", "asset/", "doudou.glb", this.scene, (meshes) => {
            doudou = meshes[0];
            doudou.name = "doudou";
            doudou.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
            doudou.position = new BABYLON.Vector3(3, 0.5, -3); 
            doudou.checkCollisions = true;
            doudou.isVisible = true;

           
        
            this.scene.onBeforeRenderObservable.add(() => {
                const distDoudou = BABYLON.Vector3.Distance(this.personnage.mesh.position, doudou.position);
                if (!doudouRamasse && repliqueLampefini && distDoudou < 3) {
                    this.showLanternMessage("Ramasser le doudou avec F");
                }
            });
        
            window.addEventListener("keydown", (event) => {
                if ((event.key.toLowerCase() === "f") && !doudouRamasse && repliqueLampefini) {
                    const distDoudou = BABYLON.Vector3.Distance(this.personnage.mesh.position, doudou.position);
                    if (distDoudou < 2) {
                        doudou.setEnabled(false);
                        doudouRamasse = true;
                        nbObjetsRamasses += 1;
                        this.showLanternMessage("Vous avez ramassé le doudou !");
                    }
                }
            });
        });


        
        let armoire, train;
        let trainVisible = false;
        let armoireDeplacee = false;
        let trainRamasse = false;
    
        BABYLON.SceneLoader.ImportMesh("", "asset/", "armoire.glb", this.scene, (meshes) => {
            armoire = meshes[0];
          
            armoire.position = new BABYLON.Vector3(2, 0, 4.5);
            armoire.position.y = 2;
            armoire.rotation.y = Math.PI;
           
            armoire.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);


            armoire.scaling = new BABYLON.Vector3(2, 2, 2);
            armoire.checkCollisions = true;
    
            BABYLON.SceneLoader.ImportMesh("", "asset/", "train.glb", this.scene, (trainMeshes) => {
                train = trainMeshes[0];
                train.position = new BABYLON.Vector3(armoire.position.x+0.5, 0, armoire.position.z);
                train.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
                train.position.y = 0.2;
                train.isVisible = false;
                train.checkCollisions = true;
            });
        });
    
        
        const showMessage = (msg) => {
            if (this.messageDisplayed) return;
            this.messageDisplayed = true;
            const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const textBlock = new BABYLON.GUI.TextBlock();
            textBlock.text = msg;
            textBlock.color = "white";
            textBlock.fontSize = 24;
            textBlock.background = "black";
            textBlock.width = "300px";
            textBlock.height = "100px";
            textBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            textBlock.top = "-100px";
            advancedTexture.addControl(textBlock);
            setTimeout(() => {
                advancedTexture.removeControl(textBlock);
                this.messageDisplayed = false;
            }, 2000);
        };
    
        
        this.scene.onBeforeRenderObservable.add(() => {
            if (!armoire) return;
            const distArmoire = BABYLON.Vector3.Distance(this.personnage.mesh.position, armoire.position);
    
            if (distArmoire < 3 && !armoireDeplacee && repliqueLampefini) {
                showMessage("Déplacer l'armoire avec F");
            } else if (distArmoire < 3 && armoireDeplacee && trainVisible && !trainRamasse) {
                const distTrain = BABYLON.Vector3.Distance(this.personnage.mesh.position, train.position);
                if (distTrain < 3) {
                    showMessage("Ramasser le train avec F");
                }
            }
        });
    
        window.addEventListener("keydown", (event) => {
            if (event.key.toLowerCase() === "f") {
                if (!armoire) return;
                const distArmoire = BABYLON.Vector3.Distance(this.personnage.mesh.position, armoire.position);
    
                if (distArmoire < 3 && !armoireDeplacee && repliqueLampefini) {
                    armoire.position.x -= 3;
                    armoireDeplacee = true;
                    trainVisible = true;
                    
                    if (train) train.isVisible = true;
                } else if (armoireDeplacee && trainVisible && !trainRamasse) {
                    const distTrain = BABYLON.Vector3.Distance(this.personnage.mesh.position, train.position);
                    if (distTrain < 3 ) {
                        train.setEnabled(false);
                        trainRamasse = true;
                        nbObjetsRamasses += 1;
                        showMessage("Train ramassé !");
                        
                    }
                }
            }
        });
    }
    

    equipLantern(lantern, lanternLight) {
        
        lantern.parent = this.personnage.mesh;
        lantern.position = new BABYLON.Vector3(0.5, 1, 0); 
        lantern.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

        
        lanternLight.parent = lantern;

        
        this.showLanternMessage("Vous avez équipé la lanterne !");

        // Passer à la scène 2
        setTimeout(() => {
            this.goToNextScene();
        }, 2000); 
    }

    showLanternMessage(message) {
        if (this.messageDisplayed) return;
        this.messageDisplayed = true;

        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = message;
        textBlock.color = "white";
        textBlock.fontSize = 24;
        textBlock.background = "black";
        textBlock.width = "1000px";
        textBlock.height = "300px";
        textBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(textBlock);

        setTimeout(() => {
            advancedTexture.removeControl(textBlock);
            this.messageDisplayed = false;
        }, 2000);
    }

    triggerDeathScreen() {
        
        if (this.isInCutscene) return;
        this.isInCutscene = true;
    
       
        this.scene.detachControl();
    
        
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("deathScreenUI");
    
       
        advancedTexture.getChildren().forEach(c => advancedTexture.removeControl(c));
    
        
        const background = new BABYLON.GUI.Rectangle();
        background.width = "100%";
        background.height = "100%";
        background.background = "black";
        background.alpha = 1; 
        advancedTexture.addControl(background);
    
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.color = "white";
        textBlock.fontSize = 36;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        textBlock.text = ""; 
        advancedTexture.addControl(textBlock);
    
        
        const messages = [
            "Il fait très sombre ici, c'est étrange...",
            "??? : PARTEZ ! C'EST DANGEREUX !",
            "Hein ? HAAA ON M'ATTAQUE !",
            "Je... dois... fuir..."
        ];
    
        
        let currentMessageIndex = 0;
    
        const showNextMessage = () => {
            if (currentMessageIndex < messages.length) {
                
                textBlock.text = messages[currentMessageIndex];
                console.log("Affichage du message :", messages[currentMessageIndex]);
                currentMessageIndex++;
    
                
                setTimeout(showNextMessage, 3000);
            } else {
                
                console.log("Tous les messages ont été affichés.");
                
                this.returnToGame(advancedTexture, background, textBlock);
            }
        };
    
        
        showNextMessage();
    }
    
    returnToGame(advancedTexture, background, textBlock) {
        
        background.alpha = 1; 
        textBlock.text = ""; 
    
        
        const fadeOutInterval = setInterval(() => {
            background.alpha -= 0.02; 
            if (background.alpha <= 0) {
                clearInterval(fadeOutInterval); 
                advancedTexture.removeControl(background); 
                advancedTexture.removeControl(textBlock);
                this.scene.attachControl(); 
                this.isInCutscene = false; 
                this.cinematicFinished = true; 
    
                
                if (this.opening) {
                    console.log("Suppression de la porte 'opening'...");

                    this.opening.isVisible = false; 
                    this.opening.setEnabled(false); 
                    
                   
                    const openingInstances = this.scene.meshes.filter(mesh => mesh.name === "opening");
                    if (openingInstances.length > 0) {
                        openingInstances.forEach(instance => {
                            console.log("Suppression de l'instance :", instance);
                            instance.dispose();
                        });
                        console.log("Toutes les instances de 'opening' ont été supprimées.");
                    }
    
                    
                    this.scene.removeMesh(this.opening); 
                    this.opening.dispose(); 
                    this.opening = null; 
                    
                    console.log("La porte 'opening' a été supprimée.");
                } else {
                    console.log("La porte 'opening' n'existe pas ou a déjà été supprimée.");
                }
    
               
    
                
                this.showLanternMessage("Je t'avais prévenu ! Allez, viens me chercher, je vais t'aider à sortir d'ici !");
            }
        }, 50); 
    }

    async goToNextScene() {
        try {
            console.log("Passage à la scène 2...");
    
            
            this.engine.stopRenderLoop();
    
            
            this.scene.onBeforeRenderObservable.clear();
    
            
            const { Scene2 } = await import('./scene2.js');
            const scene2 = new Scene2(this.engine, this.canvas);
            await scene2.initScene();
    
            
            this.scene.dispose();
    
            
            this.engine.runRenderLoop(() => {
                if (scene2.scene) {
                    scene2.scene.render();
                }
            });
    
        } catch (error) {
            console.error("Erreur lors du passage à la scène 2 :", error);
        }
    }

    messageIntro() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
      

        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = ""; 
        textBlock.color = "white";
        textBlock.fontSize = 24;
        textBlock.height = "100px";

       
        textBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        textBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        
        textBlock.paddingBottom = "20px";

       
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        advancedTexture.addControl(textBlock);
       

        const messages = [
            "Bienvenue dans le monde des rêves...",
            "Explore chaque salle pour découvrir ses secrets.",
            "Bonne chance, aventurier !"
        ];

        let index = 0;

        
        textBlock.text = messages[index];

        
        const intervalId = setInterval(() => {
            index++;
            if (index >= messages.length) {
                clearInterval(intervalId); 
                textBlock.text = ""; 
                return;
               

            }
            textBlock.text = messages[index];
        }, 3000);
    }
    
    
}  