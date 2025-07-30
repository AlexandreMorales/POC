import { KNOWN_POLYGONS_VALUES, MENU_CONFIG } from "../0 - configs/configs.js";
import { POLY_INFO } from "../0 - configs/infos.js";
import { getMod } from "../1 - utils/utils.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { getCell } from "../2 - grid/grid.js";
import { MOVEMENT } from "../3 - entities/infos.js";
import {
  getSelectedCell,
  PLAYER_ENTITY,
  startRunning,
  updatePlayerDirection,
} from "../3 - entities/player.js";
import { resetEntities } from "../3 - entities/entities.js";
import { addBoat, BOAT_NAME, toggleBoat } from "../3 - entities/boat.js";
import { getCenterCell } from "../4 - map/map.js";
import {
  resetCanvasSize,
  drawEveryCell,
  resetRotateCanvas,
  rotateCanvas,
} from "../5 - draw/draw.js";

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
    GRID_INFO.rotationTurns = PLAYER_ENTITY.selectedCellIndex = getMod(
      GRID_INFO.rotationTurns + orientation,
      GRID_INFO.currentPoly
    );

    if (MENU_CONFIG.rotationAnimation)
      rotateCanvas(
        (360 / GRID_INFO.currentPoly) * -orientation,
        ACTIONS_CONFIG.rotateDelay
      );

    resetDirection();

    setTimeout(() => {
      if (MENU_CONFIG.rotationAnimation) resetRotateCanvas();
      drawEveryCell(PLAYER_ENTITY.cell);
      canRotate = true;
    }, ACTIONS_CONFIG.rotateDelay);
  }
};

/**
 * @param {boolean} [useDiagonal]
 * @param {import("../0 - configs/infos.js").Cell} [cell]
 * @returns {{ [k: symbol]: number }}
 */
const getMovementMap = (useDiagonal, cell = PLAYER_ENTITY.cell) => {
  let topI = GRID_INFO.rotationTurns;
  let bottomI = topI + Math.floor(GRID_INFO.currentPoly / 2);

  let topLeftI = topI + GRID_INFO.currentPoly - 1;
  let topRightI = topI + 1;

  let bottomLeftI = bottomI + 1;
  let bottomRightI = bottomI - 1;

  if (POLY_INFO[GRID_INFO.currentPoly].hasInverted) {
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

  return getMod(aIndex, GRID_INFO.currentPoly);
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
  const nextPos = PLAYER_ENTITY.cell.adjacentPos[GRID_INFO.currentPoly][aModI];

  if (!nextPos) return;

  const nextCell = getCell(nextPos);

  if (cellIsBlocked(nextCell, PLAYER_ENTITY)) return;

  move(nextCell);
};

export const MOVEMENT_VALUES = Object.values(MOVEMENT);
export const stopMoving = () => {
  if (lastMovement) {
    if (POLY_INFO[GRID_INFO.currentPoly].hasInverted) {
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
  GRID_INFO.currentPoly =
    KNOWN_POLYGONS_VALUES[
      (KNOWN_POLYGONS_VALUES.indexOf(GRID_INFO.currentPoly) + 1) %
        KNOWN_POLYGONS_VALUES.length
    ];

  GRID_INFO.rotationTurns = 0;
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
 * @returns {import("../0 - configs/infos.js").Cell}
 */
const updateAndGetSelectedCell = () => {
  updatePlayerDirection(lastSelection);
  return getSelectedCell();
};

export const dig = () => {
  const selectedCell = updateAndGetSelectedCell();

  if (
    !selectedCell?.block ||
    selectedCell.block.isFluid ||
    !!selectedCell.entityName
  )
    return;

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
 * @param {import("../0 - configs/infos.js").Cell} cell
 * @param {import("../0 - configs/infos.js").Block} [block]
 * @param {import("../0 - configs/infos.js").Color} [color]
 */
export const placeBlock = (cell, block, color) => {
  if (!cell || !!cell.entityName) return;

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

  if (PLAYER_ENTITY.connectedEntities[BOAT_NAME]) {
    if (!selectedCell?.block?.isFluid && canMove) {
      toggleBoat(PLAYER_ENTITY);
      move(selectedCell);
    }
    return;
  }

  if (selectedCell.entityName?.includes(BOAT_NAME)) {
    toggleBoat(PLAYER_ENTITY);
    move(selectedCell);
  } else if (canMove) {
    addBoat(selectedCell, PLAYER_ENTITY);
  }
};
