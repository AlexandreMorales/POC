import { CONFIG, MOVEMENT } from "../configs.js";
import {
  changePolySides,
  changeSelectedOnCode,
  moveBaseOnCode,
  rotate,
  dig,
  place,
  stopMoving,
} from "../actions.js";
import { resetSize } from "../boot.js";
import { move } from "../movement.js";

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

  console.log(e.code);

  if (e.code.startsWith("Arrow"))
    return moveBaseOnCode(ARROW_MOVEMENT_MAP[e.code]);

  if (MOVEMENT_KEYS.includes(e.code))
    return changeSelectedOnCode(KEY_MOVEMENT_MAP[e.code]);

  if (e.code === "KeyQ") return rotate(-1);
  if (e.code === "KeyE") return rotate(1);

  if (e.code === "KeyR") return dig();
  if (e.code === "KeyF") return place();

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();
};

document.onkeyup = () => {
  stopMoving();
};

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("zoom")
);
heightSlider.value = `${CONFIG.cellHeight}`;
heightSlider.min = `${CONFIG.minZoom}`;
heightSlider.max = `${CONFIG.maxZoom}`;
heightSlider.oninput = () => {
  resetSize(+heightSlider.value);
  heightSlider.blur();
};

document.getElementById("change-poly").onclick = changePolySides;
document.getElementById("dig").onclick = dig;
document.getElementById("place").onclick = place;
document.getElementById("rotate-left").onclick = () => rotate(-1);
document.getElementById("rotate-right").onclick = () => rotate(1);
