import { drawEveryCell } from "../draw/draw.js";
import { GRID, placeBlock } from "../grid.js";
import { BLOCKS } from "./biomes.js";
import { KNOWN_POLYGONS, MENU_CONFIG } from "./configs.js";
import { MAP_INFO, POLY_INFO } from "./infos.js";

const canvasContainer = document.getElementById("canvas-container");

canvasContainer.onclick = (e) => {
  if (!MENU_CONFIG.debugMode || MAP_INFO.rotationTurns) return;
  e = e || /** @type {Event} */ (window.event);
  const rect = canvasContainer.getBoundingClientRect(); // Get canvas position and size
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  if (MENU_CONFIG.usePerspective) {
    x += 125;
    y += 70;
  }
  const { i, j } = calculatePosBasedOnPoint({ x, y });
  const cell = GRID[i]?.[j];

  const block = BLOCKS.ROCK;

  if (cell.wall) {
    cell.wall = null;
  } else {
    placeBlock(cell, block, block.colorRGB);
  }

  drawEveryCell();
};

/**
 * @param {number} polySides
 * @param {number} polySide
 * @param {number} xSide
 * @returns {(x: number) => number}
 */
const getJFn = (polySides, polySide, xSide) => {
  switch (polySides) {
    case KNOWN_POLYGONS.TRIANGLE:
      return (x) => (x - xSide) / (polySide / 2);

    case KNOWN_POLYGONS.HEXAGON:
      return (x) => (x - xSide) / (xSide + polySide / 2);

    case KNOWN_POLYGONS.SQUARE:
    default:
      return (x) => (x - xSide) / (xSide * 2);
  }
};

/**
 * @param {number} y
 * @param {number} ySide
 * @param {boolean} shouldIntercalate
 * @param {boolean} evenJ
 * @returns {number}
 */
const calcI = (y, ySide, shouldIntercalate, evenJ) => {
  let dividend = y - ySide;
  if (shouldIntercalate) {
    if (MAP_INFO.currentCell.pos.j % 2 && !evenJ) {
      dividend += ySide;
    } else if (!(MAP_INFO.currentCell.pos.j % 2) && evenJ) {
      dividend -= ySide;
    }
  }
  return dividend / (ySide * 2);
};

/**
 * @param {import("infos.js").Point} pos
 * @return {import("infos.js").CellPos}
 */
const calculatePosBasedOnPoint = ({ x, y }) => {
  const { xSide, ySide, shouldIntercalate, polySide } =
    POLY_INFO[MAP_INFO.currentPoly];

  let j = getJFn(MAP_INFO.currentPoly, polySide, xSide)(x);
  j = Math.round(j + (MAP_INFO.jOffset || 0));
  let i = calcI(y, ySide, shouldIntercalate, !!(j % 2));
  i += MAP_INFO.iOffset || 0;

  return { i: Math.round(i), j: j };
};
