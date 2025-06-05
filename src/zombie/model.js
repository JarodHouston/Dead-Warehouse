import * as THREE from "three";

// ─── 1. GLOBAL TEXTURE LOADER ───────────────────────────────
const loader = new THREE.TextureLoader();

// ─── 2. HEAD TEXTURES ───────────────────────────────────────
const texRight_h = loader.load(
  "../../textures/right_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load right_head.png:", err)
);

const texLeft_h = loader.load(
  "../../textures/left_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load left_head.png:", err)
);

const texTop_h = loader.load(
  "../../textures/top_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load top_head.png:", err)
);

const texBottom_h = loader.load(
  "../../textures/bottom_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load bottom_head.png:", err)
);

const texFront_h = loader.load(
  "../../textures/front_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load front_head.png:", err)
);

const texBack_h = loader.load(
  "../../textures/back_head.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load back_head.png:", err)
);

// ─── 3. TORSO TEXTURES ──────────────────────────────────────
const texRight_t = loader.load(
  "../../textures/right_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load right_torso.png:", err)
);

const texLeft_t = loader.load(
  "../../textures/left_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load left_torso.png:", err)
);

const texTop_t = loader.load(
  "../../textures/top_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load top_torso.png:", err)
);

const texBottom_t = loader.load(
  "../../textures/bottom_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load bottom_torso.png:", err)
);

const texFront_t = loader.load(
  "../../textures/front_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load front_torso.png:", err)
);

const texBack_t = loader.load(
  "../../textures/back_torso.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load back_torso.png:", err)
);

// ─── 4. ARM TEXTURES ────────────────────────────────────────
const texRight_arm = loader.load(
  "../../textures/right_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load right_arm.png:", err)
);

const texLeft_arm = loader.load(
  "../../textures/left_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load left_arm.png:", err)
);

const texTop_arm = loader.load(
  "../../textures/top_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load top_arm.png:", err)
);

const texBottom_arm = loader.load(
  "../../textures/bottom_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load bottom_arm.png:", err)
);

const texFront_arm = loader.load(
  "../../textures/front_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load front_arm.png:", err)
);

const texBack_arm = loader.load(
  "../../textures/back_arm.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load back_arm.png:", err)
);

// ─── 5. LEG TEXTURES ────────────────────────────────────────
const texRight_leg = loader.load(
  "../../textures/right_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load right_leg.png:", err)
);

const texLeft_leg = loader.load(
  "../../textures/left_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load left_leg.png:", err)
);

const texTop_leg = loader.load(
  "../../textures/top_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load top_leg.png:", err)
);

const texBottom_leg = loader.load(
  "../../textures/bottom_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load bottom_leg.png:", err)
);

const texFront_leg = loader.load(
  "../../textures/front_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load front_leg.png:", err)
);

const texBack_leg = loader.load(
  "../../textures/back_leg.png",
  (t) => {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  },
  undefined,
  (err) => console.error("Failed to load back_leg.png:", err)
);

// ─── 6. HELPER: Build a Six‐Material Array ─────────────────────
function makeSixMaterials(
  rightTex,
  leftTex,
  topTex,
  bottomTex,
  frontTex,
  backTex
) {
  return [
    new THREE.MeshStandardMaterial({ map: rightTex }), // +X
    new THREE.MeshStandardMaterial({ map: leftTex }), // -X
    new THREE.MeshStandardMaterial({ map: topTex }), // +Y
    new THREE.MeshStandardMaterial({ map: bottomTex }), // -Y
    new THREE.MeshStandardMaterial({ map: frontTex }), // +Z
    new THREE.MeshStandardMaterial({ map: backTex }), // -Z
  ];
}

// ─── 7. CREATE HEAD MESH ────────────────────────────────────
function createHeadMesh() {
  const headMats = makeSixMaterials(
    texRight_h,
    texLeft_h,
    texTop_h,
    texBottom_h,
    texFront_h,
    texBack_h
  );
  const geo = new THREE.BoxGeometry(1, 1, 1);
  let new_mesh = new THREE.Mesh(geo, headMats);
  // new_mesh.castShadow = true;
  // new_mesh.receiveShadow = true;
  return new_mesh;
}

// ─── 8. CREATE TORSO MESH ───────────────────────────────────
function createTorsoMesh() {
  const torsoMats = makeSixMaterials(
    texRight_t,
    texLeft_t,
    texTop_t,
    texBottom_t,
    texFront_t,
    texBack_t
  );
  const geo = new THREE.BoxGeometry(1, 1.5, 0.5);
  return new THREE.Mesh(geo, torsoMats);
}

// ─── 9. CREATE RIGHT ARM MESH ───────────────────────────────
function createRightArmMesh() {
  const armMats = makeSixMaterials(
    texRight_arm,
    texLeft_arm,
    texTop_arm,
    texBottom_arm,
    texFront_arm,
    texBack_arm
  );
  // Shift pivot down by 0.5 so that rotation is about “shoulder”
  const geo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  geo.translate(0, -0.5, 0);

  const mesh = new THREE.Mesh(geo, armMats);
  mesh.position.set(0.75, 2.75, 0);
  mesh.rotateX(-Math.PI / 2);
  return mesh;
}

// ─── 10. CREATE LEFT ARM MESH ───────────────────────────────
function createLeftArmMesh() {
  const armMats = makeSixMaterials(
    texRight_arm,
    texLeft_arm,
    texTop_arm,
    texBottom_arm,
    texFront_arm,
    texBack_arm
  );
  const geo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  geo.translate(0, -0.5, 0);

  const mesh = new THREE.Mesh(geo, armMats);
  mesh.position.set(-0.75, 2.75, 0);
  mesh.rotateX(-Math.PI / 2);
  return mesh;
}

// ─── 11. CREATE RIGHT LEG MESH ───────────────────────────────
function createRightLegMesh() {
  const legMats = makeSixMaterials(
    texRight_leg,
    texLeft_leg,
    texTop_leg,
    texBottom_leg,
    texFront_leg,
    texBack_leg
  );
  // Shift pivot down by 1.25 so hip is at origin
  const geo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  geo.translate(0, -1.25, 0);

  const mesh = new THREE.Mesh(geo, legMats);
  mesh.position.set(0.25, 2.0, 0);
  return mesh;
}

// ─── 12. CREATE LEFT LEG MESH ────────────────────────────────
function createLeftLegMesh() {
  const legMats = makeSixMaterials(
    texRight_leg,
    texLeft_leg,
    texTop_leg,
    texBottom_leg,
    texFront_leg,
    texBack_leg
  );
  const geo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  geo.translate(0, -1.25, 0);

  const mesh = new THREE.Mesh(geo, legMats);
  mesh.position.set(-0.25, 2.0, 0);
  return mesh;
}

// ─── 13. ASSEMBLE CHARACTER ───────────────────────────────────
export function createZombieModel() {
  const character = new THREE.Group();

  // HEAD & TORSO
  const head = createHeadMesh();
  const torso = createTorsoMesh();
  head.name = "head";
  torso.name = "torso";
  torso.position.set(0, 2.25, 0);
  head.position.set(0, 3.5, 0);

  // ARMS & LEGS
  const leftArm = createLeftArmMesh();
  const rightArm = createRightArmMesh();
  const leftLeg = createLeftLegMesh();
  const rightLeg = createRightLegMesh();

  // Keep index order: [0=head, 1=torso, 2=leftArm, 3=rightArm, 4=leftLeg, 5=rightLeg]
  character.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);

  // Scale down uniformly
  character.scale.set(0.5, 0.5, 0.5);

  return character;
}
