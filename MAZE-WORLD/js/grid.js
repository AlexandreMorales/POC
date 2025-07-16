import { CONFIG, MAP_CONFIG, KNOWN_POLYGONS } from "./configs/configs.js";
import { POLY_INFO, MAP_INFO } from "./configs/infos.js";
import { BIOMES } from "./configs/biomes.js";
import {
  tweakColor,
  isCellInverted,
  getRandomInt,
  correctRoundError,
} from "./utils.js";
import { getPerlinGrid } from "./perlin.js";

export const GRID = /** @type {import("./configs/infos.js").Cell[][]} */ ([]);

/**
 * @param {number} i
 * @param {number} j
 * @param {number} value
 * @param {import("./configs/biomes.js").Block} block
 * @returns {import("./configs/infos.js").Cell}
 */
const createCell = (i, j, value, block) => {
  let cell = GRID[i][j];
  if (!cell) {
    cell = /** @type {import("./configs/infos.js").Cell} */ ({});

    cell.pos = { i, j };

    cell.value = value;
    if (value) {
      cell.block = block;
      cell.layer = block.layer;
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
  const blocks = Object.values(biome.ranges);
  const higherGroundBlock = [...blocks].reverse().find((r) => r.layer === 0);

  const rows = CONFIG.chunkRows;
  const columns = CONFIG.chunkColumns;
  const perlin = getPerlinGrid(columns, rows, MAP_CONFIG.noiseResolution);

  for (let i = 0; i < rows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    for (let j = 0; j < columns; j++) {
      const nJ = j + offsetJ;

      const value = perlin?.[i]?.[j];
      const originalBlock = blocks.find((r) => value <= r.max);
      const isHighBlock = originalBlock.layer > 0;
      const cellBlock = isHighBlock ? higherGroundBlock : originalBlock;

      const cell = createCell(nI, nJ, value, cellBlock);
      GRID[nI][nJ] = cell;

      if (isHighBlock)
        cell.wall = {
          block: originalBlock,
          color: tweakColor(originalBlock.colorRGB),
          value,
          layer: originalBlock.layer,
        };
    }
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
