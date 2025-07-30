import {
  CONFIG,
  KNOWN_POLYGONS,
  MAP_GENERATION,
  MENU_CONFIG,
} from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { tweakColor } from "../1 - utils/utils.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { GRID } from "../2 - grid/grid.js";

import { getChunkStart } from "./utils.js";
import { getValue, VECTORS } from "./perlin.js";
import { BIOMES } from "./biomes.js";

/**
 * @param {import("../0 - configs/infos.js").CellPos} pos
 * @param {boolean} isInverted
 * @returns {{ [k: number]: import("../0 - configs/infos.js").CellPos[] }}
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
 * @param {number} i
 * @param {number} j
 * @param {import("../0 - configs/infos.js").Block} block
 * @returns {import("../0 - configs/infos.js").Cell}
 */
const createCell = (i, j, block) => {
  let cell = GRID[i]?.[j];
  if (!cell) {
    cell = /** @type {import("../0 - configs/infos.js").Cell} */ ({});

    cell.pos = { i, j };
    cell.entityName = null;

    if (block) {
      cell.block = block;
      cell.layer = block.layer;
      cell.color = tweakColor(block.colorRGB);
    }
  }

  cell.isInverted = (i + j) % 2 !== 0;
  cell.adjacentPos = getAdjacentPos(cell.pos, cell.isInverted);

  return cell;
};

/**
 * @param {number} initialI
 * @param {number} initialJ
 */
export const loadChunk = (initialI, initialJ) => {
  const [offsetI, offsetJ] = getChunkStart(
    initialI,
    initialJ,
    CONFIG.chunkRows,
    CONFIG.chunkColumns
  );

  const { mapGeneration } = MENU_CONFIG;

  for (let i = 0; i < CONFIG.chunkRows; i++) {
    const nI = i + offsetI;
    GRID[nI] = GRID[nI] || [];
    for (let j = 0; j < CONFIG.chunkColumns; j++) {
      const nJ = j + offsetJ;

      let biome = /** @type {import("./biomes.js").Biome} */ (null);
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
        };
    }
  }
};

/**
 * @param {number} i
 * @param {number} j
 * @returns {import("../0 - configs/infos.js").Cell}
 */
export const getGridCell = (i, j) => {
  if (!GRID[i]?.[j]) loadChunk(i, j);
  return GRID[i][j];
};

/**
 * @returns {import("../0 - configs/infos.js").Cell}
 */
export const getCenterCell = () => {
  const { rows, columns } = POLY_INFO[GRID_INFO.currentPoly];
  const { iOffset, jOffset } = GRID_INFO;
  const middleRow = Math.floor(rows / 2);
  const middleColumn = Math.floor(columns / 2);
  return getGridCell(middleRow + iOffset, middleColumn + jOffset);
};
