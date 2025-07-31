import { getCell } from "../0 - grid/index.js";
import {
  getPolyInfo,
  KNOWN_POLYGONS,
  MENU_CONFIG,
  POLY_INFO,
} from "../1 - polygones/index.js";
import { PLAYER_ENTITY } from "../2 - entities/index.js";
import { BLOCKS } from "../3 - generation/index.js";
import { drawEveryCell } from "../4 - draw/index.js";
import { placeBlock } from "../5 - actions/index.js";

const canvasContainer = document.getElementById("canvas-container");

canvasContainer.onclick = (e) => {
  if (!MENU_CONFIG.debugMode || POLY_INFO.rotationTurns) return;
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
 * @param {Point} pos
 * @return {Pos}
 */
const calculatePosBasedOnPoint = ({ x, y }) => {
  const { xSide, ySide, shouldIntercalate, polySide } = getPolyInfo();

  let j = getJFn(POLY_INFO.currentPoly, polySide, xSide)(x);
  j = Math.round(j + (POLY_INFO.jOffset || 0));
  let i = calcI(y, ySide, shouldIntercalate, !!(j % 2));
  i += POLY_INFO.iOffset || 0;

  return { i: Math.round(i), j: j };
};
