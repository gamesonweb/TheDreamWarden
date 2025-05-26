export class lampion {
    constructor(scene, personnage, position = new BABYLON.Vector3(10, 1, 0), size = 2, allumee) {
        this.scene = scene;
        this.personnage = personnage;
        this.position = position;
        this.size = size;
        this.allume = false;
        this.enemy = null;
        this.hitbox = null;
        this.halo = null; 
        this.emissiveMatOff = null; 
        this.emissiveMatOn = null; 
 
        
        this.emissiveMatOff = new BABYLON.StandardMaterial("lampionEmissiveOff", this.scene);
        this.emissiveMatOff.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1.0); // bleu clair
 
        
        this.emissiveMatOn = new BABYLON.StandardMaterial("lampionEmissiveOn", this.scene);
        this.emissiveMatOn.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.0); // orange
 
        // Charger le modèle
        BABYLON.SceneLoader.ImportMesh("", "asset/", "lampion.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                this.enemy = new BABYLON.TransformNode("enemyParent", this.scene);
                meshes.forEach(mesh => {
                    mesh.parent = this.enemy;
            
                    mesh.material = this.emissiveMatOff;
                });
 
                this.enemy.position = this.position.clone();
                this.enemy.scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);
 
                // Créer la hitbox
                this.hitbox = BABYLON.MeshBuilder.CreateBox("enemyHitbox", {
                    width: 2, height: 3, depth: 2
                }, this.scene);
                this.hitbox.parent = this.enemy;
                this.hitbox.position = new BABYLON.Vector3(0, 1.5, 0);
                this.hitbox.isVisible = false;
                this.hitbox.checkCollisions = true;
 
                //  Créer la lumière orange mais éteinte au départ
                this.halo = new BABYLON.PointLight("haloLight", this.enemy.position, this.scene);
                this.halo.diffuse = new BABYLON.Color3(1.0, 0.5, 0.0); // orange
                this.halo.intensity = 0; // éteint
                this.halo.range = 10;
 
                // Assurer que la lumière suive la position du lampion
                this.scene.onBeforeRenderObservable.add(() => {
                    if (this.enemy && this.halo) {
                        this.halo.position.copyFrom(this.enemy.getAbsolutePosition());
                    }
                });
 
                console.log("Modèle lampion chargé et halo créé.");
            } else {
                console.error("Erreur : Aucun mesh trouvé dans lanterne.glb.");
            }
        });
 
        // Boucle d'update
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }
 
    update() {
        this.checkCollisions();
    }
 
    checkCollisions() {
    if (!this.hitbox || this.allume) return;
 
    this.scene.meshes.forEach(mesh => {
        if (mesh.name.startsWith("fireball") && mesh.intersectsMesh(this.hitbox, false)) {
            console.log("Collision détectée !");
            this.allumer(); 
            mesh.dispose();
        }
    });
}
 
allumer() {
    if (!this.allume) {
        this.allume = true;
 
        // Allumer le halo orange
        if (this.halo) {
            this.halo.intensity = 2;
        }
 
        // Ajouter effet lumineux sur le mesh
        const emissiveMat = new BABYLON.StandardMaterial("lampionEmissive", this.scene);
        emissiveMat.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.0);
        if (this.enemy) {
            this.enemy.getChildMeshes().forEach(m => {
                m.material = emissiveMat;
            });
        }
 
       
        if (this.onAllume) this.onAllume();
    }
}
}
 