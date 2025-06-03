// Zombie.js
import * as THREE from "three";
import { PLAYER_RADIUS } from "../core/constants.js";
import { createZombieModel } from "./model.js"; // modular blocky body
import { getNextStep } from "./pathfinding.js";
// Zombie.js


export class Zombie {
  constructor(group, position, /*health,*/ playerPosition, scene, speed = 1) {
    this.id = null;
    this.speed = speed;
    this.playerPosition = playerPosition;
    this.targetTile = null;
    this.targetDirection = null;
    //this.health = health;
    this.scene = scene;
    this.group = group;
    
    this.model = createZombieModel(); // External function call to create 3D model
    
    this.scene.add(this.model);
    
    this.model.position.x = position.x;
    this.model.position.z = position.z;
    
    this.position = this.model.position;
    this.pathidx = 0;
    this.angle = 0;
    this.currTile = this.getTile();
    this._recalcCooldown = 0;
  }

  getTile(){
    return {x: Math.floor(this.position.x), y: Math.floor(this.position.z)};
  }
  remove() {
    this.scene.remove(this.model);
  }

  // animate(updatePath) {
  //   //Move zombie one step toward target
  //   if (updatePath && this.isInPlayerRadius(20)) {
  //     //console.log(this.targetTile);
  //     this.path = this.ZgetNextStep();
  //     this.pathidx = 0;
  //     if (this.path[this.pathidx]) {
  //       this.targetTile = {x: this.path[this.pathidx].x + 0.5, y: this.path[this.pathidx].y + 0.5};
  //     }
  //   }
    
  //   //this.targetTile = {x: Math.floor(this.playerPosition.x), y: Math.floor(this.playerPosition.z)};
  //   if (this.targetTile && !this.isInPlayerRadius(2)) { //!this.isInPlayerRadius() && this.targetTile && (this.getTile != this.targetTile)
      
  //     // 1) compute raw direction from player to targetTile (in XZ-plane)
  //     const dir = new THREE.Vector3(
  //       this.targetTile.x - this.position.x,
  //       0,
  //       this.targetTile.y - this.position.z
  //     );
  //       if (dir.length() < this.speed) {
  //         this.position.x = this.path[this.pathidx].x + 0.5;
  //         this.position.z = this.path[this.pathidx].y + 0.5;
  //         this.pathidx++;
  //         this.targetTile = {x: this.path[this.pathidx].x + 0.5, y: this.path[this.pathidx].y + 0.5};
          
  //       } else {
  //               // 2) normalize to length=1
  //     dir.normalize();
    
  //     // 3) scale by speed and add to position
  //     //    (addScaledVector is shorthand for dir.multiplyScalar(speed) then position.add)
  //     this.position.addScaledVector(dir, this.speed);
  //       }

  //   }
    
  // }
  animate(elapsed, dt, updatePath) {
    if (!updatePath && this.isInPlayerRadius(20) && !this.isInPlayerRadius(2)) this._recalcCooldown -= dt;
    if (updatePath && this.isInPlayerRadius(20) && this._recalcCooldown <= 0 ) {
      
      this.path = this.ZgetNextStep();
      this.pathidx = 0;
      this._recalcCooldown = 0.2;
      if (this.path[this.pathidx]) {
        this.targetTile = {
          x: this.path[this.pathidx].x + 0.5,
          y: this.path[this.pathidx].y + 0.5
        };
      }
    }
  
    if (this.targetTile  && this.path[0]) {
      const dir = new THREE.Vector3(
        this.targetTile.x - this.position.x,
        0,
        this.targetTile.y - this.position.z
      );
  
      // Compute desired yaw from direction vector:
      const desiredYaw = Math.atan2(dir.x, dir.z);
      let currentYaw = this.model.rotation.y;
  
      // Compute signed delta ∈ [−π, +π]:
      let delta = desiredYaw - currentYaw;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        
      // SMALL‐ANGLE THRESHOLD:
      const angleEpsilon = 0.5; // ≈1.1°: adjust as needed
  
      if (Math.abs(delta) > 0.2) {
        // Only smoothly rotate if |delta| > ε
        const maxTurnSpeed = 0.2; // radians/frame
        const turnAngle =
          Math.abs(delta) > maxTurnSpeed
            ? Math.sign(delta) * maxTurnSpeed
            : delta;
        currentYaw += turnAngle;
        this.model.rotation.y = currentYaw;
      } else {
        // If already within ε, snap exactly to desiredYaw and stop turning
        this.model.rotation.y = desiredYaw;
      }
      if(!this.isInPlayerRadius(2)) {
        // Now move forward (same as before)
        if (dir.length() < this.speed * dt) {
          // Snap to the tile, advance path index
          this.position.x = this.path[this.pathidx].x + 0.5;
          this.position.z = this.path[this.pathidx].y + 0.5;
          this.pathidx++;
          if (!this.path[this.pathidx]) {
            this.pathidx--;
            return;
          }
          this.targetTile = {
            x: this.path[this.pathidx].x + 0.5,
            y: this.path[this.pathidx].y + 0.5
          };
        } else {
          dir.normalize();
          this.position.addScaledVector(dir, this.speed*dt);
        }
      }
    }
  }

  
  animateWalk() {
    // Animate walking cycle
  }

  animateAttack() {
    // Animate attack cycle
  }

  isInPlayerRadius(radius = 3) {
    const dx = this.position.x - this.playerPosition.x;
    const dy = this.position.z - this.playerPosition.z;
    return Math.hypot(dx, dy) < radius;
  }
  

  ZgetNextStep() {
    return getNextStep({x: this.position.x, y: this.position.z}, {x: Math.floor(this.playerPosition.x), y: Math.floor(this.playerPosition.z)}, 0.4, 0.5);
  }

  resetState() {
    // Reset target tile, direction, animations, etc.
  }
}
