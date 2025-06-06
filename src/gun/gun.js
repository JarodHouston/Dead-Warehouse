// from './src/gun/gun.js'
import * as THREE from "three";
import { REST_Z, KICK_Z, RECOVER_MS } from "../core/constants.js";

let weaponAnchor, controls;

//const loader = new GLTFLoader();
let recoilClock = null; // null when idle
let recoilStartZ = REST_Z;

// to prevent file circulation
export function initGun(anchor, ctrl) {
  weaponAnchor = anchor;
  controls = ctrl;
}

/* ── helpers ──────────────────────────────────────────────────────────────── */
function quadOut(t) {
  // quadratic-out easing (t in [0, 1])
  return 1 - (1 - t) * (1 - t);
}

/* ── animation loop hook (runs every frame) ───────────────────────────────── */
export function updateRecoil() {
  if (!recoilClock) return; // no active recoil

  const elapsed = recoilClock.getElapsedTime() * 1000; // ms
  const t = Math.min(elapsed / RECOVER_MS, 1); // clamp 0–1
  const eased = quadOut(t);

  weaponAnchor.position.z = THREE.MathUtils.lerp(recoilStartZ, REST_Z, eased);

  if (t === 1) recoilClock = null; // finished → stop updating
}

/* ── gunRecoil() ----------------------------------------------------------------
   Call this whenever the weapon fires.  It kicks back and starts the recover
   animation that `updateRecoil()` then drives each frame.                */
function gunRecoil() {
  weaponAnchor.position.z = KICK_Z; // instant kick
  recoilStartZ = KICK_Z; // remember where we kicked to
  recoilClock = new THREE.Clock(); // start clock (paused=false)
}

/* ── fire input (unchanged except we call gunRecoil) ──────────────────────── */
export function handlePointerDown(event) {
  // first click: grab pointer, don't shoot
  if (!controls.isLocked) {
    controls.lock();
    gunRecoil();
    return;
  }
  // already locked → fire!
  gunRecoil();
}

export function handleMouseDown(event) {
  if (event.button !== 0) return; // ignore right/middle button
  console.log("test");
  // first click: grab pointer, don't shoot
  // if (!controls.isLocked) {
  //   gunRecoil();
  //   return;
  // }
  // already locked → fire!
  gunRecoil();
}
