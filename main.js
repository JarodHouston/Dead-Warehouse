import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { warehouse } from "./src/warehouse/warehouse.js";

const terrainSize = 1000;
const warehouseSize = 500;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 0x0b0035

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 10;
controls.maxDistance = 2000;
controls.maxPolarAngle = Math.PI / 2.05; // almost flat horizontal view

// for now, create ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(ambientLight);

// load basic terrain
// const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const outer = new THREE.Shape();
outer.moveTo(-terrainSize / 2, -terrainSize / 2);
outer.lineTo(terrainSize / 2, -terrainSize / 2);
outer.lineTo(terrainSize / 2, terrainSize / 2);
outer.lineTo(-terrainSize / 2, terrainSize / 2);
outer.lineTo(-terrainSize / 2, -terrainSize / 2);

// make a hole
const hole = new THREE.Path();
hole.moveTo(-warehouseSize / 2, -warehouseSize / 2);
hole.lineTo(warehouseSize / 2, -warehouseSize / 2);
hole.lineTo(warehouseSize / 2, warehouseSize / 2);
hole.lineTo(-warehouseSize / 2, warehouseSize / 2);
hole.lineTo(-warehouseSize / 2, -warehouseSize / 2);
outer.holes.push(hole);

const terrainGeometry = new THREE.ShapeGeometry(outer);
const terrainMaterial = new THREE.MeshBasicMaterial({
  color: 0x228b22, // forest green
  wireframe: false,
  flatShading: true,
});
// material.depthWrite = false;

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2; // Rotate to make it flat
scene.add(terrain);

const warehouseObject = warehouse(warehouseSize);
scene.add(warehouseObject);

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only needed if controls.enableDamping = true
  renderer.render(scene, camera);
}
animate();
