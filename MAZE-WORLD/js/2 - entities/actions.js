import { getCell } from "../0 - grid/index.js";
import {
  getPolyInfo,
  MENU_CONFIG,
  RENDER_INFO,
} from "../1 - polygones/index.js";

import { getMod, getPosDistance, getRandomInt } from "../_utils.js";
import { ENTITY_TYPES, MOVEMENT } from "./_configs.js";
import {
  cellIsBlocked,
  createEntity,
  ENTITIES,
  moveEntityToCell,
  removeEntity,
} from "./entities.js";
import { ENTITY_INFO } from "./_infos.js";
import { updateEntityImage, updateEntityOpacity } from "./render.js";

const ENTITY_ACTIONS_CONFIG = {
  delayToBurn: 1000,
};

/**
 * @param {Entity} entity
 * @return {Entity}
 */
const getClosestTarget = (entity) => {
  let minDistance = Infinity;
  let selectedTarget = /** @type {Entity} */ (null);

  ENTITIES.forEach((targetEntity) => {
    entity.movementOptions.targets.forEach((t) => {
      if (targetEntity.cell && targetEntity.type === t) {
        const distance = getPosDistance(entity.cell.pos, targetEntity.cell.pos);
        if (distance < minDistance) {
          selectedTarget = targetEntity;
          minDistance = distance;
        }
      }
    });
  });
  return selectedTarget;
};

/**
 * @param {Entity} entity
 * @param {Cell} cell
 * @param {Cell} targetCell
 * @return {{ cell: Cell, index: number }}
 */
const getClosestCell = (entity, cell, targetCell) => {
  let minDistance = Infinity;
  let selectedCell = /** @type {Cell} */ (null);
  let selectedIndex = 0;

  const aPos = cell.adjacentPos[RENDER_INFO.currentPoly];
  for (let index = 0; index < aPos.length; index++) {
    const pos = aPos[index];
    const aCell = getCell(pos);
    if (cellIsBlocked(aCell, entity)) continue;
    const distance = getPosDistance(aCell.pos, targetCell.pos);
    if (distance < minDistance) {
      selectedCell = aCell;
      selectedIndex = index;
      minDistance = distance;
    }
  }

  return { cell: selectedCell, index: selectedIndex };
};

/**
 * @param {Cell} baseCell
 */
export const moveEntities = (baseCell) => {
  const { indexToMove } = getMovementMaps(baseCell);

  ENTITIES.forEach((e) => {
    if (!e.cell || e.deleted) return;

    moveEntity(e, indexToMove);

    updateEntityOpacity(e);
  });
};

/**
 * @param {Entity} e
 * @param {{ [k: symbol]: number }} indexToMove
 */
const moveEntity = (e, indexToMove) => {
  if (!e.movementOptions?.speed) return;
  const { targets, speed, random } = e.movementOptions;

  let nextCell = e.cell;
  let nextIndex = 0;

  for (let index = 0; index < speed; index++) {
    if (targets) {
      const target = getClosestTarget(e);
      if (!target) return;
      const nextCellInfo = getClosestCell(e, nextCell, target.cell);
      nextCell = nextCellInfo.cell;
      nextIndex = nextCellInfo.index;
      if (!nextCell) return;
    } else if (random) {
      nextIndex = getRandomInt(RENDER_INFO.currentPoly);
      const aPos = nextCell.adjacentPos[RENDER_INFO.currentPoly];
      nextCell = getCell(aPos[nextIndex]);

      for (let i = 0; i < aPos.length; i++) {
        if (!cellIsBlocked(nextCell, e)) break;
        nextIndex = getMod(nextIndex + 1, RENDER_INFO.currentPoly);
        nextCell = getCell(aPos[nextIndex]);
      }
    }
  }

  if (cellIsBlocked(nextCell, e)) return;

  nextIndex = getMod(nextIndex, RENDER_INFO.currentPoly);
  updateEntityImage(e, indexToMove[nextIndex]);
  moveEntityToCell(e, nextCell);
};

/**
 * @param {CellProps} baseCell
 * @param {boolean} [useDiagonal]
 * @param {number} [rotationTurns]
 * @param {number} [currentPoly]
 * @param {boolean} [hasInverted]
 * @returns {{ moveToIndex: { [k: symbol]: number }, indexToMove: { [k: number]: symbol } }}
 */
const getMovementMaps = (
  baseCell,
  useDiagonal,
  rotationTurns,
  currentPoly,
  hasInverted
) => {
  currentPoly = currentPoly ?? RENDER_INFO.currentPoly;
  hasInverted = hasInverted ?? getPolyInfo().hasInverted;

  let topI = rotationTurns ?? RENDER_INFO.rotationTurns;
  let bottomI = topI + Math.floor(currentPoly / 2);

  let topLeftI = topI + currentPoly - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (hasInverted) {
    const isInverted = baseCell.isInverted;
    topLeftI = bottomLeftI = topI + (isInverted ? 1 : 2);
    topRightI = bottomRightI = topI + (isInverted ? 2 : 1);
    bottomI = isInverted ? topI : undefined;
    topI = isInverted ? undefined : topI;
  }

  return {
    moveToIndex: {
      [MOVEMENT.UP]: topI,
      [MOVEMENT.DOWN]: bottomI,
      [MOVEMENT.LEFT]: useDiagonal ? bottomLeftI : topLeftI,
      [MOVEMENT.RIGHT]: useDiagonal ? bottomRightI : topRightI,
    },
    indexToMove: {
      [topI]: MOVEMENT.UP,
      [bottomI]: MOVEMENT.DOWN,
      [bottomLeftI]: MOVEMENT.LEFT,
      [topLeftI]: MOVEMENT.LEFT,
      [bottomRightI]: MOVEMENT.RIGHT,
      [topRightI]: MOVEMENT.RIGHT,
    },
  };
};

/**
 * @param {CellProps} baseCell
 * @param {boolean} [useDiagonal]
 * @param {number} [rotationTurns]
 * @param {number} [currentPoly]
 * @param {boolean} [hasInverted]
 * @returns {{ [k: symbol]: number }}
 */
export const getMovementMap = (
  baseCell,
  useDiagonal,
  rotationTurns,
  currentPoly,
  hasInverted
) =>
  getMovementMaps(
    baseCell,
    useDiagonal,
    rotationTurns,
    currentPoly,
    hasInverted
  ).moveToIndex;

export const killEntitiesByTimeOfDay = () => {
  // If its raining the enemies wont burn
  if (MENU_CONFIG.rain) return;

  const entitiesToKill = /** @type {Entity[]} */ ([]);
  ENTITIES.forEach((e) => {
    if (
      !e.cell ||
      !e.minTime ||
      e.deleted ||
      e.minTime <= ENTITY_INFO.timeOfDay
    )
      return;

    const fireEntity = createEntity(e.cell, e.id, ENTITY_TYPES.FIRE, {
      zIndex: e.zIndex + 1,
    });
    e.connectedEntities[ENTITY_TYPES.FIRE] = fireEntity;
    e.deleted = true;

    entitiesToKill.push(e);
  });

  setTimeout(() => {
    entitiesToKill.forEach(removeEntity);
  }, ENTITY_ACTIONS_CONFIG.delayToBurn);
};
