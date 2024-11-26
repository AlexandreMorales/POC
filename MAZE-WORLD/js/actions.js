import { CONFIG } from "./configs.js";
import { GRID, addWall } from "./grid.js";
import { MAP_INFO } from "./infos.js";
import { move } from "./movement.js";
import { getMod } from "./utils.js";

export const dig = () => {
  const aIndex = getMod(MAP_INFO.rotationTurns, CONFIG.polySides);

  const nextPos =
    MAP_INFO.currentCell.adjacentIndexes[CONFIG.polySides][aIndex];

  if (!nextPos) return;

  const nextCell = GRID[nextPos[0]]?.[nextPos[1]];

  if (!nextCell || !nextCell.value || !nextCell.block || nextCell.block.isFluid)
    return;

  MAP_INFO.pickedCells.push({ ...(nextCell.wall || nextCell) });

  if (nextCell.wall) {
    addWall(nextCell, null);
  } else {
    nextCell.value = null;
    nextCell.block = null;
    nextCell.color = null;
  }

  move();
};

export const place = () => {
  if (!MAP_INFO.pickedCells.length) return;

  const aIndex = getMod(MAP_INFO.rotationTurns, CONFIG.polySides);

  const nextPos =
    MAP_INFO.currentCell.adjacentIndexes[CONFIG.polySides][aIndex];

  if (!nextPos) return;

  const nextCell = GRID[nextPos[0]]?.[nextPos[1]];

  if (!nextCell || nextCell.wall) return;

  const nextBlock = MAP_INFO.pickedCells.pop();

  if (nextCell.value && nextCell.block && !nextCell.block.isFluid) {
    addWall(nextCell, nextBlock);
  } else {
    nextCell.value = nextBlock.value;
    nextCell.block = nextBlock.block;
    nextCell.color = nextBlock.color;
  }

  move();
};
