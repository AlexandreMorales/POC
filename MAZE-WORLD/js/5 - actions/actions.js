import { getCell } from "../0 - grid/index.js";
import {
  getPolyInfo,
  KNOWN_POLYGONS_VALUES,
  MENU_CONFIG,
  POLY_INFO,
} from "../1 - polygones/index.js";
import {
  MOVEMENT,
  ENTITY_TYPES,
  getSelectedCell,
  PLAYER_ENTITY,
  startRunning,
  updatePlayerDirection,
  removeEntitiesFromCell,
  resetEntities,
  addBoat,
  toggleBoat,
} from "../2 - entities/index.js";
import { getCenterCell } from "../3 - generation/index.js";
import {
  resetCanvasSize,
  drawEveryCell,
  resetRotateCanvas,
  rotateCanvas,
} from "../4 - draw/index.js";
import { getMod } from "../utils.js";

import { cellIsBlocked, move, moveCurrentCell } from "./movement.js";

const ACTIONS_CONFIG = {
  rotateDelay: 500,
};

let canRotate = true;
/**
 * @param {number} orientation
 */
export const rotate = (orientation) => {
  if (canRotate) {
    canRotate = false;
    POLY_INFO.rotationTurns = PLAYER_ENTITY.selectedCellIndex = getMod(
      POLY_INFO.rotationTurns + orientation,
      POLY_INFO.currentPoly
    );
    const useAnimation =
      MENU_CONFIG.rotationAnimation || MENU_CONFIG.rotationAnimationWithZoom;

    if (useAnimation)
      rotateCanvas(
        (360 / POLY_INFO.currentPoly) * -orientation,
        ACTIONS_CONFIG.rotateDelay
      );

    resetDirection();

    setTimeout(() => {
      if (useAnimation) resetRotateCanvas();
      drawEveryCell(PLAYER_ENTITY.cell);
      canRotate = true;
    }, ACTIONS_CONFIG.rotateDelay);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @param {Cell} [cell]
 * @returns {{ [k: symbol]: number }}
 */
const getMovementMap = (useDiagonal, cell = PLAYER_ENTITY.cell) => {
  let topI = POLY_INFO.rotationTurns;
  let bottomI = topI + Math.floor(POLY_INFO.currentPoly / 2);

  let topLeftI = topI + POLY_INFO.currentPoly - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (getPolyInfo().hasInverted) {
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

  return getMod(aIndex, POLY_INFO.currentPoly);
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
  const nextPos = PLAYER_ENTITY.cell.adjacentPos[POLY_INFO.currentPoly][aModI];

  if (!nextPos) return;

  const nextCell = getCell(nextPos);

  if (cellIsBlocked(nextCell, PLAYER_ENTITY)) return;

  move(nextCell);
};

export const MOVEMENT_VALUES = Object.values(MOVEMENT);
export const stopMoving = () => {
  if (lastMovement) {
    if (getPolyInfo().hasInverted) {
      const movementMap = getMovementMap();

      for (const movement of MOVEMENT_VALUES) {
        if (movementMap[movement] === PLAYER_ENTITY.selectedCellIndex) {
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
  if (aModI === undefined || aModI === PLAYER_ENTITY.selectedCellIndex) return;

  PLAYER_ENTITY.selectedCellIndex = aModI;

  if (MENU_CONFIG.showSelectedCell) drawEveryCell(PLAYER_ENTITY.cell);
  updatePlayerDirection(lastSelection);
};

export const changePolySides = () => {
  POLY_INFO.currentPoly =
    KNOWN_POLYGONS_VALUES[
      (KNOWN_POLYGONS_VALUES.indexOf(POLY_INFO.currentPoly) + 1) %
        KNOWN_POLYGONS_VALUES.length
    ];

  POLY_INFO.rotationTurns = 0;
  PLAYER_ENTITY.selectedCellIndex = 0;

  resetDirection();
  resetEntities();
  resetCanvasSize();
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY.cell);
};

export const resetDirection = () => {
  lastMovement = lastSelection = MOVEMENT.UP;
  updatePlayerDirection(lastSelection);
};

/**
 * @returns {Cell}
 */
const updateAndGetSelectedCell = () => {
  updatePlayerDirection(lastSelection);
  return getSelectedCell();
};

export const dig = () => {
  const selectedCell = updateAndGetSelectedCell();

  if (!selectedCell?.block) return;

  if (selectedCell.entityType) {
    removeEntitiesFromCell(selectedCell);
    return;
  }

  if (selectedCell.block.isFluid) return;

  PLAYER_ENTITY.pickedCells.push({ ...(selectedCell.wall || selectedCell) });

  if (selectedCell.wall) {
    selectedCell.wall = null;
  } else {
    selectedCell.block = null;
    selectedCell.color = null;
  }

  move();
};

export const place = () => {
  if (!PLAYER_ENTITY.pickedCells.length) return;

  const selectedCell = updateAndGetSelectedCell();
  if (selectedCell?.wall) return;
  placeBlock(selectedCell);

  move();
};

/**
 * @param {Cell} cell
 * @param {Block} [block]
 * @param {Color} [color]
 */
export const placeBlock = (cell, block, color) => {
  if (!cell || !!cell.entityType) return;

  if (!block) {
    const cellBlock = PLAYER_ENTITY.pickedCells.pop();
    block = cellBlock.block;
    color = cellBlock.color;
  }

  if (cell.block && !cell.block.isFluid) {
    cell.wall = { block: block, color: color };
  } else {
    cell.block = block;
    cell.color = color;
  }
};

export const useBoat = () => {
  const selectedCell = updateAndGetSelectedCell();
  const canMove = !selectedCell.wall && selectedCell.block;

  if (PLAYER_ENTITY.connectedEntities[ENTITY_TYPES.BOAT]) {
    if (!selectedCell?.block?.isFluid && canMove) {
      toggleBoat(PLAYER_ENTITY);
      move(selectedCell);
    }
    return;
  }

  if (selectedCell.entityType === ENTITY_TYPES.BOAT) {
    toggleBoat(PLAYER_ENTITY);
    move(selectedCell);
  } else if (canMove) {
    addBoat(selectedCell, PLAYER_ENTITY);
  }
};
