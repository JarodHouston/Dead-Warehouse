import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

const colorMap = textureLoader.load(
  "textures/brick/Bricks082A_2K-JPG_Color.jpg"
);
const normalMap = textureLoader.load(
  "textures/brick/Bricks082A_2K-JPG_Color_NormalGL.jpg"
);
const roughnessMap = textureLoader.load(
  "textures/brick/Bricks082A_2K-JPG_Color_Roughness.jpg"
);
const aoMap = textureLoader.load(
  "textures/brick/Bricks082A_2K-JPG_Color_AmbientOcclusion.jpg"
);

if (!colorMap || !normalMap || !roughnessMap || !aoMap) {
  console.log("Error loading textures in warehouse-wall.js");
}

[colorMap, normalMap, roughnessMap, aoMap].forEach((map) => {
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.rotation = Math.PI / 2;
  map.center.set(0.5, 0.5);
});

export async function loadWallMatrix() {
  try {
    const response = await fetch("/wallMatrix.csv");
    const text = await response.text();
    const rows = text.trim().split("\n");
    const matrix = rows.map((row) => row.split(",").map(Number));
    return matrix;
  } catch (err) {
    console.error("Error fetching wall matrix:", err);
    return [];
  }
}

const wallTexture = textureLoader.load(
  "textures/brick/brick-blender-image4.png"
);

// const wallGeometry = new THREE.BoxGeometry(width, height, depth);
const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });

export function createWallTile(size = 1, height = 15) {
  const wallGeometry = new THREE.BoxGeometry(size, height, size);

  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(0.5, 2); // Adjust to repeat the texture

  // const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);

  // geometry.attributes.uv2 = geometry.attributes.uv;

  // // Random offset in UV space
  // const offsetX = Math.random();
  // const offsetY = Math.random();

  // // Apply offset to each face's UVs
  // const uvs = geometry.attributes.uv;
  // for (let i = 0; i < uvs.count; i++) {
  //   uvs.setXY(i, uvs.getX(i) + offsetX, uvs.getY(i) + offsetY);
  // }

  // const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  // const material = new THREE.MeshStandardMaterial({
  //   map: colorMap,
  //   normalMap: normalMap,
  //   roughnessMap: roughnessMap,
  //   aoMap: aoMap,
  // });

  // const wall = new THREE.Mesh(geometry, material);
  wall.castShadow = true;
  wall.receiveShadow = true;

  return wall;
}
