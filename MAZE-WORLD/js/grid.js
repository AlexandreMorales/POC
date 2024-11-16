import { CONFIG } from "./configs.js";
import { POLI_INFO, KNOWN_POLYGONS, CIRCLE_INFO } from "./infos.js";
import { BIOMES } from "./biomes.js";
import { tweakColor, isCellInverted } from "./utils.js";

export const GRID = /** @type {import("./infos.js").Cell[][]} */ ([]);

/**
 * @param {number} i
 * @param {number} j
 * @param {number} value
 * @returns {import("./infos.js").Cell}
 */
export const createCell = (i, j, value) => {
  let cell = GRID[i][j];
  if (!cell) {
    cell = /** @type {import("./infos.js").Cell} */ ({});

    if (CONFIG.isMaze) {
      cell.visited = false;
      cell.solved = false;
      cell.path = false;
    }

    cell.pos = { i, j };

    cell.value = value;
    cell.type = Object.values(BIOMES.FOREST.ranges).find(
      (range) => value <= range.max
    );
    cell.color = tweakColor(cell.type?.color);
  }

  if (CONFIG.isMaze)
    cell.borders = [...new Array(CONFIG.poliSizes)].map(() => CONFIG.isMaze);
  cell.adjacentIndexes = getAdjacentIndexes(i, j);

  if (CONFIG.isCircle) createCircleCell(cell);
  else createPoliCell(cell);

  return cell;
};

/**
 * @param {import("./infos.js").Cell} cell
 */
const createPoliCell = (cell) => {
  const { i, j } = cell.pos;
  const triangleInfo = POLI_INFO[KNOWN_POLYGONS.TRIANGLE];
  const squareInfo = POLI_INFO[KNOWN_POLYGONS.SQUARE];
  const hexaInfo = POLI_INFO[KNOWN_POLYGONS.HEXAGON];

  cell.isInverted = isCellInverted(cell.pos);
  cell.dPos = {
    [KNOWN_POLYGONS.TRIANGLE]: {
      x: j * (triangleInfo.polySide / 2) + triangleInfo.xSide,
      y: i * triangleInfo.ySide * 2 + triangleInfo.ySide,
    },
    [KNOWN_POLYGONS.SQUARE]: {
      x: j * squareInfo.xSide * 2 + squareInfo.xSide,
      y: i * squareInfo.ySide * 2 + squareInfo.ySide,
    },
    [KNOWN_POLYGONS.HEXAGON]: {
      x: j * (hexaInfo.xSide + hexaInfo.polySide / 2) + hexaInfo.xSide,
      y: i * hexaInfo.ySide * 2 + hexaInfo.ySide,
    },
  };
};

/**
 * @param {number} offsetI
 * @param {number} offsetJ
 */
export const loadChunk = (offsetI, offsetJ) => {
  const perlin = CONFIG.isMaze
    ? []
    : getPerlinGrid(CONFIG.initialColumns, CONFIG.initialRows, 8);
  const rows = CONFIG.isMaze ? getRows() : CONFIG.initialRows;

  for (let i = 0; i < rows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    const numCells = CONFIG.isMaze
      ? getNumCellsPerRow(nI)
      : CONFIG.initialColumns;
    for (let j = 0; j < numCells; j++) {
      const nJ = j + offsetJ;
      GRID[nI][nJ] = createCell(nI, nJ, perlin?.[i]?.[j]);
    }
  }
};

/**
 * @returns {number}
 */
export const getRows = () =>
  CONFIG.isCircle ? CIRCLE_INFO.rows : POLI_INFO[CONFIG.poliSizes].rows;

/**
 * @param {number} rowIndex
 * @returns {number}
 */
export const getNumCellsPerRow = (rowIndex) =>
  CONFIG.isCircle
    ? CIRCLE_INFO.columns - Math.floor((rowIndex + 1) / 2)
    : POLI_INFO[CONFIG.poliSizes].columns;

/**
 * @param {number} width
 * @param {number} height
 * @param {number} resolution
 * @returns {number[][]}
 */
