import { KNOWN_POLYGONS } from "../configs/configs.js";

/**
 * @typedef {Object} MapInfo
 * @property {number} currentPoly The number of sides of the current polygon
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} rotationTurns
 * @property {number} timeOfDay
 */
export const MAP_INFO = /** @type {MapInfo} */ ({
  currentPoly: KNOWN_POLYGONS.HEXAGON,
  iOffset: 0,
  jOffset: 0,
  rotationTurns: 0,
  timeOfDay: 0,
});
