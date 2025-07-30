import { KNOWN_POLYGONS, MENU_CONFIG } from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { getCell } from "../2 - grid/grid.js";
import { PLAYER_ENTITY } from "../3 - entities/player.js";
import { BLOCKS } from "../4 - map/biomes.js";
import { drawEveryCell } from "../5 - draw/draw.js";
import { placeBlock } from "../6 - actions/actions.js";

const canvasContainer = document.getElementById("canvas-container");

canvasContainer.onclick = (e) => {
  if (!MENU_CONFIG.debugMode || GRID_INFO.rotationTurns) return;
  e = e || /** @type {Event} */ (window.event);
  const { left, top } = canvasContainer.getBoundingClientRect();
  let x = e.clientX - left;
  let y = e.clientY - top;
  if (MENU_CONFIG.usePerspective) {
    x -= 175;
    y += 60;
  }
  const cell = getCell(calculatePosBasedOnPoint({ x, y }));

  const block = BLOCKS.ROCK;

  if (cell.wall) cell.wall = null;
  else placeBlock(cell, block, block.color);

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
 * @param {import("../0 - configs/infos.js").Point} pos
 * @return {import("../0 - configs/infos.js").Pos}
 */
const calculatePosBasedOnPoint = ({ x, y }) => {
  const { xSide, ySide, shouldIntercalate, polySide } =
    POLY_INFO[GRID_INFO.currentPoly];

  let j = getJFn(GRID_INFO.currentPoly, polySide, xSide)(x);
  j = Math.round(j + (GRID_INFO.jOffset || 0));
  let i = calcI(y, ySide, shouldIntercalate, !!(j % 2));
  i += GRID_INFO.iOffset || 0;

  return { i: Math.round(i), j: j };
};
