import { ENTITY_TYPES, MOVEMENT } from "../configs.js";
import { createEntity } from "../entities.js";
import { toggleBoat } from "./boat.js";

const ENEMY_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/enemies/zombie.gif",
  [MOVEMENT.DOWN]: "images/enemies/zombie.gif",
  [MOVEMENT.LEFT]: "images/enemies/zombie.gif",
  [MOVEMENT.RIGHT]: "images/enemies/zombie.gif",
});

/**
 * @param {Cell} cell
 */
export const addEnemy = (cell) => {
  const enemyEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.ENEMY,
    ENEMY_IMG_MAP,
    { movementOptions: { speed: 1, targets: ["PLAYER"] } }
  );
  if (cell.block.isFluid) toggleBoat(enemyEntity);
};
