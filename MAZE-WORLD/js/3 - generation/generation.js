import { addCell, getCell, INITIAL_POS } from "../0 - grid/index.js";
import {
  getPolyInfo,
  KNOWN_POLYGONS,
  MAP_GENERATION,
  MENU_CONFIG,
  RENDER_INFO,
} from "../1 - polygones/index.js";
import { spawnEntity, ENTITY_INFO } from "../2 - entities/index.js";
import { getPosDistance, tweakColor } from "../_utils.js";

import { GENERATION_CONFIG } from "./_configs.js";
import { getChunkStart } from "./_utils.js";
import { getValue, PERLIN_VECTORS } from "./perlin.js";
import {
  addBiomeToMap,
  BIOMES,
  createMinesObj,
  MINE_BIOMES,
} from "./biomes/index.js";

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
 * @param {boolean} isInverted
 * @returns {{ [k: number]: Pos[] }}
 */
const getAdjacentPosWithCorners = ({ i, j }, isInverted) => {
  return {
    ...getAdjacentPos({ i, j }, isInverted),
    [KNOWN_POLYGONS.SQUARE]: [
      { i: i - 1, j: j - 1 },
      { i: i - 1, j },
      { i: i - 1, j: j + 1 },
      { i, j: j + 1 },
      { i: i + 1, j: j + 1 },
      { i: i + 1, j },
      { i: i + 1, j: j - 1 },
      { i, j: j - 1 },
    ],
  };
};

/**
 * @param {Pos} pos
 * @returns {CellProps}
 */
export const createCellProps = (pos) => {
  const isInverted = isCellInverted(pos);
  return {
    pos,
    isInverted,
    adjacentPos: getAdjacentPos(pos, isInverted),
    adjacentPosWithCorners: getAdjacentPosWithCorners(pos, isInverted),
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

    cell.entityType = null;

    if (block) {
      cell.block = block;
      cell.layer = block.layer;
      cell.color = block.staticColor ? block.color : tweakColor(block.color);
    }
  }

  return { ...createCellProps(pos), ...cell };
};

/**
 * @param {Cell} cell
 * @param {boolean} onMove
 */
const createEntitiesForCell = (cell, onMove = false) => {
  if (!cell.block.spawnableEntities?.length) return;
  for (const sEntity of cell.block.spawnableEntities) {
    const canSpawn = onMove ? sEntity.spawnOnMove : !sEntity.spawnOnMove;
    if (!canSpawn) continue;
    let probability = sEntity.probability;
    if (sEntity.increaseWithTime) probability *= ENTITY_INFO.timeOfDay / 2;
    if (Math.random() < probability) {
      spawnEntity(sEntity.entityType, cell);
      return;
    }
  }
};

/**
 * @param {Pos} pos
 * @returns {Biome}
 */
const getBiome = (pos) => {
  switch (MENU_CONFIG.mapGeneration) {
    case MAP_GENERATION.MIX:
      const biomeValue = getValue(pos.i, pos.j, PERLIN_VECTORS.BIOME);
      return BIOMES.find((b) => biomeValue >= b.minValue);
    default:
    case MAP_GENERATION.DISTANCE:
      const distance = getPosDistance(INITIAL_POS, pos);
      return BIOMES.filter(
        (b) =>
          (b.negativeJ === undefined || b.negativeJ === pos.j < 0) &&
          (b.negativeI === undefined || b.negativeI === pos.i < 0)
      ).find((b) => distance >= b.minDistance);
  }
};

/**
 * @param {Pos} initialPos
 */
const loadChunk = (initialPos) => {
  const offsetPos = getChunkStart(
    initialPos,
    GENERATION_CONFIG.chunkSize,
    GENERATION_CONFIG.chunkSize
  );

  const biomeMap = /** @type {{ [k: string]: number }} */ ({});
  let minesObj = /** @type {MinesObj} */ (null);

  if (offsetPos.i === 100 && offsetPos.j === 100) minesObj = createMinesObj();

  for (let i = 0; i < GENERATION_CONFIG.chunkSize; i++) {
    const nI = i + offsetPos.i;
    for (let j = 0; j < GENERATION_CONFIG.chunkSize; j++) {
      const nJ = j + offsetPos.j;
      const pos = { i: nI, j: nJ };

      const biome = minesObj ? MINE_BIOMES.MINES : getBiome(pos);
      biomeMap[biome.name] = (biomeMap[biome.name] || 0) + 1;
      const value = getValue(nI, nJ, PERLIN_VECTORS.BLOCK);
      const originalBlock = biome.ranges.find((r) => value <= r.max);
      const isHighBlock = originalBlock.layer > 0;
      const cellBlock = isHighBlock ? biome.higherGroundBlock : originalBlock;

      const cell = createCell(pos, cellBlock);
      if (minesObj) cell.hasBomb = minesObj.isBomb({ i, j });
      addCell(pos, cell);

      if (isHighBlock)
        cell.wall = {
          block: originalBlock,
          color: originalBlock.staticColor
            ? originalBlock.color
            : tweakColor(originalBlock.color),
        };
      else createEntitiesForCell(cell);
    }
  }

  // chose biome with the most block count in the chunk
  const biomeName = Object.entries(biomeMap).sort(
    ([_, a], [__, b]) => b - a
  )[0][0];
  addBiomeToMap(
    offsetPos,
    BIOMES.find((b) => b.name === biomeName)
  );
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
  const { iOffset, jOffset } = RENDER_INFO;
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

/**
 * @param {Cell} cell
 */
export const destroyWall = (cell) => {
  const onDestroy = cell.wall?.block?.onDestroy;

  if (cell.wall) {
    cell.wall = null;
  }

  if (onDestroy) onDestroy(cell);
};
