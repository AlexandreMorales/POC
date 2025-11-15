import { SHOP_CONFIG } from "../shop.js";
import { ENTITY_TYPES, PLAYER_ENTITY } from "./_configs.js";
import { createEntity, setEntityPoint } from "./render.js";

export const PLAYER_MOVEMENT = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export const initPlayer = () => {
  Object.assign(
    PLAYER_ENTITY,
    createEntity(
      /** @type {Entity} */ ({
        group: ENTITY_TYPES.SCISSOR,
        type: ENTITY_TYPES.SCISSOR,
        kills: [ENTITY_TYPES.PAPER],
        speed: 1,
        killCount: 0,
        evolution: {
          minKills: SHOP_CONFIG.killsToEvolve,
          evolution: ENTITY_TYPES.FIRE,
        },
      }),
      true
    )
  );
  PLAYER_ENTITY.element.classList.add("player");
};

export const movePlayer = () => {
  if (!PLAYER_ENTITY.element) return;

  let y = 0;
  let x = 0;

  if (PLAYER_MOVEMENT.up) y -= PLAYER_ENTITY.speed;
  if (PLAYER_MOVEMENT.down) y += PLAYER_ENTITY.speed;
  if (PLAYER_MOVEMENT.left) x -= PLAYER_ENTITY.speed;
  if (PLAYER_MOVEMENT.right) x += PLAYER_ENTITY.speed;

  if (x || y) {
    x *= SHOP_CONFIG.playerSpeed * 1.25;
    y *= SHOP_CONFIG.playerSpeed * 1.25;

    setEntityPoint(PLAYER_ENTITY, {
      x: PLAYER_ENTITY.pointTop.x + x,
      y: PLAYER_ENTITY.pointTop.y + y,
    });
  }
};
