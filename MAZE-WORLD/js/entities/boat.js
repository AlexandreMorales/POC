import {
  createEntity,
  moveEntityToCell,
  updateEntityPoint,
  verifyEntityHeight,
} from "./entities.js";
import { MOVEMENT } from "./infos.js";

const BOAT_IMG_MAP = /** @type {import("./infos.js").ImageMap} */ ({
  [MOVEMENT.UP]: "images/boat/up.png",
  [MOVEMENT.DOWN]: "images/boat/down.png",
  [MOVEMENT.LEFT]: "images/boat/left.png",
  [MOVEMENT.RIGHT]: "images/boat/right.png",
});

export const BOAT_NAME = "BOAT";
const BOAT_ENTITIES =
  /** @type {{ [k: string]: import("./infos.js").Entity }} */ ({});

/**
 * @param {import("./infos.js").Entity} entity
 */
export const toggleBoat = (entity) => {
  if (entity.connectedEntities[BOAT_NAME]) {
    delete entity.connectedEntities[BOAT_NAME];
    addBoat(entity.cell, entity);
    return;
  }

  entity.connectedEntities[BOAT_NAME] = BOAT_ENTITIES[entity.name];
};

/**
 * @param {import("../configs/infos.js").Cell} cell
 * @param {import("./infos.js").Entity} entity
 */
export const addBoat = (cell, entity) => {
  let boatEntity = BOAT_ENTITIES[entity.name];
  if (!boatEntity?.img)
    boatEntity = BOAT_ENTITIES[entity.name] = createEntity(
      cell,
      `${entity.name}_${BOAT_NAME}`,
      BOAT_IMG_MAP,
      {
        movementsToCut: [MOVEMENT.UP, MOVEMENT.DOWN],
      }
    );

  moveEntityToCell(boatEntity, cell);
  updateEntityPoint(boatEntity);
  verifyEntityHeight(boatEntity);
};
