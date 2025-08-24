import { MENU_CONFIG, RENDER_INFO } from "../1 - polygones/index.js";
import {
  cellIsBlocked,
  killEntitiesByTimeOfDay,
  moveEntities,
  moveEntityToCell,
  PLAYER_ENTITY,
} from "../2 - entities/index.js";
import { loadAndGetCell, spawnEntities } from "../3 - generation/index.js";
import { drawEveryCell, passTime } from "../4 - draw/index.js";

const MOVEMENT_CONFIG = {
  velocity: 10,
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
  RENDER_INFO.iOffset += nextPos.i - oldPos.i;
  RENDER_INFO.jOffset += nextPos.j - oldPos.j;
  moveEntityToCell(PLAYER_ENTITY, nextCell);
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
      drawEveryCell(PLAYER_ENTITY);
      killEntitiesByTimeOfDay();
      moveEntities(PLAYER_ENTITY.cell);
      spawnEntities(PLAYER_ENTITY.cell);
      canMove = true;
    }, 1000 / MOVEMENT_CONFIG.velocity);
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
