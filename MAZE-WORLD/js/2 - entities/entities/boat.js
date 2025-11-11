import { ENTITY_TYPES, MOVEMENT } from "../_configs.js";
import { createEntity, moveEntityToCell } from "../entities.js";

const BOAT_ENTITIES = /** @type {{ [k: string]: Entity }} */ ({});

/**
 * @param {Entity} entity
 */
export const getInBoat = (entity) => {
  if (!BOAT_ENTITIES[entity.id]) addBoat(entity.cell, entity);
  BOAT_ENTITIES[entity.id].isConnected = true;
  entity.connectedEntities[ENTITY_TYPES.BOAT] = BOAT_ENTITIES[entity.id];
};

/**
 * @param {Entity} entity
 */
export const getOutBoat = (entity) => {
  if (entity.connectedEntities[ENTITY_TYPES.BOAT]) {
    delete entity.connectedEntities[ENTITY_TYPES.BOAT];
    BOAT_ENTITIES[entity.id].isConnected = false;
    moveEntityToCell(BOAT_ENTITIES[entity.id], entity.cell);
  }
};

/**
 * @param {Cell} cell
 * @param {Entity} entity
 */
export const addBoat = (cell, entity) => {
  let boatEntity = BOAT_ENTITIES[entity.id];
  if (boatEntity?.health <= 0) {
    boatEntity = null;
    delete BOAT_ENTITIES[entity.id];
  }
  if (!boatEntity)
    boatEntity = BOAT_ENTITIES[entity.id] = createEntity(
      cell,
      entity.id,
      ENTITY_TYPES.BOAT,
      {
        zIndex: 1,
        movementsToCut: [MOVEMENT.UP, MOVEMENT.DOWN],
        currentDirection: MOVEMENT.RIGHT,
      }
    );

  moveEntityToCell(boatEntity, cell);
};
