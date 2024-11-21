import { CONFIG, MAP_CONFIG } from "./configs.js";
import { knownPolys, MAP_INFO, POLY_INFO } from "./infos.js";
import { GRID } from "./grid.js";
import { resetCanvasSize, drawEveryCell } from "./draw.js";
import { correctRoundError, debounce } from "./utils.js";

document.onkeydown = (e) => {
  e = e || /** @type {KeyboardEvent} */ (window.event);
  e.preventDefault();

  if (e.code === "ShiftLeft") {
    changePolySides();
    return;
  }

  if (e.code === "Space") {
    move();
    return;
  }

  moveBaseOnCode(e.code, e.altKey);
};

document.ontouchstart = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;

  MAP_INFO.touchPos.interval = setInterval(() => {
    const finalX = screenX - MAP_INFO.touchPos.x;
    const finalY = screenY - MAP_INFO.touchPos.y;

    let code = null;
    let useDiagonal = false;
    if (Math.abs(finalY) > MAP_INFO.touchThreshold) {
      useDiagonal = finalY < 0;
      code = useDiagonal ? "ArrowUp" : "ArrowDown";
    }
    if (Math.abs(finalX) > MAP_INFO.touchThreshold) {
      code = finalX < 0 ? "ArrowLeft" : "ArrowRight";
    }

    if (code) moveBaseOnCode(code, useDiagonal);
  }, 100);
};

document.ontouchmove = (e) => {
  e = e || /** @type {TouchEvent} */ (window.event);
  const { screenX, screenY } = e.changedTouches[0];
  MAP_INFO.touchPos.x = screenX;
  MAP_INFO.touchPos.y = screenY;
};

document.ontouchend = () => {
  clearInterval(MAP_INFO.touchPos.interval);
  MAP_INFO.touchPos = { x: 0, y: 0, interval: null };
};

/**
 * @param {boolean} [useDiagonal]
 */
const getMovementMap = (useDiagonal) => {
  let topI = 0;
  let bottomI = POLY_INFO[CONFIG.polySides].bottomIndex;

  let topLeftI = CONFIG.polySides - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (CONFIG.polySides % 2) {
    const isInverted = MAP_INFO.currentCell.isInverted;
    topI = isInverted ? undefined : 0;
    bottomI = isInverted ? 0 : undefined;
    topLeftI = bottomLeftI = isInverted ? 1 : 2;
    topRightI = bottomRightI = isInverted ? 2 : 1;
  }

  return {
    ArrowUp: topI,
    ArrowDown: bottomI,
    ArrowLeft: useDiagonal ? topLeftI : bottomLeftI,
    ArrowRight: useDiagonal ? topRightI : bottomRightI,
  };
};

/**
 * @param {string} code
 * @param {boolean} [useDiagonal]
 */
const moveBaseOnCode = (code, useDiagonal) => {
  const moveMap = getMovementMap(useDiagonal);
  const aIndex = moveMap[code];

  if (aIndex === undefined) return;

  const nextPos =
    MAP_INFO.currentCell.adjacentIndexes[CONFIG.polySides][aIndex];

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
  !cell || !!cell.wall || cell.block.isFluid;

export const changePolySides = () => {
  CONFIG.polySides =
    knownPolys[(knownPolys.indexOf(CONFIG.polySides) + 1) % knownPolys.length];

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

/**
 * @param {import("./infos.js").Cell} [nextCell]
 */
const move = (nextCell) => {
  if (MAP_CONFIG.canMove) {
    if (nextCell) {
      const oldCell = MAP_INFO.currentCell;
      MAP_INFO.currentCell = nextCell;

      updateOffsets(oldCell, nextCell);
    }
    moveTime();
    MAP_CONFIG.canMove = false;
  }
};

const moveTime = debounce(() => {
  drawEveryCell();
  MAP_INFO.timeOfDay += MAP_CONFIG.passHour;

  if (
    MAP_INFO.timeOfDay >= MAP_CONFIG.midNightHour ||
    MAP_INFO.timeOfDay <= 0
  ) {
    MAP_CONFIG.passHour = -MAP_CONFIG.passHour;
  }

  MAP_CONFIG.canMove = true;
}, 1000 / MAP_CONFIG.velocity);

/**
 * @returns {import("./infos.js").Cell}
 */
export const getCenterCell = () => {
  const middleRow = Math.floor(POLY_INFO[CONFIG.polySides].rows / 2);
  const middleColumn = Math.floor(POLY_INFO[CONFIG.polySides].columns / 2);

  return GRID[middleRow + MAP_INFO.iOffset][middleColumn + MAP_INFO.jOffset];
};
