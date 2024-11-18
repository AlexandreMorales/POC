import { CONFIG } from "./configs.js";
import { POLY_INFO, KNOWN_POLYGONS } from "./infos.js";
import { BIOMES } from "./biomes.js";
import { tweakColor, isCellInverted, getRandomInt } from "./utils.js";

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

    cell.pos = { i, j };

    cell.value = value;
    const block = Object.values(BIOMES.FOREST.ranges).find(
      (r) => value <= r.max
    );
    cell.block = block;
    cell.color = tweakColor(block.colorRGB);
  }

  cell.adjacentIndexes = getAdjacentIndexes(i, j);
  configCellPos(cell);

  return cell;
};

/**
 * @param {import("./infos.js").Cell} cell
 */
export const configCellPos = (cell) => {
  const { i, j } = cell.pos;
  const triangleInfo = POLY_INFO[KNOWN_POLYGONS.TRIANGLE];
  const squareInfo = POLY_INFO[KNOWN_POLYGONS.SQUARE];
  const hexaInfo = POLY_INFO[KNOWN_POLYGONS.HEXAGON];
  const y = i * triangleInfo.ySide * 2 + triangleInfo.ySide;

  cell.isInverted = isCellInverted(cell.pos);
  cell.dPos = new Proxy(
    {
      [KNOWN_POLYGONS.TRIANGLE]: {
        x: j * (triangleInfo.polySide / 2) + triangleInfo.xSide,
        y,
      },
      [KNOWN_POLYGONS.SQUARE]: {
        x: j * squareInfo.xSide * 2 + squareInfo.xSide,
        y,
      },
      [KNOWN_POLYGONS.HEXAGON]: {
        x: j * (hexaInfo.xSide + hexaInfo.polySide / 2) + hexaInfo.xSide,
        y,
      },
    },
    {
      get: (obj, prop) => {
        const polyInfo = POLY_INFO[prop];
        return (
          obj[prop] || {
            x: j * (polyInfo.xSide + polyInfo.polySide / 2) + polyInfo.xSide,
            y,
          }
        );
      },
    }
  );
};

/**
 * @param {number} offsetI
 * @param {number} offsetJ
 */
export const loadChunk = (offsetI, offsetJ) => {
  const perlin = getPerlinGrid(CONFIG.initialColumns, CONFIG.initialRows, 8);

  for (let i = 0; i < CONFIG.initialRows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    for (let j = 0; j < CONFIG.initialColumns; j++) {
      const nJ = j + offsetJ;
      GRID[nI][nJ] = createCell(nI, nJ, perlin?.[i]?.[j]);

      if (getRandomInt(20) === 0) {
        addWall(nI, nJ);
      }
    }
  }
};

/**
 * @param {number} i
 * @param {number} j
 */
const addWall = (i, j) => {
  const wall = GRID[i][j];
  wall.wall = {
    block: wall.block,
    color: wall.color,
    value: wall.value,
  };
};

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
