import { CONFIGS } from "../_configs";
import { PLAYER_ENTITY } from "./_configs";
import { createEntity, setEntityPoint } from "./render";

export const PLAYER_MOVEMENT = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export const initPlayer = () => {
  Object.assign(PLAYER_ENTITY, createEntity(PLAYER_ENTITY));
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
    x *= CONFIGS.speed;
    y *= CONFIGS.speed;

    setEntityPoint(PLAYER_ENTITY, {
      x: PLAYER_ENTITY.pointTop.x + x,
      y: PLAYER_ENTITY.pointTop.y + y,
    });
  }
};
