// character.js
import * as THREE from "three";

// ─── 1. LOAD A “STEVE‐STYLE” SKIN SCALED TO 360×180 ───────────────────────────
// In a classic 64×32 Minecraft skin, the head‐front region is 8×8.  
// You’ve scaled that 8×8 → 45×45, so the entire atlas is 64*5.625=360 wide and 32*5.625=180 tall.
// We’ll still write UVs in “orig‐64×32 units” (so dividing x by 64 and y by 32), and Three.js will
// map those fractions onto your 360×180 PNG.
const loader = new THREE.TextureLoader();
const skinTexture = loader.load("../../textures/zombie_texture.png", (tex) => {
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
});

// ─── 2. HELPER: REMAP ONE BOXFACE’S UVs USING A 64×32 ORIGINAL LAYOUT ─────────
// faceIndex ∈ [0..5] for (+X, -X, +Y, -Y, +Z, -Z).  
// (x0,y0)→(x1,y1) are pixel coords in the classic 64×32 scheme.  
// Normalization: u = x/64, v = y/32.
function remapBoxUV(geometry, faceIndex, x0, y0, x1, y1) {
  const uvs = geometry.attributes.uv.array;
  // Normalize based on original 64×32 dimensions:
  const px = (x) => x / 64;
  const py = (y) => y / 32;

  const uA = px(x0), vA = py(y0);
  const uB = px(x1), vB = py(y0);
  const uC = px(x1), vC = py(y1);
  const uD = px(x0), vD = py(y1);

  // Each face has 4 UVs = 8 floats. The starting index for this face’s UVs:
  const idx = faceIndex * 8;

  // Default BoxGeometry UV order: (u0,v0)=bottom‐left, (u1,v1)=top‐left,
  // (u2,v2)=top‐right, (u3,v3)=bottom‐right.
  // We assign:
  //   bottom‐left = (uD, vC)
  //   top‐left    = (uD, vA)
  //   top‐right   = (uB, vA)
  //   bottom‐right= (uB, vC)
  uvs[idx + 0] = uD; uvs[idx + 1] = vC; // bottom‐left
  uvs[idx + 2] = uD; uvs[idx + 3] = vA; // top‐left
  uvs[idx + 4] = uB; uvs[idx + 5] = vA; // top‐right
  uvs[idx + 6] = uB; uvs[idx + 7] = vC; // bottom‐right

  geometry.attributes.uv.needsUpdate = true;
}

