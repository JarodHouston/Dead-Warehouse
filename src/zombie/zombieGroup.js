import * as THREE from "three";
import { Zombie } from "./zombie";

export class ZombieGroup {
  constructor(
    numZombies,
    wallMatrix,
    playerPosition,
    scene,
    radius = 0.5,
    baseZombieModel
  ) {
    this.scene = scene;
    this.wallMatrix = wallMatrix;
    this.playerPosition = playerPosition;
    this.radius = radius;
    this.zombies = [];
    this.baseZombieModel = baseZombieModel;
    this.active = true;
    this.playerTile = {
      x: Math.floor(this.playerPosition.x),
      y: Math.floor(this.playerPosition.z),
    };
    this.attackRate = 1;
    for (let i = 0; i < numZombies; i++) {
      this.spawnZombie();
    }
  }

  /** Pause / un-pause the whole horde and hide or show them. */
  setActive(flag) {
    this.active = flag;
    this.zombies.forEach((z) => {
      // each Zombie exposes its root object3D – adjust if your class differs
      z.object.visible = flag;
    });
  }

  animate(elapsed, dt) {
    if (!this.active) return;
    // const damage = 0;
    const tileChange = this.updatePlayerTile();
    // const cell = wallMatrix[this.playerTile.y]?.[this.playerTile.x];
    // if(tileChange && cell != undefined) console.log(wallMatrix[this.playerTile.x][this.playerTile.y]);

    this.zombies.forEach((z) => {
      z.animate(
        elapsed,
        dt,
        tileChange && !this.isWall(this.playerTile.x, this.playerTile.y)
      );
      // if (Math.round((z.attackTime % this.attackRate) * 10)/10 == Math.round((elapsed % this.attackRate))) damage++;
    });
    // return damage;
  }
  updatePlayerTile() {
    const ret =
      Math.floor(this.playerPosition.x) != this.playerTile.x ||
      Math.floor(this.playerPosition.z) != this.playerTile.y;
    this.playerTile.x = Math.floor(this.playerPosition.x);
    this.playerTile.y = Math.floor(this.playerPosition.z);
    return ret;
  }
  isTooCloseToPlayer(x, y) {
    const dx = x - this.playerPosition.x;
    const dy = y - this.playerPosition.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }

  isWall(x, y) {
    return this.wallMatrix[y]?.[x] != 0;
  }

  isOccupied(x, y) {
    return this.zombies.some((z) => z.getTile().x === x && z.getTile().y === y);
  }

  _getRandomValidPosition() {
    const maxY = this.wallMatrix.length;
    const maxX = this.wallMatrix[0].length;
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);

      if (
        !this.isWall(x, y) &&
        !this.isOccupied(x, y) &&
        !this.isTooCloseToPlayer(x, y)
      ) {
        return { x, y };
      }
    }

    console.warn("Failed to find valid position after 100 attempts.");
    return null;
  }

  spawnZombie() {
    console.log("Spawning a zombie...");
    const pos = this._getRandomValidPosition();

    if (pos) {
      const x = this._createZombieAt(pos, this.baseZombieModel);

      this.zombies.push(x);
    }
  }

  _createZombieAt(position, baseZombieModel) {
    const pen = new THREE.Vector3(position.x, 0, position.y);
    //const pen = new THREE.Vector3(20, 0, 20);
    return new Zombie(
      this,
      pen,
      this.playerPosition,
      this.scene,
      this.baseZombieModel
    ); // Replace with actual zombie instance creation
  }
}
