import { CONFIG } from "./configs.js";
import {
  changePolySides,
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

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);

  if (e.altKey) {
    if (e.code === "ArrowRight") return rotate(1);
    if (e.code === "ArrowLeft") return rotate(-1);
  }
  if (e.code.includes("Arrow")) return moveBaseOnCode(e.code);

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "KeyC") return dig();
  if (e.code === "KeyV") return place();

  if (e.code === "Space") return move();
};

let zoomDist = 0;

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    zoomDist = Math.hypot(
      screenX - e.touches[1].screenX,
      screenY - e.touches[1].screenY
    );
  } else mobileTouchStart(screenX, screenY);
};

document.ontouchmove = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    const nZoomDist = Math.hypot(
      screenX - e.touches[1].screenX,
      screenY - e.touches[1].screenY
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
