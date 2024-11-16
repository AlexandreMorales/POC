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
 * @property {number} value
 * @property {import("./biomes").Block} type
 * @property {string} color
 * @property {boolean[]} borders
 * @property {{ [k: number]: number[][] }} adjacentIndexes
 * @property {boolean} isInverted Only used for triangles
 * @property {{ [k: string]: { x: number, y: number } }} dPos
 *
 * MAZE PROPERTIES
 * @property {boolean} [visited] Only used for maze on the build state
 * @property {boolean} [solved] Only used for maze on the build solve
 * @property {boolean} [path] Only used for maze on the build solve
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
 * @property {{ [k: number]: number }} xOffset
 * @property {{ [k: number]: number }} yOffset
 * @property {number} iOffset
 * @property {number} jOffset
 * @property {number} timeOfDay
 */
export const MAP_INFO = /** @type {MapInfo} */ ({
  currentCell: null,
  xOffset: {},
  yOffset: {},
  iOffset: 0,
  jOffset: 0,
  timeOfDay: 0,
});

/**
 * @typedef {Object} PolyInfoProp
 * @property {number} polySide The length of the side of the polygon
 * @property {number} xSide The horizontal length of the polygon
 * @property {number} ySide The vertical length of the polygon
 * @property {{ x: number, y: number }[]} points List of point of the polygon
 * @property {{ x: number, y: number }[]} invertedPoints List of point of the polygon for inverted triangles
 * @property {number} bottomIndex
 * @property {number} rows
 * @property {number} columns
 * @property {number} canvasHeight
 * @property {number} canvasWidth
 */
export const POLI_INFO = /** @type {{ [k: number]: PolyInfoProp }} */ ({});

///// MAZE /////

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
