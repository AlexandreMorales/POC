import { moveBaseOnCode, stopMoving } from "../actions.js";
import { resetSize } from "../boot.js";
import { CONFIG, MAP_CONFIG, MOVEMENT } from "../configs.js";

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
