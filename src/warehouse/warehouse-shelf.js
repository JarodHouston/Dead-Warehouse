import * as THREE from "three";

/* Creating Invisible Wall Mesh for Shelves for Collision */
const shelfMaterial = new THREE.MeshBasicMaterial({
  // any color is fine; it will be invisible
  color: 0xffffff,          
  transparent: true,        // allow alpha < 1.0
  opacity: 0,               // fully transparent
  depthWrite: false         // don't write invisible pixels to depth
});

// Invisible Mesh added for collision
export function createShelfTile(size = 1, height = 15){
    const shelfGeometry = new THREE.BoxGeometry(size, height, size);
    const shelfWall = new THREE.Mesh(shelfGeometry, shelfMaterial);
    return shelfWall;
}