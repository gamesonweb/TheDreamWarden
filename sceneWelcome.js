import { Scene1 } from './scene1.js';
import { Scene2 } from './scene2.js';
import { Scene3 } from './scene3.js';
 
export class SceneWelcome {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.scene = new BABYLON.Scene(engine);
        this.gameScene = null; 
 
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
 
       
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
 
       
        this.scene.clearColor = new BABYLON.Color3(1, 1, 1);
 
        
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
 
       
        const backgroundImage = new BABYLON.GUI.Image("background", "asset/FondAccueil.png");
        backgroundImage.width = "100%";
        backgroundImage.height = "100%";
        this.advancedTexture.addControl(backgroundImage);
        this.backgroundImage = backgroundImage; 
 
        
        this.playButton = BABYLON.GUI.Button.CreateSimpleButton("playButton", "Chargement...");
        this.playButton.width = "200px";
        this.playButton.height = "40px";
        this.playButton.color = "white";
        this.playButton.background = "#444"; 
        this.playButton.isEnabled = false; 
        this.playButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.playButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.playButton.top = "-80px";
        this.advancedTexture.addControl(this.playButton);
 
        
        this.commandsButton = BABYLON.GUI.Button.CreateSimpleButton("commandsButton", "Commandes");
        this.commandsButton.width = "200px";
        this.commandsButton.height = "40px";
        this.commandsButton.color = "white";
        this.commandsButton.background = "#333"; 
        this.commandsButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.commandsButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.commandsButton.top = "-30px";
        this.advancedTexture.addControl(this.commandsButton);
 
       
        this.commandsButton.onPointerClickObservable.add(() => {
            this.showCommands();
        });
 
        
        this.renderScene();
 
        
        setTimeout(() => this.loadGameScene(), 100); 
 
       
        this.playButton.onPointerClickObservable.add(() => {
            if (this.playButton.isEnabled) {
                this.startGame();
            }
        });
 
       
        window.addEventListener("keydown", (event) => {
            if (event.key === " " && this.playButton.isEnabled) {
                this.startGame();
            }
        });
    }
 
    async loadGameScene() {
        
        this.gameScene = new Scene1(this.engine, this.canvas);
        await this.gameScene.initScene();
 
        
        this.playButton.textBlock.text = "Jouer";
        this.playButton.background = "#001f3f"; 
        this.playButton.isEnabled = true;
    }
 
    showCommands() {
        // Masquer les boutons "Jouer" et "Commandes"
        this.playButton.isVisible = false;
        this.commandsButton.isVisible = false;
 
        // Remplacer l'image de fond par celle des commandes
        this.backgroundImage.source = "asset/FondAccueilCommandes.png";
 
      
        this.commandsTitle = new BABYLON.GUI.TextBlock();
        this.commandsTitle.text = "Commandes";
        this.commandsTitle.color = "white";
        this.commandsTitle.fontSize = 50;
        this.commandsTitle.top = "-40%";
        this.advancedTexture.addControl(this.commandsTitle);
 
        // Liste des commandes
        this.commandsText = new BABYLON.GUI.TextBlock();
        this.commandsText.text = "- Déplacement : ZQSD ou flèches\n\n- Tir : clic gauche\n\n - Sprint : touche maj";
        this.commandsText.color = "white";
        this.commandsText.fontSize = 20;
        this.commandsText.top = "-10%";
        this.advancedTexture.addControl(this.commandsText);
 
        // Ajouter un bouton "Retour"
        this.backButton = BABYLON.GUI.Button.CreateSimpleButton("backButton", "Retour");
        this.backButton.width = "200px";
        this.backButton.height = "40px";
        this.backButton.color = "white";
        this.backButton.background = "#444"; 
        this.backButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.backButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.backButton.top = "-30px";
        this.advancedTexture.addControl(this.backButton);
 
        // Ajouter un événement pour revenir à l'écran d'accueil
        this.backButton.onPointerClickObservable.add(() => {
            this.hideCommands();
        });
    }
 
    hideCommands() {
        
        this.commandsTitle.dispose();
        this.commandsText.dispose();
        this.backButton.dispose();
 
        
        this.playButton.isVisible = true; 
        this.commandsButton.isVisible = true;
 
        
        this.backgroundImage.source = "asset/FondAccueil.png";
    }
 
    startGame() {
    
        this.engine.stopRenderLoop();
        this.gameScene.renderScene();
        this.messageIntro();
    }
 
    renderScene() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
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
            "??? : Hé toi !",
            "Hein qui me parle ? Et où suis-je ?",
            "??? : Bah moi, qui ça peut être d'autre ici ?",
            "Excusez-moi mais je ne vous vois pas...",
            "??? C'est censé être ça notre sauveur ? Et bah...",
            "??? : Je suis sur la table, bloquée dans cette cage. ",
            "Vous êtes une lanterne ? Qui me parle ???",
            "Lanterne : Et oui mon coco, on est dans le monde des rêves, tout est possible !",
            "Lanterne : Enfin plus pour longtemps... ",
            "Lanterne : Les cauchemars sont de retour",
            "Lanterne : Ils nous volent l'énergie des rêves des enfants ",
            "Lanterne : Et sans cela, ce monde va s'éteindre...",
            "Alors c'est horrible, mais j'ai rien à voir avec tout ça.",
            "Lanterne : Super, il est investi notre prochain DreamWarden...",
            "DreamWarden ??? Pardon ?",
            "Lanterne : Surpriiise, tu es le dernier descendant de la lignée des DreamWardens !",
            "Lanterne : Tu es le seul à pouvoir nous sauver !", 
            "Lanterne : Mais pour ça, viens m'aider à sortir de cette cage !",
            "Et pourquoi je ferais ça ?",
            "Lanterne : Tu veux rentrer chez toi ? Alors viens.",
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