/**
 * @typedef {Object} CellPos
 * @property {number} i
 * @property {number} j
 *
 * CIRCLE PROPERTY
 * @property {number} [x1]
 * @property {number} [y1]
 * @property {number} [x2]
 * @property {number} [y2]
 * @property {number} [radius]
 * @property {number} [downCellRadius]
 * @property {number} [beginTopAngle]
 * @property {number} [endTopAngle]
 * @property {number} [downCellX]
 * @property {number} [downCellY]
 * @property {number} [beginBottomAngle]
 * @property {number} [endBottomAngle]
 */

/**
 * @typedef {Object} Cell
 * @property {CellPos} pos
 * @property {{ [k: number]: number[][] }} adjacentIndexes
 * @property {boolean} isInverted Only used for triangles
 * @property {{ [k: string]: Points }} dPos
 * @property {boolean[]} borders
 * @property {boolean} visited Only used on the build state
 * @property {boolean} solved Only used on the build solve
 * @property {boolean} path Only used on the build solve
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
 */
export const MAP_INFO = /** @type {MapInfo} */ ({
  currentCell: null,
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

export const STATES = {
  build: Symbol("BUILD"),
  solve: Symbol("SOLVE"),
  show: Symbol("SHOW"),
};

export const MAZE_INFO = {
  state: STATES.build,
  queue: [],
};

export const CIRCLE_INFO = {
  centerX: 0,
  centerY: 0,
  circEnd: Math.PI * 1.5,
  rows: 0,
  columns: 0,
};

export const TIME = {
  startTime: new Date(),
  lastTime: new Date(),
};
