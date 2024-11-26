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

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  mobileTouchStart(screenX, screenY);
};

document.ontouchmove = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  mobileTouchMove(screenX, screenY);
};

document.ontouchend = () => {
  mobileTouchEnd();
};

const heightSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("cell-height")
);
if (CONFIG.showZoom) {
  heightSlider.value = heightSlider.min = `${CONFIG.cellHeight}`;
  heightSlider.oninput = () => resetSize(+heightSlider.value);
} else {
  heightSlider.style.display = "none";
}

document.getElementById("change-poly").onclick = changePolySides;
document.getElementById("dig").onclick = dig;
document.getElementById("place").onclick = place;
document.getElementById("rotate-left").onclick = () => rotate(-1);
document.getElementById("rotate-right").onclick = () => rotate(1);
