// character.js
import * as THREE from "three";

export function createZombieModel(materialColor = 0x00ff00) {
  const character = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: materialColor });

  // Body parts
  const head = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.6), mat);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), mat);
  const rightArm = leftArm.clone();
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), mat);
  const rightLeg = leftLeg.clone();

  // Positioning
  head.position.y = 2.5;
  torso.position.y = 1.25;

  leftArm.position.set(-0.9, 1.3, 0);
  rightArm.position.set(0.9, 1.3, 0);

  leftLeg.position.set(-0.3, 0, 0);
  rightLeg.position.set(0.3, 0, 0);

  // Add to character group
  character.add(head);
  character.add(torso);
  character.add(leftArm);
  character.add(rightArm);
  character.add(leftLeg);
  character.add(rightLeg);

  character.scale.set(0.5, 0.5, 0.5);
  character.position.y = 0.5;
  character.onHit = () => {
    character.parent?.remove(character);
  };
  return character;
}
