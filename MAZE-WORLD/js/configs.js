import { KNOWN_POLYGONS } from "./infos.js";

/**
 * @typedef {Object} Config
 * @property {number} chunkRows
 * @property {number} chunkColumns
 * @property {number} cellHeight
 * @property {number} polySides The number of sides of the current polygon
 */
export const CONFIG = /** @type {Config} */ ({
  chunkRows: 100,
  chunkColumns: 100,
  cellHeight: 24,
  polySides: KNOWN_POLYGONS.HEXAGON,
});

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 10,
  noiseResolution: 20,
  touchThreshold: 25,
};

export const CANVAS_CONFIG = {
  showPos: false,
  strokeColor: "black",
  currentColor: "cyan",
  wallDarkness: 2,
};
