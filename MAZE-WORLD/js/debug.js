import { drawEveryCell } from "./draw/draw.js";
import { BLOCKS } from "./grid/biomes.js";
import { KNOWN_POLYGONS, MENU_CONFIG, GRID } from "./configs/configs.js";
import { POLY_INFO } from "./configs/infos.js";
import { MAP_INFO } from "./grid/infos.js";
import { placeBlock } from "./actions/actions.js";
import { PLAYER_ENTITY } from "./entities/player.js";

const canvasContainer = document.getElementById("canvas-container");

canvasContainer.onclick = (e) => {
  if (!MENU_CONFIG.debugMode || MAP_INFO.rotationTurns) return;
  e = e || /** @type {Event} */ (window.event);
  const { left, top } = canvasContainer.getBoundingClientRect();
  let x = e.clientX - left;
  let y = e.clientY - top;
  if (MENU_CONFIG.usePerspective) {
    x -= 175;
    y += 60;
  }
  const { i, j } = calculatePosBasedOnPoint({ x, y });
  const cell = GRID[i]?.[j];

  const block = BLOCKS.ROCK;

  if (cell.wall) {
    cell.wall = null;
  } else {
    placeBlock(cell, block, block.colorRGB);
  }

  drawEveryCell(PLAYER_ENTITY.cell);
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
    if (PLAYER_ENTITY.cell.pos.j % 2 && !evenJ) {
      dividend += ySide;
    } else if (!(PLAYER_ENTITY.cell.pos.j % 2) && evenJ) {
      dividend -= ySide;
    }
  }
  return dividend / (ySide * 2);
};

/**
 * @param {import("./configs/infos.js").Point} pos
 * @return {import("./configs/infos.js").CellPos}
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
