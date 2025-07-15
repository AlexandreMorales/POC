import { CONFIG, MAP_CONFIG, KNOWN_POLYGONS } from "./configs/configs.js";
import { POLY_INFO, MAP_INFO } from "./configs/infos.js";
import { BIOMES } from "./configs/biomes.js";
import {
  tweakColor,
  isCellInverted,
  getRandomInt,
  correctRoundError,
} from "./utils.js";

export const GRID = /** @type {import("./configs/infos.js").Cell[][]} */ ([]);

/**
 * @param {number} i
 * @param {number} j
 * @param {number} value
 * @param {import("./configs/biomes.js").Biome} biome
 * @returns {import("./configs/infos.js").Cell}
 */
export const createCell = (i, j, value, biome) => {
  let cell = GRID[i][j];
  if (!cell) {
    cell = /** @type {import("./configs/infos.js").Cell} */ ({});

    cell.pos = { i, j };

    cell.value = value;
    if (value) {
      const block = Object.values(biome.ranges).find((r) => value <= r.max);
      cell.block = block;
      cell.color = tweakColor(block.colorRGB);
    }
  }

  cell.isInverted = isCellInverted(cell.pos);
  cell.adjacentPos = getAdjacentPos(cell.pos, cell.isInverted);

  return cell;
};

/**
 * @param {number} n
 * @param {number} range
 */
const getRange = (n, range) => Math.floor(n / range) * range;

/**
 * @param {number} i
 * @param {number} j
 */
const getChunkStart = (i, j) => [
  getRange(i, CONFIG.chunkRows),
  getRange(j, CONFIG.chunkColumns),
];

/**
 * @param {number} i
 * @param {number} j
 * @param {import("./configs/biomes.js").Biome} [biome]
 */
export const loadChunk = (i, j, biome) => {
  const [offsetI, offsetJ] = getChunkStart(i, j);
  const biomeKeys = Object.keys(BIOMES);
  biome = biome || BIOMES[biomeKeys[getRandomInt(biomeKeys.length)]];

  const rows = CONFIG.chunkRows;
  const columns = CONFIG.chunkColumns;
  const perlin = getPerlinGrid(columns, rows, MAP_CONFIG.noiseResolution);

  for (let i = 0; i < rows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    for (let j = 0; j < columns; j++) {
      const nJ = j + offsetJ;
      const value = perlin?.[i]?.[j];
      const cell = createCell(nI, nJ, value, biome);
      GRID[nI][nJ] = cell;

      if (value > 0.4) addWall(cell, cell);
    }
  }
};

/**
 * @param {import("./configs/infos.js").Cell} cell
 * @param {import("./configs/infos.js").CellBlock} wall
 */
export const addWall = (cell, wall) => {
  cell.wall = wall?.value
    ? {
        block: wall.block,
        color: wall.color,
        value: wall.value,
      }
    : null;
};

/**
 * @param {number} width
 * @param {number} height
 * @param {number} resolution
 * @returns {number[][]}
 */
const getPerlinGrid = (width, height, resolution) => {
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
 * @param {import("./configs/infos.js").CellPos} pos
 * @param {boolean} isInverted
 * @returns {{ [k: number]: import("./configs/infos.js").CellPos[] }}
 */
const getAdjacentPos = ({ i, j }, isInverted) => {
  return {
    [KNOWN_POLYGONS.TRIANGLE]: isInverted
      ? [
          { i: i + 1, j },
          { i, j: j - 1 },
          { i, j: j + 1 },
        ]
      : [
          { i: i - 1, j },
          { i, j: j + 1 },
          { i, j: j - 1 },
        ],
    [KNOWN_POLYGONS.SQUARE]: [
      { i: i - 1, j },
      { i, j: j + 1 },
      { i: i + 1, j },
      { i, j: j - 1 },
    ],
    [KNOWN_POLYGONS.HEXAGON]:
      j % 2
        ? [
            { i: i - 1, j },
            { i, j: j + 1 },
            { i: i + 1, j: j + 1 },
            { i: i + 1, j },
            { i: i + 1, j: j - 1 },
            { i, j: j - 1 },
          ]
        : [
            { i: i - 1, j },
            { i: i - 1, j: j + 1 },
            { i, j: j + 1 },
            { i: i + 1, j },
            { i, j: j - 1 },
            { i: i - 1, j: j - 1 },
          ],
  };
};

/**
 * @param {import("./configs/infos.js").CellPos} pos
 * @param {boolean} isInverted
 * @return {import("./configs/infos.js").Point}
 */
export const calculatePointBasedOnPos = ({ i, j }, isInverted) => {
  const { calcX, calcY, ySide, shouldIntercalate } =
    POLY_INFO[MAP_INFO.currentPoly];
  i -= MAP_INFO.iOffset || 0;
  j -= MAP_INFO.jOffset || 0;

  let x = calcX(j);
  let y = calcY(i);

  if (shouldIntercalate && j % 2)
    y += MAP_INFO.currentCell.pos.j % 2 ? -ySide : ySide;

  return applyRotation({ x, y }, isInverted);
};

/**
 * @param {import("./configs/infos.js").Point} points
 * @param {boolean} isInverted
 * @return {import("./configs/infos.js").Point}
 */
const applyRotation = ({ x, y }, isInverted) => {
  if (!MAP_INFO.rotationTurns) return { x, y };

  const { cx, cy, ySide, xSide, hasInverted } = POLY_INFO[MAP_INFO.currentPoly];

  const angle = (360 / MAP_INFO.currentPoly) * MAP_INFO.rotationTurns;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let nx = correctRoundError(cos * (x - cx) + sin * (y - cy) + cx);
  let ny = correctRoundError(cos * (y - cy) - sin * (x - cx) + cy);

  if (hasInverted && isInverted !== MAP_INFO.currentCell.isInverted && angle) {
    const oddTurn = !!(MAP_INFO.rotationTurns % 2);
    ny += ySide * (MAP_INFO.currentCell.isInverted ? 1 : -1);
    nx += (xSide / 2) * (MAP_INFO.currentCell.isInverted === oddTurn ? -1 : 1);
  }

  return { x: nx, y: ny };
};
