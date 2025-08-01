import { ENTITY_TYPES, MOVEMENT } from "../configs.js";
import { createEntity } from "../entities.js";
import { ENTITY_INFO } from "../infos.js";
import { getInBoat } from "./boat.js";

const ENEMY_IMG_MAP = /** @type {ImageMap} */ ({
  [MOVEMENT.UP]: "images/enemies/zombie/up.png",
  [MOVEMENT.DOWN]: "images/enemies/zombie/down.png",
  [MOVEMENT.LEFT]: "images/enemies/zombie/left.png",
  [MOVEMENT.RIGHT]: "images/enemies/zombie/right.png",
});

const ENEMY_MIN_TIME = 40;

/**
 * @param {Cell} cell
 */
export const addEnemy = (cell) => {
  if (ENTITY_INFO.timeOfDay < ENEMY_MIN_TIME) return;

  const enemyEntity = createEntity(
    cell,
    `${cell.pos.i}_${cell.pos.j}`,
    ENTITY_TYPES.ENEMY,
    ENEMY_IMG_MAP,
    {
      defaultDirection: MOVEMENT.DOWN,
      minTime: ENEMY_MIN_TIME,
      movementOptions: {
        speed: 1,
        targets: new Set([ENTITY_TYPES.PLAYER]),
      },
    }
  );
  if (cell.block.isFluid) getInBoat(enemyEntity);
};
