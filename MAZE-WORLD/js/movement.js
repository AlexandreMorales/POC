import { CONFIG, MAP_CONFIG } from "./configs.js";
import { knownPolys, MAP_INFO, POLY_INFO } from "./infos.js";
import { GRID } from "./grid.js";
import { resetCanvasSize, drawEveryCell } from "./draw.js";
import { getMod } from "./utils.js";

let canRotate = true;
/**
 * @param {number} orientation
 */
export const rotate = (orientation) => {
  if (canRotate) {
    canRotate = false;
    MAP_INFO.rotationTurns = MAP_INFO.selectedCellIndex = getMod(
      MAP_INFO.rotationTurns + orientation,
      CONFIG.polySides
    );
    setTimeout(() => {
      drawEveryCell();
      canRotate = true;
    }, 2000 / MAP_CONFIG.velocity);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @param {import("./infos.js").Cell} [cell]
 * @returns {{ [k: string]: number }}
 */
const getMovementMap = (useDiagonal, cell = MAP_INFO.currentCell) => {
  let topI = MAP_INFO.rotationTurns;
  let bottomI = topI + Math.floor(CONFIG.polySides / 2);

  let topLeftI = topI + CONFIG.polySides - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (POLY_INFO[CONFIG.polySides].hasInverted) {
    const isInverted = cell.isInverted;
    topLeftI = bottomLeftI = topI + (isInverted ? 1 : 2);
    topRightI = bottomRightI = topI + (isInverted ? 2 : 1);
    bottomI = isInverted ? topI : undefined;
    topI = isInverted ? undefined : topI;
  }

  return {
    ArrowUp: topI,
    ArrowDown: bottomI,
    ArrowLeft: useDiagonal ? bottomLeftI : topLeftI,
    ArrowRight: useDiagonal ? bottomRightI : topRightI,
  };
};

/**
 * @param {string} code
 * @param {boolean} [useDiagonal]
 */
export const moveBaseOnCode = (code, useDiagonal) => {
  const moveMap = getMovementMap(useDiagonal);
  const aIndex = moveMap[code];

  if (aIndex === undefined) return;

  const aModI = getMod(aIndex, CONFIG.polySides);
  const nextPos = MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][aModI];

  if (!nextPos) return;

  const prevSelectedIndex = MAP_INFO.selectedCellIndex;

  const nextCell = GRID[nextPos.i]?.[nextPos.j];
  MAP_INFO.selectedCellIndex = aModI;

  if (cellIsBlocked(nextCell)) {
    if (prevSelectedIndex !== MAP_INFO.selectedCellIndex) drawEveryCell();
    return;
  }

  if (POLY_INFO[CONFIG.polySides].hasInverted) {
    const aModIOpposite = getMod(
      getMovementMap(useDiagonal, nextCell)[code],
      CONFIG.polySides
    );
    if (aModIOpposite) MAP_INFO.selectedCellIndex = aModIOpposite;
  }

  move(nextCell);
};

/**
 * @param {import("./infos.js").Cell} cell
 * @returns {boolean}
 */
export const cellIsBlocked = (cell) =>
  !cell || !!cell.wall || !cell.value || !cell.block || cell.block.isFluid;

export const changePolySides = () => {
  CONFIG.polySides =
    knownPolys[(knownPolys.indexOf(CONFIG.polySides) + 1) % knownPolys.length];

  MAP_INFO.rotationTurns = 0;
  MAP_INFO.selectedCellIndex = 0;

  const centerCell = getCenterCell();
  resetCanvasSize();
  moveCurrentCell(centerCell, MAP_INFO.currentCell);
  drawEveryCell();
  drawEveryCell();
};

/**
 * @param {import("./infos.js").Cell} oldCell
 * @param {import("./infos.js").Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  MAP_INFO.iOffset += nextCell.pos.i - oldCell.pos.i;
  MAP_INFO.jOffset += nextCell.pos.j - oldCell.pos.j;
  MAP_INFO.currentCell = nextCell;
};

let canMove = true;
/**
 * @param {import("./infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(MAP_INFO.currentCell, nextCell);
    if (MAP_CONFIG.passTime) passTime();

    setTimeout(() => {
      drawEveryCell();
      canMove = true;
    }, 1000 / MAP_CONFIG.velocity);
  }
};

const passTime = () => {
  MAP_INFO.timeOfDay += MAP_CONFIG.passHour;

  if (
    MAP_INFO.timeOfDay >= MAP_CONFIG.midNightHour ||
    MAP_INFO.timeOfDay <= 0
  ) {
    MAP_CONFIG.passHour = -MAP_CONFIG.passHour;
  }
};

/**
 * @returns {import("./infos.js").Cell}
 */
export const getCenterCell = () => {
  const middleRow = Math.floor(POLY_INFO[CONFIG.polySides].rows / 2);
  const middleColumn = Math.floor(POLY_INFO[CONFIG.polySides].columns / 2);

  return GRID[middleRow + MAP_INFO.iOffset][middleColumn + MAP_INFO.jOffset];
};

let touchPos = { x: 0, y: 0, interval: null };
/**
 * @param {number} screenX
 * @param {number} screenY
 */
export const mobileTouchStart = (screenX, screenY) => {
  clearInterval(touchPos.interval);
  touchPos.x = screenX;
  touchPos.y = screenY;

  touchPos.interval = setInterval(() => {
    const finalX = screenX - touchPos.x;
    const finalY = screenY - touchPos.y;

    let code = null;
    let useDiagonal = false;
    if (Math.abs(finalY) > MAP_CONFIG.touchThreshold) {
      useDiagonal = finalY > 0;
      code = useDiagonal ? "ArrowDown" : "ArrowUp";
    }
    if (Math.abs(finalX) > MAP_CONFIG.touchThreshold) {
      code = finalX < 0 ? "ArrowLeft" : "ArrowRight";
    }

    if (code) moveBaseOnCode(code, useDiagonal);
  }, 100);
};

/**
 * @param {number} screenX
 * @param {number} screenY
 */
export const mobileTouchMove = (screenX, screenY) => {
  touchPos.x = screenX;
  touchPos.y = screenY;
};

export const mobileTouchEnd = () => {
  clearInterval(touchPos.interval);
  touchPos = { x: 0, y: 0, interval: null };
};
