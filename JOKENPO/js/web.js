import { PLAYER_MOVEMENT } from "./entities/index.js";

const ARROW_MOVEMENT_MAP = {
  ["ArrowUp"]: "up",
  ["ArrowLeft"]: "left",
  ["ArrowDown"]: "down",
  ["ArrowRight"]: "right",
};
document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  if (e.code.startsWith("Arrow")) {
    PLAYER_MOVEMENT[ARROW_MOVEMENT_MAP[e.code]] = true;
  }
};
document.onkeyup = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  if (e.code.startsWith("Arrow")) {
    PLAYER_MOVEMENT[ARROW_MOVEMENT_MAP[e.code]] = false;
  }
};
