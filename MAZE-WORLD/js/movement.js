import { CONFIG, MAP_CONFIG } from "./configs.js";
import { MAP_INFO, POLY_INFO } from "./infos.js";
import { GRID } from "./grid.js";
import { drawEveryCell } from "./draw.js";

/**
 * @param {import("./infos.js").Cell} cell
 * @returns {boolean}
 */
export const cellIsBlocked = (cell) =>
  !cell || !!cell.wall || !cell.value || !cell.block || cell.block.isFluid;

/**
 * @param {import("./infos.js").Cell} oldCell
 * @param {import("./infos.js").Cell} nextCell
 */
export const moveCurrentCell = (oldCell, nextCell) => {
  MAP_INFO.iOffset += nextCell.pos.i - oldCell.pos.i;
  MAP_INFO.jOffset += nextCell.pos.j - oldCell.pos.j;
  MAP_INFO.currentCell = nextCell;
};

let canMove = true;
/**
 * @param {import("./infos.js").Cell} [nextCell]
 */
export const move = (nextCell) => {
  if (canMove) {
    canMove = false;
    if (nextCell) moveCurrentCell(MAP_INFO.currentCell, nextCell);
    if (MAP_CONFIG.passTime) passTime();

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

/**
 * @returns {import("./infos.js").Cell}
 */
export const getCenterCell = () => {
  const { rows, columns } = POLY_INFO[CONFIG.polySides];
  const middleRow = Math.floor(rows / 2);
  const middleColumn = Math.floor(columns / 2);

  return GRID[middleRow + MAP_INFO.iOffset][middleColumn + MAP_INFO.jOffset];
};
