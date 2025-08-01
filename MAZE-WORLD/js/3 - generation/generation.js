import { addCell, getCell, INITIAL_POS } from "../0 - grid/index.js";
import {
  getPolyInfo,
  KNOWN_POLYGONS,
  MAP_GENERATION,
  MENU_CONFIG,
  POLY_INFO,
} from "../1 - polygones/index.js";
import {
  addEntity,
  ENTITY_INFO,
  PLAYER_ENTITY,
} from "../2 - entities/index.js";
import { getPosDistance, tweakColor } from "../utils.js";

import { GENERATION_CONFIG } from "./configs.js";
import { getChunkStart } from "./utils.js";
import { getValue, VECTORS } from "./perlin.js";
import { BIOMES } from "./biomes.js";

/**
 * @param {Pos} param
 * @returns {boolean}
 */
const isCellInverted = ({ i, j }) => (i + j) % 2 !== 0;

/**
 * @param {Pos} pos
 * @param {boolean} isInverted
 * @returns {{ [k: number]: Pos[] }}
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
 * @param {Pos} pos
 * @param {Block} block
 * @returns {Cell}
 */
const createCell = (pos, block) => {
  let cell = getCell(pos);
  if (!cell) {
    cell = /** @type {Cell} */ ({});

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
        POLY_INFO.currentPoly % 2 &&
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
 * @param {Cell} cell
 * @param {boolean} onMove
 */
const createEntitiesForCell = (cell, onMove = false) => {
  if (cell.block.spawnableEntities)
    cell.block.spawnableEntities.forEach((sEntity) => {
      const canSpawn = onMove ? sEntity.spawnOnMove : !sEntity.spawnOnMove;
      let probability = sEntity.probability;
      if (sEntity.increaseWithTime) probability *= ENTITY_INFO.timeOfDay / 2;
      if (canSpawn && Math.random() < probability)
        addEntity(sEntity.entityType, cell);
    });
};

/**
 * @param {Pos} pos
 * @returns {Biome}
 */
const getBiome = (pos) => {
  switch (MENU_CONFIG.mapGeneration) {
    case MAP_GENERATION.MIX:
      const biomeValue = getValue(pos.i, pos.j, VECTORS.BIOME);
      return BIOMES.find((b) => biomeValue <= b.maxValue);
    default:
    case MAP_GENERATION.DISTANCE:
      const distance = getPosDistance(INITIAL_POS, pos);
      return BIOMES.find((b) => distance <= b.maxDistance);
  }
};

/**
 * @param {Pos} initialPos
 */
export const loadChunk = (initialPos) => {
  const [offsetI, offsetJ] = getChunkStart(
    initialPos,
    GENERATION_CONFIG.chunkRows,
    GENERATION_CONFIG.chunkColumns
  );

  for (let i = 0; i < GENERATION_CONFIG.chunkRows; i++) {
    const nI = i + offsetI;
    for (let j = 0; j < GENERATION_CONFIG.chunkColumns; j++) {
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
      else createEntitiesForCell(cell);
    }
  }
};

/**
 * @param {Pos} pos
 * @returns {Cell}
 */
export const loadAndGetCell = (pos) => {
  if (!getCell(pos)) loadChunk(pos);
  return getCell(pos);
};

/**
 * @returns {Cell}
 */
export const getCenterCell = () => {
  const { rows, columns } = getPolyInfo();
  const { iOffset, jOffset } = POLY_INFO;
  const i = Math.floor(rows / 2) + iOffset;
  const j = Math.floor(columns / 2) + jOffset;
  return loadAndGetCell({ i, j });
};

/**
 * @param {Cell} baseCell
 * @returns {Cell[]}
 */
const getBorderCells = (baseCell) => {
  const { rows, columns } = getPolyInfo();
  const halfR = Math.floor(rows / 2);
  const halfC = Math.floor(columns / 2);
  const { i, j } = baseCell.pos;
  const tI = i - halfR;
  const bI = i + halfR;
  const lJ = j - halfC;
  const rJ = j + halfC;

  const positions = /** @type {Pos[]} */ ([]);

  for (let index = lJ; index <= rJ; index++) {
    positions.push({ i: tI, j: index });
    positions.push({ i: bI, j: index });
  }
  for (let index = tI; index <= bI; index++) {
    positions.push({ i: index, j: lJ });
    positions.push({ i: index, j: rJ });
  }

  return positions.map(getCell);
};

/**
 * @param {Cell} baseCell
 */
export const spawnEntities = (baseCell) => {
  getBorderCells(baseCell).forEach((cell) => {
    if (!!cell?.block && !cell.wall && !cell.entityType)
      createEntitiesForCell(cell, true);
  });
};
