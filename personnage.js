// personnage.js

export class Personnage {
    constructor(scene, position = new BABYLON.Vector3(0, 1, 0)) {
        this.scene = scene;
        this.position = position;
        this.animations = {};
        this.isRunning = false;
        this.isSprinting = false;
        this.canCastSpell = true;
        this.spellCooldown = 700;
        this.health = 100;
        this.isDead = false;
        

        BABYLON.SceneLoader.ImportMesh("", "asset/", "AnimPerso2.glb", this.scene, (meshes, _, __, animationGroups) => {
            if (meshes.length > 0) {
                this.mesh = meshes[0];
                this.mesh.position = this.position;
                this.mesh.checkCollisions = true;
                console.log("Personnage chargé avec succès");

                this.animations[0] = animationGroups[0]; // Idle
                this.animations[1] = animationGroups[1]; // Running
                this.animations[2] = animationGroups[2]; // Walking

                Object.values(this.animations).forEach(anim => anim.stop());
                this.playAnimation(0);
                this.enableMovement();
                this.enableFireballShooting();
            } else {
                console.error("Erreur : Aucun maillage trouvé dans le modèle.");
            }
        }, null, (scene, message, exception) => {
            console.error("Erreur lors du chargement du modèle :", message, exception);
        });

        this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), false);
    }

    playAnimation(index) {
        Object.values(this.animations).forEach(anim => anim.stop());
        if (this.animations[index]) {
            this.animations[index].start(true);
        } else {
            console.error(`Animation ${index} non trouvée.`);
        }
    }

    enableMovement() {
        const speedWalking = 0.07;
        const speedRunning = 0.16;
        const keysPressed = {};
        let isShiftPressed = false;

        

        window.addEventListener("keydown", (event) => {
            keysPressed[event.key] = true;
            if (event.key === "Shift") isShiftPressed = true;
        });

        window.addEventListener("keyup", (event) => {
            keysPressed[event.key] = false;
            if (event.key === "Shift") isShiftPressed = false;
        });

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.health <= 0 && !this.isDead) this.die();
        });

        this.scene.onBeforeRenderObservable.add(() => {
            let moveDirection = BABYLON.Vector3.Zero();
            let angle = null;

            const z = keysPressed["z"] || keysPressed["ArrowUp"];
            const s = keysPressed["s"] || keysPressed["ArrowDown"];
            const q = keysPressed["q"] || keysPressed["ArrowLeft"];
            const d = keysPressed["d"] || keysPressed["ArrowRight"];

            if (z && d) {
                moveDirection = new BABYLON.Vector3(1, 0, 1);
                angle = -(3 * Math.PI) / 4;
            } else if (z && q) {
                moveDirection = new BABYLON.Vector3(-1, 0, 1);
                angle = (3 * Math.PI) / 4;
            } else if (s && q) {
                moveDirection = new BABYLON.Vector3(-1, 0, -1);
                angle = Math.PI / 4;
            } else if (s && d) {
                moveDirection = new BABYLON.Vector3(1, 0, -1);
                angle = -Math.PI / 4;
            } else if (z) {
                moveDirection = new BABYLON.Vector3(0, 0, 1);
                angle = Math.PI;
            } else if (s) {
                moveDirection = new BABYLON.Vector3(0, 0, -1);
                angle = 0;
            } else if (q) {
                moveDirection = new BABYLON.Vector3(-1, 0, 0);
                angle = Math.PI / 2;
            } else if (d) {
                moveDirection = new BABYLON.Vector3(1, 0, 0);
                angle = -Math.PI / 2;
            }

            if (!moveDirection.equals(BABYLON.Vector3.Zero()) && this.mesh) {
                moveDirection = moveDirection.normalize().scale(isShiftPressed ? speedRunning : speedWalking);
                this.mesh.moveWithCollisions(moveDirection);

                if (angle !== null) {
                    this.mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(angle, 0, 0);
                }

                if (isShiftPressed && !this.isSprinting) {
                    this.playAnimation(1);
                    this.isSprinting = true;
                    this.isRunning = false;
                } else if (!isShiftPressed && !this.isRunning) {
                    this.playAnimation(2);
                    this.isRunning = true;
                    this.isSprinting = false;
                }
            } else if (this.isRunning || this.isSprinting) {
                this.playAnimation(0);
                this.isRunning = false;
                this.isSprinting = false;
            }

            this.updateCamera();
        });
    }

    updateCamera() {
        const cameraOffset = new BABYLON.Vector3(0, 10, -10);
        this.scene.activeCamera.position = this.mesh.position.add(cameraOffset);
        this.scene.activeCamera.setTarget(this.mesh.position);
    }

    enableFireballShooting() {
        this.scene.onPointerDown = (evt) => {
            if (evt.button === 0) this.castFireball();
        };
    }

    castFireball() {
        if (!this.canCastSpell) return;

        const fireball = BABYLON.MeshBuilder.CreateSphere("fireball", { diameter: 0.5 }, this.scene);
        fireball.position = this.mesh.position.clone().add(new BABYLON.Vector3(0, 1, 0));

        const material = new BABYLON.StandardMaterial("fireballMaterial", this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        fireball.material = material;

       
const pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => mesh.name === "targetPlane");

let target;
if (pickInfo.hit && pickInfo.pickedPoint) {
    target = pickInfo.pickedPoint;
} else {
   
    const forwardRay = this.scene.activeCamera.getForwardRay();
    target = forwardRay.origin.add(forwardRay.direction.scale(20));
}

        const direction = target.subtract(fireball.position).normalize();

        const speed = 0.5;
        const maxDistance = 20;
        let distance = 0;

        const observer = this.scene.onBeforeRenderObservable.add(() => {
            const delta = direction.scale(speed);
            fireball.position.addInPlace(delta);
            distance += delta.length();

            this.scene.meshes.forEach(mesh => {
                if (mesh.name.startsWith("enemy") && fireball.intersectsMesh(mesh, false)) {
                    this.explodeFireball(fireball);
                    this.scene.onBeforeRenderObservable.remove(observer);
                }
            });

            if (distance >= maxDistance) {
                fireball.dispose();
                this.scene.onBeforeRenderObservable.remove(observer);
            }
        });

        this.canCastSpell = false;
        setTimeout(() => {
            this.canCastSpell = true;
        }, this.spellCooldown);
    }

    explodeFireball(fireball) {
        fireball.dispose();
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        console.log(`Le joueur perd ${amount} PV – reste ${this.health}`);
        if (this.health <= 0) this.die();
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        console.log("Le joueur est mort ! Relance de la scène...");
        this.restartScene();
    }

    restartScene() {
        if (!this.scene || !this.scene.getEngine()) {
            console.error("Erreur : La scène ou l'engine est introuvable.");
            return;
        }

        import('./scene2.js').then(({ Scene2 }) => {
            const newScene = new Scene2(this.scene.getEngine(), this.scene.getEngine().getRenderingCanvas());
            newScene.initScene();
        }).catch(error => {
            console.error("Erreur lors du chargement de la scène 2 :", error);
        });
    }
}
