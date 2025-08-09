import { RENDER_INFO } from "../../1 - polygones/index.js";
import {
  changePolySides,
  dig,
  place,
  rotate,
  useBoat,
} from "../../5 - actions/index.js";
import { resetSize } from "../../6 - boot/index.js";

import { CONTROLS_CONFIG } from "../configs.js";

const canvasContainer = document.getElementById("canvas-container");

let zoomDist = 0;

canvasContainer.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.touches[0];

  if (e.touches.length === 2) {
    const secondTouch = e.touches[1];
    zoomDist = Math.hypot(
      screenX - secondTouch.screenX,
      screenY - secondTouch.screenY
    );
    return;
  }
};

canvasContainer.ontouchmove = (e) => {
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
      RENDER_INFO.cellHeight < CONTROLS_CONFIG.maxZoom
    ) {
      resetSize(RENDER_INFO.cellHeight + 1);
    } else if (
      nZoomDist < zoomDist &&
      RENDER_INFO.cellHeight > CONTROLS_CONFIG.minZoom
    ) {
      resetSize(RENDER_INFO.cellHeight - 1);
    }

    zoomDist = nZoomDist;
  }
};

canvasContainer.ontouchend = () => {
  zoomDist = 0;
};

document.getElementById("change-poly").onclick = changePolySides;
document.getElementById("use-boat").onclick = useBoat;
document.getElementById("dig").onclick = dig;
document.getElementById("place").onclick = place;
document.getElementById("rotate-left").onclick = () => rotate(-1);
document.getElementById("rotate-right").onclick = () => rotate(1);
