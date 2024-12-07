import { CONFIG, MAP_CONFIG, MOVEMENT } from "./configs.js";
import {
  changePolySides,
  changeSelectedOnCode,
  moveBaseOnCode,
  rotate,
  dig,
  place,
  stopMoving,
} from "./actions.js";
import { resetSize, start } from "./boot.js";
import { move } from "./movement.js";

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

  if (e.code.includes("Shift")) return changePolySides();

  if (e.code === "Space") return move();
};

document.onkeyup = () => {
  stopMoving();
};

let zoomDist = 0;
let touchPos = { x: 0, y: 0, interval: null };

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    const secondTouch = e.touches[1];
    zoomDist = Math.hypot(
      screenX - secondTouch.screenX,
      screenY - secondTouch.screenY
    );
  } else {
    clearInterval(touchPos.interval);
    touchPos.x = screenX;
    touchPos.y = screenY;

    touchPos.interval = setInterval(() => {
      const finalX = screenX - touchPos.x;
      const finalY = screenY - touchPos.y;

      let code = null;
      let useDiagonal = false;
      if (Math.abs(finalY) > MAP_CONFIG.touchThreshold) {
        useDiagonal = finalY > 0;
        code = useDiagonal ? MOVEMENT.DOWN : MOVEMENT.UP;
      }
      if (Math.abs(finalX) > MAP_CONFIG.touchThreshold) {
        code = finalX < 0 ? MOVEMENT.LEFT : MOVEMENT.RIGHT;
      }

      if (code) moveBaseOnCode(code, useDiagonal);
    }, 100);
  }
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
  } else {
    touchPos.x = screenX;
    touchPos.y = screenY;
  }
};

document.ontouchend = () => {
  clearInterval(touchPos.interval);
  touchPos = { x: 0, y: 0, interval: null };
  stopMoving();
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
