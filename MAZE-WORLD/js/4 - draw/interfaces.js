/**
 * @typedef {Object} Drawable
 * @property {Point} point Point of where to draw
 * @property {Point[]} points Points of the vertices
 * @property {Pos} pos
 * @property {Color} color
 * @property {boolean} isInverted Only used for triangles
 * @property {boolean} shoulApplyDark
 * @property {boolean} isSelectedCell
 */

/**
 * @typedef {Object} WallProps
 * @property {Drawable} topInfo Infos to how to draw the top of the wall
 * @property {boolean[]} borderMap Which points to draw a border
 */

/**
 * @typedef {Drawable & WallProps} Wall
 */
