import { CONFIG, MAP_CONFIG } from "./configs.js";
import { POLY_INFO, KNOWN_POLYGONS } from "./infos.js";
import { BIOMES } from "./biomes.js";
import { tweakColor, isCellInverted, getRandomInt } from "./utils.js";

export const GRID = /** @type {import("./infos.js").Cell[][]} */ ([]);

/**
 * @param {number} i
 * @param {number} j
 * @param {number} value
 * @param {import("./biomes.js").Biome} biome
 * @returns {import("./infos.js").Cell}
 */
export const createCell = (i, j, value, biome) => {
  let cell = GRID[i][j];
  if (!cell) {
    cell = /** @type {import("./infos.js").Cell} */ ({});

    cell.pos = { i, j };

    cell.value = value;
    if (value) {
      const block = Object.values(biome.ranges).find((r) => value <= r.max);
      cell.block = block;
      cell.color = tweakColor(block.colorRGB);
    }
  }

  cell.adjacentIndexes = getAdjacentIndexes(i, j);
  cell.isInverted = isCellInverted(cell.pos);

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
 * @param {import("./biomes.js").Biome} [biome]
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
 * @param {import("./infos.js").Cell} cell
 * @param {import("./infos.js").CellBlock} wall
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
