import { CONFIG } from "./configs.js";
import { MAP_INFO, MAZE_INFO, POLY_INFO, STATES } from "./infos.js";
import { GRID } from "./grid.js";
import { mazeMove } from "./maze.js";

if (CONFIG.moveManually) {
  document.onkeydown = (e) => {
    if (MAZE_INFO.state !== STATES.solve) return;

    e = e || /** @type {KeyboardEvent} */ (window.event);
    e.preventDefault();

    moveBaseOnCode(e.code, e.altKey);
  };

  document.ontouchstart = (e) => {
    e = e || /** @type {TouchEvent} */ (window.event);
    const { screenX, screenY } = e.changedTouches[0];
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
}

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

  if (MAP_INFO.currentCell.borders[aIndex]) return;

  const nextPos =
    MAP_INFO.currentCell.adjacentIndexes[CONFIG.polySides][aIndex];

  if (!nextPos) return;

  const nextCell = GRID[nextPos[0]]?.[nextPos[1]];

  if (!nextCell) return;

  const oldCell = MAP_INFO.currentCell;
  MAP_INFO.currentCell = nextCell;
  mazeMove(oldCell, nextCell);
};
