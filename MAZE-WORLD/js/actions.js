import {
  MOVEMENT,
  KNOWN_POLYGONS_VALUES,
  MOVEMENT_VALUES,
  MAP_CONFIG,
  MENU_CONFIG,
} from "./configs/configs.js";
import { MAP_INFO, POLY_INFO } from "./configs/infos.js";
import { GRID, getCenterCell } from "./grid.js";
import {
  resetCanvasSize,
  drawEveryCell,
  resetRotateCanvas,
  rotateCanvas,
} from "./draw.js";
import { getMod } from "./utils.js";
import {
  startRunning,
  resetEntities,
  updatePlayerDirection,
} from "./entities.js";
import { cellIsBlocked, move, moveCurrentCell } from "./movement.js";

let canRotate = true;
/**
 * @param {number} orientation
 */
export const rotate = (orientation) => {
  if (canRotate) {
    canRotate = false;
    MAP_INFO.rotationTurns = MAP_INFO.selectedCellIndex = getMod(
      MAP_INFO.rotationTurns + orientation,
      MAP_INFO.currentPoly
    );

    if (MENU_CONFIG.rotationAnimation)
      rotateCanvas((360 / MAP_INFO.currentPoly) * -orientation);

    resetDirection();

    setTimeout(() => {
      if (MENU_CONFIG.rotationAnimation) resetRotateCanvas();
      drawEveryCell();
      canRotate = true;
    }, MAP_CONFIG.rotateDelay);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @param {import("./configs/infos.js").Cell} [cell]
 * @returns {{ [k: symbol]: number }}
 */
const getMovementMap = (useDiagonal, cell = MAP_INFO.currentCell) => {
  let topI = MAP_INFO.rotationTurns;
  let bottomI = topI + Math.floor(MAP_INFO.currentPoly / 2);

  let topLeftI = topI + MAP_INFO.currentPoly - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (POLY_INFO[MAP_INFO.currentPoly].hasInverted) {
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

  return getMod(aIndex, MAP_INFO.currentPoly);
};

let lastMovement = /** @type {symbol} */ (null);
let lastSelection = /** @type {symbol} */ (null);

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
  const nextPos = MAP_INFO.currentCell.adjacentPos[MAP_INFO.currentPoly][aModI];

  if (!nextPos) return;

  const nextCell = GRID[nextPos.i]?.[nextPos.j];

  if (cellIsBlocked(nextCell)) return;

  move(nextCell);
};

export const stopMoving = () => {
  if (lastMovement) {
    if (POLY_INFO[MAP_INFO.currentPoly].hasInverted) {
      const movementMap = getMovementMap();

      for (const movement of MOVEMENT_VALUES) {
        if (movementMap[movement] === MAP_INFO.selectedCellIndex) {
          lastSelection = movement;
          break;
        }
      }
    }
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
  MAP_INFO.currentPoly =
    KNOWN_POLYGONS_VALUES[
      (KNOWN_POLYGONS_VALUES.indexOf(MAP_INFO.currentPoly) + 1) %
        KNOWN_POLYGONS_VALUES.length
    ];

  MAP_INFO.rotationTurns = 0;
  MAP_INFO.selectedCellIndex = 0;

  resetDirection();
  resetEntities();
  resetCanvasSize();
  moveCurrentCell(getCenterCell(), MAP_INFO.currentCell);
  drawEveryCell();
};

export const resetDirection = () => {
  lastMovement = lastSelection = MOVEMENT.UP;
  updatePlayerDirection(lastSelection);
};

/**
 * @returns {import("./configs/infos.js").Cell}
 */
const getSelectedCell = () => {
  const nextPos =
    MAP_INFO.currentCell.adjacentPos[MAP_INFO.currentPoly][
      MAP_INFO.selectedCellIndex
    ];

  if (!nextPos) return;

  return GRID[nextPos.i]?.[nextPos.j];
};

export const dig = () => {
  updatePlayerDirection(lastSelection);
  const selectedCell = getSelectedCell();

  if (!selectedCell?.value || selectedCell.layer < 0) return;

  MAP_INFO.pickedCells.push({ ...(selectedCell.wall || selectedCell) });

  if (selectedCell.wall) {
    selectedCell.wall = null;
  } else {
    selectedCell.value = null;
    selectedCell.block = null;
    selectedCell.color = null;
    selectedCell.layer -= 1;
  }

  move();
};

export const place = () => {
  updatePlayerDirection(lastSelection);
  if (!MAP_INFO.pickedCells.length) return;

  const selectedCell = getSelectedCell();

  if (!selectedCell || selectedCell.wall) return;

  const nextBlock = MAP_INFO.pickedCells.pop();

  if (selectedCell.value && selectedCell.layer === 0) {
    selectedCell.wall = {
      block: nextBlock.block,
      color: nextBlock.color,
      value: nextBlock.value,
      layer: selectedCell.layer + 1,
    };
  } else {
    selectedCell.value = nextBlock.value;
    selectedCell.block = nextBlock.block;
    selectedCell.color = nextBlock.color;
    selectedCell.layer += 1;
  }

  move();
};
