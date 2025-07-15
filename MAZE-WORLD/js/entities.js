import { ENTITIES_CONFIG, MOVEMENT } from "./configs/configs.js";
import { GRID } from "./grid.js";
import { MAP_INFO, POLY_INFO } from "./configs/infos.js";
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

export const resetEntities = () => {
  const { ySide, cx, cy } = POLY_INFO[MAP_INFO.currentPoly];
  playerImg.style.height = playerImg.style.width = `${Math.round(
    ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;
  playerImg.style.top = `${cy - ySide * 2}px`;
  playerImg.style.left = `${cx - ySide * 1.25}px`;
};

/**
 * @param {symbol} direction
 */
export const updatePlayerDirection = (direction) => {
  playerImg.src = MOVEMENT_IMG_MAP[direction];
};

/**
 * @param {symbol} direction
 */
export const startRunning = (direction) => {
  playerImg.src = RUNNING_IMG_MAP[direction];
};

export const verifyEntitiesHeight = () => {
  verifyEntityHeight(playerImg, MAP_INFO.currentCell);
};

/**
 * @param {HTMLImageElement} entityImage
 * @param {import("./configs/infos.js").Cell} cell
 */
const verifyEntityHeight = (entityImage, cell) => {
  const { ySide, hasInverted } = POLY_INFO[MAP_INFO.currentPoly];
  let downI = MAP_INFO.rotationTurns + Math.floor(MAP_INFO.currentPoly / 2);

  if (hasInverted && cell.isInverted) downI = MAP_INFO.rotationTurns;

  downI = getMod(downI, MAP_INFO.currentPoly);
  const downPos = cell.adjacentPos[MAP_INFO.currentPoly][downI];
  const downCell = GRID[downPos.i]?.[downPos.j];

  let height = ySide * ENTITIES_CONFIG.defaultSizeRatio;
  playerImg.style.clipPath = null;
  if (hasInverted && !cell.isInverted) {
    const rightCell = downCell;

    let leftI = MAP_INFO.rotationTurns + MAP_INFO.currentPoly - 1;
    leftI = getMod(leftI, MAP_INFO.currentPoly);
    const leftPos = cell.adjacentPos[MAP_INFO.currentPoly][leftI];
    const leftCell = GRID[leftPos.i]?.[leftPos.j];

    let clipPath = null;

    if (rightCell.wall && leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedBothClipPath;
    } else if (rightCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedRightClipPath;
    } else if (leftCell.wall) {
      clipPath = ENTITIES_CONFIG.notInvertedLeftClipPath;
    }

    entityImage.style.clipPath = clipPath;
  } else if (downCell.wall) {
    height = ySide * ENTITIES_CONFIG.wallSizeRatio;
  }

  entityImage.style.height = `${Math.round(height)}px`;
};
