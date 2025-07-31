import { ENTITY_TYPES, MOVEMENT } from "./infos.js";
import { createEntity, moveEntityToCell } from "./entities.js";

const BOAT_IMG_MAP = /** @type {import("./infos.js").ImageMap} */ ({
  [MOVEMENT.UP]: "images/boat/up.png",
  [MOVEMENT.DOWN]: "images/boat/down.png",
  [MOVEMENT.LEFT]: "images/boat/left.png",
  [MOVEMENT.RIGHT]: "images/boat/right.png",
});

const BOAT_ENTITIES =
  /** @type {{ [k: string]: import("./infos.js").Entity }} */ ({});

/**
 * @param {import("./infos.js").Entity} entity
 */
export const toggleBoat = (entity) => {
  if (entity.connectedEntities[ENTITY_TYPES.BOAT]) {
    delete entity.connectedEntities[ENTITY_TYPES.BOAT];
    addBoat(entity.cell, entity);
    return;
  }

  if (!BOAT_ENTITIES[entity.id]) addBoat(entity.cell, entity);

  entity.connectedEntities[ENTITY_TYPES.BOAT] = BOAT_ENTITIES[entity.id];
};

/**
 * @param {import("../0 - configs/infos.js").Cell} cell
 * @param {import("./infos.js").Entity} entity
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
        movementsToCut: [MOVEMENT.UP, MOVEMENT.DOWN],
      }
    );

  moveEntityToCell(boatEntity, cell);
};
