import {
  CONFIG,
  KNOWN_POLYGONS,
  MAP_GENERATION,
  MENU_CONFIG,
} from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { tweakColor } from "../1 - utils/utils.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { addCell, getCell } from "../2 - grid/grid.js";
import { ENTITY_TYPES } from "../3 - entities/infos.js";
import { PLAYER_ENTITY } from "../3 - entities/player.js";
import { addTree } from "../3 - entities/tree.js";

import { getChunkStart } from "./utils.js";
import { getValue, VECTORS } from "./perlin.js";
import { BIOMES } from "./biomes.js";

/**
 * @param {import("../0 - configs/infos").Pos} param
 * @returns {boolean}
 */
export const isCellInverted = ({ i, j }) => (i + j) % 2 !== 0;

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @param {boolean} isInverted
 * @returns {{ [k: number]: import("../0 - configs/infos.js").Pos[] }}
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
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @param {import("../0 - configs/infos.js").Block} block
 * @returns {import("../0 - configs/infos.js").Cell}
 */
const createCell = (pos, block) => {
  let cell = getCell(pos);
  if (!cell) {
    cell = /** @type {import("../0 - configs/infos.js").Cell} */ ({});

    cell.pos = pos;
    cell.entityType = null;

    if (block) {
      cell.block = block;
      cell.layer = block.layer;
      cell.color = tweakColor(block.color);
    }
  }

  cell.isInverted = isCellInverted(cell.pos);
  cell.adjacentPos = getAdjacentPos(cell.pos, cell.isInverted);

  return new Proxy(cell, {
    get(target, prop, receiver) {
      if (
        MENU_CONFIG.keepTrianglePosition &&
        GRID_INFO.currentPoly % 2 &&
        PLAYER_ENTITY.cell &&
        (prop === "isInverted" || prop === "adjacentPos")
      ) {
        const isPlayerInverted = isCellInverted(PLAYER_ENTITY.cell.pos);
        const newIsInverted = isPlayerInverted
          ? !cell.isInverted
          : cell.isInverted;
        if (prop === "isInverted") return newIsInverted;
        if (prop === "adjacentPos")
          return getAdjacentPos(cell.pos, newIsInverted);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
};

/**
 * @param {import("./biomes.js").BlockEntity} block
 * @param {import("../0 - configs/infos.js").Cell} cell
 */
const createEntitiesForBlock = (block, cell) => {
  if (block.spawnableEntities)
    block.spawnableEntities.forEach((sEntity) => {
      if (Math.random() < sEntity.probability)
        switch (sEntity.entityType) {
          default:
          case ENTITY_TYPES.TREE:
            addTree(cell);
            break;
        }
    });
};

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @returns {import("./biomes.js").Biome}
 */
const getBiome = (pos) => {
  switch (MENU_CONFIG.mapGeneration) {
    case MAP_GENERATION.MIX:
      const biomeValue = getValue(pos.i, pos.j, VECTORS.BIOME);
      return BIOMES.find((b) => biomeValue <= b.maxValue);
    default:
    case MAP_GENERATION.DISTANCE:
      const distance = Math.sqrt(pos.i ** 2 + pos.j ** 2);
      return BIOMES.find((b) => distance <= b.maxDistance);
  }
};

/**
 * @param {import("../0 - configs/infos.js").Pos} initialPos
 */
export const loadChunk = (initialPos) => {
  const [offsetI, offsetJ] = getChunkStart(
    initialPos,
    CONFIG.chunkRows,
    CONFIG.chunkColumns
  );

  for (let i = 0; i < CONFIG.chunkRows; i++) {
    const nI = i + offsetI;
    for (let j = 0; j < CONFIG.chunkColumns; j++) {
      const nJ = j + offsetJ;
      const pos = { i: nI, j: nJ };

      const biome = getBiome(pos);
      const value = getValue(nI, nJ, VECTORS.BLOCK);
      const originalBlock = biome.ranges.find((r) => value <= r.max);
      const isHighBlock = originalBlock.layer > 0;
      const cellBlock = isHighBlock ? biome.higherGroundBlock : originalBlock;

      const cell = createCell(pos, cellBlock);
      addCell(pos, cell);

      if (isHighBlock)
        cell.wall = {
          block: originalBlock,
          color: tweakColor(originalBlock.color),
        };

      createEntitiesForBlock(originalBlock, cell);
    }
  }
};

/**
 * @param {import("../0 - configs/infos.js").Pos} pos
 * @returns {import("../0 - configs/infos.js").Cell}
 */
export const getGridCell = (pos) => {
  if (!getCell(pos)) loadChunk(pos);
  return getCell(pos);
};

/**
 * @returns {import("../0 - configs/infos.js").Cell}
 */
export const getCenterCell = () => {
  const { rows, columns } = POLY_INFO[GRID_INFO.currentPoly];
  const { iOffset, jOffset } = GRID_INFO;
  const i = Math.floor(rows / 2) + iOffset;
  const j = Math.floor(columns / 2) + jOffset;
  return getGridCell({ i, j });
};
