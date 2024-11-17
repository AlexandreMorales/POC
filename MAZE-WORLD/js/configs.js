import { KNOWN_POLYGONS } from "./infos.js";

/**
 * @typedef {Object} Config
 * @property {number} initialRows
 * @property {number} initialColumns
 * @property {number} cellHeight
 * @property {number} polySides The number of sides of the current polygon
 *
 * @property {boolean} isCircle
 * @property {boolean} isMaze
 * @property {boolean} moveManually
 * @property {boolean} automaticRowsAndColumns
 * @property {boolean} showZoom
 */
export const CONFIG = /** @type {Config} */ ({
  initialRows: 10,
  initialColumns: 10,
  cellHeight: 17,
  polySides: KNOWN_POLYGONS.HEXAGON,

  isCircle: false,
  isMaze: false,
  moveManually: true,
  automaticRowsAndColumns: true,
  showZoom: false,
});

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 10,
};

export const CANVAS_CONFIG = {
  border: 1,
  showPos: false,
  strokeColor: "black",
  defaultColor: "white",
  visitedColor: "grey",
  pathColor: "green",
  currentColor: "cyan",
};

export const MAZE_CONFIG = {
  buildTime: 0,
  solveTime: 0,
  clearRandomCells: false,
};
