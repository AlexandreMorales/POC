import { getCell } from "../0 - grid/index.js";
import {
  getPolyInfo,
  getPosByIndex,
  KNOWN_POLYGONS_VALUES,
  MENU_CONFIG,
  POLY_INFO,
  POLYGONS_FAVICONS,
} from "../1 - polygones/index.js";
import {
  MOVEMENT,
  ENTITY_TYPES,
  getSelectedCell,
  PLAYER_ENTITY,
  makeEntityRun,
  updateEntityDirection,
  removeEntitiesFromCell,
  setEntitiesSize,
  addBoat,
  cellIsBlocked,
  getOutBoat,
  getInBoat,
  getMovementMap,
} from "../2 - entities/index.js";
import { getCenterCell } from "../3 - generation/index.js";
import {
  resetCanvasSize,
  drawEveryCell,
  resetRotateCanvas,
  rotateCanvas,
  updateWeather,
  updateCompass,
  COMPASS_CONFIG,
} from "../4 - draw/index.js";
import { getMod } from "../utils.js";

import { move, moveCurrentCell } from "./movement.js";

const digAudio = new Audio("sounds/actions/dig.mp3");
digAudio.volume = 0.25;
const rotateAudio = new Audio("sounds/actions/rotate.mp3");
rotateAudio.volume = 0.25;

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

    if (MENU_CONFIG.rotationAnimation) {
      rotateCanvas(
        (360 / POLY_INFO.currentPoly) * -orientation,
        COMPASS_CONFIG.rotateDelay
      );
      rotateAudio.play();
    }

    updateCompass();
    resetDirection();

    setTimeout(() => {
      if (MENU_CONFIG.rotationAnimation) resetRotateCanvas();
      drawEveryCell(PLAYER_ENTITY);
      canRotate = true;
    }, COMPASS_CONFIG.rotateDelay);
  }
};

/**
 * @param {symbol} code
 * @param {boolean} [useDiagonal]
 * @returns {number}
 */
const getNextCellIndexBasedOnCode = (code, useDiagonal) => {
  const aIndex = getMovementMap(PLAYER_ENTITY.cell, useDiagonal)[code];

  if (aIndex === undefined) return;

  return getMod(aIndex, POLY_INFO.currentPoly);
};

let lastMovement = /** @type {symbol} */ (null);
let lastSelection = /** @type {symbol} */ (null);

/**
 * @param {symbol} direction
 * @param {boolean} [useDiagonal]
 */
export const moveBaseOnCode = (direction, useDiagonal) => {
  if (!direction) return;

  if (lastMovement !== direction) {
    lastMovement = direction;
    makeEntityRun(PLAYER_ENTITY, lastMovement);
  }

  const aModI = getNextCellIndexBasedOnCode(direction, useDiagonal);
  if (aModI === undefined) return;
  const nextPos = getPosByIndex(PLAYER_ENTITY.cell, aModI);

  if (!nextPos) return;

  const nextCell = getCell(nextPos);

  if (cellIsBlocked(nextCell, PLAYER_ENTITY)) return;

  move(nextCell);
  updateWeather(direction);
};

export const MOVEMENT_VALUES = Object.values(MOVEMENT);
export const stopMoving = () => {
  if (lastMovement) {
    if (getPolyInfo().hasInverted) {
      const movementMap = getMovementMap(PLAYER_ENTITY.cell);

      for (const movement of MOVEMENT_VALUES) {
        if (movementMap[movement] === PLAYER_ENTITY.selectedCellIndex) {
          lastSelection = movement;
          break;
        }
      }
    }
    updateEntityDirection(PLAYER_ENTITY, lastSelection);
    lastMovement = null;
  }
};

/**
 * @param {symbol} direction
 * @param {boolean} [useDiagonal]
 */
export const changeSelectedOnCode = (direction, useDiagonal) => {
  if (!direction) return;

  lastSelection = direction;
  const aModI = getNextCellIndexBasedOnCode(direction, useDiagonal);
  if (aModI === undefined || aModI === PLAYER_ENTITY.selectedCellIndex) return;

  PLAYER_ENTITY.selectedCellIndex = aModI;

  if (MENU_CONFIG.showSelectedCell) drawEveryCell(PLAYER_ENTITY);
  updateEntityDirection(PLAYER_ENTITY, lastSelection);
};

export const changePolySides = () => {
  POLY_INFO.currentPoly =
    KNOWN_POLYGONS_VALUES[
      (KNOWN_POLYGONS_VALUES.indexOf(POLY_INFO.currentPoly) + 1) %
        KNOWN_POLYGONS_VALUES.length
    ];

  POLY_INFO.rotationTurns = 0;
  PLAYER_ENTITY.selectedCellIndex = 0;

  updateCompass();
  resetDirection();
  resetMap();
};

export const resetDirection = () => {
  lastMovement = lastSelection = MOVEMENT.UP;
  updateEntityDirection(PLAYER_ENTITY, lastSelection);
};

/**
 * @returns {Cell}
 */
const updateAndGetSelectedCell = () => {
  updateEntityDirection(PLAYER_ENTITY, lastSelection);
  return getSelectedCell(PLAYER_ENTITY);
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

  digAudio.play();
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

  digAudio.play();
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
      getOutBoat(PLAYER_ENTITY);
      move(selectedCell);
    }
    return;
  }

  if (selectedCell.entityType === ENTITY_TYPES.BOAT) {
    getInBoat(PLAYER_ENTITY);
    move(selectedCell);
  } else if (canMove) {
    addBoat(selectedCell, PLAYER_ENTITY);
  }
};

const link = /** @type {HTMLLinkElement} */ (
  document.querySelector("link[rel~='icon']")
);
// Called when zooming, creation, set PolySides
export const resetMap = () => {
  setEntitiesSize();
  resetCanvasSize();
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY);

  link.href = POLYGONS_FAVICONS[POLY_INFO.currentPoly];

  updateWeather(lastMovement);
};