export const getPerlinGrid = (width, height, resolution) => {
  const vectors = getVectors(width, height, resolution);
  return getValues(width, height);

  function getVectors(width, height, resolution) {
    const numVectorsX = Math.floor(width / resolution) + 1;
    const extraVectorX = width % resolution == 0 ? 0 : 1;
    const finalNumVectorsX = numVectorsX + extraVectorX;

    const numVectorsY = Math.floor(height / resolution) + 1;
    const extraVectorY = height % resolution == 0 ? 0 : 1;
    const finalNumVectorsY = numVectorsY + extraVectorY;

    return new Array(finalNumVectorsY)
      .fill(0)
      .map(() => new Array(finalNumVectorsX).fill(0).map(getRandUnitVect));
  }

  function getRandUnitVect() {
    const theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  function getValues(width, height) {
    const values = [];

    for (let y = 0; y < height; y++) {
      values[y] = [];
      for (let x = 0; x < width; x++) {
        values[y][x] = getValue(x, y);
      }
    }
    return values;
  }

  function getValue(x, y) {
    const offset = 0.5 / resolution;

    x = x / resolution + offset;
    y = y / resolution + offset;

    const xF = Math.floor(x);
    const yF = Math.floor(y);

    const tlv = dotProduct(x, y, xF, yF);
    const trv = dotProduct(x, y, xF + 1, yF);
    const blv = dotProduct(x, y, xF, yF + 1);
    const brv = dotProduct(x, y, xF + 1, yF + 1);

    const lerpTop = lerp(tlv, trv, x - xF);
    const lerpBottom = lerp(blv, brv, x - xF);
    const value = lerp(lerpTop, lerpBottom, y - yF);

    return value;
  }

  function dotProduct(x, y, vx, vy) {
    const distVector = {
      x: x - vx,
      y: y - vy,
    };

    return dot(distVector, vectors[vy][vx]);
  }

  function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  function lerp(a, b, x) {
    return a + smootherstep(x) * (b - a);
  }

  function smootherstep(x) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }
};

/**
 * @param {number} i
 * @param {number} j
 * @returns {{ [k: number]: number[][] }}
 */
const getAdjacentIndexes = (i, j) => {
  return new Proxy(
    {
      [KNOWN_POLYGONS.TRIANGLE]: !isCellInverted({ i, j })
        ? [
            [i - 1, j],
            [i, j + 1],
            [i, j - 1],
          ]
        : [
            [i + 1, j],
            [i, j - 1],
            [i, j + 1],
          ],
      [KNOWN_POLYGONS.SQUARE]: [
        [i - 1, j],
        [i, j + 1],
        [i + 1, j],
        [i, j - 1],
      ],
      [KNOWN_POLYGONS.HEXAGON]:
        j % 2
          ? [
              [i - 1, j],
              [i, j + 1],
              [i + 1, j + 1],
              [i + 1, j],
              [i + 1, j - 1],
              [i, j - 1],
            ]
          : [
              [i - 1, j],
              [i - 1, j + 1],
              [i, j + 1],
              [i + 1, j],
              [i, j - 1],
              [i - 1, j - 1],
            ],
    },
    { get: (obj, prop) => obj[prop] || obj[KNOWN_POLYGONS.SQUARE] }
  );
};

/**
 * @param {import("./infos.js").Cell} cell
 */
const createCircleCell = (cell) => {
  const { i, j } = cell.pos;
  const radius = (CIRCLE_INFO.rows - i) * CONFIG.cellSize;
  const downCellRadius = radius - CONFIG.cellSize;

  const angle = Math.atan2(-radius, 0);
  const downCellAngle = Math.atan2(-downCellRadius, 0);

  const numCells = getNumCellsPerRow(i);

  const parts = (CIRCLE_INFO.circEnd - angle) / numCells;

  const beginTopAngle = angle + j * parts;
  const endTopAngle = angle + (j + 1) * parts;
  const beginBottomAngle = downCellAngle + (j + 1) * parts;
  const endBottomAngle = downCellAngle + j * parts;

  const [downCellX, downCellY] = getPoint(downCellRadius, beginBottomAngle);
  const [x, y] = getPoint(radius, beginTopAngle);
  const [x1, y1] = getPoint(radius, endTopAngle);
  const [x2, y2] = getPoint(downCellRadius, endBottomAngle);

  cell.dPos = { [CONFIG.poliSizes]: { x, y } };
  cell.pos = {
    i,
    j,
    x1,
    y1,
    x2,
    y2,
    radius,
    downCellRadius,
    beginTopAngle,
    endTopAngle,
    downCellX,
    downCellY,
    beginBottomAngle,
    endBottomAngle,
  };
  cell.adjacentIndexes = {
    [CONFIG.poliSizes]: cell.adjacentIndexes[CONFIG.poliSizes].map(
      ([ai, aj]) => [ai, aj < 0 ? numCells - 1 : aj >= numCells ? 0 : aj]
    ),
  };
};

const getPoint = (radius, angle) => [
  CIRCLE_INFO.centerX + Math.cos(angle) * radius,
  CIRCLE_INFO.centerY + Math.sin(angle) * radius,
];
