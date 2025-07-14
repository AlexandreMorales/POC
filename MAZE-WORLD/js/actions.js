import { CONFIG, MAP_CONFIG, MOVEMENT } from "./configs.js";
import { knownPolys, MAP_INFO, POLY_INFO } from "./infos.js";
import { GRID, addWall } from "./grid.js";
import { resetCanvasSize, drawEveryCell } from "./draw.js";
import { getMod } from "./utils.js";
import {
  startRunning,
  updateEntities,
  updatePlayerDirection,
} from "./entities.js";
import {
  cellIsBlocked,
  getCenterCell,
  move,
  moveCurrentCell,
} from "./movement.js";

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

    resetDirection();

    setTimeout(() => {
      drawEveryCell();
      canRotate = true;
    }, 2000 / MAP_CONFIG.velocity);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @param {import("./infos.js").Cell} [cell]
 * @returns {{ [k: symbol]: number }}
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
    [MOVEMENT.UP]: topI,
    [MOVEMENT.DOWN]: bottomI,
    [MOVEMENT.LEFT]: useDiagonal ? bottomLeftI : topLeftI,
    [MOVEMENT.RIGHT]: useDiagonal ? bottomRightI : topRightI,
  };
};

/**
 * @param {symbol} code
 * @param {boolean} [useDiagonal]
 * @returns {number}
 */
const getNextCellIndexBasedOnCode = (code, useDiagonal) => {
  const aIndex = getMovementMap(useDiagonal)[code];

  if (aIndex === undefined) return;

  return getMod(aIndex, CONFIG.polySides);
};

let lastMovement = null;
let lastSelection = null;

/**
 * @param {symbol} code
 * @param {boolean} [useDiagonal]
 */
export const moveBaseOnCode = (code, useDiagonal) => {
  if (!code) return;

  if (lastMovement !== code) {
    lastMovement = code;
    startRunning(lastMovement);
  }

  const aModI = getNextCellIndexBasedOnCode(code, useDiagonal);
  if (aModI === undefined) return;
  const nextPos = MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][aModI];

  if (!nextPos) return;

  const nextCell = GRID[nextPos.i]?.[nextPos.j];

  if (cellIsBlocked(nextCell)) return;

  move(nextCell);
};

export const stopMoving = () => {
  if (lastMovement) {
    updatePlayerDirection(lastSelection);
    lastMovement = null;
  }
};

/**
 * @param {symbol} code
 */
export const changeSelectedOnCode = (code) => {
  if (!code) return;

  lastSelection = code;
  const aModI = getNextCellIndexBasedOnCode(code);
  if (aModI === undefined || aModI === MAP_INFO.selectedCellIndex) return;

  MAP_INFO.selectedCellIndex = aModI;
  updatePlayerDirection(lastSelection);
};

export const changePolySides = () => {
  CONFIG.polySides =
    knownPolys[(knownPolys.indexOf(CONFIG.polySides) + 1) % knownPolys.length];

  MAP_INFO.rotationTurns = 0;
  MAP_INFO.selectedCellIndex = 0;

  const centerCell = getCenterCell();
  resetDirection();
  updateEntities();
  resetCanvasSize();
  moveCurrentCell(centerCell, MAP_INFO.currentCell);
  drawEveryCell();
  drawEveryCell();
};

export const resetDirection = () => {
  lastMovement = lastSelection = MOVEMENT.UP;
  updatePlayerDirection(lastSelection);
};

/**
 * @returns {import("./infos.js").Cell}
 */
const getSelectedCell = () => {
  const nextPos =
    MAP_INFO.currentCell.adjacentPos[CONFIG.polySides][
      MAP_INFO.selectedCellIndex
    ];

  if (!nextPos) return;

  return GRID[nextPos.i]?.[nextPos.j];
};

export const dig = () => {
  updatePlayerDirection(lastSelection);
  const selectedCell = getSelectedCell();

  if (
    !selectedCell ||
    !selectedCell.value ||
    !selectedCell.block ||
    selectedCell.block.isFluid
  )
    return;

  MAP_INFO.pickedCells.push({ ...(selectedCell.wall || selectedCell) });

  if (selectedCell.wall) {
    addWall(selectedCell, null);
  } else {
    selectedCell.value = null;
    selectedCell.block = null;
    selectedCell.color = null;
  }

  move();
};

export const place = () => {
  updatePlayerDirection(lastSelection);
  if (!MAP_INFO.pickedCells.length) return;

  const selectedCell = getSelectedCell();

  if (!selectedCell || selectedCell.wall) return;

  const nextBlock = MAP_INFO.pickedCells.pop();

  if (selectedCell.value && selectedCell.block && !selectedCell.block.isFluid) {
    addWall(selectedCell, nextBlock);
  } else {
    selectedCell.value = nextBlock.value;
    selectedCell.block = nextBlock.block;
    selectedCell.color = nextBlock.color;
  }

  move();
};
