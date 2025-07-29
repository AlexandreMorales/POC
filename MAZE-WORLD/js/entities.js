import { ENTITIES_CONFIG, MOVEMENT } from "./configs/configs.js";
import { calculatePointBasedOnPos, GRID } from "./grid.js";
import { MAP_INFO, POLY_INFO } from "./configs/infos.js";
import { getMod, isPointOutsideCanvas } from "./utils.js";

const container = document.getElementById("entities");
const playerImg = /** @type {HTMLImageElement} */ (
  document.getElementById("player")
);

export const PLAYER_INFO = {
  isInBoat: false,
};

export const BOAT_INFO = {
  img: /** @type {HTMLImageElement} */ (null),
  cell: /** @type {import("./configs/infos.js").Cell} */ (null),
};

const BOAT_IMG_MAP = {
  [MOVEMENT.UP]: "images/boat/up.png",
  [MOVEMENT.DOWN]: "images/boat/down.png",
  [MOVEMENT.LEFT]: "images/boat/left.png",
  [MOVEMENT.RIGHT]: "images/boat/right.png",
};

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

export const removeBoat = () => {
  if (BOAT_INFO.img) {
    container.removeChild(BOAT_INFO.img);
    BOAT_INFO.img = null;
  }
};

/**
 * @param {import("./configs/infos.js").Cell} cell
 */
export const addBoat = (cell) => {
  if (!BOAT_INFO.img) {
    BOAT_INFO.img = document.createElement("img");
    BOAT_INFO.img.style.zIndex = "1";
    BOAT_INFO.img.src = BOAT_IMG_MAP[MOVEMENT.RIGHT];
    container.appendChild(BOAT_INFO.img);
  }

  BOAT_INFO.cell = cell;

  resetBoat();
};

const resetBoat = () => {
  BOAT_INFO.img.style.width = `${Math.round(
    POLY_INFO[MAP_INFO.currentPoly].ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;

  updateBoat();
};

const updateBoat = () => {
  const { ySide, hasInverted, cx, cy, canvasHeight, canvasWidth } =
    POLY_INFO[MAP_INFO.currentPoly];
  let point = { x: cx, y: cy };

  if (!PLAYER_INFO.isInBoat) {
    point = calculatePointBasedOnPos(
      BOAT_INFO.cell.pos,
      hasInverted && BOAT_INFO.cell.isInverted
    );

    BOAT_INFO.img.style.display = isPointOutsideCanvas(point, {
      canvasHeight,
      canvasWidth,
    })
      ? "none"
      : "block";
  }

  BOAT_INFO.img.style.top = `${point.y - ySide * 2}px`;
  BOAT_INFO.img.style.left = `${point.x - ySide * 1.25}px`;
};

export const resetEntities = () => {
  const { ySide, cx, cy } = POLY_INFO[MAP_INFO.currentPoly];
  playerImg.style.height = playerImg.style.width = `${Math.round(
    ySide * ENTITIES_CONFIG.defaultSizeRatio
  )}px`;
  playerImg.style.top = `${cy - ySide * 2}px`;
  playerImg.style.left = `${cx - ySide * 1.25}px`;

  if (BOAT_INFO.img) resetBoat();
};

/**
 * @param {symbol} direction
 */
export const updatePlayerDirection = (direction) => {
  playerImg.src = MOVEMENT_IMG_MAP[direction];

  if (PLAYER_INFO.isInBoat) {
    BOAT_INFO.img.src = BOAT_IMG_MAP[MOVEMENT.RIGHT];
    BOAT_INFO.img.style.marginTop = null;
  }
};

/**
 * @param {symbol} direction
 */
export const startRunning = (direction) => {
  if (PLAYER_INFO.isInBoat) {
    playerImg.src = MOVEMENT_IMG_MAP[direction];
    BOAT_INFO.img.src = BOAT_IMG_MAP[direction];

    if (direction === MOVEMENT.UP || direction === MOVEMENT.DOWN) {
      const { ySide } = POLY_INFO[MAP_INFO.currentPoly];
      BOAT_INFO.img.style.marginTop = `${ySide}px`;
    } else {
      BOAT_INFO.img.style.marginTop = null;
    }
  } else {
    playerImg.src = RUNNING_IMG_MAP[direction];
  }
};

export const updateEntities = () => {
  verifyEntityHeight(playerImg, MAP_INFO.currentCell);
  if (BOAT_INFO.img) updateBoat();
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
  } else if (downCell.wall || PLAYER_INFO.isInBoat) {
    height = ySide * ENTITIES_CONFIG.wallSizeRatio;
  }

  entityImage.style.height = `${Math.round(height)}px`;
};
