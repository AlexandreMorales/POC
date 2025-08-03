import { getCell } from "../0 - grid/index.js";
import { getPolyInfo, MENU_CONFIG, POLY_INFO } from "../1 - polygones/index.js";

import { getMod, getPosDistance } from "../utils.js";
import { ENTITY_TYPES, MOVEMENT } from "./configs.js";
import {
  cellIsBlocked,
  createEntity,
  ENTITIES,
  moveEntityToCell,
  removeEntity,
} from "./entities.js";
import { ENTITY_INFO } from "./infos.js";
import { updateEntityImage } from "./render.js";

const ENTITY_ACTIONS_CONFIG = {
  delayToBurn: 1000,
};

const FIRE_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/enemies/fire.png",
  [MOVEMENT.DOWN]: "images/enemies/fire.png",
  [MOVEMENT.LEFT]: "images/enemies/fire.png",
  [MOVEMENT.RIGHT]: "images/enemies/fire.png",
});

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

  const aPos = cell.adjacentPos[POLY_INFO.currentPoly];
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
    if (!e.cell || e.deleted || !e.movementOptions?.speed) return;
    const { targets, speed } = e.movementOptions;

    if (targets) {
      const target = getClosestTarget(e);
      if (!target) return;
      let closestInfo = { cell: e.cell, index: 0 };
      for (let index = 0; index < speed; index++)
        closestInfo = getClosestCell(e, closestInfo.cell, target.cell);
      if (!closestInfo?.cell) return;
      let { cell, index } = closestInfo;
      if (cell === target.cell) return;

      index = getMod(index, POLY_INFO.currentPoly);
      updateEntityImage(e, indexToMove[index]);
      moveEntityToCell(e, cell);
    }
  });
};

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

    const fireEntity = createEntity(
      e.cell,
      e.id,
      ENTITY_TYPES.FIRE,
      FIRE_IMG_MAP,
      { zIndex: 3 }
    );
    e.connectedEntities[ENTITY_TYPES.FIRE] = fireEntity;
    e.deleted = true;

    entitiesToKill.push(e);
  });

  setTimeout(() => {
    entitiesToKill.forEach(removeEntity);
  }, ENTITY_ACTIONS_CONFIG.delayToBurn);
};

/**
 * @param {Cell} baseCell
 * @param {boolean} [useDiagonal]
 * @returns {{ moveToIndex: { [k: symbol]: number }, indexToMove: { [k: number]: symbol } }}
 */
export const getMovementMaps = (baseCell, useDiagonal) => {
  let topI = POLY_INFO.rotationTurns;
  let bottomI = topI + Math.floor(POLY_INFO.currentPoly / 2);

  let topLeftI = topI + POLY_INFO.currentPoly - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (getPolyInfo().hasInverted) {
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
 * @param {Cell} baseCell
 * @param {boolean} [useDiagonal]
 * @returns {{ [k: symbol]: number }}
 */
export const getMovementMap = (baseCell, useDiagonal) =>
  getMovementMaps(baseCell, useDiagonal).moveToIndex;
