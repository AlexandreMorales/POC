import {
  configPoly,
  KNOWN_POLYGONS_VALUES,
  RENDER_INFO,
} from "../../1 - polygones/index.js";
import { BLOCKS } from "../../3 - generation/index.js";

import { applyBorders, clearCanvas, drawWall, drawWallTop } from "../render.js";
import { blockToWall } from "../_utils.js";
import { getMod } from "../../_utils.js";

/**
 * @param {Color} color1
 * @param {Color} color2
 * @returns {boolean}
 */
const areColorsEqual = (color1, color2) =>
  color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;

const PLACE_CONFIG = {
  cellHeight: 24,
  canvasNum: 7,
};
const BLOCKS_LISTS = Object.values(BLOCKS)
  .filter((b) => !b.isFluid)
  .filter(
    (b, i, a) =>
      !a.find((b2, i2) => areColorsEqual(b.color, b2.color) && i < i2)
  );
PLACE_CONFIG.steps = 360 / PLACE_CONFIG.canvasNum;
let PLACE_POLYS_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ (null);

const placeContainer = document.getElementById("place-canvas-container");
const placeCanvas = /** @type {HTMLCanvasElement[]} */ ([]);
const placeContexts = /** @type {CanvasRenderingContext2D[]} */ ([]);

for (let i = 0; i < PLACE_CONFIG.canvasNum; i++) {
  const canvas = document.createElement("canvas");
  canvas.style.setProperty(
    "--place-rotate-canvas",
    `${PLACE_CONFIG.steps * i}deg`
  );
  placeContainer.appendChild(canvas);
  placeCanvas.push(canvas);
  placeContexts.push(canvas.getContext("2d"));
}

placeContainer.ontouchend = () => {};

/**
 * @returns {CellBlock}
 */
export const getSelectedBlockToPlace = () => {
  const block =
    BLOCKS_LISTS[getMod(SELECTED_PLACE_BLOCKS, BLOCKS_LISTS.length)];
  return { block, color: block.color };
};

export const resetPlace = () => {
  placeCanvas.forEach((p) => {
    p.width = placeContainer.parentElement.offsetWidth;
    p.height = placeContainer.parentElement.offsetHeight;
  });
  showSelectedPlaceBlocks();
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {Block} block
 */
const drawPlaceBlock = (context, block) => {
  if (!PLACE_POLYS_INFO) {
    PLACE_POLYS_INFO = {};
    for (const p of KNOWN_POLYGONS_VALUES) {
      PLACE_POLYS_INFO[p] = configPoly(p, PLACE_CONFIG.cellHeight);
    }
  }

  const polyInfo = PLACE_POLYS_INFO[RENDER_INFO.currentPoly];

  const wall = blockToWall(
    { block, color: block.color },
    {
      x: placeContainer.parentElement.offsetWidth / 2,
      y: placeContainer.parentElement.offsetHeight / 1.75,
    },
    { isInverted: polyInfo.hasInverted },
    polyInfo
  );

  drawWall(wall, context);
  applyBorders(context, wall.point, wall.points, [], true);
  drawWallTop(wall, context);
};

let SELECTED_PLACE_BLOCKS = 0;
let PLACE_BLOCKS_DEG = 0;

/**
 * @param {number} orientation
 */
export const movePlaceBlocks = (orientation) => {
  SELECTED_PLACE_BLOCKS = SELECTED_PLACE_BLOCKS + orientation;
  PLACE_BLOCKS_DEG +=
    orientation > 0 ? PLACE_CONFIG.steps : -PLACE_CONFIG.steps;

  placeContainer.style.setProperty(
    "--place-rotate-container",
    `${-PLACE_BLOCKS_DEG}deg`
  );
  showSelectedPlaceBlocks();
};

const showSelectedPlaceBlocks = () => {
  const showIndexes = [
    getMod(SELECTED_PLACE_BLOCKS - 1, PLACE_CONFIG.canvasNum),
    getMod(SELECTED_PLACE_BLOCKS, PLACE_CONFIG.canvasNum),
    getMod(SELECTED_PLACE_BLOCKS + 1, PLACE_CONFIG.canvasNum),
  ];
  const drawIndexes = [
    getMod(SELECTED_PLACE_BLOCKS - 1, BLOCKS_LISTS.length),
    getMod(SELECTED_PLACE_BLOCKS, BLOCKS_LISTS.length),
    getMod(SELECTED_PLACE_BLOCKS + 1, BLOCKS_LISTS.length),
  ];

  placeCanvas.forEach((p, i) => {
    p.classList[showIndexes.includes(i) ? "add" : "remove"]("active");
  });

  showIndexes.forEach((index, i) => {
    clearCanvas(placeCanvas[index]);
    drawPlaceBlock(placeContexts[index], BLOCKS_LISTS[drawIndexes[i]]);
  });
};
