import { KNOWN_POLYGONS } from "./configs.js";

/**
 * @typedef {Object} PolyInfo
 * @property {number} currentPoly The number of sides of the current polygon
 * @property {number} cellHeight
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} rotationTurns
 */
export const POLY_INFO = /** @type {PolyInfo} */ ({
  currentPoly: KNOWN_POLYGONS.HEXAGON,
  cellHeight: 24,
  iOffset: 0,
  jOffset: 0,
  rotationTurns: 0,
});

export const POLYS_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});
