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
  velocity: 25,
  noiseResolution: 20,
  touchThreshold: 25,
  passTime: false,
};

export const CANVAS_CONFIG = {
  showPos: false,
  strokeColor: "black",
  lineWidth: 1,
  wallDarkness: 0.5,
};

export const ENTITIES_CONFIG = {
  notInvertedBothClipPath: "polygon(0 0, 50% 75%, 100% 0)",
  notInvertedRightClipPath: "polygon(0 0, 0 100%, 35% 100%, 100% 0)",
  notInvertedLeftClipPath: "polygon(0 0, 65% 100%, 100% 100%, 100% 0)",

  defaultSizeRatio: 2.5,
  wallSizeRatio: 2,
};

export const MOVEMENT = {
  UP: Symbol("UP"),
  DOWN: Symbol("DOWN"),
  LEFT: Symbol("LEFT"),
  RIGHT: Symbol("RIGHT"),
};
