import * as THREE from "three";

/* Creating Invisible Wall Mesh for Shelves for Collision */
export const shelfMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0, // fully transparent
  depthWrite: false,
});

export function createShelfTile(size = 1, height = 15, orientation = "up") {
  let shelfGeometry = null;
  if (orientation === "vertical") {
    shelfGeometry = new THREE.BoxGeometry(size, height, size * 9);
  } else {
    shelfGeometry = new THREE.BoxGeometry(9 * size, height, size);
  }
  const shelfWall = new THREE.Mesh(shelfGeometry, shelfMaterial);
  return shelfWall;
}

export function createBoxTile(size = 1, height = 15, orientation = "up") {
  let myBoxGeometry = null;
  if (orientation === "vertical") {
    myBoxGeometry = new THREE.BoxGeometry(size, height, size * 5);
  } else {
    myBoxGeometry = new THREE.BoxGeometry(size * 5, height, size);
  }
  const boxWall = new THREE.Mesh(myBoxGeometry, shelfMaterial);
  return boxWall;
}
