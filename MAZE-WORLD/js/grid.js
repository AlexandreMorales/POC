import {
  CONFIG,
  KNOWN_POLYGONS,
  MAP_GENERATION,
  MENU_CONFIG,
} from "./configs/configs.js";
import { POLY_INFO, MAP_INFO } from "./configs/infos.js";
import { BIOMES } from "./configs/biomes.js";
import {
  tweakColor,
  isCellInverted,
  correctRoundError,
  getRange,
} from "./utils.js";
import { getValue, VECTORS } from "./perlin.js";

export let GRID = /** @type {import("./configs/infos.js").Cell[][]} */ ([]);

/**
 * @param {number} i
 * @param {number} j
 * @param {import("./configs/biomes.js").BlockEntity} block
 * @returns {import("./configs/infos.js").Cell}
 */
const createCell = (i, j, block) => {
  let cell = GRID[i]?.[j];
  if (!cell) {
    cell = /** @type {import("./configs/infos.js").Cell} */ ({});

    cell.pos = { i, j };

    if (block) {
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
 * @param {number} i
 * @param {number} j
 */
const getChunkStart = (i, j) => [
  getRange(i, CONFIG.chunkRows),
  getRange(j, CONFIG.chunkColumns),
];

/**
 * @param {number} initialI
 * @param {number} initialJ
 */
export const loadChunk = (initialI, initialJ) => {
  const [offsetI, offsetJ] = getChunkStart(initialI, initialJ);

  const { mapGeneration } = MENU_CONFIG;

  for (let i = 0; i < CONFIG.chunkRows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    for (let j = 0; j < CONFIG.chunkColumns; j++) {
      const nJ = j + offsetJ;

      let biome = /** @type {import("./configs/biomes.js").Biome} */ (null);
      switch (mapGeneration) {
        case MAP_GENERATION.MIX:
          const biomeValue = getValue(nI, nJ, VECTORS.BIOME);
          biome = BIOMES.find((b) => biomeValue <= b.maxValue);
          break;
        default:
        case MAP_GENERATION.DISTANCE:
          const distance = Math.sqrt(nI ** 2 + nJ ** 2);
          biome = BIOMES.find((b) => distance <= b.maxDistance);
          break;
      }

      const value = getValue(nI, nJ, VECTORS.BLOCK);
      const originalBlock = biome.ranges.find((r) => value <= r.max);
      const isHighBlock = originalBlock.layer > 0;
      const cellBlock = isHighBlock ? biome.higherGroundBlock : originalBlock;

      const cell = createCell(nI, nJ, cellBlock);
      GRID[nI][nJ] = cell;

      if (isHighBlock)
        cell.wall = {
          block: originalBlock,
          color: tweakColor(originalBlock.colorRGB),
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

/**
 * @param {number} i
 * @param {number} j
 * @returns {import("./configs/infos.js").Cell}
 */
export const getGridCell = (i, j) => {
  if (!GRID[i]?.[j]) loadChunk(i, j);
  return GRID[i][j];
};

/**
 * @returns {import("./configs/infos.js").Cell}
 */
export const getCenterCell = () => {
  const { rows, columns } = POLY_INFO[MAP_INFO.currentPoly];
  const middleRow = Math.floor(rows / 2);
  const middleColumn = Math.floor(columns / 2);
  return getGridCell(
    middleRow + MAP_INFO.iOffset,
    middleColumn + MAP_INFO.jOffset
  );
};

export const resetGrid = () => {
  GRID = [];
};

/**
 * @param {import("./configs/infos.js").Cell} cell
 * @param {import("./configs/biomes.js").BlockEntity} block
 * @param {import("./configs/biomes.js").Color} color
 */
export const placeBlock = (cell, block, color) => {
  if (cell.block && !cell.block.isFluid) {
    cell.wall = {
      block: block,
      color: color,
      layer: (cell.layer || 0) + 1,
    };
  } else {
    cell.block = block;
    cell.color = color;
  }
};
