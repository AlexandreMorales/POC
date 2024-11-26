import { CONFIG, MAP_CONFIG } from "./configs.js";
import { knownPolys, MAP_INFO, POLY_INFO } from "./infos.js";
import { GRID } from "./grid.js";
import { resetCanvasSize, drawEveryCell } from "./draw.js";
import { correctRoundError, getMod } from "./utils.js";

let canRotate = true;
/**
 * @param {number} orientation
 */
export const rotate = (orientation) => {
  if (canRotate) {
    canRotate = false;
    MAP_INFO.rotationTurns = MAP_INFO.rotationTurns + orientation;
    setTimeout(() => {
      drawEveryCell();
      canRotate = true;
    }, 2000 / MAP_CONFIG.velocity);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @returns {{ [k: string]: number }}
 */
const getMovementMap = (useDiagonal) => {
  let topI = MAP_INFO.rotationTurns;
  let bottomI = topI + Math.floor(CONFIG.polySides / 2);

  let topLeftI = topI + CONFIG.polySides - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (CONFIG.polySides % 2) {
    const isInverted = MAP_INFO.currentCell.isInverted;
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

  const nextPos =
    MAP_INFO.currentCell.adjacentIndexes[CONFIG.polySides][
      getMod(aIndex, CONFIG.polySides)
    ];

  if (!nextPos) return;

  const nextCell = GRID[nextPos[0]]?.[nextPos[1]];

  if (cellIsBlocked(nextCell)) return;

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

  resetCanvasSize();
  updateOffsets(getCenterCell(), MAP_INFO.currentCell);
  drawEveryCell();
  drawEveryCell();
};

/**
 * @param {import("./infos.js").Cell} oldCell
 * @param {import("./infos.js").Cell} nextCell
 */
export const updateOffsets = (oldCell, nextCell) => {
  MAP_INFO.xOffset = knownPolys.reduce(
    (acc, p) => ({
      ...acc,
      [p]: correctRoundError(
        (MAP_INFO.xOffset[p] || 0) + oldCell.dPos[p].x - nextCell.dPos[p].x
      ),
    }),
    {}
  );
  MAP_INFO.yOffset = knownPolys.reduce(
    (acc, p) => ({
      ...acc,
      [p]: correctRoundError(
        (MAP_INFO.yOffset[p] || 0) + oldCell.dPos[p].y - nextCell.dPos[p].y
      ),
    }),
    {}
  );

  MAP_INFO.iOffset += nextCell.pos.i - oldCell.pos.i;
  MAP_INFO.jOffset += nextCell.pos.j - oldCell.pos.j;
};

let canMove = true;
/**
 * @param {import("./infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) {
      const oldCell = MAP_INFO.currentCell;
      MAP_INFO.currentCell = nextCell;

      updateOffsets(oldCell, nextCell);
    }

    setTimeout(() => {
      drawEveryCell();

      MAP_INFO.timeOfDay += MAP_CONFIG.passHour;

      if (
        MAP_INFO.timeOfDay >= MAP_CONFIG.midNightHour ||
        MAP_INFO.timeOfDay <= 0
      ) {
        MAP_CONFIG.passHour = -MAP_CONFIG.passHour;
      }

      canMove = true;
    }, 1000 / MAP_CONFIG.velocity);
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

/**
 * @param {number} screenX
 * @param {number} screenY
 */
export const mobileTouchStart = (screenX, screenY) => {
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;

  MAP_INFO.touchPos.interval = setInterval(() => {
    const finalX = screenX - MAP_INFO.touchPos.x;
    const finalY = screenY - MAP_INFO.touchPos.y;

    let code = null;
    let useDiagonal = false;
    if (Math.abs(finalY) > MAP_INFO.touchThreshold) {
      useDiagonal = finalY > 0;
      code = useDiagonal ? "ArrowDown" : "ArrowUp";
    }
    if (Math.abs(finalX) > MAP_INFO.touchThreshold) {
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
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;
};

export const mobileTouchEnd = () => {
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos = { x: 0, y: 0, interval: null };
};
