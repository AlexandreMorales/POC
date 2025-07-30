/**
 * @typedef {Object} Drawable
 * @property {import("../0 - configs/infos.js").Point} point Point of where to draw
 * @property {import("../0 - configs/infos.js").Point[]} points Points of the vertices
 * @property {import("../0 - configs/infos.js").CellPos} pos
 * @property {import("../0 - configs/infos.js").Color} color
 * @property {boolean} isInverted Only used for triangles
 * @property {boolean} shoulApplyDark
 */

/**
 * @typedef {Object} WallProps
 * @property {Drawable} topInfo Infos to how to draw the top of the wall
 * @property {boolean[]} borderMap Which points to draw a border
 */

/**
 * @typedef {Drawable & WallProps} Wall
 */

/**
 * @typedef {Object} DrawInfo
 * @property {number} cellHeight
 * @property {number} timeOfDay
 */
export const DRAW_INFO = /** @type {DrawInfo} */ ({
  cellHeight: 24,
  timeOfDay: 0,
});
