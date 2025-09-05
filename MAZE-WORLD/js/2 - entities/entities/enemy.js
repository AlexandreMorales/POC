import { ENTITY_TYPES } from "../_configs.js";
import { createEntity } from "../entities.js";
import { getInBoat } from "./boat.js";

/**
 * @param {Cell} cell
 */
export const addEnemy = (cell) => {
  const enemyEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.ENEMY,
    {
      minTime: 40,
      movementOptions: {
        speed: 1,
        targets: new Set([ENTITY_TYPES.PLAYER]),
      },
    }
  );
  if (enemyEntity && cell.block.isFluid) getInBoat(enemyEntity);
};
