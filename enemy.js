import { SceneBase } from './scenebase.js';
import { Personnage } from './personnage.js';
import { Scene2 } from './scene2.js'; 

export class Scene1 extends SceneBase {
    constructor(engine, canvas) {
        super(engine, canvas);
        this.initScene();
    }

    async initScene() {
        super.initScene();

    }
}

export class Enemy {
    constructor(scene, personnage, position = new BABYLON.Vector3(10, 1, 0), size = 2, health = 3) {
        this.scene = scene;
        this.personnage = personnage; 
        this.position = position;
        this.size = size;
        this.health = health;
        this.enemy = null;
        this.hitbox = null;

        // Charger le modèle cauchemar.glb
        BABYLON.SceneLoader.ImportMesh("", "asset/", "cauchemar.glb", this.scene, (meshes) => {
            if (meshes.length > 0) {
                
                this.enemy = new BABYLON.TransformNode("enemyParent", this.scene);

               
                meshes.forEach(mesh => {
                    mesh.parent = this.enemy;
                });

                // Position initiale et échelle
                this.enemy.position = this.position.clone();
                this.enemy.scaling = new BABYLON.Vector3(1, 1, 1);

                // Créer une hitbox invisible
                this.hitbox = BABYLON.MeshBuilder.CreateBox("enemyHitbox", {
                    width: 1.5, height: 2.5, depth: 1.5 
                }, this.scene);
                this.hitbox.parent = this.enemy;
                this.hitbox.position = new BABYLON.Vector3(0, 1.5, 0); 
                this.hitbox.isVisible = false; 
                this.hitbox.checkCollisions = false; 

                console.log("Modèle cauchemar chargé et hitbox attachée.");
            } else {
                console.error("Erreur : Aucun mesh trouvé dans cauchemar.glb.");
            }
        });

        
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    update() {
        if (!this.enemy || this.health <= 0) return; 

        this.checkCollisions();
        this.moveTowardPlayer();

        // Vérifier si l'ennemi est proche du personnage
        if (this.personnage && this.personnage.mesh && this.hitbox && this.hitbox.intersectsMesh(this.personnage.mesh, false)) {
            console.log("L'ennemi est proche du personnage !");
        
        }
    }

    checkCollisions() {
        if (!this.hitbox) return; 

        this.scene.meshes.forEach(mesh => {
            if (mesh.name.startsWith("fireball")) {
                if (mesh.intersectsMesh(this.hitbox, false)) {
                    console.log("Collision détectée !");
                    this.health -= 1;
                    console.log(`Ennemi touché ! Santé restante : ${this.health}`);
                    mesh.dispose();

                    if (this.health <= 0) {
                        this.destroy();
                    }
                }
            }
        });
    }

    moveTowardPlayer() {
        if (!this.enemy || !this.personnage || this.health <= 0) return;

        const target = this.personnage.mesh?.position;
        if (!target) return;

        const direction = target.subtract(this.enemy.position);
        const distance = direction.length(); // Calculer la distance entre l'ennemi et le personnage

        const minDistance = 2; // Distance minimale entre l'ennemi et le personnage
        if (distance > minDistance) {
            direction.normalize();
            const speed = 0.02; // Vitesse de déplacement de l'ennemi
            this.enemy.position.addInPlace(direction.scale(speed));
        } else {
            console.log("L'ennemi est trop proche du personnage, il s'arrête.");
        }
    }

    destroy() {
        console.log("Ennemi détruit !");
        if (this.enemy) {
            this.enemy.dispose();
            this.enemy = null;
        }
        if (this.hitbox) {
            this.hitbox.dispose();
            this.hitbox = null;
        }
    
       
        this.scene.onBeforeRenderObservable.removeCallback(this.update);
    
      
    }

    update() {
        if (!this.enemy || this.health <= 0) return; 
    
        this.checkCollisions();
        this.moveTowardPlayer();
    
        // Vérifier si l'ennemi est proche du personnage
        if (this.personnage && this.personnage.mesh && this.hitbox && this.hitbox.intersectsMesh(this.personnage.mesh, false)) {
            console.log("L'ennemi est proche du personnage !");
            this.attackPlayer(); // Démarrer l'attaque
        }
    
    }
    
    attackPlayer() {
        if (!this.personnage || this.personnage.isDead) return;
    
        const damage = 10; // Dégâts infligés par l'ennemi
        console.log(`L'ennemi inflige ${damage} dégâts au joueur.`);
        this.personnage.takeDamage(damage);
    }


    
  
    
}
