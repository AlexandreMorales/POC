/**
 * @typedef {Object} CellPos
 * @property {number} i
 * @property {number} j
 */

/**
 * @typedef {Object} Cell
 * @property {CellPos} pos
 * @property {number} value
 * @property {Cell} aboveCell
 * @property {import("./biomes").Block} block
 * @property {{ r: number, g: number, b: number }} color
 * @property {{ [k: number]: number[][] }} adjacentIndexes
 * @property {boolean} isInverted Only used for triangles
 * @property {{ [k: string]: Points }} dPos
 */

export const KNOWN_POLYGONS = {
  TRIANGLE: 3,
  SQUARE: 4,
  HEXAGON: 6,
};

export const knownPolys = Object.values(KNOWN_POLYGONS);

/**
 * @typedef {Object} MapInfo
 * @property {Cell} currentCell
 * @property {Cell[]} pickedCells
 * @property {{ [k: number]: number }} xOffset
 * @property {{ [k: number]: number }} yOffset
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} timeOfDay
 * @property {number} touchThreshold
 * @property {{ x: number, y: number, interval: Object }} touchPos
 */
export const MAP_INFO = /** @type {MapInfo} */ ({
  currentCell: null,
  pickedCells: [],
  xOffset: {},
  yOffset: {},
  iOffset: 0,
  jOffset: 0,
  timeOfDay: 0,
  touchThreshold: 25,
  touchPos: { x: 0, y: 0, interval: null },
});

/**
 * @typedef {Object} Points
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} PolyInfoProp
 * @property {number} polySide The length of the side of the polygon
 * @property {number} xSide The half of the horizontal length of the polygon
 * @property {number} ySide The half of the vertical length of the polygon
 * @property {Points[]} points List of point of the polygon
 * @property {Points[]} invertedPoints List of point of the polygon for inverted triangles
 * @property {number} bottomIndex
 * @property {number} rows
 * @property {number} columns
 * @property {number} canvasHeight
 * @property {number} canvasWidth
 */
export const POLY_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});
