import {
  configPoly,
  KNOWN_POLYGONS_VALUES,
  RENDER_INFO,
} from "../../1 - polygones/index.js";
import { EMPTY_BLOCK } from "../../3 - generation/index.js";

import { applyBorders, clearCanvas, drawWall, drawWallTop } from "../render.js";
import { blockToWall } from "../_utils.js";
import { getMod } from "../../_utils.js";

const PLACE_CONFIG = {
  cellHeight: 24,
  canvasNum: 7,
};
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

const PLACE_BLOCKS = /** @type {CellBlock[]} */ ([]);

/**
 * @returns {CellBlock}
 */
export const getSelectedBlockToPlace = () => {
  const block = PLACE_BLOCKS.splice(SELECTED_PLACE_BLOCKS, 1)[0];
  showPlaceBlock();
  return block;
};

/**
 * @param {CellBlock} block
 */
export const addBlockToPlace = (block) => {
  if (block) PLACE_BLOCKS.push(block);
  showPlaceBlock();
};

export const resetPlace = () => {
  placeCanvas.forEach((p) => {
    p.width = placeContainer.parentElement.offsetWidth;
    p.height = placeContainer.parentElement.offsetHeight;
  });
  showPlaceBlock();
  showSelectedPlaceBlocks();
};

const showPlaceBlock = () => {
  placeCanvas.forEach((p) => clearCanvas(p));

  placeContexts.forEach((p, i) =>
    drawPlaceBlock(
      p,
      PLACE_BLOCKS[i] || {
        color: EMPTY_BLOCK.color,
        block: EMPTY_BLOCK,
      }
    )
  );
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {CellBlock} block
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
    block,
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
  SELECTED_PLACE_BLOCKS = getMod(
    SELECTED_PLACE_BLOCKS + orientation,
    PLACE_CONFIG.canvasNum
  );
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
    SELECTED_PLACE_BLOCKS,
    getMod(SELECTED_PLACE_BLOCKS + 1, PLACE_CONFIG.canvasNum),
  ];
  placeCanvas.forEach((p, i) =>
    p.classList[showIndexes.includes(i) ? "add" : "remove"]("active")
  );
};
