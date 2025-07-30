import { KNOWN_POLYGONS } from "../0 - configs/configs.js";

/**
 * @typedef {Object} GridInfo
 * @property {number} currentPoly The number of sides of the current polygon
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} rotationTurns
 */
export const GRID_INFO = /** @type {GridInfo} */ ({
  currentPoly: KNOWN_POLYGONS.HEXAGON,
  iOffset: 0,
  jOffset: 0,
  rotationTurns: 0,
});
