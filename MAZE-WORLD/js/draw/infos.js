/**
 * @typedef {Object} Drawable
 * @property {import("../configs/infos.js").Point} point Point of where to draw
 * @property {import("../configs/infos.js").Point[]} points Points of the vertices
 * @property {import("../configs/infos.js").CellPos} pos
 * @property {import("../configs/infos.js").Color} color
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
