// Zombie.js
import * as THREE from "three";
import {
  ZOMBIE_MOVE_RADIUS,
  INITIAL_PLAYER_HEALTH,
} from "../core/constants.js";
import { createZombieModel } from "./model.js"; // modular blocky body
import { getNextStep } from "./pathfinding.js";
// Zombie.js

export let playerHealth = INITIAL_PLAYER_HEALTH;

export class Zombie {
  constructor(
    group,
    position,
    playerPosition,
    scene,
    baseZombieModel,
    speed = 4,
    health = 100
  ) {
    this.id = null;
    this.speed = speed;
    this.health = health;
    this.playerPosition = playerPosition;
    this.targetTile = null;
    this.targetDirection = null;
    //this.health = health;
    this.scene = scene;
    this.group = group;
    this.attackTimer = 0;
    this.model = baseZombieModel.clone(true);

    this.scene.add(this.model);
    this.model.traverse((child) => {
      if (child.name === "head") {
        child.userData.zombie = this; // 👈 attach the parent Zombie
        child.userData.part = "head";
      } else if (child.isMesh) {
        child.userData.zombie = this; // attach to other parts too if you want body hits
        child.userData.part = "body";
      }
    });

    this.model.position.x = position.x;
    this.model.position.z = position.z;
    this.legAngle = 0;
    this.position = this.model.position;
    this.pathidx = 0;
    this.angle = 0;
    this.currTile = this.getTile();
    this._recalcCooldown = 0;
    this.walkTime = 0;
  }

  getTile() {
    return { x: Math.floor(this.position.x), y: Math.floor(this.position.z) };
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
    if (!this.isInPlayerRadius(ZOMBIE_MOVE_RADIUS)) {
      this.visible = false;
      return;
    } else {
      this.visible = true;
    }
    if (
      !updatePath &&
      this.isInPlayerRadius(ZOMBIE_MOVE_RADIUS) &&
      !this.isInPlayerRadius(2)
    )
      this._recalcCooldown -= dt;
    if (
      updatePath &&
      this.isInPlayerRadius(ZOMBIE_MOVE_RADIUS) &&
      this._recalcCooldown <= 0
    ) {
      this.path = this.ZgetNextStep();
      this.pathidx = 0;
      this._recalcCooldown = 0.2;
      if (this.path && this.path[this.pathidx]) {
        this.targetTile = {
          x: this.path[this.pathidx].x + 0.5,
          y: this.path[this.pathidx].y + 0.5,
        };
      }
    }

    if (this.targetTile && this.path && this.path[0]) {
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
      this.animateAttack(dt, this.isInPlayerRadius(2));
      if (!this.isInPlayerRadius(2)) {
        this.animateWalk(dt);
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
            y: this.path[this.pathidx].y + 0.5,
          };
        } else {
          dir.normalize();
          this.position.addScaledVector(dir, this.speed * dt);
        }
      }
      if (
        !(
          Math.abs((Math.PI / 6) * Math.sin(this.legAngle * Math.PI * 2 * 1)) <
          0.1
        )
      ) {
        this.animateWalk(dt);
      }
    }
  }

  animateWalk(dt) {
    // 1) Accumulate elapsed time
    this.legAngle += dt;

    // 2) Max swing angle = 30° in radians
    const maxAngle = Math.PI / 6;

    // 3) Pick a speed (cycles per second).
    //    Higher → faster leg swinging.
    const frequency = 1; // e.g. 4 cycles/sec

    // 4) Compute a sinusoidal angle in [–30°, +30°]
    const angle = maxAngle * Math.sin(this.legAngle * Math.PI * 2 * frequency);

    // // 5) Apply to child 4 and child 5 in opposite phase
    this.model.children[4].rotation.x = angle;
    this.model.children[5].rotation.x = -angle;
  }

  // In your constructor, add something like:
  //   this.attackTimer = 0;
  //   this.damagePerHit = 10;
  //   this.player = playerObject; // or however you store a reference to the player

  animateAttack(dt, inRange) {
    const cyclePeriod = 0.6;
    const riseFrac = 0.7;
    const fallFrac = 1 - riseFrac;
    const maxArmAngle = Math.PI / 3;

    if (inRange) {
      // ── 1) Advance the timer only when in range ────────────────────
      const oldTimer = this.attackTimer;
      this.attackTimer += dt;

      // ── 2) Wrap‐around check for dealing damage ────────────────────
      const oldPhase = oldTimer % cyclePeriod;
      const newPhase = this.attackTimer % cyclePeriod;
      if (oldPhase > newPhase) {
        console.log("damage");
        removePlayerHealth(10);
      }

      // ── 3) Compute armAngle (“slow up, fast down”) ─────────────────
      const t = newPhase;
      const riseTime = riseFrac * cyclePeriod;
      const fallTime = fallFrac * cyclePeriod;

      let armAngle;
      if (t < riseTime) {
        armAngle = maxArmAngle * (t / riseTime);
      } else {
        const tFall = t - riseTime;
        armAngle = maxArmAngle * (1 - tFall / fallTime);
      }

      // ── 4) Apply rotation to arms (children[2] & [3]) ────────────
      //     (adjust offset so “down” is resting position)
      this.model.children[2].rotation.x = -armAngle - Math.PI / 2;
      this.model.children[3].rotation.x = -armAngle - Math.PI / 2;
    } else {
      // Player is out of range → reset arms & timer
      this.attackTimer = 0;
      // Puts arms straight down (adjust if your “idle” pose is different)
      this.model.children[2].rotation.x = -Math.PI / 2;
      this.model.children[3].rotation.x = -Math.PI / 2;
    }
  }

  isInPlayerRadius(radius = 3) {
    const dx = this.position.x - this.playerPosition.x;
    const dy = this.position.z - this.playerPosition.z;
    return Math.hypot(dx, dy) < radius;
  }

  ZgetNextStep() {
    return getNextStep(
      { x: this.position.x, y: this.position.z },
      {
        x: Math.floor(this.playerPosition.x),
        y: Math.floor(this.playerPosition.z),
      },
      0.4,
      0.5
    );
  }

  resetState() {
    // Reset target tile, direction, animations, etc.
  }

  removeHealth(amt) {
    this.health -= amt;
    if (this.health <= 0) {
      this.remove();
    }
    return this.health;
  }
}

function removePlayerHealth(amt) {
  playerHealth -= amt;
  const healthElement = document.getElementById("health-bar");
  if (healthElement) healthElement.style.width = playerHealth + "%";
  console.log(playerHealth);
}
