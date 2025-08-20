import { getPolyInfo } from "../../1 - polygones/index.js";

import { applyBorders, clearCanvas, drawWall, drawWallTop } from "../render.js";
import { blockToWall } from "../_utils.js";
import { EMPTY_BLOCK } from "../../3 - generation/index.js";

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
  const isEmptyBlock = !block;
  clearCanvas(placeCanvas);

  if (isEmptyBlock) block = { color: EMPTY_BLOCK.color, block: EMPTY_BLOCK };

  const polyInfo = getPolyInfo();

  const wall = blockToWall(
    block,
    { x: placeCanvas.width / 2, y: placeCanvas.height / 1.75 },
    { isInverted: polyInfo.hasInverted }
  );

  drawWall(wall, placeContext);
  applyBorders(placeContext, wall.point, wall.points, [], true);
  drawWallTop(wall, placeContext);
};
