import { MENU_CONFIG, POLY_INFO } from "../1 - polygones/index.js";
import {
  cellIsBlocked,
  ENTITY_INFO,
  killEntitiesByTimeOfDay,
  moveEntities,
  PLAYER_ENTITY,
} from "../2 - entities/index.js";
import { loadAndGetCell, spawnEntities } from "../3 - generation/index.js";
import { drawEveryCell } from "../4 - draw/index.js";

const MOVEMENT_CONFIG = {
  passHour: 0.25,
  midNightHour: 70,
  velocity: 25,
};

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
      killEntitiesByTimeOfDay();
      moveEntities();
      spawnEntities(PLAYER_ENTITY.cell);
      canMove = true;
    }, 1000 / MOVEMENT_CONFIG.velocity);
  }
};

const passTime = () => {
  ENTITY_INFO.timeOfDay += MOVEMENT_CONFIG.passHour;

  if (
    ENTITY_INFO.timeOfDay >= MOVEMENT_CONFIG.midNightHour ||
    ENTITY_INFO.timeOfDay <= 0
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
