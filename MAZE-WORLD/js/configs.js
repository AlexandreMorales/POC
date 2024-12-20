import { KNOWN_POLYGONS } from "./infos.js";

/**
 * @typedef {Object} Config
 * @property {number} chunkRows
 * @property {number} chunkColumns
 * @property {number} cellHeight
 * @property {number} polySides The number of sides of the current polygon
 * @property {number} minZoom
 * @property {number} maxZoom
 */
export const CONFIG = /** @type {Config} */ ({
  chunkRows: 100,
  chunkColumns: 100,
  cellHeight: 24,
  polySides: KNOWN_POLYGONS.HEXAGON,

  minZoom: 10,
  maxZoom: 120,
});

export const MAP_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 50,
  noiseResolution: 20,
  touchThreshold: 25,
  passTime: true,
};

export const CANVAS_CONFIG = {
  showPos: false,
  strokeColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

export const MOVEMENT = {
  UP: Symbol("UP"),
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
};
