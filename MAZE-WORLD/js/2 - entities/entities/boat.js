import { ENTITY_TYPES, MOVEMENT } from "../configs.js";
import { createEntity, moveEntityToCell } from "../entities.js";

const BOAT_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/boat/up.png",
  [MOVEMENT.DOWN]: "images/boat/down.png",
  [MOVEMENT.LEFT]: "images/boat/left.png",
  [MOVEMENT.RIGHT]: "images/boat/right.png",
});

const BOAT_ENTITIES = /** @type {{ [k: string]: Entity }} */ ({});

/**
 * @param {Entity} entity
 */
export const getInBoat = (entity) => {
  if (!BOAT_ENTITIES[entity.id]) addBoat(entity.cell, entity);
  entity.connectedEntities[ENTITY_TYPES.BOAT] = BOAT_ENTITIES[entity.id];
};

/**
 * @param {Entity} entity
 */
export const getOutBoat = (entity) => {
  if (entity.connectedEntities[ENTITY_TYPES.BOAT]) {
    delete entity.connectedEntities[ENTITY_TYPES.BOAT];
    moveEntityToCell(BOAT_ENTITIES[entity.id], entity.cell);
  }
};

/**
 * @param {Cell} cell
 * @param {Entity} entity
 */
export const addBoat = (cell, entity) => {
  let boatEntity = BOAT_ENTITIES[entity.id];
  if (!boatEntity?.img)
    boatEntity = BOAT_ENTITIES[entity.id] = createEntity(
      cell,
      entity.id,
      ENTITY_TYPES.BOAT,
      BOAT_IMG_MAP,
      {
        zIndex: 1,
        movementsToCut: [MOVEMENT.UP, MOVEMENT.DOWN],
      }
    );

  moveEntityToCell(boatEntity, cell);
};