// ─── 3. CREATE HEAD MESH USING 64×32 “STEVE” UV LAYOUT ────────────────────────
function createHeadMeshWithUV(texture) {
  const geo = new THREE.BoxGeometry(1, 1, 1);

  // Classic 64×32 head mapping:
  // +X (faceIndex=0): Right side of head  → pixels (0,8)→(8,16)
  // -X (faceIndex=1): Left side of head   → pixels (16,8)→(24,16)
  // +Y (faceIndex=2): Top of head         → pixels (8,0)→(16,8)
  // -Y (faceIndex=3): Bottom of head      → pixels (16,0)→(24,8)
  // +Z (faceIndex=4): Front of head       → pixels (8,8)→(16,16)
  // -Z (faceIndex=5): Back of head        → pixels (24,8)→(32,16)

  remapBoxUV(geo, 0,  0,  8,  8, 16); // +X
  remapBoxUV(geo, 1, 16,  8, 24, 16); // -X
  remapBoxUV(geo, 2,  8,  0, 16,  8); // +Y
  remapBoxUV(geo, 3, 16,  0, 24,  8); // -Y
  remapBoxUV(geo, 4,  8,  8, 16, 16); // +Z
  remapBoxUV(geo, 5, 24,  8, 32, 16); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 4. CREATE TORSO MESH USING 64×32 “STEVE” UV LAYOUT ──────────────────────
function createTorsoMesh(texture) {
  // Original torso is 8px (w) × 12px (h) × 4px (d). Scaled: (1.2, 1.5, 0.6).
  const geo = new THREE.BoxGeometry(1.2, 1.5, 0.6);

  // Classic 64×32 torso mapping:
  // +X (faceIndex=0): Right side of torso  → pixels (16,16)→(20,32)
  // -X (faceIndex=1): Left side of torso   → pixels (28,16)→(32,32)
  // +Y (faceIndex=2): Top of torso         → pixels (20,12)→(28,16)
  // -Y (faceIndex=3): Bottom of torso      → pixels (28,12)→(36,16)
  // +Z (faceIndex=4): Front of torso       → pixels (20,16)→(28,32)
  // -Z (faceIndex=5): Back of torso        → pixels (32,16)→(40,32)

  remapBoxUV(geo, 0, 16, 16, 20, 32); // +X
  remapBoxUV(geo, 1, 28, 16, 32, 32); // -X
  remapBoxUV(geo, 2, 20, 12, 28, 16); // +Y
  remapBoxUV(geo, 3, 28, 12, 36, 16); // -Y
  remapBoxUV(geo, 4, 20, 16, 28, 32); // +Z
  remapBoxUV(geo, 5, 32, 16, 40, 32); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 5. CREATE LEFT ARM MESH USING 64×32 “STEVE” UV LAYOUT ────────────────────
function createLeftArmMesh(texture) {
  // Original arm is 4px×12px×4px → (0.4, 1.2, 0.4)
  const geo = new THREE.BoxGeometry(0.4, 1.2, 0.4);

  // In 64×32 “Steve”:

  // +X (faceIndex=0): Right side of left arm → pixels (40,16)→(44,32)
  // -X (faceIndex=1): Left side of left arm  → pixels (48,16)→(52,32)
  // +Y (faceIndex=2): Top of left arm        → pixels (44,12)→(48,16)
  // -Y (faceIndex=3): Bottom of left arm     → pixels (48,12)→(52,16)
  // +Z (faceIndex=4): Front of left arm      → pixels (44,16)→(48,32)
  // -Z (faceIndex=5): Back of left arm       → pixels (52,16)→(56,32)

  remapBoxUV(geo, 0, 40, 16, 44, 32); // +X
  remapBoxUV(geo, 1, 48, 16, 52, 32); // -X
  remapBoxUV(geo, 2, 44, 12, 48, 16); // +Y
  remapBoxUV(geo, 3, 48, 12, 52, 16); // -Y
  remapBoxUV(geo, 4, 44, 16, 48, 32); // +Z
  remapBoxUV(geo, 5, 52, 16, 56, 32); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 6. CREATE RIGHT ARM MESH (MIRROR OF LEFT ARM) ───────────────────────────
function createRightArmMesh(texture) {
  // Dimensions are the same: 0.4×1.2×0.4
  const geo = new THREE.BoxGeometry(0.4, 1.2, 0.4);

  // In 64×32 “Steve”:

  // +X (faceIndex=0): Right side of right arm → pixels (40,48)→(44,64)  (but 64px Y doesn’t exist in 32px height…
  //                                             so in a 64×32 layout, right arm reuses the same as left arm.)
  // Indeed: In 64×32, there’s only one arm region—both arms are identical.
  // So we reuse (40,16)→(44,32) for +X, etc.

  remapBoxUV(geo, 0, 40, 16, 44, 32); // +X
  remapBoxUV(geo, 1, 48, 16, 52, 32); // -X
  remapBoxUV(geo, 2, 44, 12, 48, 16); // +Y
  remapBoxUV(geo, 3, 48, 12, 52, 16); // -Y
  remapBoxUV(geo, 4, 44, 16, 48, 32); // +Z
  remapBoxUV(geo, 5, 52, 16, 56, 32); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 7. CREATE LEFT LEG MESH USING 64×32 “STEVE” UV LAYOUT ───────────────────
function createLeftLegMesh(texture) {
  // Original leg is 4px×12px×4px → (0.5, 1.2, 0.5)
  const geo = new THREE.BoxGeometry(0.5, 1.2, 0.5);

  // Classic 64×32:

  // +X (faceIndex=0): Right side of left leg  → pixels (4,16)→(8,32)
  // -X (faceIndex=1): Left side of left leg   → pixels (12,16)→(16,32)
  // +Y (faceIndex=2): Top of left leg         → pixels (8,12)→(12,16)
  // -Y (faceIndex=3): Bottom of left leg      → pixels (12,12)→(16,16)
  // +Z (faceIndex=4): Front of left leg       → pixels (4,16)→(8,32)
  // -Z (faceIndex=5): Back of left leg        → pixels (12,16)→(16,32)

  remapBoxUV(geo, 0,  4, 16,  8, 32); // +X
  remapBoxUV(geo, 1, 12, 16, 16, 32); // -X
  remapBoxUV(geo, 2,  8, 12, 12, 16); // +Y
  remapBoxUV(geo, 3, 12, 12, 16, 16); // -Y
  remapBoxUV(geo, 4,  4, 16,  8, 32); // +Z
  remapBoxUV(geo, 5, 12, 16, 16, 32); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 8. CREATE RIGHT LEG MESH (MIRROR OF LEFT LEG) ───────────────────────────
function createRightLegMesh(texture) {
  // Dimensions the same: 0.5×1.2×0.5
  const geo = new THREE.BoxGeometry(0.5, 1.2, 0.5);

  // In 64×32, both legs share the same region:
  remapBoxUV(geo, 0,  4, 16,  8, 32); // +X
  remapBoxUV(geo, 1, 12, 16, 16, 32); // -X
  remapBoxUV(geo, 2,  8, 12, 12, 16); // +Y
  remapBoxUV(geo, 3, 12, 12, 16, 16); // -Y
  remapBoxUV(geo, 4,  4, 16,  8, 32); // +Z
  remapBoxUV(geo, 5, 12, 16, 16, 32); // -Z

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  return new THREE.Mesh(geo, mat);
}

// ─── 9. ASSEMBLE THE FULL “ZOMBIE/STEVE” CHARACTER ────────────────────────────
export function createZombieModel() {
  const character = new THREE.Group();

  // 1) HEAD
  const head = createHeadMeshWithUV(skinTexture);
  head.position.y = 2.5;

  // 2) TORSO
  const torso = createTorsoMesh(skinTexture);
  torso.position.y = 1.25;

  // 3) LEFT ARM
  const leftArm = createLeftArmMesh(skinTexture);
  leftArm.position.set(-0.9, 1.3, 0);

  // 4) RIGHT ARM
  const rightArm = createRightArmMesh(skinTexture);
  rightArm.position.set(0.9, 1.3, 0);

  // 5) LEFT LEG
  const leftLeg = createLeftLegMesh(skinTexture);
  leftLeg.position.set(-0.3, 0, 0);

  // 6) RIGHT LEG
  const rightLeg = createRightLegMesh(skinTexture);
  rightLeg.position.set(0.3, 0, 0);

  // 7) GROUP, SCALE, AND RETURN
  character.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);
  character.scale.set(0.5, 0.5, 0.5);
  character.position.y = 0.5;

  return character;
}
