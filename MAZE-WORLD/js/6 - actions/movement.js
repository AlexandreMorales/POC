import { MENU_CONFIG } from "../0 - configs/configs.js";
import { GRID_INFO } from "../2 - grid/infos.js";
import { PLAYER_ENTITY } from "../3 - entities/player.js";
import { BOAT_NAME } from "../3 - entities/boat.js";
import { DRAW_INFO } from "../5 - draw/infos.js";
import { drawEveryCell } from "../5 - draw/draw.js";

const MOVEMENT_CONFIG = {
  passHour: 0.5,
  midNightHour: 70,
  velocity: 25,
  touchThreshold: 25,
};

/**
 * @param {import("../0 - configs/infos.js").Cell} cell
 * @param {import("../3 - entities/infos.js").Entity} entity
 * @returns {boolean}
 */
export const cellIsBlocked = (cell, entity) =>
  !cell ||
  !cell.block ||
  !!cell.wall ||
  !!cell.entityName ||
  (entity.connectedEntities[BOAT_NAME]
    ? !cell.block.isFluid
    : cell.block.isFluid);

/**
 * @param {import("../0 - configs/infos.js").CellPos} pos
 * @returns {import("../0 - configs/infos.js").CellPos}
 */
const getCleanCellPos = (pos) => ({ i: pos?.i || 0, j: pos?.j || 0 });

/**
 * @param {import("../0 - configs/infos.js").Cell} oldCell
 * @param {import("../0 - configs/infos.js").Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  const oldPos = getCleanCellPos(oldCell?.pos);
  const nextPos = getCleanCellPos(nextCell?.pos);
  GRID_INFO.iOffset += nextPos.i - oldPos.i;
  GRID_INFO.jOffset += nextPos.j - oldPos.j;
  PLAYER_ENTITY.cell = nextCell;
};

let canMove = true;
/**
 * @param {import("../0 - configs/infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(PLAYER_ENTITY.cell, nextCell);
    if (MENU_CONFIG.passTime) passTime();

    setTimeout(() => {
      drawEveryCell(PLAYER_ENTITY.cell);
      canMove = true;
    }, 1000 / MOVEMENT_CONFIG.velocity);
  }
};

const passTime = () => {
  DRAW_INFO.timeOfDay += MOVEMENT_CONFIG.passHour;

  if (
    DRAW_INFO.timeOfDay >= MOVEMENT_CONFIG.midNightHour ||
    DRAW_INFO.timeOfDay <= 0
  ) {
    MOVEMENT_CONFIG.passHour = -MOVEMENT_CONFIG.passHour;
  }
};
