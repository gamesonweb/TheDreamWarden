export class Lanterne {
    constructor(scene, position = new BABYLON.Vector3(0, 1, 0)) {
        this.scene = scene;
        this.position = position;
        this.isCollected = false; 
        this.currentDialogueIndex = 0; 
        this.isEquipped = false; 

        
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Créer la lanterne
        this.mesh = BABYLON.MeshBuilder.CreateBox("lantern", { size: 1 }, this.scene);
        this.mesh.position = this.position;
        const lanternMaterial = new BABYLON.StandardMaterial("lanternMaterial", this.scene);
        lanternMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1); // Couleur bleue
        this.mesh.material = lanternMaterial;

        // Ajouter une lumière à la lanterne
        this.light = new BABYLON.PointLight("lanternLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        this.light.parent = this.mesh;
        this.light.intensity = 2;
        this.light.range = 10;
        this.light.diffuse = new BABYLON.Color3(1, 0.9, 0.7);

        // Ajouter une action pour détecter les clics
        this.mesh.actionManager = new BABYLON.ActionManager(this.scene);
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => this.startDialogue()
        ));
    }

    // Méthode pour afficher un dialogue
    startDialogue() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            this.speak(this.dialogues[this.currentDialogueIndex]);
            this.currentDialogueIndex++;
        } else {
            this.speak("Appuyez sur F pour équiper");
        }
    }

    // Méthode pour afficher un texte à l'écran
    speak(text) {
        const dialogueBox = new BABYLON.GUI.TextBlock();
        dialogueBox.text = text;
        dialogueBox.color = "white";
        dialogueBox.fontSize = 20;
        dialogueBox.background = "black";
        dialogueBox.width = "300px";
        dialogueBox.height = "50px";
        dialogueBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        dialogueBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        dialogueBox.top = "-150px";

      
        this.advancedTexture.addControl(dialogueBox);

       
        setTimeout(() => {
            this.advancedTexture.removeControl(dialogueBox);
        }, 3000);
    }

    // Méthode pour équiper la lanterne
    equipLantern(personnage) {
        if (this.isEquipped) return;

     
        this.mesh.parent = personnage.mesh;
        this.mesh.position = new BABYLON.Vector3(0.5, 1, 0); 
        this.mesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5); 

       
        this.light.parent = this.mesh;

       
        this.isEquipped = true;

        
    }
}


