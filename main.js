import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { warehouse } from "./warehouse/warehouse.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 0x0b0035

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
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
controls.maxDistance = 300;
controls.maxPolarAngle = Math.PI / 2.05; // almost flat horizontal view

// load basic terrain
const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const material = new THREE.MeshBasicMaterial({
  color: 0x228b22, // forest green
  wireframe: false,
  flatShading: true,
});
// material.depthWrite = false;

// for now, create ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(ambientLight);

const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2; // Rotate to make it flat
scene.add(terrain);

const warehouseObject = warehouse();
scene.add(warehouseObject);

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only needed if controls.enableDamping = true
  renderer.render(scene, camera);
}
animate();
