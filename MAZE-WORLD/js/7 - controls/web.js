import { POLY_INFO } from "../1 - polygones/index.js";
import { MOVEMENT } from "../2 - entities/index.js";
import {
  changePolySides,
  changeSelectedOnCode,
  dig,
  move,
  moveBaseOnCode,
  place,
  rotate,
  stopMoving,
  useBoat,
} from "../5 - actions/index.js";
import { resetSize } from "../6 - boot/index.js";

import { CONTROLS_CONFIG } from "./configs.js";

const KEY_MOVEMENT_MAP = {
  ["KeyW"]: MOVEMENT.UP,
  ["KeyA"]: MOVEMENT.LEFT,
  ["KeyS"]: MOVEMENT.DOWN,
  ["KeyD"]: MOVEMENT.RIGHT,
};
const ARROW_MOVEMENT_MAP = {
  ["ArrowUp"]: MOVEMENT.UP,
  ["ArrowLeft"]: MOVEMENT.LEFT,
  ["ArrowDown"]: MOVEMENT.DOWN,
  ["ArrowRight"]: MOVEMENT.RIGHT,
};
const MOVEMENT_KEYS = Object.keys(KEY_MOVEMENT_MAP);

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);

  if (e.code.startsWith("Arrow"))
    return moveBaseOnCode(ARROW_MOVEMENT_MAP[e.code]);

  if (MOVEMENT_KEYS.includes(e.code))
    return changeSelectedOnCode(KEY_MOVEMENT_MAP[e.code]);

  if (e.code === "KeyQ") return rotate(-1);
  if (e.code === "KeyE") return rotate(1);

  if (e.code === "KeyR") return dig();
  if (e.code === "KeyF") return place();
  if (e.code === "KeyB") return useBoat();

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();
};

document.onkeyup = () => {
  stopMoving();
};

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("zoom")
);
heightSlider.value = `${POLY_INFO.cellHeight}`;
heightSlider.min = `${CONTROLS_CONFIG.minZoom}`;
heightSlider.max = `${CONTROLS_CONFIG.maxZoom}`;
heightSlider.oninput = () => {
  resetSize(+heightSlider.value);
  heightSlider.blur();
};
