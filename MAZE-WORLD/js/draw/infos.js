/**
 * @typedef {Object} Wall
 * @property {import("../configs/infos").CellPos} pos
 * @property {boolean} isInverted Only used for triangles
 * @property {import("../configs/infos").Point} point Point of where to draw the wall
 * @property {import("../configs/infos").Point} topPoint Point of where to draw the top of the wall
 * @property {import("../configs/infos").Point[]} points Points of the wall
 * @property {import("../configs/infos").Point[]} topPoints Points of the top of the wall
 * @property {boolean[]} borderMap Which points to draw a border
 * @property {import("../configs/biomes").Color} color
 * @property {boolean} shoulApplyDark
 */

/**
 * @typedef {Object} Drawable
 * @property {import("../configs/infos.js").Point} point
 * @property {import("../configs/infos.js").Point[]} points
 * @property {import("../configs/infos.js").CellPos} pos
 * @property {import("../configs/biomes.js").Color} color
 * @property {boolean} isInverted
 * @property {boolean} shoulApplyDark
 */
