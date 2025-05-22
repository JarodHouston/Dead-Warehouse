import { DEV_MODE } from './constants.js';

const keys = { w:false, a:false, s:false, d:false, ' ':false };

if (!DEV_MODE) {
  window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.key.toLowerCase()))
      keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.key.toLowerCase()))
      keys[e.key.toLowerCase()] = false;
  });
}

export function getKeys() { return keys; }
