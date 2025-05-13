import * as THREE from "three";
import Stats from 'three/addons/libs/stats.module.js'; // For FPS, memory stats
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // To load models such as characters or weapons from Blender/Unity
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { Capsule } from 'three/addons/math/Capsule.js'; // Models player collion to prevent clipping
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'; // Allows tuning of speed, gravity, LOD distances

// Basic Three Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x88ccee ); // Color for sky
scene.fog = new THREE.Fog(0x88ccee, 0, 50); // Rendering distance
// scene.fog = new THREE.Fog(color, near, far); Hides geometry beyond 'far'

const camera   = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ'; // Y - Yaw, X - Pitch, Z - Roll; Order prevents gimbal lock



const renderer = new THREE.WebGLRenderer();          // antialias set to off
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap DPR
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);
// Shadows OFF by default; tone mapping default is fine