import { getPolyInfo } from "../../1 - polygones/index.js";
import { clearCanvas, drawWall, drawWallTop } from "../render.js";
import { blockToWall } from "../utils.js";

const placeCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("place-canvas")
);
const placeContext = placeCanvas.getContext("2d");

export const resetPlace = () => {
  placeCanvas.width = placeCanvas.parentElement.offsetWidth;
  placeCanvas.height = placeCanvas.parentElement.offsetHeight;
};

/**
 * @param {CellBlock} block
 */
export const addBlockToToolbar = (block) => {
  clearCanvas(placeCanvas);

  if (!block) return;

  const polyInfo = getPolyInfo();

  const wall = blockToWall(
    block,
    { x: placeCanvas.width / 2, y: placeCanvas.height / 1.75 },
    { isInverted: polyInfo.hasInverted }
  );

  drawWall(wall, placeContext);
  drawWallTop(wall, placeContext);
};
