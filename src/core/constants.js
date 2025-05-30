export const DEV_MODE      = false;      // true = OrbitControls
export const TERRAIN_SIZE  = 500;
export const WAREHOUSE_SIZE= 100;

// performance
export const pixel_ratio = 1.0;

// player
export const PLAYER_HEIGHT = 1.6;
export const PLAYER_RADIUS = 0.1;
export const WALK_SPEED    = 5;
export const JUMP_SPEED    = 10;
export const GRAVITY       = 30;
export const SUBSTEPS      = 2; // higher -> more stablity, less fps

// gun position
export const weapAncPosX = 0.4;
export const weapAncPosY = -0.25;
export const weapAncPosZ = -0.8;

// gun rotation
export const weapRotX = Math.PI;
export const weapRotY = 1.5*Math.PI;
export const weapRotZ = Math.PI;

// gun scale
export const weapScale = 0.135;

// gun recoil
export const REST_Z    = -0.80;   // default offset (matches your original code)
export const KICK_Z    = -0.60;   // how far back the weapon jumps (−0.95 ⇒ 15 cm)
export const RECOVER_MS = 200;    // time to return to REST_Z, in milliseconds