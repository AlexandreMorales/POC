import { CONFIG, MAP_CONFIG, MAZE_CONFIG } from "./configs.js";
import {
  KNOWN_POLYGONS,
  knownPolys,
  MAP_INFO,
  MAZE_INFO,
  POLI_INFO,
  STATES,
} from "./infos.js";
import { GRID } from "./grid.js";
import { resetCanvasSize, drawEveryCell, applyDark } from "./draw.js";
import { move } from "./maze.js";
import { correctRoundError, debounce } from "./utils.js";

if (CONFIG.moveManually) {
  document.onkeydown = (e) => {
    if (CONFIG.isMaze && MAZE_INFO.state !== STATES.solve) return;

    e = e || /** @type {KeyboardEvent} */ (window.event);
    e.preventDefault();

    if (e.code === "ShiftLeft") {
      CONFIG.poliSizes =
        knownPolys[
          (knownPolys.indexOf(CONFIG.poliSizes) + 1) % knownPolys.length
        ];

      resetCanvasSize();
      updateOffsets(getCenterCell(), MAP_INFO.currentCell);
      drawEveryCell();
      applyDark();
      return;
    }

    if (e.code === "Space") {
      moveTime();
      return;
    }

    const aIndex = getMovedAdjacentIndex(e);

    if (aIndex === undefined) return;

    if (CONFIG.isMaze) if (MAP_INFO.currentCell.borders[aIndex]) return;

    const nextPos =
      MAP_INFO.currentCell.adjacentIndexes[CONFIG.poliSizes][aIndex];

    if (!nextPos) return;

    const nextCell = GRID[nextPos[0]]?.[nextPos[1]];

    if (!nextCell) return;

    const oldCell = MAP_INFO.currentCell;
    MAP_INFO.currentCell = nextCell;

    if (CONFIG.isMaze) {
      move(oldCell, nextCell);
    } else {
      updateOffsets(oldCell, nextCell);
      moveTime();
    }
  };
}

/**
 * @param {KeyboardEvent} e
 */
const getMovedAdjacentIndex = (e) => {
  const useDiagonal = e.altKey;

  let topI = 0;
  let bottomI = POLI_INFO[CONFIG.poliSizes].bottomIndex;

  let topLeftI = CONFIG.poliSizes - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (CONFIG.poliSizes === KNOWN_POLYGONS.TRIANGLE) {
    const isInverted = MAP_INFO.currentCell.isInverted;
    topI = isInverted ? undefined : 0;
    bottomI = isInverted ? 0 : undefined;
    topLeftI = bottomLeftI = isInverted ? 1 : 2;
    topRightI = bottomRightI = isInverted ? 2 : 1;
  }

  const codeMap = {
    ArrowUp: topI,
    ArrowDown: bottomI,
    ArrowLeft: useDiagonal ? topLeftI : bottomLeftI,
    ArrowRight: useDiagonal ? topRightI : bottomRightI,
  };

  return codeMap[e.code];
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

const moveTime = debounce(() => {
  drawEveryCell();
  applyDark();
  MAP_INFO.timeOfDay += MAP_CONFIG.passHour;

  if (
    MAP_INFO.timeOfDay >= MAP_CONFIG.midNightHour ||
    MAP_INFO.timeOfDay <= 0
  ) {
    MAP_CONFIG.passHour = -MAP_CONFIG.passHour;
  }
});

/**
 * @returns {import("./infos.js").Cell}
 */
export const getCenterCell = () => {
  const middleRow = Math.floor(POLI_INFO[CONFIG.poliSizes].rows / 2);
  const middleColumn = Math.floor(POLI_INFO[CONFIG.poliSizes].columns / 2);

  return GRID[middleRow + MAP_INFO.iOffset][middleColumn + MAP_INFO.jOffset];
};
