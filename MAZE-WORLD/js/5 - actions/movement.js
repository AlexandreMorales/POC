import { MENU_CONFIG, POLY_INFO } from "../1 - polygones/index.js";
import { ENTITY_TYPES, PLAYER_ENTITY } from "../2 - entities/index.js";
import {
  loadAndGetCell,
  MAP_INFO,
  spawnEntities,
} from "../3 - generation/index.js";
import { drawEveryCell } from "../4 - draw/index.js";

const MOVEMENT_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 25,
  touchThreshold: 25,
};

/**
 * @param {Cell} cell
 * @param {Entity} entity
 * @returns {boolean}
 */
export const cellIsBlocked = (cell, entity) =>
  !cell ||
  !cell.block ||
  !!cell.wall ||
  !!cell.entityType ||
  (entity.connectedEntities[ENTITY_TYPES.BOAT]
    ? !cell.block.isFluid
    : cell.block.isFluid);

/**
 * @param {Pos} pos
 * @returns {Pos}
 */
const getCleanPos = (pos) => ({ i: pos?.i || 0, j: pos?.j || 0 });

/**
 * @param {Cell} oldCell
 * @param {Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  const oldPos = getCleanPos(oldCell?.pos);
  const nextPos = getCleanPos(nextCell?.pos);
  POLY_INFO.iOffset += nextPos.i - oldPos.i;
  POLY_INFO.jOffset += nextPos.j - oldPos.j;
  PLAYER_ENTITY.cell = nextCell;
};

let canMove = true;
/**
 * @param {Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(PLAYER_ENTITY.cell, nextCell);
    if (MENU_CONFIG.passTime) passTime();

    setTimeout(() => {
      drawEveryCell(PLAYER_ENTITY.cell);
      // moveEntities
      spawnEntities();
      canMove = true;
    }, 1000 / MOVEMENT_CONFIG.velocity);
  }
};

const passTime = () => {
  MAP_INFO.timeOfDay += MOVEMENT_CONFIG.passHour;

  if (
    MAP_INFO.timeOfDay >= MOVEMENT_CONFIG.midNightHour ||
    MAP_INFO.timeOfDay <= 0
  ) {
    MOVEMENT_CONFIG.passHour = -MOVEMENT_CONFIG.passHour;
  }
};

/**
 * @param {Cell} cell
 * @param {Entity} entity
 * @returns {Cell}
 */
export const findAccessibleCell = (cell, entity) => {
  let accessibleCell = cell;
  while (cellIsBlocked(accessibleCell, entity)) {
    accessibleCell = loadAndGetCell({
      i: accessibleCell.pos.i + 1,
      j: accessibleCell.pos.j,
    });
  }
  return accessibleCell;
};
