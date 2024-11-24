import { CONFIG } from "./configs.js";
import { MAP_INFO } from "./infos.js";
import { changePolySides, move, moveBaseOnCode, rotate } from "./movement.js";
import { resetSize, start } from "./boot.js";
import { dig, place } from "./actions.js";

start();

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);

  if (e.code === "ShiftLeft") {
    changePolySides();
    return;
  }

  if (e.code === "Space") {
    move();
    return;
  }

  if (CONFIG.useRotation) {
    if (e.code === "ArrowRight") return rotate(1);
    if (e.code === "ArrowLeft") return rotate(-1);
  }

  if (e.code === "KeyC") {
    dig();
    return;
  }

  if (e.code === "KeyV") {
    place();
    return;
  }

  moveBaseOnCode(e.code, e.altKey);
};

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;

  MAP_INFO.touchPos.interval = setInterval(() => {
    const finalX = screenX - MAP_INFO.touchPos.x;
    const finalY = screenY - MAP_INFO.touchPos.y;

    let code = null;
    let useDiagonal = false;
    if (Math.abs(finalY) > MAP_INFO.touchThreshold) {
      useDiagonal = finalY < 0;
      code = useDiagonal ? "ArrowUp" : "ArrowDown";
    }
    if (Math.abs(finalX) > MAP_INFO.touchThreshold) {
      if (CONFIG.useRotation) {
        clearInterval(MAP_INFO.touchPos.interval);
        return rotate(finalX < 0 ? -1 : 1);
      }
      code = finalX < 0 ? "ArrowLeft" : "ArrowRight";
    }

    if (code) moveBaseOnCode(code, useDiagonal);
  }, 100);
};

document.ontouchmove = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;
};

document.ontouchend = () => {
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos = { x: 0, y: 0, interval: null };
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

const changePolyBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("change-poly")
);
changePolyBtn.onclick = changePolySides;
const digBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("dig")
);
digBtn.onclick = dig;
const placeBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("place")
);
placeBtn.onclick = place;
