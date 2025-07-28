import { MAP_CONFIG, MENU_CONFIG } from "./configs/configs.js";
import { MAP_INFO } from "./configs/infos.js";
import { drawEveryCell } from "./draw/draw.js";

/**
 * @param {import("./configs/infos.js").Cell} cell
 * @returns {boolean}
 */
export const cellIsBlocked = (cell) =>
  !cell || !cell.value || !cell.block || cell.layer !== 0 || !!cell.wall;

/**
 * @param {import("./configs/infos.js").CellPos} pos
 * @returns {import("./configs/infos.js").CellPos}
 */
const getCleanCellPos = (pos) => ({ i: pos?.i || 0, j: pos?.j || 0 });

/**
 * @param {import("./configs/infos.js").Cell} oldCell
 * @param {import("./configs/infos.js").Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  const oldPos = getCleanCellPos(oldCell?.pos);
  const nextPos = getCleanCellPos(nextCell?.pos);
  MAP_INFO.iOffset += nextPos.i - oldPos.i;
  MAP_INFO.jOffset += nextPos.j - oldPos.j;
  MAP_INFO.currentCell = nextCell;
};

let canMove = true;
/**
 * @param {import("./configs/infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(MAP_INFO.currentCell, nextCell);
    if (MENU_CONFIG.passTime) passTime();

    setTimeout(() => {
      drawEveryCell();
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
