import { ENTITY_TYPES, IMG_MAP_TYPES, MOVEMENT } from "../_configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

const RABBIT_IMG_MAP = /** @type {ImageMap} */ ({
  [IMG_MAP_TYPES.DEFAULT]: {
    [MOVEMENT.UP]: "images/map/rabbit.png",
    [MOVEMENT.DOWN]: "images/map/rabbit-right.png",
    [MOVEMENT.LEFT]: "images/map/rabbit.png",
    [MOVEMENT.RIGHT]: "images/map/rabbit-right.png",
  },
});

/**
 * @param {Cell} cell
 */
export const addRabbit = (cell) => {
  const rabbitEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.RABBIT,
    RABBIT_IMG_MAP,
    {
      isGenerated: true,
      movementOptions: { speed: 1, random: true },
      defaultImgMapType: cell.block?.defaultImgMapType,
    }
  );
  if (cell.block.isFluid) getInBoat(rabbitEntity);
};
