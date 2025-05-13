import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { warehouse } from "./src/warehouse/warehouse.js";

const DEV_MODE = false;

const terrainSize = 500;
const warehouseSize = 100;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 0x0b0035

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let camera = null;
let controls = null;

camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 1.6, 55); // Eye height: ~1.6m

controls = new PointerLockControls(camera, document.body);
scene.add(controls.object);
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 5.0; // meters per second

const keys = { w: false, a: false, s: false, d: false };

if (DEV_MODE) {
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 300, 0);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enabled = true;
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2.05; // almost flat horizontal view
} else {
  document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
  });

  document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });
  document.addEventListener("click", () => {
    controls.lock();
  });
}

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

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only needed if controls.enableDamping = true

  if (!DEV_MODE) {
    const delta = clock.getDelta();

    direction.z = Number(keys.w) - Number(keys.s);
    direction.x = Number(keys.d) - Number(keys.a);
    direction.normalize(); // so diagonal isn't faster

    if (controls.isLocked) {
      velocity.x = direction.x * speed * delta;
      velocity.z = direction.z * speed * delta;

      controls.moveRight(velocity.x);
      controls.moveForward(velocity.z);

      // Lock vertical position (y)
      camera.position.y = 1.6;
    }
  }
  renderer.render(scene, camera);
}
animate();
