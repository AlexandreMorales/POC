import { KNOWN_POLYGONS } from "./infos.js";

/**
 * @typedef {Object} Config
 * @property {number} initialRows
 * @property {number} initialColumns
 * @property {number} cellHeight
 * @property {number} polySides The number of sides of the current polygon
 *
 * @property {boolean} isCircle
 * @property {boolean} moveManually
 * @property {boolean} automaticRowsAndColumns
 */
export const CONFIG = /** @type {Config} */ ({
  initialRows: 10,
  initialColumns: 10,
  cellHeight: 17,
  polySides: KNOWN_POLYGONS.HEXAGON,

  isCircle: false,
  moveManually: false,
  automaticRowsAndColumns: true,
});

export const CANVAS_CONFIG = {
  showPos: false,
  strokeColor: "black",
  defaultColor: "white",
  visitedColor: "grey",
  pathColor: "green",
  currentColor: "cyan",
};

export const MAZE_CONFIG = {
  buildTime: 1,
  solveTime: 1,
  clearRandomCells: false,
};
