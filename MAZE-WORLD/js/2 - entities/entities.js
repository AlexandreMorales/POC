import { getCell } from "../0 - grid/index.js";
import { MENU_CONFIG, getPosByIndex } from "../1 - polygones/index.js";

import { ENTITY_TYPES, IMG_MAP_TYPES, MOVEMENT } from "./_configs.js";
import { ENTITY_INFO } from "./_infos.js";
import {
  createEntityImage,
  cutEntityImage,
  displayWinAnimation,
  removeEntityImage,
  setEntitySize,
  updateEntityImage,
  updateEntityPoint,
} from "./render.js";

export const ENTITIES = /** @type {Set<Entity>} */ (new Set());

/**
 * @param {Entity} entity
 */
export const addEntity = (entity) => ENTITIES.add(entity);

/**
 * @param {Entity} entity
 * @param {Cell} cell
 */
export const moveEntityToCell = (entity, cell) => {
  if (!cell) return;
  const previousType = entity.cell?.entityType || cell.entityType;
  if (entity.cell) entity.cell.entityType = null;
  entity.cell = cell;
  entity.cell.entityType = previousType || entity.type;
  updateEntityPoint(entity);

  if (entity.connectedEntities)
    Object.values(entity.connectedEntities).forEach((e) =>
      moveEntityToCell(e, cell)
    );
};

/**
 * @param {Entity} entity
 */
export const removeEntity = (entity) => {
  entity.cell.entityType = null;
  removeEntityImage(entity);
  ENTITIES.delete(entity);

  if (entity.connectedEntities)
    Object.values(entity.connectedEntities).forEach(removeEntity);
};

/**
 * @param {Cell} cell
 * @returns {Entity[]}
 */
export const removeEntitiesFromCell = (cell) => {
  const removedEntities = /** @type {Entity[]} */ ([]);
  ENTITIES.forEach((entity) => {
    if (entity.cell === cell) {
      removeEntity(entity);
      removedEntities.push(entity);
    }
  });
  return removedEntities;
};

/**
 * @param {Cell} cell
 * @param {string} id
 * @param {string} type
 * @param {Partial<Entity>} entityParams
 * @returns {Entity}
 */
export const createEntity = (cell, id, type, entityParams = {}) => {
  if (entityParams.minTime && ENTITY_INFO.timeOfDay < entityParams.minTime)
    return;

  const entity = /** @type {Entity} */ ({
    id: `${type}_${id}`,
    type,
    connectedEntities: {},
    currentImgType: cell.block?.biomeType,
    ...entityParams,
  });
  createEntityImage(entity);
  moveEntityToCell(entity, cell);
  addEntity(entity);
  return entity;
};

export const setEntitiesSize = () => ENTITIES.forEach((e) => setEntitySize(e));

export const removeGeneratedEntities = () =>
  ENTITIES.forEach((e) => e.isGenerated && removeEntity(e));

export const updateEntities = () =>
  ENTITIES.forEach((e) => updateEntityPoint(e));

/**
 * @param {Cell} cell
 * @param {Entity} entity
 * @returns {boolean}
 */
export const cellIsBlocked = (cell, entity) =>
  !MENU_CONFIG.debugMode &&
  (!cell ||
    !cell.block ||
    !!cell.wall ||
    !!cell.entityType ||
    (entity.connectedEntities[ENTITY_TYPES.BOAT]
      ? !cell.block.isFluid
      : cell.block.isFluid));

/**
 * @param {Entity} entity
 * @returns {Cell}
 */
export const getSelectedCell = (entity) =>
  getCell(getPosByIndex(entity.cell, entity.selectedCellIndex));

/**
 * @param {Entity} entity
 * @param {symbol} direction
 */
export const updateEntityDirection = (entity, direction) => {
  updateEntityImage(entity, direction);
  Object.values(entity.connectedEntities).forEach((e) => {
    updateEntityImage(e, MOVEMENT.RIGHT);
  });
};

/**
 * @param {Entity} entity
 */
export const makeEntityUse = (entity) => {
  updateEntityImage(entity, entity.currentDirection, IMG_MAP_TYPES.USING);
  setTimeout(() => {
    updateEntityImage(entity, entity.currentDirection);
  }, 250);
};

/**
 * @param {Entity} entity
 * @param {Pos} itemPos
 */
export const makeEntityWin = (entity, itemPos) => {
  updateEntityImage(entity, entity.currentDirection, IMG_MAP_TYPES.WINNING);
  const callback = displayWinAnimation(entity, itemPos);
  setTimeout(() => {
    updateEntityImage(entity, entity.currentDirection);
    callback();
  }, 1000);
};

/**
 * @param {Entity} entity
 */
export const makeEntityLose = (entity) => {
  updateEntityImage(entity, entity.currentDirection, IMG_MAP_TYPES.LOSING);
  setTimeout(() => {
    updateEntityImage(entity, entity.currentDirection);
  }, 1000);
};

/**
 * @param {Entity} entity
 * @param {symbol} direction
 */
export const makeEntityRun = (entity, direction) => {
  const connectedEntities = Object.values(entity.connectedEntities);

  // If it is connected to an entity dont call the running function (e.g. inside boat)
  if (!connectedEntities.length) {
    updateEntityImage(entity, direction, IMG_MAP_TYPES.RUNNING);
    return;
  }

  updateEntityImage(entity, direction);

  connectedEntities.forEach((e) => {
    updateEntityImage(e, direction);
    cutEntityImage(e, direction);
  });
};
