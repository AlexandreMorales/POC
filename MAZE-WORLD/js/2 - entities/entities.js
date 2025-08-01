import { ENTITY_TYPES } from "./configs.js";
import { PLAYER_ENTITY } from "./player.js";
import {
  createEntityImage,
  removeEntityImage,
  setEntityToCenter,
  setImgSize,
  updateEntityPoint,
  verifyEntityHeight,
} from "./render.js";

export const ENTITIES = /** @type {Set<Entity>} */ (new Set());

/**
 * @param {Entity} entity
 * @param {Cell} cell
 */
export const moveEntityToCell = (entity, cell) => {
  const previousType = entity.cell?.entityType || cell.entityType;
  if (entity.cell) entity.cell.entityType = null;
  entity.cell = cell;
  entity.cell.entityType = previousType || entity.type;
  updateEntityPoint(entity);
  verifyEntityHeight(entity);

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
 * @param {ImageMap} imageMap
 * @param {Partial<Entity>} entityParams
 * @returns {Entity}
 */
export const createEntity = (cell, id, type, imageMap, entityParams = {}) => {
  id = `${type}_${id}`;
  const entity = /** @type {Entity} */ ({
    img: createEntityImage(id, imageMap, entityParams),
    id,
    type,
    imageMap,
    connectedEntities: {},
    ...entityParams,
  });
  moveEntityToCell(entity, cell);
  ENTITIES.add(entity);
  return entity;
};

export const resetEntities = () => {
  setImgSize(PLAYER_ENTITY.img);
  ENTITIES.forEach((e) => {
    setImgSize(e.img);
  });
};

export const updateEntities = () => {
  const connectedEntities = /** @type {Set<Entity>} */ (
    new Set(Object.values(PLAYER_ENTITY.connectedEntities))
  );
  setEntityToCenter(PLAYER_ENTITY);
  verifyEntityHeight(PLAYER_ENTITY);

  connectedEntities.forEach((e) => {
    setEntityToCenter(e);
  });
  ENTITIES.forEach((e) => {
    if (!connectedEntities.has(e)) updateEntityPoint(e);
    verifyEntityHeight(e);
  });
};

/**
 * @param {Cell} cell
 * @param {Entity} entity
 * @returns {boolean}
 */
export const cellIsBlocked = (cell, entity) =>
  !cell ||
  !cell.block ||
  !!cell.wall ||
  !!cell.entityType ||
  (entity.connectedEntities[ENTITY_TYPES.BOAT]
    ? !cell.block.isFluid
    : cell.block.isFluid);
