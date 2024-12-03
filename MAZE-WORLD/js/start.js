import { CONFIG } from "./configs.js";
import {
  MOVEMENT,
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

start();

let isMoving = false;

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  e.preventDefault();

  if (
    e.code === "KeyW" ||
    e.code === "KeyA" ||
    e.code === "KeyS" ||
    e.code === "KeyD"
  )
    isMoving = true;

  if (e.code === "KeyW") return moveBaseOnCode(MOVEMENT.UP);
  if (e.code === "KeyA") return moveBaseOnCode(MOVEMENT.LEFT);
  if (e.code === "KeyS") return moveBaseOnCode(MOVEMENT.DOWN);
  if (e.code === "KeyD") return moveBaseOnCode(MOVEMENT.RIGHT);

  if (e.code === "ArrowUp") return changeSelectedOnCode(MOVEMENT.UP);
  if (e.code === "ArrowLeft") return changeSelectedOnCode(MOVEMENT.LEFT);
  if (e.code === "ArrowDown") return changeSelectedOnCode(MOVEMENT.DOWN);
  if (e.code === "ArrowRight") return changeSelectedOnCode(MOVEMENT.RIGHT);

  if (e.code === "KeyQ") return dig();
  if (e.code === "KeyE") return place();

  if (e.code === "Tab") return rotate(-1);
  if (e.code === "KeyR") return rotate(1);

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();
};

document.onkeyup = () => {
  isMoving = false;
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
document.getElementById("rotate-left").onclick = () => rotate(-1, true);
document.getElementById("rotate-right").onclick = () => rotate(1, true);

window.onresize = () => resetSize();
