import { MAP_CONFIG, MENU_CONFIG } from "../configs/configs.js";
import { drawEveryCell } from "../draw/draw.js";
import { BOAT_NAME } from "../entities/boat.js";
import { PLAYER_ENTITY } from "../entities/player.js";
import { MAP_INFO } from "../grid/infos.js";

/**
 * @param {import("../configs/infos.js").Cell} cell
 * @param {import("../entities/infos.js").Entity} entity
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
 * @param {import("../configs/infos.js").CellPos} pos
 * @returns {import("../configs/infos.js").CellPos}
 */
const getCleanCellPos = (pos) => ({ i: pos?.i || 0, j: pos?.j || 0 });

/**
 * @param {import("../configs/infos.js").Cell} oldCell
 * @param {import("../configs/infos.js").Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  const oldPos = getCleanCellPos(oldCell?.pos);
  const nextPos = getCleanCellPos(nextCell?.pos);
  MAP_INFO.iOffset += nextPos.i - oldPos.i;
  MAP_INFO.jOffset += nextPos.j - oldPos.j;
  PLAYER_ENTITY.cell = nextCell;
};

let canMove = true;
/**
 * @param {import("../configs/infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(PLAYER_ENTITY.cell, nextCell);
    if (MENU_CONFIG.passTime) passTime();

    setTimeout(() => {
      drawEveryCell(PLAYER_ENTITY.cell);
      canMove = true;
    }, 1000 / MAP_CONFIG.velocity);
  }
};

const passTime = () => {
  MAP_INFO.timeOfDay += MAP_CONFIG.passHour;

  if (
    MAP_INFO.timeOfDay >= MAP_CONFIG.midNightHour ||
    MAP_INFO.timeOfDay <= 0
  ) {
    MAP_CONFIG.passHour = -MAP_CONFIG.passHour;
  }
};
