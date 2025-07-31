/**
 * @typedef {Object} Color
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef {Object} Pos
 * @property {number} i
 * @property {number} j
 */

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Block
 * @property {Color} color
 * @property {number} layer
 * @property {boolean} [isFluid]
 */

/**
 * @typedef {Object} CellBlock
 * @property {Block} block
 * @property {Color} color
 */

/**
 * @typedef {Object} CellProps
 * @property {number} layer
 * @property {Pos} pos
 * @property {CellBlock} wall The block above this one
 * @property {{ [k: number]: Pos[] }} adjacentPos Pos of adjacent cells
 * @property {boolean} isInverted Only used for triangles
 * @property {string} entityType The type of the entity on top of the cell
 */

/**
 * @typedef {CellBlock & CellProps} Cell
 */

/**
 * @typedef {Object} PolyInfoProp
 * @property {number} polySide The length of the side of the polygon
 * @property {number} xSide The half of the horizontal length of the polygon
 * @property {number} ySide The half of the vertical length of the polygon
 * @property {Point[]} points List of points of the polygon
 * @property {Point[]} invertedPoints List of points of the polygon for inverted triangles
 * @property {Point[]} wallPoints List of points the wall
 * @property {Point[]} wallInvertedPoints List of points the wall for inverted triangles
 * @property {number} rows
 * @property {number} columns
 * @property {number} canvasHeight
 * @property {number} canvasWidth
 * @property {(j: number) => number} calcX Function to calculate the x from the j pos
 * @property {(i: number) => number} calcY Function to calculate the y from the i pos
 * @property {number} cx Center x of the canvas
 * @property {number} cy Center y of the canvas
 * @property {boolean} shouldIntercalate If the polygon should intercalate (up and down)
 * @property {boolean} hasInverted If the polygon has inverted positions
 */
export const POLY_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});
