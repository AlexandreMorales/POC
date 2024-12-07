import { CONFIG, MOVEMENT } from "./configs.js";
import { GRID } from "./grid.js";
import { MAP_INFO, POLY_INFO } from "./infos.js";
import { getMod } from "./utils.js";

const playerImg = /** @type {HTMLImageElement} */ (
  document.getElementById("player")
);

const MOVEMENT_IMG_MAP = {
  [MOVEMENT.UP]: "images/player/up.png",
  [MOVEMENT.DOWN]: "images/player/down.png",
  [MOVEMENT.LEFT]: "images/player/left.png",
  [MOVEMENT.RIGHT]: "images/player/right.png",
};

const RUNNING_IMG_MAP = {
  [MOVEMENT.UP]: "images/player/up-walk.gif",
  [MOVEMENT.DOWN]: "images/player/down-walk.gif",
  [MOVEMENT.LEFT]: "images/player/left-walk.gif",
  [MOVEMENT.RIGHT]: "images/player/right-walk.gif",
};

export const updateEntities = () => {
  const { ySide, cx, cy } = POLY_INFO[CONFIG.polySides];
  playerImg.style.height = playerImg.style.width = `${Math.round(
    ySide * 2.5
  )}px`;
  playerImg.style.top = `${cy - ySide * 2}px`;
  playerImg.style.left = `${cx - ySide * 1.2}px`;
};

/**
 * @param {symbol} direction
 */
export const updatePlayerDirection = (direction) => {
  playerImg.src = MOVEMENT_IMG_MAP[direction];
};

export const verifyPlayerHeight = () => {
  const { ySide, hasInverted } = POLY_INFO[CONFIG.polySides];
  let downI = MAP_INFO.rotationTurns + Math.floor(CONFIG.polySides / 2);

  if (hasInverted && MAP_INFO.currentCell.isInverted)
    downI = MAP_INFO.rotationTurns;

  downI = getMod(downI, CONFIG.polySides);
  const downPos = MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][downI];
  const downCell = GRID[downPos.i]?.[downPos.j];

  playerImg.style.height = `${Math.round(ySide * (downCell.wall ? 2 : 2.5))}px`;
};

/**
 * @param {symbol} direction
 */
export const startRunning = (direction) => {
  playerImg.src = RUNNING_IMG_MAP[direction];
};
