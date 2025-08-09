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

/**
 * @typedef {Object} RenderInfo
 * @property {number} currentPoly The number of sides of the current polygon
 * @property {number} cellHeight
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} rotationTurns
 */
