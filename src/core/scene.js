import * as THREE from "three";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { warehouse } from "../warehouse/warehouse.js";
import { TERRAIN_SIZE, WAREHOUSE_SIZE, PLAYER_RADIUS } from "./constants.js";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x110124);

  /* lights */
  // scene.add(new THREE.AmbientLight(0xffffff, 1));
  // const sun = new THREE.DirectionalLight(0xffffff, 1);
  // sun.position.set(100, 200, 100);
  // sun.castShadow = true;
  // scene.add(sun);

  /* terrain */
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x228b22, flatShading: true })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  terrain.position.y = -PLAYER_RADIUS;
  scene.add(terrain);

  /* warehouse (prefab or fallback) */
  let warehouseObj;
  try {
    warehouseObj = warehouse(scene, WAREHOUSE_SIZE);
  } catch (e) {
    console.warn("warehouse() prefab missing – using placeholder cube", e);
    warehouseObj = new THREE.Mesh(
      new THREE.BoxGeometry(WAREHOUSE_SIZE, 20, WAREHOUSE_SIZE),
      new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    warehouseObj.position.y = 10;
  }
  scene.add(warehouseObj);

  /* octree for collision */
  const worldOctree = new Octree();
  worldOctree.fromGraphNode(terrain);
  worldOctree.fromGraphNode(warehouseObj);

  return { scene, worldOctree };
}
