import { KNOWN_POLYGONS } from "./infos.js";

/**
 * @typedef {Object} Config
 * @property {number} initialRows
 * @property {number} initialColumns
 * @property {number} cellHeight
 * @property {number} polySides The number of sides of the current polygon
 *
 * @property {boolean} moveManually
 * @property {boolean} automaticRowsAndColumns
 * @property {boolean} showZoom
 */
export const CONFIG = /** @type {Config} */ ({
  initialRows: 10,
  initialColumns: 10,
  cellHeight: 24,
  polySides: KNOWN_POLYGONS.HEXAGON,

  moveManually: true,
  automaticRowsAndColumns: true,
  showZoom: false,
});

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 10,
  canMove: true,
};

export const CANVAS_CONFIG = {
  showPos: false,
  strokeColor: "black",
  currentColor: "cyan",
};
