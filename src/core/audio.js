import * as THREE from "three";

const audioLoader = new THREE.AudioLoader();

export function playBackgroundMusic(listener) {
  const sound = new THREE.Audio(listener);

  try {
    audioLoader.load("audio/Vivid_Echo.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true); // true for background music
      sound.setVolume(1);
      sound.play(); // optional - play immediately
    });
  } catch (error) {
    console.log(error);
    console.log("Error trying to load Vivid_Echo audio");
  }
}

export function loadWalkSound(listener) {
  const sound = new THREE.Audio(listener);

  try {
    audioLoader.load("audio/walk.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.1);
    });
  } catch (error) {
    console.log(error);
    console.log("Error trying to load walk audio");
  }

  return sound;
}

export function loadSprintSound(listener) {
  const sound = new THREE.Audio(listener);

  try {
    audioLoader.load("audio/sprint.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.1);
    });
  } catch (error) {
    console.log(error);
    console.log("Error trying to load sprint audio");
  }

  return sound;
}
