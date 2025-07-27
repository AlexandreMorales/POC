import { KNOWN_POLYGONS } from "./configs.js";

/**
 * @typedef {Object} CellPos
 * @property {number} i
 * @property {number} j
 */

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} CellBlock
 * @property {number} value
 * @property {import("./biomes").BlockEntity} block
 * @property {import("./biomes").Color} color
 * @property {number} layer
 */

/**
 * @typedef {Object} CellProps
 * @property {CellPos} pos
 * @property {CellBlock} wall The block above this one
 * @property {{ [k: number]: CellPos[] }} adjacentPos Pos of adjacent cells
 * @property {boolean} isInverted Only used for triangles
 */

/**
 * @typedef {CellBlock & CellProps} Cell
 */

/**
 * @typedef {Object} Wall
 * @property {CellPos} pos
 * @property {boolean} isInverted Only used for triangles
 * @property {Point} point Point of where to draw the wall
 * @property {Point} topPoint Point of where to draw the top of the wall
 * @property {Point[]} points Points of the wall
 * @property {Point[]} topPoints Points of the top of the wall
 * @property {boolean[]} borderMap Which points to draw a border
 * @property {import("./biomes").Color} color
 */

/**
 * @typedef {Object} MapInfo
 * @property {number} currentPoly The number of sides of the current polygon
 * @property {Cell} currentCell
 * @property {number} selectedCellIndex Cell in which the player can interact
 * @property {CellBlock[]} pickedCells Cells that the play dug
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} rotationTurns
 * @property {number} timeOfDay
 */
export const MAP_INFO = /** @type {MapInfo} */ ({
  currentPoly: KNOWN_POLYGONS.HEXAGON,
  currentCell: null,
  selectedCellIndex: 0,
  pickedCells: [],
  iOffset: 0,
  jOffset: 0,
  rotationTurns: 0,
  timeOfDay: 0,
});

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
