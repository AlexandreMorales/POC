import { getCell } from "../0 - grid/index.js";
import {
  getPolyInfo,
  getPosByIndex,
  KNOWN_POLYGONS_VALUES,
  MENU_CONFIG,
  RENDER_INFO,
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
  resetCanvas,
  drawEveryCell,
  resetRotateCanvas,
  rotateCanvas,
  updateWeather,
  updateCompass,
  COMPASS_CONFIG,
  addBlockToPlace,
  startFishing,
  IS_FISHING_ACTIVE,
  toggleFullMap,
  moveFishing,
  resetPlace,
  getSelectedBlockToPlace,
} from "../4 - draw/index.js";
import { getMod } from "../_utils.js";

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
  if (!IS_FISHING_ACTIVE && canRotate) {
    canRotate = false;
    RENDER_INFO.rotationTurns = PLAYER_ENTITY.selectedCellIndex = getMod(
      RENDER_INFO.rotationTurns + orientation,
      RENDER_INFO.currentPoly
    );

    if (MENU_CONFIG.rotationAnimation) {
      rotateCanvas(
        (360 / RENDER_INFO.currentPoly) * -orientation,
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

  return getMod(aIndex, RENDER_INFO.currentPoly);
};

let lastMovement = /** @type {symbol} */ (null);
let lastSelection = /** @type {symbol} */ (null);
let blockMovement = false;

/**
 * @param {symbol} direction
 * @param {boolean} [useDiagonal]
 */
export const moveBaseOnCode = (direction, useDiagonal) => {
  if (!direction) return;

  if (IS_FISHING_ACTIVE) {
    moveFishing(direction, useDiagonal);
    blockMovement = true;
  }

  if (blockMovement) return;

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
  blockMovement = false;
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
  if (IS_FISHING_ACTIVE || !direction) return;

  lastSelection = direction;
  const aModI = getNextCellIndexBasedOnCode(direction, useDiagonal);
  if (aModI === undefined || aModI === PLAYER_ENTITY.selectedCellIndex) return;

  PLAYER_ENTITY.selectedCellIndex = aModI;

  if (MENU_CONFIG.showSelectedCell) drawEveryCell(PLAYER_ENTITY);
  updateEntityDirection(PLAYER_ENTITY, lastSelection);
};

/**
 * @returns {number}
 */
export const getNextPolygon = () =>
  KNOWN_POLYGONS_VALUES[
    (KNOWN_POLYGONS_VALUES.indexOf(RENDER_INFO.currentPoly) + 1) %
      KNOWN_POLYGONS_VALUES.length
  ];

export const changePolySides = () => {
  if (IS_FISHING_ACTIVE) return;

  RENDER_INFO.currentPoly = getNextPolygon();

  RENDER_INFO.rotationTurns = 0;
  PLAYER_ENTITY.selectedCellIndex = 0;

  updateCompass();
  resetDirection();
  resetMap();
};

export const resetDirection = () => {
  lastSelection = MOVEMENT.UP;
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
  if (IS_FISHING_ACTIVE) return;

  const selectedCell = updateAndGetSelectedCell();

  if (!selectedCell?.block) return;

  if (selectedCell.entityType) {
    removeEntitiesFromCell(selectedCell);
    return;
  }

  if (selectedCell.block.isFluid) return;

  const pickedBlock = { ...(selectedCell.wall || selectedCell) };
  addBlockToPlace(pickedBlock);

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
  if (IS_FISHING_ACTIVE) return;

  const selectedCell = updateAndGetSelectedCell();
  if (selectedCell?.wall || selectedCell.entityType) return;

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
    const cellBlock = getSelectedBlockToPlace();
    if (!cellBlock) return;

    block = cellBlock.block;
    color = cellBlock.color;
  }

  digAudio.play();

  if (cell.block && !cell.block.isFluid) {
    cell.wall = { block: block, color: color };
  } else {
    cell.block = block;
    cell.color = color;
  }
};

export const useBoat = () => {
  if (IS_FISHING_ACTIVE) return;

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

/**
 * @param {boolean} [toggle]
 */
export const useMap = (toggle) => {
  if (IS_FISHING_ACTIVE) return;
  toggleFullMap(toggle);
};

export const useFishingRod = () => {
  const selectedCell = updateAndGetSelectedCell();
  if (selectedCell?.block?.isFluid) startFishing();
};

// Called when zooming, creation, set PolySides
export const resetMap = () => {
  resetPlace();
  setEntitiesSize();
  resetCanvas();
  moveCurrentCell(getCenterCell(), PLAYER_ENTITY.cell);
  drawEveryCell(PLAYER_ENTITY);

  updateWeather();
};
