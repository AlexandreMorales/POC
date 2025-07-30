import { MOVEMENT } from "../3 - entities/infos.js";
import { DRAW_INFO } from "../5 - draw/infos.js";
import {
  changePolySides,
  dig,
  moveBaseOnCode,
  place,
  rotate,
  stopMoving,
  useBoat,
} from "../6 - actions/actions.js";

import { resetSize } from "../start/boot.js";
import { CONTROLS_CONFIG } from "./configs.js";

let zoomDist = 0;
let touchPos = { x: 0, y: 0, interval: null };
const MOBILE_CONFIG = {
  touchThreshold: 25,
};

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
      if (Math.abs(finalY) > MOBILE_CONFIG.touchThreshold) {
        useDiagonal = finalY > 0;
        code = useDiagonal ? MOVEMENT.DOWN : MOVEMENT.UP;
      }
      if (Math.abs(finalX) > MOBILE_CONFIG.touchThreshold) {
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

    if (
      nZoomDist > zoomDist &&
      DRAW_INFO.cellHeight < CONTROLS_CONFIG.maxZoom
    ) {
      resetSize(DRAW_INFO.cellHeight + 1);
    } else if (
      nZoomDist < zoomDist &&
      DRAW_INFO.cellHeight > CONTROLS_CONFIG.minZoom
    ) {
      resetSize(DRAW_INFO.cellHeight - 1);
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

document.getElementById("change-poly").onclick = changePolySides;
document.getElementById("use-boat").onclick = useBoat;
document.getElementById("dig").onclick = dig;
document.getElementById("place").onclick = place;
document.getElementById("rotate-left").onclick = () => rotate(-1);
document.getElementById("rotate-right").onclick = () => rotate(1);
