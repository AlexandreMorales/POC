import { CONFIG, MOVEMENT } from "./configs.js";
import {
  changePolySides,
  changeSelectedOnCode,
  mobileTouchEnd,
  mobileTouchMove,
  mobileTouchStart,
  move,
  moveBaseOnCode,
  rotate,
} from "./movement.js";
import { resetSize, start } from "./boot.js";
import { dig, place } from "./actions.js";
import { startRunning, updatePlayerDirection } from "./entities.js";

start();

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

let lastMovement = null;

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  e.preventDefault();

  if (MOVEMENT_KEYS.includes(e.code)) {
    const lastLastM = lastMovement;
    lastMovement = KEY_MOVEMENT_MAP[e.code];
    if (lastLastM !== lastMovement) startRunning(lastMovement);
    return moveBaseOnCode(lastMovement);
  }

  if (e.code.startsWith("Arrow")) {
    lastMovement = ARROW_MOVEMENT_MAP[e.code];
    return changeSelectedOnCode(lastMovement);
  }

  if (e.code === "KeyQ") return dig();
  if (e.code === "KeyE") return place();

  if (e.code === "Tab") return rotate(-1);
  if (e.code === "KeyR") return rotate(1);

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();
};

document.onkeyup = () => {
  if (lastMovement) {
    updatePlayerDirection(lastMovement);
    lastMovement = null;
  }
};

let zoomDist = 0;

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    const secondTouch = e.touches[1];
    zoomDist = Math.hypot(
      screenX - secondTouch.screenX,
      screenY - secondTouch.screenY
    );
  } else mobileTouchStart(screenX, screenY);
};

document.ontouchmove = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    const secondTouch = e.touches[1];
    const nZoomDist = Math.hypot(
      screenX - secondTouch.screenX,
      screenY - secondTouch.screenY
    );

    if (nZoomDist > zoomDist && CONFIG.cellHeight < CONFIG.maxZoom) {
      resetSize(CONFIG.cellHeight + 1);
    } else if (nZoomDist < zoomDist && CONFIG.cellHeight > CONFIG.minZoom) {
      resetSize(CONFIG.cellHeight - 1);
    }

    zoomDist = nZoomDist;
  } else mobileTouchMove(screenX, screenY);
};

document.ontouchend = () => {
  mobileTouchEnd();
  zoomDist = 0;
};

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("zoom")
);
heightSlider.value = `${CONFIG.cellHeight}`;
heightSlider.min = `${CONFIG.minZoom}`;
heightSlider.max = `${CONFIG.maxZoom}`;
heightSlider.oninput = () => resetSize(+heightSlider.value);

document.getElementById("change-poly").onclick = changePolySides;
document.getElementById("dig").onclick = dig;
document.getElementById("place").onclick = place;
document.getElementById("rotate-left").onclick = () => rotate(-1);
document.getElementById("rotate-right").onclick = () => rotate(1);

window.onresize = () => resetSize();
